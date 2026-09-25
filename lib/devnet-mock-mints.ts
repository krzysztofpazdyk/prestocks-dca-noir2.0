/**
 * Devnet mock PreStock mint registry — copied from /workspace/predca/devnet-mock-mints.json.
 * 1 token unit (raw/1e6) ≈ $1 USD for Overview valuation (mock only).
 */
import { PublicKey } from "@solana/web3.js";
import raw from "@/lib/devnet-mock-mints.json";

export type MockMintEntry = {
  name: string;
  mint: string;
  symbol?: string;
  aliases?: string[];
};

export type DevnetMockMints = {
  cluster: string;
  usdc_mint: string;
  mint_authority_pda: string;
  program_id: string;
  decimals: number;
  mints: MockMintEntry[];
};

export const DEVNET_MOCK_MINTS = raw as DevnetMockMints;

export const MOCK_TOKEN_DECIMALS = DEVNET_MOCK_MINTS.decimals ?? 6;
export const MOCK_TOKEN_FACTOR = 10 ** MOCK_TOKEN_DECIMALS;

/** Stable palette for holdings pie (by mint name). */
const HOLDING_COLORS: Record<string, string> = {
  SpaceX: "#5eead4",
  Anthropic: "#14b8a6",
  Anduril: "#22d3ee",
  OpenAI: "#8b5cf6",
  Neuralink: "#a78bfa",
  "Figure AI": "#2dd4bf",
  Kalshi: "#67e8f9",
  Polymarket: "#c4b5fd",
};

const FALLBACK_COLORS = [
  "#14b8a6",
  "#8b5cf6",
  "#22d3ee",
  "#a78bfa",
  "#2dd4bf",
  "#67e8f9",
  "#c4b5fd",
  "#5eead4",
];

export function holdingColor(name: string, index = 0): string {
  return HOLDING_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

const nameToMintMap = new Map<string, PublicKey>();
const mintToNameMap = new Map<string, string>();

function registerName(key: string, pk: PublicKey) {
  nameToMintMap.set(key.toLowerCase(), pk);
  nameToMintMap.set(normKey(key), pk);
}

for (const entry of DEVNET_MOCK_MINTS.mints) {
  try {
    const pk = new PublicKey(entry.mint);
    registerName(entry.name, pk);
    if (entry.symbol) registerName(entry.symbol, pk);
    for (const a of entry.aliases ?? []) registerName(a, pk);
    mintToNameMap.set(pk.toBase58(), entry.name);
  } catch {
    // skip invalid
  }
}

export function mintByName(name: string): PublicKey | null {
  const raw = name.trim().toLowerCase();
  return nameToMintMap.get(raw) ?? nameToMintMap.get(normKey(name)) ?? null;
}

export function nameByMint(mint: PublicKey | string): string | null {
  const key = typeof mint === "string" ? mint : mint.toBase58();
  return mintToNameMap.get(key) ?? null;
}

export function resolveTop3Mints(names: string[]): {
  mints: PublicKey[];
  names: string[];
  missing: string[];
} {
  const mints: PublicKey[] = [];
  const resolved: string[] = [];
  const missing: string[] = [];
  for (const name of names.slice(0, 3)) {
    const mint = mintByName(name);
    if (!mint) {
      missing.push(name);
      continue;
    }
    mints.push(mint);
    resolved.push(nameByMint(mint) ?? name);
  }
  return { mints, names: resolved, missing };
}

export function allMockMints(): { name: string; mint: PublicKey }[] {
  return DEVNET_MOCK_MINTS.mints.map((m) => ({
    name: m.name,
    mint: new PublicKey(m.mint),
  }));
}
