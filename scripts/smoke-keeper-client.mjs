/**
 * Smoke: mimic keeperStatus session reuse against live API.
 * Counts how many times signMessage is invoked across N polls.
 */
import { Keypair } from '@solana/web3.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';

const KEEPER = 'https://predca-api.onrender.com/keeper';
const SIG_TTL_S = 5 * 60;

const statusAuthCache = new Map();
const sessionCache = new Map();
const statusAuthInflight = new Map();
const sessionInflight = new Map();

function sessionStorageKey(owner) {
  return `predca.keeper.session.${owner.trim()}`;
}
// memory-only stand-in for sessionStorage
const fakeSS = new Map();
function readStoredSession(owner) {
  const key = owner.trim();
  const raw = fakeSS.get(sessionStorageKey(key));
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number' || parsed.owner !== key) return null;
  return parsed;
}
function writeStoredSession(session) {
  fakeSS.set(sessionStorageKey(session.owner), JSON.stringify(session));
}
function removeStoredSession(owner) {
  if (owner) fakeSS.delete(sessionStorageKey(owner));
}
function getCachedSession(owner) {
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
function setCachedSession(owner, token, expiresAt) {
  const key = owner.trim();
  const session = { token, expiresAt, owner: key };
  sessionCache.set(key, session);
  writeStoredSession(session);
}
function clearStatusAuthCache(owner) {
  const key = owner.trim();
  statusAuthCache.delete(key);
  sessionCache.delete(key);
  removeStoredSession(key);
}
function parseExpiresFromMessage(message) {
  const m = /expires:(\d+)/i.exec(message);
  return m ? Number(m[1]) : 0;
}
function buildKeeperAuthMessage(action, owner) {
  const expires = Math.floor(Date.now() / 1000) + SIG_TTL_S;
  return ['Predca keeper authorization', `action:${action}`, `owner:${owner}`, `expires:${expires}`].join('\n');
}

let signCount = 0;
const kp = Keypair.generate();
const owner = kp.publicKey.toBase58();
const seed = kp.secretKey.slice(0, 32);

async function signMessage(bytes) {
  signCount++;
  console.log('SIGN_CALL', signCount);
  return ed25519.sign(bytes, seed);
}

async function signKeeperAuth(action, owner) {
  const message = buildKeeperAuthMessage(action, owner);
  const sig = await signMessage(new TextEncoder().encode(message));
  return { wallet: owner, owner, message, signature: bs58.encode(sig) };
}

async function getStatusAuth(owner) {
  const key = owner.trim();
  const now = Math.floor(Date.now() / 1000);
  const cached = statusAuthCache.get(key);
  if (cached && cached.expiresAt - 30 > now) {
    console.log('statusAuth CACHE HIT');
    return { wallet: cached.wallet, message: cached.message, signature: cached.signature, owner: cached.owner };
  }
  const pending = statusAuthInflight.get(key);
  if (pending) return pending;
  const promise = (async () => {
    const auth = await signKeeperAuth('status', key);
    const expiresAt = parseExpiresFromMessage(auth.message);
    statusAuthCache.set(key, { ...auth, expiresAt });
    return auth;
  })().finally(() => statusAuthInflight.delete(key));
  statusAuthInflight.set(key, promise);
  return promise;
}

async function keeperFetch(path, init, timeoutMs = 90000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(`${KEEPER}${path}`, { ...init, headers: { ...(init?.headers ?? {}) }, signal: ctrl.signal });
    let data = null;
    try { data = await resp.json(); } catch { data = null; }
    return { ok: resp.ok, status: resp.status, data };
  } catch (e) {
    console.log('fetch err', e.message);
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

function ingestSessionFromPayload(owner, data) {
  if (!data) return;
  const token = data.sessionToken;
  const exp = data.sessionExpiresAt;
  console.log('ingest', { hasToken: !!token, exp, expType: typeof exp });
  if (typeof token === 'string' && token && typeof exp === 'number' && exp > 0) {
    setCachedSession(owner, token, exp);
    console.log('SESSION SAVED', getCachedSession(owner)?.token?.slice(0, 8));
  } else {
    console.log('SESSION NOT SAVED');
  }
}

async function keeperStatus() {
  const key = owner.trim();
  const fetchWithBearer = async (token) =>
    keeperFetch(`/status?owner=${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'X-Keeper-Session': token },
    }, 8000);

  const signAndMint = async () => {
    let auth;
    try { auth = await getStatusAuth(key); }
    catch (e) { return { session: null, result: { ok: false, error: String(e) } }; }
    const r = await keeperFetch('/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auth),
    }, 8000);
    const data = r.data;
    console.log('mint HTTP', r.status, 'ok', r.ok, 'keys', data && Object.keys(data));
    if (data && r.status !== 0 && r.ok && r.status !== 401 && r.status !== 403) {
      ingestSessionFromPayload(key, data);
      return { session: getCachedSession(key), result: { ...data, source: data.source ?? 'daemon' } };
    }
    if (r.status === 401 || r.status === 403) clearStatusAuthCache(key);
    return { session: null, result: { ok: false, error: data?.detail || 'fail' } };
  };

  const existing = getCachedSession(key);
  console.log('existingSession', !!existing);
  if (existing) {
    const r = await fetchWithBearer(existing.token);
    console.log('bearer HTTP', r.status, 'ok', r.ok);
    if (r.data && r.status !== 0 && r.ok && r.status !== 401 && r.status !== 403) {
      return { ...r.data, source: r.data.source ?? 'daemon' };
    }
    if (r.status === 401 || r.status === 403) {
      console.log('bearer 401 — clear and remint');
      clearStatusAuthCache(key);
    } else if (r.data && r.status !== 0) {
      return { ok: false, error: 'http' };
    } else {
      return { ok: false, error: 'unreachable' };
    }
  }

  const pending = sessionInflight.get(key);
  if (pending) {
    const shared = await pending;
    if (shared.result) return shared.result;
  }
  const mintPromise = signAndMint().finally(() => sessionInflight.delete(key));
  sessionInflight.set(key, mintPromise);
  const minted = await mintPromise;
  return minted.result || { ok: false, error: 'unreachable' };
}

console.log('owner', owner);
for (let i = 1; i <= 5; i++) {
  console.log('--- poll', i);
  const st = await keeperStatus();
  console.log('result ok', st.ok, 'enabled', st.enabled, 'signCount', signCount);
}
console.log('FINAL signCount', signCount, 'expected 1');
if (signCount !== 1) process.exit(2);
