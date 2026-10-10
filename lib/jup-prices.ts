/**
 * Jupiter Price API v3 for the 8 mainnet PreStock mints.
 * One unauthenticated request. Failures return cache or empty quotes — never throw.
 * Always read `usdPrice` (UI unit). Never `scaledUiConfig.usdPricePrescaled`.
 */

import { MINTS } from "@/lib/universe";

export const JUP_PRICE_DEFAULT = "https://lite-api.jup.ag/price/v3";
export const JUP_CACHE_KEY = "predca.jupPrices.v1";
export const JUP_RETRY_MS = 2000;
export const JUP_TIMEOUT_MS = 8000;

const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Maks. wiek stockData (cena referencyjna PreStocks z Jupitera), po którym premia = „brak danych”.
 * DECYZJA CHRISA (otwarta): 72 h. SpaceX stockData.updatedAt = 2026-10-08 09:20 UTC,
 * więc premia SpaceX przejdzie na „brak danych” ok. 2026-10-11 11:20 CEST.
 */
export const STOCK_DATA_MAX_AGE_MS = 72 * 60 * 60 * 1000;
const CACHE_MAX_AGE_MS = 7 * DAY_MS;
const JUMP_PCT = 0.3;
const CONFIRM_PCT = 0.02;
const PREMIUM_ABS_MAX = 80;
const LOW_LIQUIDITY_USD = 20_000;

export type JupQuote = {
  mint: string;
  name: string;
  usdPrice: number | null;
  stockPrice: number | null;
  stockUpdatedAt: number | null;
  liquidityUsd: number | null;
  multiplierChange: boolean;
};

export type JupPrices = {
  quotes: Record<string, JupQuote>;
  fetchedAt: number;
  source: "live" | "cache";
  suspect: string[];
};

export type JupStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type FetchJupOptions = {
  fetchImpl?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Pass null to skip localStorage. Omit to use the browser store when present. */
  storage?: JupStorage | null;
  timeoutMs?: number;
};

type CachedJup = { quotes: Record<string, JupQuote>; fetchedAt: number };

export function canonicalName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

export function quoteByName(
  quotes: Record<string, JupQuote>,
  name: string,
): JupQuote | undefined {
  if (quotes[name]) return quotes[name];
  const want = canonicalName(name);
  for (const [key, quote] of Object.entries(quotes)) {
    if (canonicalName(key) === want) return quote;
  }
  return undefined;
}

export function isLowLiquidity(q: JupQuote): boolean {
  return q.liquidityUsd != null && q.liquidityUsd < LOW_LIQUIDITY_USD;
}

