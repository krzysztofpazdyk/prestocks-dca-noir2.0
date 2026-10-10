import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const src = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");

function values(key: string): string[] {
  const re = new RegExp(`"${key}":\\s*"([^"]*)"`, "g");
  return [...src.matchAll(re)].map((m) => m[1]);
}

test("deposit and withdraw titles exist in Polish and English", () => {
  for (const key of ["predca.depositTitle", "predca.withdrawTitle", "predca.rpcActionHint"]) {
    assert.equal(values(key).length, 2, key);
  }
  assert.deepEqual(values("predca.deposit"), ["Wpłać", "Deposit"]);
  assert.deepEqual(values("predca.withdraw"), ["Wypłać", "Withdraw"]);
});

test("Polish deposit hints no longer say Deposit or Hint", () => {
  const pl = src.slice(src.indexOf("const pl"), src.indexOf("const en"));
  const keys = [
    "predca.hintNoAta",
    "predca.hintZeroUsdc",
    "predca.mintNoAta",
    "predca.depositUnavailable",
    "faucet.nextSteps",
    "purchase.disabled.vaultLow",
  ];
  for (const key of keys) {
    const re = new RegExp(`"${key}":\\s*"([^"]*)"`, "g");
    const hits = [...pl.matchAll(re)].map((m) => m[1]);
    assert.equal(hits.length, 1, key);
    assert.doesNotMatch(hits[0], /Deposit|Hint:/);
  }
  const nav = pl.match(/"nav\.selectWallet":\s*"([^"]+)"/);
  assert.equal(nav?.[1], "Zaloguj");
});

test("jupiter price and position keys exist in Polish and English", () => {
  const keys = [
    "positions.title",
    "positions.col.asset",
    "positions.col.units",
    "positions.col.price",
    "positions.col.value",
    "positions.col.avgBuy",
    "positions.col.pnl",
    "positions.noData",
    "positions.atCost",
    "positions.legacyHint",
    "positions.mismatch",
    "prices.source",
    "prices.stale",
    "prices.unavailable",
    "prices.suspect",
    "prices.lowLiquidity",
    "prices.multiplier",
    "prices.panelTitle",
    "prices.col.company",
    "prices.col.price",
    "prices.col.premium",
    "prices.col.status",
    "prices.loading",
    "prices.lastRead",
    "pnl.title",
    "pnl.total",
    "pnl.atCostValue",
    "pnl.legacyNote",
    "pnl.partialNote",
    "history.legPnl",
    "history.runPnl",
    "premium.label",
    "premium.noData",
    "premium.estimate",
    "history.buyPrice",
    "prestocks.snapshotDated",
  ];
  for (const key of keys) {
    assert.equal(values(key).length, 2, key);
    for (const text of values(key)) assert.ok(text.length > 0, key);
  }
  assert.deepEqual(values("positions.title"), ["Pozycje", "Positions"]);
  assert.deepEqual(values("positions.noData"), ["brak danych", "no data"]);
  assert.deepEqual(values("premium.estimate"), ["szacunek", "estimate"]);
  assert.equal(
    values("prices.stale")[0],
    "ceny: ostatni odczyt · {time}",
  );
  assert.equal(
    values("prestocks.snapshotDated")[1],
    "No live PreStocks. Using static snapshot from {date} (not live).",
  );
});

test("Overview and Trading desk stay English in the Polish dictionary", () => {
  const pl = src.slice(src.indexOf("const pl"), src.indexOf("const en"));
  assert.match(pl, /"nav\.overview": "Overview"/);
  assert.match(pl, /"overview\.title": "Overview"/);
  assert.match(pl, /Trading desk/);
  assert.doesNotMatch(pl, /"positions\.title": "[^"]*Hint/);
  assert.equal(values("overview.rpcStale")[0], "ostatni odczyt");
  assert.notEqual(values("prices.stale")[0], values("overview.rpcStale")[0]);
  assert.match(pl, /on-chain/);
  assert.equal(values("history.buyPrice")[0], "po {price} · {units} szt.");
  assert.equal(values("history.buyPrice")[1], "at {price} · {units} units");
  assert.equal(values("prices.panelTitle")[0], "Ceny i premie");
  assert.equal(values("prices.lastRead")[0], "ostatni odczyt · {time}");
  assert.equal(values("pnl.legacyNote")[1], "PnL available for purchases at market price (coming soon).");
  const history = readFileSync(
    new URL("../components/HistoryView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(history, />\s*on-chain\s*</);
});
