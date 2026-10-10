import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MINTS, XAI_MINT } from "../lib/universe";
import {
  JUP_CACHE_KEY,
  checkJump,
  emptyJupPrices,
  fetchJupPrices,
  STOCK_DATA_MAX_AGE_MS,
  ipoPremiumPct,
  isLowLiquidity,
  jupPriceUrl,
  parseJupResponse,
  type JupQuote,
  type JupStorage,
} from "../lib/jup-prices";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function memStore(): JupStorage {
  const raw = new Map<string, string>();
  return {
    getItem: (k) => raw.get(k) ?? null,
    setItem: (k, v) => {
      raw.set(k, v);
    },
  };
}

function liveRow(
  usd: number,
  stock = usd,
  updatedAt = new Date(NOW - 60_000).toISOString(),
  extra: Record<string, unknown> = {},
) {
  return {
    usdPrice: usd,
    liquidity: 100_000,
    stockData: { id: "prestocks", price: stock, updatedAt },
    ...extra,
  };
}

function bodyFor(
  priceFor: (name: string) => Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, mint] of Object.entries(MINTS)) {
    const row = priceFor(name);
    if (row) out[mint] = row;
  }
  return out;
}

function quote(partial: Partial<JupQuote> = {}): JupQuote {
  return {
    mint: MINTS.Anthropic,
    name: "Anthropic",
    usdPrice: 100,
    stockPrice: 125,
    stockUpdatedAt: NOW - 1000,
    liquidityUsd: 100_000,
    multiplierChange: false,
    ...partial,
  };
}

function seed(storage: JupStorage, usd: number, fetchedAt: number) {
  const quotes = parseJupResponse(bodyFor(() => liveRow(usd)), fetchedAt);
  storage.setItem(JUP_CACHE_KEY, JSON.stringify({ quotes, fetchedAt }));
}

function scripted(
  steps: Array<{ status?: number; body?: unknown; fail?: "throw" | "bad-json" | "abort" }>,
) {
  const urls: string[] = [];
  let i = 0;
  const fetchImpl = (async (url: string) => {
    urls.push(String(url));
    const step = steps[Math.min(i, steps.length - 1)];
    i += 1;
    if (step.fail === "throw") throw new Error("boom");
    if (step.fail === "abort") {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    }
    if (step.fail === "bad-json") {
      return {
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("bad json");
        },
      } as unknown as Response;
    }
    const status = step.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => step.body,
    } as unknown as Response;
  }) as typeof fetch;
  return { fetchImpl, urls, calls: () => i };
}

test("parse uses usdPrice, keeps 8 mints, ignores prescaled, OURA and xAI", () => {
  const raw = bodyFor((name) => {
    if (name === "SpaceX") {
      return liveRow(10, 12, new Date(NOW - 3_600_000).toISOString(), {
        scaledUiConfig: {
          newMultiplier: 5,
          newMultiplierEffectiveAt: "2026-06-10T00:00:00Z",
          usdPricePrescaled: 50,
        },
      });
    }
    return liveRow(20, 25);
  });
  raw[XAI_MINT] = liveRow(999);
  raw.OURA111111111111111111111111111111111111 = liveRow(1);
  const quotes = parseJupResponse(raw, NOW);
  assert.deepEqual(Object.keys(quotes), Object.keys(MINTS));
  assert.equal(quotes.SpaceX.usdPrice, 10);
  assert.notEqual(quotes.SpaceX.usdPrice, 50);
  assert.equal(quotes.SpaceX.stockPrice, 12);
  assert.equal(quotes.SpaceX.multiplierChange, false);
  assert.equal(quotes.SpaceX.liquidityUsd, 100_000);
  assert.ok(Object.values(quotes).every((q) => q.usdPrice === 10 || q.usdPrice === 20));
  assert.equal("OURA" in quotes, false);
  assert.equal("xAI" in quotes, false);
});

test("missing mint and bad usdPrice become null", () => {
  const quotes = parseJupResponse(
    {
      [MINTS.Anthropic]: { usdPrice: 0, liquidity: 10, stockData: { price: 10, updatedAt: NOW } },
      [MINTS.OpenAI]: { usdPrice: -4 },
      [MINTS.Anduril]: { usdPrice: "abc" },
      [MINTS.Neuralink]: { usdPrice: null },
    },
    NOW,
  );
  assert.equal(quotes.Anthropic.usdPrice, null);
  assert.equal(quotes.OpenAI.usdPrice, null);
  assert.equal(quotes.Anduril.usdPrice, null);
  assert.equal(quotes.Neuralink.usdPrice, null);
  assert.equal(quotes.Kalshi.usdPrice, null);
  assert.equal(quotes.SpaceX.mint, MINTS.SpaceX);
});

