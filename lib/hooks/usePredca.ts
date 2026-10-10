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
import {
  loadJupPricesInBackground,
  refreshPrices as refreshPricesOnly,
  refreshWriteStillCurrent,
} from "@/lib/predca-refresh";
import {
  EMPTY_SNAPSHOT,
  RPC_READ_ERROR_MSG,
  depositPlan,
  derivePredcaStatus,
  nextSnapshotAfterRefresh,
  type PredcaSnapshot,
  type PredcaStatus,
} from "@/lib/predca-status";
import {
  FAILED_EXPIRED_MSG,
  UNRESOLVED_POLL_MAX_MS,
  UNRESOLVED_POLL_MS,
  checkPendingOnce,
  expiryFromHeight,
  isBlockheightExpiredError,
  pendingLockHeld,
  readPendingRecords,
  removePendingRecord,
  sameActionFamily,
  signatureStatusDeps,
  visibleUnresolved,
  writePendingRecord,
  DUPLICATE_GUARD_KINDS,
  type PendingTxKind,
  type PendingTxRecord,
  type PendingVerdict,
  type StorageLike,
} from "@/lib/pending-tx";
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
import { fetchJupPrices, emptyJupPrices, type JupPrices } from "@/lib/jup-prices";
import {
  buildPositions,
  portfolioValue,
  runLots,
  valueWeights,
  type RunLotSource,
} from "@/lib/position-value";
import { fetchRunPrices, type DecodedRunPrice } from "@/lib/run-price";
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
  readVaultOrNull,
  formatTs,
  getProgram,
  isRunAlreadyExists,
  ownerUsdcAta,
  parseAnchorError,
  rawToDollars,
  RUN_INDEX_TAKEN_MSG,
  usdcMintOrNull,
  type RunRecordData,
} from "@/lib/predca";

export type { PredcaStatus } from "@/lib/predca-status";

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

function bnNum(v: BN | number | { toNumber?: () => number }): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof v.toNumber === "function") {
    return v.toNumber();
  }
  return Number(v);
}

export type RunFillView = {
  runIndex: string;
  /** null when this run has no RunPrice account (legacy 1:1). */
  slots: Array<{ units: number; price: number } | null> | null;
};

function runSources(runs: RunRecordData[]): RunLotSource[] {
  return runs.map((run) => ({
    runIndex: bnNum(run.runIndex),
    ts: bnNum(run.ts),
    mints: run.mints.map((m) => (typeof m === "string" ? m : m.toBase58())),
    amountsUsd: run.amounts.map((a) => rawToDollars(a)),
  }));
}

function fillsFor(
  runs: RunRecordData[],
  decoded: ReadonlyMap<number, DecodedRunPrice | null>,
): RunFillView[] {
  return runs.map((run) => {
    const runIndex = bnNum(run.runIndex);
    const dec = decoded.get(runIndex) ?? null;
    const mints = run.mints.map((m) => (typeof m === "string" ? m : m.toBase58()));
    if (!dec) return { runIndex: String(runIndex), slots: null };
    const slots = mints.map((mint, i) => {
      const decMint = dec.mints[i]?.toBase58();
      if (decMint !== mint) return null;
      const units = Number(dec.units[i]) / 1e6;
      const price = Number(dec.pricesE6[i]) / 1e6;
      if (!Number.isFinite(units) || !Number.isFinite(price)) return null;
      return { units, price };
    });
    return { runIndex: String(runIndex), slots };
  });
}

