/**
 * Settings exclusions — persist as typed string; apply to ranking candidates/top3.
 */

import { mintByName } from "@/lib/devnet-mock-mints";
import { DEFAULT_SETTINGS } from "@/lib/mock-data";
import { MINTS, XAI_MINT } from "@/lib/universe";

export const LS_EXCLUSIONS = "prestocks.exclusions";

/** Parse comma-separated exclusion names (trim, drop empties). */
export function parseExclusions(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Raw string as stored / typed. Missing key → DEFAULT_SETTINGS default.
 */
export function readExclusionsRaw(): string {
  try {
    if (typeof localStorage !== "undefined") {
      const v = localStorage.getItem(LS_EXCLUSIONS);
      if (v != null) return v;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS.exclusions.join(", ");
}

/**
 * Parsed exclusion names for ranking.
 * Empty field → default still `xAI` from DEFAULT_SETTINGS (source of truth when cleared).
 */
export function readExclusions(): string[] {
  const parsed = parseExclusions(readExclusionsRaw());
  if (parsed.length === 0) return [...DEFAULT_SETTINGS.exclusions];
  return parsed;
}

export function writeExclusionsRaw(raw: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_EXCLUSIONS, raw);
    }
  } catch {
    /* ignore */
  }
}

function normName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/** Mints known for an exclusion name (universe + mock registry + xAI mint). */
export function mintsForExclusionName(name: string): string[] {
  const n = name.trim().toLowerCase();
  const compact = normName(name);
  const out = new Set<string>();
  if (!n) return [];

  if (n === "xai" || compact === "xai") {
    out.add(XAI_MINT);
  }

  for (const [k, mint] of Object.entries(MINTS)) {
    if (k.toLowerCase() === n || normName(k) === compact) {
      out.add(mint);
    }
  }

  try {
    const mock = mintByName(name);
    if (mock) out.add(mock.toBase58());
  } catch {
    /* ignore */
  }

  return [...out];
}

function exclusionSets(exclusions: string[]): {
  names: Set<string>;
  compact: Set<string>;
  mints: Set<string>;
} {
  const names = new Set<string>();
  const compact = new Set<string>();
  const mints = new Set<string>();
  for (const name of exclusions) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    names.add(trimmed.toLowerCase());
    compact.add(normName(trimmed));
    for (const m of mintsForExclusionName(trimmed)) {
      mints.add(m);
    }
  }
  return { names, compact, mints };
}

export function isProductExcluded(
  product: { name?: string | null; mint?: string | null },
  exclusions: string[],
): boolean {
  const { names, compact, mints } = exclusionSets(exclusions);
  if (product.mint && mints.has(product.mint)) return true;
  const pname = (product.name ?? "").trim();
  if (!pname) return false;
  if (names.has(pname.toLowerCase())) return true;
  if (compact.has(normName(pname))) return true;
  return false;
}

export function filterProducts<T extends { name: string; mint?: string | null }>(
  products: T[],
  exclusions: string[],
): T[] {
  return products.filter((p) => !isProductExcluded(p, exclusions));
}

/** Drop excluded rows; keep at most 3. */
export function filterTop3<T extends { name: string; mint?: string | null }>(
  rows: T[],
  exclusions: string[],
): T[] {
  return filterProducts(rows, exclusions).slice(0, 3);
}
