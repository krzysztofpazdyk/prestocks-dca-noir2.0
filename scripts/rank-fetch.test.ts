import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { rankResultFromProxy } from "../lib/dca-api";
import { emptyJupPrices } from "../lib/jup-prices";
import { dcaApiBase, LS_XAI } from "../lib/keys";
import { fetchPrestocksProducts } from "../lib/prestocks";
import { isFlatFallback } from "../lib/ranking";
import { MINTS, type RankResult, type RankRow } from "../lib/universe";

function rank(partial: Partial<RankResult>): RankResult {
  return {
    mode: "metrics_fallback",
    sourceLabel: "",
    pipeline: ["prestocks", "metrics_rank"],
    top3: [],
    scores: [],
    products: [],
    fetchedAt: "2026-10-10T12:00:00Z",
    premiumBasis: "none",
    ...partial,
  };
}

function rows(scores: number[]): RankRow[] {
  return scores.map((score, index) => ({ score, name: `N${index}` }) as RankRow);
}

test("isFlatFallback is only an all-equal metrics backup", () => {
  assert.equal(isFlatFallback(rank({ top3: rows([50, 50, 50]) })), true);
  assert.equal(isFlatFallback(rank({ top3: rows([50, 50, 51]) })), false);
  assert.equal(
    isFlatFallback(rank({ mode: "hosted_jev", top3: rows([50, 50, 50]) })),
    false,
  );
  assert.equal(isFlatFallback(rank({ top3: rows([50]) })), false);
  assert.equal(isFlatFallback(null), false);
});

test("Grok in the label follows the pipeline, not a stored xAI key", () => {
  const previous = globalThis.localStorage;
  const mem = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  try {
    localStorage.setItem(LS_XAI, "xai-test-key");
    const jev = rankResultFromProxy(
      { ok: true, top3: [{ name: "OpenAI", score: 1 }], pipeline: ["prestocks", "jev"] },
      [],
      { premiumsMatter: false },
    );
    assert.equal(jev.sourceLabel.includes("Grok"), false);
    const grok = rankResultFromProxy(
      {
        ok: true,
        top3: [{ name: "OpenAI", score: 1 }],
        pipeline: ["prestocks", "grok", "jev"],
      },
      [],
      { premiumsMatter: false },
    );
    assert.equal(grok.sourceLabel.includes("Grok+Jev"), true);
  } finally {
    if (previous === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      globalThis.localStorage = previous;
    }
  }

  const api = readFileSync(new URL("../lib/dca-api.ts", import.meta.url), "utf8");
  const dry = api.slice(api.indexOf("export async function triggerDryRun"), api.indexOf("export async function fetchSampleRun"));
  assert.match(dry, /pipeline[\s\S]{0,120}includes\("grok"\)/);
  const overview = readFileSync(new URL("../components/OverviewView.tsx", import.meta.url), "utf8");
  const title = overview.slice(
    overview.indexOf("function top3TitleFromRank"),
    overview.indexOf("const BUDGET_EPS"),
  );
  assert.match(title, /includes\("grok"\)/);
  assert.doesNotMatch(title, /sourceLabel/);
  const disabled = overview.slice(
    overview.indexOf("const purchaseDisabled"),
    overview.indexOf("function fmtTile"),
  );
  assert.match(disabled, /rankFlat/);
  const rpc = disabled.indexOf("purchase.disabled.rpcError");
  const flat = disabled.indexOf("purchase.disabled.flatRanking");
  const none = disabled.indexOf("purchase.disabled.noRecs");
  assert.ok(rpc >= 0 && rpc < flat && flat < none);
  assert.match(overview, /productsResult\.errorPl/);
});

function sampleProducts() {
  return Object.keys(MINTS).slice(0, 3).map((name) => ({
    name,
    symbol: name.toUpperCase(),
    mint: MINTS[name],
    token_price_usd: 2,
    mark_price_usd: null,
    premium_pct: 0,
    premium_source: "api_proxy",
    near_ipo: false,
  }));
}

test("product fetch skips dead hosts off localhost and calls Jupiter once", async () => {
  const prevFetch = globalThis.fetch;
  const prevWindow = globalThis.window;
  const prevApi = process.env.NEXT_PUBLIC_DCA_API_URL;
  process.env.NEXT_PUBLIC_DCA_API_URL = "https://predca-api.example/";
  assert.equal(dcaApiBase(), "https://predca-api.example");
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/prestocks/products")) {
      return new Response(JSON.stringify({ products: sampleProducts() }), { status: 200 });
    }
    if (url.includes("lite-api.jup.ag")) {
      return new Response("{}", { status: 200 });
    }
    if (url.includes("prestocks.com")) {
      throw new Error("Failed to fetch");
    }
    return new Response(JSON.stringify({ ok: false }), { status: 404 });
  }) as typeof fetch;

  try {
    (globalThis as { window?: Window }).window = {
      location: { hostname: "krzysztofpazdyk.github.io", origin: "https://krzysztofpazdyk.github.io" },
    } as Window;
    calls.length = 0;
    const prices = emptyJupPrices(1_700_000_000_000);
    const offHost = await fetchPrestocksProducts(prices);
    assert.equal(offHost.products.length, 3);
    assert.equal(calls.some((url) => url.includes("/api/prestocks/live/")), false);
    assert.equal(calls.some((url) => url.includes("prestocks.com")), false);
    assert.equal(calls.filter((url) => url.includes("/prestocks/products")).length, 1);
    assert.equal(calls.some((url) => url.includes("lite-api.jup.ag")), false);

    (globalThis as { window?: Window }).window = {
      location: { hostname: "localhost", origin: "http://localhost:3000" },
    } as Window;
    calls.length = 0;
    await fetchPrestocksProducts(prices);
    const liveAt = calls.findIndex((url) => url.includes("/api/prestocks/live/"));
    const directAt = calls.findIndex((url) => url.includes("prestocks.com"));
    const apiAt = calls.findIndex((url) => url.includes("/prestocks/products"));
    assert.ok(liveAt >= 0 && liveAt < directAt && directAt < apiAt);
    assert.equal(calls.some((url) => url.includes("lite-api.jup.ag")), false);

    calls.length = 0;
    await fetchPrestocksProducts();
    assert.equal(calls.filter((url) => url.includes("lite-api.jup.ag")).length, 1);
    const firstLive = calls.findIndex((url) => url.includes("/api/prestocks/live/"));
    const firstDirect = calls.findIndex((url) => url.includes("prestocks.com"));
    const firstApi = calls.findIndex((url) => url.includes("/prestocks/products"));
    assert.ok(firstLive >= 0 && firstLive < firstDirect && firstDirect < firstApi);
  } finally {
    globalThis.fetch = prevFetch;
    if (prevWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      globalThis.window = prevWindow;
    }
    if (prevApi === undefined) delete process.env.NEXT_PUBLIC_DCA_API_URL;
    else process.env.NEXT_PUBLIC_DCA_API_URL = prevApi;
  }
});

test("flat-ranking copy exists in Polish and English", () => {
  const src = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const values = [...src.matchAll(/"purchase\.disabled\.flatRanking":\s*"([^"]*)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(values, [
    "Zakup nieaktywny — ranking awaryjny nie rozróżnia spółek (wszystkie 50,0). Spróbuj ponownie później albo włącz „Premia IPO ma znaczenie”.",
    "Purchase disabled — the backup ranking can't tell names apart (all 50.0). Try again later or turn on “IPO premium matters”.",
  ]);
});