test("ipo premium is null when stock, age, magnitude, or multiplier disqualifies it", () => {
  const fresh = ipoPremiumPct(quote(), NOW);
  assert.ok(fresh != null);
  assert.ok(Math.abs(fresh - (100 / 125 - 1) * 100) < 1e-9);
  assert.equal(ipoPremiumPct(quote({ stockPrice: null }), NOW), null);
  assert.equal(ipoPremiumPct(quote({ usdPrice: null }), NOW), null);
  assert.equal(ipoPremiumPct(quote({ stockUpdatedAt: null }), NOW), null);
  assert.equal(
    ipoPremiumPct(quote({ stockUpdatedAt: NOW - 72 * 60 * 60 * 1000 - 1 }), NOW),
    null,
  );
  assert.notEqual(
    ipoPremiumPct(quote({ stockUpdatedAt: NOW - 72 * 60 * 60 * 1000 }), NOW),
    null,
  );
  assert.equal(ipoPremiumPct(quote({ usdPrice: 181, stockPrice: 100 }), NOW), null);
  assert.equal(ipoPremiumPct(quote({ usdPrice: 180, stockPrice: 100 }), NOW), 80);
  assert.equal(ipoPremiumPct(quote({ multiplierChange: true }), NOW), null);
});

test("stockData stays fresh for 72h and drops one second later", () => {
  assert.equal(STOCK_DATA_MAX_AGE_MS, 259_200_000);
  const hour = 60 * 60 * 1000;
  const fresh = ipoPremiumPct(
    quote({ stockUpdatedAt: NOW - STOCK_DATA_MAX_AGE_MS + 1000 }),
    NOW,
  );
  const stale = ipoPremiumPct(
    quote({ stockUpdatedAt: NOW - STOCK_DATA_MAX_AGE_MS - 1000 }),
    NOW,
  );
  assert.equal(typeof fresh, "number");
  assert.equal(stale, null);
  assert.equal(STOCK_DATA_MAX_AGE_MS, 72 * hour);
});

test("multiplier change is set for a future or <24h effective time", () => {
  const future = parseJupResponse(
    {
      [MINTS.SpaceX]: liveRow(10, 12, new Date(NOW).toISOString(), {
        scaledUiConfig: { newMultiplierEffectiveAt: new Date(NOW + 60_000).toISOString() },
      }),
    },
    NOW,
  );
  const recent = parseJupResponse(
    {
      [MINTS.OpenAI]: liveRow(10, 12, new Date(NOW).toISOString(), {
        scaledUiConfig: {
          newMultiplierEffectiveAt: new Date(NOW - 23 * 60 * 60 * 1000).toISOString(),
        },
      }),
    },
    NOW,
  );
  const old = parseJupResponse(
    {
      [MINTS.OpenAI]: liveRow(10, 12, new Date(NOW).toISOString(), {
        scaledUiConfig: {
          newMultiplierEffectiveAt: new Date(NOW - 25 * 60 * 60 * 1000).toISOString(),
        },
      }),
    },
    NOW,
  );
  assert.equal(future.SpaceX.multiplierChange, true);
  assert.equal(ipoPremiumPct(future.SpaceX, NOW), null);
  assert.equal(recent.OpenAI.multiplierChange, true);
  assert.equal(ipoPremiumPct(recent.OpenAI, NOW), null);
  assert.equal(old.OpenAI.multiplierChange, false);
  assert.notEqual(ipoPremiumPct(old.OpenAI, NOW), null);
});

