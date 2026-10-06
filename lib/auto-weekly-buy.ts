/**
 * Weekly auto-buy from the Predca vault (on-chain only).
 *
 * GitHub Pages is static and simulate_buy still needs a wallet signature, so
 * this runs in the open tab: one purchase per 7 days from the last successful
 * on-chain buy (RunRecord ts / lastRunTs).
 *
 * Keeper ranking is chosen by the keeper. Manual Buy on Overview uses the
 * metrics list in the UI. Those paths are intentionally separate.
 */

import { DEFAULT_SETTINGS } from "@/lib/mock-data";

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const AUTO_BUY_RETRY_MS = 15 * 60 * 1000;
export const AUTO_BUY_TICK_MS = 60 * 1000;
/**
 * After startCycle sets ok / error / blocked, tick must not replace that
 * banner until this elapses. The enable effect calls tick immediately, while
 * keeper status can still say off. Wallet change clears the hold separately.
 */
export const BANNER_HOLD_MS = 10 * 1000;

/** Re-read keeper status while /enable may still be running on the daemon. */
export const ENABLE_PENDING_POLL_MS = 5_000;
/** Stop the poll here. The amber note stays; tick may still see a later result. */
export const ENABLE_PENDING_MAX_MS = 5 * 60 * 1000;

export type PendingEnableVerdict = "on" | "off" | "pending" | "deadline";

export type EnableStatusSnapshot = {
  ok?: boolean;
  enabled?: boolean;
  skipped?: boolean;
  signature?: string | null;
  names?: readonly string[] | null;
  amountUsd?: number | null;
  phase?: string | null;
  error?: string | null;
  owner?: string | null;
};

/** Status observed before /enable, so a stale error is not a new failure. */
export type EnableStatusBaseline = {
  error?: string | null;
  phase?: string | null;
};

/** A second Confirm while the first enable is unresolved must not POST /enable. */
export function shouldSendEnable(cycleInFlight: boolean): boolean {
  return !cycleInFlight;
}

/** Pending poll belongs to one pubkey. A wallet switch must not write the next one. */
export function pendingEnableStillFor(
  pendingOwner: string | null,
  wallet: string | null,
): boolean {
  return !!pendingOwner && pendingOwner === wallet;
}

function ownerMatches(st: EnableStatusSnapshot, owner: string): boolean {
  const configured =
    typeof st.owner === "string" && st.owner.trim() ? st.owner.trim() : null;
  if (!configured) return false;
  return configured === owner;
}

/** Keeper already On and the purchase finished. Commit from status; do not /enable. */
export function canCommitEnabledFromStatus(
  st: EnableStatusSnapshot,
  owner: string,
): boolean {
  if (st.enabled !== true || !ownerMatches(st, owner)) return false;
  const fromStatus =
    (st.phase === "ok" || st.phase === "not_due") &&
    typeof st.signature === "string" &&
    st.signature.length > 0 &&
    st.amountUsd != null &&
    Array.isArray(st.names) &&
    st.names.length >= 3;
  if (fromStatus) return true;
  return shouldCommitAutoBuyEnabled(st);
}

const IN_PROGRESS_ENABLE_PHASES = new Set([
  "buying",
  "checking",
  "ranking",
  "enabling",
  "confirming",
]);

/**
 * Keeper is already On and still inside this week's buy. Do not POST /enable.
 * Poll status until the purchase commits or the daemon reports a new failure.
 */
export function shouldPollInProgressEnable(
  st: EnableStatusSnapshot,
  owner: string,
): boolean {
  if (st.enabled !== true || !ownerMatches(st, owner)) return false;
  return typeof st.phase === "string" && IN_PROGRESS_ENABLE_PHASES.has(st.phase);
}

function isNewDaemonFailure(
  st: EnableStatusSnapshot,
  baseline: EnableStatusBaseline | undefined,
): boolean {
  if (
    st.phase === "buying" ||
    st.phase === "ranking" ||
    st.phase === "checking" ||
    st.phase === "enabling" ||
    st.phase === "confirming"
  ) {
    return false;
  }
  const err = typeof st.error === "string" ? st.error.trim() : "";
  if (
    !err ||
    err === "keeper_unreachable" ||
    err === "enable_timeout" ||
    err === "wallet_required" ||
    err === "signature_rejected" ||
    err.startsWith("sign_rejected")
  ) {
    return false;
  }
  const baseErr = (baseline?.error ?? "").trim();
  const changed =
    err !== baseErr || (st.phase === "error" && baseline?.phase !== "error");
  if (!changed) return false;
  if (st.phase === "error") return true;
  return st.enabled === false;
}

/**
 * After the client times out, decide whether the daemon has finished.
 * `on` commits enabled. `off` is a settled failure (no second disable).
 * `deadline` means we still do not know.
 */
export function resolvePendingEnable(
  st: EnableStatusSnapshot,
  owner: string,
  elapsedMs: number,
  baseline?: EnableStatusBaseline,
  maxMs = ENABLE_PENDING_MAX_MS,
): PendingEnableVerdict {
  if (canCommitEnabledFromStatus(st, owner)) return "on";
  if (isNewDaemonFailure(st, baseline)) return "off";
  if (elapsedMs >= maxMs) return "deadline";
  return "pending";
}

/** True while a startCycle banner should survive keeper-status ticks. */
export function isBannerHoldActive(holdUntilMs: number, nowMs: number): boolean {
  return Number.isFinite(holdUntilMs) && holdUntilMs > 0 && nowMs < holdUntilMs;
}

