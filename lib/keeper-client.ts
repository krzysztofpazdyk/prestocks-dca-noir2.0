/** Predca keeper client — public HTTPS (rank API /keeper proxy) + wallet sig auth. */

const DEFAULT_KEEPER = "http://127.0.0.1:8792";

function keeperUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_KEEPER_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const dca = (process.env.NEXT_PUBLIC_DCA_API_URL ?? "").trim().replace(/\/$/, "");
  if (dca) return `${dca}/keeper`;
  return DEFAULT_KEEPER;
}

export type KeeperMode = "live" | "dry-run";

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
  /** live = real execute_buy; dry-run = no txs (must match daemon gate). */
  mode?: KeeperMode | string;
  detail?: string;
  /** Client gave up waiting. The daemon may still finish /enable. */
  pending?: boolean;
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

type SessionCached = {
  token: string;
  expiresAt: number;
  owner: string;
};

/** Module-level cache: reuse status sig until expires-30s (SIG_TTL_S=300). */
const statusAuthCache = new Map<string, StatusAuthCached>();
/** Short-lived server session (Bearer) — avoids Phantom re-prompt every ~5 min. */
const sessionCache = new Map<string, SessionCached>();
/** Dedupe concurrent sign prompts (status + prefs hydrate in parallel). */
const statusAuthInflight = new Map<
  string,
  Promise<{ wallet: string; message: string; signature: string; owner: string }>
>();
const sessionInflight = new Map<
  string,
  Promise<{ session: SessionCached | null; result: KeeperRunResult | null }>
>();
/**
 * Bumped on clear so an in-flight sign cannot write the cache back after
 * disconnect. Per-owner bumps do not invalidate other wallets.
 */
let statusAuthEpoch = 0;
const statusAuthEpochByOwner = new Map<string, number>();

function authGeneration(owner: string): number {
  return statusAuthEpoch + (statusAuthEpochByOwner.get(owner) ?? 0);
}

function parseExpiresFromMessage(message: string): number {
  const m = /expires:(\d+)/i.exec(message);
  return m ? Number(m[1]) : 0;
}

function sessionStorageKey(owner: string): string {
  return `predca.keeper.session.${owner.trim()}`;
}

function readStoredSession(owner: string): SessionCached | null {
  const key = owner.trim();
  if (typeof localStorage === "undefined") return null;
  try {
    const sk = sessionStorageKey(key);
    let raw = localStorage.getItem(sk);
    // Migrate v3.38–3.43 sessionStorage → localStorage (12h TTL survives tab close).
    if (!raw && typeof sessionStorage !== "undefined") {
      try {
        raw = sessionStorage.getItem(sk);
        if (raw) {
          localStorage.setItem(sk, raw);
          sessionStorage.removeItem(sk);
        }
      } catch {
        /* ignore */
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionCached;
    if (
      !parsed ||
      typeof parsed.token !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.owner !== key
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(session: SessionCached): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(sessionStorageKey(session.owner), JSON.stringify(session));
  } catch {
    /* ignore quota / private mode */
  }
}

function removeStoredSession(owner?: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (owner) localStorage.removeItem(sessionStorageKey(owner));
    else {
      const prefix = "predca.keeper.session.";
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) localStorage.removeItem(k);
      }
    }
  } catch {
    /* ignore */
  }
}

function getCachedSession(owner: string): SessionCached | null {
  const key = owner.trim();
  const now = Math.floor(Date.now() / 1000);
  const mem = sessionCache.get(key);
  if (mem && mem.expiresAt - 60 > now) return mem;
  const stored = readStoredSession(key);
  if (stored && stored.expiresAt - 60 > now) {
    sessionCache.set(key, stored);
    return stored;
  }
  if (mem) sessionCache.delete(key);
  if (stored) removeStoredSession(key);
  return null;
}

function setCachedSession(
  owner: string,
  token: string,
  expiresAt: number,
  generation?: number,
): void {
  const key = owner.trim();
  if (generation !== undefined && generation !== authGeneration(key)) return;
  const session: SessionCached = { token, expiresAt, owner: key };
  sessionCache.set(key, session);
  writeStoredSession(session);
}

