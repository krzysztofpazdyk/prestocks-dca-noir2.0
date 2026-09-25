/**
 * Live PreStocks public APIs (no keys) — the ranking input when Grok is absent.
 * Prefer same-origin /api/prestocks/live (next dev) so CORS cannot block
 * prestocks.com. Then direct → DCA API → session → static snapshot.
 */

import { dcaApiBase, SS_PRODUCTS } from "@/lib/keys";
import {
  HARDCODED_PREMIUMS_PCT,
  MINTS,
  SYMBOL_BY_NAME,
  XAI_MINT,
  type PrestocksProduct,
} from "@/lib/universe";

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

function buildProducts(
  metrics: Array<Record<string, unknown>>,
  markPrices: Record<string, number>,
  jupPrices: Record<string, number>,
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
    const tokenPrice = Number(m.tokenPrice ?? jupPrices[mint] ?? 0);
    const mark = markPrices[sym];
    let premium_pct: number;
    let premium_source: string;
    let markOut: number | null = null;
    if (mark != null && Number(mark) > 0 && tokenPrice > 0) {
      premium_pct = (tokenPrice / Number(mark) - 1) * 100;
      premium_source = "live";
      markOut = Number(mark);
    } else {
      premium_pct = HARDCODED_PREMIUMS_PCT[name] ?? 0;
      premium_source = "hardcoded_fallback";
    }
    out.push({
      name,
      symbol: sym,
      mint,
      token_price_usd: tokenPrice
        ? Math.round(tokenPrice * 1e6) / 1e6
        : null,
      mark_price_usd:
        markOut != null ? Math.round(markOut * 1e6) / 1e6 : null,
      premium_pct: Math.round(premium_pct * 1000) / 1000,
      premium_source,
      market_cap_usd: (m.marketCapUSD as number) ?? null,
      holders: (m.holderCount as number) ?? null,
      volume_cum_usd: (m.cumulativeVolumeUSD as number) ?? null,
      txn_count: (m.txnCount as number) ?? null,
      change_30d_pct: (m.thirtyDayChange as number) ?? null,
      near_ipo: name === "SpaceX",
      ipo_completed: Boolean(
        m.ipo_completed ?? m.ipoCompleted ?? false,
      ),
      deadline_invalid: deadlineInvalidFromMetrics(m),
    });
  }
  return out;
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

/** Live fetch from prestocks.com (server or browser). Used by /api/prestocks/live. */
export async function loadLivePrestocks(): Promise<{
  products: PrestocksProduct[];
  totals: unknown;
  premiumsSource: string;
}> {
  const metricsPayload = (await fetchJson(`${ORIGIN}/api/metrics`)) as {
    metrics?: Array<Record<string, unknown>>;
    totals?: unknown;
  };
  const metrics = metricsPayload.metrics ?? [];
  const symbols = Object.keys(MINTS).map((n) => SYMBOL_BY_NAME[n]);
  let markPrices: Record<string, number> = {};
  let premiumsSource = "live_mark_price_batch";
  try {
    const rawMarks = (await fetchJson(
      `${ORIGIN}/api/mark-price/batch?symbols=${symbols.join(",")}`,
    )) as Record<string, number | { markPrice?: number }>;
    markPrices = {};
    for (const [sym, v] of Object.entries(rawMarks ?? {})) {
      if (v != null && typeof v === "object" && "markPrice" in v) {
        const n = Number((v as { markPrice?: number }).markPrice);
        if (Number.isFinite(n)) markPrices[sym] = n;
      } else {
        const n = Number(v);
        if (Number.isFinite(n)) markPrices[sym] = n;
      }
    }
  } catch (e) {
    premiumsSource = `hardcoded_fallback (${e instanceof Error ? e.message : e})`;
  }
  let jupPrices: Record<string, number> = {};
  try {
    jupPrices = (await fetchJson(
      `${ORIGIN}/api/jupiter/price?ids=${Object.values(MINTS).join(",")}`,
    )) as Record<string, number>;
  } catch {
    jupPrices = {};
  }
  return {
    products: buildProducts(metrics, markPrices, jupPrices),
    totals: metricsPayload.totals,
    premiumsSource,
  };
}

async function fetchViaApiProxy(): Promise<{
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
  return {
    products: (data.products ?? []).filter((p) => p.mint !== XAI_MINT),
    totals: data.totals,
    premiumsSource: data.premiums_source ?? "api_proxy",
  };
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

/** Prefer same-origin live proxy → prestocks.com → DCA API → session → snapshot. */
export async function fetchPrestocksProducts(): Promise<ProductsFetchResult> {
  const proxyUrl = localLiveProxyUrl();
  if (proxyUrl) {
    try {
      const data = (await fetchJson(proxyUrl, 20000)) as {
        ok?: boolean;
        products?: PrestocksProduct[];
        totals?: unknown;
        premiumsSource?: string;
      };
      if (data.ok && (data.products?.length ?? 0) >= 3) {
        writeSession(data.products ?? []);
        return {
          products: data.products ?? [],
          totals: data.totals,
          premiumsSource: data.premiumsSource ?? "live_mark_price_batch",
          dataSource: "live_proxy",
          corsError: false,
          errorPl: null,
        };
      }
    } catch {
      /* fall through to direct prestocks.com */
    }
  }

  try {
    const live = await loadLivePrestocks();
    writeSession(live.products);
    return {
      products: live.products,
      totals: live.totals,
      premiumsSource: live.premiumsSource,
      dataSource: "live",
      corsError: false,
      errorPl: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const looksCors =
      /Failed to fetch|NetworkError|CORS|blocked|Load failed/i.test(msg) ||
      msg === "Failed to fetch";

    try {
      const proxied = await fetchViaApiProxy();
      if (proxied && proxied.products.length) {
        writeSession(proxied.products);
        return {
          products: proxied.products,
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
        products: sess,
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
      return {
        products: snap.products,
        totals: snap.totals,
        premiumsSource: "static_snapshot",
        dataSource: "snapshot",
        corsError: looksCors,
        errorPl:
          "CORS/sieć: brak live PreStocks. Użyto statycznego snapshota (nie live).",
      };
    } catch {
      return {
        products: [],
        totals: null,
        premiumsSource: "none",
        dataSource: "snapshot",
        corsError: looksCors,
        errorPl: `Błąd PreStocks: ${msg}. Brak snapshota.`,
      };
    }
  }
}
