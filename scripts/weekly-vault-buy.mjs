#!/usr/bin/env node
/**
 * Unattended weekly Predca vault buy (no browser, no user key).
 *
 * Keeper is a cheap bot keypair: SOL for fees only, never user funds.
 * Vault USDC is already in the PDA; token authority is the program PDA.
 * Owner pubkey (PREDCA_OWNER) selects whose vault to crank — public, not a secret.
 *
 *   node scripts/weekly-vault-buy.mjs --once
 *   node scripts/weekly-vault-buy.mjs --force
 *   node scripts/weekly-vault-buy.mjs --daemon
 *
 * Env: KEEPER_KEYPAIR  bot JSON array or path (default ~/.config/predca/keeper.json)
 *      PREDCA_OWNER    vault owner pubkey (the user's wallet, NOT a secret)
 *      NEXT_PUBLIC_RPC_URL / NEXT_PUBLIC_SOLANA_RPC, NEXT_PUBLIC_PREDCA_PROGRAM_ID, NEXT_PUBLIC_USDC_MINT
 *      KEEPER_TOKEN (required for POST mutations; also ~/.config/predca/keeper.token)
 *      NEXT_PUBLIC_DCA_API_URL (optional ranking)
 */

import {
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  openSync,
  closeSync,
  unlinkSync,
  writeSync,
  statSync,
  renameSync,
  readdirSync,
} from "node:fs";
import http from "node:http";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { rpcFetch } from "../lib/rpc-fetch.mjs";
import { resolveSolanaRpcUrl } from "../lib/solana-rpc.mjs";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import anchor from "@coral-xyz/anchor";
const { AnchorProvider, BN, Program, Wallet } = anchor;
import idl from "../idl/predca.json" with { type: "json" };
import mockMints from "../lib/devnet-mock-mints.json" with { type: "json" };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TICK_MS = 15 * 60 * 1000;
const DEFAULT_PROGRAM = "HajLzgcp6fyHVgVLFtwujnU53re47PSMJcQZZes8ZvbU";
const DEFAULT_USDC = "AxKxf1jMaDHLMoqqEUsnvmJyWu7EtzyWyvU63rgwuTm7";
const STATUS_DIR = join(homedir(), ".grok", "long-running-background-tasks");
const STATUS_PATH = join(STATUS_DIR, "weekly_vault_buy_status.json");

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

loadDotEnv(join(ROOT, ".env.local"));
loadDotEnv(join(ROOT, ".env.production"));

function log(...args) {
  const ts = new Date().toISOString();
  console.log(ts, ...args);
}