/** Sign action:status once; pollers reuse until near expiry (fallback before session). */
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
  const generation = authGeneration(key);
  const promise = (async () => {
    const auth = await signKeeperAuth(signMessage, "status", key);
    if (authGeneration(key) !== generation) return auth;
    const expiresAt = parseExpiresFromMessage(auth.message);
    statusAuthCache.set(key, { ...auth, expiresAt });
    return auth;
  })().finally(() => {
    if (statusAuthInflight.get(key) === promise) statusAuthInflight.delete(key);
  });
  statusAuthInflight.set(key, promise);
  return promise;
}

/**
 * Drop status signature, Bearer session, localStorage, and in-flight sign/mint
 * for one owner. Omit owner to drop every wallet. Wallet change and disconnect
 * call this. A 401 on Bearer uses clearSessionOnly so the status signature
 * can still be reused until SIG_TTL_S.
 */
export function clearStatusAuthCache(owner?: string): void {
  if (owner) {
    const key = owner.trim();
    if (!key) return;
    statusAuthEpochByOwner.set(key, (statusAuthEpochByOwner.get(key) ?? 0) + 1);
    statusAuthCache.delete(key);
    sessionCache.delete(key);
    statusAuthInflight.delete(key);
    sessionInflight.delete(key);
    removeStoredSession(key);
    return;
  }
  statusAuthEpoch += 1;
  statusAuthEpochByOwner.clear();
  statusAuthCache.clear();
  sessionCache.clear();
  statusAuthInflight.clear();
  sessionInflight.clear();
  removeStoredSession();
}

/** Abort from our timeout, not a daemon answer. */
export function isKeeperTimeoutError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? (err as { name?: unknown }).name : "";
  return name === "AbortError" || name === "TimeoutError";
}

export type KeeperTransport = {
  ok: boolean;
  status: number;
  data: KeeperRunResult | null;
  timedOut: boolean;
};

/**
 * No HTTP body and a timeout or status 0 means the daemon may still be
 * inside /enable. Do not treat that as a finished failure.
 */
export function enableResultFromTransport(r: KeeperTransport): KeeperRunResult {
  if (!r.data) {
    if (r.timedOut || r.status === 0) {
      return { ok: false, pending: true, error: "enable_timeout" };
    }
    return { ok: false, error: `http_${r.status}` };
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

async function keeperFetch(
  path: string,
  init?: RequestInit,
  timeoutMs = 90000,
): Promise<KeeperTransport> {
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
    return { ok: resp.ok, status: resp.status, data, timedOut: false };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      timedOut: isKeeperTimeoutError(err),
    };
  } finally {
    window.clearTimeout(t);
  }
}

function parseKeeperMode(raw: unknown): KeeperMode | null {
  if (raw === "live" || raw === "dry-run") return raw;
  return null;
}

/** Public keeper /health — ok + trade mode (same flag as buy path). */
export async function keeperHealthInfo(): Promise<{
  ok: boolean;
  mode: KeeperMode | null;
}> {
  const r = await keeperFetch("/health", { method: "GET" }, 5000);
  if (!r.ok) return { ok: false, mode: null };
  const mode = parseKeeperMode(r.data?.mode) ?? "live";
  return { ok: true, mode };
}

