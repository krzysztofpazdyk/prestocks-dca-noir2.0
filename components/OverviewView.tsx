"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { claimFaucetUsdc } from "@/lib/dca-api";
import { HoldingsPie } from "./HoldingsPie";
import { fmtPriceClock, fmtSignedPnl, fmtUsdAmount } from "@/lib/format-usd";
import {
  canonicalName,
  isLowLiquidity,
  quoteByName,
  type JupPrices,
} from "@/lib/jup-prices";
import { priceRows, type PriceRowFlag } from "@/lib/price-rows";
import { pnlSummary, positionPnlKind, type PositionRow } from "@/lib/position-value";
import {
  DEFAULT_SETTINGS,
  HOLDINGS,
  LAST_PURCHASE,
  MOCK_BALANCES,
  MOCK_VAULT_USDC,
  type Holding,
  type Purchase,
} from "@/lib/mock-data";
import {
  applyPurchase,
  loadPortfolioState,
  savePortfolioState,
  type PortfolioBalances,
} from "@/lib/portfolio-state";
import { readWeeklyBudgetUsd } from "@/lib/auto-weekly-buy";
import { usePredca } from "@/lib/hooks/usePredca";
import { leaveManualBuy, tryEnterManualBuy } from "@/lib/manual-buy-guard";
import { isOnChainSignatureReject } from "@/lib/vault-follow-up";
import { depositUi, withdrawUi } from "@/lib/predca-status";
import {
  FAILED_EXPIRED_MSG,
  UNRESOLVED_MSG,
  leaveDupCheck,
  nextDuplicateStep,
  tryEnterDupCheck,
} from "@/lib/pending-tx";
import { TxNotice, txMessageWithLink } from "@/components/TxNotice";
import {
  clusterShortPl,
  explorerTxUrl,
  formatUsd,
  rawToDollars,
  rpcHost,
  shortPk,
} from "@/lib/predca";
import { livePremiumPct } from "@/lib/premium-view";
import { fetchPrestocksProducts, PRESTOCKS_SNAPSHOT_DATE } from "@/lib/prestocks";
import { isFlatFallback, runRankingNow } from "@/lib/ranking";
import { useI18n } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/app-version";
import type { RankResult } from "@/lib/universe";

/** Page-load clock. Avoids Date.now() during render (react-hooks/purity). */
const UI_CLOCK_AT = Date.now();

/** Short Top-3 h2 from RankResult.mode — never claim live Jev for metrics. */
function top3TitleFromRank(result: RankResult, locale: string): string {
  const grok = (result.pipeline || []).includes("grok");
  if (result.mode === "metrics_fallback") {
    return locale === "en" ? "Top-3 · metrics" : "Top-3 · metryki";
  }
  if (result.mode === "byok_ai") {
    if (grok) return "Top-3 · Grok+Jev";
    return "Top-3 · AI (BYOK)";
  }
  // hosted_jev / cache / other
  return locale === "en" ? "Top-3 · ranking" : "Top-3 · ranking";
}

const BUDGET_EPS = 0.000001;

/** Intended buy amount: Settings LS is SoT; on-chain is synced before Manual Buy. */
function resolvePurchaseAmount(
  onChainWeeklyUsd: number | null,
  owner?: string | null,
): number {
  const ls = readWeeklyBudgetUsd(DEFAULT_SETTINGS.weeklyAmountUsd, owner);
  if (ls > 0) return ls;
  if (onChainWeeklyUsd != null && onChainWeeklyUsd > 0) return onChainWeeklyUsd;
  return DEFAULT_SETTINGS.weeklyAmountUsd;
}

function budgetsDiffer(ls: number, onChain: number | null): boolean {
  if (onChain == null || !Number.isFinite(onChain)) return ls > 0;
  return Math.abs(ls - onChain) > BUDGET_EPS;
}

type TopPick = {
  name: string;
  score: number;
  priceNow: number | null;
  premiumPct: number | null;
  premiumSource: string;
};

function emptyPurchase(): Purchase {
  return {
    date: "—",
    amountUsd: 0,
    tokens: [],
    perTokenUsd: 0,
    signature: "",
  };
}