/**
 * Wallet to turn off after a failed startCycle.
 * Null once the wallet epoch moved — the live owner ref may already be the
 * next pubkey, and a disable must not follow it.
 */
export function cleanupOwnerForFailedCycle(
  cycleOwner: string | null,
  epochAtStart: number,
  epochNow: number,
): string | null {
  if (!cycleOwner) return null;
  if (epochNow !== epochAtStart) return null;
  return cycleOwner;
}

/**
 * Local On (toggle + localStorage) is committed only after a real purchase.
 * ok + skipped, including reason "busy", must stay Off.
 */
export function shouldCommitAutoBuyEnabled(ran: {
  ok?: boolean;
  skipped?: boolean;
  signature?: string | null;
  names?: readonly string[] | null;
}): boolean {
  if (!ran.ok || ran.skipped) return false;
  if (!ran.signature) return false;
  return Boolean(ran.names && ran.names.length >= 3);
}

export const LS_AUTO_WEEKLY_BUY = "prestocks.autoWeeklyBuy";
export const LS_AUTO_WEEKLY_META = "prestocks.autoWeeklyBuy.meta";
export const LS_WEEKLY_BUDGET = "predca_weekly_budget_usd";
/** Set once when the unscoped budget key is discarded. Later wallets must not read it. */
const LS_WEEKLY_BUDGET_MIGRATED = "predca_weekly_budget_usd.__migrated";

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

/** Scope LS by wallet so auto-buy / budget never leak across pubkeys. */
export function scopedLsKey(base: string, owner?: string | null): string {
  if (owner && owner.length > 0) return `${base}.${owner}`;
  return base;
}

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

function hasOwner(owner?: string | null): owner is string {
  return typeof owner === "string" && owner.length > 0;
}

/**
 * Drop the unscoped budget key once. Do not copy it onto a pubkey:
 * a wallet with no scoped key must fall back to the default, and a later
 * wallet must not inherit the same global number.
 */
function discardLegacyWeeklyBudget(): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem(LS_WEEKLY_BUDGET_MIGRATED) === "1") {
      localStorage.removeItem(LS_WEEKLY_BUDGET);
      return;
    }
    localStorage.removeItem(LS_WEEKLY_BUDGET);
    localStorage.setItem(LS_WEEKLY_BUDGET_MIGRATED, "1");
  } catch {
    /* ignore */
  }
}

/** Default OFF — enabling is an explicit opt-in that starts the weekly cycle. */
export function readAutoWeeklyBuy(owner?: string | null): boolean {
  if (!hasOwner(owner)) return DEFAULT_SETTINGS.autoWeeklyBuy;
  return readBool(
    scopedLsKey(LS_AUTO_WEEKLY_BUY, owner),
    DEFAULT_SETTINGS.autoWeeklyBuy,
  );
}

/** `null` = never set for this wallet (do not treat as explicit off). */
export function readAutoWeeklyBuyPref(owner?: string | null): boolean | null {
  try {
    if (typeof localStorage === "undefined" || !hasOwner(owner)) return null;
    const v = localStorage.getItem(scopedLsKey(LS_AUTO_WEEKLY_BUY, owner));
    if (v == null) return null;
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeAutoWeeklyBuy(
  value: boolean,
  owner?: string | null,
): void {
  if (!hasOwner(owner)) return;
  writeBool(scopedLsKey(LS_AUTO_WEEKLY_BUY, owner), value);
}

export function readWeeklyBudgetUsd(
  fallback = DEFAULT_SETTINGS.weeklyAmountUsd,
  owner?: string | null,
): number {
  try {
    if (typeof localStorage === "undefined") return fallback;
    // Disconnected: do not read or create the global key. Caller keeps React state.
    if (!hasOwner(owner)) return fallback;
    discardLegacyWeeklyBudget();
    const raw = localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, owner));
    if (!raw) return fallback;
    const n = Number(raw.trim().replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

export function writeWeeklyBudgetUsd(
  amount: number,
  owner?: string | null,
): void {
  if (!hasOwner(owner)) return;
  try {
    if (
      typeof localStorage !== "undefined" &&
      Number.isFinite(amount) &&
      amount > 0
    ) {
      localStorage.setItem(
        scopedLsKey(LS_WEEKLY_BUDGET, owner),
        String(amount),
      );
    }
  } catch {
    /* ignore */
  }
}

export function readAutoBuyMeta(owner?: string | null): AutoBuyMeta {
  try {
    if (typeof localStorage === "undefined" || !hasOwner(owner)) {
      return { ...EMPTY_META };
    }
    const raw = localStorage.getItem(scopedLsKey(LS_AUTO_WEEKLY_META, owner));
    if (!raw) return { ...EMPTY_META };
    const parsed = JSON.parse(raw) as Partial<AutoBuyMeta>;
    return {
      lastAttemptMs:
        typeof parsed.lastAttemptMs === "number" &&
        Number.isFinite(parsed.lastAttemptMs)
          ? parsed.lastAttemptMs
          : 0,
      lastSuccessMs:
        typeof parsed.lastSuccessMs === "number" &&
        Number.isFinite(parsed.lastSuccessMs)
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

export function writeAutoBuyMeta(
  meta: AutoBuyMeta,
  owner?: string | null,
): void {
  if (!hasOwner(owner)) return;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        scopedLsKey(LS_AUTO_WEEKLY_META, owner),
        JSON.stringify(meta),
      );
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
