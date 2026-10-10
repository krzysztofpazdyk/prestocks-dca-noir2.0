import assert from "node:assert/strict";
import test from "node:test";
import { fmtSignedPnl, fmtUsdAmount } from "../lib/format-usd";
import type { JupQuote } from "../lib/jup-prices";
import { priceRows } from "../lib/price-rows";
import { pnlSummary, runPnl, type PositionRow } from "../lib/position-value";
import { MINTS } from "../lib/universe";

const NOW = Date.parse("2026-10-10T12:00:00Z");

function row(partial: Partial<PositionRow> & Pick<PositionRow, "name">): PositionRow {
  return {
    units: 1,
    costUsd: 0,
    pricedUnits: 0,
    legacyCostUsd: 0,
    priceNow: null,
    valueUsd: 0,
    pnlUsd: null,
    pnlPct: null,
    avgBuyPrice: null,
    basis: "cost",
    stale: false,
    mismatch: false,
    ...partial,
  };
}

function quote(name: string, partial: Partial<JupQuote> = {}): JupQuote {
  return {
    mint: MINTS[name] ?? "mint",
    name,
    usdPrice: 100,
    stockPrice: 80,
    stockUpdatedAt: NOW - 60_000,
    liquidityUsd: 100_000,
    multiplierChange: false,
    ...partial,
  };
}

test("fmtUsdAmount uses the locale and returns null for missing numbers", () => {
  assert.equal(fmtUsdAmount(126.74, "pl"), "126,74 USD");
  assert.equal(fmtUsdAmount(126.74, "en"), "126.74 USD");
  assert.equal(fmtUsdAmount(null, "pl"), null);
  assert.equal(fmtUsdAmount(Number.NaN, "en"), null);
  assert.equal(fmtUsdAmount(Number.POSITIVE_INFINITY, "pl"), null);
});

test("fmtUsdAmount signs a gain and keeps a loss", () => {
  assert.equal(fmtUsdAmount(12.3, "pl", 2, true), "+12,30 USD");
  assert.equal(fmtUsdAmount(-4.1, "en", 2, true), "-4.10 USD");
  assert.equal(fmtUsdAmount(0, "pl", 2, true), "0,00 USD");
  assert.equal(fmtSignedPnl(12.3, 4.1, "pl"), "+12,30 USD (+4,1%)");
  assert.equal(fmtSignedPnl(-4.1, -2, "en"), "-4.10 USD (-2.0%)");
  assert.equal(fmtSignedPnl(null, 1, "pl"), null);
});

test("legacy-only summary has no PnL and is not zero", () => {
  const summary = pnlSummary([
    row({ name: "Anthropic", costUsd: 100, legacyCostUsd: 100, valueUsd: 100 }),
    row({ name: "OpenAI", costUsd: 50, legacyCostUsd: 50, valueUsd: 50 }),
  ]);
  assert.equal(summary.pnlUsd, null);
  assert.equal(summary.pnlPct, null);
  assert.equal(summary.hasPriced, false);
  assert.equal(summary.hasLegacy, true);
  assert.equal(summary.legacyCostUsd, 150);
  assert.equal(summary.pricedCostUsd, 0);
});

test("v2 rows sum profit and loss against v2 cost", () => {
  const gain = pnlSummary([
    row({
      name: "OpenAI",
      basis: "market",
      costUsd: 80,
      legacyCostUsd: 0,
      pnlUsd: 20,
      pnlPct: 25,
      valueUsd: 100,
      priceNow: 50,
    }),
  ]);
  assert.equal(gain.pnlUsd, 20);
  assert.equal(gain.pnlPct, 25);
  assert.equal(gain.pricedCostUsd, 80);
  assert.equal(gain.hasPriced, true);
  assert.equal(gain.hasLegacy, false);

  const loss = pnlSummary([
    row({
      name: "Anduril",
      basis: "market",
      costUsd: 100,
      pnlUsd: -10,
      valueUsd: 90,
      priceNow: 90,
    }),
  ]);
  assert.equal(loss.pnlUsd, -10);
  assert.equal(loss.pnlPct, -10);
});

test("mixed rows keep PnL on the v2 slice only", () => {
  const summary = pnlSummary([
    row({
      name: "Anthropic",
      basis: "mixed",
      costUsd: 130,
      legacyCostUsd: 50,
      pnlUsd: 20,
      valueUsd: 150,
      priceNow: 50,
    }),
    row({ name: "Kalshi", costUsd: 40, legacyCostUsd: 40, valueUsd: 40 }),
  ]);
  assert.equal(summary.hasPriced, true);
  assert.equal(summary.hasLegacy, true);
  assert.equal(summary.pnlUsd, 20);
  assert.equal(summary.pricedCostUsd, 80);
  assert.equal(summary.pnlPct, 25);
  assert.equal(summary.legacyCostUsd, 90);
});

