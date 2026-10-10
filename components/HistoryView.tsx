"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { nameByMint } from "@/lib/devnet-mock-mints";
import { usePredca } from "@/lib/hooks/usePredca";
import { TxNotice } from "@/components/TxNotice";
import {
  clusterShortPl,
  formatTs,
  formatUsd,
  rawToDollars,
  shortPk,
  type RunRecordData,
} from "@/lib/predca";
import { fmtSignedPnl, fmtUsdAmount } from "@/lib/format-usd";
import { runPnl } from "@/lib/position-value";
import { useI18n } from "@/lib/i18n";

function mintLabel(mint: RunRecordData["mints"][number]): string {
  const named = nameByMint(mint);
  if (named) return named;
  return shortPk(mint, 6);
}

function runBudgetUsd(run: RunRecordData): number {
  return run.amounts.reduce((s, a) => s + rawToDollars(a), 0);
}

function fmtUnits(n: number): string {
  return n.toLocaleString("pl-PL", { maximumFractionDigits: 6 });
}

export function HistoryView() {
  const { connected } = useWallet();
  const predca = usePredca();
  const { t, locale } = useI18n();
  const ready = connected && predca.status === "ready";
  const loading = connected && predca.loading && predca.status === "loading";
  const hasRuns = ready && predca.runs.length > 0;

  let intro: string;
  if (!connected) {
    intro = t("history.connectHint");
  } else if (loading) {
    intro = t("history.loading");
  } else if (ready && hasRuns) {
    intro = t("history.onChainIntro", {
      count: predca.runs.length,
      cluster: clusterShortPl(),
    });
  } else if (ready) {
    intro = t("history.noRuns");
  } else if (predca.status === "no_config" || predca.status === "no_mint") {
    intro = t("history.notReady");
  } else if (predca.status === "error") {
    intro = t("history.fetchError");
  } else {
    intro = t("history.connectHint");
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a78bfa]">
          {t("history.kicker")}
        </p>
        <h1 className="mt-1 text-xl font-semibold">{t("history.title")}</h1>
        <p className="mt-1 text-xs text-[#8b95a8]">{intro}</p>
      </div>

      {predca.error && <TxNotice message={predca.error} tone="error" />}
      {predca.status === "error" && predca.rpcError ? (
        <TxNotice message={predca.rpcError} tone="error" />
      ) : null}

      {!connected && (
        <p className="rounded border border-dashed border-[#1e2633] px-3 py-6 text-center text-xs text-[#8b95a8]">
          {t("history.connectHint")}
        </p>
      )}

      {connected && !ready && !loading && (
        <p className="rounded border border-dashed border-[#1e2633] px-3 py-6 text-center text-xs text-[#8b95a8]">
          {predca.status === "loading"
            ? t("history.loading")
            : predca.status === "error"
              ? t("history.fetchError")
              : t("history.notReady")}
        </p>
      )}

      {ready && !hasRuns && (
        <p className="rounded border border-dashed border-[#1e2633] px-3 py-6 text-center text-xs text-[#8b95a8]">
          {t("history.noRuns")}
        </p>
      )}

      {hasRuns && (
        <ul className="space-y-3">
          {[...predca.runs].reverse().map((run) => {
            const budget = runBudgetUsd(run);
            const fill = predca.runFills.find(
              (row) => row.runIndex === run.runIndex.toString(),
            );
            const names = run.mints.map((m) => mintLabel(m));
            const usdcEach = run.amounts.map((a) => rawToDollars(a));
            const pnl = runPnl(
              fill?.slots ?? null,
              usdcEach,
              predca.jupPrices.quotes,
              names,
            );
            const runPnlText =
              pnl?.totalPnlUsd != null
                ? fmtSignedPnl(pnl.totalPnlUsd, pnl.totalPnlPct, locale)
                : null;
            const runPos = pnl?.totalPnlUsd != null && pnl.totalPnlUsd > 0;
            const runNeg = pnl?.totalPnlUsd != null && pnl.totalPnlUsd < 0;
            const runClass = runPos
              ? "text-[#34d399]"
              : runNeg
                ? "text-[#f87171]"
                : "text-[#8b95a8]";
            return (
              <li
                key={run.runIndex.toString()}
                className="rounded-lg border border-[#1e2633] bg-[#141820] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="mono-num text-sm text-[#2dd4bf]">
                      {formatTs(run.ts)}
                    </p>
                    <p className="text-xs text-[#8b95a8]">
                      {t("history.runMeta", {
                        index: run.runIndex.toString(),
                        budget: formatUsd(budget),
                        slot: run.slot.toString(),
                      })}
                    </p>
                    {runPnlText && (
                      <p className={`mono-num text-xs ${runClass}`}>
                        {t("history.runPnl", { pnl: runPnlText })}
                      </p>
                    )}
                  </div>
                  <span className="mono-num rounded border border-[#2dd4bf44] px-2 py-1 text-[11px] text-[#2dd4bf]">
                    on-chain
                  </span>
                </div>
                <ul className="mt-3 grid gap-1 sm:grid-cols-3">
                  {run.mints.map((m, i) => {
                    const slot = fill?.slots?.[i] ?? null;
                    const leg = pnl?.legs[i] ?? null;
                    return (
                    <li
                      key={`${run.runIndex.toString()}-${i}`}
                      className="rounded border border-[#1e2633] bg-[#0c0e12] px-2 py-1.5 text-xs"
                    >
                      <span className="text-[#c5cedb]">{mintLabel(m)}</span>
                      <span className="mono-num ml-2 text-[#8b95a8]">
                        ${formatUsd(rawToDollars(run.amounts[i]))}
                      </span>
                      {slot ? (
                        <span className="mono-num mt-0.5 block text-[10px] text-[#8b95a8]">
                          {t("history.buyPrice", {
                            price: fmtUsdAmount(slot.price, locale) ?? t("positions.noData"),
                            units: fmtUnits(slot.units),
                          })}
                          {leg ? (
                            <span className="mt-0.5 block">
                              {t("history.legPnl", {
                                value:
                                  fmtUsdAmount(leg.valueUsd, locale) ??
                                  t("positions.noData"),
                                pnl:
                                  fmtSignedPnl(leg.pnlUsd, leg.pnlPct, locale) ??
                                  t("positions.noData"),
                              })}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
