"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { usePrivyTxOverride } from "@/components/PrivyWalletBridge";
import { PRIVY_WALLET_NAME } from "@/lib/privy-embedded-adapter";
import { withOneStaleBlockhashRetry } from "@/lib/privy-blockhash";
import {
  leaveManualBuy,
  noteUnconfirmedRunIndex,
  recoverRunCollision,
  tryEnterManualBuy,
} from "@/lib/manual-buy-guard";
import { refreshWriteStillCurrent } from "@/lib/predca-refresh";
import {
  CONFIRMED_VAULT_BACKGROUND_POLL_MS,
  CONFIRMED_VAULT_LAG_MSG,
  CONFIRM_STILL_PENDING_MSG,
  POST_CONFIRM_VAULT_POLL_MS,
  UNRESOLVED_WATCH_MS,
  UNRESOLVED_WATCH_POLL_MS,
  isOnChainSignatureReject,
  isUnconfirmedTimeout,
  outcomeAfterVaultCheck,
  clearDropsPending,
  pendingTxMessage,
  rejectedTxMessage,
  unresolvedSignatureBlocksTx,
} from "@/lib/vault-follow-up";
import { Transaction, type PublicKey } from "@solana/web3.js";
import type { Holding } from "@/lib/mock-data";
import {
  allMockMints,
  holdingColor,
  nameByMint,
  resolveTop3Mints,
} from "@/lib/devnet-mock-mints";
import {
  BN,
  MOCK_USDC_MINT,
  dollarsToRaw,
  ensureOwnerAtas,
  fetchMockTokenBalances,
  fetchOwnerUsdcBalance,
  fetchRunRecords,
  fetchSolBalance,
  fetchUserConfig,
  explorerTxUrl,
  fetchVaultBalance,
  findNextRunIndex,
  formatTs,
  getProgram,
  isRunAlreadyExists,
  ownerUsdcAta,
  parseAnchorError,
  rawToDollars,
  RUN_INDEX_TAKEN_MSG,
  usdcMintOrNull,
  type MockTokenBalance,
  type RunRecordData,
  type UserConfigData,
} from "@/lib/predca";

export type PredcaStatus =
  | "disconnected"
  | "loading"
  | "no_config"
  | "ready"
  | "no_mint"
  | "error";

export type OnChainLastPurchase = {
  date: string;
  amountUsd: number;
  tokens: string[];
  perTokenUsd: number;
  runIndex: number;
  ts: number;
};

function mintHint(): string {
  return usdcMintOrNull()?.toBase58() ?? MOCK_USDC_MINT;
}

function balancesToHoldings(tokens: MockTokenBalance[]): Holding[] {
  const nonzero = tokens.filter((t) => t.amount > 0);
  if (nonzero.length === 0) return [];
  const total = nonzero.reduce((s, t) => s + t.amount, 0);
  if (total <= 0) return [];

  const out: Holding[] = nonzero.map((t, i) => ({
    name: t.name,
    value: Math.round((t.amount / total) * 1000) / 10,
    color: holdingColor(t.name, i),
  }));

  const sum = out.reduce((s, h) => s + h.value, 0);
  const rem = Math.round((100 - sum) * 10) / 10;
  if (rem !== 0 && out.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < out.length; i++) {
      if (out[i].value > out[maxIdx].value) maxIdx = i;
    }
    out[maxIdx] = {
      ...out[maxIdx],
      value: Math.round((out[maxIdx].value + rem) * 10) / 10,
    };
  }
  return out;
}

