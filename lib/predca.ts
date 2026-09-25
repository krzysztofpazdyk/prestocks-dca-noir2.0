import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import idl from "@/idl/predca.json";
import type { Predca } from "@/types/predca";

export const DEFAULT_PROGRAM_ID =
  "HajLzgcp6fyHVgVLFtwujnU53re47PSMJcQZZes8ZvbU";

export const USDC_DECIMALS = 6;
export const USDC_FACTOR = 1_000_000;

/** Devnet mock USDC mint used by Predca (see .env.production). */
export const MOCK_USDC_MINT =
  "99UbouJx2ZTLThQkqxrQGLZkDAYAn9vv8n6qnQh5f4Sw";

export const PREDCA_ERROR_PL: Record<number, string> = {
  6000: "Brak uprawnień (Unauthorized).",
  6001: "Kwota musi być większa od zera.",
  6002: "Niewystarczające saldo w vault.",
  6003: "Nieprawidłowy budżet tygodniowy (musi być > 0).",
  6004: "RunRecord już istnieje dla tego indeksu.",
  6005: "Mint authority musi być PDA mint_auth programu.",
  6006: "Mint nie zgadza się z kontem w instrukcji.",
  6007: "Duplikaty mintów w top-3.",
};

export function programId(): PublicKey {
  const raw =
    process.env.NEXT_PUBLIC_PREDCA_PROGRAM_ID?.trim() || DEFAULT_PROGRAM_ID;
  return new PublicKey(raw);
}

/** Localnet mock mint — set after creating mint on validator. Empty = not configured. */
export function usdcMintOrNull(): PublicKey | null {
  const raw = process.env.NEXT_PUBLIC_USDC_MINT?.trim();
  if (!raw) return null;
  try {
    return new PublicKey(raw);
  } catch {
    return null;
  }
}

/** Public Solana Devnet RPC (no API key). Helius needs ?api-key= and returns 401 without it. */
export const PUBLIC_DEVNET_RPC = "https://api.devnet.solana.com";
export const HELIUS_DEVNET_RPC = "https://devnet.helius-rpc.com";

/**
 * Resolve RPC endpoint.
 * Prefer NEXT_PUBLIC_RPC_URL; production/Pages never falls back to localnet.
 * Local `next dev` may use 127.0.0.1:8899 when no env is set.
 */
export function rpcUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_SOLANA_RPC?.trim();
  if (fromEnv) return fromEnv;

  // Production / static Pages build: never fall back to localnet.
  // Prefer public api.devnet (Helius without api-key returns 401).
  if (process.env.NODE_ENV === "production") {
    return PUBLIC_DEVNET_RPC;
  }

  // Local `next dev` with no env → localnet OK
  return "http://127.0.0.1:8899";
}

/** Hostname only (for UI strip) — never the full URL with secrets/query. */
export function rpcHost(): string {
  try {
    return new URL(rpcUrl()).hostname;
  } catch {
    return "unknown";
  }
}

export type ClusterLabel = "DEVNET" | "LOCALNET" | "MAINNET" | "CUSTOM";

export function clusterLabel(): ClusterLabel {
  const rpc = rpcUrl().toLowerCase();
  if (rpc.includes("devnet")) return "DEVNET";
  if (rpc.includes("mainnet")) return "MAINNET";
  if (rpc.includes("127.0.0.1:8899") || rpc.includes("localhost:8899")) {
    return "LOCALNET";
  }
  return "CUSTOM";
}

export function clusterShortPl(): string {
  switch (clusterLabel()) {
    case "DEVNET":
      return "Devnet";
    case "LOCALNET":
      return "Localnet";
    case "MAINNET":
      return "Mainnet";
    default:
      return "Custom";
  }
}

function explorerQuery(): string {
  if (rpcUrl().toLowerCase().includes("devnet")) {
    return "?cluster=devnet";
  }
  return "?cluster=custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899";
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}${explorerQuery()}`;
}

export function explorerAddressUrl(address: PublicKey | string): string {
  const value = typeof address === "string" ? address : address.toBase58();
  return `https://explorer.solana.com/address/${value}${explorerQuery()}`;
}

export function userConfigPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user"), owner.toBuffer()],
    programId(),
  );
}

export function vaultPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.toBuffer()],
    programId(),
  );
}

/** Global mint authority PDA for mock PreStock mints. */
export function mintAuthPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint_auth")],
    programId(),
  );
}

export function runRecordPda(
  owner: PublicKey,
  runIndex: number | BN,
): [PublicKey, number] {
  const idx = BN.isBN(runIndex) ? runIndex : new BN(runIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("run"), owner.toBuffer(), idx.toArrayLike(Buffer, "le", 8)],
    programId(),
  );
}

