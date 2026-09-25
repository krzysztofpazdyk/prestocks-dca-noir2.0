/**
 * Emergency deterministic ranking when Jev is unavailable.
 * When premiumsMatter: prefer more negative premium (discount); optional near-IPO boost.
 * When OFF: neutralize premium_pct (do not score on it); near-IPO premium bonus OFF.
 * Always respect Settings exclusions + IPO + deadline toggles.
 */

import { filterProducts, readExclusions } from "@/lib/exclusions";
import type { RankPrefs } from "@/lib/rank-prefs";
import {
  filterExpired,
  filterIpoCompleted,
  readRankPrefs,
} from "@/lib/rank-prefs";
import type { PrestocksProduct, RankResult, RankRow } from "@/lib/universe";

export function metricsRank(
  products: PrestocksProduct[],
  exclusions?: string[],
  prefs?: Pick<
    RankPrefs,
    | "premiumsMatter"
    | "premiumsEspeciallyNearIpo"
    | "buyDespiteIpo"
    | "deadlinesUnimportant"
  >,
): RankResult {
  const excl =
    exclusions ??
    (typeof window !== "undefined" ? readExclusions() : ["xAI"]);
  const full = typeof window !== "undefined" ? readRankPrefs() : null;
  // Default false matches DEFAULT_SETTINGS.ipoPremiumMatters
  const premiumsMatter =
    prefs?.premiumsMatter ?? full?.premiumsMatter ?? false;
  const nearIpoBoost =
    premiumsMatter &&
    (prefs?.premiumsEspeciallyNearIpo ??
      full?.premiumsEspeciallyNearIpo ??
      premiumsMatter);
  const buyDespiteIpo =
    prefs?.buyDespiteIpo ?? full?.buyDespiteIpo ?? false;
  const deadlinesUnimportant =
    prefs?.deadlinesUnimportant ?? full?.deadlinesUnimportant ?? false;
  const filtered = filterExpired(
    filterIpoCompleted(
      filterProducts(products, excl),
      buyDespiteIpo,
    ),
    deadlinesUnimportant,
  );
  const scores: RankRow[] = filtered.map((p) => {
    let score = 50;
    if (premiumsMatter) {
      score -= Number(p.premium_pct);
      if (p.near_ipo && nearIpoBoost) score += 8;
    }
    score = Math.max(0, Math.min(100, score));
    return {
      ...p,
      score: Math.round(score * 1000) / 1000,
      score_raw: null,
      confidence: null,
    };
  });
  scores.sort((a, b) => b.score - a.score);
  return {
    mode: "metrics_fallback",
    sourceLabel: "Źródło: metryki (bez AI — awaria Jev)",
    pipeline: ["prestocks", "metrics_rank"],
    top3: scores.slice(0, 3),
    scores,
    products: filtered,
    grok: { skipped: true, reason: "metrics_fallback" },
    fetchedAt: new Date().toISOString(),
  };
}