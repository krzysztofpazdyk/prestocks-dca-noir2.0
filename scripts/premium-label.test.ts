import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatPremiumPct,
  PREMIUM_TONE_CLASS,
  premiumKind,
  premiumTone,
} from "../lib/premium-view";

function values(src: string, key: string): string[] {
  const re = new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*"([^"]*)"`, "g");
  return [...src.matchAll(re)].map((hit) => hit[1]);
}

test("formatPremiumPct keeps the sign and one decimal", () => {
  assert.equal(formatPremiumPct(24.2, "pl"), "+24,2%");
  assert.equal(formatPremiumPct(-24.2, "pl"), "\u221224,2%");
  assert.equal(formatPremiumPct(0, "pl"), "0,0%");
  assert.equal(formatPremiumPct(0.04, "pl"), "0,0%");
  assert.equal(formatPremiumPct(24.2, "en"), "+24.2%");
  assert.equal(formatPremiumPct(-24.2, "en"), "\u221224.2%");
  assert.equal(formatPremiumPct(0, "en"), "0.0%");
});

test("premiumKind and premiumTone follow the buyer view", () => {
  assert.equal(premiumKind(24.2), "above");
  assert.equal(premiumKind(-24.2), "below");
  assert.equal(premiumKind(0), "at");
  assert.equal(premiumKind(0.04), "at");
  assert.equal(premiumKind(-0.04), "at");
  assert.equal(premiumKind(null), "none");
  assert.equal(premiumKind(Number.NaN), "none");

  assert.equal(premiumTone(-24.2, false), "discount");
  assert.equal(premiumTone(24.2, false), "premium");
  assert.equal(premiumTone(0, false), "neutral");
  assert.equal(premiumTone(null, false), "neutral");
  assert.equal(premiumTone(-24.2, true), "neutral");
  assert.equal(premiumTone(24.2, true), "neutral");
});

test("buyer colors invert the PnL classes used on Overview", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    overview,
    /const pnlClass = pos \? "text-\[#34d399\]" : neg \? "text-\[#f87171\]" : "text-\[#8b95a8\]"/,
  );
  assert.equal(PREMIUM_TONE_CLASS.discount, "text-[#34d399]");
  assert.equal(PREMIUM_TONE_CLASS.premium, "text-[#f87171]");
  assert.equal(PREMIUM_TONE_CLASS.neutral, "text-[#8b95a8]");
});

test("token-vs-valuation copy replaces premium vs market", () => {
  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const pl = i18n.slice(i18n.indexOf("const pl"), i18n.indexOf("const en"));
  const en = i18n.slice(i18n.indexOf("const en"), i18n.indexOf("const dictionaries"));
  const texts = (block: string) =>
    [...block.matchAll(/"[^"]+":\s*"([^"]*)"/g)].map((hit) => hit[1]);
  assert.equal(texts(pl).some((text) => text.includes("Premia vs rynek")), false);
  assert.equal(texts(en).some((text) => text.includes("Premium vs market")), false);

  assert.deepEqual(values(i18n, "prices.panelTitle"), [
    "Ceny tokenów vs wycena spółek",
    "Token prices vs company valuation",
  ]);
  assert.deepEqual(values(i18n, "prices.col.premium"), [
    "Token vs wycena spółki",
    "Token vs valuation",
  ]);
  assert.deepEqual(values(i18n, "premium.label"), [
    "Token vs wycena spółki",
    "Token vs valuation",
  ]);
  assert.deepEqual(values(i18n, "premium.noData"), [
    "Token vs wycena: brak danych",
    "Token vs valuation: no data",
  ]);
  assert.deepEqual(values(i18n, "premium.above"), [
    "{pct} drożej niż wycena",
    "{pct} above valuation",
  ]);
  assert.deepEqual(values(i18n, "premium.below"), [
    "{pct} taniej niż wycena",
    "{pct} below valuation",
  ]);
  assert.deepEqual(values(i18n, "premium.atValuation"), [
    "{pct} — tyle, ile wycena",
    "{pct} — at valuation",
  ]);
  assert.deepEqual(values(i18n, "premium.tooltip"), [
    "Różnica między ceną tokena a wyceną spółki z PreStocks",
    "Difference between the token price and the company valuation from PreStocks",
  ]);
  assert.deepEqual(values(i18n, "rank.premiumBasis.server_estimate"), [
    "Ranking AI użył premii szacunkowych serwera (nie live). Token vs wycena przy spółkach: live z Jupitera.",
    "AI ranking used the server's estimated premiums (not live). Token vs valuation shown next to each name is live from Jupiter.",
  ]);
  assert.deepEqual(values(i18n, "settings.ipoPremium"), [
    "Premia IPO ma znaczenie (uwzględniaj różnicę wyceny tokenu względem rynku, np. −20% / +34%).",
    "IPO premium matters (factor in token vs market pricing gap, e.g. −20% / +34%).",
  ]);
  assert.match(values(i18n, "premium.above")[0], /drożej/);
  assert.match(values(i18n, "premium.below")[0], /taniej/);
  assert.deepEqual(values(i18n, "premium.estimate"), ["szacunek", "estimate"]);
});

test("Overview renders the verbal value with a tooltip and keeps livePremiumPct", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(overview, /premium\.label", \{ pct/);
  assert.doesNotMatch(overview, /Premia vs rynek/);
  assert.match(overview, /PREMIUM_TONE_CLASS\[premium\.tone\]/);
  assert.match(overview, /PREMIUM_TONE_CLASS\[tone\]/);
  assert.match(overview, /title=\{t\("premium\.tooltip"\)\}/);
  const start = overview.indexOf("function premiumText");
  const fn = overview.slice(start, overview.indexOf("const pricesReady", start));
  assert.match(fn, /livePremiumPct/);
  assert.doesNotMatch(fn, /premium\.estimate/);
});
