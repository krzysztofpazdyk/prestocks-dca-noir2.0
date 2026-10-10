/**
 * The premium the Overview shows. Same number as the "Ceny i premie" panel.
 */

import { ipoPremiumPct, quoteByName, type JupPrices } from "@/lib/jup-prices";
import type { RankResult } from "@/lib/universe";

export function livePremiumPct(name: string, prices: JupPrices): number | null {
  const quote = quoteByName(prices.quotes, name);
  if (!quote) return null;
  return ipoPremiumPct(quote, prices.fetchedAt);
}

export function premiumBasisFor(
  where: "server" | "client",
  premiumsMatter: boolean,
): RankResult["premiumBasis"] {
  if (!premiumsMatter) return "none";
  return where === "server" ? "server_estimate" : "live";
}
