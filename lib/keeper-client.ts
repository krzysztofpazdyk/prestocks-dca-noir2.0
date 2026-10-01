/** Predca keeper client — public HTTPS (rank API /keeper proxy) + wallet sig auth. */

const DEFAULT_KEEPER = "http://127.0.0.1:8792";

function keeperUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_KEEPER_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const dca = (process.env.NEXT_PUBLIC_DCA_API_URL ?? "").trim().replace(/\/$/, "");
  if (dca) return `${dca}/keeper`;
  return DEFAULT_KEEPER;
}

export type KeeperRunResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  signature?: string;
  names?: string[];
  amountUsd?: number;
  error?: string;
  nextAt?: string | number;
  /** Keeper/on-chain schedule aliases used by older status payloads. */
  next_buy_at?: string | number;
  lastRunTs?: string | number;
  last_run_ts?: string | number;
  lastBuy?: string | number;
  last_buy?: string | number;
  interval?: string | number;
  intervalSec?: string | number;
  interval_sec?: string | number;
  enabled?: boolean;
  owner?: string;
  phase?: string;
  source?: "daemon" | "file" | string;
  daemon?: boolean;
  detail?: string;
};

export type KeeperSignFn = (message: Uint8Array) => Promise<Uint8Array>;

const SIG_TTL_S = 5 * 60;

function bytesToBase58(bytes: Uint8Array): string {
  const ALPH = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits = [0];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = "";
  for (let i = 0; i < zeros; i++) out += "1";
  for (let i = digits.length - 1; i >= 0; i--) out += ALPH[digits[i]];
  return out;
}

/** Cleartext message the proxy verifies (action + owner + expiry). */
export function buildKeeperAuthMessage(action: string, owner: string): string {
  const expires = Math.floor(Date.now() / 1000) + SIG_TTL_S;
  return [
    "Predca keeper authorization",
    `action:${action}`,
    `owner:${owner}`,
    `expires:${expires}`,
  ].join("\n");
}

export async function signKeeperAuth(
  signMessage: KeeperSignFn,
  action: string,
  owner: string,
): Promise<{ wallet: string; message: string; signature: string; owner: string }> {
  const message = buildKeeperAuthMessage(action, owner);
  const sig = await signMessage(new TextEncoder().encode(message));
  return {
    wallet: owner,
    owner,
    message,
    signature: bytesToBase58(sig),
  };
}

type StatusAuthCached = {
  wallet: string;
  message: string;
  signature: string;
  owner: string;
  expiresAt: number;
};

/** Module-level cache: reuse status sig until expires-30s (SIG_TTL_S=300). */
const statusAuthCache = new Map<string, StatusAuthCached>();
/** Dedupe concurrent sign prompts (status + prefs hydrate in parallel). */
const statusAuthInflight = new Map<
  string,
  Promise<{ wallet: string; message: string; signature: string; owner: string }>
>();

function parseExpiresFromMessage(message: string): number {
  const m = /expires:(\d+)/i.exec(message);
  return m ? Number(m[1]) : 0;
}

/** Sign action:status once; pollers reuse until near expiry. */
export async function getStatusAuth(
  owner: string,
  signMessage: KeeperSignFn,
): Promise<{ wallet: string; message: string; signature: string; owner: string }> {
  const key = owner.trim();
  const now = Math.floor(Date.now() / 1000);
  const cached = statusAuthCache.get(key);
  if (cached && cached.expiresAt - 30 > now) {
    return {
      wallet: cached.wallet,
      message: cached.message,
      signature: cached.signature,
      owner: cached.owner,
    };
  }
  const pending = statusAuthInflight.get(key);
  if (pending) return pending;
  const promise = (async () => {
    const auth = await signKeeperAuth(signMessage, "status", key);
    const expiresAt = parseExpiresFromMessage(auth.message);
    statusAuthCache.set(key, { ...auth, expiresAt });
    return auth;
  })().finally(() => {
    statusAuthInflight.delete(key);
  });
  statusAuthInflight.set(key, promise);
  return promise;
}

/** Drop cached status auth (e.g. after wallet disconnect). */
export function clearStatusAuthCache(owner?: string): void {
  if (owner) statusAuthCache.delete(owner.trim());
  else statusAuthCache.clear();
}

