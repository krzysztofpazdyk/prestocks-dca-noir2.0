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