test("a v2 row with no current price does not invent a zero PnL", () => {
  const summary = pnlSummary([
    row({
      name: "SpaceX",
      basis: "cost",
      costUsd: 40,
      pricedUnits: 2,
      legacyCostUsd: 0,
      valueUsd: 40,
      pnlUsd: null,
    }),
  ]);
  assert.equal(summary.pnlUsd, null);
  assert.equal(summary.hasPriced, false);
  assert.equal(summary.hasLegacy, false);
});

test("a run without RunPrice has no PnL", () => {
  assert.equal(runPnl(null, [50], { Anthropic: quote("Anthropic") }, ["Anthropic"]), null);
});

test("run PnL prices the legs that have a quote and skips the rest", () => {
  const result = runPnl(
    [
      { units: 2, price: 40 },
      { units: 1, price: 10 },
    ],
    [80, 50],
    { Anthropic: quote("Anthropic", { usdPrice: 50 }), OpenAI: quote("OpenAI", { usdPrice: null }) },
    ["Anthropic", "OpenAI"],
  );
  assert.ok(result);
  assert.equal(result.legs[0]?.valueUsd, 100);
  assert.equal(result.legs[0]?.pnlUsd, 20);
  assert.equal(result.legs[0]?.pnlPct, 25);
  assert.equal(result.legs[1], null);
  assert.equal(result.totalPnlUsd, 20);
  assert.equal(result.totalPnlPct, 25);
});

test("a run whose legs all lack a current price has a null total", () => {
  const result = runPnl(
    [{ units: 1, price: 10 }],
    [10],
    { "Figure AI": quote("FigureAI", { usdPrice: null, name: "FigureAI" }) },
    ["Figure AI"],
  );
  assert.ok(result);
  assert.equal(result.legs[0], null);
  assert.equal(result.totalPnlUsd, null);
  assert.equal(result.totalPnlPct, null);

  const named = runPnl(
    [{ units: 3, price: 10 }],
    [30],
    { FigureAI: quote("FigureAI", { usdPrice: 12 }) },
    ["Figure AI"],
  );
  assert.equal(named?.legs[0]?.valueUsd, 36);
  assert.equal(named?.legs[0]?.pnlUsd, 6);
});

test("price rows are the eight universe names, alphabetical, without xAI or OURA", () => {
  const rows = priceRows(
    {
      OURA: quote("OURA"),
      xAI: quote("xAI"),
      Anthropic: quote("Anthropic", { usdPrice: 10, stockPrice: 8 }),
    },
    NOW,
    { source: "live", suspect: [] },
  );
  assert.deepEqual(
    rows.map((r) => r.name),
    ["Anduril", "Anthropic", "FigureAI", "Kalshi", "Neuralink", "OpenAI", "Polymarket", "SpaceX"],
  );
  assert.equal(rows.some((r) => r.name === "OURA" || r.name === "xAI"), false);
  assert.equal(rows.find((r) => r.name === "Anthropic")?.usdPrice, 10);
  assert.ok(rows.find((r) => r.name === "Anduril")?.flags.includes("no-data"));
  assert.equal(rows.find((r) => r.name === "Anduril")?.premiumPct, null);
});

test("price row flags cover cache, suspect, low liquidity, and a multiplier change", () => {
  const rows = priceRows(
    {
      OpenAI: quote("OpenAI", { usdPrice: 20, stockPrice: 16 }),
      SpaceX: quote("SpaceX", { usdPrice: 30, stockPrice: 40, liquidityUsd: 1_000 }),
      Neuralink: quote("Neuralink", { usdPrice: 15, stockPrice: 10, multiplierChange: true }),
      Kalshi: quote("Kalshi", { usdPrice: null }),
    },
    NOW,
    { source: "cache", suspect: ["openai"] },
  );
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.ok(by.OpenAI.flags.includes("cache"));
  assert.ok(by.OpenAI.flags.includes("suspect"));
  assert.equal(by.OpenAI.flags.includes("no-data"), false);
  assert.ok(by.OpenAI.premiumPct != null);
  assert.ok(by.SpaceX.flags.includes("low-liquidity"));
  assert.ok(by.SpaceX.flags.includes("cache"));
  assert.ok(by.Neuralink.flags.includes("multiplier"));
  assert.equal(by.Neuralink.premiumPct, null);
  assert.ok(by.Kalshi.flags.includes("no-data"));
  assert.equal(by.Kalshi.usdPrice, null);
});
