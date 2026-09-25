import { explorerTxUrl } from "@/lib/predca";

export type Holding = {
  name: string;
  value: number;
  color: string;
};

export type JevRank = {
  name: string;
  score: number;
};

export type Purchase = {
  date: string;
  amountUsd: number;
  tokens: string[];
  perTokenUsd: number;
  signature: string;
};

export type HistoryRun = {
  id: string;
  date: string;
  budgetUsd: number;
  picks: { name: string; score: number; spentUsd: number }[];
  signature: string;
};

/** Holdings pie — xAI excluded from allocation display */
export const HOLDINGS: Holding[] = [
  { name: "Anthropic", value: 18, color: "#14b8a6" },
  { name: "OpenAI", value: 16, color: "#8b5cf6" },
  { name: "Anduril", value: 14, color: "#22d3ee" },
  { name: "Neuralink", value: 12, color: "#a78bfa" },
  { name: "Figure AI", value: 11, color: "#2dd4bf" },
  { name: "Kalshi", value: 10, color: "#67e8f9" },
  { name: "Polymarket", value: 10, color: "#c4b5fd" },
  { name: "SpaceX", value: 9, color: "#5eead4" },
];

export const MOCK_BALANCES = {
  sol: 2.45,
  usdc: 1250.0,
  portfolioUsd: 4820.0,
};

/** Mock Predca vault balance; purchases are funded from this, not wallet USDC. */
export const MOCK_VAULT_USDC = 500.0;

export const TOP3_JEV: JevRank[] = [
  { name: "Anthropic", score: 92.4 },
  { name: "Anduril", score: 88.1 },
  { name: "Figure AI", score: 85.7 },
];

export const LAST_PURCHASE: Purchase = {
  date: "2026-09-12",
  amountUsd: 150,
  tokens: ["Anthropic", "Anduril", "Figure AI"],
  perTokenUsd: 50,
  signature: "5KxMockSignaturePreStocksDcaWeeklyRunExample111111111",
};

export const HISTORY_RUNS: HistoryRun[] = [
  {
    id: "run-2026-09-12",
    date: "2026-09-12",
    budgetUsd: 150,
    picks: [
      { name: "Anthropic", score: 92.4, spentUsd: 50 },
      { name: "Anduril", score: 88.1, spentUsd: 50 },
      { name: "Figure AI", score: 85.7, spentUsd: 50 },
    ],
    signature: "5KxMockSignaturePreStocksDcaWeeklyRunExample111111111",
  },
  {
    id: "run-2026-09-05",
    date: "2026-09-05",
    budgetUsd: 150,
    picks: [
      { name: "OpenAI", score: 90.2, spentUsd: 50 },
      { name: "SpaceX", score: 87.0, spentUsd: 50 },
      { name: "Neuralink", score: 84.5, spentUsd: 50 },
    ],
    signature: "4JyMockSignaturePreStocksDcaWeeklyRunExample222222222",
  },
  {
    id: "run-2026-08-29",
    date: "2026-08-29",
    budgetUsd: 150,
    picks: [
      { name: "Anthropic", score: 91.0, spentUsd: 50 },
      { name: "Kalshi", score: 86.3, spentUsd: 50 },
      { name: "Polymarket", score: 83.8, spentUsd: 50 },
    ],
    signature: "3HzMockSignaturePreStocksDcaWeeklyRunExample333333333",
  },
  {
    id: "run-2026-08-22",
    date: "2026-08-22",
    budgetUsd: 120,
    picks: [
      { name: "Anduril", score: 89.5, spentUsd: 40 },
      { name: "Figure AI", score: 86.1, spentUsd: 40 },
      { name: "OpenAI", score: 82.9, spentUsd: 40 },
    ],
    signature: "2GwMockSignaturePreStocksDcaWeeklyRunExample444444444",
  },
];

export const DEFAULT_SETTINGS = {
  weeklyAmountUsd: 1,
  exclusions: ["xAI"],
  deadlineInvalid: false,
  ipoPremiumMatters: false,
  buyDespiteIpo: false,
  /** Opt-in: enabling starts the weekly vault-buy cycle (first buy immediately). */
  autoWeeklyBuy: false,
};

export function solscanTxUrl(signature: string): string {
  return explorerTxUrl(signature);
}
