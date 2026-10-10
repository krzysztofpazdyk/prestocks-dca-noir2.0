/**
 * Rows for the Overview "Ceny tokenów vs wycena spółek" panel.
 * Universe only: the 8 `MINTS` names, alphabetical. No xAI, no OURA.
 */

import {
  canonicalName,
  ipoPremiumPct,
  isLowLiquidity,
  quoteByName,
  type JupQuote,
} from "@/lib/jup-prices";
import { MINTS } from "@/lib/universe";

export type PriceRowFlag =
  | "cache"
  | "no-data"
  | "suspect"
  | "low-liquidity"
  | "multiplier";

export type PricePanelRow = {
  name: string;
  usdPrice: number | null;
  premiumPct: number | null;
  flags: PriceRowFlag[];
};

export function priceRows(
  quotes: Record<string, JupQuote>,
  now: number,
  source: { source: "live" | "cache"; suspect: string[]; carried?: string[] },
): PricePanelRow[] {
  const names = Object.keys(MINTS).sort((a, b) => a.localeCompare(b, "en"));
  const carried = source.carried ?? [];
  return names.map((name) => {
    const quote = quoteByName(quotes, name);
    const usdPrice = quote?.usdPrice ?? null;
    const flags: PriceRowFlag[] = [];
    if (
      source.source === "cache" ||
      carried.some((n) => canonicalName(n) === canonicalName(name))
    ) {
      flags.push("cache");
    }
    if (usdPrice == null) flags.push("no-data");
    if (source.suspect.some((n) => canonicalName(n) === canonicalName(name))) {
      flags.push("suspect");
    }
    if (quote && isLowLiquidity(quote)) flags.push("low-liquidity");
    if (quote?.multiplierChange) flags.push("multiplier");
    return {
      name,
      usdPrice,
      premiumPct: quote ? ipoPremiumPct(quote, now) : null,
      flags,
    };
  });
}
