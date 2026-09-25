/**
 * Client for hosted DCA API.
 * Client TypeSafe BYOK is required for Jev (/rank, /run/dry); empty key must not
 * spend server TYPESAFE. Optional XAI BYOK enables Grok.
 */

import { dcaApiBase, readTypesafeKey, readXaiKey } from "@/lib/keys";
import { metricsRank } from "@/lib/metrics-rank";
import {
  filterProducts,
  filterTop3,
  rankPrefsForApi,
  readExclusions,
  readRankPrefs,
  type RankPrefs,
} from "@/lib/rank-prefs";
import type { PrestocksProduct, RankResult, RankRow } from "@/lib/universe";

export type LatestRunJson = {
  pipeline?: string[];
  top3?: RankRow[];
  scores?: RankRow[];
  products?: PrestocksProduct[];
  choice?: { choice?: string; confidence?: number | null };
  grok?: { skipped?: boolean; reason?: string; summary?: string };
  premiums_source?: string;
  finished_at_warsaw?: string;
  finished_at_utc?: string;
  mode?: string;
  error?: string;
};

const API_TIMEOUT_MS = 8000;
const RANK_TIMEOUT_MS = 60000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = API_TIMEOUT_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    const aborted =
      (typeof DOMException !== "undefined" &&
        e instanceof DOMException &&
        e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError");
    if (aborted) {
      throw new Error(`API timeout (${Math.round(timeoutMs / 1000)}s)`);
    }
    const msg = e instanceof Error ? e.message : String(e);
    let host = url;
    try {
      host = new URL(url).host;
    } catch {
      /* keep url */
    }
    if (/Failed to fetch|Load failed|NetworkError/i.test(msg)) {
      throw new Error(`Hosted Jev (${host}) nieosiągalny`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function mapRunToRank(
  run: LatestRunJson,
  mode: RankResult["mode"],
  sourceLabel: string,
  exclusions?: string[],
): RankResult {
  const excl = exclusions ?? readExclusions();
  const products = filterProducts(run.products ?? [], excl);
  const scores = filterProducts((run.scores ?? []) as RankRow[], excl);
  const top3Raw = (run.top3 ?? scores.slice(0, 3)) as RankRow[];
  const top3 = filterTop3(top3Raw, excl);
  // If top3 short after filter, refill from scores
  const filled =
    top3.length >= 3
      ? top3
      : filterTop3([...(top3 as RankRow[]), ...scores], excl);
  const pipeline = run.pipeline ?? ["prestocks", "jev"];
  const isMetrics =
    pipeline.includes("metrics_rank") && !pipeline.includes("jev");
  return {
    mode: isMetrics ? "metrics_fallback" : mode,
    sourceLabel: isMetrics
      ? "Źródło: metryki (bez AI — Jev niedostępny)"
      : sourceLabel,
    pipeline,
    top3: filled,
    scores: scores.length ? scores : filled,
    products,
    choice: run.choice,
    grok: run.grok
      ? {
          skipped: !!run.grok.skipped,
          reason: run.grok.reason,
          summary: run.grok.summary,
        }
      : undefined,
    fetchedAt: run.finished_at_utc ?? new Date().toISOString(),
  };
}

export async function fetchLatestRun(): Promise<RankResult | null> {
  const base = dcaApiBase();
  if (!base) return null;
  const resp = await fetchWithTimeout(`${base}/run/latest`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) return null;
  const run = (await resp.json()) as LatestRunJson;
  const byok = readTypesafeKey().length > 0;
  // /run/latest is a server cache (often keeper) — never claim "hosted Jev" without BYOK.
  return mapRunToRank(
    run,
    byok ? "byok_ai" : "metrics_fallback",
    byok
      ? "Źródło: cache serwera (/run/latest) · masz TypeSafe BYOK"
      : "Źródło: cache serwera (/run/latest) — bez TypeSafe BYOK (nie Jev klienta)",
    readExclusions(),
  );
}

/** Trigger dry-run on backend. Passes BYOK headers when present. */
export async function triggerDryRun(
  exclusions?: string[],
  prefs?: RankPrefs,
): Promise<RankResult> {
  const base = dcaApiBase();
  if (!base) {
    throw new Error(
      "Brak NEXT_PUBLIC_DCA_API_URL — nie można wywołać API /run/dry.",
    );
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const ts = readTypesafeKey();
  const xai = readXaiKey();
  // Same TypeSafe contract as postRank / API: Bearer + body.typesafe_key
  // (X-Typesafe-Api-Key is ignored by the server after BYOK hardening).
  if (ts) headers.Authorization = `Bearer ${ts}`;
  if (xai) headers["X-Xai-Api-Key"] = xai;
  const apiPrefs = rankPrefsForApi(
    prefs ??
      (exclusions
        ? { ...readRankPrefs(), exclusions }
        : undefined),
  );
  const body = {
    ...apiPrefs,
    ...(ts ? { typesafe_key: ts } : {}),
    ...(xai ? { xai_key: xai } : {}),
  };

  const resp = await fetchWithTimeout(
    `${base}/run/dry`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    RANK_TIMEOUT_MS,
  );
  const data = (await resp.json()) as {
    ok?: boolean;
    run?: LatestRunJson;
    detail?: unknown;
  };
  if (!resp.ok) {
    const errMsg =
      (data as { error?: string }).error ||
      (typeof data.detail === "string" ? data.detail : null);
    throw new Error(errMsg || `API /run/dry HTTP ${resp.status}`);
  }
  const run = data.run ?? (data as LatestRunJson);
  const byok = !!ts;
  return mapRunToRank(
    run,
    byok ? "byok_ai" : "metrics_fallback",
    byok
      ? xai
        ? "Źródło: PreStocks + AI (BYOK · Grok+Jev)"
        : "Źródło: PreStocks + AI (BYOK · Jev)"
      : "Źródło: /run/dry bez TypeSafe BYOK (nie Jev klienta)",
    apiPrefs.exclusions,
  );
}

/** Load sample latest-run from static Pages asset. */
export async function fetchSampleRun(): Promise<RankResult | null> {
  const base = (
    process.env.NEXT_PUBLIC_BASE_PATH || "/prestocks-dca-noir2.0"
  ).replace(/\/$/, "");
  try {
    const resp = await fetch(`${base}/data/latest-run-sample.json`);
    if (!resp.ok) return null;
    const run = (await resp.json()) as LatestRunJson;
    return mapRunToRank(
      run,
      "metrics_fallback",
      "Źródło: przykładowy wynik (sample) — nie live Jev",
      readExclusions(),
    );
  } catch {
    return null;
  }
}


export type RankProxyResponse = {
  ok: boolean;
  top3: Array<{ name: string; score: number }>;
  pipeline?: string[];
  error?: string;
};

/**
 * CORS-safe ranking via DCA API proxy (Jev with client TypeSafe key).
 * Sends Bearer / body.typesafe_key from localStorage when present.
 * Client key is required for Jev — empty must not imply server spend.
 */
export async function postRank(
  prefs?: RankPrefs,
): Promise<RankProxyResponse> {
  const base = dcaApiBase();
  if (!base) {
    throw new Error("Brak NEXT_PUBLIC_DCA_API_URL — nie można użyć proxy /rank.");
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const ts = readTypesafeKey();
  const xai = readXaiKey();
  if (ts) headers.Authorization = `Bearer ${ts}`;
  if (xai) headers["X-Xai-Api-Key"] = xai;
  const apiPrefs = rankPrefsForApi(prefs);
  const body = {
    ...apiPrefs,
    ...(ts ? { typesafe_key: ts } : {}),
    ...(xai ? { xai_key: xai } : {}),
  };
  const resp = await fetchWithTimeout(
    `${base}/rank`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    RANK_TIMEOUT_MS,
  );
  let data: RankProxyResponse;
  try {
    data = (await resp.json()) as RankProxyResponse;
  } catch {
    throw new Error(`API /rank HTTP ${resp.status} (nie-JSON)`);
  }
  if (!resp.ok || !data.ok) {
    const detail = (data as RankProxyResponse & { detail?: unknown }).detail;
    throw new Error(
      data.error ||
        (typeof detail === "string" ? detail : `API /rank HTTP ${resp.status}`),
    );
  }
  const excl = (prefs ?? readRankPrefs()).exclusions;
  data.top3 = filterTop3(data.top3 ?? [], excl);
  return data;
}

/** Map CORS proxy `/rank` payload onto the shared RankResult shape. */
export function rankResultFromProxy(
  data: RankProxyResponse,
  products: PrestocksProduct[],
): RankResult {
  const byName = new Map(products.map((p) => [p.name.toLowerCase(), p]));
  const rows: RankRow[] = (data.top3 ?? []).map((r) => {
    const p = byName.get(r.name.toLowerCase());
    const base: PrestocksProduct = p ?? {
      name: r.name,
      symbol: r.name.replace(/\s+/g, "").toUpperCase(),
      mint: "",
      token_price_usd: null,
      mark_price_usd: null,
      premium_pct: 0,
      premium_source: "proxy",
      near_ipo: r.name.replace(/\s+/g, "").toLowerCase() === "spacex",
    };
    return {
      ...base,
      score: Number(r.score) || 0,
      score_raw: null,
      confidence: null,
    };
  });
  const pipeline = data.pipeline ?? ["prestocks", "jev"];
  const isMetrics =
    pipeline.includes("metrics_rank") && !pipeline.includes("jev");
  const xaiPresent = readXaiKey().length > 0;
  return {
    mode: isMetrics ? "metrics_fallback" : "byok_ai",
    sourceLabel: isMetrics
      ? "Źródło: metryki (bez AI — Jev niedostępny)"
      : xaiPresent
        ? "Źródło: PreStocks + AI (BYOK · Grok+Jev)"
        : "Źródło: PreStocks + AI (BYOK · Jev)",
    pipeline,
    top3: rows.slice(0, 3),
    scores: rows,
    products,
    error: data.error,
    fetchedAt: new Date().toISOString(),
  };
}

export function emergencyFromProducts(
  products: PrestocksProduct[],
  reason: string,
  exclusions?: string[],
  prefs?: RankPrefs,
): RankResult {
  const r = metricsRank(products, exclusions, prefs);
  return { ...r, error: reason };
}

export type FaucetUsdcResponse = {
  ok: boolean;
  signature: string;
  amountUi: number;
  mint: string;
  wallet: string;
  ata?: string;
  solSignature?: string | null;
  solAmountUi?: number;
  solSkipped?: boolean;
  solSkipReason?: string;
  error?: string;
  detail?: string;
};

/** Devnet demo faucet: mint 1000 mock USDC + 0.1 SOL (if needed) to the wallet. */
export async function claimFaucetUsdc(
  wallet: string,
): Promise<FaucetUsdcResponse> {
  const base = dcaApiBase();
  if (!base) {
    throw new Error(
      "Brak NEXT_PUBLIC_DCA_API_URL — nie można użyć faucet /faucet/usdc.",
    );
  }
  const resp = await fetchWithTimeout(
    `${base}/faucet/usdc`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    },
    90_000,
  );
  let data: FaucetUsdcResponse & { detail?: unknown };
  try {
    data = (await resp.json()) as FaucetUsdcResponse & { detail?: unknown };
  } catch {
    throw new Error(`API /faucet/usdc HTTP ${resp.status} (nie-JSON)`);
  }
  if (!resp.ok || !data.ok) {
    const detail = data.detail ?? data.error;
    const msg =
      typeof detail === "string"
        ? detail
        : detail != null
          ? JSON.stringify(detail)
          : `API /faucet/usdc HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