export function OverviewView() {
  const { connected, publicKey } = useWallet();
  const ownerBase58 = publicKey?.toBase58() ?? null;
  const predca = usePredca();
  const { locale, t } = useI18n();
  const [balances, setBalances] = useState<PortfolioBalances>({ ...MOCK_BALANCES });
  const [vaultUsdc, setVaultUsdc] = useState(MOCK_VAULT_USDC);
  const [holdings, setHoldings] = useState<Holding[]>(() =>
    HOLDINGS.map((h) => ({ ...h })),
  );
  const [lastPurchase, setLastPurchase] = useState<Purchase>(() => ({
    ...LAST_PURCHASE,
    tokens: [...LAST_PURCHASE.tokens],
  }));
  const [portfolioRevision, setPortfolioRevision] = useState(0);
  const [depositAmt, setDepositAmt] = useState(500);
  const [withdrawAmt, setWithdrawAmt] = useState(10);
  const [top3, setTop3] = useState<TopPick[]>([]);
  const [top3Title, setTop3Title] = useState<string | null>(null);
  const [top3Subtitle, setTop3Subtitle] = useState<string | null>(null);
  const [premiumBasis, setPremiumBasis] = useState<RankResult["premiumBasis"] | null>(
    null,
  );
  const [rankFlat, setRankFlat] = useState(false);
  const [rankBusy, setRankBusy] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);
  const [purchaseTone, setPurchaseTone] = useState<"ok" | "fail" | "pending">("ok");
  /** Sync lock across setWeeklyBudget and simulateBuy. A second Kup returns immediately. */
  const buyInFlightRef = useRef(false);
  const [buyInFlight, setBuyInFlight] = useState(false);
  const sawPendingSig = useRef(false);
  const dupCheckRef = useRef(false);
  const [dupChecking, setDupChecking] = useState(false);
  const [dupWarn, setDupWarn] = useState<{
    kind: "deposit" | "withdraw" | "buy";
    amount: number;
  } | null>(null);
  const [priceNow, setPriceNow] = useState(UI_CLOCK_AT);
  const sigUnresolved = predca.pendingSignature != null;

  useEffect(() => {
    if (predca.pendingSignature) {
      sawPendingSig.current = true;
      return;
    }
    if (!sawPendingSig.current || purchaseTone !== "pending") return;
    sawPendingSig.current = false;
    const verdict = predca.lastVerdict;
    if (verdict?.verdict === "failed_expired" || verdict?.verdict === "unresolved") {
      const text =
        verdict.verdict === "failed_expired" ? FAILED_EXPIRED_MSG : UNRESOLVED_MSG;
      setPurchaseMsg(`${text} ${verdict.signature} ${explorerTxUrl(verdict.signature)}`);
      setPurchaseTone(verdict.verdict === "failed_expired" ? "fail" : "pending");
      return;
    }
    if (predca.error && isOnChainSignatureReject(predca.error)) {
      setPurchaseMsg(`${t("msg.purchaseFail")}: ${predca.error}`);
      setPurchaseTone("fail");
    } else {
      setPurchaseMsg(null);
      setPurchaseTone("ok");
    }
  }, [predca.pendingSignature, predca.error, predca.lastVerdict, purchaseTone, t]);
  const [faucetBusy, setFaucetBusy] = useState(false);
  const [faucetMsg, setFaucetMsg] = useState<string | null>(null);
  const [faucetErr, setFaucetErr] = useState<string | null>(null);

  async function onClaimFaucet() {
    if (predca.pendingSignatureNow()) return;
    if (!publicKey) {
      setFaucetErr(t("faucet.needWallet"));
      return;
    }
    setFaucetBusy(true);
    setFaucetMsg(null);
    setFaucetErr(null);
    try {
      const res = await claimFaucetUsdc(publicKey.toBase58());
      const sigShort =
        res.signature.length > 16
          ? `${res.signature.slice(0, 8)}…${res.signature.slice(-8)}`
          : res.signature;
      const solPart =
        res.solSkipped
          ? " (SOL skipped)"
          : res.solSignature
            ? ` · SOL ${res.solSignature.length > 16 ? `${res.solSignature.slice(0, 8)}…${res.solSignature.slice(-8)}` : res.solSignature}`
            : "";
      setFaucetMsg(
        t("faucet.success", { sig: `${sigShort}${solPart}` }) +
          " " +
          t("faucet.nextSteps"),
      );
      await predca.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setFaucetErr(t("faucet.error", { error: msg }));
    } finally {
      setFaucetBusy(false);
    }
  }


  useEffect(() => {
    // Offline / disconnected fallback only — localStorage mock portfolio.
    if (connected) return;
    const s = loadPortfolioState();
    setBalances(s.balances);
    setVaultUsdc(s.vaultUsdc);
    setHoldings(s.holdings);
    setLastPurchase(s.lastPurchase);
    setPortfolioRevision((r) => r + 1);
  }, [connected]);

  const lsWeekly = readWeeklyBudgetUsd(DEFAULT_SETTINGS.weeklyAmountUsd, ownerBase58);
  const purchaseAmount = resolvePurchaseAmount(predca.weeklyBudgetUsd, ownerBase58);
  const budgetDirty = budgetsDiffer(lsWeekly, predca.weeklyBudgetUsd);
  const onChainReady = predca.status === "ready";
  const onChainVaultUsdc =
    onChainReady && predca.vaultUsdc != null ? predca.vaultUsdc : null;
  // Funding: tylko vault on-chain. Przed Connect / bez config → null.
  const availableVaultUsdc = onChainVaultUsdc;

  // Przed Connect: zawsze puste / „—”, nigdy losowe mocki.
  const displaySol =
    connected && predca.solBalance != null ? predca.solBalance : null;
  const displayOwnerUsdc =
    connected && predca.ownerUsdc != null ? predca.ownerUsdc : null;
  const displayPortfolioUsd =
    connected && predca.portfolioUsd != null ? predca.portfolioUsd : null;

  // Connected: on-chain ATAs for ALL mints in devnet-mock-mints (via allMockMints).
  // Disconnected: holdings stay empty; never render the mock allocation pie.
  const displayHoldings: Holding[] = connected ? predca.holdingsOnChain : [];

  const displayLastPurchase: Purchase | null = (() => {
    if (!connected || !onChainReady || !predca.lastPurchaseOnChain) {
      return null;
    }
    const lp = predca.lastPurchaseOnChain;
    return {
      date: lp.date,
      amountUsd: lp.amountUsd,
      tokens: lp.tokens,
      perTokenUsd: lp.perTokenUsd,
      signature: `run#${lp.runIndex}`,
    };
  })();

  async function handleGenerateRecommendations() {
    setRankError(null);
    setPurchaseMsg(null);
    setRankBusy(true);
    try {
      const productsResult = await fetchPrestocksProducts(
        predca.jupPrices.fetchedAt > 0 ? predca.jupPrices : undefined,
      );
      const result = await runRankingNow(productsResult);
      if (result.error && (!result.top3 || result.top3.length === 0)) {
        throw new Error(result.error);
      }
      setTop3(
        result.top3.slice(0, 3).map((r) => ({
          name: r.name,
          score: r.score,
          priceNow: r.token_price_usd,
          premiumPct: Number.isFinite(r.premium_pct) ? r.premium_pct : null,
          premiumSource: r.premium_source,
        })),
      );
      setTop3Title(top3TitleFromRank(result, locale));
      setTop3Subtitle(result.sourceLabel || null);
      setPremiumBasis(result.premiumBasis);
      setRankFlat(isFlatFallback(result));
      const notes: string[] = [];
      if (productsResult.dataSource === "snapshot") {
        notes.push(
          t("prestocks.snapshotDated", { date: PRESTOCKS_SNAPSHOT_DATE }),
        );
      } else if (productsResult.errorPl) {
        notes.push(productsResult.errorPl);
      }
      if (result.error) notes.push(result.error);
      if (notes.length) setRankError(notes.join(" "));
    } catch (e) {
      setRankError(e instanceof Error ? e.message : String(e));
    } finally {
      setRankBusy(false);
    }
  }

  function markPendingPurchase(): boolean {
    const sig = predca.pendingSignatureNow();
    if (!sig) return false;
    setPurchaseMsg(
      t("msg.purchasePending", { sig, url: explorerTxUrl(sig) }),
    );
    setPurchaseTone("pending");
    return true;
  }

  async function allowDuplicate(
    kind: "deposit" | "withdraw" | "buy",
    amount: number,
    acknowledged: boolean,
  ): Promise<boolean> {
    const rec = predca.unresolvedFor(kind);
    if (!rec) {
      if (dupWarn?.kind === kind) setDupWarn(null);
      return true;
    }
    const step = nextDuplicateStep({
      unresolvedSameFamily: true,
      recheckedVerdict: acknowledged ? "unresolved" : null,
      acknowledged,
    });
    if (step === "proceed") {
      setDupWarn(null);
      return true;
    }
    if (step === "warn") {
      setDupWarn({ kind, amount });
      return false;
    }
    const verdict = await predca.recheckUnresolved(rec.signature);
    if (verdict === "confirmed") return false;
    if (verdict === "unresolved") {
      setDupWarn({ kind, amount });
      return false;
    }
    setDupWarn(null);
    return true;
  }

  async function submitDeposit(acknowledged = false) {
    if (depositPresentation !== "enabled") return;
    if (predca.pendingSignatureNow()) return;
    if (!tryEnterDupCheck(dupCheckRef)) return;
    setDupChecking(true);
    try {
      const amt =
        ownerUsdcCap != null ? Math.min(depositAmt, ownerUsdcCap) : depositAmt;
      if (!(await allowDuplicate("deposit", amt, acknowledged))) return;
      await predca.depositUsdc(
        amt,
        predca.status === "no_config" ? purchaseAmount : undefined,
      );
    } finally {
      leaveDupCheck(dupCheckRef);
      setDupChecking(false);
    }
  }

  async function submitWithdraw(acknowledged = false) {
    if (withdrawPresentation !== "enabled") return;
    if (predca.pendingSignatureNow()) return;
    if (!tryEnterDupCheck(dupCheckRef)) return;
    setDupChecking(true);
    try {
      const amt =
        vaultUsdcCap != null ? Math.min(withdrawAmt, vaultUsdcCap) : withdrawAmt;
      if (!(await allowDuplicate("withdraw", amt, acknowledged))) return;
      await predca.withdrawUsdc(amt);
    } finally {
      leaveDupCheck(dupCheckRef);
      setDupChecking(false);
    }
  }

  function dupNotice(kind: "deposit" | "withdraw" | "buy", amount: number) {
    if (kind === "deposit" && depositPresentation === "disabled") return null;
    if (kind === "withdraw" && withdrawPresentation === "disabled") return null;
    if (dupWarn?.kind !== kind || dupWarn.amount !== amount) return null;
    if (!predca.unresolvedFor(kind)) return null;
    const action =
      kind === "withdraw"
        ? t("dup.action.withdraw")
        : kind === "buy"
          ? t("dup.action.buy")
          : t("dup.action.deposit");
    return (
      <div className="mt-2 rounded border border-[#fbbf2433] bg-[#fbbf2411] px-3 py-2 text-xs text-[#fbbf24]">
        <p>{t("dup.warn", { action, amount })}</p>
        <button
          type="button"
          disabled={dupChecking || predca.rechecking}
          onClick={() => {
            if (kind === "buy") void handlePurchase(true);
            else if (kind === "withdraw") void submitWithdraw(true);
            else void submitDeposit(true);
          }}
          className="mt-2 rounded border border-current px-2 py-1 text-[10px] uppercase tracking-wider disabled:opacity-40"
        >
          {t("dup.sendAnyway")}
        </button>
      </div>
    );
  }

  async function handlePurchase(acknowledged = false) {
    if (!tryEnterDupCheck(dupCheckRef)) return;
    setDupChecking(true);
    let allowed = false;
    try {
      const intendedPreview = resolvePurchaseAmount(predca.weeklyBudgetUsd, ownerBase58);
      allowed = await allowDuplicate("buy", intendedPreview, acknowledged);
    } finally {
      leaveDupCheck(dupCheckRef);
      setDupChecking(false);
    }
    if (!allowed) return;
    if (
      !tryEnterManualBuy(
        buyInFlightRef,
        predca.txPending || predca.pendingSignatureNow() != null,
      )
    ) {
      return;
    }
    setBuyInFlight(true);
    try {
      setPurchaseTone("ok");
      if (top3.length === 0) {
        setPurchaseMsg(t("msg.noRecs"));
        return;
      }

      const tokenNames = top3.slice(0, 3).map((r) => r.name);
      // LS is SoT for intended amount (sync on-chain before simulate_buy when dirty).
      const intendedAmount = resolvePurchaseAmount(predca.weeklyBudgetUsd, ownerBase58);

      // Prefer on-chain simulate_buy when Predca is ready.
      if (onChainReady) {
        if (
          availableVaultUsdc == null ||
          !Number.isFinite(availableVaultUsdc) ||
          availableVaultUsdc < intendedAmount
        ) {
          setPurchaseMsg(
            t("msg.vaultLowOnChain", {
              have: (availableVaultUsdc ?? 0).toFixed(2),
              need: intendedAmount.toFixed(2),
            }),
          );
          return;
        }

        // simulate_buy spends on-chain weeklyBudgetUsdc — sync LS → chain first.
        const lsAmount = readWeeklyBudgetUsd(DEFAULT_SETTINGS.weeklyAmountUsd, ownerBase58);
        if (budgetsDiffer(lsAmount, predca.weeklyBudgetUsd)) {
          setPurchaseMsg(t("msg.updatingBudget"));
          const budgetSig = await predca.setWeeklyBudget(lsAmount);
          if (!budgetSig) {
            if (markPendingPurchase()) return;
            const err = predca.lastTxError();
            if (err) {
              setPurchaseMsg(`${t("msg.budgetSyncFail")}: ${err}`);
              setPurchaseTone("fail");
            } else {
              setPurchaseMsg(null);
            }
            return;
          }
          // setWeeklyBudget's withTx already refreshed; simulateBuy re-fetches budget.
        }

        setPurchaseMsg(null);
        const sig = await predca.simulateBuy(tokenNames);
        if (sig) {
          setPurchaseTone("ok");
          setPurchaseMsg(
            t("msg.purchaseOk", {
              sig: sig.slice(0, 8),
              amount: intendedAmount.toFixed(2),
              tokens: tokenNames.join(" · "),
            }),
          );
        } else if (!markPendingPurchase()) {
          const err = predca.lastTxError();
          if (err) {
            setPurchaseMsg(`${t("msg.purchaseFail")}: ${err}`);
            setPurchaseTone("fail");
          }
        }
        return;
      }

      // Offline / disconnected mock path (localStorage).
      if (
        availableVaultUsdc == null ||
        !Number.isFinite(availableVaultUsdc) ||
        availableVaultUsdc < purchaseAmount
      ) {
        setPurchaseMsg(
          connected
            ? t("msg.predcaNotReady")
            : t("msg.vaultLowMock", {
                have: (availableVaultUsdc ?? 0).toFixed(2),
                need: purchaseAmount.toFixed(2),
              }),
        );
        return;
      }

      try {
        const next = applyPurchase(
          {
            balances,
            vaultUsdc: availableVaultUsdc,
            holdings,
            lastPurchase: lastPurchase ?? emptyPurchase(),
          },
          { amountUsd: purchaseAmount, tokens: tokenNames },
        );
        savePortfolioState(next);
        setBalances(next.balances);
        setVaultUsdc(next.vaultUsdc);
        setHoldings(next.holdings);
        setLastPurchase(next.lastPurchase);
        setPortfolioRevision((r) => r + 1);
        setPurchaseMsg(
          t("msg.purchaseOffline", {
            amount: purchaseAmount.toFixed(2),
            tokens: tokenNames.join(" · "),
          }),
        );
      } catch (error) {
        setPurchaseMsg(
          error instanceof Error ? error.message : t("msg.purchaseError"),
        );
      }
    } finally {
      leaveManualBuy(buyInFlightRef);
      setBuyInFlight(false);
    }
  }

  const depositPresentation = depositUi(predca.status, connected, !!predca.mint);
  const canDeposit = depositPresentation === "enabled";
  const ownerUsdcCap =
    displayOwnerUsdc != null && Number.isFinite(displayOwnerUsdc)
      ? displayOwnerUsdc
      : null;
  const vaultUsdcCap =
    onChainVaultUsdc != null && Number.isFinite(onChainVaultUsdc)
      ? onChainVaultUsdc
      : null;
  const depositOverCap =
    ownerUsdcCap != null &&
    Number.isFinite(depositAmt) &&
    depositAmt > ownerUsdcCap;
  const withdrawOverCap =
    vaultUsdcCap != null &&
    Number.isFinite(withdrawAmt) &&
    withdrawAmt > vaultUsdcCap;
  const depositDisabled =
    sigUnresolved ||
    predca.txPending ||
    dupChecking ||
    predca.rechecking ||
    !canDeposit ||
    !Number.isFinite(depositAmt) ||
    depositAmt <= 0 ||
    depositOverCap;
  const withdrawPresentation = withdrawUi(predca.status, predca.config != null);
  const withdrawDisabled =
    sigUnresolved ||
    predca.txPending ||
    dupChecking ||
    predca.rechecking ||
    !Number.isFinite(withdrawAmt) ||
    withdrawAmt <= 0 ||
    withdrawOverCap ||
    withdrawPresentation === "disabled";
  const showWithdraw = withdrawPresentation !== "hidden";
  const vaultTooLow =
    availableVaultUsdc == null ||
    !Number.isFinite(availableVaultUsdc) ||
    availableVaultUsdc < purchaseAmount;
  // Manual Buy must NOT disable because keeper/auto-buy phase is "buying".
  // Only this click, the user's own tx, missing recs, vault low, or not ready.
  const purchaseDisabled =
    sigUnresolved ||
    buyInFlight ||
    top3.length === 0 ||
    rankFlat ||
    predca.txPending ||
    (onChainReady
      ? vaultTooLow
      : connected
        ? true // connected but not ready → disable until ready
        : vaultTooLow);

  /** Why Purchase stays gray — shown next to the button (vault check kept). */
  const purchaseDisabledReason: string | null = (() => {
    if (!purchaseDisabled) return null;
    // The button label already says the buy is in flight. Do not claim vault-low.
    if (sigUnresolved || buyInFlight) return null;
    if (predca.txPending) return t("purchase.disabled.tx");
    if (predca.status === "error") return t("purchase.disabled.rpcError");
    if (rankFlat) return t("purchase.disabled.flatRanking");
    if (top3.length === 0) return t("purchase.disabled.noRecs");
    if (connected && !onChainReady) return t("purchase.disabled.notReady");
    if (vaultTooLow) {
      return t("purchase.disabled.vaultLow", {
        have: (availableVaultUsdc ?? 0).toFixed(2),
        need: purchaseAmount.toFixed(2),
      });
    }
    return t("purchase.disabled.generic");
  })();

  function fmtTile(value: number | null, digits = 2): string {
    if (value == null || !Number.isFinite(value)) return "—";
    return value.toLocaleString(locale === "en" ? "en-US" : "pl-PL", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function fmtPct(value: number): string {
    return `${value.toLocaleString(locale === "en" ? "en-US" : "pl-PL", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    })}%`;
  }

  function premiumText(name: string): string {
    const pct = livePremiumPct(name, predca.jupPrices);
    if (pct == null) return t("premium.noData");
    return t("premium.label", { pct: fmtPct(pct) });
  }

  const pricesReady = predca.jupPrices.fetchedAt > 0;
  const anyTokenPrice = Object.values(predca.jupPrices.quotes).some(
    (q) => q.usdPrice != null,
  );
  const priceClock = pricesReady
    ? fmtPriceClock(predca.jupPrices.fetchedAt, priceNow, locale)
    : "";
  const allAtCost =
    predca.positions.length > 0 &&
    predca.positions.every((row) => row.basis === "cost");

  const vaultStat =
    predca.status === "error" && predca.vaultUsdc != null
      ? predca.vaultUsdc
      : onChainVaultUsdc;

  const statusReason =
    predca.status === "loading"
      ? t("predca.status.loading")
      : predca.status === "no_mint"
        ? t("predca.status.no_mint")
        : predca.status === "disconnected"
          ? t("predca.status.disconnected")
          : t("predca.status.error");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a78bfa]">
            {t("overview.kicker")}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[#e8eef5]">
            {t("overview.title")}
          </h1>
        </div>
        {!connected && (
          <p className="text-xs text-[#8b95a8]">
            {t("overview.disconnectedHint", { cluster: clusterShortPl() })}
          </p>
        )}
        {connected && predca.status === "no_mint" && (
          <p className="text-xs text-[#fbbf24]">
            {t("overview.noMintHint")}
          </p>
        )}
        {connected && onChainReady && (
          <p className="text-xs text-[#2dd4bf]">
            {t("overview.onChainHint", { cluster: clusterShortPl() })}
          </p>
        )}
      </div>

      {/* On-chain Predca strip */}
      <section className="rounded-lg border border-[#2dd4bf33] bg-[#141820] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#2dd4bf]">
              {t("predca.title", { cluster: clusterShortPl() })}
            </h2>
            <p className="mt-0.5 text-[10px] text-[#8b95a8]">
              {t("predca.rpc")}{" "}
              <span className="mono-num text-[#c5cedb]">{rpcHost()}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {connected && publicKey && (
              <button
                type="button"
                onClick={() => void onClaimFaucet()}
                disabled={faucetBusy || predca.txPending || sigUnresolved}
                className="rounded border border-[#fbbf2444] bg-[#0c0e12] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#fbbf24] hover:bg-[#fbbf2411] disabled:opacity-40"
              >
                {faucetBusy ? t("faucet.busy") : t("faucet.button")}
              </button>
            )}
            <button
              type="button"
              onClick={() => void predca.refresh()}
              disabled={!connected || predca.loading}
              className="rounded border border-[#1e2633] px-2 py-1 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5] disabled:opacity-40"
            >
              {predca.loading ? t("predca.loading") : t("predca.refresh")}
            </button>
          </div>
        </div>
        {(faucetMsg || faucetErr) && (
          <div className="mb-3 space-y-1">
            {faucetMsg && (
              <p className="text-[10px] text-[#2dd4bf]">{faucetMsg}</p>
            )}
            {faucetErr && (
              <p className="text-[10px] text-[#f87171]">{faucetErr}</p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t("predca.budget")}
            value={
              budgetDirty
                ? formatUsd(purchaseAmount)
                : predca.weeklyBudgetUsd != null
                  ? formatUsd(predca.weeklyBudgetUsd)
                  : predca.status === "no_config"
                    ? formatUsd(purchaseAmount)
                    : "—"
            }
            unit={
              budgetDirty && predca.weeklyBudgetUsd != null
                ? `USDC · chain ${formatUsd(predca.weeklyBudgetUsd)}`
                : "USDC"
            }
          />
          <Stat
            label={t("predca.vault")}
            value={vaultStat != null ? formatUsd(vaultStat) : "—"}
            unit={
              predca.status === "error" && predca.vaultUsdc != null
                ? `USDC · ${t("overview.rpcStale")}`
                : "USDC"
            }
          />
          {depositPresentation !== "hidden" && (
            <div
              className="rounded border border-[#1e2633] bg-[#0c0e12] p-3"
              title={
                depositPresentation === "disabled"
                  ? t("predca.rpcActionHint")
                  : undefined
              }
            >
              <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                {t("predca.depositTitle")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <input
                  type="number"
                  min={0.000001}
                  step={1}
                  max={ownerUsdcCap ?? undefined}
                  value={depositAmt}
                  onChange={(e) => {
                    if (dupWarn?.kind === "deposit") setDupWarn(null);
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) {
                      setDepositAmt(n);
                      return;
                    }
                    if (ownerUsdcCap != null && n > ownerUsdcCap) {
                      setDepositAmt(ownerUsdcCap);
                      return;
                    }
                    setDepositAmt(n);
                  }}
                  disabled={predca.txPending || sigUnresolved || !canDeposit}
                  className="mono-num min-w-0 flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 text-sm text-[#2dd4bf] outline-none focus:border-[#2dd4bf66] disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={depositDisabled}
                  onClick={() => {
                    void submitDeposit(false);
                  }}
                  className="rounded border border-[#2dd4bf44] bg-[#0c0e12] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
                >
                  {t("predca.deposit")}
                </button>
              </div>
              {depositPresentation === "disabled" ? (
                <p className="mt-2 text-[10px] text-[#8b95a8]">
                  {t("predca.rpcActionHint")}
                </p>
              ) : null}
              {dupNotice("deposit", ownerUsdcCap != null ? Math.min(depositAmt, ownerUsdcCap) : depositAmt)}
            </div>
          )}
          {showWithdraw && (
            <div
              className="rounded border border-[#1e2633] bg-[#0c0e12] p-3"
              title={
                withdrawPresentation === "disabled"
                  ? t("predca.rpcActionHint")
                  : undefined
              }
            >
              <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                {t("predca.withdrawTitle")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <input
                  type="number"
                  min={0.000001}
                  step={1}
                  max={vaultUsdcCap ?? undefined}
                  value={withdrawAmt}
                  onChange={(e) => {
                    if (dupWarn?.kind === "withdraw") setDupWarn(null);
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) {
                      setWithdrawAmt(n);
                      return;
                    }
                    if (vaultUsdcCap != null && n > vaultUsdcCap) {
                      setWithdrawAmt(vaultUsdcCap);
                      return;
                    }
                    setWithdrawAmt(n);
                  }}
                  disabled={
                    predca.txPending ||
                    sigUnresolved ||
                    withdrawPresentation === "disabled"
                  }
                  className="mono-num min-w-0 flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 text-sm text-[#a78bfa] outline-none focus:border-[#a78bfa66] disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={withdrawDisabled}
                  onClick={() => {
                    void submitWithdraw(false);
                  }}
                  className="rounded border border-[#a78bfa44] bg-[#0c0e12] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#a78bfa] hover:bg-[#a78bfa11] disabled:opacity-40"
                >
                  {t("predca.withdraw")}
                </button>
              </div>
              {withdrawPresentation === "disabled" ? (
                <p className="mt-2 text-[10px] text-[#8b95a8]">
                  {t("predca.rpcActionHint")}
                </p>
              ) : null}
              {dupNotice(
                "withdraw",
                vaultUsdcCap != null ? Math.min(withdrawAmt, vaultUsdcCap) : withdrawAmt,
              )}
            </div>
          )}
        </div>

        {canDeposit && (
          <div className="mt-2 space-y-1">
            {predca.ownerUsdc == null && (
              <p className="text-[10px] text-[#fbbf24]">
                {t("predca.hintNoAta", { mint: predca.mintHint })}
              </p>
            )}
            {predca.ownerUsdc != null && predca.ownerUsdc <= 0 && (
              <p className="text-[10px] text-[#fbbf24]">
                {t("predca.hintZeroUsdc", { mint: predca.mintHint })}
              </p>
            )}
            {depositOverCap && ownerUsdcCap != null && (
              <p className="text-[10px] text-[#fbbf24]">
                {t("overview.maxDepositHint", {
                  amount: formatUsd(ownerUsdcCap),
                })}
              </p>
            )}
            {withdrawOverCap && vaultUsdcCap != null && (
              <p className="text-[10px] text-[#fbbf24]">
                {t("overview.maxWithdrawHint", {
                  amount: formatUsd(vaultUsdcCap),
                })}
              </p>
            )}
          </div>
        )}

        {connected && predca.mint && (
          <p className="mt-2 text-[10px] text-[#8b95a8]">
            {t("predca.mintLabel")}{" "}
            <span className="mono-num text-[#c5cedb]">
              {predca.mint.toBase58()}
            </span>
            {predca.ownerUsdc == null && (
              <> {t("predca.mintNoAta")}</>
            )}
          </p>
        )}

        {predca.sessionCheckMsg ? (
          <TxNotice message={predca.sessionCheckMsg} tone="pending" className="mt-3" />
        ) : null}
        {predca.visibleUnresolvedTxs.slice(0, 2).map((rec) => (
          <TxNotice
            key={rec.signature}
            message={`${UNRESOLVED_MSG} ${rec.signature} ${explorerTxUrl(rec.signature)}`}
            tone="pending"
            className="mt-3"
            action={{
              label: predca.rechecking ? t("tx.rechecking") : t("tx.recheck"),
              disabled: predca.rechecking,
              onClick: () => {
                void predca.recheckUnresolved(rec.signature);
              },
            }}
          />
        ))}
        {predca.visibleUnresolvedTxs.length > 2 ? (
          <p className="mt-1 text-[10px] text-[#fbbf24]">
            +{predca.visibleUnresolvedTxs.length - 2}
          </p>
        ) : null}
        {predca.pendingMsg && (
          <TxNotice message={predca.pendingMsg} tone="pending" className="mt-3" />
        )}
        {predca.status === "error" && predca.rpcError ? (
          <TxNotice message={predca.rpcError} tone="error" className="mt-3" />
        ) : null}
        {predca.error && (
          <TxNotice message={predca.error} tone="error" className="mt-3" />
        )}
        {predca.okMsg && (
          <p className="mt-3 rounded border border-[#2dd4bf33] bg-[#2dd4bf11] px-3 py-2 text-xs text-[#2dd4bf]">
            {predca.okMsg}
          </p>
        )}

        {connected && predca.status === "no_config" && canDeposit && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#1e2633] pt-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                {t("predca.initBudget")}
              </span>
              <p className="mono-num text-sm text-[#2dd4bf]">
                {formatUsd(purchaseAmount)}{" "}
                <span className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                  USDC
                </span>
              </p>
            </div>
            <p className="w-full text-[10px] text-[#fbbf24]">
              {t("predca.initHint")}
            </p>
            <p className="w-full text-[10px] text-[#8b95a8]">
              {t("predca.rentHint")}
            </p>
          </div>
        )}

        {connected &&
          predca.status !== "ready" &&
          predca.status !== "no_config" &&
          predca.status !== "error" &&
          !canDeposit && (
          <p className="mt-4 border-t border-[#1e2633] pt-4 text-[10px] text-[#8b95a8]">
            {t("predca.depositUnavailable", { reason: statusReason })}
          </p>
        )}

        {predca.lastRun && (
          <div className="mt-4 border-t border-[#1e2633] pt-4 text-xs text-[#8b95a8]">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-[#a78bfa]">
              {t("predca.lastRun")}
            </p>
            <ul className="grid gap-1 sm:grid-cols-3">
              {predca.lastRun.mints.map((m, i) => (
                <li
                  key={i}
                  className="rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 mono-num"
                >
                  {shortPk(m)} ·{" "}
                  {formatUsd(rawToDollars(predca.lastRun!.amounts[i]))} USDC
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: t("tile.sol"),
            value: fmtTile(displaySol, 4),
            unit: "SOL",
          },
          {
            label: t("tile.usdcWallet"),
            value: fmtTile(displayOwnerUsdc),
            unit: "USDC",
          },
          {
            label: t("tile.portfolioPreStock"),
            value: fmtTile(displayPortfolioUsd, 0),
            unit: "USD",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-[#1e2633] bg-[#141820] p-4 shadow-[inset_0_1px_0_#2dd4bf11]"
          >
            <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
              {c.label}
            </p>
            <p className="mono-num mt-2 text-2xl text-[#2dd4bf]">
              {c.value}
              <span className="ml-1 text-xs text-[#8b95a8]">{c.unit}</span>
            </p>
          </div>
        ))}
      </div>
      {connected && (
        <div className="space-y-1 text-[10px] text-[#8b95a8]">
          <p>{t("tile.portfolioHint")}</p>
          {pricesReady && <p>{t("prices.source")}</p>}
          {pricesReady && predca.jupPrices.source === "cache" && (
            <p>{t("prices.stale", { time: priceClock })}</p>
          )}
          {pricesReady && !predca.pricesLoading && !anyTokenPrice && (
            <p>{t("prices.unavailable")}</p>
          )}
          {allAtCost &&
            !(connected && predca.positions.length > 0 && !pnlSummary(predca.positions).hasPriced) && (
              <p>{t("positions.legacyHint")}</p>
            )}
        </div>
      )}

      <PricesPanel
        prices={predca.jupPrices}
        pricesLoading={predca.pricesLoading}
        pricesReady={pricesReady}
        locale={locale}
        clock={priceClock}
        onRefresh={() => {
          setPriceNow(Date.now());
          void predca.refreshPrices();
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <section className="rounded-lg border border-[#1e2633] bg-[#141820] p-5 lg:h-full">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
            {connected
              ? t("holdings.titleOnChain")
              : t("holdings.titleOffline")}
          </h2>
          {displayHoldings.length === 0 ? (
            <p className="text-xs text-[#8b95a8]">
              {connected
                ? t("holdings.emptyConnected")
                : t("holdings.empty")}
            </p>
          ) : (
            <HoldingsPie holdings={displayHoldings} />
          )}
        </section>

        <div className="flex min-h-0 flex-col gap-4 lg:h-full">
          <section className="rounded-lg border border-[#1e2633] bg-[#141820] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
                  {top3Title ?? t("top3.title")}
                </h2>
                {top3Subtitle ? (
                  <p className="mt-0.5 text-[10px] normal-case tracking-normal text-[#8b95a8]">
                    {top3Subtitle}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleGenerateRecommendations()}
                  disabled={rankBusy}
                  className="rounded border border-[#a78bfa44] bg-[#0c0e12] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#a78bfa] hover:bg-[#a78bfa11] disabled:opacity-40"
                >
                  {rankBusy ? t("btn.generating") : t("btn.generate")}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePurchase(false)}
                  disabled={
                    purchaseDisabled ||
                    predca.txPending ||
                    buyInFlight ||
                    sigUnresolved ||
                    dupChecking ||
                    predca.rechecking
                  }
                  className="rounded border border-[#2dd4bf66] bg-[#0c0e12] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
                >
                  {buyInFlight
                    ? t("btn.buying")
                    : sigUnresolved
                      ? t("btn.waiting")
                      : predca.txPending
                        ? t("btn.txPending")
                        : t("btn.purchase")}
                </button>
              </div>
            </div>
            <ol className="space-y-2">
              {top3.length === 0 && (
                <li className="rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm text-[#8b95a8]">
                  {connected
                    ? t("empty.generateTips")
                    : t("empty.connectWallet")}
                </li>
              )}
              {top3.map((r, i) => (
                <li
                  key={`${r.name}-${i}`}
                  className="rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 text-sm">
                      <span className="mono-num text-[#2dd4bf]">#{i + 1}</span>
                      {r.name}
                    </span>
                    <span className="mono-num text-sm text-[#a78bfa]">
                      {r.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-[#8b95a8]">
                    <span className="mono-num">
                      {t("positions.col.price")}{" "}
                      {fmtUsdAmount(
                        quoteByName(predca.jupPrices.quotes, r.name)?.usdPrice ??
                          r.priceNow,
                        locale,
                      ) ?? t("positions.noData")}
                    </span>
                    {" · "}
                    {premiumText(r.name)}
                  </p>
                </li>
              ))}
            </ol>
            {premiumBasis ? (
              <p className="mt-3 text-[10px] normal-case leading-relaxed tracking-normal text-[#8b95a8]">
                {t(`rank.premiumBasis.${premiumBasis}`)}
              </p>
            ) : null}
            {rankError && (
              <p className="mt-3 text-xs text-[#f87171]">{rankError}</p>
            )}
            {purchaseDisabledReason && !purchaseMsg && (
              <p className="mt-3 rounded border border-[#fbbf2433] bg-[#fbbf2411] px-3 py-2 text-xs text-[#fbbf24]">
                {purchaseDisabledReason}
              </p>
            )}
            {dupNotice("buy", resolvePurchaseAmount(predca.weeklyBudgetUsd, ownerBase58))}
            {purchaseMsg && (
              <p
                className={`mt-3 break-all rounded border px-3 py-2 text-xs ${
                  purchaseTone === "pending"
                    ? "border-[#fbbf2433] bg-[#fbbf2411] text-[#fbbf24]"
                    : /nieudany|failed|Could not|Nie udało/i.test(purchaseMsg)
                      ? "border-[#f8717133] bg-[#f8717111] text-[#fca5a5]"
                      : "border-[#2dd4bf33] bg-[#2dd4bf11] text-[#2dd4bf]"
                }`}
              >
                {txMessageWithLink(purchaseMsg)}
              </p>
            )}
          </section>

          <section className="relative flex min-h-[11rem] flex-1 flex-col rounded-lg border border-[#1e2633] bg-[#141820] p-5">
            <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
              {connected && onChainReady
                ? t("lastPurchase.titleOnChain")
                : connected
                  ? t("lastPurchase.titleConnected")
                  : t("lastPurchase.titleOffline")}
            </h2>
            <div className="flex-1 space-y-1 text-sm pb-5" key={portfolioRevision}>
              {!displayLastPurchase || displayLastPurchase.tokens.length === 0 ? (
                <p className="text-[#8b95a8]">
                  {connected
                    ? t("lastPurchase.emptyConnected")
                    : t("lastPurchase.empty")}
                </p>
              ) : (
                <>
                  <p>
                    <span className="text-[#8b95a8]">{t("lastPurchase.date")} </span>
                    <span className="mono-num">{displayLastPurchase.date}</span>
                  </p>
                  <p>
                    <span className="text-[#8b95a8]">{t("lastPurchase.budget")} </span>
                    <span className="mono-num text-[#2dd4bf]">
                      ${displayLastPurchase.amountUsd.toFixed(2)}
                    </span>
                    <span className="text-[#8b95a8]">
                      {" "}
                      {t("lastPurchase.perToken", {
                        amount: Number(displayLastPurchase.perTokenUsd).toFixed(2),
                      })}
                    </span>
                  </p>
                  <p>
                    <span className="text-[#8b95a8]">{t("lastPurchase.bought")} </span>
                    {displayLastPurchase.tokens.join(" · ")}
                  </p>
                </>
              )}
            </div>
            <span
              className="pointer-events-none absolute bottom-2 right-3 mono-num text-[10px] tabular-nums text-[#5c6578]"
              title="PreStocks DCA Noir"
            >
              v{APP_VERSION}
            </span>
          </section>
        </div>
      </div>

      {connected && predca.positions.length > 0 && (
        <>
          <PnlSection rows={predca.positions} locale={locale} />
          <PositionsCard
            rows={predca.positions}
            prices={predca.jupPrices}
            fmt={fmtTile}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}

function statusLabel(
  flag: PriceRowFlag,
  t: (key: string, vars?: Record<string, string | number>) => string,
  clock: string,
): string {
  if (flag === "cache") return t("prices.lastRead", { time: clock });
  if (flag === "no-data") return t("positions.noData");
  if (flag === "suspect") return t("prices.suspect");
  if (flag === "low-liquidity") return t("prices.lowLiquidity");
  return t("prices.multiplier");
}

function PricesPanel({
  prices,
  pricesLoading,
  pricesReady,
  locale,
  clock,
  onRefresh,
}: {
  prices: JupPrices;
  pricesLoading: boolean;
  pricesReady: boolean;
  locale: string;
  clock: string;
  onRefresh: () => void;
}) {
  const { t } = useI18n();
  const loading = !pricesReady;
  const rows = priceRows(prices.quotes, prices.fetchedAt, prices);
  return (
    <section className="rounded-lg border border-[#1e2633] bg-[#141820] p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
          {t("prices.panelTitle")}
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={pricesLoading}
          title={t("prices.refresh")}
          aria-label={t("prices.refresh")}
          className="rounded border border-[#1e2633] px-2 py-1 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5] disabled:opacity-40"
        >
          ↻
        </button>
      </div>
      {loading ? (
        <p className="text-xs text-[#8b95a8]">{t("prices.loading")}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                  <th className="py-1 pr-3 font-medium">{t("prices.col.company")}</th>
                  <th className="py-1 pr-3 font-medium">{t("prices.col.price")}</th>
                  <th className="py-1 pr-3 font-medium">{t("prices.col.premium")}</th>
                  <th className="hidden py-1 font-medium sm:table-cell">
                    {t("prices.col.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const renderBadges = () =>
                    row.flags.map((flag) => (
                      <Badge key={flag}>{statusLabel(flag, t, clock)}</Badge>
                    ));
                  return (
                    <tr key={row.name} className="border-t border-[#1e2633] align-top">
                      <td className="py-2 pr-3 text-[#c5cedb]">
                        <div>{row.name}</div>
                        {row.flags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 sm:hidden">{renderBadges()}</div>
                        )}
                      </td>
                      <td className="mono-num py-2 pr-3">
                        {fmtUsdAmount(row.usdPrice, locale) ?? t("positions.noData")}
                      </td>
                      <td className="mono-num py-2 pr-3">
                        {row.premiumPct != null ? fmtPanelPct(row.premiumPct, locale) : t("positions.noData")}
                      </td>
                      <td className="hidden py-2 sm:table-cell">
                        {row.flags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">{renderBadges()}</div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-[#8b95a8]">{t("prices.source")}</p>
        </>
      )}
    </section>
  );
}

function fmtPanelPct(value: number, locale: string): string {
  return `${value.toLocaleString(locale === "en" ? "en-US" : "pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  })}%`;
}

function PnlSection({ rows, locale }: { rows: PositionRow[]; locale: string }) {
  const { t } = useI18n();
  const summary = pnlSummary(rows);
  const pnl = summary.pnlUsd;
  const pos = pnl != null && pnl > 0;
  const neg = pnl != null && pnl < 0;
  const pnlClass = pos ? "text-[#34d399]" : neg ? "text-[#f87171]" : "text-[#8b95a8]";
  const money = summary.hasPriced ? fmtSignedPnl(pnl, summary.pnlPct, locale) : null;
  const atCost = fmtUsdAmount(summary.unpricedCostUsd, locale);
  return (
    <section className="rounded-lg border border-[#1e2633] bg-[#141820] p-5">
      <h2 className="mb-2 text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
        {t("pnl.title")}
      </h2>
      {money ? (
        <p className={`mono-num text-lg ${pnlClass}`}>
          {t("pnl.total")} {money}
        </p>
      ) : (
        <p className="mono-num text-sm text-[#c5cedb]">
          {t("pnl.atCostValue", { value: atCost ?? t("positions.noData") })}
        </p>
      )}
      {summary.hasUnpricedV2 && (
        <p className="mt-1 text-[10px] text-[#8b95a8]">{t("pnl.noPriceNote")}</p>
      )}
      {!summary.hasPriced && summary.hasLegacy && (
        <p className="mt-1 text-[10px] text-[#8b95a8]">{t("pnl.legacyNote")}</p>
      )}
      {summary.hasPriced && summary.hasLegacy && (
        <p className="mt-1 text-[10px] text-[#8b95a8]">{t("pnl.partialNote")}</p>
      )}
    </section>
  );
}

function PositionsCard({
  rows,
  prices,
  fmt,
  locale,
}: {
  rows: PositionRow[];
  prices: JupPrices;
  fmt: (value: number | null, digits?: number) => string;
  locale: string;
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-lg border border-[#1e2633] bg-[#141820] p-5">
      <h2 className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#a78bfa]">
        {t("positions.title")}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
              <th className="py-1 pr-3 font-medium">{t("positions.col.asset")}</th>
              <th className="hidden py-1 pr-3 font-medium sm:table-cell">
                {t("positions.col.units")}
              </th>
              <th className="py-1 pr-3 font-medium">{t("positions.col.price")}</th>
              <th className="py-1 pr-3 font-medium">{t("positions.col.value")}</th>
              <th className="hidden py-1 pr-3 font-medium sm:table-cell">
                {t("positions.col.avgBuy")}
              </th>
              <th className="py-1 font-medium">{t("positions.col.pnl")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const quote = quoteByName(prices.quotes, row.name);
              const suspect = prices.suspect.some(
                (name) => canonicalName(name) === canonicalName(row.name),
              );
              const pnlPos = row.pnlUsd != null && row.pnlUsd > 0;
              const pnlNeg = row.pnlUsd != null && row.pnlUsd < 0;
              let pnlClass = "text-[#8b95a8]";
              if (pnlPos) pnlClass = "text-[#34d399]";
              else if (pnlNeg) pnlClass = "text-[#f87171]";
              const lowLiq = Boolean(quote && isLowLiquidity(quote));
              const showBadges =
                row.basis === "cost" || suspect || lowLiq || Boolean(quote?.multiplierChange);
              return (
                <tr key={row.name} className="border-t border-[#1e2633] align-top">
                  <td className="py-2 pr-3 text-[#c5cedb]">
                    <div>{row.name}</div>
                    {showBadges && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {row.basis === "cost" && (
                          <Badge>{t("positions.atCost")}</Badge>
                        )}
                        {suspect && <Badge>{t("prices.suspect")}</Badge>}
                        {lowLiq && <Badge>{t("prices.lowLiquidity")}</Badge>}
                        {quote?.multiplierChange && (
                          <Badge>{t("prices.multiplier")}</Badge>
                        )}
                      </div>
                    )}
                    {row.mismatch && (
                      <p className="mt-1 text-[10px] text-[#fbbf24]">
                        {t("positions.mismatch")}
                      </p>
                    )}
                  </td>
                  <td className="mono-num hidden py-2 pr-3 sm:table-cell">
                    {fmt(row.units, 4)}
                  </td>
                  <td className="mono-num py-2 pr-3">
                    {fmtUsdAmount(row.priceNow, locale) ?? t("positions.noData")}
                  </td>
                  <td className="mono-num py-2 pr-3 text-[#2dd4bf]">
                    {fmtUsdAmount(row.valueUsd, locale) ?? t("positions.noData")}
                  </td>
                  <td className="mono-num hidden py-2 pr-3 sm:table-cell">
                    {fmtUsdAmount(row.avgBuyPrice, locale) ?? "—"}
                  </td>
                  <td className={`mono-num py-2 ${pnlClass}`}>
                    {positionPnlKind(row) === "legacy" ? (
                      <span title={t("pnl.legacyNote")}>—</span>
                    ) : positionPnlKind(row) === "nodata" ? (
                      t("positions.noData")
                    ) : (
                      fmtSignedPnl(row.pnlUsd, row.pnlPct, locale)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded border border-[#fbbf2444] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#fbbf24]">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded border border-[#1e2633] bg-[#0c0e12] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
        {label}
      </p>
      <p className="mono-num mt-1 text-lg text-[#e8eef5]">
        {value}
        {unit ? (
          <span className="ml-1 text-[10px] text-[#8b95a8]">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
