"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { claimFaucetUsdc } from "@/lib/dca-api";
import { HoldingsPie } from "./HoldingsPie";
import {
  DEFAULT_SETTINGS,
  HOLDINGS,
  LAST_PURCHASE,
  MOCK_BALANCES,
  MOCK_VAULT_USDC,
  type Holding,
  type JevRank,
  type Purchase,
} from "@/lib/mock-data";
import {
  applyPurchase,
  loadPortfolioState,
  savePortfolioState,
  type PortfolioBalances,
} from "@/lib/portfolio-state";
import { usePredca } from "@/lib/hooks/usePredca";
import {
  clusterShortPl,
  formatUsd,
  rawToDollars,
  rpcHost,
  shortPk,
} from "@/lib/predca";
import { fetchPrestocksProducts } from "@/lib/prestocks";
import { runRankingNow } from "@/lib/ranking";
import { useI18n } from "@/lib/i18n";
import { APP_VERSION } from "@/lib/app-version";
import type { RankResult } from "@/lib/universe";

/** Short Top-3 h2 from RankResult.mode — never claim live Jev for metrics. */
function top3TitleFromRank(result: RankResult, locale: string): string {
  const grok =
    /grok/i.test(result.sourceLabel || "") ||
    (result.pipeline || []).some((p) => /grok/i.test(p));
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

function resolvePurchaseAmount(weeklyBudgetUsd: number | null): number {
  if (weeklyBudgetUsd != null) return weeklyBudgetUsd;

  const savedBudget =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("predca_weekly_budget_usd");
  const savedAmount = savedBudget
    ? Number(savedBudget.trim().replace(",", "."))
    : NaN;
  return Number.isFinite(savedAmount) && savedAmount > 0
    ? savedAmount
    : DEFAULT_SETTINGS.weeklyAmountUsd;
}

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
  const [initBudget, setInitBudget] = useState(150);
  const [depositAmt, setDepositAmt] = useState(50);
  const [withdrawAmt, setWithdrawAmt] = useState(10);
  const [top3, setTop3] = useState<JevRank[]>([]);
  const [top3Title, setTop3Title] = useState<string | null>(null);
  const [top3Subtitle, setTop3Subtitle] = useState<string | null>(null);
  const [rankBusy, setRankBusy] = useState(false);
  const [rankError, setRankError] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);
  const [faucetBusy, setFaucetBusy] = useState(false);
  const [faucetMsg, setFaucetMsg] = useState<string | null>(null);
  const [faucetErr, setFaucetErr] = useState<string | null>(null);

  async function onClaimFaucet() {
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

  const purchaseAmount = resolvePurchaseAmount(predca.weeklyBudgetUsd);
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
  // Disconnected: local mock HOLDINGS / portfolio-state only (never as connected primary).
  const displayHoldings: Holding[] = connected
    ? predca.holdingsOnChain
    : holdings.length > 0
      ? holdings
      : HOLDINGS;

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
      const productsResult = await fetchPrestocksProducts();
      const result = await runRankingNow(productsResult);
      if (result.error && (!result.top3 || result.top3.length === 0)) {
        throw new Error(result.error);
      }
      setTop3(
        result.top3.slice(0, 3).map((r) => ({
          name: r.name,
          score: r.score,
        })),
      );
      setTop3Title(top3TitleFromRank(result, locale));
      setTop3Subtitle(result.sourceLabel || null);
      if (result.error) {
        setRankError(result.error);
      }
    } catch (e) {
      setRankError(e instanceof Error ? e.message : String(e));
    } finally {
      setRankBusy(false);
    }
  }

  async function handlePurchase() {
    if (top3.length === 0) {
      setPurchaseMsg(t("msg.noRecs"));
      return;
    }

    const tokenNames = top3.slice(0, 3).map((r) => r.name);

    // Prefer on-chain simulate_buy when Predca is ready.
    if (onChainReady) {
      if (
        availableVaultUsdc == null ||
        !Number.isFinite(availableVaultUsdc) ||
        availableVaultUsdc < purchaseAmount
      ) {
        setPurchaseMsg(
          t("msg.vaultLowOnChain", {
            have: (availableVaultUsdc ?? 0).toFixed(2),
            need: purchaseAmount.toFixed(2),
          }),
        );
        return;
      }
      setPurchaseMsg(null);
      const sig = await predca.simulateBuy(tokenNames);
      if (sig) {
        setPurchaseMsg(
          t("msg.purchaseOk", {
            sig: sig.slice(0, 8),
            amount: purchaseAmount.toFixed(2),
            tokens: tokenNames.join(" · "),
          }),
        );
      } else {
        setPurchaseMsg(t("msg.purchaseFail"));
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
  }

  const depositDisabled = predca.txPending || predca.status !== "ready";
  const vaultTooLow =
    availableVaultUsdc == null ||
    !Number.isFinite(availableVaultUsdc) ||
    availableVaultUsdc < purchaseAmount;
  // Manual Buy must NOT disable because keeper/auto-buy phase is "buying".
  // Only user's own txPending / missing recs / vault low / not ready.
  const purchaseDisabled =
    top3.length === 0 ||
    predca.txPending ||
    (onChainReady
      ? vaultTooLow
      : connected
        ? true // connected but not ready → disable until ready
        : vaultTooLow);

  /** Why Purchase stays gray — shown next to the button (vault check kept). */
  const purchaseDisabledReason: string | null = (() => {
    if (!purchaseDisabled) return null;
    if (predca.txPending) return t("purchase.disabled.tx");
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
                disabled={faucetBusy || predca.txPending}
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
              predca.weeklyBudgetUsd != null
                ? formatUsd(predca.weeklyBudgetUsd)
                : "—"
            }
            unit="USDC"
          />
          <Stat
            label={t("predca.vault")}
            value={
              onChainVaultUsdc != null ? formatUsd(onChainVaultUsdc) : "—"
            }
            unit="USDC"
          />
          {onChainReady && (
            <>
              <div className="rounded border border-[#1e2633] bg-[#0c0e12] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                  {t("predca.deposit")}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <input
                    type="number"
                    min={0.000001}
                    step={1}
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(Number(e.target.value))}
                    disabled={depositDisabled}
                    className="mono-num min-w-0 flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 text-sm text-[#2dd4bf] outline-none focus:border-[#2dd4bf66] disabled:opacity-40"
                  />
                  <button
                    type="button"
                    disabled={depositDisabled}
                    onClick={() => void predca.depositUsdc(depositAmt)}
                    className="rounded border border-[#2dd4bf44] bg-[#0c0e12] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
                  >
                    {t("predca.deposit")}
                  </button>
                </div>
              </div>
              <div className="rounded border border-[#1e2633] bg-[#0c0e12] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                  {t("predca.withdraw")}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <input
                    type="number"
                    min={0.000001}
                    step={1}
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(Number(e.target.value))}
                    disabled={predca.txPending}
                    className="mono-num min-w-0 flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 text-sm text-[#a78bfa] outline-none focus:border-[#a78bfa66] disabled:opacity-40"
                  />
                  <button
                    type="button"
                    disabled={predca.txPending}
                    onClick={() => void predca.withdrawUsdc(withdrawAmt)}
                    className="rounded border border-[#a78bfa44] bg-[#0c0e12] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#a78bfa] hover:bg-[#a78bfa11] disabled:opacity-40"
                  >
                    {t("predca.withdraw")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {onChainReady && (
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

        {predca.error && (
          <p className="mt-3 rounded border border-[#f8717133] bg-[#f8717111] px-3 py-2 text-xs text-[#fca5a5]">
            {predca.error}
          </p>
        )}
        {predca.okMsg && (
          <p className="mt-3 rounded border border-[#2dd4bf33] bg-[#2dd4bf11] px-3 py-2 text-xs text-[#2dd4bf]">
            {predca.okMsg}
          </p>
        )}

        {connected && predca.status === "no_config" && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#1e2633] pt-4">
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#8b95a8]">
                {t("predca.initBudget")}
              </span>
              <input
                type="number"
                min={1}
                step={10}
                value={initBudget}
                onChange={(e) => setInitBudget(Number(e.target.value))}
                className="mono-num block w-36 rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm text-[#2dd4bf] outline-none focus:border-[#2dd4bf66]"
              />
            </label>
            <button
              type="button"
              disabled={predca.txPending || !predca.mint}
              onClick={() => void predca.initializeUser(initBudget)}
              className="rounded border border-[#2dd4bf44] bg-[#0c0e12] px-4 py-2 text-xs uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
            >
              {predca.txPending ? t("predca.waiting") : t("predca.initialize")}
            </button>
            <p className="w-full text-[10px] text-[#fbbf24]">
              {t("predca.initHint")}
            </p>
          </div>
        )}

        {connected && predca.status !== "ready" && predca.status !== "no_config" && (
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
        <p className="text-[10px] text-[#8b95a8]">
          {t("tile.portfolioHint")}
        </p>
      )}

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
                  onClick={() => void handlePurchase()}
                  disabled={purchaseDisabled}
                  className="rounded border border-[#2dd4bf66] bg-[#0c0e12] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
                >
                  {predca.txPending ? t("btn.txPending") : t("btn.purchase")}
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
                  className="flex items-center justify-between rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <span className="mono-num text-[#2dd4bf]">#{i + 1}</span>
                    {r.name}
                  </span>
                  <span className="mono-num text-sm text-[#a78bfa]">
                    {r.score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ol>
            {rankError && (
              <p className="mt-3 text-xs text-[#f87171]">{rankError}</p>
            )}
            {purchaseDisabledReason && !purchaseMsg && (
              <p className="mt-3 rounded border border-[#fbbf2433] bg-[#fbbf2411] px-3 py-2 text-xs text-[#fbbf24]">
                {purchaseDisabledReason}
              </p>
            )}
            {purchaseMsg && (
              <p className="mt-3 rounded border border-[#2dd4bf33] bg-[#2dd4bf11] px-3 py-2 text-xs text-[#2dd4bf]">
                {purchaseMsg}
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
    </div>
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