export function getProgram(provider: AnchorProvider): Program<Predca> {
  const idlWithAddress = {
    ...idl,
    address: programId().toBase58(),
  };
  return new Program(idlWithAddress as Predca, provider);
}

export function dollarsToRaw(dollars: number): BN {
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new Error("Nieprawidłowa kwota");
  }
  return new BN(Math.round(dollars * USDC_FACTOR));
}

export function rawToDollars(raw: BN | number | string | bigint): number {
  const n = typeof raw === "object" && raw !== null && "toNumber" in raw
    ? (raw as BN).toNumber()
    : Number(raw);
  return n / USDC_FACTOR;
}

export function formatUsd(amount: number, digits = 2): string {
  return amount.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function ownerUsdcAta(owner: PublicKey, mint: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID);
}

export type UserConfigData = {
  owner: PublicKey;
  weeklyBudgetUsdc: BN;
  excludeFlags: number;
  lastRunTs: BN;
  bump: number;
  vaultBump: number;
};

export type RunRecordData = {
  mints: PublicKey[];
  amounts: BN[];
  signatureHash: number[];
  slot: BN;
  ts: BN;
  runIndex: BN;
  owner: PublicKey;
  bump: number;
};

export async function fetchUserConfig(
  program: Program<Predca>,
  owner: PublicKey,
): Promise<UserConfigData | null> {
  const [pda] = userConfigPda(owner);
  try {
    const acc = await program.account.userConfig.fetch(pda);
    return acc as unknown as UserConfigData;
  } catch {
    return null;
  }
}

export async function fetchVaultBalance(
  connection: Connection,
  owner: PublicKey,
): Promise<number | null> {
  const [vault] = vaultPda(owner);
  try {
    const bal = await connection.getTokenAccountBalance(vault);
    return Number(bal.value.uiAmountString ?? bal.value.uiAmount ?? 0);
  } catch {
    return null;
  }
}

/** Owner ATA balance for the configured mock USDC mint (null if ATA missing). */
export async function fetchOwnerUsdcBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<number | null> {
  const ata = ownerUsdcAta(owner, mint);
  try {
    const bal = await connection.getTokenAccountBalance(ata);
    return Number(bal.value.uiAmountString ?? bal.value.uiAmount ?? 0);
  } catch {
    return null;
  }
}

/**
 * Load RunRecords for owner by scanning PDA indices.
 * UserConfig has last_run_ts (not lastRunIndex in current IDL), so we fetch
 * runRecordPda(owner, i) for i = 0,1,… until the first missing account
 * (contiguous indices from simulate_buy / record_run).
 * Optional maxIndex caps the scan (default 64).
 */
export async function fetchRunRecords(
  program: Program<Predca>,
  owner: PublicKey,
  maxIndex = 64,
): Promise<RunRecordData[]> {
  const out: RunRecordData[] = [];
  for (let i = 0; i <= maxIndex; i++) {
    const [pda] = runRecordPda(owner, i);
    try {
      const acc = await program.account.runRecord.fetch(pda);
      out.push(acc as unknown as RunRecordData);
    } catch {
      break;
    }
  }
  return out;
}

export function shortPk(pk: PublicKey | string, n = 4): string {
  const s = typeof pk === "string" ? pk : pk.toBase58();
  if (s.length <= n * 2 + 1) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export function formatTs(ts: BN | number): string {
  const sec = typeof ts === "object" && ts !== null && "toNumber" in ts
    ? (ts as BN).toNumber()
    : Number(ts);
  if (!sec || sec <= 0) return "—";
  try {
    return new Date(sec * 1000).toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    });
  } catch {
    return String(sec);
  }
}

export function parseAnchorError(err: unknown): string {
  if (err == null) return "Nieznany błąd";
  const e = err as {
    error?: { errorCode?: { number?: number; code?: string }; errorMessage?: string };
    message?: string;
    logs?: string[];
  };

  const code = e.error?.errorCode?.number;
  if (code != null && PREDCA_ERROR_PL[code]) {
    return PREDCA_ERROR_PL[code];
  }
  if (e.error?.errorMessage) {
    const em = e.error.errorMessage;
    const mapped = mapCommonSolanaError(em);
    if (mapped) return mapped;
    return em;
  }

  const logs = Array.isArray(e.logs) ? e.logs.join("\n") : "";
  const msg = `${e.message ?? String(err)}\n${logs}`;

  const mapped = mapCommonSolanaError(msg);
  if (mapped) return mapped;

  const m = msg.match(/Error Code: (\w+)\. Error Number: (\d+)/);
  if (m) {
    const num = Number(m[2]);
    if (PREDCA_ERROR_PL[num]) return PREDCA_ERROR_PL[num];
    return `${m[1]} (${m[2]})`;
  }
  if (/User rejected|rejected the request/i.test(msg)) {
    return "Transakcja odrzucona w portfelu.";
  }
  if (
    /failed to fetch|ECONNREFUSED|429|Network request failed|fetch failed/i.test(
      msg,
    )
  ) {
    const raw = (e.message ?? String(err)).trim().slice(0, 120);
    return (
      `Brak połączenia z RPC (sprawdź NEXT_PUBLIC_RPC_URL / Devnet).` +
      (raw ? ` [${raw}]` : "")
    );
  }
  const trimmed = (e.message ?? String(err)).trim();
  if (trimmed.length > 220) return `${trimmed.slice(0, 220)}…`;
  return trimmed;
}