function positive(v: unknown): number | null {
  if (typeof v === "boolean" || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function finiteNonNeg(v: unknown): number | null {
  if (typeof v === "boolean" || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function toMs(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v < 1e12 ? v * 1000 : v;
  }
  if (typeof v === "string" && v.trim()) {
    const trimmed = v.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) return null;
      return n < 1e12 ? n * 1000 : n;
    }
    const parsed = Date.parse(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function multiplierChanging(scaled: unknown, now: number): boolean {
  if (!scaled || typeof scaled !== "object") return false;
  const at = toMs(
    (scaled as { newMultiplierEffectiveAt?: unknown }).newMultiplierEffectiveAt,
  );
  if (at == null) return false;
  return at > now || now - at < DAY_MS;
}

function blankQuote(name: string, mint: string): JupQuote {
  return {
    mint,
    name,
    usdPrice: null,
    stockPrice: null,
    stockUpdatedAt: null,
    liquidityUsd: null,
    multiplierChange: false,
  };
}

function parseOne(name: string, mint: string, row: unknown, now: number): JupQuote {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return blankQuote(name, mint);
  }
  const rec = row as Record<string, unknown>;
  const stock = rec.stockData;
  let stockPrice: number | null = null;
  let stockUpdatedAt: number | null = null;
  if (stock && typeof stock === "object" && !Array.isArray(stock)) {
    const s = stock as Record<string, unknown>;
    stockPrice = positive(s.price);
    stockUpdatedAt = toMs(s.updatedAt);
  }
  return {
    mint,
    name,
    usdPrice: positive(rec.usdPrice),
    stockPrice,
    stockUpdatedAt,
    liquidityUsd: finiteNonNeg(rec.liquidity),
    multiplierChange: multiplierChanging(rec.scaledUiConfig, now),
  };
}

/** Quotes for every universe name. Unknown mints (OURA, xAI) are ignored. */
export function parseJupResponse(raw: unknown, now: number): Record<string, JupQuote> {
  const src =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const out: Record<string, JupQuote> = {};
  for (const [name, mint] of Object.entries(MINTS)) {
    out[name] = parseOne(name, mint, src[mint], now);
  }
  return out;
}

export function emptyJupPrices(now = 0): JupPrices {
  return {
    quotes: parseJupResponse(null, now),
    fetchedAt: now,
    source: "live",
    suspect: [],
  };
}

/** null = „brak danych” (stale stock, multiplier, missing fields, or |premium| > 80). */
export function ipoPremiumPct(q: JupQuote, now: number): number | null {
  if (q.usdPrice == null || q.stockPrice == null) return null;
  if (q.stockUpdatedAt == null) return null;
  if (now - q.stockUpdatedAt > STOCK_DATA_MAX_AGE_MS) return null;
  if (q.multiplierChange) return null;
  const pct = (q.usdPrice / q.stockPrice - 1) * 100;
  if (!Number.isFinite(pct) || Math.abs(pct) > PREMIUM_ABS_MAX) return null;
  return pct;
}

/** Jump vs a cache younger than 24h. `prevAt` is the cache timestamp. */
export function checkJump(
  prev: JupQuote | undefined,
  next: JupQuote,
  prevAt: number,
  now: number,
): "ok" | "suspect" {
  if (!prev || prev.usdPrice == null || next.usdPrice == null) return "ok";
  if (!(now - prevAt < DAY_MS)) return "ok";
  const rel = relativeMove(prev.usdPrice, next.usdPrice);
  if (rel > JUMP_PCT) return "suspect";
  return "ok";
}

/** Absolute relative move, rounded so a clean 30% or 2% is not a float hair over. */
function relativeMove(prev: number, next: number): number {
  if (prev === 0) return next === 0 ? 0 : Number.POSITIVE_INFINITY;
  return Math.round(Math.abs(next / prev - 1) * 1_000_000) / 1_000_000;
}

export function jupPriceUrl(): string {
  const raw = process.env.NEXT_PUBLIC_JUP_PRICE_URL?.trim() || JUP_PRICE_DEFAULT;
  const base = raw.replace(/\/$/, "");
  const ids = Object.values(MINTS).join(",");
  if (/[?&]ids=/.test(base)) return base;
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}ids=${ids}`;
}

function defaultStorage(): JupStorage | null {
  try {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function sanitizeCachedQuote(name: string, mint: string, v: unknown): JupQuote {
  if (!v || typeof v !== "object" || Array.isArray(v)) return blankQuote(name, mint);
  const q = v as Partial<JupQuote>;
  const updated = q.stockUpdatedAt;
  return {
    mint: typeof q.mint === "string" && q.mint ? q.mint : mint,
    name,
    usdPrice: positive(q.usdPrice),
    stockPrice: positive(q.stockPrice),
    stockUpdatedAt:
      typeof updated === "number" && Number.isFinite(updated) ? updated : null,
    liquidityUsd: finiteNonNeg(q.liquidityUsd),
    multiplierChange: q.multiplierChange === true,
  };
}

export function readJupPriceCache(
  now = Date.now(),
  storage: JupStorage | null = defaultStorage(),
): CachedJup | null {
  if (!storage) return null;
  let raw: string | null = null;
  try {
    raw = storage.getItem(JUP_CACHE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { quotes?: unknown; fetchedAt?: unknown };
    const fetchedAt = Number(parsed.fetchedAt);
    if (!Number.isFinite(fetchedAt)) return null;
    if (now - fetchedAt > CACHE_MAX_AGE_MS) return null;
    const stored =
      parsed.quotes && typeof parsed.quotes === "object"
        ? (parsed.quotes as Record<string, unknown>)
        : {};
    const quotes: Record<string, JupQuote> = {};
    for (const [name, mint] of Object.entries(MINTS)) {
      quotes[name] = sanitizeCachedQuote(name, mint, stored[name]);
    }
    return { quotes, fetchedAt };
  } catch {
    return null;
  }
}

function writeJupPriceCache(
  quotes: Record<string, JupQuote>,
  fetchedAt: number,
  storage: JupStorage | null,
) {
  if (!storage) return;
  try {
    storage.setItem(JUP_CACHE_KEY, JSON.stringify({ quotes, fetchedAt }));
  } catch {
    /* quota / private mode */
  }
}

function cachePrices(cached: CachedJup): JupPrices {
  return {
    quotes: cached.quotes,
    fetchedAt: cached.fetchedAt,
    source: "cache",
    suspect: [],
  };
}

async function fetchJupOnce(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetchImpl(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${url}`);
    return await resp.json();
  } catch (e) {
    const aborted =
      (typeof DOMException !== "undefined" &&
        e instanceof DOMException &&
        e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) throw new Error(`timeout ${url}`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function closeEnough(a: number, b: number): boolean {
  return relativeMove(a, b) <= CONFIRM_PCT;
}

/**
 * One request for 8 mints. A >30% jump vs a <24h cache is retried once after 2s.
 * Timeout, HTTP error, or bad JSON returns cache (max 7 days) or null prices.
 */
export async function fetchJupPrices(opts?: FetchJupOptions): Promise<JupPrices> {
  const now = opts?.now?.() ?? Date.now();
  const storage =
    opts && "storage" in opts ? (opts.storage ?? null) : defaultStorage();
  const cached = readJupPriceCache(now, storage);
  const fetchImpl = opts?.fetchImpl ?? fetch;
  const timeoutMs = opts?.timeoutMs ?? JUP_TIMEOUT_MS;
  const sleep =
    opts?.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const url = jupPriceUrl();

  let raw: unknown;
  try {
    raw = await fetchJupOnce(url, fetchImpl, timeoutMs);
  } catch {
    return cached ? cachePrices(cached) : emptyJupPrices(now);
  }

  const quotes = parseJupResponse(raw, now);
  const suspect: string[] = [];
  const jumped = cached
    ? Object.keys(quotes).filter(
        (name) => checkJump(cached.quotes[name], quotes[name], cached.fetchedAt, now) === "suspect",
      )
    : [];

  if (jumped.length > 0) {
    await sleep(JUP_RETRY_MS);
    try {
      const raw2 = await fetchJupOnce(url, fetchImpl, timeoutMs);
      const second = parseJupResponse(raw2, now);
      for (const name of jumped) {
        const firstPx = quotes[name]?.usdPrice;
        const secondPx = second[name]?.usdPrice;
        if (firstPx != null && secondPx != null && closeEnough(firstPx, secondPx)) {
          quotes[name] = second[name];
        } else if (cached?.quotes[name]) {
          quotes[name] = cached.quotes[name];
          suspect.push(name);
        } else {
          suspect.push(name);
        }
      }
    } catch {
      for (const name of jumped) {
        if (cached?.quotes[name]) quotes[name] = cached.quotes[name];
        suspect.push(name);
      }
    }
  }

  writeJupPriceCache(quotes, now, storage);
  return { quotes, fetchedAt: now, source: "live", suspect };
}
