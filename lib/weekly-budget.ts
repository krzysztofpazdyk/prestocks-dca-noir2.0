/** Same epsilon Overview and Settings used for on-chain vs local weekly budget. */
export const WEEKLY_BUDGET_EPS = 0.000001;

/** True when the local weekly amount should be pushed on-chain before a buy. */
export function budgetsDiffer(ls: number, onChain: number | null): boolean {
  if (onChain == null || !Number.isFinite(onChain)) return ls > 0;
  return Math.abs(ls - onChain) > WEEKLY_BUDGET_EPS;
}

/**
 * First click of Manual Buy must ask before setWeeklyBudget.
 * A confirmed click, or amounts already within epsilon, does not ask again.
 */
export function needsBudgetConfirm(
  ls: number,
  chain: number | null,
  confirmed: boolean,
): boolean {
  if (confirmed) return false;
  return budgetsDiffer(ls, chain);
}

export type WeeklyDraft =
  | { ok: true; value: number }
  | { ok: false; reason: "empty" | "nan" | "min" | "decimals" };

/**
 * Weekly amount typed by the user. Comma or dot is the decimal mark.
 * Spaces (including nbsp) are thousands separators. A dot is never a thousands separator.
 */
export function parseWeeklyDraft(s: string): WeeklyDraft {
  const trimmed = s.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  const compact = trimmed.replace(/[\s\u00a0]/g, "");
  if (!compact) return { ok: false, reason: "empty" };
  if (compact.includes(".") && compact.includes(",")) {
    return { ok: false, reason: "nan" };
  }
  const normalized = compact.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, reason: "nan" };
  }
  const dot = normalized.indexOf(".");
  if (dot !== -1 && normalized.length - dot - 1 > 2) {
    return { ok: false, reason: "decimals" };
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { ok: false, reason: "nan" };
  if (value < 1) return { ok: false, reason: "min" };
  return { ok: true, value };
}