function runToLastPurchase(run: RunRecordData): OnChainLastPurchase {
  const amounts = run.amounts.map((a) => rawToDollars(a));
  const amountUsd = amounts.reduce((s, a) => s + a, 0);
  const tokens = run.mints.map((m) => {
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

function rpcReadFailure(e: unknown): string {
  const detail = parseAnchorError(e).replace(/\s+/g, " ").trim().slice(0, 120);
  return detail ? `${RPC_READ_ERROR_MSG} [${detail}]` : RPC_READ_ERROR_MSG;
}

/** Mark a sibling read as handled. A later await still receives the rejection. */
function markHandled(p: Promise<unknown>): void {
  void p.catch(() => {});
}

function pendingKindLabelPl(kind: PendingTxKind): string {
  switch (kind) {
    case "deposit":
    case "init_deposit":
      return "wpłata";
    case "withdraw":
      return "wypłata";
    case "buy":
      return "zakup";
    case "budget":
      return "zmiana budżetu";
  }
}

function priorSessionOk(rec: PendingTxRecord): string {
  const short = `${rec.signature.slice(0, 4)}…${rec.signature.slice(-4)}`;
  const amount = rec.amountUsd != null ? `${rec.amountUsd} USDC · ` : "";
  return `Transakcja z poprzedniej sesji weszła: ${pendingKindLabelPl(rec.kind)} ${amount}${short}`;
}

function successForRecord(rec: PendingTxRecord): string {
  const amt = rec.amountUsd ?? 0;
  switch (rec.kind) {
    case "init_deposit":
      return `Zainicjalizowano Predca + wpłacono ${amt} USDC do vault.`;
    case "deposit":
      return `Wpłacono ${amt} USDC do vault.`;
    case "withdraw":
      return `Wypłacono ${amt} USDC z vault.`;
    case "budget":
      return "Zapisano budżet tygodniowy on-chain.";
    case "buy":
      return rec.amountUsd != null
        ? `Zakup on-chain potwierdzony: $${rec.amountUsd.toFixed(2)} z vault.`
        : "Zakup on-chain potwierdzony.";
  }
}

function browserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
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

  const [snapshot, setSnapshot] = useState<PredcaSnapshot>(EMPTY_SNAPSHOT);
  const {
    config,
    configState,
    vaultUsdc,
    ownerUsdc,
    solBalance,
    tokenBalances,
    runs,
    rpcError,
  } = snapshot;
  const [loading, setLoading] = useState(false);
  const [unresolvedTxs, setUnresolvedTxs] = useState<PendingTxRecord[]>([]);
  const unresolvedRef = useRef<PendingTxRecord[]>([]);
  const [rechecking, setRechecking] = useState(false);
  const [lastVerdict, setLastVerdict] = useState<{
    signature: string;
    verdict: PendingVerdict;
  } | null>(null);
  const [sessionCheckMsg, setSessionCheckMsg] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartedRef = useRef<Map<string, number>>(new Map());
  const restoreRef = useRef<
    (ownerAtStart: string, isCancelled: () => boolean) => Promise<void>
  >(async () => {});
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
  const [jupPrices, setJupPrices] = useState<JupPrices>(() => emptyJupPrices(0));
  const [pricesLoading, setPricesLoading] = useState(false);
  const [runPriceByIndex, setRunPriceByIndex] = useState<
    Map<number, DecodedRunPrice | null>
  >(() => new Map());

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
    setSnapshot(EMPTY_SNAPSHOT);
    setRunPriceByIndex(new Map());
    unresolvedRef.current = [];
    setUnresolvedTxs([]);
    setSessionChecking(new Set());
    setLastVerdict(null);
    setSessionCheckMsg(null);
    pollStartedRef.current.clear();
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
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
    const pricesPromise = loadJupPricesInBackground(
      fetchJupPrices,
      still,
      setJupPrices,
      setPricesLoading,
    );
    markHandled(pricesPromise);
    reportError(null);
    if (!owner) {
      if (!still()) {
        return;
      }
      setSnapshot(EMPTY_SNAPSHOT);
      setRunPriceByIndex(new Map());
      return;
    }
    if (!still()) {
      return;
    }
    setLoading(true);
    try {
      const solPromise = fetchSolBalance(connection, owner);
      markHandled(solPromise);
      const ownerBalPromise = mint
        ? fetchOwnerUsdcBalance(connection, owner, mint)
        : Promise.resolve(null);
      markHandled(ownerBalPromise);
      const tokensPromise = fetchMockTokenBalances(
        connection,
        owner,
        allMockMints(),
      );
      markHandled(tokensPromise);

      if (!program) {
        const [sol, ownerBal, tokens] = await Promise.all([
          solPromise,
          ownerBalPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setSnapshot((prev) =>
          nextSnapshotAfterRefresh(prev, {
            ok: true,
            config: null,
            vaultUsdc: null,
            ownerUsdc: ownerBal,
            solBalance: sol,
            tokenBalances: tokens,
            runs: [],
          }),
        );
        setRunPriceByIndex(new Map());
        return;
      }

      const cfg = await fetchUserConfig(program, owner);
      if (!still()) return;

      if (cfg) {
        const [bal, records, ownerBal, sol, tokens] = await Promise.all([
          fetchVaultBalance(connection, owner),
          fetchRunRecords(program, owner),
          ownerBalPromise,
          solPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setSnapshot((prev) =>
          nextSnapshotAfterRefresh(prev, {
            ok: true,
            config: cfg,
            vaultUsdc: bal,
            ownerUsdc: ownerBal,
            solBalance: sol,
            tokenBalances: tokens,
            runs: records,
          }),
        );
        try {
          const decoded = await fetchRunPrices(
            connection,
            owner,
            records.map((r) => bnNum(r.runIndex)),
          );
          if (still()) setRunPriceByIndex(decoded);
        } catch {
          if (still()) setRunPriceByIndex(new Map());
        }
      } else {
        const [ownerBal, sol, tokens] = await Promise.all([
          ownerBalPromise,
          solPromise,
          tokensPromise,
        ]);
        if (!still()) return;
        setSnapshot((prev) =>
          nextSnapshotAfterRefresh(prev, {
            ok: true,
            config: null,
            vaultUsdc: null,
            ownerUsdc: ownerBal,
            solBalance: sol,
            tokenBalances: tokens,
            runs: [],
          }),
        );
        setRunPriceByIndex(new Map());
      }
    } catch (e) {
      if (!still()) return;
      setSnapshot((prev) =>
        nextSnapshotAfterRefresh(prev, { ok: false, error: rpcReadFailure(e) }),
      );
    } finally {
      if (!still()) return;
      setLoading(false);
    }
  }, [program, owner, connection, mint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const refreshPrices = useCallback(async () => {
    const epochAtStart = dataEpoch.current;
    const ownerAtStart = owner?.toBase58() ?? null;
    const still = () =>
      refreshWriteStillCurrent(
        epochAtStart,
        ownerAtStart,
        dataEpoch.current,
        ownerRef.current?.toBase58() ?? null,
      );
    setPricesLoading(true);
    try {
      await refreshPricesOnly(fetchJupPrices, still, (value) => {
        if (still()) setJupPrices(value);
      });
    } finally {
      if (still()) setPricesLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    if (!ownerKey) return;
    const ownerAtStart = ownerKey;
    let cancelled = false;
    void restoreRef.current(ownerAtStart, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [ownerKey]);

  const status: PredcaStatus = derivePredcaStatus({
    hasOwner: Boolean(owner),
    hasMint: Boolean(mint),
    loading,
    configState,
    rpcError,
  });

  const weeklyBudgetUsd = config
    ? rawToDollars(config.weeklyBudgetUsdc)
    : null;

  const lastRun = runs.length > 0 ? runs[runs.length - 1] : null;

  const lots = useMemo(
    () => runLots(runSources(runs), runPriceByIndex),
    [runs, runPriceByIndex],
  );

  const positions = useMemo(
    () => buildPositions(lots, tokenBalances, jupPrices),
    [lots, tokenBalances, jupPrices],
  );

  const runFills = useMemo(
    () => fillsFor(runs, runPriceByIndex),
    [runs, runPriceByIndex],
  );

  /** Pie weights follow USD value. Legacy 1:1 lots match the old unit weights. */
  const holdingsOnChain = useMemo((): Holding[] => {
    return valueWeights(positions).map((h, i) => ({
      name: h.name,
      value: h.value,
      color: holdingColor(h.name, i),
    }));
  }, [positions]);

  /**
   * Vault USDC + marked positions. Legacy tokens stay at cost ($1 per unit),
   * so with no RunPrice accounts this matches vault + Σ token units.
   * Wallet USDC is cash outside the DCA and is not included.
   */
  const portfolioUsd = useMemo(() => {
    if (!owner) return null;
    return portfolioValue(vaultUsdc ?? 0, positions);
  }, [owner, vaultUsdc, positions]);

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
      let vaultAfter = 0;
      try {
        vaultAfter = (await fetchVaultBalance(connection, owner)) ?? 0;
      } catch {
        vaultAfter = 0;
      }
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

  type SettleOpts = {
    epoch: number;
    success: string;
    requireVaultIncrease: boolean;
    vaultBefore: number | null;
    fromSession?: boolean;
    fromPoll?: boolean;
  };

  function persistRecord(rec: PendingTxRecord) {
    const storage = browserStorage();
    if (!storage) return;
    try {
      writePendingRecord(storage, rec);
    } catch {
      /* localStorage can throw in private mode. */
    }
  }

  function forgetRecord(rec: PendingTxRecord) {
    const storage = browserStorage();
    if (!storage) return;
    try {
      removePendingRecord(storage, rec.owner, rec.signature);
    } catch {
      /* ignore */
    }
  }

  function syncUnresolved(next: PendingTxRecord[]) {
    unresolvedRef.current = next;
    setUnresolvedTxs(next);
  }

  function dropUnresolved(signature: string) {
    pollStartedRef.current.delete(signature);
    syncUnresolved(
      unresolvedRef.current.filter((row) => row.signature !== signature),
    );
  }

  function schedulePoll() {
    if (pollTimerRef.current) return;
    const due = unresolvedRef.current.some((row) => {
      const started = pollStartedRef.current.get(row.signature);
      return started != null && Date.now() - started < UNRESOLVED_POLL_MAX_MS;
    });
    if (!due) return;
    pollTimerRef.current = setTimeout(() => {
      pollTimerRef.current = null;
      void runPoll();
    }, UNRESOLVED_POLL_MS);
  }

  function rememberUnresolved(rec: PendingTxRecord) {
    if (!pollStartedRef.current.has(rec.signature)) {
      pollStartedRef.current.set(rec.signature, Date.now());
    }
    const rest = unresolvedRef.current.filter((row) => row.signature !== rec.signature);
    syncUnresolved([rec, ...rest].sort((a, b) => b.createdAtMs - a.createdAtMs));
    schedulePoll();
  }

  function releasePending(signature: string, verdict: PendingVerdict) {
    setLastVerdict({ signature, verdict });
    if (pendingSigRef.current === signature && !pendingLockHeld(verdict)) {
      setPending(null);
    }
  }

  async function applyKnownVerdict(
    rec: PendingTxRecord,
    verdict: PendingVerdict,
    opts: SettleOpts,
  ): Promise<void> {
    const ownerNow = ownerRef.current?.toBase58() ?? null;
    if (ownerNow !== rec.owner) return;
    if (pendingSigRef.current != null && pendingSigRef.current !== rec.signature) return;

    releasePending(rec.signature, verdict);

    if (verdict === "confirmed") {
      forgetRecord(rec);
      dropUnresolved(rec.signature);
      if (opts.fromSession) {
        reportError(null);
        setOkMsg(priorSessionOk(rec));
        await refresh();
        return;
      }
      if (opts.requireVaultIncrease && ownerRef.current) {
        await applyConfirmedVault(
          opts.epoch,
          rec.signature,
          opts.vaultBefore ?? 0,
          opts.success,
        );
        return;
      }
      await refresh();
      if (!opts.fromPoll && !opts.fromSession && vaultFollowEpoch.current !== opts.epoch) {
        return;
      }
      reportError(null);
      setOkMsg(opts.success);
      return;
    }

    if (verdict === "rejected") {
      forgetRecord(rec);
      dropUnresolved(rec.signature);
      setOkMsg(null);
      reportError(rejectedTxMessage(rec.signature, explorerTxUrl(rec.signature)));
      return;
    }

    if (verdict === "failed_expired") {
      forgetRecord(rec);
      dropUnresolved(rec.signature);
      setOkMsg(null);
      reportError(
        `${FAILED_EXPIRED_MSG} ${rec.signature} ${explorerTxUrl(rec.signature)}`,
      );
      return;
    }

    rememberUnresolved(rec);
  }

  async function settleRecord(
    rec: PendingTxRecord,
    opts: SettleOpts,
  ): Promise<PendingVerdict> {
    const verdict = await checkPendingOnce(rec, signatureStatusDeps(connection));
    await applyKnownVerdict(rec, verdict, opts);
    return verdict;
  }

  async function runPoll() {
    const now = Date.now();
    const batch = unresolvedRef.current.slice();
    for (const rec of batch) {
      const started = pollStartedRef.current.get(rec.signature);
      if (started == null || now - started >= UNRESOLVED_POLL_MAX_MS) continue;
      if (!unresolvedRef.current.some((row) => row.signature === rec.signature)) continue;
      await settleRecord(rec, {
        epoch: vaultFollowEpoch.current,
        success: successForRecord(rec),
        requireVaultIncrease: false,
        vaultBefore: null,
        fromPoll: true,
      });
    }
    schedulePoll();
  }

  async function buildPendingRecord(
    signature: string,
    err: unknown,
    kind: PendingTxKind,
    amountUsd: number | null,
  ): Promise<PendingTxRecord> {
    let height: number | null = null;
    try {
      height = await connection.getBlockHeight("confirmed");
    } catch {
      height = null;
    }
    const rec: PendingTxRecord = {
      signature,
      owner: ownerRef.current?.toBase58() ?? "",
      kind,
      amountUsd,
      createdAtMs: Date.now(),
      expiryBlockHeight: height != null ? expiryFromHeight(height) : null,
      expiredAtError: isBlockheightExpiredError(err),
    };
    persistRecord(rec);
    return rec;
  }

  /**
   * Poll a still-unknown signature for about 60s. On confirm or on-chain
   * reject, clear the amber note. When the budget ends, take a verdict and
   * release the global lock.
   */
  function watchUnresolved(follow: {
    epoch: number;
    signature: string;
    success: string;
    requireVaultIncrease: boolean;
    vaultBefore: number | null;
    record: PendingTxRecord;
  }) {
    if (watchingSigRef.current === follow.signature) return;
    watchingSigRef.current = follow.signature;
    void (async () => {
      const started = Date.now();
      const finishWindow = async () => {
        if (pendingSigRef.current !== follow.signature) return;
        await settleRecord(follow.record, {
          epoch: follow.epoch,
          success: follow.success,
          requireVaultIncrease: follow.requireVaultIncrease,
          vaultBefore: follow.vaultBefore,
        });
      };
      try {
        while (pendingSigRef.current === follow.signature) {
          const elapsed = Date.now() - started;
          if (elapsed >= UNRESOLVED_WATCH_MS) {
            await finishWindow();
            return;
          }
          const wait = Math.min(
            UNRESOLVED_WATCH_POLL_MS,
            UNRESOLVED_WATCH_MS - elapsed,
          );
          await new Promise((resolve) => setTimeout(resolve, wait));
          if (pendingSigRef.current !== follow.signature) return;
          if (Date.now() - started >= UNRESOLVED_WATCH_MS) {
            await finishWindow();
            return;
          }
          if (!ownerRef.current) {
            setPending(null);
            return;
          }
          let row: Awaited<
            ReturnType<typeof connection.getSignatureStatuses>
          >["value"][number] = null;
          try {
            const { value } = await connection.getSignatureStatuses(
              [follow.signature],
              { searchTransactionHistory: true },
            );
            row = value[0];
          } catch {
            continue;
          }
          if (row?.err) {
            if (pendingSigRef.current !== follow.signature) return;
            if (vaultFollowEpoch.current !== follow.epoch) {
              setPending(null);
              return;
            }
            forgetRecord(follow.record);
            dropUnresolved(follow.signature);
            releasePending(follow.signature, "rejected");
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
            if (vaultFollowEpoch.current !== follow.epoch) {
              setPending(null);
              return;
            }
            forgetRecord(follow.record);
            dropUnresolved(follow.signature);
            releasePending(follow.signature, "confirmed");
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
    opts: {
      requireVaultIncrease?: boolean;
      kind: PendingTxKind;
      amountUsd?: number | null;
    },
  ): Promise<T | null> {
    // A second entry would drop the watcher and send another fee-payer tx.
    if (unresolvedSignatureBlocksTx(pendingSigRef.current)) return null;
    const epoch = ++vaultFollowEpoch.current;
    reportError(null);
    setOkMsg(null);
    setPending(null);
    setTxPending(true);
    const vaultBefore =
      opts.requireVaultIncrease && owner
        ? await readVaultOrNull(connection, owner)
        : null;
    const followBase = {
      epoch,
      success,
      requireVaultIncrease: Boolean(opts.requireVaultIncrease && owner),
      vaultBefore,
    };
    try {
      const result = await fn();
      if (opts.requireVaultIncrease && owner) {
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
      const rec = await buildPendingRecord(
        signature,
        e,
        opts.kind,
        opts.amountUsd ?? null,
      );
      if (pendingSigRef.current !== signature) return null;
      if (rec.expiredAtError) {
        const started = Date.now();
        for (const at of [2_000, 6_000]) {
          const wait = at - (Date.now() - started);
          if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
          if (pendingSigRef.current !== signature) return null;
          if (vaultFollowEpoch.current !== epoch) return null;
          const early = await checkPendingOnce(rec, signatureStatusDeps(connection));
          if (early !== "unresolved") {
            await applyKnownVerdict(rec, early, followBase);
            return null;
          }
        }
        if (pendingSigRef.current !== signature) return null;
        await settleRecord(rec, followBase);
        return null;
      }
      try {
        await confirmLanded(signature);
      } catch (confirmErr) {
        if (isOnChainSignatureReject(confirmErr)) {
          forgetRecord(rec);
          dropUnresolved(signature);
          releasePending(signature, "rejected");
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
        watchUnresolved({
          ...followBase,
          signature,
          record: rec,
        });
        return null;
      }
      forgetRecord(rec);
      dropUnresolved(signature);
      releasePending(signature, "confirmed");
      if (opts.requireVaultIncrease && owner) {
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

  restoreRef.current = async (ownerAtStart, isCancelled) => {
    await Promise.resolve();
    if (isCancelled()) return;
    const storage = browserStorage();
    if (!storage) return;
    let records: PendingTxRecord[] = [];
    try {
      records = readPendingRecords(storage, ownerAtStart, Date.now());
    } catch {
      return;
    }
    if (isCancelled() || (ownerRef.current?.toBase58() ?? null) !== ownerAtStart) return;
    if (records.length === 0) return;
    setSessionCheckMsg("Sprawdzam transakcję z poprzedniej sesji…");
    for (const rec of records) {
      if (!pollStartedRef.current.has(rec.signature)) {
        pollStartedRef.current.set(rec.signature, Date.now());
      }
    }
    setSessionChecking(new Set(records.map((r) => r.signature)));
    syncUnresolved(records);
    schedulePoll();
    for (const rec of records) {
      if (isCancelled() || (ownerRef.current?.toBase58() ?? null) !== ownerAtStart) return;
      try {
        await settleRecord(rec, {
          epoch: vaultFollowEpoch.current,
          success: successForRecord(rec),
          requireVaultIncrease: false,
          vaultBefore: null,
          fromSession: true,
        });
      } finally {
        setSessionChecking((prev) => {
          const next = new Set(prev);
          next.delete(rec.signature);
          return next;
        });
      }
    }
    if (!isCancelled() && (ownerRef.current?.toBase58() ?? null) === ownerAtStart) {
      setSessionCheckMsg(null);
    }
  };

  async function recheckUnresolved(signature?: string): Promise<PendingVerdict> {
    setRechecking(true);
    try {
      const targets = signature
        ? unresolvedRef.current.filter((row) => row.signature === signature)
        : unresolvedRef.current.slice();
      let last: PendingVerdict = "unresolved";
      for (const rec of targets) {
        last = await settleRecord(rec, {
          epoch: vaultFollowEpoch.current,
          success: successForRecord(rec),
          requireVaultIncrease: false,
          vaultBefore: null,
        });
      }
      return last;
    } finally {
      setRechecking(false);
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
    const plan = depositPlan(configState, rpcError);
    if (plan === "blocked") {
      reportError(RPC_READ_ERROR_MSG);
      return null;
    }

    // First deposit: initialize_user + deposit_usdc in one tx.
    if (plan === "init_deposit") {
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
        {
          requireVaultIncrease: isPrivy,
          kind: "init_deposit",
          amountUsd,
        },
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
      { requireVaultIncrease: isPrivy, kind: "deposit", amountUsd },
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
    if (rpcError) {
      reportError(RPC_READ_ERROR_MSG);
      return null;
    }
    if (!config) {
      reportError(
        "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Wpłać) — init + deposit w jednej tx.",
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
      { kind: "withdraw", amountUsd },
    );
  }

  async function setWeeklyBudget(weeklyBudgetUsd: number) {
    if (!program || !owner) {
      reportError("Podłącz portfel.");
      return null;
    }
    if (rpcError) {
      reportError(RPC_READ_ERROR_MSG);
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
      { kind: "budget", amountUsd: weeklyBudgetUsd },
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
    if (rpcError) {
      reportError(RPC_READ_ERROR_MSG);
      return null;
    }
    if (!config) {
      reportError(
        "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Wpłać) — init + deposit w jednej tx.",
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
          "Predca nie jest zainicjalizowane. Zrób pierwszą wpłatę (Wpłać) — init + deposit w jednej tx.",
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
      }, `Zakup on-chain (simulate_buy): $${totalDebit.toFixed(2)} z vault → ⅓ na ${names.join(" · ")}`, {
        kind: "buy",
        amountUsd: totalDebit,
      });
    } catch (e) {
      reportError(parseAnchorError(e));
      return null;
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
    configState,
    rpcError,
    unresolvedTxs,
    visibleUnresolvedTxs: visibleUnresolved(unresolvedTxs, sessionChecking),
    recheckUnresolved,
    rechecking,
    unresolvedFor: (kind: PendingTxKind) => {
      if (!DUPLICATE_GUARD_KINDS.has(kind)) return null;
      return unresolvedTxs.find((row) => sameActionFamily(row.kind, kind)) ?? null;
    },
    lastVerdict,
    sessionCheckMsg,
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
    positions,
    jupPrices,
    pricesLoading,
    refreshPrices,
    runFills,
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

