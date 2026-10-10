/**
 * Weekly DCA ranking:
 * 1. Grok analysis (if XAI_API_KEY) → Jev top-3 (client TYPESAFE BYOK, via /api/jev)
 * 2. Else hosted API /rank or /run/dry — only when client TypeSafe BYOK is set
 * 3. metrics_rank when no BYOK or Jev is down — clearly labeled (no free hosted Jev)
 * Equal ⅓ buy of the 3 names is a separate Predca step.
 */

import { runByokAiRank } from "@/lib/ai-rank";
import {
  filterExpired,
  filterIpoCompleted,
  filterProducts,
  readRankPrefs,
  type RankPrefs,
} from "@/lib/rank-prefs";
import {
  emergencyFromProducts,
  fetchLatestRun,
  fetchSampleRun,
  postRank,
  rankResultFromProxy,
  triggerDryRun,
} from "@/lib/dca-api";
import {
  canUseSameOriginJevProxy,
  dcaApiBase,
  hasByokTypesafe,
  readTypesafeKey,
  readXaiKey,
  SS_RANK,
} from "@/lib/keys";
import {
  fetchPrestocksProducts,
  type ProductsFetchResult,
} from "@/lib/prestocks";
import type { RankResult } from "@/lib/universe";

type RankStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type RankSessionSnap = { raw: string | null };

const RANK_SERVER_SNAP: RankSessionSnap = { raw: null };
let rankRaw: string | null | undefined;
let rankSnap: RankSessionSnap = RANK_SERVER_SNAP;
const rankListeners = new Set<() => void>();

/** Stable fingerprint: sorted exclusions plus the four ranking flags. */
export function rankPrefsKey(prefs: RankPrefs = readRankPrefs()): string {
  const exclusions = [...prefs.exclusions].sort((a, b) => a.localeCompare(b, "en"));
  return JSON.stringify([
    exclusions,
    prefs.deadlinesUnimportant,
    prefs.premiumsMatter,
    prefs.premiumsEspeciallyNearIpo,
    prefs.buyDespiteIpo,
  ]);
}

export function parseRankSession(
  raw: string | null,
  prefsKeyNow: string,
): { rank: RankResult; savedAt: number } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      v?: unknown;
      rank?: RankResult;
      prefsKey?: unknown;
      savedAt?: unknown;
    };
    if (!parsed || parsed.v !== 2 || !parsed.rank || typeof parsed.rank !== "object") {
      return null;
    }
    if (parsed.prefsKey !== prefsKeyNow) return null;
    if (typeof parsed.savedAt !== "number" || !Number.isFinite(parsed.savedAt)) return null;
    return { rank: parsed.rank, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function saveRankSession(rank: RankResult, storage?: RankStore) {
  const envelope = {
    v: 2 as const,
    rank,
    prefsKey: rankPrefsKey(),
    savedAt: Date.now(),
  };
  const raw = JSON.stringify(envelope);
  try {
    (storage ?? sessionStorage).setItem(SS_RANK, raw);
    if (!storage) {
      rankRaw = raw;
      rankSnap = { raw };
      for (const listener of rankListeners) listener();
    }
  } catch {
    /* ignore */
  }
}

export function restoreRankSession(
  prefsKeyNow: string,
  storage?: RankStore,
): { rank: RankResult; savedAt: number } | null {
  try {
    const store = storage ?? (typeof sessionStorage === "undefined" ? null : sessionStorage);
    if (!store) return null;
    return parseRankSession(store.getItem(SS_RANK), prefsKeyNow);
  } catch {
    return null;
  }
}

function loadRankSession(): RankResult | null {
  return restoreRankSession(rankPrefsKey())?.rank ?? null;
}

export function rankSessionClientSnapshot(): RankSessionSnap {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(SS_RANK);
  } catch {
    raw = null;
  }
  if (rankRaw !== undefined && raw === rankRaw) return rankSnap;
  rankRaw = raw;
  rankSnap = { raw };
  return rankSnap;
}

export function rankSessionServerSnapshot(): RankSessionSnap {
  return RANK_SERVER_SNAP;
}

