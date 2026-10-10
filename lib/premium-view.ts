/**
 * The premium the Overview shows. Same number as the "Ceny tokenów vs wycena spółek" panel.
 */

import { ipoPremiumPct, quoteByName, type JupPrices } from "@/lib/jup-prices";
import type { RankResult } from "@/lib/universe";

export function livePremiumPct(name: string, prices: JupPrices): number | null {
  const quote = quoteByName(prices.quotes, name);
  if (!quote) return null;
  return ipoPremiumPct(quote, prices.fetchedAt);
}

export type PremiumTone = "discount" | "premium" | "neutral";

/** Locale-aware, 1 decimal, sign always: „+24,2%”, „−24,2%” (U+2212), „0,0%”. */
export function formatPremiumPct(pct: number, locale: string): string {
  const tag = locale === "en" || locale.startsWith("en") ? "en-US" : "pl-PL";
  const body = pct.toLocaleString(tag, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  });
  return `${body.replace(/-/g, "\u2212")}%`;
}

/** |pct| < 0.05 (rounds to 0.0) → "at"; null/NaN → "none". */
export function premiumKind(pct: number | null): "above" | "below" | "at" | "none" {
  if (pct == null || !Number.isFinite(pct)) return "none";
  if (Math.abs(pct) < 0.05) return "at";
  return pct > 0 ? "above" : "below";
}

/** Buyer color. stale (cache/carried) → always neutral. */
export function premiumTone(pct: number | null, stale: boolean): PremiumTone {
  if (stale || pct == null || !Number.isFinite(pct)) return "neutral";
  if (pct < 0) return Math.abs(pct) < 0.05 ? "neutral" : "discount";
  if (pct > 0) return Math.abs(pct) < 0.05 ? "neutral" : "premium";
  return "neutral";
}

/** Same classes as PnL (positive green, negative red, flat muted). */
export const PREMIUM_TONE_CLASS: Record<PremiumTone, string> = {
  discount: "text-[#34d399]",
  premium: "text-[#f87171]",
  neutral: "text-[#8b95a8]",
};

export function premiumBasisFor(
  where: "server" | "client",
  premiumsMatter: boolean,
): RankResult["premiumBasis"] {
  if (!premiumsMatter) return "none";
  return where === "server" ? "server_estimate" : "live";
}
