/**
 * Live PreStocks public APIs (no keys) — the ranking input when Grok is absent.
 * Prefer same-origin /api/prestocks/live (next dev) so CORS cannot block
 * prestocks.com. Then direct → DCA API → session → static snapshot.
 */

import {
  applyCompanyData,
  companyDataFromProducts,
  rememberCompanyRecords,
} from "@/lib/company-data";
import {
  canonicalName,
  fetchJupPrices,
  ipoPremiumPct,
  quoteByName,
  readJupPriceCache,
  type JupPrices,
  type JupQuote,
} from "@/lib/jup-prices";
import { canUseSameOriginJevProxy, dcaApiBase, SS_PRODUCTS } from "@/lib/keys";
import {
  HARDCODED_PREMIUMS_PCT,
  MINTS,
  NEAR_IPO_NAMES,
  SYMBOL_BY_NAME,
  XAI_MINT,
  type PrestocksProduct,
} from "@/lib/universe";

/** Static snapshot file date (`public/data/prestocks-snapshot.json`). */
export const PRESTOCKS_SNAPSHOT_DATE = "19.09.2026";

const ORIGIN = "https://prestocks.com";

export type ProductsFetchResult = {
  products: PrestocksProduct[];
  totals: unknown;
  premiumsSource: string;
  dataSource: "live" | "live_proxy" | "api_proxy" | "session" | "snapshot";
  corsError: boolean;
  errorPl: string | null;
};

function assetUrl(path: string): string {
  const base = (
    process.env.NEXT_PUBLIC_BASE_PATH || "/prestocks-dca-noir2.0"
  ).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}