function writeStatus(partial) {
  try {
    mkdirSync(STATUS_DIR, { recursive: true });
    let prev = {};
    if (existsSync(STATUS_PATH)) {
      try {
        prev = JSON.parse(readFileSync(STATUS_PATH, "utf8"));
      } catch {
        prev = {};
      }
    }
    const enabledVal =
      partial.enabled != null
        ? partial.enabled
        : partial.owner
          ? readEnabled(partial.owner)
          : listEnabledOwners().length > 0;
    writeFileSync(
      STATUS_PATH,
      JSON.stringify(
        {
          ...prev,
          ...partial,
          enabled: enabledVal,
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } catch {
    /* ignore */
  }
}

function rpcUrl() {
  // Same env vars + PUBLIC_DEVNET_RPC fallback as UI (lib/solana-rpc.mjs).
  return resolveSolanaRpcUrl({ allowLocalFallback: false });
}

function programId() {
  return new PublicKey(
    process.env.NEXT_PUBLIC_PREDCA_PROGRAM_ID?.trim() || DEFAULT_PROGRAM,
  );
}

function usdcMint() {
  return new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT?.trim() || DEFAULT_USDC);
}

const DEFAULT_KEEPER_PATH = join(homedir(), ".config", "predca", "keeper.json");
const CONFIG_DIR = join(homedir(), ".config", "predca");
const OWNERS_DIR = join(CONFIG_DIR, "owners");
const LEGACY_OWNER_PATH = join(CONFIG_DIR, "owner.txt");
const LEGACY_ENABLED_PATH = join(CONFIG_DIR, "enabled");
const LEGACY_PREFS_PATH = join(CONFIG_DIR, "prefs.json");
const SPEND_LIMITS_PATH = join(CONFIG_DIR, "spend-limits.json");
const LOCK_PATH = join(CONFIG_DIR, "buy.lock");
const KEEPER_PORT = Number(process.env.KEEPER_PORT || 8791);
const LOCK_STALE_MS = 5 * 60 * 1000;
const TOKEN_PATH = join(CONFIG_DIR, "keeper.token");
const TOKEN_PATH_LEGACY = join(CONFIG_DIR, "http_token");

/** Per-owner storage: ~/.config/predca/owners/<pubkey>/{prefs.json,enabled,state.json} */
function assertOwnerPubkey(pk) {
  const s = String(pk || "").trim();
  if (!s) throw new Error("missing owner pubkey");
  // Validate base58 pubkey length / Solana PublicKey parse
  try {
    // eslint-disable-next-line no-new
    new PublicKey(s);
  } catch (e) {
    throw new Error(`invalid owner pubkey: ${s}`);
  }
  return s;
}

function ownerDir(pk) {
  return join(OWNERS_DIR, assertOwnerPubkey(pk));
}

function ownerPrefsPath(pk) {
  return join(ownerDir(pk), "prefs.json");
}

function ownerEnabledPath(pk) {
  return join(ownerDir(pk), "enabled");
}

function ownerStatePath(pk) {
  return join(ownerDir(pk), "state.json");
}

function migrateLegacyOwnerOnce() {
  try {
    if (!existsSync(LEGACY_OWNER_PATH)) return null;
    const pk = readFileSync(LEGACY_OWNER_PATH, "utf8").trim();
    if (!pk) return null;
    const dir = ownerDir(pk);
    mkdirSync(dir, { recursive: true });
    const marker = join(dir, ".migrated_from_legacy");
    if (existsSync(marker)) return pk;
    if (existsSync(LEGACY_PREFS_PATH) && !existsSync(ownerPrefsPath(pk))) {
      writeFileSync(ownerPrefsPath(pk), readFileSync(LEGACY_PREFS_PATH), { mode: 0o600 });
    }
    if (existsSync(LEGACY_ENABLED_PATH) && !existsSync(ownerEnabledPath(pk))) {
      writeFileSync(ownerEnabledPath(pk), readFileSync(LEGACY_ENABLED_PATH));
    }
    writeFileSync(marker, new Date().toISOString() + "\n");
    log("migrated legacy global owner into", dir);
    return pk;
  } catch (e) {
    log("legacy migrate skipped", e instanceof Error ? e.message : e);
    return null;
  }
}

function listOwnerPubkeys() {
  if (!existsSync(OWNERS_DIR)) return [];
  const out = [];
  for (const ent of readdirSync(OWNERS_DIR, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    try {
      assertOwnerPubkey(ent.name);
      out.push(ent.name);
    } catch {
      /* skip non-pubkey dirs */
    }
  }
  return out;
}

function listEnabledOwners() {
  return listOwnerPubkeys().filter((pk) => readEnabled(pk));
}

function loadSpendLimits() {
  let fileLimits = {};
  if (existsSync(SPEND_LIMITS_PATH)) {
    try {
      const parsed = JSON.parse(readFileSync(SPEND_LIMITS_PATH, "utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("spend-limits.json must contain a JSON object");
      }
      fileLimits = parsed;
    } catch (e) {
      throw new Error(
        `Nie można odczytać limitów wydatków (${SPEND_LIMITS_PATH}): ${e instanceof Error ? e.message : e}`,
      );
    }
  }
  const readLimit = (key, envKey, fallback) => {
    const raw = fileLimits[key] ?? process.env[envKey] ?? fallback;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Nieprawidłowy limit wydatków ${key}: ${String(raw)}`);
    }
    return value;
  };
  return {
    start_usd: readLimit("start_usd", "KEEPER_START_USD", 1),
    max_usd: readLimit("max_usd", "KEEPER_MAX_SPEND_USD", 1_000_000),
    path: SPEND_LIMITS_PATH,
  };
}

function enforceSpendLimits(budgetUsd, totalDebit, limits) {
  const exceeded = [];
  if (budgetUsd > limits.max_usd) {
    exceeded.push(`weekly budget $${budgetUsd.toFixed(6)} > max_usd $${limits.max_usd.toFixed(6)}`);
  }
  if (totalDebit > limits.max_usd) {
    exceeded.push(`total debit $${totalDebit.toFixed(6)} > max_usd $${limits.max_usd.toFixed(6)}`);
  }
  if (!exceeded.length) return;
  const msg = `Spending limit exceeded; execute_buy blocked: ${exceeded.join("; ")}`;
  writeStatus({
    phase: "spend_limit",
    error: msg,
    budgetUsd,
    totalDebit,
    spendLimits: limits,
  });
  throw new Error(msg);
}

function expectedKeeperToken() {
  const fromEnv = process.env.KEEPER_TOKEN?.trim() || "";
  if (fromEnv) return fromEnv;
  for (const p of [TOKEN_PATH, TOKEN_PATH_LEGACY]) {
    if (existsSync(p)) {
      const v = readFileSync(p, "utf8").trim();
      if (v) return v;
    }
  }
  return "";
}

function isLocalOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function corsHeaders(req) {
  const origin = String(req.headers.origin || "");
  const allow = isLocalOrigin(origin) ? origin : "http://127.0.0.1:3000";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Keeper-Token, Authorization",
    Vary: "Origin",
  };
}

/** Mutating routes: fail-closed — require configured token (header or Bearer). */
function extractPresentedToken(req) {
  const headerTok = String(req.headers["x-keeper-token"] || "").trim();
  if (headerTok) return headerTok;
  const auth = String(req.headers["authorization"] || "").trim();
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m ? m[1].trim() : "";
}

function authorizeMutating(req) {
  const expected = expectedKeeperToken();
  if (!expected) return false; // fail-closed: no token configured → refuse mutations
  const got = extractPresentedToken(req);
  return Boolean(got) && got === expected;
}

function readEnabled(owner) {
  if (!owner) return false;
  try {
    const p = ownerEnabledPath(owner);
    if (!existsSync(p)) return false;
    return readFileSync(p, "utf8").trim() === "true";
  } catch {
    return false;
  }
}

function writeEnabled(owner, value) {
  const p = ownerEnabledPath(owner);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, value ? "true\n" : "false\n");
}

function readOwnerState(owner) {
  try {
    const p = ownerStatePath(owner);
    if (!existsSync(p)) return {};
    return JSON.parse(readFileSync(p, "utf8")) || {};
  } catch {
    return {};
  }
}

function writeOwnerState(owner, partial) {
  try {
    const p = ownerStatePath(owner);
    mkdirSync(dirname(p), { recursive: true });
    const prev = readOwnerState(owner);
    const next = {
      ...prev,
      ...partial,
      owner: assertOwnerPubkey(owner),
      enabled: partial.enabled != null ? partial.enabled : readEnabled(owner),
      updatedAt: new Date().toISOString(),
    };
    const tmp = p + ".tmp." + process.pid;
    writeFileSync(tmp, JSON.stringify(next, null, 2) + "\n", { mode: 0o600 });
    renameSync(tmp, p);
    return next;
  } catch {
    return null;
  }
}

async function withBuyLock(fn) {
  mkdirSync(dirname(LOCK_PATH), { recursive: true });
  if (existsSync(LOCK_PATH)) {
    try {
      const st = statSync(LOCK_PATH);
      if (Date.now() - st.mtimeMs > LOCK_STALE_MS) unlinkSync(LOCK_PATH);
    } catch {
      /* ignore */
    }
  }
  let fd;
  try {
    fd = openSync(LOCK_PATH, "wx");
  } catch (e) {
    if (e && e.code === "EEXIST") {
      return { ok: true, skipped: true, reason: "busy" };
    }
    throw e;
  }
  try {
    writeSync(fd, String(process.pid));
    return await fn();
  } finally {
    try {
      closeSync(fd);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(LOCK_PATH);
    } catch {
      /* ignore */
    }
  }
}

function loadKeypair(raw, defaultPath, label) {
  const value = (raw || "").trim();
  let json;
  if (value.startsWith("[")) {
    json = JSON.parse(value);
  } else {
    const path = value
      ? isAbsolute(value)
        ? value
        : resolve(ROOT, value)
      : defaultPath;
    if (!existsSync(path)) {
      throw new Error(
        `Brak keypaira ${label} (${path}). Wygeneruj tani portfel bota: solana-keygen new -o ${defaultPath}`,
      );
    }
    json = JSON.parse(readFileSync(path, "utf8"));
  }
  if (!Array.isArray(json)) {
    throw new Error(`${label} musi być tablicą bajtów JSON (solana-keygen).`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(json));
}

function loadKeeper() {
  return loadKeypair(
    process.env.KEEPER_KEYPAIR,
    DEFAULT_KEEPER_PATH,
    "KEEPER_KEYPAIR",
  );
}

function persistOwner(pk) {
  const owner = assertOwnerPubkey(pk);
  mkdirSync(ownerDir(owner), { recursive: true });
  return owner;
}

/** CLI / env fallback (single-shot). Daemon HTTP always passes owner explicitly. */
function loadOwnerPubkey() {
  const raw = (process.env.PREDCA_OWNER || "").trim();
  if (raw) return new PublicKey(raw);
  if (existsSync(LEGACY_OWNER_PATH)) {
    const fromFile = readFileSync(LEGACY_OWNER_PATH, "utf8").trim();
    if (fromFile) return new PublicKey(fromFile);
  }
  const enabled = listEnabledOwners();
  if (enabled.length === 1) return new PublicKey(enabled[0]);
  throw new Error(
    "Ustaw PREDCA_OWNER na pubkey portfela z vaultem Predca (adres publiczny, nie klucz prywatny).",
  );
}

/** Crank IDL: owner is the vault's user, not a signer. Bot is tx fee payer. */
function crankIdl(base) {
  const copy = JSON.parse(JSON.stringify(base));
  for (const ix of copy.instructions ?? []) {
    if (ix.name === "simulate_buy" || ix.name === "execute_buy") {
      for (const acc of ix.accounts ?? []) {
        if (acc.name === "owner") acc.signer = false;
      }
    }
  }
  return copy;
}

function normKey(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, "");
}

const nameToMint = new Map();
for (const entry of mockMints.mints) {
  const pk = new PublicKey(entry.mint);
  nameToMint.set(normKey(entry.name), pk);
  if (entry.symbol) nameToMint.set(normKey(entry.symbol), pk);
  for (const a of entry.aliases ?? []) nameToMint.set(normKey(a), pk);
}

function resolveTop3(names) {
  const mints = [];
  const resolved = [];
  const missing = [];
  for (const name of names.slice(0, 3)) {
    const mint = nameToMint.get(normKey(name));
    if (!mint) {
      missing.push(name);
      continue;
    }
    mints.push(mint);
    resolved.push(name);
  }
  return { mints, names: resolved, missing };
}

function userConfigPda(owner, pid) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user"), owner.toBuffer()],
    pid,
  );
}

function configPda(programId) {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
}

function vaultPda(owner, pid) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.toBuffer()],
    pid,
  );
}

function runRecordPda(owner, runIndex, pid) {
  const idx = BN.isBN(runIndex) ? runIndex : new BN(runIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("run"), owner.toBuffer(), idx.toArrayLike(Buffer, "le", 8)],
    pid,
  );
}

function bnToNumber(raw) {
  if (raw == null) return 0;
  if (typeof raw === "object" && raw !== null && "toNumber" in raw) {
    return raw.toNumber();
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

async function fetchJson(url, init = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await resp.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text.slice(0, 400) };
    }
    return { ok: resp.ok, status: resp.status, data };
  } finally {
    clearTimeout(t);
  }
}


/** Rank prefs for keeper /rank body. Per-owner when owner provided. */
function readKeeperRankPrefs(owner) {
  const envFlag = (name, fallback) => {
    const v = (process.env[name] || "").trim().toLowerCase();
    if (!v) return fallback;
    return ["1", "true", "yes", "on"].includes(v);
  };
  let filePrefs = {};
  try {
    const prefsFile = owner
      ? ownerPrefsPath(owner)
      : existsSync(LEGACY_PREFS_PATH)
        ? LEGACY_PREFS_PATH
        : null;
    if (prefsFile && existsSync(prefsFile)) {
      filePrefs = JSON.parse(readFileSync(prefsFile, "utf8")) || {};
    }
  } catch {
    /* ignore */
  }
  const buyDespite =
    typeof filePrefs.buy_despite_ipo === "boolean"
      ? filePrefs.buy_despite_ipo
      : typeof filePrefs.buyDespiteIpo === "boolean"
        ? filePrefs.buyDespiteIpo
        : envFlag("BUY_DESPITE_IPO", false);
  const deadlines =
    typeof filePrefs.deadlines_unimportant === "boolean"
      ? filePrefs.deadlines_unimportant
      : typeof filePrefs.deadlineInvalid === "boolean"
        ? filePrefs.deadlineInvalid
        : typeof filePrefs.deadlinesUnimportant === "boolean"
          ? filePrefs.deadlinesUnimportant
          : envFlag("DEADLINES_UNIMPORTANT", false);
  // Match Settings ipoPremiumMatters (DEFAULT false). Prefer premiums_matter;
  // fall back to especially-near-ipo / camelCase / env aliases.
  const premiums =
    typeof filePrefs.premiums_matter === "boolean"
      ? filePrefs.premiums_matter
      : typeof filePrefs.premiumsMatter === "boolean"
        ? filePrefs.premiumsMatter
        : typeof filePrefs.ipoPremiumMatters === "boolean"
          ? filePrefs.ipoPremiumMatters
          : typeof filePrefs.premiums_especially_near_ipo === "boolean"
            ? filePrefs.premiums_especially_near_ipo
            : typeof filePrefs.premiumsEspeciallyNearIpo === "boolean"
              ? filePrefs.premiumsEspeciallyNearIpo
              : envFlag(
                  "PREMIUMS_MATTER",
                  envFlag("PREMIUMS_ESPECIALLY_NEAR_IPO", false),
                );
  let exclusions = ["xAI"];
  if (Array.isArray(filePrefs.exclusions) && filePrefs.exclusions.length) {
    exclusions = filePrefs.exclusions.map(String);
  } else if (typeof filePrefs.exclusions === "string" && filePrefs.exclusions.trim()) {
    exclusions = filePrefs.exclusions.split(",").map((s) => s.trim()).filter(Boolean);
  } else if ((process.env.EXCLUDE_NAMES || "").trim()) {
    exclusions = process.env.EXCLUDE_NAMES.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return {
    exclusions,
    deadlines_unimportant: deadlines,
    premiums_matter: premiums,
    premiums_especially_near_ipo: premiums,
    buy_despite_ipo: buyDespite,
  };
}


function normalizeKeeperPrefs(raw = {}) {
  const bool = (v, fallback) => (typeof v === "boolean" ? v : fallback);
  let exclusions = ["xAI"];
  if (Array.isArray(raw.exclusions) && raw.exclusions.length) {
    exclusions = raw.exclusions.map(String);
  } else if (typeof raw.exclusions === "string" && raw.exclusions.trim()) {
    exclusions = raw.exclusions.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (typeof raw.exclusionsRaw === "string" && raw.exclusionsRaw.trim()) {
    exclusions = raw.exclusionsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const buyDespite = bool(
    raw.buy_despite_ipo ?? raw.buyDespiteIpo,
    false,
  );
  const deadlines = bool(
    raw.deadlines_unimportant ?? raw.deadlineInvalid ?? raw.deadlinesUnimportant,
    false,
  );
  const premiums = bool(
    raw.premiums_matter ??
      raw.premiumsMatter ??
      raw.ipoPremiumMatters ??
      raw.premiums_especially_near_ipo ??
      raw.premiumsEspeciallyNearIpo,
    false,
  );
  return {
    exclusions,
    deadlines_unimportant: deadlines,
    premiums_matter: premiums,
    premiums_especially_near_ipo: premiums,
    buy_despite_ipo: buyDespite,
  };
}

/** Atomic write of per-owner prefs.json (UI → keeper sync). */
function writeKeeperRankPrefs(owner, raw) {
  if (!owner) throw new Error("writeKeeperRankPrefs requires owner");
  const normalized = normalizeKeeperPrefs(raw);
  const prefsFile = ownerPrefsPath(owner);
  mkdirSync(dirname(prefsFile), { recursive: true });
  const tmp = prefsFile + ".tmp." + process.pid;
  writeFileSync(tmp, JSON.stringify(normalized, null, 2) + "\n", { mode: 0o600 });
  renameSync(tmp, prefsFile);
  return normalized;
}

/** Seed defaults for one owner if missing. */
function ensureOwnerPrefsDefaults(owner) {
  const prefsFile = ownerPrefsPath(owner);
  if (existsSync(prefsFile)) return readKeeperRankPrefs(owner);
  return writeKeeperRankPrefs(owner, {
    exclusions: ["xAI"],
    deadlines_unimportant: false,
    premiums_matter: false,
    premiums_especially_near_ipo: false,
    buy_despite_ipo: false,
  });
}

/** Daemon boot: migrate legacy + ensure any existing owners have prefs. */
function ensurePrefsDefaults() {
  migrateLegacyOwnerOnce();
  const owners = listOwnerPubkeys();
  if (!owners.length) {
    return {
      exclusions: ["xAI"],
      deadlines_unimportant: false,
      premiums_matter: false,
      premiums_especially_near_ipo: false,
      buy_despite_ipo: false,
    };
  }
  let last = null;
  for (const o of owners) last = ensureOwnerPrefsDefaults(o);
  return last;
}

async function rankTop3(owner) {
  const base = (process.env.NEXT_PUBLIC_DCA_API_URL || "").replace(/\/$/, "");
  if (base) {
    try {
      const r = await fetchJson(
        `${base}/rank`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(readKeeperRankPrefs(owner)),
        },
        60000,
      );
      const top3 = r.data?.top3;
      if (r.ok && Array.isArray(top3) && top3.length >= 3) {
        return {
          names: top3.slice(0, 3).map((x) => x.name),
          source: "hosted_rank",
        };
      }
      log("hosted /rank skipped", r.status, r.data?.error || "");
    } catch (e) {
      log("hosted /rank failed", e instanceof Error ? e.message : e);
    }
  }

  let products = [];
  try {
    const live = await fetchJson("https://prestocks.com/api/metrics", {}, 15000);
    const rows = live.data?.tokens || live.data?.products || live.data;
    if (live.ok && Array.isArray(rows)) {
      products = rows;
    }
  } catch {
    /* snapshot */
  }
  if (products.length < 3) {
    const snap = JSON.parse(
      readFileSync(join(ROOT, "public/data/prestocks-snapshot.json"), "utf8"),
    );
    products = snap.products || [];
  }

  const prefs = readKeeperRankPrefs(owner);
  const productDeadlineInvalid = (p) => {
    const boolKeys = [
      "deadline_invalid",
      "deadlineInvalid",
      "expired",
      "is_expired",
      "isExpired",
    ];
    for (const key of boolKeys) {
      if (p[key] == null) continue;
      const v = p[key];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (["1", "true", "yes", "on", "expired", "invalid"].includes(s)) return true;
        if (["0", "false", "no", "off", "valid", "ok"].includes(s)) return false;
      }
    }
    const dateKeys = ["expires_at", "expiry", "expiry_date", "deadline", "deadline_at"];
    const now = Date.now();
    for (const key of dateKeys) {
      if (p[key] == null || p[key] === "") continue;
      const raw = p[key];
      let ms = null;
      if (typeof raw === "number" && Number.isFinite(raw)) {
        ms = raw < 1e12 ? raw * 1000 : raw;
      } else if (typeof raw === "string") {
        const t = Date.parse(raw);
        if (Number.isFinite(t)) ms = t;
      }
      if (ms != null && ms < now) return true;
    }
    return false;
  };
  const scored = products
    .map((p) => {
      const name = String(p.name || p.symbol || "");
      const premium = Number(p.premium_pct ?? p.premiumPct ?? 0);
      const near = Boolean(p.near_ipo) || normKey(name) === "spacex";
      const ipoDone = Boolean(p.ipo_completed ?? p.ipoCompleted);
      const deadlineBad = Boolean(p.deadline_invalid ?? productDeadlineInvalid(p));
      // premiums_matter OFF: neutralize premium_pct; near-IPO premium bonus OFF
      let score = 50;
      if (prefs.premiums_matter) {
        score -= premium;
        if (near && prefs.premiums_especially_near_ipo) score += 8;
      }
      return { name, score, ipoDone, deadlineBad };
    })
    .filter((p) => p.name && normKey(p.name) !== "xai")
    .filter((p) => prefs.buy_despite_ipo || !p.ipoDone)
    .filter((p) => prefs.deadlines_unimportant || !p.deadlineBad)
    .sort((a, b) => b.score - a.score);

  if (scored.length < 3) {
    throw new Error("Za mało produktów do rankingu (<3).");
  }
  return {
    names: scored.slice(0, 3).map((p) => p.name),
    source: "metrics_fallback",
  };
}

async function nextRunIndex(program, owner, pid) {
  for (let i = 0; i <= 64; i++) {
    const [pda] = runRecordPda(owner, i, pid);
    try {
      await program.account.runRecord.fetch(pda);
    } catch {
      return i;
    }
  }
  return 65;
}

async function ensureAtas(connection, owner, mints, payer) {
  const tx = new Transaction();
  let need = false;
  for (const mint of mints) {
    const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID);
    const info = await connection.getAccountInfo(ata);
    if (!info) {
      need = true;
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          payer.publicKey,
          ata,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }
  }
  if (!need) return;
  tx.feePayer = payer.publicKey;
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  const sig = await sendAndConfirmTransaction(connection, tx, [payer], {
    commitment: "confirmed",
  });
  log("created ATAs (bot paid rent)", sig);
  void lastValidBlockHeight;
}

async function runOnce(opts) {
  const force = Boolean(opts.force);
  const spendLimits = loadSpendLimits();
  const owner = opts.owner
    ? new PublicKey(assertOwnerPubkey(opts.owner))
    : loadOwnerPubkey();
  const ownerStr = owner.toBase58();
  if (opts.requireEnabled !== false && !readEnabled(ownerStr)) {
    writeStatus({ phase: "off", enabled: false, owner: ownerStr });
    writeOwnerState(ownerStr, { phase: "off", enabled: false });
    return { ok: true, skipped: true, reason: "off", enabled: false, owner: ownerStr };
  }
  const keeper = loadKeeper();
  const pid = programId();
  const mint = usdcMint();
  const connection = new Connection(rpcUrl(), {
    commitment: "confirmed",
    fetch: rpcFetch,
    disableRetryOnRateLimit: true,
  });
  const wallet = new Wallet(keeper);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  const program = new Program({ ...idl, address: pid.toBase58() }, provider);

  const keeperSol = (await connection.getBalance(keeper.publicKey)) / 1e9;
  log("keeper", keeper.publicKey.toBase58(), `${keeperSol.toFixed(4)} SOL`);
  log("owner", owner.toBase58());
  log("rpc", rpcUrl());
  writeStatus({
    keeper: keeper.publicKey.toBase58(),
    owner: ownerStr,
    rpc: /devnet/i.test(rpcUrl()) ? "devnet" : "redacted",
    phase: "checking",
    spendLimits,
  });
  writeOwnerState(ownerStr, { phase: "checking", keeper: keeper.publicKey.toBase58() });
  if (keeperSol < 0.01) {
    throw new Error(
      `Keeper ma za mało SOL na opłaty (${keeperSol.toFixed(4)}). Doładuj 0.05–0.2 SOL na ${keeper.publicKey.toBase58()}.`,
    );
  }

  const [cfgPda] = userConfigPda(owner, pid);
  let cfg = null;
  try {
    cfg = await program.account.userConfig.fetch(cfgPda);
  } catch {
    cfg = null;
  }
  if (!cfg) {
    const msg =
      `Predca nie jest zainicjalizowane dla ownera ${owner.toBase58()}. ` +
      "W UI: podłącz ten portfel → Initialize + Deposit USDC do vaulta. Keeper nie potrzebuje klucza usera.";
    writeStatus({ phase: "no_config", error: msg });
    throw new Error(msg);
  }

  const lastTs = bnToNumber(cfg.lastRunTs);
  const lastMs = lastTs > 0 ? lastTs * 1000 : 0;
  const now = Date.now();
  if (!force && lastMs > 0 && now - lastMs < WEEK_MS) {
    const nextAt = new Date(lastMs + WEEK_MS).toISOString();
    log("not due; next", nextAt);
    writeStatus({ phase: "not_due", lastRunTs: lastTs, nextAt, error: null });
    writeOwnerState(ownerStr, { phase: "not_due", nextAt, lastRunTs: lastTs, error: null });
    return { skipped: true, reason: "not_due", nextAt, owner: ownerStr, enabled: true };
  }

  const [vault] = vaultPda(owner, pid);
  let vaultUi = 0;
  try {
    const bal = await connection.getTokenAccountBalance(vault);
    vaultUi = Number(bal.value.uiAmountString ?? bal.value.uiAmount ?? 0);
  } catch {
    vaultUi = 0;
  }
  const budgetRaw = bnToNumber(cfg.weeklyBudgetUsdc);
  const budgetUsd = budgetRaw / 1e6;
  const amountEach = Math.floor(budgetRaw / 3) / 1e6;
  const totalDebit = amountEach * 3;
  enforceSpendLimits(budgetUsd, totalDebit, spendLimits);
  if (!Number.isFinite(vaultUi) || vaultUi < totalDebit) {
    const msg = `Za mało USDC w vault: ${vaultUi.toFixed(2)} < ${totalDebit.toFixed(2)}.`;
    writeStatus({ phase: "vault_low", error: msg, vaultUsdc: vaultUi, need: totalDebit });
    writeOwnerState(ownerStr, {
      phase: "vault_low",
      error: msg,
      vaultUsdc: vaultUi,
      need: totalDebit,
    });
    throw new Error(msg);
  }

  const ranked = await rankTop3(ownerStr);
  log("rank", ranked.source, ranked.names.join(" · "));
  const { mints, names, missing } = resolveTop3(ranked.names);
  if (missing.length || mints.length !== 3) {
    throw new Error(`Brak mapowania mint: ${missing.join(", ") || "top-3 < 3"}`);
  }

  try {
    cfg = await program.account.userConfig.fetch(cfgPda);
  } catch {
    throw new Error("Nie udało się odczytać UserConfig przed zakupem.");
  }
  const lastTs2 = bnToNumber(cfg.lastRunTs);
  const lastMs2 = lastTs2 > 0 ? lastTs2 * 1000 : 0;
  if (!force && lastMs2 > 0 && Date.now() - lastMs2 < WEEK_MS) {
    const nextAt = new Date(lastMs2 + WEEK_MS).toISOString();
    log("not due after rank; next", nextAt);
    writeStatus({ phase: "not_due", lastRunTs: lastTs2, nextAt });
    return { skipped: true, reason: "not_due", nextAt, enabled: true };
  }
  const budgetUsd2 = bnToNumber(cfg.weeklyBudgetUsdc) / 1e6;
  const amountEach2 = Math.floor(bnToNumber(cfg.weeklyBudgetUsdc) / 3) / 1e6;
  const totalDebit2 = amountEach2 * 3;
  enforceSpendLimits(budgetUsd2, totalDebit2, loadSpendLimits());

  const runIndex = await nextRunIndex(program, owner, pid);
  await ensureAtas(connection, owner, mints, keeper);

  writeStatus({
    phase: "buying",
    names,
    runIndex,
    vaultUsdc: vaultUi,
    budgetUsd,
  });

  // force (enable) skips on-chain 7d cooldown so manual buys don't block auto-enable.
  const sig = await program.methods
    .executeBuy(new BN(runIndex), mints, Array.from({ length: 32 }, () => 0), force)
    .accounts({
      keeper: keeper.publicKey,
      config: configPda(pid)[0],
      owner,
      usdcMint: mint,
      mintA: mints[0],
      mintB: mints[1],
      mintC: mints[2],
    })
    .rpc();

  log("execute_buy OK", sig, `$${totalDebit.toFixed(2)} → ${names.join(" · ")}`);
  writeStatus({
    phase: "ok",
    signature: sig,
    names,
    amountUsd: totalDebit,
    runIndex,
    error: null,
  });
  writeOwnerState(ownerStr, {
    phase: "ok",
    signature: sig,
    names,
    amountUsd: totalDebit,
    runIndex,
    enabled: true,
    error: null,
  });
  return { skipped: false, signature: sig, names, amountUsd: totalDebit, runIndex, owner: ownerStr, enabled: true };
}

function parseArgs(argv) {
  return {
    once: argv.includes("--once"),
    force: argv.includes("--force"),
    daemon: argv.includes("--daemon"),
  };
}

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolveBody({});
        return;
      }
      try {
        resolveBody(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function json(res, req, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, corsHeaders(req));
  res.end(payload);
}

function parseReqUrl(req) {
  try {
    const u = new URL(req.url || "/", "http://127.0.0.1");
    return { path: u.pathname, query: Object.fromEntries(u.searchParams.entries()) };
  } catch {
    return { path: req.url?.split("?")[0] ?? "/", query: {} };
  }
}

function startKeeperHttp() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders(req));
      res.end();
      return;
    }
    const { path: url, query } = parseReqUrl(req);
    try {
      if (req.method === "GET" && url === "/health") {
        const enabledOwners = listEnabledOwners();
        json(res, req, 200, {
          ok: true,
          pid: process.pid,
          enabled: enabledOwners.length > 0,
          enabledCount: enabledOwners.length,
          daemon: true,
          multiUser: true,
          port: KEEPER_PORT,
          program: programId().toBase58(),
          spendLimits: loadSpendLimits(),
        });
        return;
      }
      if (req.method === "GET" && url === "/status") {
        const rpcRaw = rpcUrl();
        const rpcRedacted = /devnet/i.test(rpcRaw)
          ? "devnet"
          : /mainnet/i.test(rpcRaw)
            ? "mainnet-redacted"
            : "redacted";
        const spend = loadSpendLimits();
        const spendPublic = { start_usd: spend.start_usd, max_usd: spend.max_usd };
        const qOwner = (query.owner || "").trim();
        if (qOwner) {
          let owner;
          try {
            owner = assertOwnerPubkey(qOwner);
          } catch (e) {
            json(res, req, 400, { ok: false, error: e instanceof Error ? e.message : String(e) });
            return;
          }
          const state = readOwnerState(owner);
          let prefs = {};
          try {
            prefs = readKeeperRankPrefs(owner);
          } catch {
            prefs = {};
          }
          json(res, req, 200, {
            ok: true,
            ...state,
            owner,
            enabled: readEnabled(owner),
            daemon: true,
            multiUser: true,
            port: KEEPER_PORT,
            program: programId().toBase58(),
            rpc: rpcRedacted,
            prefs,
            spendLimits: spendPublic,
          });
          return;
        }
        // Summary only — no other users' prefs/secrets
        const owners = listOwnerPubkeys().map((o) => ({
          owner: o,
          enabled: readEnabled(o),
          phase: readOwnerState(o).phase || null,
        }));
        const enabledOwners = owners.filter((o) => o.enabled);
        json(res, req, 200, {
          ok: true,
          daemon: true,
          multiUser: true,
          enabled: enabledOwners.length > 0,
          enabledCount: enabledOwners.length,
          owners,
          port: KEEPER_PORT,
          program: programId().toBase58(),
          rpc: rpcRedacted,
          spendLimits: spendPublic,
        });
        return;
      }
      if (req.method === "POST" && url === "/register") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const owner = String(body.owner ?? "").trim();
        if (!owner) {
          json(res, req, 400, { ok: false, error: "missing owner pubkey" });
          return;
        }
        persistOwner(owner);
        ensureOwnerPrefsDefaults(owner);
        log("registered owner", owner);
        json(res, req, 200, { ok: true, owner });
        return;
      }
      if (req.method === "POST" && url === "/enable") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const owner = String(body.owner ?? "").trim();
        if (!owner) {
          json(res, req, 400, { ok: false, error: "missing owner pubkey" });
          return;
        }
        persistOwner(owner);
        if (
          body.prefs ||
          body.buy_despite_ipo != null ||
          body.deadlines_unimportant != null ||
          body.premiums_matter != null ||
          body.exclusions != null
        ) {
          const prefsRaw = body.prefs && typeof body.prefs === "object" ? body.prefs : body;
          writeKeeperRankPrefs(owner, prefsRaw);
          log("synced prefs on enable", owner, readKeeperRankPrefs(owner));
        } else {
          ensureOwnerPrefsDefaults(owner);
        }
        // Do not leave enabled=true unless a real purchase commits below.
        writeEnabled(owner, false);
        writeOwnerState(owner, { phase: "enabling", enabled: false, error: null });
        log("enable attempt for", owner, "force", body.force !== false);
        let result;
        try {
          result = await withBuyLock(() =>
            runOnce({
              force: body.force !== false,
              requireEnabled: false,
              owner,
            }),
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log("enable force-buy error → disabled", owner, msg);
          writeEnabled(owner, false);
          writeOwnerState(owner, { phase: "error", enabled: false, error: msg });
          writeStatus({ phase: "error", enabled: false, owner, error: msg });
          json(res, req, 200, {
            ok: false,
            enabled: false,
            owner,
            skipped: true,
            reason: "buy_error",
            error: msg,
          });
          return;
        }
        if (result && result.skipped && result.reason === "busy") {
          // Busy-only: do not commit enabled; client may retry.
          writeEnabled(owner, false);
          writeOwnerState(owner, { phase: "buying", enabled: false, error: null });
          writeStatus({ phase: "buying", enabled: false, owner, error: null });
          json(res, req, 200, {
            ok: true,
            enabled: false,
            owner,
            skipped: true,
            reason: "busy",
          });
          return;
        }
        if (
          !result ||
          result.skipped ||
          result.error ||
          !result.signature ||
          !result.names ||
          result.names.length < 3
        ) {
          const msg = String(
            (result && (result.error || result.reason)) ||
              "enable did not complete a purchase",
          );
          log("enable skipped/incomplete → disabled", owner, msg);
          writeEnabled(owner, false);
          writeOwnerState(owner, { phase: "error", enabled: false, error: msg });
          writeStatus({ phase: "error", enabled: false, owner, error: msg });
          json(res, req, 200, {
            ok: false,
            enabled: false,
            owner,
            skipped: true,
            reason: (result && result.reason) || "buy_error",
            error: msg,
          });
          return;
        }
        writeEnabled(owner, true);
        writeOwnerState(owner, {
          phase: "ok",
          enabled: true,
          error: null,
          signature: result.signature,
          names: result.names,
          amountUsd: result.amountUsd,
        });
        writeStatus({
          phase: "ok",
          enabled: true,
          owner,
          error: null,
          signature: result.signature,
          names: result.names,
          amountUsd: result.amountUsd,
        });
        json(res, req, 200, {
          ok: true,
          enabled: true,
          owner,
          ...result,
        });
        return;
      }
      if (req.method === "POST" && url === "/disable") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const owner = String(body.owner ?? "").trim();
        if (!owner) {
          json(res, req, 400, { ok: false, error: "missing owner pubkey" });
          return;
        }
        persistOwner(owner);
        writeEnabled(owner, false);
        log("disabled keeper for", owner);
        writeOwnerState(owner, { phase: "off", enabled: false });
        writeStatus({ phase: "off", enabled: false, owner });
        json(res, req, 200, { ok: true, enabled: false, owner, skipped: true, reason: "off" });
        return;
      }
      if (req.method === "POST" && url === "/run") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const owner = String(body.owner ?? "").trim();
        if (!owner) {
          json(res, req, 400, { ok: false, error: "missing owner pubkey" });
          return;
        }
        if (!readEnabled(owner)) {
          json(res, req, 200, { ok: true, skipped: true, reason: "off", enabled: false, owner });
          return;
        }
        const result = await withBuyLock(() =>
          runOnce({ force: Boolean(body.force), owner }),
        );
        json(res, req, 200, { ok: true, enabled: true, owner, ...result });
        return;
      }
      if (req.method === "GET" && url === "/prefs") {
        const qOwner = (query.owner || "").trim();
        if (qOwner) {
          let owner;
          try {
            owner = assertOwnerPubkey(qOwner);
          } catch (e) {
            json(res, req, 400, { ok: false, error: e instanceof Error ? e.message : String(e) });
            return;
          }
          json(res, req, 200, { ok: true, owner, prefs: readKeeperRankPrefs(owner) });
          return;
        }
        // Backward-compatible: legacy global prefs or empty defaults
        json(res, req, 200, { ok: true, prefs: readKeeperRankPrefs(null) });
        return;
      }
      if (req.method === "POST" && url === "/prefs") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const owner = String(body.owner ?? "").trim();
        if (!owner) {
          json(res, req, 400, { ok: false, error: "missing owner pubkey" });
          return;
        }
        persistOwner(owner);
        const prefs = writeKeeperRankPrefs(
          owner,
          body.prefs && typeof body.prefs === "object" ? body.prefs : body,
        );
        log("prefs updated", owner, prefs);
        json(res, req, 200, { ok: true, owner, prefs });
        return;
      }
      json(res, req, 404, { ok: false, error: "not found" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log("http error", msg);
      json(res, req, 500, { ok: false, error: msg });
    }
  });
  server.listen(KEEPER_PORT, "127.0.0.1", () => {
    log("keeper http http://127.0.0.1:" + KEEPER_PORT);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.daemon) {
    log("daemon start; tick every", TICK_MS / 60000, "min");
    const spendLimits = loadSpendLimits();
    log("spend limits", spendLimits);
    const seededPrefs = ensurePrefsDefaults();
    log("prefs seed", seededPrefs);
    log("owners", listOwnerPubkeys());
    writeStatus({
      phase: "daemon",
      pid: process.pid,
      daemon: true,
      multiUser: true,
      port: KEEPER_PORT,
      program: programId().toBase58(),
      rpc: /devnet/i.test(rpcUrl()) ? "devnet" : "redacted",
      enabledCount: listEnabledOwners().length,
      spendLimits,
    });
    startKeeperHttp();
    const tick = async (force) => {
      const enabled = listEnabledOwners();
      if (!enabled.length) {
        writeStatus({ phase: "off", enabled: false, enabledCount: 0 });
        return;
      }
      for (const owner of enabled) {
        try {
          await withBuyLock(() => runOnce({ force, owner }));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log("tick error", owner, msg);
          writeOwnerState(owner, { phase: "error", error: msg });
          writeStatus({ phase: "error", error: msg, owner });
        }
      }
    };
    await tick(false);
    setInterval(() => {
      void tick(false);
    }, TICK_MS);
    return;
  }
  const result = await runOnce({
    force: args.force,
    requireEnabled: false,
  });
  if (result?.skipped) {
    process.exitCode = 0;
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  writeStatus({ phase: "error", error: msg });
  process.exit(1);
});
