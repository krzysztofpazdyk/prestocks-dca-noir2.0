import assert from "node:assert/strict";
import test from "node:test";
import { emptyJupPrices, type JupPrices } from "../lib/jup-prices";
import {
  buildPositions,
  portfolioValue,
  runLots,
  valueWeights,
  type RunLot,
} from "../lib/position-value";

const ANTHROPIC = "2yqHN6bCAJZHngGuRnuTKBB43F2S6GGLAJqgwZ4WVXT1";

function prices(
  marks: Record<string, number | null>,
  source: JupPrices["source"] = "live",
  suspect: string[] = [],
): JupPrices {
  const base = emptyJupPrices(1_700_000_000_000);
  for (const [name, usd] of Object.entries(marks)) {
    const key = Object.keys(base.quotes).find(
      (k) => k.toLowerCase().replace(/\s+/g, "") === name.toLowerCase().replace(/\s+/g, ""),
    );
    if (!key) throw new Error(`no quote ${name}`);
    base.quotes[key] = { ...base.quotes[key], usdPrice: usd };
  }
  return { ...base, source, suspect, fetchedAt: 1_700_000_000_000 };
}

function lot(partial: Partial<RunLot> & Pick<RunLot, "name" | "usdcCost">): RunLot {
  return {
    devnetMint: partial.devnetMint ?? "mint",
    runIndex: partial.runIndex ?? 0,
    ts: partial.ts ?? 1,
    units: partial.units === undefined ? null : partial.units,
    buyPrice: partial.buyPrice === undefined ? null : partial.buyPrice,
    ...partial,
  };
}

test("legacy-only lots match vault + token units and ignore the market price", () => {
  const rows = buildPositions(
    [
      lot({ name: "Anthropic", devnetMint: ANTHROPIC, usdcCost: 40 }),
      lot({ name: "OpenAI", usdcCost: 60 }),
    ],
    [
      { name: "Anthropic", amount: 40 },
      { name: "OpenAI", amount: 60 },
    ],
    prices({ Anthropic: 1000, OpenAI: 500 }),
  );
  const anth = rows.find((r) => r.name === "Anthropic");
  const openai = rows.find((r) => r.name === "OpenAI");
  assert.ok(anth && openai);
  assert.equal(anth.valueUsd, 40);
  assert.equal(anth.basis, "cost");
  assert.equal(anth.pnlUsd, null);
  assert.equal(anth.priceNow, 1000);
  assert.equal(anth.mismatch, false);
  assert.equal(openai.valueUsd, 60);
  const vault = 100;
  const oldFormula = vault + 40 + 60;
  assert.equal(portfolioValue(vault, rows), oldFormula);
});

test("v2 lots mark to the jupiter price and report P/L", () => {
  const rows = buildPositions(
    [
      lot({
        name: "Anthropic",
        usdcCost: 100,
        units: 2,
        buyPrice: 50,
      }),
    ],
    [{ name: "Anthropic", amount: 2 }],
    prices({ Anthropic: 80 }),
  );
  const row = rows[0];
  assert.equal(row.valueUsd, 160);
  assert.equal(row.pnlUsd, 60);
  assert.equal(row.pnlPct, 60);
  assert.equal(row.avgBuyPrice, 50);
  assert.equal(row.basis, "market");
  assert.equal(row.pricedUnits, 2);
  assert.equal(row.legacyCostUsd, 0);
});

test("mixed legacy and v2 keeps P/L on the v2 slice only", () => {
  const rows = buildPositions(
    [
      lot({ name: "Anthropic", usdcCost: 10, units: null }),
      lot({ name: "Anthropic", usdcCost: 100, units: 2, buyPrice: 50, runIndex: 1 }),
    ],
    [{ name: "Anthropic", amount: 12 }],
    prices({ Anthropic: 80 }),
  );
  const row = rows[0];
  assert.equal(row.basis, "mixed");
  assert.equal(row.valueUsd, 170);
  assert.equal(row.pnlUsd, 60);
  assert.equal(row.pnlPct, 60);
  assert.equal(row.legacyCostUsd, 10);
  assert.equal(row.pricedUnits, 2);
});

