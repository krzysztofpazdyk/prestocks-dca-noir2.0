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
  nextAt?: string;
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
export async function keeperStatus(owner?: string): Promise<KeeperRunResult> {
  const q =
    owner && owner.trim()
      ? `?owner=${encodeURIComponent(owner.trim())}`
      : "";
  const r = await keeperFetch(`/status${q}`, { method: "GET" }, 8000);
  if (r.data && r.status !== 0) {
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

export async function keeperGetPrefs(owner?: string): Promise<{
  ok: boolean;
  prefs?: KeeperPrefsPayload;
}> {
  const q =
    owner && owner.trim()
      ? `?owner=${encodeURIComponent(owner.trim())}`
      : "";
  const r = await keeperFetch(`/prefs${q}`, { method: "GET" }, 8000);
  if (!r.ok || !r.data) return { ok: false };
  const data = r.data as KeeperRunResult & { prefs?: KeeperPrefsPayload };
  return { ok: true, prefs: data.prefs };
}

export function getKeeperBaseUrl(): string {
  return keeperUrl();
}
