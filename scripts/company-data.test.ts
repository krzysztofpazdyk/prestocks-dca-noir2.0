import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { rankResultFromProxy } from "../lib/dca-api";
import {
  applyCompanyData,
  companyDataFromRankMap,
  COMPANY_DATA_KEY,
  deadlineKnown,
  formatCompanyDate,
  mergeCompanyData,
  normalizeCompanyData,
  rememberCompanyRecords,
  toggleAvailability,
  type CompanyData,
} from "../lib/company-data";
import { parseJupResponse, type JupPrices } from "../lib/jup-prices";
import { metricsRank } from "../lib/metrics-rank";
import { livePremiumPct } from "../lib/premium-view";
import { buildProducts } from "../lib/prestocks";
import { priceRows } from "../lib/price-rows";
import { filterExpired, filterIpoCompleted } from "../lib/rank-prefs";
import { MINTS, type PrestocksProduct } from "../lib/universe";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const FRESH = new Date(NOW - 60 * 60 * 1000).toISOString();
const DAY = 24 * 60 * 60 * 1000;

const PREFS_ON = {
  premiumsMatter: true,
  premiumsEspeciallyNearIpo: true,
  buyDespiteIpo: true,
  deadlinesUnimportant: true,
};

function product(name: string, extra: Partial<PrestocksProduct> = {}): PrestocksProduct {
  return {
    name,
    symbol: name.toUpperCase(),
    mint: MINTS[name] ?? "",
    token_price_usd: 1,
    mark_price_usd: 1,
    premium_pct: 0,
    premium_source: "hardcoded_fallback",
    near_ipo: false,
    ...extra,
  };
}

function universe(): PrestocksProduct[] {
  return Object.keys(MINTS).map((name) => product(name));
}

function wire(extra: Record<string, unknown>): CompanyData {
  const rec = normalizeCompanyData(
    { source: "https://example.com/src", checkedAt: FRESH, ...extra },
    NOW,
  );
  assert.ok(rec);
  return rec;
}

test("livePremiumPct matches the price panel, and stale SpaceX stock data is null", () => {
  const raw: Record<string, unknown> = {};
  for (const mint of Object.values(MINTS)) {
    raw[mint] = {
      usdPrice: 80,
      liquidity: 80_000,
      stockData: {
        id: "prestocks",
        price: 100,
        updatedAt: new Date(NOW - 3_600_000).toISOString(),
      },
    };
  }
  const prices: JupPrices = {
    quotes: parseJupResponse(raw, NOW),
    fetchedAt: NOW,
    source: "live",
    suspect: [],
    carried: [],
  };
  const row = priceRows(prices.quotes, prices.fetchedAt, {
    source: "live",
    suspect: [],
  }).find((item) => item.name === "Anduril");
  assert.equal(livePremiumPct("Anduril", prices), row?.premiumPct);
  assert.ok(row?.premiumPct != null);

  const staleRaw: Record<string, unknown> = {
    [MINTS.SpaceX]: {
      usdPrice: 80,
      liquidity: 80_000,
      stockData: {
        id: "prestocks",
        price: 100,
        updatedAt: new Date(NOW - 73 * 60 * 60 * 1000).toISOString(),
      },
    },
  };
  const stale: JupPrices = {
    quotes: parseJupResponse(staleRaw, NOW),
    fetchedAt: NOW,
    source: "live",
    suspect: [],
    carried: [],
  };
  assert.equal(livePremiumPct("SpaceX", stale), null);
});

test("metricsRank ignores hardcoded premiums and does not give SpaceX a near-IPO bonus", () => {
  const live = buildProducts(
    [],
    parseJupResponse(
      Object.fromEntries(
        Object.values(MINTS).map((mint) => [
          mint,
          {
            usdPrice: 80,
            liquidity: 80_000,
            stockData: {
              id: "prestocks",
              price: 100,
              updatedAt: new Date(NOW - 3_600_000).toISOString(),
            },
          },
        ]),
      ),
      NOW,
    ),
    NOW,
  );
  const ranked = metricsRank(live, [], PREFS_ON);
  const sx = ranked.scores.find((row) => row.name === "SpaceX");
  const anth = ranked.scores.find((row) => row.name === "Anthropic");
  assert.ok(sx && anth);
  assert.equal(sx.near_ipo, false);
  assert.equal(sx.score, anth.score);
  assert.equal(ranked.premiumBasis, "live");

  const sample = live[0];
  const hard = metricsRank(
    [{ ...sample, premium_pct: -21.7, premium_source: "hardcoded_fallback", near_ipo: false }],
    [],
    PREFS_ON,
  );
  assert.equal(hard.scores[0].score, 50);
  const used = metricsRank(
    [{ ...sample, premium_pct: -20, premium_source: "jupiter_stockdata", near_ipo: false }],
    [],
    PREFS_ON,
  );
  assert.equal(used.scores[0].score, 70);
  const off = metricsRank(live, [], { ...PREFS_ON, premiumsMatter: false });
  assert.equal(off.premiumBasis, "none");
  assert.equal(off.scores.every((row) => row.score === 50), true);
});