test("missing price values v2 at cost and clears P/L", () => {
  const rows = buildPositions(
    [
      lot({ name: "Anthropic", usdcCost: 10 }),
      lot({ name: "Anthropic", usdcCost: 100, units: 2, buyPrice: 50, runIndex: 1 }),
    ],
    [{ name: "Anthropic", amount: 12 }],
    prices({ Anthropic: null }),
  );
  const row = rows[0];
  assert.equal(row.valueUsd, 110);
  assert.equal(row.pnlUsd, null);
  assert.equal(row.pnlPct, null);
  assert.equal(row.basis, "cost");
  assert.equal(row.priceNow, null);
});

test("a smaller balance scales both slices and a larger one is legacy surplus", () => {
  const small = buildPositions(
    [lot({ name: "Anthropic", usdcCost: 100, units: 10, buyPrice: 10 })],
    [{ name: "Anthropic", amount: 4 }],
    prices({ Anthropic: 20 }),
  )[0];
  assert.equal(small.mismatch, true);
  assert.equal(small.pricedUnits, 4);
  assert.equal(small.valueUsd, 80);
  assert.equal(small.pnlUsd, 40);
  assert.equal(small.avgBuyPrice, 10);

  const large = buildPositions(
    [lot({ name: "OpenAI", usdcCost: 100 })],
    [{ name: "OpenAI", amount: 130 }],
    prices({ OpenAI: 40 }),
  )[0];
  assert.equal(large.mismatch, true);
  assert.equal(large.legacyCostUsd, 130);
  assert.equal(large.valueUsd, 130);
  assert.equal(large.basis, "cost");
});

test("pie weights follow value, which equals units for legacy", () => {
  assert.deepEqual(
    valueWeights([
      { name: "Anthropic", valueUsd: 75 },
      { name: "OpenAI", valueUsd: 25 },
    ]),
    [
      { name: "Anthropic", value: 75 },
      { name: "OpenAI", value: 25 },
    ],
  );
  const rows = buildPositions(
    [
      lot({ name: "Anthropic", usdcCost: 40 }),
      lot({ name: "OpenAI", usdcCost: 60 }),
    ],
    [
      { name: "Anthropic", amount: 40 },
      { name: "OpenAI", amount: 60 },
    ],
    prices({ Anthropic: 9, OpenAI: 9 }),
  );
  assert.deepEqual(valueWeights(rows), [
    { name: "OpenAI", value: 60 },
    { name: "Anthropic", value: 40 },
  ]);
});

test("Figure AI matches the FigureAI quote and cache or suspect marks the row stale", () => {
  const row = buildPositions(
    [],
    [{ name: "Figure AI", amount: 5 }],
    prices({ FigureAI: 10 }),
  )[0];
  assert.equal(row.priceNow, 10);
  assert.equal(row.valueUsd, 5);
  assert.equal(row.basis, "cost");
  assert.equal(row.mismatch, true);

  const stale = buildPositions(
    [lot({ name: "Figure AI", usdcCost: 5 })],
    [{ name: "Figure AI", amount: 5 }],
    prices({ FigureAI: 10 }, "cache"),
  )[0];
  assert.equal(stale.stale, true);
  assert.equal(stale.mismatch, false);

  const suspect = buildPositions(
    [lot({ name: "Figure AI", usdcCost: 5 })],
    [{ name: "Figure AI", amount: 5 }],
    prices({ FigureAI: 10 }, "live", ["FigureAI"]),
  )[0];
  assert.equal(suspect.stale, true);
});

test("runLots without a RunPrice account are legacy", () => {
  const lots = runLots(
    [
      {
        runIndex: 3,
        ts: 9,
        mints: [ANTHROPIC],
        amountsUsd: [50],
      },
    ],
    new Map([[3, null]]),
  );
  assert.equal(lots.length, 1);
  assert.equal(lots[0].name, "Anthropic");
  assert.equal(lots[0].units, null);
  assert.equal(lots[0].buyPrice, null);
  assert.equal(lots[0].usdcCost, 50);

  const v2 = runLots(
    [
      {
        runIndex: 3,
        ts: 9,
        mints: [ANTHROPIC],
        amountsUsd: [50],
      },
    ],
    new Map([
      [
        3,
        {
          mints: [{ toBase58: () => ANTHROPIC }],
          units: [BigInt(2_500_000)],
          pricesE6: [BigInt(80_000_000)],
        },
      ],
    ]),
  );
  assert.equal(v2[0].units, 2.5);
  assert.equal(v2[0].buyPrice, 80);
});