function mapCommonSolanaError(msg: string): string | null {
  const mintHint = usdcMintOrNull()?.toBase58() ?? MOCK_USDC_MINT;
  if (
    /insufficient funds|insufficient lamports|Error: Insufficient/i.test(msg) ||
    /Transfer: insufficient/i.test(msg)
  ) {
    return (
      `Niewystarczające środki (mock USDC). Potrzebujesz salda mock USDC ` +
      `(mint ${mintHint}) na Devnet w ATA portfela. ` +
      `Utwórz ATA i zrób mint/airdrop testowych tokenów, potem Deposit.`
    );
  }
  if (
    /could not find account|AccountNotFound|Account does not exist|InvalidAccountData|account not found/i.test(
      msg,
    ) ||
    /failed to get account info|AccountOwnedByWrongProgram/i.test(msg)
  ) {
    return (
      `Brak konta tokenowego (ATA) dla mock USDC. ` +
      `Na Devnet potrzebujesz ATA dla mint ${mintHint} ` +
      `(np. spl-token create-account ${mintHint} / mint tokenów do portfela). ` +
      `Jeśli Predca nie jest zainicjalizowane — najpierw Initialize.`
    );
  }
  if (/Simulation failed/i.test(msg) && /custom program error: 0x1\b/i.test(msg)) {
    return (
      `Niewystarczające saldo mock USDC w portfelu (mint ${mintHint}). ` +
      `Doładuj ATA przed Deposit.`
    );
  }
  return null;
}


/** Lamports → SOL. */
export async function fetchSolBalance(
  connection: Connection,
  owner: PublicKey,
): Promise<number | null> {
  try {
    const lamports = await connection.getBalance(owner);
    return lamports / 1_000_000_000;
  } catch {
    return null;
  }
}

export type MockTokenBalance = {
  name: string;
  mint: PublicKey;
  /** Human amount (raw / 1e6). Devnet mock: 1 unit ≈ $1 USD. */
  amount: number;
  raw: bigint;
};

/**
 * Read owner ATAs for all Devnet mock PreStock mints.
 * Missing ATA → skip (treated as zero).
 */
export async function fetchMockTokenBalances(
  connection: Connection,
  owner: PublicKey,
  entries: { name: string; mint: PublicKey }[],
): Promise<MockTokenBalance[]> {
  const out: MockTokenBalance[] = [];
  await Promise.all(
    entries.map(async ({ name, mint }) => {
      const ata = getAssociatedTokenAddressSync(
        mint,
        owner,
        false,
        TOKEN_PROGRAM_ID,
      );
      try {
        const bal = await connection.getTokenAccountBalance(ata);
        const raw = BigInt(bal.value.amount);
        if (raw === BigInt(0)) return;
        const amount = Number(
          bal.value.uiAmountString ?? bal.value.uiAmount ?? Number(raw) / 1e6,
        );
        out.push({ name, mint, amount, raw });
      } catch {
        // ATA missing
      }
    }),
  );
  out.sort((a, b) => b.amount - a.amount);
  return out;
}

/**
 * Ensure owner ATAs exist for the given mints (idempotent create).
 * Returns ATA public keys in the same order.
 */
export async function ensureOwnerAtas(
  connection: Connection,
  owner: PublicKey,
  mints: PublicKey[],
  sendTransaction: (
    tx: Transaction,
    connection: Connection,
  ) => Promise<string>,
): Promise<PublicKey[]> {
  const atas = mints.map((mint) =>
    getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID),
  );
  const tx = new Transaction();
  let need = false;
  for (let i = 0; i < mints.length; i++) {
    const info = await connection.getAccountInfo(atas[i]);
    if (!info) {
      need = true;
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          owner,
          atas[i],
          owner,
          mints[i],
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }
  }
  if (need) {
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.feePayer = owner;
    tx.recentBlockhash = blockhash;
    await sendTransaction(tx, connection);
  }
  return atas;
}

export {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SystemProgram,
  BN,
};