test("rankResultFromProxy reports the server premium basis and does not mark unknown SpaceX near IPO", () => {
  const result = rankResultFromProxy(
    { ok: true, top3: [{ name: "SpaceX", score: 12 }] },
    [],
    { premiumsMatter: true },
  );
  assert.equal(result.premiumBasis, "server_estimate");
  assert.equal(result.top3[0].near_ipo, false);
  const ignored = rankResultFromProxy(
    { ok: true, top3: [{ name: "OpenAI", score: 1 }] },
    [],
    { premiumsMatter: false },
  );
  assert.equal(ignored.premiumBasis, "none");
});

test("Top-3 premium text uses the live helper and Settings disables both data toggles", () => {
  const overview = readFileSync(new URL("../components/OverviewView.tsx", import.meta.url), "utf8");
  const start = overview.indexOf("function premiumText");
  const fn = overview.slice(start, overview.indexOf("const pricesReady", start));
  assert.match(fn, /livePremiumPct/);
  assert.doesNotMatch(fn, /premium\.estimate/);
  assert.doesNotMatch(overview, /premium\.estimate/);
  assert.match(overview, /rank\.premiumBasis\.\$\{premiumBasis\}/);

  const settings = readFileSync(new URL("../components/SettingsView.tsx", import.meta.url), "utf8");
  assert.match(settings, /disabled=\{!availability\.buyDespiteIpo\.enabled\}/);
  assert.match(settings, /disabled=\{!availability\.deadlinesUnimportant\.enabled\}/);
  assert.match(settings, /t\("settings\.noData"\)/);
  assert.match(settings, /t\("settings\.buyDespiteIpo"\)/);
  assert.match(settings, /t\("settings\.deadlineInvalid"\)/);

  const ai = readFileSync(new URL("../lib/ai-rank.ts", import.meta.url), "utf8");
  for (const line of ai.split("\n")) {
    if (/near[- ]IPO/i.test(line)) {
      assert.equal(line.includes("SpaceX"), false, line);
    }
  }
  assert.match(ai, /near_ipo_examples:\s*\[\s*\]/);
});

test("no company data leaves products unchanged and both toggles off", () => {
  const rows = universe();
  rows[0] = product("Anthropic");
  const availability = toggleAvailability({}, NOW);
  assert.equal(availability.buyDespiteIpo.enabled, false);
  assert.equal(availability.deadlinesUnimportant.enabled, false);
  const next = applyCompanyData(rows, {}, NOW);
  assert.deepEqual(next, rows);
  assert.equal(next[0], rows[0]);
});

test("fresh listed SpaceX enables the IPO toggle and the IPO filter drops only SpaceX", () => {
  const data = wire({
    ipoStatus: "listed",
    ipoDate: "2026-06-12T00:00:00Z",
    source: "https://example.com/spacex",
  });
  const availability = toggleAvailability({ SpaceX: data }, NOW);
  assert.equal(availability.buyDespiteIpo.enabled, true);
  assert.deepEqual(availability.buyDespiteIpo.known, ["SpaceX"]);
  const applied = applyCompanyData(universe(), { SpaceX: data }, NOW);
  assert.equal(applied.find((row) => row.name === "SpaceX")?.ipo_completed, true);
  const filtered = filterIpoCompleted(applied, false);
  assert.equal(filtered.some((row) => row.name === "SpaceX"), false);
  assert.equal(filtered.length, 7);
});

