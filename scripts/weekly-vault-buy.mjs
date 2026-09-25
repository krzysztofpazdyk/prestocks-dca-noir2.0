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
 *      KEEPER_TOKEN / NEXT_PUBLIC_KEEPER_TOKEN (optional; required for POST if set)
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
    writeFileSync(
      STATUS_PATH,
      JSON.stringify(
        {
          ...prev,
          ...partial,
          enabled: readEnabled(),
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
const OWNER_PATH = join(homedir(), ".config", "predca", "owner.txt");
const ENABLED_PATH = join(homedir(), ".config", "predca", "enabled");
const PREFS_PATH = join(homedir(), ".config", "predca", "prefs.json");
const LOCK_PATH = join(homedir(), ".config", "predca", "buy.lock");
const KEEPER_PORT = Number(process.env.KEEPER_PORT || 8791);
const LOCK_STALE_MS = 5 * 60 * 1000;
const TOKEN_PATH = join(homedir(), ".config", "predca", "http_token");

function expectedKeeperToken() {
  return (
    process.env.KEEPER_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_KEEPER_TOKEN?.trim() ||
    (existsSync(TOKEN_PATH) ? readFileSync(TOKEN_PATH, "utf8").trim() : "")
  );
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
    "Access-Control-Allow-Headers": "Content-Type, X-Keeper-Token",
    Vary: "Origin",
  };
}

/** Mutating routes: require token when one is configured. */
function authorizeMutating(req) {
  const expected = expectedKeeperToken();
  if (!expected) return true;
  const got = String(req.headers["x-keeper-token"] || "").trim();
  return got === expected;
}

function readEnabled() {
  try {
    if (!existsSync(ENABLED_PATH)) return false;
    return readFileSync(ENABLED_PATH, "utf8").trim() === "true";
  } catch {
    return false;
  }
}

function writeEnabled(value) {
  mkdirSync(dirname(ENABLED_PATH), { recursive: true });
  writeFileSync(ENABLED_PATH, value ? "true\n" : "false\n");
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
  mkdirSync(dirname(OWNER_PATH), { recursive: true });
  writeFileSync(OWNER_PATH, pk.trim() + "\n", { mode: 0o600 });
}

function loadOwnerPubkey() {
  const raw = (process.env.PREDCA_OWNER || "").trim();
  if (raw) return new PublicKey(raw);
  if (existsSync(OWNER_PATH)) {
    const fromFile = readFileSync(OWNER_PATH, "utf8").trim();
    if (fromFile) return new PublicKey(fromFile);
  }
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


/** Rank prefs for keeper /rank body. localStorage is unavailable here. */
function readKeeperRankPrefs() {
  const envFlag = (name, fallback) => {
    const v = (process.env[name] || "").trim().toLowerCase();
    if (!v) return fallback;
    return ["1", "true", "yes", "on"].includes(v);
  };
  let filePrefs = {};
  try {
    if (existsSync(PREFS_PATH)) {
      filePrefs = JSON.parse(readFileSync(PREFS_PATH, "utf8")) || {};
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

/** Atomic write of ~/.config/predca/prefs.json (UI → keeper sync). */
function writeKeeperRankPrefs(raw) {
  const normalized = normalizeKeeperPrefs(raw);
  mkdirSync(dirname(PREFS_PATH), { recursive: true });
  const tmp = PREFS_PATH + ".tmp." + process.pid;
  writeFileSync(tmp, JSON.stringify(normalized, null, 2) + "\n", { mode: 0o600 });
  renameSync(tmp, PREFS_PATH);
  return normalized;
}

/** If prefs.json missing at daemon start, seed defaults matching rank-prefs / Settings. */
function ensurePrefsDefaults() {
  if (existsSync(PREFS_PATH)) return readKeeperRankPrefs();
  return writeKeeperRankPrefs({
    exclusions: ["xAI"],
    deadlines_unimportant: false,
    premiums_matter: false,
    premiums_especially_near_ipo: false,
    buy_despite_ipo: false,
  });
}

async function rankTop3() {
  const base = (process.env.NEXT_PUBLIC_DCA_API_URL || "").replace(/\/$/, "");
  if (base) {
    try {
      const r = await fetchJson(
        `${base}/rank`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(readKeeperRankPrefs()),
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

  const prefs = readKeeperRankPrefs();
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
  if (opts.requireEnabled !== false && !readEnabled()) {
    writeStatus({ phase: "off", enabled: false });
    return { ok: true, skipped: true, reason: "off", enabled: false };
  }
  const keeper = loadKeeper();
  const owner = loadOwnerPubkey();
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
    owner: owner.toBase58(),
    rpc: rpcUrl(),
    phase: "checking",
  });
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
    writeStatus({ phase: "not_due", lastRunTs: lastTs, nextAt });
    return { skipped: true, reason: "not_due", nextAt };
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
  if (!Number.isFinite(vaultUi) || vaultUi < totalDebit) {
    const msg = `Za mało USDC w vault: ${vaultUi.toFixed(2)} < ${totalDebit.toFixed(2)}.`;
    writeStatus({ phase: "vault_low", error: msg, vaultUsdc: vaultUi, need: totalDebit });
    throw new Error(msg);
  }

  const ranked = await rankTop3();
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

  const runIndex = await nextRunIndex(program, owner, pid);
  await ensureAtas(connection, owner, mints, keeper);

  writeStatus({
    phase: "buying",
    names,
    runIndex,
    vaultUsdc: vaultUi,
    budgetUsd,
  });

  const sig = await program.methods
    .executeBuy(new BN(runIndex), mints, Array.from({ length: 32 }, () => 0))
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
  return { skipped: false, signature: sig, names, amountUsd: totalDebit, runIndex };
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

function startKeeperHttp() {
  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders(req));
      res.end();
      return;
    }
    const url = req.url?.split("?")[0] ?? "/";
    try {
      if (req.method === "GET" && url === "/health") {
        json(res, req, 200, {
          ok: true,
          pid: process.pid,
          enabled: readEnabled(),
          daemon: true,
          port: KEEPER_PORT,
          program: programId().toBase58(),
        });
        return;
      }
      if (req.method === "GET" && url === "/status") {
        let extra = {};
        try {
          if (existsSync(STATUS_PATH)) {
            extra = JSON.parse(readFileSync(STATUS_PATH, "utf8"));
          }
        } catch {
          extra = {};
        }
        let prefs = {};
        try {
          prefs = readKeeperRankPrefs();
        } catch {
          prefs = {};
        }
        json(res, req, 200, {
          ok: true,
          ...extra,
          enabled: readEnabled(),
          daemon: true,
          port: KEEPER_PORT,
          program: programId().toBase58(),
          rpc: rpcUrl(),
          prefs,
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
          writeKeeperRankPrefs(prefsRaw);
          log("synced prefs on enable", readKeeperRankPrefs());
        }
        writeEnabled(true);
        log("enabled keeper for", owner, "force", body.force !== false);
        const result = await withBuyLock(() =>
          runOnce({
            force: body.force !== false,
            requireEnabled: false,
          }),
        );
        json(res, req, 200, { ok: !result.error, enabled: true, ...result });
        return;
      }
      if (req.method === "POST" && url === "/disable") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        writeEnabled(false);
        log("disabled keeper");
        writeStatus({ phase: "off", enabled: false });
        json(res, req, 200, { ok: true, enabled: false, skipped: true, reason: "off" });
        return;
      }
      if (req.method === "POST" && url === "/run") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        if (!readEnabled()) {
          json(res, req, 200, { ok: true, skipped: true, reason: "off", enabled: false });
          return;
        }
        const body = await readJsonBody(req);
        const result = await withBuyLock(() =>
          runOnce({ force: Boolean(body.force) }),
        );
        json(res, req, 200, { ok: true, enabled: true, ...result });
        return;
      }
      if (req.method === "GET" && url === "/prefs") {
        json(res, req, 200, { ok: true, prefs: readKeeperRankPrefs() });
        return;
      }
      if (req.method === "POST" && url === "/prefs") {
        if (!authorizeMutating(req)) {
          json(res, req, 401, { ok: false, error: "unauthorized" });
          return;
        }
        const body = await readJsonBody(req);
        const prefs = writeKeeperRankPrefs(body.prefs && typeof body.prefs === "object" ? body.prefs : body);
        log("prefs updated", prefs);
        json(res, req, 200, { ok: true, prefs });
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
    const seededPrefs = ensurePrefsDefaults();
    log("prefs", seededPrefs);
    writeStatus({
      phase: "daemon",
      pid: process.pid,
      daemon: true,
      port: KEEPER_PORT,
      program: programId().toBase58(),
      rpc: rpcUrl(),
      prefs: seededPrefs,
    });
    startKeeperHttp();
    const tick = async (force) => {
      if (!readEnabled()) {
        writeStatus({ phase: "off", enabled: false });
        return;
      }
      try {
        await withBuyLock(() => runOnce({ force }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("tick error", msg);
        writeStatus({ phase: "error", error: msg });
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