export async function keeperHealth(): Promise<boolean> {
  const info = await keeperHealthInfo();
  return info.ok;
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
  return enableResultFromTransport(r);
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

type StatusWithSession = KeeperRunResult & {
  sessionToken?: string;
  sessionExpiresAt?: number;
  detail?: string;
};

type StatusMintResult = {
  session: SessionCached | null;
  result: KeeperRunResult | null;
};

function ingestSessionFromPayload(
  owner: string,
  data: StatusWithSession | null,
  generation?: number,
): void {
  if (!data) return;
  const raw = data as StatusWithSession & {
    session_token?: string;
    session_expires_at?: number | string;
  };
  const token =
    (typeof raw.sessionToken === "string" && raw.sessionToken) ||
    (typeof raw.session_token === "string" && raw.session_token) ||
    "";
  const expRaw = raw.sessionExpiresAt ?? raw.session_expires_at;
  const exp =
    typeof expRaw === "number"
      ? expRaw
      : typeof expRaw === "string" && expRaw.trim()
        ? Number(expRaw)
        : NaN;
  if (token && Number.isFinite(exp) && exp > 0) {
    // Accept ms timestamps defensively.
    const expSec = exp > 1e12 ? Math.floor(exp / 1000) : Math.floor(exp);
    setCachedSession(owner, token, expSec, generation);
  }
}

/** Drop session only — keep statusAuthCache so a 401 remint can stay silent. */
function clearSessionOnly(owner: string): void {
  const key = owner.trim();
  sessionCache.delete(key);
  removeStoredSession(key);
}

function statusErrorFrom(
  data: StatusWithSession,
  status: number,
): KeeperRunResult {
  return {
    ...data,
    ok: false,
    error:
      data.error ||
      data.detail ||
      (status === 401 || status === 403 ? "signature_rejected" : `http_${status}`),
    source: data.source ?? "daemon",
  };
}

/**
 * Per-owner keeper status — one wallet sign mints a server session; polls use Bearer.
 * Without owner/signMessage returns wallet_required (use keeperHealth for alive).
 * On Bearer 401 soft-clears session (keeps status sig cache) and remints once.
 */
export async function keeperStatus(
  owner?: string,
  signMessage?: KeeperSignFn,
): Promise<KeeperRunResult> {
  if (!owner?.trim() || !signMessage) {
    return { ok: false, error: "wallet_required" };
  }
  const key = owner.trim();

  const fetchWithBearer = async (token: string) =>
    keeperFetch(
      `/status?owner=${encodeURIComponent(key)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Keeper-Session": token,
        },
      },
      8000,
    );

  const signAndMint = async (): Promise<StatusMintResult> => {
    const generation = authGeneration(key);
    const dropped = (): StatusMintResult => ({
      session: null,
      result: { ok: false, error: "keeper_unreachable" },
    });
    // Another poll may have minted while we waited on inflight/401.
    const raced = getCachedSession(key);
    if (raced) {
      const br = await fetchWithBearer(raced.token);
      if (authGeneration(key) !== generation) return dropped();
      if (
        br.data &&
        br.status !== 0 &&
        br.ok &&
        br.status !== 401 &&
        br.status !== 403
      ) {
        ingestSessionFromPayload(key, br.data as StatusWithSession, generation);
        return {
          session: getCachedSession(key),
          result: { ...br.data, source: br.data.source ?? "daemon" },
        };
      }
    }
    let auth;
    try {
      auth = await getStatusAuth(key, signMessage);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        session: null,
        result: { ok: false, error: `sign_rejected: ${msg}` },
      };
    }
    if (authGeneration(key) !== generation) return dropped();
    const r = await keeperFetch(
      "/status",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      },
      8000,
    );
    if (authGeneration(key) !== generation) return dropped();
    const data = r.data as StatusWithSession | null;
    if (data && r.status !== 0 && r.ok && r.status !== 401 && r.status !== 403) {
      ingestSessionFromPayload(key, data, generation);
      return {
        session: getCachedSession(key),
        result: { ...data, source: data.source ?? "daemon" },
      };
    }
    // 401/403: keep the status signature. Clearing it made the connect poller
    // open "Sign message" again on every tick. One approved action:status
    // signature is reused until it expires (SIG_TTL_S).
    if (data && r.status !== 0) {
      return { session: null, result: statusErrorFrom(data, r.status) };
    }
    return { session: null, result: { ok: false, error: "keeper_unreachable" } };
  };

  // 1) Try existing session (memory + localStorage) — no wallet prompt
  const existing = getCachedSession(key);
  if (existing) {
    const generation = authGeneration(key);
    const r = await fetchWithBearer(existing.token);
    if (authGeneration(key) !== generation) {
      return { ok: false, error: "keeper_unreachable" };
    }
    if (r.data && r.status !== 0 && r.ok && r.status !== 401 && r.status !== 403) {
      ingestSessionFromPayload(key, r.data as StatusWithSession, generation);
      return { ...r.data, source: r.data.source ?? "daemon" };
    }
    if (r.status === 401 || r.status === 403) {
      // Soft-clear: keep statusAuthCache so remint can reuse ~5min sig silently.
      clearSessionOnly(key);
      // fall through — remint below (Phantom only if status auth also expired)
    } else if (r.data && r.status !== 0) {
      return statusErrorFrom(r.data as StatusWithSession, r.status);
    } else {
      return { ok: false, error: "keeper_unreachable" };
    }
  }

  // 2) Dedupe concurrent sign+mint (status + prefs hydrate in parallel)
  const pending = sessionInflight.get(key);
  if (pending) {
    const shared = await pending;
    if (shared.result) return shared.result;
  }

  const mintPromise = signAndMint().finally(() => {
    if (sessionInflight.get(key) === mintPromise) sessionInflight.delete(key);
  });
  sessionInflight.set(key, mintPromise);
  const minted = await mintPromise;
  if (minted.result) return minted.result;
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