test("mixed company data enables both toggles and filters only the known names", () => {
  const spacex = wire({
    ipoStatus: "listed",
    ipoDate: "2026-06-12T00:00:00Z",
    source: "https://example.com/spacex",
  });
  const kalshi = wire({
    deadline: "2026-01-01T00:00:00Z",
    source: "https://example.com/kalshi",
  });
  const byName = { SpaceX: spacex, Kalshi: kalshi };
  const availability = toggleAvailability(byName, NOW);
  assert.equal(availability.buyDespiteIpo.enabled, true);
  assert.equal(availability.deadlinesUnimportant.enabled, true);
  const rest = ["Anthropic", "OpenAI", "Anduril", "Neuralink", "FigureAI", "Polymarket"];
  for (const name of rest) {
    assert.equal(availability.buyDespiteIpo.unknown.includes(name), true, name);
    assert.equal(availability.deadlinesUnimportant.unknown.includes(name), true, name);
  }
  assert.equal(availability.buyDespiteIpo.unknown.includes("Kalshi"), true);
  assert.equal(availability.deadlinesUnimportant.unknown.includes("SpaceX"), true);
  const applied = applyCompanyData(universe(), byName, NOW);
  assert.equal(applied.filter((row) => row.deadline_invalid).map((row) => row.name).join(), "Kalshi");
  const kept = filterExpired(filterIpoCompleted(applied, false), false);
  assert.equal(kept.length, 6);
  for (const name of rest) {
    assert.equal(kept.some((row) => row.name === name), true, name);
  }
});

test("an 8-day-old record is stale and does not enable the only toggle", () => {
  const stale = wire({
    ipoStatus: "listed",
    ipoDate: "2026-06-12T00:00:00Z",
    checkedAt: new Date(NOW - 8 * DAY).toISOString(),
  });
  const availability = toggleAvailability({ SpaceX: stale }, NOW);
  assert.equal(availability.buyDespiteIpo.enabled, false);
  assert.deepEqual(availability.buyDespiteIpo.stale, ["SpaceX"]);
  assert.equal(availability.buyDespiteIpo.known.includes("SpaceX"), false);
  const rows = universe();
  const next = applyCompanyData(rows, { SpaceX: stale }, NOW);
  const sx = next.find((row) => row.name === "SpaceX");
  assert.equal(sx, rows.find((row) => row.name === "SpaceX"));
  assert.notEqual(sx?.ipo_completed, true);
});

test("company data validation rejects bad records and accepts snake_case", () => {
  assert.equal(normalizeCompanyData({ ipoStatus: "listed", checkedAt: FRESH }, NOW), null);
  assert.equal(
    normalizeCompanyData(
      { source: "http://example.com", checkedAt: FRESH, ipoStatus: "listed" },
      NOW,
    ),
    null,
  );
  assert.equal(
    normalizeCompanyData(
      { source: "https://example.com", checkedAt: FRESH, ipoStatus: "foo" },
      NOW,
    ),
    null,
  );
  const open = normalizeCompanyData(
    {
      source: "https://example.com",
      checkedAt: FRESH,
      ipoStatus: "listed",
      ipoDate: "2026-06-12T00:00:00Z",
      deadline: null,
    },
    NOW,
  );
  assert.ok(open);
  assert.equal(deadlineKnown(open, NOW), false);
  assert.equal(
    normalizeCompanyData(
      {
        source: "https://example.com",
        checkedAt: new Date(NOW + 2 * 60 * 60 * 1000).toISOString(),
        ipoStatus: "none",
      },
      NOW,
    ),
    null,
  );
  assert.ok(
    normalizeCompanyData(
      {
        source: "https://example.com",
        checkedAt: new Date(NOW + 60 * 60 * 1000).toISOString(),
        ipoStatus: "none",
      },
      NOW,
    ),
  );
  const snake = normalizeCompanyData(
    {
      source: "https://example.com",
      checked_at: FRESH,
      ipo_status: "listed",
      ipo_date: "2026-06-12T00:00:00Z",
    },
    NOW,
  );
  assert.ok(snake);
  assert.equal(snake.ipoStatus, "listed");
  assert.equal(snake.ipoDate, Date.parse("2026-06-12T00:00:00Z"));
});

test("announced inside 90 days is near IPO; 120 days and rumored are not", () => {
  const soon = wire({
    ipoStatus: "announced",
    ipoDate: new Date(NOW + 30 * DAY).toISOString(),
  });
  const later = wire({
    ipoStatus: "announced",
    ipoDate: new Date(NOW + 120 * DAY).toISOString(),
  });
  const rumor = wire({ ipoStatus: "rumored" });
  assert.equal(applyCompanyData([product("Kalshi")], { Kalshi: soon }, NOW)[0].near_ipo, true);
  assert.equal(applyCompanyData([product("Kalshi")], { Kalshi: later }, NOW)[0].near_ipo, false);
  assert.equal(applyCompanyData([product("Kalshi")], { Kalshi: rumor }, NOW)[0].near_ipo, false);
});

