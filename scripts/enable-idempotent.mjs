/**
 * Pure rules for an idempotent /enable.
 * A confirm timeout, a busy lock, or a proxy timeout must not look like a
 * failed buy: the same week must not execute_buy twice.
 */

export const RECENT_RUN_GUARD_MS = 10 * 60 * 1000;
export const CONFIRM_POLL_MS = 3_000;
export const CONFIRM_POLL_MAX_MS = 90_000;

const CONFIRM_SIG_RE = /signature ([1-9A-HJ-NP-Za-km-z]{64,88})/;

/**
 * Signature from a confirm-timeout error, if the tx may already have landed.
 * TransactionExpiredTimeoutError carries err.signature. Anchor does not retry it.
 * Returns null when there is nothing to poll.
 */
export function signatureFromConfirmError(err) {
  if (!err || typeof err !== "object") return null;
  const direct = "signature" in err ? err.signature : null;
  if (typeof direct === "string" && direct.length >= 64 && direct.length <= 88) {
    return direct;
  }
  const message = err instanceof Error ? err.message : String(err.message ?? "");
  const match = CONFIRM_SIG_RE.exec(message);
  if (match) return match[1];
  if (err.name === "TransactionExpiredTimeoutError" && typeof direct === "string" && direct.length > 0) {
    return direct;
  }
  return null;
}

/** confirmed/finalized with no err → ok. A status row with err → failed. Null row → still pending. */
export function classifySignatureStatus(row) {
  if (!row) return "pending";
  if (row.err) return "failed";
  if (row.confirmationStatus === "confirmed" || row.confirmationStatus === "finalized") {
    return "ok";
  }
  return "pending";
}

/**
 * force=true and an on-chain lastRunTs younger than 10 minutes must not execute_buy.
 * lastRunTsSec is unix seconds.
 */
export function isRecentForcedRun(force, lastRunTsSec, nowMs) {
  if (!force) return false;
  const ts = Number(lastRunTsSec);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  return nowMs - ts * 1000 < RECENT_RUN_GUARD_MS;
}
