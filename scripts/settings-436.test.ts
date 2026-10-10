import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  effectiveExclusions,
  filterProducts,
  userExclusions,
} from "../lib/exclusions";
import { readRankPrefs } from "../lib/rank-prefs";
import { adoptWeeklyDraft } from "../lib/weekly-budget";

test("effective exclusions always keep xAI and drop it from the typed field", () => {
  assert.deepEqual(effectiveExclusions(""), ["xAI"]);
  assert.deepEqual(effectiveExclusions("OpenAI"), ["xAI", "OpenAI"]);
  assert.deepEqual(effectiveExclusions("xai, OpenAI, openai"), ["xAI", "OpenAI"]);
  assert.deepEqual(userExclusions("xAI"), []);
  assert.deepEqual(userExclusions("xAI, OpenAI, xai"), ["OpenAI"]);
});

test("an empty exclusions field still filters xAI out of the ranking", () => {
  const previous = globalThis.localStorage;
  const data = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  try {
    const prefs = readRankPrefs();
    assert.equal(prefs.exclusions.includes("xAI"), true);
    assert.equal(prefs.exclusionsRaw.includes("xAI"), false);
    const left = filterProducts(
      [
        { name: "xAI", mint: "xai-mint" },
        { name: "OpenAI", mint: "openai-mint" },
      ],
      prefs.exclusions,
    );
    assert.deepEqual(left.map((row) => row.name), ["OpenAI"]);
  } finally {
    if (previous === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      globalThis.localStorage = previous;
    }
  }
});

test("adoptWeeklyDraft keeps a wallet amount and otherwise takes the draft", () => {
  assert.deepEqual(adoptWeeklyDraft(null, 80), { value: 80, clearDraft: true });
  assert.deepEqual(adoptWeeklyDraft(200, 80), { value: 200, clearDraft: true });
  assert.deepEqual(adoptWeeklyDraft(200, null), { value: 200, clearDraft: false });
  assert.deepEqual(adoptWeeklyDraft(null, null), { value: null, clearDraft: false });
});

test("prefs confirmation stays outside the dirty block, and controls wait for hydrate", () => {
  const settings = readFileSync(
    new URL("../components/SettingsView.tsx", import.meta.url),
    "utf8",
  );
  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const ok = settings.indexOf('t("settings.prefsSignOk")');
  const dirty = settings.indexOf("{prefsDirty ?");
  assert.ok(ok > 0 && dirty > ok);
  assert.match(settings, /setTimeout\(\(\) => \{[\s\S]{0,80}setPrefsOk\(false\);\s*\}, 4000\)/);
  assert.match(settings, /clearTimeout\(prefsOkTimer\.current\)/);
  assert.match(settings, /disabled=\{!prefsReady\}/);
  assert.match(settings, /t\("settings\.fixedExclusion"\)/);
  assert.match(settings, /placeholder="OpenAI, Kalshi"/);
  assert.match(settings, /adoptWeeklyDraft\(/);
  assert.match(settings, /writeWeeklyDraft\(/);
  assert.doesNotMatch(settings, /predca_weekly_budget_usd(?!\.)/);
  function values(key: string): string[] {
    const re = new RegExp(`"${key.replace(/\./g, "\\.")}":\\s*"([^"]*)"`, "g");
    return [...i18n.matchAll(re)].map((hit) => hit[1]);
  }
  assert.deepEqual(values("settings.prefsLoading"), [
    "Wczytywanie ustawień keepera…",
    "Loading keeper settings…",
  ]);
  assert.deepEqual(values("settings.fixedExclusion"), [
    "xAI — zawsze wykluczony (niedostępny w PreStocks DCA)",
    "xAI — always excluded (not available in PreStocks DCA)",
  ]);
  assert.match(values("settings.intro")[0], /bez portfela — do pierwszego połączenia/);
  assert.match(values("settings.intro")[1], /without a wallet — until the first connection/);
  assert.match(values("settings.weeklyAtEnable")[0], /bez portfela — do pierwszego połączenia/);
  assert.match(values("settings.exclusions")[0], /OpenAI, Kalshi/);
  assert.doesNotMatch(values("settings.exclusions")[0], /xAI/);
});