test("a newer /rank company_data record wins over the products record", () => {
  const older = wire({ ipoStatus: "rumored", checkedAt: new Date(NOW - 2 * DAY).toISOString() });
  const newer = wire({
    ipoStatus: "listed",
    ipoDate: "2026-06-12T00:00:00Z",
    checkedAt: FRESH,
    source: "https://example.com/rank",
  });
  assert.equal(mergeCompanyData({ SpaceX: older }, { SpaceX: newer }).SpaceX.ipoStatus, "listed");
  assert.equal(mergeCompanyData({ SpaceX: newer }, { SpaceX: older }).SpaceX.ipoStatus, "listed");
  const mem = new Map<string, string>();
  const storage = {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
  };
  rememberCompanyRecords({ SpaceX: older }, NOW, storage);
  const fromRank = companyDataFromRankMap(
    {
      OURA: { source: "https://example.com/oura", checkedAt: FRESH, ipoStatus: "listed" },
      xAI: { source: "https://example.com/xai", checkedAt: FRESH, ipoStatus: "listed" },
      spacex: {
        source: "https://example.com/rank",
        checkedAt: FRESH,
        ipoStatus: "listed",
        ipoDate: "2026-06-12T00:00:00Z",
      },
    },
    NOW,
  );
  assert.deepEqual(Object.keys(fromRank), ["SpaceX"]);
  rememberCompanyRecords(fromRank, NOW, storage);
  const saved = JSON.parse(storage.getItem(COMPANY_DATA_KEY) ?? "{}") as {
    byName: Record<string, CompanyData>;
  };
  assert.equal(saved.byName.SpaceX.ipoStatus, "listed");
  assert.equal(saved.byName.SpaceX.source, "https://example.com/rank");
  assert.equal(saved.byName.OURA, undefined);
});

test("company dates use Warsaw day-month order and the IPO copy stays put", () => {
  const listed = Date.parse("2026-06-12T00:00:00Z");
  assert.equal(formatCompanyDate(listed, "pl", "full"), "12.06.2026");
  assert.equal(formatCompanyDate(listed, "pl", "short"), "12.06");
  assert.equal(formatCompanyDate(listed, "en", "full"), "12/06/2026");
  assert.equal(formatCompanyDate(listed, "en", "short"), "12/06");

  const src = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  function values(key: string): string[] {
    const re = new RegExp(`"${key}":\\s*"([^"]*)"`, "g");
    return [...src.matchAll(re)].map((match) => match[1]);
  }
  const keys = [
    "rank.premiumBasis.server_estimate",
    "rank.premiumBasis.live",
    "rank.premiumBasis.none",
    "settings.noData",
    "settings.noDataTooltip",
    "settings.dataKnown",
    "settings.dataUnknown",
    "settings.dataStale",
    "settings.ipoListed",
    "settings.ipoAnnounced",
    "settings.deadlineOn",
    "settings.checkedOn",
    "settings.deadlineInvalid",
  ];
  for (const key of keys) assert.equal(values(key).length, 2, key);
  assert.deepEqual(values("settings.noData"), ["brak danych", "no data"]);
  assert.deepEqual(values("settings.deadlineInvalid"), [
    "Dopuszczaj tokeny po terminie ważności lub z nieważnym terminem (po dacie końcowej są bezwartościowe).",
    "Allow tokens past their expiry or with an invalid deadline (they are worthless after the end date).",
  ]);
  assert.deepEqual(values("settings.buyDespiteIpo"), [
    "Kup PreStock mimo odbytego IPO",
    "Buy PreStock even after IPO",
  ]);
  assert.deepEqual(values("settings.ipoPremium"), [
    "Premia IPO ma znaczenie (uwzględniaj różnicę wyceny tokenu względem rynku, np. −20% / +34%).",
    "IPO premium matters (factor in token vs market pricing gap, e.g. −20% / +34%).",
  ]);
  assert.deepEqual(values("rank.premiumBasis.none"), [
    "Ranking bez premii (przełącznik wyłączony).",
    "Ranking ignores premiums (toggle off).",
  ]);
});