function runToLastPurchase(run: RunRecordData): OnChainLastPurchase {
  const amounts = run.amounts.map((a) => rawToDollars(a));
  const amountUsd = amounts.reduce((s, a) => s + a, 0);
  const tokens = run.mints.map((m, i) => {
    const named = nameByMint(m);
    if (named) return named;
    const s = typeof m === "string" ? m : m.toBase58();
    return s.length > 10 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
  });
  const ts =
    typeof run.ts === "object" && run.ts !== null && "toNumber" in run.ts
      ? (run.ts as BN).toNumber()
      : Number(run.ts);
  const runIndex =
    typeof run.runIndex === "object" &&
    run.runIndex !== null &&
    "toNumber" in run.runIndex
      ? (run.runIndex as BN).toNumber()
      : Number(run.runIndex ?? 0);
  return {
    date: formatTs(run.ts),
    amountUsd,
    tokens,
    perTokenUsd: tokens.length > 0 ? amountUsd / tokens.length : 0,
    runIndex,
    ts,
  };
}

function privySendNotReady(): Promise<string> {
  return Promise.reject(
    new Error(
      "Portfel Privy jest wybrany, ale podpis jeszcze nie jest gotowy. Spróbuj ponownie.",
    ),
  );
}

function usePredcaImpl() {
  const { connection } = useConnection();
  const adapterWallet = useAnchorWallet();
  const { sendTransaction: adapterSend, wallet: selectedWallet } = useWallet();
  const privyTx = usePrivyTxOverride();
  const isPrivy = selectedWallet?.adapter.name === PRIVY_WALLET_NAME;
  // Privy's Wallet Standard signTransaction defaults to mainnet when chain is
  // omitted. The bridge passes solana:devnet. Do not fall through to the adapter.
  const wallet = isPrivy ? (privyTx?.anchorWallet ?? null) : adapterWallet;
  const sendTransaction = isPrivy
    ? (privyTx?.sendTransaction ?? privySendNotReady)
    : adapterSend;
  const mint = useMemo(() => usdcMintOrNull(), []);

  const [config, setConfig] = useState<UserConfigData | null>(null);
  const [vaultUsdc, setVaultUsdc] = useState<number | null>(null);
  const [ownerUsdc, setOwnerUsdc] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<MockTokenBalance[]>([]);
  const [runs, setRuns] = useState<RunRecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  /** Closes the gap before withTx sets txPending. A second simulateBuy returns immediately. */
  const buyLockRef = useRef(false);
  /** Run indices this card created. A collision on one of these is not retried. */
  const createdRunIndicesRef = useRef(new Set<number>());
  /** Signature broadcast, not yet confirmed or rejected. Keeps Deposit/Kup disabled. */
  const pendingSigRef = useRef<string | null>(null);
  const [pendingSignature, setPendingSignatureState] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const watchingSigRef = useRef<string | null>(null);
  const ownerRef = useRef<PublicKey | null>(null);
  /** Previous wallet. Undefined until the first effect, so mount does not clear. */
  const seenOwnerKey = useRef<string | null | undefined>(undefined);
  function setPending(signature: string | null) {
    pendingSigRef.current = signature;
    setPendingSignatureState(signature);
    setPendingMsg(
      signature ? pendingTxMessage(signature, explorerTxUrl(signature)) : null,
    );
  }
  const [error, setError] = useState<string | null>(null);
  /** Sync last tx error (React state lags one render after await). */
  const lastErrorRef = useRef<string | null>(null);
  /** Bumps on wallet change so an in-flight refresh cannot write the previous owner. */
  const dataEpoch = useRef(0);
  /** Bumps when a new tx starts, and again on wallet change, so a late vault follow cannot toast. */
  const vaultFollowEpoch = useRef(0);
  function reportError(msg: string | null) {
    lastErrorRef.current = msg;
    setError(msg);
  }
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(
    () => (provider ? getProgram(provider) : null),
    [provider],
  );

  const owner = wallet?.publicKey ?? null;
  ownerRef.current = owner;
  const ownerKey = owner?.toBase58() ?? null;

  useEffect(() => {
    const prev = seenOwnerKey.current;
    seenOwnerKey.current = ownerKey;
    // First mount must not drop the initial refresh. A later pubkey change does.
    if (prev === undefined || prev === ownerKey) return;
    dataEpoch.current += 1;
    vaultFollowEpoch.current += 1;
    setPending(null);
    setOkMsg(null);
    reportError(null);
    setConfig(null);
    setVaultUsdc(null);
    setOwnerUsdc(null);
    setSolBalance(null);
    setTokenBalances([]);
    setRuns([]);
  }, [ownerKey]);

  const refresh = useCallback(async () => {
    const epochAtStart = dataEpoch.current;
    const ownerAtStart = owner?.toBase58() ?? null;
    const still = () =>
      refreshWriteStillCurrent(
        epochAtStart,
        ownerAtStart,
        dataEpoch.current,
        ownerRef.current?.toBase58() ?? null,
      );
    if (!still()) return;
    reportError(null);
    if (!owner) {
      if (!still()) return;
      setConfig(null);
      setVaultUsdc(null);
      setOwnerUsdc(null);
      setSolBalance(null);
      setTokenBalances([]);
      setRuns([]);
      return;
    }
    if (!still()) return;
    setLoading(true);
    try {
      const solPromise = fetchSolBalance(connection, owner);
      const ownerBalPromise = mint
        ? fetchOwnerUsdcBalance(connection, owner, mint)
        : Promise.resolve(null);
      const tokensPromise = fetchMockTokenBalances(
        connection,
        owner,
        allMockMints(),
      );

      if (!program) {
        const [sol, ownerBal, tokens] = await Promise.all([
          solPromise,
          ownerBalPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setSolBalance(sol);
        setOwnerUsdc(ownerBal);
        setTokenBalances(tokens);
        setConfig(null);
        setVaultUsdc(null);
        setRuns([]);
        return;
      }

      const cfg = await fetchUserConfig(program, owner);
      if (!still()) return;
      setConfig(cfg);

      if (cfg) {
        const [bal, records, ownerBal, sol, tokens] = await Promise.all([
          fetchVaultBalance(connection, owner),
          fetchRunRecords(program, owner),
          ownerBalPromise,
          solPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setVaultUsdc(bal);
        setRuns(records);
        setOwnerUsdc(ownerBal);
        setSolBalance(sol);
        setTokenBalances(tokens);
      } else {
        const [ownerBal, sol, tokens] = await Promise.all([
          ownerBalPromise,
          solPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setVaultUsdc(null);
        setRuns([]);
        setOwnerUsdc(ownerBal);
        setSolBalance(sol);
        setTokenBalances(tokens);
      }
    } catch (e) {
      if (!still()) return;
      reportError(parseAnchorError(e));
    } finally {
      if (!still()) return;
      setLoading(false);
    }
  }, [program, owner, connection, mint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const status: PredcaStatus = !owner
    ? "disconnected"
    : !mint
      ? "no_mint"
      : loading && !config
        ? "loading"
        : error && !config
          ? "error"
          : !config
            ? "no_config"
            : "ready";

  const weeklyBudgetUsd = config
    ? rawToDollars(config.weeklyBudgetUsdc)
    : null;

  const lastRun = runs.length > 0 ? runs[runs.length - 1] : null;

  const holdingsOnChain = useMemo(
    () => balancesToHoldings(tokenBalances),
    [tokenBalances],
  );

  /**
   * Devnet mock valuation: 1 PreStock token unit (raw/1e6) = $1 USD proxy.
   * Wartość portfela PreStock = vault USDC + suma wartości akcji (tokeny).
   * USDC w portfelu (ATA) nie wchodzi — to cash poza DCA.
   */
  const portfolioUsd = useMemo(() => {
    if (!owner) return null;
    const vault = vaultUsdc ?? 0;
    const tokens = tokenBalances.reduce((s, t) => s + t.amount, 0);
    return vault + tokens;
  }, [owner, vaultUsdc, tokenBalances]);

  const lastPurchaseOnChain = useMemo(
    () => (lastRun ? runToLastPurchase(lastRun) : null),
    [lastRun],
  );

  async function confirmLanded(signature: string): Promise<void> {
    const started = Date.now();
    while (Date.now() - started < 45_000) {
      const { value } = await connection.getSignatureStatuses([signature]);
      const row = value[0];
      if (row?.err) {
        throw new Error(rejectedTxMessage(signature, explorerTxUrl(signature)));
      }
      if (
        row?.confirmationStatus === "confirmed" ||
        row?.confirmationStatus === "finalized"
      ) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    throw new Error(CONFIRM_STILL_PENDING_MSG);
  }

  async function pollVaultAbove(before: number, budgetMs: number): Promise<boolean> {
    if (!owner) return false;
    const started = Date.now();
    while (Date.now() - started < budgetMs) {
      const vaultAfter = (await fetchVaultBalance(connection, owner)) ?? 0;
      if (vaultAfter > before + 1e-6) return true;
      const left = budgetMs - (Date.now() - started);
      if (left <= 0) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(800, left)));
    }
    return false;
  }

  async function watchVaultCatchUp(
    epoch: number,
    before: number,
    success: string,
  ): Promise<void> {
    const started = Date.now();
    while (Date.now() - started < CONFIRMED_VAULT_BACKGROUND_POLL_MS) {
      if (vaultFollowEpoch.current !== epoch || !owner) return;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (vaultFollowEpoch.current !== epoch || !owner) return;
      try {
        const vaultAfter = (await fetchVaultBalance(connection, owner)) ?? 0;
        if (!(vaultAfter > before + 1e-6)) continue;
        if (vaultFollowEpoch.current !== epoch) return;
        await refresh();
        if (vaultFollowEpoch.current === epoch) {
          reportError(null);
          setOkMsg(success);
        }
        return;
      } catch {
        /* Public RPC can still be behind the confirmed signature. */
      }
    }
  }

  /** Same vault read as a confirmed deposit (fix B). Empty signature keeps the short poll. */
  async function applyConfirmedVault(
    epoch: number,
    signature: string,
    before: number,
    success: string,
  ): Promise<"error" | "ok"> {
    const increased = await pollVaultAbove(
      before,
      signature ? POST_CONFIRM_VAULT_POLL_MS : 12_000,
    );
    const outcome = outcomeAfterVaultCheck({
      confirmed: signature.length > 0,
      increased,
      success,
    });
    if (outcome.error) {
      await refresh();
      if (vaultFollowEpoch.current === epoch) reportError(outcome.error);
      return "error";
    }
    const note =
      !increased && signature
        ? `${CONFIRMED_VAULT_LAG_MSG} ${explorerTxUrl(signature)}`
        : outcome.ok;
    await refresh();
    if (vaultFollowEpoch.current !== epoch) return "ok";
    reportError(null);
    setOkMsg(note);
    if (!increased && signature) {
      void watchVaultCatchUp(epoch, before, success);
    }
    return "ok";
  }

  /**
   * Poll a still-unknown signature for about 60s. On confirm or on-chain
   * reject, clear the amber note. When the budget ends, leave the note.
   */
  function watchUnresolved(follow: {
    epoch: number;
    signature: string;
    success: string;
    requireVaultIncrease: boolean;
    vaultBefore: number | null;
  }) {
    if (watchingSigRef.current === follow.signature) return;
    watchingSigRef.current = follow.signature;
    void (async () => {
      const started = Date.now();
      try {
        while (pendingSigRef.current === follow.signature) {
          const elapsed = Date.now() - started;
          if (elapsed >= UNRESOLVED_WATCH_MS) return;
          const wait = Math.min(
            UNRESOLVED_WATCH_POLL_MS,
            UNRESOLVED_WATCH_MS - elapsed,
          );
          await new Promise((resolve) => setTimeout(resolve, wait));
          if (pendingSigRef.current !== follow.signature) return;
          if (Date.now() - started >= UNRESOLVED_WATCH_MS) return;
          if (!ownerRef.current) {
            setPending(null);
            return;
          }
          let row: Awaited<
            ReturnType<typeof connection.getSignatureStatuses>
          >["value"][number] = null;
          try {
            const { value } = await connection.getSignatureStatuses([
              follow.signature,
            ]);
            row = value[0];
          } catch {
            continue;
          }
          if (row?.err) {
            if (pendingSigRef.current !== follow.signature) return;
            setPending(null);
            if (vaultFollowEpoch.current !== follow.epoch) return;
            setOkMsg(null);
            reportError(
              rejectedTxMessage(follow.signature, explorerTxUrl(follow.signature)),
            );
            return;
          }
          if (
            row?.confirmationStatus === "confirmed" ||
            row?.confirmationStatus === "finalized"
          ) {
            if (pendingSigRef.current !== follow.signature) return;
            setPending(null);
            if (vaultFollowEpoch.current !== follow.epoch) return;
            if (follow.requireVaultIncrease && ownerRef.current) {
              await applyConfirmedVault(
                follow.epoch,
                follow.signature,
                follow.vaultBefore ?? 0,
                follow.success,
              );
              return;
            }
            await refresh();
            if (vaultFollowEpoch.current !== follow.epoch) return;
            reportError(null);
            setOkMsg(follow.success);
            return;
          }
        }
      } finally {
        if (watchingSigRef.current === follow.signature) {
          watchingSigRef.current = null;
        }
      }
    })();
  }

  async function withTx<T>(
    fn: () => Promise<T>,
    success: string,
    opts?: { requireVaultIncrease?: boolean },
  ): Promise<T | null> {
    // A second entry would drop the watcher and send another fee-payer tx.
    if (unresolvedSignatureBlocksTx(pendingSigRef.current)) return null;
    const epoch = ++vaultFollowEpoch.current;
    reportError(null);
    setOkMsg(null);
    setPending(null);
    setTxPending(true);
    const vaultBefore =
      opts?.requireVaultIncrease && owner
        ? ((await fetchVaultBalance(connection, owner)) ?? 0)
        : null;
    try {
      const result = await fn();
      if (opts?.requireVaultIncrease && owner) {
        const signature =
          typeof result === "string" && result.length > 0 ? result : "";
        if (signature) await confirmLanded(signature);
        // A confirmed tx can still read the old vault from another replica.
        const settled = await applyConfirmedVault(
          epoch,
          signature,
          vaultBefore ?? 0,
          success,
        );
        return settled === "error" ? null : result;
      }
      setOkMsg(success);
      await refresh();
      return result;
    } catch (e) {
      if (isOnChainSignatureReject(e)) {
        setPending(null);
        if (vaultFollowEpoch.current === epoch) {
          setOkMsg(null);
          reportError(
            e instanceof Error
              ? e.message
              : "Transakcja odrzucona przez Devnet.",
          );
        }
        return null;
      }
      const pending = isUnconfirmedTimeout(e);
      if (!pending) {
        reportError(parseAnchorError(e));
        return null;
      }
      const signature = pending.signature;
      setPending(signature);
      if (vaultFollowEpoch.current === epoch) {
        reportError(null);
        setOkMsg(null);
      }
      try {
        await confirmLanded(signature);
      } catch (confirmErr) {
        if (isOnChainSignatureReject(confirmErr)) {
          setPending(null);
          if (vaultFollowEpoch.current === epoch) {
            setOkMsg(null);
            reportError(
              confirmErr instanceof Error
                ? confirmErr.message
                : rejectedTxMessage(signature, explorerTxUrl(signature)),
            );
          }
          return null;
        }
        // Still unknown. Amber note stays; the watcher stops after its budget.
        watchUnresolved({
          epoch,
          signature,
          success,
          requireVaultIncrease: Boolean(opts?.requireVaultIncrease && owner),
          vaultBefore,
        });
        return null;
      }
      setPending(null);
      if (opts?.requireVaultIncrease && owner) {
        const settled = await applyConfirmedVault(
          epoch,
          signature,
          vaultBefore ?? 0,
          success,
        );
        return settled === "error" ? null : (signature as T);
      }
      await refresh();
      if (vaultFollowEpoch.current !== epoch) return signature as T;
      reportError(null);
      setOkMsg(success);
      return signature as T;
    } finally {
      setTxPending(false);
    }
  }

  /**
   * Deposit USDC into vault.
   * If UserConfig is missing: initialize_user + deposit_usdc in one transaction
   * (weeklyBudgetUsdForInit required / used as on-chain weekly budget).
   */
  async function depositUsdc(
    amountUsd: number,
    weeklyBudgetUsdForInit?: number,
  ) {
    if (!program || !owner || !mint || !provider) {
      reportError(
        !mint
          ? `Brak NEXT_PUBLIC_USDC_MINT. Ustaw mock mint (${MOCK_USDC_MINT}) na Devnet.`
          : "Podłącz portfel.",
      );
      return null;
    }
    const raw = dollarsToRaw(amountUsd);
    if (raw.lte(new BN(0))) {
      reportError("Kwota depozytu musi być > 0.");
      return null;
    }
    const ownerUsdcAtaPk = ownerUsdcAta(owner, mint);

    // First deposit: initialize_user + deposit_usdc in one tx.
    if (!config) {
      const budgetUsd =
        weeklyBudgetUsdForInit != null &&
        Number.isFinite(weeklyBudgetUsdForInit) &&
        weeklyBudgetUsdForInit > 0
          ? weeklyBudgetUsdForInit
          : 0;
      const budgetRaw = dollarsToRaw(budgetUsd);
      if (budgetRaw.lte(new BN(0))) {
        reportError(
          "Przy pierwszej wpłacie ustaw budżet tygodniowy > 0 (init + deposit w jednej tx).",
        );
        return null;
      }
      return withTx(
        () =>
          withOneStaleBlockhashRetry(isPrivy, async () => {
            const initIx = await program.methods
              .initializeUser(budgetRaw)
              .accounts({ usdcMint: mint })
              .instruction();
            const depositIx = await program.methods
              .depositUsdc(raw)
              .accounts({
                usdcMint: mint,
                ownerUsdc: ownerUsdcAtaPk,
              })
              .instruction();
            const tx = new Transaction().add(initIx, depositIx);
            return provider.sendAndConfirm(tx);
          }),
        `Zainicjalizowano Predca + wpłacono ${amountUsd} USDC do vault.`,
        { requireVaultIncrease: isPrivy },
      );
    }

    return withTx(
      () =>
        withOneStaleBlockhashRetry(isPrivy, () =>
          program.methods
            .depositUsdc(raw)
            .accounts({
              usdcMint: mint,
              ownerUsdc: ownerUsdcAtaPk,
            })
            .rpc(),
        ),
      `Wpłacono ${amountUsd} USDC do vault.`,
      { requireVaultIncrease: isPrivy },
    );
  }

  async function withdrawUsdc(amountUsd: number) {
    if (!program || !owner || !mint) {
      reportError(
        !mint
          ? `Brak NEXT_PUBLIC_USDC_MINT. Ustaw mock mint (${MOCK_USDC_MINT}) na Devnet.`
          : "Podłącz portfel.",
      );
      return null;
    }
    if (!config) {
      reportError(
        "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Deposit) — init + deposit w jednej tx.",
      );
      return null;
    }
    const raw = dollarsToRaw(amountUsd);
    if (raw.lte(new BN(0))) {
      reportError("Kwota wypłaty musi być > 0.");
      return null;
    }
    const ownerUsdcAtaPk = ownerUsdcAta(owner, mint);
    return withTx(
      () =>
        withOneStaleBlockhashRetry(isPrivy, () =>
          program.methods
            .withdrawUsdc(raw)
            .accounts({
              usdcMint: mint,
              ownerUsdc: ownerUsdcAtaPk,
            })
            .rpc(),
        ),
      `Wypłacono ${amountUsd} USDC z vault.`,
    );
  }

  async function setWeeklyBudget(weeklyBudgetUsd: number) {
    if (!program || !owner) {
      reportError("Podłącz portfel.");
      return null;
    }
    // Lone initialize_user is not a Settings/auto-buy path. The account is
    // created only by the first deposit (initialize_user + deposit_usdc).
    if (!config) {
      reportError(
        "Najpierw wpłać USDC na Overview — konto Predca powstaje razem z pierwszą wpłatą.",
      );
      return null;
    }
    const raw = dollarsToRaw(weeklyBudgetUsd);
    if (raw.lte(new BN(0))) {
      reportError("Budżet tygodniowy musi być > 0.");
      return null;
    }
    return withTx(
      () =>
        withOneStaleBlockhashRetry(isPrivy, () =>
          program.methods.setWeeklyBudget(raw).rpc(),
        ),
      "Zapisano budżet tygodniowy on-chain.",
    );
  }

  /**
   * On-chain simulate_buy (live on Devnet Predca).
   * Debits vault USDC only; mints top-3 mock PreStock tokens to owner ATAs.
   */
  async function simulateBuy(tokenNames: string[]): Promise<string | null> {
    if (!program || !owner || !mint) {
      reportError(
        !mint
          ? `Brak NEXT_PUBLIC_USDC_MINT. Ustaw mock mint (${MOCK_USDC_MINT}) na Devnet.`
          : "Podłącz portfel.",
      );
      return null;
    }
    if (!config) {
      reportError(
        "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Deposit) — init + deposit w jednej tx.",
      );
      return null;
    }

    const { mints, names, missing } = resolveTop3Mints(tokenNames);
    if (missing.length > 0) {
      reportError(
        `Brak mapowania mint dla: ${missing.join(", ")}. Sprawdź lib/devnet-mock-mints.`,
      );
      return null;
    }
    if (mints.length !== 3) {
      reportError("Potrzebne dokładnie 3 tokeny top-3 z mapowaniem mint.");
      return null;
    }

    // Before the first await. withTx sets txPending only after config/vault/index.
    // Do not reportError here: a duplicate call must not clobber the buy in flight.
    if (!tryEnterManualBuy(buyLockRef, false)) return null;
    setTxPending(true);
    try {
      // Re-fetch config so budget is fresh after setWeeklyBudget in the same turn
      // (hook closure would otherwise keep the pre-sync weeklyBudgetUsd).
      const freshConfig = await fetchUserConfig(program, owner);
      if (!freshConfig) {
        reportError(
          "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Deposit) — init + deposit w jednej tx.",
        );
        return null;
      }
      const budget = rawToDollars(freshConfig.weeklyBudgetUsdc);
      const amountEach = Math.floor((budget * 1e6) / 3) / 1e6;
      const totalDebit = amountEach * 3;
      const vaultNow =
        vaultUsdc != null
          ? vaultUsdc
          : await fetchVaultBalance(connection, owner);
      if (vaultNow == null || vaultNow < totalDebit) {
        reportError(
          `Za mało USDC w vault (on-chain): ${(vaultNow ?? 0).toFixed(2)} < ${totalDebit.toFixed(2)}.`,
        );
        return null;
      }

      // Fresh on-chain index. `runs` is stale after a keeper buy until refresh.
      let scanned: number | null;
      try {
        scanned = await findNextRunIndex(program, owner);
      } catch (e) {
        reportError(parseAnchorError(e));
        return null;
      }
      if (scanned == null) {
        reportError(
          "Brak wolnego indeksu RunRecord (limit skanu). Odśwież i spróbuj ponownie.",
        );
        return null;
      }
      const nextIndex = scanned;

      const submitAt = async (runIndex: number) => {
        // Pre-create owner ATAs (idempotent) — program requires them to exist.
        await ensureOwnerAtas(
          connection,
          owner,
          mints,
          async (tx: Transaction, conn) => {
            const sig = await sendTransaction(tx, conn, {
              skipPreflight: false,
              preflightCommitment: "confirmed",
            });
            const latest = await conn.getLatestBlockhash("confirmed");
            await conn.confirmTransaction(
              { signature: sig, ...latest },
              "confirmed",
            );
            return sig;
          },
        );

        // Anchor 0.32 resolves PDAs (vault, mint_auth, ATAs, run_record) + signers.
        return program.methods
          .simulateBuy(new BN(runIndex), mints, Array.from({ length: 32 }, () => 0))
          .accounts({
            usdcMint: mint,
            mintA: mints[0],
            mintB: mints[1],
            mintC: mints[2],
          })
          .rpc();
      };

      const submitOnce = (runIndex: number) =>
        withOneStaleBlockhashRetry(isPrivy, () => submitAt(runIndex));

      const submitAndRemember = async (runIndex: number) => {
        try {
          const sig = await submitOnce(runIndex);
          createdRunIndicesRef.current.add(runIndex);
          return sig;
        } catch (e) {
          // Timeout may already have created this RunRecord. Do not buy the next index.
          noteUnconfirmedRunIndex(createdRunIndicesRef.current, runIndex, e);
          throw e;
        }
      };

      return await withTx(async () => {
        try {
          return await submitAndRemember(nextIndex);
        } catch (e) {
          if (!isRunAlreadyExists(e)) throw e;
          try {
            return await recoverRunCollision({
              failedIndex: nextIndex,
              createdRunIndices: createdRunIndicesRef.current,
              findNextIndex: () => findNextRunIndex(program, owner),
              submitOnce: submitAndRemember,
            });
          } catch (e2) {
            if (isRunAlreadyExists(e2)) throw new Error(RUN_INDEX_TAKEN_MSG);
            throw e2;
          }
        }
      }, `Zakup on-chain (simulate_buy): $${totalDebit.toFixed(2)} z vault → ⅓ na ${names.join(" · ")}`);
    } finally {
      leaveManualBuy(buyLockRef);
      setTxPending(false);
    }
  }

  /** Error and success toasts only. Never touches an unresolved signature. */
  function clearToasts() {
    clearMessages({ keepPending: true });
  }

  function clearMessages(opts?: { keepPending?: boolean }) {
    reportError(null);
    setOkMsg(null);
    if (clearDropsPending(opts)) setPending(null);
  }

  return {
    owner,
    mint,
    mintHint: mintHint(),
    status,
    loading,
    txPending,
    /** Set while a broadcast signature is neither confirmed nor rejected. */
    pendingSignature,
    /** Amber copy for pendingSignature. Not the teal success toast. */
    pendingMsg,
    pendingSignatureNow: () => pendingSigRef.current,
    error,
    /** Immediate last tx/validation error after await (ref). */
    lastTxError: () => lastErrorRef.current ?? error,
    okMsg,
    clearToasts,
    clearMessages,
    config,
    vaultUsdc,
    ownerUsdc,
    solBalance,
    tokenBalances,
    holdingsOnChain,
    portfolioUsd,
    weeklyBudgetUsd,
    runs,
    lastRun,
    lastPurchaseOnChain,
    refresh,
    depositUsdc,
    withdrawUsdc,
    setWeeklyBudget,
    simulateBuy,
  };
}

type PredcaApi = ReturnType<typeof usePredcaImpl>;

const PredcaContext = createContext<PredcaApi | null>(null);

export function PredcaProvider({ children }: { children: ReactNode }) {
  const value = usePredcaImpl();
  return createElement(PredcaContext.Provider, { value }, children);
}

export function usePredca() {
  const ctx = useContext(PredcaContext);
  if (!ctx) {
    throw new Error("usePredca must be used within PredcaProvider");
  }
  return ctx;
}

