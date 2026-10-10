import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  needsBudgetConfirm,
  parseWeeklyDraft,
} from "../lib/weekly-budget";

test("parseWeeklyDraft accepts a weekly amount and rejects empty, junk, and extra decimals", () => {
  assert.deepEqual(parseWeeklyDraft(""), { ok: false, reason: "empty" });
  assert.deepEqual(parseWeeklyDraft("abc"), { ok: false, reason: "nan" });
  assert.deepEqual(parseWeeklyDraft("-1"), { ok: false, reason: "nan" });
  assert.deepEqual(parseWeeklyDraft("0,5"), { ok: false, reason: "min" });
  assert.deepEqual(parseWeeklyDraft("150"), { ok: true, value: 150 });
  assert.deepEqual(parseWeeklyDraft("150,25"), { ok: true, value: 150.25 });
  assert.deepEqual(parseWeeklyDraft("150.25"), { ok: true, value: 150.25 });
  assert.deepEqual(parseWeeklyDraft("150,255"), { ok: false, reason: "decimals" });
  assert.deepEqual(parseWeeklyDraft("1.200"), { ok: false, reason: "decimals" });
  assert.deepEqual(parseWeeklyDraft("1 200"), { ok: true, value: 1200 });
  assert.deepEqual(parseWeeklyDraft("1\u00a0200"), { ok: true, value: 1200 });
});

test("needsBudgetConfirm asks only when the amounts differ and the click is not confirmed", () => {
  assert.equal(needsBudgetConfirm(200, 150, false), true);
  assert.equal(needsBudgetConfirm(200, 150, true), false);
  assert.equal(needsBudgetConfirm(150, 150, false), false);
  assert.equal(needsBudgetConfirm(150, null, false), true);
  assert.equal(needsBudgetConfirm(0, null, false), false);
});

test("Settings keeps the draft until it parses, and Overview asks before the buy gates", () => {
  const settings = readFileSync(
    new URL("../components/SettingsView.tsx", import.meta.url),
    "utf8",
  );
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");

  assert.equal(settings.includes("Math.max(1, n)"), false);
  const weeklyInput = settings.slice(settings.indexOf('inputMode="decimal"'));
  const onChange = weeklyInput.slice(
    weeklyInput.indexOf("onChange="),
    weeklyInput.indexOf("onBlur="),
  );
  assert.match(onChange, /predca\.clearToasts\(\)/);
  assert.match(onChange, /if \(parsed\.ok\) setWeekly\(parsed\.value\)/);
  assert.doesNotMatch(onChange, /Math\.max/);

  for (const match of settings.matchAll(/writeWeeklyBudgetUsd\(/g)) {
    const idx = match.index ?? 0;
    const before = settings.slice(Math.max(0, idx - 320), idx);
    assert.match(before, /parsed\.ok/);
  }

  const purchase = overview.slice(
    overview.indexOf("async function handlePurchase"),
    overview.indexOf("const depositPresentation"),
  );
  const confirmAt = purchase.indexOf("needsBudgetConfirm(");
  const dupAt = purchase.indexOf("tryEnterDupCheck");
  const syncAt = purchase.indexOf("setWeeklyBudget");
  assert.ok(confirmAt >= 0 && dupAt > confirmAt);
  assert.ok(syncAt > dupAt);

  function values(key: string): string[] {
    const re = new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*"([^"]*)"`, "g");
    return [...i18n.matchAll(re)].map((hit) => hit[1]);
  }
  assert.deepEqual(values("settings.weeklyInvalid"), [
    "Podaj kwotę ≥ 1 USDC, max 2 miejsca po przecinku.",
    "Enter an amount ≥ 1 USDC, at most 2 decimals.",
  ]);
  assert.deepEqual(values("purchase.confirmBudget"), [
    "Zmienię budżet on-chain z {from} na {to} USDC i kupię. Potwierdzić?",
    "I'll change the on-chain budget from {from} to {to} USDC and buy. Confirm?",
  ]);
  assert.deepEqual(values("btn.confirm"), ["Potwierdź", "Confirm"]);
  assert.deepEqual(values("btn.cancel"), ["Anuluj", "Cancel"]);
});
