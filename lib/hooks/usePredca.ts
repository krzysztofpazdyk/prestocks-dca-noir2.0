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
  formatTs,
  getProgram,
  ownerUsdcAta,
  parseAnchorError,
  rawToDollars,
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

function usePredcaImpl() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { sendTransaction } = useWallet();
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

  async function withTx<T>(
    fn: () => Promise<T>,
    success: string,
  ): Promise<T | null> {
    reportError(null);
    setOkMsg(null);
    setTxPending(true);
    try {
      const result = await fn();
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

  async function initializeUser(weeklyBudgetUsd: number) {
    if (!program || !owner || !mint) {
      reportError(
        !mint
          ? `Ustaw NEXT_PUBLIC_USDC_MINT (mock mint na Devnet, np. ${MOCK_USDC_MINT}).`
          : "Podłącz portfel.",
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
        program.methods
          .initializeUser(raw)
          .accounts({ usdcMint: mint })
          .rpc(),
      "Konto Predca zainicjalizowane.",
    );
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
      }, `Zainicjalizowano Predca + wpłacono ${amountUsd} USDC do vault.`);
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
    if (!config) {
      return initializeUser(weeklyBudgetUsd);
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

    const runIndex =
      runs.length === 0
        ? 0
        : Math.max(
            ...runs.map((r) => {
              const idx = r.runIndex;
              return typeof idx === "object" && idx !== null && "toNumber" in idx
                ? (idx as BN).toNumber()
                : Number(idx ?? 0);
            }),
          ) + 1;
    return withTx(async () => {
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
    initializeUser,
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