/** Map optional metrics expiry/deadline signals → deadline_invalid (do not invent). */
export function deadlineInvalidFromMetrics(
  m: Record<string, unknown>,
): boolean {
  const boolKeys = [
    "deadline_invalid",
    "deadlineInvalid",
    "expired",
    "is_expired",
    "isExpired",
  ] as const;
  for (const key of boolKeys) {
    if (!(key in m) || m[key] == null) continue;
    const v = m[key];
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (["1", "true", "yes", "on", "expired", "invalid"].includes(s)) {
        return true;
      }
      if (["0", "false", "no", "off", "valid", "ok"].includes(s)) {
        return false;
      }
    }
  }
  const dateKeys = [
    "expires_at",
    "expiry",
    "expiry_date",
    "deadline",
    "deadline_at",
  ] as const;
  const now = Date.now();
  for (const key of dateKeys) {
    if (!(key in m) || m[key] == null || m[key] === "") continue;
    const raw = m[key];
    let ms: number | null = null;
    if (typeof raw === "number" && Number.isFinite(raw)) {
      ms = raw < 1e12 ? raw * 1000 : raw;
    } else if (typeof raw === "string") {
      const t = Date.parse(raw);
      if (Number.isFinite(t)) ms = t;
    }
    if (ms != null && ms < now) return true;
  }
  return false;
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function positivePrice(v: unknown): number | null {
  if (typeof v === "boolean" || v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Ranking still stores a number. The UI does not display `hardcoded_fallback`. */
export function summarizePremiumSource(products: PrestocksProduct[]): string {
  if (products.some((p) => p.premium_source === "jupiter_stockdata")) {
    return "jupiter_stockdata";
  }
  return "hardcoded_fallback (no live jupiter premium)";
}

export function buildProducts(
  metrics: Array<Record<string, unknown>>,
  quotes: Record<string, JupQuote>,
  now = Date.now(),
): PrestocksProduct[] {
  const byMint = new Map<string, Record<string, unknown>>();
  for (const m of metrics) {
    const mint = (m.splMint as string | undefined) ?? undefined;
    if (mint) byMint.set(mint, m);
  }

  const out: PrestocksProduct[] = [];
  for (const [name, mint] of Object.entries(MINTS)) {
    if (mint === XAI_MINT) continue;
    const m = byMint.get(mint) ?? {};
    const sym = SYMBOL_BY_NAME[name];
    const quote = quotes[name];
    const tokenPrice = positivePrice(m.tokenPrice) ?? quote?.usdPrice ?? null;
    const premium = quote ? ipoPremiumPct(quote, now) : null;
    let premium_pct: number;
    let premium_source: string;
    let markOut: number | null = null;
    if (premium != null && quote?.stockPrice != null) {
      premium_pct = premium;
      premium_source = "jupiter_stockdata";
      markOut = quote.stockPrice;
    } else {
      premium_pct = HARDCODED_PREMIUMS_PCT[name] ?? 0;
      premium_source = "hardcoded_fallback";
    }
    out.push({
      name,
      symbol: sym,
      mint,
      token_price_usd: tokenPrice != null ? round6(tokenPrice) : null,
      mark_price_usd: markOut != null ? round6(markOut) : null,
      premium_pct: round3(premium_pct),
      premium_source,
      market_cap_usd: (m.marketCapUSD as number) ?? null,
      holders: (m.holderCount as number) ?? null,
      volume_cum_usd: (m.cumulativeVolumeUSD as number) ?? null,
      txn_count: (m.txnCount as number) ?? null,
      change_30d_pct: (m.thirtyDayChange as number) ?? null,
      near_ipo: NEAR_IPO_NAMES.some((entry) => entry === name),
      ipo_completed: Boolean(
        m.ipo_completed ?? m.ipoCompleted ?? false,
      ),
      deadline_invalid: deadlineInvalidFromMetrics(m),
    });
  }
  return out;
}

/**
 * Overlay a Jupiter quote onto products that already exist (API proxy or snapshot).
 * Premium and mark move only when `ipoPremiumPct` is a number.
 * `replaceTokenPrice` writes `usdPrice` even when the product already has one
 * (snapshot cache restore). Otherwise token price is filled only when missing.
 */
export function applyJupPremiums(
  products: PrestocksProduct[],
  quotes: Record<string, JupQuote>,
  now: number,
  opts?: { replaceTokenPrice?: boolean },
): PrestocksProduct[] {
  return products.map((p) => {
    const q = quoteByName(quotes, p.name);
    if (!q) return p;
    const next: PrestocksProduct = { ...p };
    let changed = false;
    if (q.usdPrice != null && (opts?.replaceTokenPrice || !(p.token_price_usd != null && p.token_price_usd > 0))) {
      next.token_price_usd = round6(q.usdPrice);
      changed = true;
    }
    const premium = ipoPremiumPct(q, now);
    if (premium != null && q.stockPrice != null) {
      next.mark_price_usd = round6(q.stockPrice);
      next.premium_pct = round3(premium);
      next.premium_source = "jupiter_stockdata";
      changed = true;
    }
    return changed ? next : p;
  });
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
      mode: "cors",
      signal: ctrl.signal,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${url}`);
    return resp.json();
  } catch (e) {
    const aborted =
      (typeof DOMException !== "undefined" &&
        e instanceof DOMException &&
        e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) throw new Error(`timeout ${url}`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/** Live fetch from prestocks.com metrics + Jupiter Price API v3. Used by /api/prestocks/live. */
export async function loadLivePrestocks(prices?: Promise<JupPrices>): Promise<{
  products: PrestocksProduct[];
  totals: unknown;
  premiumsSource: string;
}> {
  const [metricsPayload, jup] = await Promise.all([
    fetchJson(`${ORIGIN}/api/metrics`) as Promise<{
      metrics?: Array<Record<string, unknown>>;
      totals?: unknown;
    }>,
    prices ?? fetchJupPrices(),
  ]);
  const metrics = metricsPayload.metrics ?? [];
  const products = buildProducts(metrics, jup.quotes, jup.fetchedAt);
  return {
    products,
    totals: metricsPayload.totals,
    premiumsSource: summarizePremiumSource(products),
  };
}

async function fetchViaApiProxy(prices?: Promise<JupPrices>): Promise<{
  products: PrestocksProduct[];
  totals: unknown;
  premiumsSource: string;
} | null> {
  const base = dcaApiBase();
  if (!base) return null;
  const data = (await fetchJson(`${base}/prestocks/products`)) as {
    products: PrestocksProduct[];
    totals?: unknown;
    premiums_source?: string;
  };
  const products = (data.products ?? []).filter((p) => p.mint !== XAI_MINT);
  let premiumsSource = data.premiums_source ?? "api_proxy";
  try {
    const jup = await (prices ?? fetchJupPrices());
    const overlaid = applyJupPremiums(products, jup.quotes, jup.fetchedAt);
    if (overlaid.some((p) => p.premium_source === "jupiter_stockdata")) {
      premiumsSource = "jupiter_stockdata";
    }
    return { products: overlaid, totals: data.totals, premiumsSource };
  } catch {
    return { products, totals: data.totals, premiumsSource };
  }
}

function readSession(): PrestocksProduct[] | null {
  try {
    const raw = sessionStorage.getItem(SS_PRODUCTS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrestocksProduct[];
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(products: PrestocksProduct[]) {
  try {
    sessionStorage.setItem(SS_PRODUCTS, JSON.stringify(products));
  } catch {
    /* ignore */
  }
}

async function fetchSnapshot(): Promise<{
  products: PrestocksProduct[];
  totals: unknown;
}> {
  const data = (await fetchJson(
    assetUrl("/data/prestocks-snapshot.json"),
  )) as { products: PrestocksProduct[]; totals?: unknown };
  return { products: data.products ?? [], totals: data.totals };
}

function localLiveProxyUrl(): string | null {
  if (typeof window === "undefined") return null;
  const base = (
    process.env.NEXT_PUBLIC_BASE_PATH || "/prestocks-dca-noir2.0"
  ).replace(/\/$/, "");
  return `${window.location.origin}${base}/api/prestocks/live/`;
}

function listedNearIpo(name: string): boolean {
  const want = canonicalName(name);
  return NEAR_IPO_NAMES.some((entry) => canonicalName(entry) === want);
}

function finishProducts(products: PrestocksProduct[]): PrestocksProduct[] {
  const now = Date.now();
  // Server and snapshot flags are not a source. Only the client list, then fresh company data.
  const grounded = products.map((product) => ({
    ...product,
    near_ipo: listedNearIpo(product.name),
  }));
  const incoming = companyDataFromProducts(grounded, now);
  const byName = rememberCompanyRecords(incoming, now);
  return applyCompanyData(grounded, byName, now);
}

function skipDirectPrestocks(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
}

/** Same-origin proxy only on localhost. Elsewhere skip prestocks.com and reuse one Jupiter read. */
export async function fetchPrestocksProducts(
  prices?: JupPrices,
): Promise<ProductsFetchResult> {
  let inflight: Promise<JupPrices> | null = null;
  const pricesOnce = (): Promise<JupPrices> => {
    if (!inflight) {
      inflight =
        prices && prices.fetchedAt > 0 ? Promise.resolve(prices) : fetchJupPrices();
    }
    return inflight;
  };

  const proxyUrl = canUseSameOriginJevProxy() ? localLiveProxyUrl() : null;
  if (proxyUrl) {
    try {
      const data = (await fetchJson(proxyUrl, 20000)) as {
        ok?: boolean;
        products?: PrestocksProduct[];
        totals?: unknown;
        premiumsSource?: string;
      };
      if (data.ok && (data.products?.length ?? 0) >= 3) {
        const products = finishProducts(data.products ?? []);
        writeSession(products);
        return {
          products,
          totals: data.totals,
          premiumsSource: data.premiumsSource ?? "live_mark_price_batch",
          dataSource: "live_proxy",
          corsError: false,
          errorPl: null,
        };
      }
    } catch {
      /* fall through */
    }
  }

  let directMsg = "pominięto bezpośrednie prestocks.com";
  let looksCors = false;
  if (!skipDirectPrestocks()) {
    try {
      const live = await loadLivePrestocks(pricesOnce());
      const products = finishProducts(live.products);
      writeSession(products);
      return {
        products,
        totals: live.totals,
        premiumsSource: live.premiumsSource,
        dataSource: "live",
        corsError: false,
        errorPl: null,
      };
    } catch (e) {
      directMsg = e instanceof Error ? e.message : String(e);
      looksCors =
        /Failed to fetch|NetworkError|CORS|blocked|Load failed/i.test(directMsg) ||
        directMsg === "Failed to fetch";
    }
  }

  try {
    const proxied = await fetchViaApiProxy(pricesOnce());
    if (proxied && proxied.products.length) {
      const products = finishProducts(proxied.products);
      writeSession(products);
      return {
        products,
        totals: proxied.totals,
        premiumsSource: proxied.premiumsSource,
        dataSource: "api_proxy",
        corsError: looksCors,
        errorPl: looksCors
          ? "CORS zablokował prestocks.com w przeglądarce — użyto proxy API."
          : null,
      };
    }
  } catch {
    /* continue */
  }

  const sess = readSession();
  if (sess) {
    return {
      products: finishProducts(sess),
      totals: null,
      premiumsSource: "sessionStorage",
      dataSource: "session",
      corsError: looksCors,
      errorPl:
        "Nie udało się pobrać live PreStocks (CORS/sieć). Pokazuję ostatni udany fetch z tej sesji.",
    };
  }

  try {
    const snap = await fetchSnapshot();
    let products = (snap.products ?? []).filter((p) => p.mint !== XAI_MINT);
    let premiumsSource = "static_snapshot";
    const cached = readJupPriceCache();
    if (cached) {
      products = applyJupPremiums(products, cached.quotes, cached.fetchedAt, {
        replaceTokenPrice: true,
      });
      if (products.some((p) => p.premium_source === "jupiter_stockdata")) {
        premiumsSource = "jupiter_stockdata";
      }
    }
    return {
      products: finishProducts(products),
      totals: snap.totals,
      premiumsSource,
      dataSource: "snapshot",
      corsError: looksCors,
      errorPl: `Brak live PreStocks. Użyto statycznego snapshota z ${PRESTOCKS_SNAPSHOT_DATE} (nie live).`,
    };
  } catch {
    return {
      products: finishProducts([]),
      totals: null,
      premiumsSource: "none",
      dataSource: "snapshot",
      corsError: looksCors,
      errorPl: `Błąd PreStocks: ${directMsg}. Brak snapshota.`,
    };
  }
}