export function subscribeRankSession(onStoreChange: () => void): () => void {
  rankListeners.add(onStoreChange);
  if (typeof window === "undefined") {
    return () => {
      rankListeners.delete(onStoreChange);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== SS_RANK) return;
    rankRaw = undefined;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    rankListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export async function loadInitialRanking(): Promise<{
  productsResult: ProductsFetchResult;
  rank: RankResult | null;
  error: string | null;
}> {
  const productsResult = await fetchPrestocksProducts();
  let rank: RankResult | null = null;
  let error: string | null = productsResult.errorPl;

  if (dcaApiBase()) {
    try {
      rank = await fetchLatestRun();
    } catch (e) {
      error = `API /run/latest: ${e instanceof Error ? e.message : e}`;
    }
  }

  if (!rank) rank = loadRankSession();
  if (!rank) rank = await fetchSampleRun();

  // Do NOT metrics-rank as default — only surface products / last Jev result.
  if (rank) saveRankSession(rank);

  return { productsResult, rank, error };
}

/**
 * Run ranking now: Grok→Jev / hosted /rank only when client TypeSafe BYOK
 * is set (hasByokTypesafe). Without BYOK: emergency metrics — no hosted free Jev.
 */
export async function runRankingNow(
  productsResult: ProductsFetchResult,
): Promise<RankResult> {
  const prefs = readRankPrefs();
  const products = filterExpired(
    filterIpoCompleted(
      filterProducts(productsResult.products, prefs.exclusions),
      prefs.buyDespiteIpo,
    ),
    prefs.deadlinesUnimportant,
  );
  if (products.length < 3) {
    throw new Error("Za mało produktów PreStocks do rankingu (<3).");
  }

  const byok = hasByokTypesafe();
  let byokFallback: RankResult | null = null;

  // GitHub Pages has no Route Handler — skip same-origin /api/jev (POST → 405).
  if (byok && canUseSameOriginJevProxy()) {
    const result = await runByokAiRank({
      products,
      premiumsSource: productsResult.premiumsSource,
      totals: productsResult.totals,
      typesafeKey: readTypesafeKey(),
      xaiKey: readXaiKey(),
      exclusions: prefs.exclusions,
      prefs,
    });
    if (result.mode !== "metrics_fallback") {
      saveRankSession(result);
      return result;
    }
    byokFallback = result;
    if (!dcaApiBase()) {
      saveRankSession(result);
      return result;
    }
  }

  // Hosted /rank and /run/dry need client TypeSafe — never call without BYOK
  // (API also rejects public requests without a client key; no free hosted Jev).
  if (byok && dcaApiBase()) {
    try {
      const proxy = await postRank(prefs);
      if (proxy.top3.length >= 3) {
        const result = rankResultFromProxy(proxy, products);
        saveRankSession(result);
        return result;
      }
    } catch {
      /* try /run/dry next */
    }
    try {
      const result = await triggerDryRun(prefs.exclusions, prefs);
      saveRankSession(result);
      return result;
    } catch (e) {
      if (byokFallback) {
        saveRankSession(byokFallback);
        return byokFallback;
      }
      const reason = `Hosted Jev niedostępny (${e instanceof Error ? e.message : e}). Awaryjny ranking metryczny.`;
      const fallback = emergencyFromProducts(
        products,
        reason,
        prefs.exclusions,
        prefs,
      );
      saveRankSession(fallback);
      return fallback;
    }
  }

  if (byokFallback) {
    saveRankSession(byokFallback);
    return byokFallback;
  }

  const reason = byok
    ? "Brak NEXT_PUBLIC_DCA_API_URL i brak same-origin /api/jev — Jev nie może wystartować. Awaryjny ranking metryczny."
    : "Wymagany klucz TypeSafe (BYOK) do Jev — brak darmowego hosted Jev. Awaryjny ranking metryczny.";
  const fallback = emergencyFromProducts(
    products,
    reason,
    prefs.exclusions,
    prefs,
  );
  saveRankSession(fallback);
  return fallback;
}

/** Backup ranking that scored every name the same. Hosted AI is never flat. */
export function isFlatFallback(rank: RankResult | null | undefined): boolean {
  if (!rank || rank.mode !== "metrics_fallback") return false;
  const top = rank.top3 ?? [];
  if (top.length < 2) return false;
  const first = top[0]?.score;
  if (typeof first !== "number" || !Number.isFinite(first)) return false;
  return top.every(
    (row) => typeof row.score === "number" && Math.abs(row.score - first) < 1e-9,
  );
}

export function activeModeLabel(
  rank: RankResult | null,
  hasByok: boolean,
): string {
  if (rank?.sourceLabel) return rank.sourceLabel;
  if (hasByok) return "Źródło: PreStocks + AI (BYOK) — czekam na ranking";
  // Without client TypeSafe BYOK we never call hosted Jev — do not claim hosted.
  return "Źródło: PreStocks — brak TypeSafe BYOK (wymagany do Jev)";
}