test("a confirmed >30% jump is accepted; an unconfirmed jump keeps cache", async () => {
  const storage = memStore();
  seed(storage, 100, NOW - 60_000);
  let slept = 0;
  const confirmed = scripted([
    { body: bodyFor((name) => liveRow(name === "Anthropic" ? 140 : 110)) },
    { body: bodyFor((name) => liveRow(name === "Anthropic" ? 141 : 999)) },
  ]);
  const ok = await fetchJupPrices({
    fetchImpl: confirmed.fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {
      slept += 1;
    },
  });
  assert.equal(slept, 1);
  assert.equal(confirmed.calls(), 2);
  assert.equal(ok.source, "live");
  assert.equal(ok.quotes.Anthropic.usdPrice, 141);
  assert.deepEqual(ok.suspect, []);
  assert.equal(ok.quotes.OpenAI.usdPrice, 110);

  const storage2 = memStore();
  seed(storage2, 100, NOW - 60_000);
  const rejected = scripted([
    { body: bodyFor((name) => liveRow(name === "Anthropic" ? 140 : 110)) },
    { body: bodyFor((name) => liveRow(name === "Anthropic" ? 100 : 999)) },
  ]);
  const bad = await fetchJupPrices({
    fetchImpl: rejected.fetchImpl,
    storage: storage2,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(bad.quotes.Anthropic.usdPrice, 100);
  assert.deepEqual(bad.suspect, ["Anthropic"]);
  assert.equal(bad.quotes.OpenAI.usdPrice, 110);
  assert.equal(bad.source, "live");
});

test("checkJump ignores a 30% move and a cache that is 24h old", () => {
  const prev = quote({ usdPrice: 100 });
  const next = quote({ usdPrice: 130 });
  assert.equal(checkJump(prev, next, NOW - 60_000, NOW), "ok");
  assert.equal(checkJump(prev, quote({ usdPrice: 130.02 }), NOW - 60_000, NOW), "suspect");
  assert.equal(checkJump(prev, quote({ usdPrice: 200 }), NOW - DAY, NOW), "ok");
  assert.equal(checkJump(undefined, next, NOW, NOW), "ok");
});

test("jupiter timeout, HTTP 500, and bad JSON return cache and never throw", async () => {
  for (const fail of ["abort", "throw", "bad-json"] as const) {
    const storage = memStore();
    seed(storage, 77, NOW - 60_000);
    const script = scripted([{ fail }]);
    const got = await fetchJupPrices({
      fetchImpl: script.fetchImpl,
      storage,
      now: () => NOW,
      timeoutMs: 20,
      sleep: async () => {},
    });
    assert.equal(got.source, "cache");
    assert.equal(got.quotes.Anthropic.usdPrice, 77);
    assert.equal(script.calls(), 1);
  }
  const http = scripted([{ status: 500, body: {} }]);
  const storage = memStore();
  seed(storage, 55, NOW - 1000);
  const got = await fetchJupPrices({
    fetchImpl: http.fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(got.source, "cache");
  assert.equal(got.quotes.SpaceX.usdPrice, 55);
});

test("no cache on failure yields null prices and does not throw", async () => {
  const script = scripted([{ fail: "throw" }]);
  const got = await fetchJupPrices({
    fetchImpl: script.fetchImpl,
    storage: memStore(),
    now: () => NOW,
    sleep: async () => {
      throw new Error("should not retry");
    },
  });
  assert.equal(got.source, "live");
  assert.ok(Object.values(got.quotes).every((q) => q.usdPrice == null));
  assert.equal(Object.keys(got.quotes).length, 8);
});

test("cache older than 7 days is ignored", async () => {
  const storage = memStore();
  seed(storage, 123, NOW - 7 * DAY - 1);
  const script = scripted([{ fail: "throw" }]);
  const got = await fetchJupPrices({
    fetchImpl: script.fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(got.quotes.Anthropic.usdPrice, null);
  assert.equal(got.source, "live");
  assert.notEqual(got.fetchedAt, NOW - 7 * DAY - 1);
});

test("price url lists the 8 universe mints and not xAI", () => {
  const prev = process.env.NEXT_PUBLIC_JUP_PRICE_URL;
  delete process.env.NEXT_PUBLIC_JUP_PRICE_URL;
  try {
    const url = jupPriceUrl();
    for (const mint of Object.values(MINTS)) {
      assert.equal(url.split(mint).length, 2, mint);
    }
    assert.equal(url.includes(XAI_MINT), false);
    assert.match(url, /^https:\/\/lite-api\.jup\.ag\/price\/v3\?ids=/);
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_JUP_PRICE_URL;
    else process.env.NEXT_PUBLIC_JUP_PRICE_URL = prev;
  }
  const empty = emptyJupPrices(0);
  assert.equal(Object.keys(empty.quotes).length, 8);
});

test("a partial Jupiter response keeps a cached price and a later failure still has it", async () => {
  const storage = memStore();
  const full = await fetchJupPrices({
    fetchImpl: scripted([{ body: bodyFor(() => liveRow(10)) }]).fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.deepEqual(full.carried, []);
  assert.equal(full.quotes.OpenAI.usdPrice, 10);

  const partial = scripted([
    { body: bodyFor((name) => (name === "Anthropic" ? liveRow(11) : undefined)) },
  ]);
  const got = await fetchJupPrices({
    fetchImpl: partial.fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(got.source, "live");
  assert.equal(got.quotes.Anthropic.usdPrice, 11);
  assert.equal(got.quotes.OpenAI.usdPrice, 10);
  assert.ok(got.carried.includes("OpenAI"));
  assert.equal(got.carried.includes("Anthropic"), false);
  const saved = JSON.parse(storage.getItem(JUP_CACHE_KEY) ?? "{}") as {
    quotes: Record<string, { usdPrice: number | null }>;
  };
  assert.equal(saved.quotes.OpenAI.usdPrice, 10);

  const down = await fetchJupPrices({
    fetchImpl: scripted([{ fail: "throw" }]).fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.notEqual(down.quotes.OpenAI.usdPrice, null);
  assert.equal(down.quotes.OpenAI.usdPrice, 10);
});

test("a full Jupiter response carries nothing", async () => {
  const storage = memStore();
  seed(storage, 8, NOW - 60_000);
  const got = await fetchJupPrices({
    fetchImpl: scripted([{ body: bodyFor(() => liveRow(9)) }]).fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.deepEqual(got.carried, []);
  assert.equal(got.quotes.OpenAI.usdPrice, 9);
});

test("a cache older than 7 days is not carried into a partial response", async () => {
  const storage = memStore();
  seed(storage, 123, NOW - 7 * DAY - 1);
  const got = await fetchJupPrices({
    fetchImpl: scripted([
      { body: bodyFor((name) => (name === "Anthropic" ? liveRow(4) : undefined)) },
    ]).fetchImpl,
    storage,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(got.quotes.OpenAI.usdPrice, null);
  assert.equal(got.carried.includes("OpenAI"), false);
  assert.equal(got.quotes.Anthropic.usdPrice, 4);
});

test("low liquidity keeps the price and flags under $20k", () => {
  const thin = parseJupResponse(
    { [MINTS.Kalshi]: { ...liveRow(4, 5), liquidity: 19_999 } },
    NOW,
  );
  assert.equal(thin.Kalshi.usdPrice, 4);
  assert.equal(isLowLiquidity(thin.Kalshi), true);
  const deep = quote({ liquidityUsd: 20_000 });
  assert.equal(isLowLiquidity(deep), false);
  assert.equal(isLowLiquidity(quote({ liquidityUsd: null })), false);
});

test("a carried price expires 7 days after the real read, not the last cache write", async () => {
  const storage = memStore();
  const day0 = NOW;
  let now = day0;
  await fetchJupPrices({
    fetchImpl: scripted([{ body: bodyFor(() => liveRow(10)) }]).fetchImpl,
    storage,
    now: () => now,
    sleep: async () => {},
  });

  now = day0 + 6 * DAY;
  const day6 = await fetchJupPrices({
    fetchImpl: scripted([
      { body: bodyFor((name) => (name === "Anthropic" ? liveRow(11) : undefined)) },
    ]).fetchImpl,
    storage,
    now: () => now,
    sleep: async () => {},
  });
  assert.equal(day6.quotes.OpenAI.usdPrice, 10);
  assert.ok(day6.carried.includes("OpenAI"));
  assert.equal(day6.carriedAt?.OpenAI, day0);
  const saved6 = JSON.parse(storage.getItem(JUP_CACHE_KEY) ?? "{}") as {
    fetchedAt: number;
    priceAt: Record<string, number>;
  };
  assert.equal(saved6.fetchedAt, now);
  assert.equal(saved6.priceAt.OpenAI, day0);
  assert.equal(saved6.priceAt.Anthropic, now);

  now = day0 + 12 * DAY;
  const day12 = await fetchJupPrices({
    fetchImpl: scripted([
      { body: bodyFor((name) => (name === "Anthropic" ? liveRow(12) : undefined)) },
    ]).fetchImpl,
    storage,
    now: () => now,
    sleep: async () => {},
  });
  assert.equal(day12.quotes.OpenAI.usdPrice, null);
  assert.equal(day12.carried.includes("OpenAI"), false);
  assert.equal(day12.quotes.Anthropic.usdPrice, 12);

  const legacy = memStore();
  const seen = NOW - 6 * DAY;
  seed(legacy, 7, seen);
  const fromLegacy = await fetchJupPrices({
    fetchImpl: scripted([
      { body: bodyFor((name) => (name === "Anthropic" ? liveRow(4) : undefined)) },
    ]).fetchImpl,
    storage: legacy,
    now: () => NOW,
    sleep: async () => {},
  });
  assert.equal(fromLegacy.quotes.OpenAI.usdPrice, 7);
  assert.ok(fromLegacy.carried.includes("OpenAI"));
  assert.equal(fromLegacy.carriedAt?.OpenAI, seen);

  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(overview, /carriedAt\?\.\[name\]/);
  assert.match(overview, /fmtPriceClock\(at, now, locale\)/);
});
