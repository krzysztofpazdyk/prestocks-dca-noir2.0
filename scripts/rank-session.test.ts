import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SS_RANK } from "../lib/keys";
import {
  rankPrefsKey,
  restoreRankSession,
  saveRankSession,
} from "../lib/ranking";
import type { RankResult } from "../lib/universe";

function memory() {
  const mem = new Map<string, string>();
  return {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
  };
}

function sample(): RankResult {
  return {
    mode: "metrics_fallback",
    sourceLabel: "Źródło: metryki",
    pipeline: ["prestocks", "metrics_rank"],
    top3: [
      {
        name: "OpenAI",
        symbol: "OPENAI",
        mint: "mint",
        token_price_usd: 3,
        mark_price_usd: null,
        premium_pct: 0,
        premium_source: "jupiter_stockdata",
        near_ipo: false,
        score: 70,
      },
      {
        name: "Anduril",
        symbol: "ANDURIL",
        mint: "mint2",
        token_price_usd: 2,
        mark_price_usd: null,
        premium_pct: 0,
        premium_source: "jupiter_stockdata",
        near_ipo: false,
        score: 60,
      },
    ],
    scores: [],
    products: [],
    fetchedAt: "2026-10-10T12:00:00Z",
    premiumBasis: "live",
  };
}

test("a saved ranking comes back for the same prefs and not for another set", () => {
  const store = memory();
  const rank = sample();
  saveRankSession(rank, store);
  const key = rankPrefsKey();
  const restored = restoreRankSession(key, store);
  assert.ok(restored);
  assert.equal(restored.rank.top3[0].name, "OpenAI");
  assert.equal(restored.rank.top3[1].name, "Anduril");
  assert.equal(typeof restored.savedAt, "number");
  assert.equal(restoreRankSession(`${key}-other`, store), null);

  store.setItem(SS_RANK, JSON.stringify(rank));
  assert.equal(restoreRankSession(key, store), null);
  store.setItem(SS_RANK, "{");
  assert.equal(restoreRankSession(key, store), null);
});

test("prefs key sorts exclusions and Overview restores on mount without a network load", () => {
  const a = rankPrefsKey({
    exclusions: ["OpenAI", "xAI"],
    exclusionsRaw: "OpenAI, xAI",
    deadlinesUnimportant: false,
    premiumsMatter: false,
    premiumsEspeciallyNearIpo: false,
    deadlineInvalid: false,
    ipoPremiumMatters: false,
    buyDespiteIpo: false,
  });
  const b = rankPrefsKey({
    exclusions: ["xAI", "OpenAI"],
    exclusionsRaw: "xAI, OpenAI",
    deadlinesUnimportant: false,
    premiumsMatter: false,
    premiumsEspeciallyNearIpo: false,
    deadlineInvalid: false,
    ipoPremiumMatters: false,
    buyDespiteIpo: false,
  });
  assert.equal(a, b);

  const overview = readFileSync(new URL("../components/OverviewView.tsx", import.meta.url), "utf8");
  assert.match(overview, /useEffect\(\(\) => \{\s*restoreRankSession\(rankPrefsKey\(\)\);\s*\}, \[\]\);/);
  assert.doesNotMatch(overview, /loadInitialRanking/);
  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const values = [...i18n.matchAll(/"top3\.restored":\s*"([^"]*)"/g)].map((match) => match[1]);
  assert.deepEqual(values, ["z {time}", "from {time}"]);
});