async function keeperFetch(
  path: string,
  init?: RequestInit,
  timeoutMs = 90000,
): Promise<{ ok: boolean; status: number; data: KeeperRunResult | null }> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(`${keeperUrl()}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
      },
      signal: ctrl.signal,
    });
    let data: KeeperRunResult | null = null;
    try {
      data = (await resp.json()) as KeeperRunResult;
    } catch {
      data = null;
    }
    if (!resp.ok && data && !data.error) {
      const detail =
        typeof (data as { detail?: unknown }).detail === "string"
          ? String((data as { detail: string }).detail)
          : undefined;
      data = {
        ...data,
        ok: false,
        error: detail || data.error || `http_${resp.status}`,
      };
    }
    return { ok: resp.ok, status: resp.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    window.clearTimeout(t);
  }
}

export async function keeperHealth(): Promise<boolean> {
  const r = await keeperFetch("/health", { method: "GET" }, 5000);
  return r.ok;
}

export async function keeperRegister(
  owner: string,
  signMessage: KeeperSignFn,
): Promise<boolean> {
  const auth = await signKeeperAuth(signMessage, "register", owner);
  const r = await keeperFetch(
    "/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth),
    },
    15000,
  );
  return r.ok;
}

export async function keeperRun(
  force: boolean,
  owner: string,
  signMessage: KeeperSignFn,
): Promise<KeeperRunResult> {
  const auth = await signKeeperAuth(signMessage, "run", owner);
  const r = await keeperFetch(
    "/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, force }),
    },
    120000,
  );
  if (!r.data) return { ok: false, error: "keeper_unreachable" };
  return r.data;
}

export async function keeperEnable(
  owner: string,
  force = true,
  signMessage?: KeeperSignFn,
  prefs?: KeeperPrefsPayload,
): Promise<KeeperRunResult> {
  if (!signMessage) {
    return { ok: false, error: "wallet_signature_required" };
  }
  let auth;
  try {
    auth = await signKeeperAuth(signMessage, "enable", owner);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `sign_rejected: ${msg}` };
  }
  const r = await keeperFetch(
    "/enable",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, force, ...(prefs ? { prefs } : {}) }),
    },
    120000,
  );
  if (!r.data) {
    return {
      ok: false,
      error: r.status === 0 ? "keeper_unreachable" : `http_${r.status}`,
    };
  }
  if (!r.ok || r.status === 401 || r.status === 403) {
    return {
      ok: false,
      error:
        r.data.error ||
        r.data.detail ||
        (r.status === 401 || r.status === 403
          ? "signature_rejected"
          : `http_${r.status}`),
    };
  }
  return r.data;
}

export async function keeperDisable(
  owner: string,
  signMessage?: KeeperSignFn,
): Promise<KeeperRunResult> {
  if (!signMessage) {
    return { ok: false, error: "wallet_signature_required" };
  }
  let auth;
  try {
    auth = await signKeeperAuth(signMessage, "disable", owner);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `sign_rejected: ${msg}` };
  }
  const r = await keeperFetch(
    "/disable",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth),
    },
    15000,
  );
  if (!r.data) {
    return {
      ok: false,
      error: r.status === 0 ? "keeper_unreachable" : `http_${r.status}`,
    };
  }
  if (!r.ok || r.status === 401 || r.status === 403) {
    return {
      ok: false,
      error:
        r.data.error ||
        r.data.detail ||
        (r.status === 401 || r.status === 403
          ? "signature_rejected"
          : `http_${r.status}`),
    };
  }
  return r.data;
}

/**
 * Live keeper `/status` (public, redacted). Pass owner for per-wallet status.
 */
function timestampMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value !== "string" || !value.trim()) return null;
  const numeric = Number(value.trim());
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function intervalMs(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  // Keeper intervals are normally seconds; accept milliseconds for API variants.
  return seconds < 1e10 ? seconds * 1000 : seconds;
}

/**
 * Resolve the next purchase from keeper status, tolerating current and legacy
 * snake_case payloads, then fall back to the on-chain RunRecord timestamp.
 */
export function keeperNextBuyAtMs(
  status: KeeperRunResult,
  fallbackLastBuyTs?: number | null,
): number | null {
  const direct = [status.nextAt, status.next_buy_at]
    .map(timestampMs)
    .find((value): value is number => value != null);
  if (direct != null) return direct;

  const lastBuy = [
    status.lastRunTs,
    status.last_run_ts,
    status.lastBuy,
    status.last_buy,
  ]
    .map(timestampMs)
    .find((value): value is number => value != null)
    ?? timestampMs(fallbackLastBuyTs);
  if (lastBuy == null) return null;

  const interval = [status.intervalSec, status.interval_sec, status.interval]
    .map(intervalMs)
    .find((value): value is number => value != null);
  return lastBuy + (interval ?? 7 * 24 * 60 * 60 * 1000);
}

/**
 * Per-owner keeper status — requires wallet signature (action:status).
 * Without owner/signMessage returns wallet_required (use keeperHealth for alive).
 * Status auth is cached ~5min so polling does not re-prompt the wallet.
 */
export async function keeperStatus(
  owner?: string,
  signMessage?: KeeperSignFn,
): Promise<KeeperRunResult> {
  if (!owner?.trim() || !signMessage) {
    return { ok: false, error: "wallet_required" };
  }
  let auth;
  try {
    auth = await getStatusAuth(owner.trim(), signMessage);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `sign_rejected: ${msg}` };
  }
  const r = await keeperFetch(
    "/status",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth),
    },
    8000,
  );
  if (r.data && r.status !== 0) {
    if (!r.ok || r.status === 401 || r.status === 403) {
      // Stale/invalid cache — clear so next poll re-signs
      clearStatusAuthCache(owner);
      return {
        ...r.data,
        ok: false,
        error:
          r.data.error ||
          r.data.detail ||
          (r.status === 401 || r.status === 403
            ? "signature_rejected"
            : `http_${r.status}`),
        source: r.data.source ?? "daemon",
      };
    }
    return { ...r.data, source: r.data.source ?? "daemon" };
  }
  return { ok: false, error: "keeper_unreachable" };
}

export type KeeperPrefsPayload = {
  exclusions?: string[];
  deadlines_unimportant?: boolean;
  premiums_matter?: boolean;
  premiums_especially_near_ipo?: boolean;
  buy_despite_ipo?: boolean;
};

/** Push Settings prefs — requires wallet signature. */
export async function keeperPushPrefs(
  prefs: KeeperPrefsPayload,
  owner?: string,
  signMessage?: KeeperSignFn,
): Promise<{ ok: boolean; prefs?: KeeperPrefsPayload; error?: string }> {
  if (!owner || !signMessage) {
    return { ok: false, error: "wallet_signature_required" };
  }
  let auth;
  try {
    auth = await signKeeperAuth(signMessage, "prefs", owner);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `sign_rejected: ${msg}` };
  }
  const r = await keeperFetch(
    "/prefs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, prefs }),
    },
    15000,
  );
  if (!r.ok || !r.data) {
    const detail =
      (r.data && (r.data.error || r.data.detail)) ||
      (r.status === 0 ? "keeper_unreachable" : undefined);
    return {
      ok: false,
      error:
        detail ||
        (r.status === 401 || r.status === 403
          ? "signature_rejected"
          : `http_${r.status || 0}`),
    };
  }
  const data = r.data as KeeperRunResult & { prefs?: KeeperPrefsPayload };
  return { ok: true, prefs: data.prefs };
}

/** Prefs via signed status (GET /prefs is 401). Reuses status auth cache. */
export async function keeperGetPrefs(
  owner?: string,
  signMessage?: KeeperSignFn,
): Promise<{
  ok: boolean;
  prefs?: KeeperPrefsPayload;
  error?: string;
}> {
  if (!owner?.trim() || !signMessage) {
    return { ok: false, error: "wallet_required" };
  }
  const st = await keeperStatus(owner, signMessage);
  if (!st.ok) {
    return { ok: false, error: st.error };
  }
  const data = st as KeeperRunResult & { prefs?: KeeperPrefsPayload };
  return { ok: true, prefs: data.prefs };
}

export function getKeeperBaseUrl(): string {
  return keeperUrl();
}
