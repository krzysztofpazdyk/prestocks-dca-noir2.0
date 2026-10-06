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
import { isStaleBlockhashError } from "@/lib/privy-blockhash";
import { Transaction } from "@solana/web3.js";
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
  const [error, setError] = useState<string | null>(null);
  /** Sync last tx error (React state lags one render after await). */
  const lastErrorRef = useRef<string | null>(null);
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

  const refresh = useCallback(async () => {
    reportError(null);
    if (!owner) {
      setConfig(null);
      setVaultUsdc(null);
      setOwnerUsdc(null);
      setSolBalance(null);
      setTokenBalances([]);
      setRuns([]);
      return;
    }
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
        setSolBalance(sol);
        setOwnerUsdc(ownerBal);
        setTokenBalances(tokens);
        setConfig(null);
        setVaultUsdc(null);
        setRuns([]);
        return;
      }

      const cfg = await fetchUserConfig(program, owner);
      setConfig(cfg);

      if (cfg) {
        const [bal, records, ownerBal, sol, tokens] = await Promise.all([
          fetchVaultBalance(connection, owner),
          fetchRunRecords(program, owner),
          ownerBalPromise,
          solPromise,
          tokensPromise,
        ]);
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
        setVaultUsdc(null);
        setRuns([]);
        setOwnerUsdc(ownerBal);
        setSolBalance(sol);
        setTokenBalances(tokens);
      }
    } catch (e) {
      reportError(parseAnchorError(e));
    } finally {
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
        throw new Error("Transakcja odrzucona przez Devnet.");
      }
      if (
        row?.confirmationStatus === "confirmed" ||
        row?.confirmationStatus === "finalized"
      ) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    throw new Error(
      "Brak potwierdzenia transakcji na Devnet. Spróbuj ponownie.",
    );
  }

  async function withTx<T>(
    fn: () => Promise<T>,
    success: string,
    opts?: { requireVaultIncrease?: boolean },
  ): Promise<T | null> {
    reportError(null);
    setOkMsg(null);
    setTxPending(true);
    const vaultBefore =
      opts?.requireVaultIncrease && owner
        ? ((await fetchVaultBalance(connection, owner)) ?? 0)
        : null;
    try {
      const result = await fn();
      if (opts?.requireVaultIncrease && owner) {
        if (typeof result === "string" && result.length > 0) {
          await confirmLanded(result);
        }
        // Same RPC can confirm on one replica and still serve the old
        // vault balance from another. Poll briefly, then fail honestly.
        const before = vaultBefore ?? 0;
        let vaultAfter = before;
        const balanceStarted = Date.now();
        while (Date.now() - balanceStarted < 12_000) {
          vaultAfter = (await fetchVaultBalance(connection, owner)) ?? 0;
          if (vaultAfter > before + 1e-6) break;
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
        if (!(vaultAfter > before + 1e-6)) {
          const unchanged =
            "Podpis przyjęty, ale saldo vault się nie zmieniło. Spróbuj wpłacić ponownie.";
          await refresh();
          // refresh() clears the error at the start. Set it again after.
          reportError(unchanged);
          return null;
        }
      }
      setOkMsg(success);
      await refresh();
      return result;
    } catch (e) {
      reportError(parseAnchorError(e));
      return null;
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
      return withTx(async () => {
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
      },
      `Zainicjalizowano Predca + wpłacono ${amountUsd} USDC do vault.`,
      { requireVaultIncrease: isPrivy },
    );
    }

    return withTx(
      () =>
        program.methods
          .depositUsdc(raw)
          .accounts({
            usdcMint: mint,
            ownerUsdc: ownerUsdcAtaPk,
          })
          .rpc(),
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
        program.methods
          .withdrawUsdc(raw)
          .accounts({
            usdcMint: mint,
            ownerUsdc: ownerUsdcAtaPk,
          })
          .rpc(),
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
      () => program.methods.setWeeklyBudget(raw).rpc(),
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
    let nextIndex: number | null;
    try {
      nextIndex = await findNextRunIndex(program, owner);
    } catch (e) {
      reportError(parseAnchorError(e));
      return null;
    }
    if (nextIndex == null) {
      reportError(
        "Brak wolnego indeksu RunRecord (limit skanu). Odśwież i spróbuj ponownie.",
      );
      return null;
    }

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

    const submitOnce = async (runIndex: number) => {
      try {
        return await submitAt(runIndex);
      } catch (e) {
        // Slow Privy approval can expire the blockhash. One rebuild + re-prompt.
        // Phantom and Solflare keep the single attempt.
        if (!isPrivy || !isStaleBlockhashError(e)) throw e;
        return await submitAt(runIndex);
      }
    };

    return withTx(async () => {
      try {
        return await submitOnce(nextIndex);
      } catch (e) {
        if (!isRunAlreadyExists(e)) throw e;
        const retryIndex = await findNextRunIndex(program, owner);
        if (retryIndex == null || retryIndex === nextIndex) {
          throw new Error(RUN_INDEX_TAKEN_MSG);
        }
        try {
          return await submitOnce(retryIndex);
        } catch (e2) {
          if (isRunAlreadyExists(e2)) throw new Error(RUN_INDEX_TAKEN_MSG);
          throw e2;
        }
      }
    }, `Zakup on-chain (simulate_buy): $${totalDebit.toFixed(2)} z vault → ⅓ na ${names.join(" · ")}`);
  }

  function clearMessages() {
    reportError(null);
    setOkMsg(null);
  }

  return {
    owner,
    mint,
    mintHint: mintHint(),
    status,
    loading,
    txPending,
    error,
    /** Immediate last tx/validation error after await (ref). */
    lastTxError: () => lastErrorRef.current ?? error,
    okMsg,
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

