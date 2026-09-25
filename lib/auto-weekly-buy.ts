/**
 * Weekly auto-buy from the Predca vault (on-chain only).
 *
 * GitHub Pages is static and simulate_buy still needs a wallet signature, so
 * this runs in the open tab: one purchase per 7 days from the last successful
 * on-chain buy (RunRecord ts / lastRunTs).
 */

import { DEFAULT_SETTINGS } from "@/lib/mock-data";

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const AUTO_BUY_RETRY_MS = 15 * 60 * 1000;
export const AUTO_BUY_TICK_MS = 60 * 1000;

export const LS_AUTO_WEEKLY_BUY = "prestocks.autoWeeklyBuy";
export const LS_AUTO_WEEKLY_META = "prestocks.autoWeeklyBuy.meta";
export const LS_WEEKLY_BUDGET = "predca_weekly_budget_usd";

export type AutoBuyMeta = {
  lastAttemptMs: number;
  lastSuccessMs: number;
  lastError: string | null;
  /** Enable-confirm timestamp: weekly cadence starts here, first buy is due now. */
  cycleStartedAtMs: number;
  /** Weekly USDC locked in at enable time (simulate_buy reads on-chain UserConfig). */
  cycleBudgetUsd: number;
};

export type AutoBuyBlockReason =
  | "off"
  | "backoff"
  | "not_due"
  | "busy"
  | "vault_low"
  | "not_ready"
  | "need_wallet";

export type AutoBuyDecision =
  | { attempt: false; reason: AutoBuyBlockReason; nextAt: number | null }
  | { attempt: true; reason: "due"; nextAt: number };

const EMPTY_META: AutoBuyMeta = {
  lastAttemptMs: 0,
  lastSuccessMs: 0,
  lastError: null,
  cycleStartedAtMs: 0,
  cycleBudgetUsd: 0,
};

function readBool(key: string, fallback: boolean): boolean {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function writeBool(key: string, value: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value ? "true" : "false");
    }
  } catch {
    /* ignore */
  }
}

/** Default OFF — enabling is an explicit opt-in that starts the weekly cycle. */
export function readAutoWeeklyBuy(): boolean {
  return readBool(LS_AUTO_WEEKLY_BUY, DEFAULT_SETTINGS.autoWeeklyBuy);
}

/** `null` = never set in this browser (do not treat as explicit off). */
export function readAutoWeeklyBuyPref(): boolean | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const v = localStorage.getItem(LS_AUTO_WEEKLY_BUY);
    if (v == null) return null;
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeAutoWeeklyBuy(value: boolean): void {
  writeBool(LS_AUTO_WEEKLY_BUY, value);
}

export function readWeeklyBudgetUsd(fallback = DEFAULT_SETTINGS.weeklyAmountUsd): number {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(LS_WEEKLY_BUDGET);
    if (!raw) return fallback;
    const n = Number(raw.trim().replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

export function writeWeeklyBudgetUsd(amount: number): void {
  try {
    if (typeof localStorage !== "undefined" && Number.isFinite(amount) && amount > 0) {
      localStorage.setItem(LS_WEEKLY_BUDGET, String(amount));
    }
  } catch {
    /* ignore */
  }
}

export function readAutoBuyMeta(): AutoBuyMeta {
  try {
    if (typeof localStorage === "undefined") return { ...EMPTY_META };
    const raw = localStorage.getItem(LS_AUTO_WEEKLY_META);
    if (!raw) return { ...EMPTY_META };
    const parsed = JSON.parse(raw) as Partial<AutoBuyMeta>;
    return {
      lastAttemptMs:
        typeof parsed.lastAttemptMs === "number" && Number.isFinite(parsed.lastAttemptMs)
          ? parsed.lastAttemptMs
          : 0,
      lastSuccessMs:
        typeof parsed.lastSuccessMs === "number" && Number.isFinite(parsed.lastSuccessMs)
          ? parsed.lastSuccessMs
          : 0,
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
      cycleStartedAtMs:
        typeof parsed.cycleStartedAtMs === "number" &&
        Number.isFinite(parsed.cycleStartedAtMs)
          ? parsed.cycleStartedAtMs
          : 0,
      cycleBudgetUsd:
        typeof parsed.cycleBudgetUsd === "number" &&
        Number.isFinite(parsed.cycleBudgetUsd) &&
        parsed.cycleBudgetUsd > 0
          ? parsed.cycleBudgetUsd
          : 0,
    };
  } catch {
    return { ...EMPTY_META };
  }
}

export function writeAutoBuyMeta(meta: AutoBuyMeta): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_AUTO_WEEKLY_META, JSON.stringify(meta));
    }
  } catch {
    /* ignore */
  }
}

/** `YYYY-MM-DD` → UTC midnight ms (calendar day, DST-safe enough for week math). */
export function parseIsoDateToUtcMs(date: string | null | undefined): number | null {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date.trim());
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(ms) ? ms : null;
}

export function lastPurchaseMsFromInputs(opts: {
  onChainTsSec?: number | null;
  mockDate?: string | null;
  lastSuccessMs?: number | null;
}): number | null {
  const candidates: number[] = [];
  const onChain = opts.onChainTsSec;
  if (typeof onChain === "number" && Number.isFinite(onChain) && onChain > 0) {
    candidates.push(onChain * 1000);
  }
  const mockMs = parseIsoDateToUtcMs(opts.mockDate ?? null);
  if (mockMs != null) candidates.push(mockMs);
  const success = opts.lastSuccessMs;
  if (typeof success === "number" && Number.isFinite(success) && success > 0) {
    candidates.push(success);
  }
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

export function isWeeklyBuyDue(lastPurchaseMs: number | null, nowMs: number): boolean {
  if (lastPurchaseMs == null || lastPurchaseMs <= 0) return true;
  return nowMs - lastPurchaseMs >= WEEK_MS;
}

export function nextWeeklyBuyAt(lastPurchaseMs: number | null, nowMs: number): number {
  if (lastPurchaseMs == null || lastPurchaseMs <= 0) return nowMs;
  return lastPurchaseMs + WEEK_MS;
}

export function decideAutoBuy(opts: {
  enabled: boolean;
  busy: boolean;
  nowMs: number;
  lastPurchaseMs: number | null;
  lastAttemptMs: number;
}): AutoBuyDecision {
  const nextAt = nextWeeklyBuyAt(opts.lastPurchaseMs, opts.nowMs);
  if (!opts.enabled) {
    return { attempt: false, reason: "off", nextAt };
  }
  if (opts.busy) {
    return { attempt: false, reason: "busy", nextAt };
  }
  if (!isWeeklyBuyDue(opts.lastPurchaseMs, opts.nowMs)) {
    return { attempt: false, reason: "not_due", nextAt };
  }
  const attemptMs = opts.lastAttemptMs;
  const lastBuy = opts.lastPurchaseMs ?? 0;
  if (
    attemptMs > 0 &&
    opts.nowMs - attemptMs < AUTO_BUY_RETRY_MS &&
    attemptMs > lastBuy
  ) {
    return {
      attempt: false,
      reason: "backoff",
      nextAt: attemptMs + AUTO_BUY_RETRY_MS,
    };
  }
  return { attempt: true, reason: "due", nextAt: opts.nowMs };
}

export function formatWarsawWhen(ms: number, locale: "pl" | "en"): string {
  try {
    return new Date(ms).toLocaleString(locale === "en" ? "en-GB" : "pl-PL", {
      timeZone: "Europe/Warsaw",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return new Date(ms).toISOString();
  }
}
