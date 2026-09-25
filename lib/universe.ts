/** Active PreStocks DCA universe — xAI mint excluded. */

export const XAI_MINT = "PreC1KtJ1sBPPqaeeqL6Qb15GTLCYVvyYEwxhdfTwfx";

export const MINTS: Record<string, string> = {
  Anthropic: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw",
  OpenAI: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
  Anduril: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB",
  Neuralink: "PrekqLJvJ3qVdXmBGDiexvwUTF4rLFDa6HWS4HJbw9S",
  FigureAI: "PreZad18qfPtbxNpMtMuAuX2zVpvkEU8DnJx56faCWd",
  Kalshi: "PreLWGkkeqG1s4HEfFZSy9moCrJ7btsHuUtfcCeoRua",
  Polymarket: "Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP",
  SpaceX: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh",
};

export const SYMBOL_BY_NAME: Record<string, string> = {
  Anthropic: "ANTHROPIC",
  OpenAI: "OPENAI",
  Anduril: "ANDURIL",
  Neuralink: "NEURALINK",
  FigureAI: "FIGUREAI",
  Kalshi: "KALSHI",
  Polymarket: "POLYMARKET",
  SpaceX: "SPACEX",
};

/** Last-known premiums if mark API fails */
export const HARDCODED_PREMIUMS_PCT: Record<string, number> = {
  Anthropic: -1.6,
  OpenAI: 16.1,
  Anduril: -1.9,
  Neuralink: 24.1,
  FigureAI: -2.6,
  Kalshi: -0.3,
  Polymarket: -0.6,
  SpaceX: -21.7,
};

export const HOLDING_COLORS: Record<string, string> = {
  Anthropic: "#14b8a6",
  OpenAI: "#8b5cf6",
  Anduril: "#22d3ee",
  Neuralink: "#a78bfa",
  FigureAI: "#2dd4bf",
  Kalshi: "#67e8f9",
  Polymarket: "#c4b5fd",
  SpaceX: "#5eead4",
};

export type PrestocksProduct = {
  name: string;
  symbol: string;
  mint: string;
  token_price_usd: number | null;
  mark_price_usd: number | null;
  premium_pct: number;
  premium_source: string;
  market_cap_usd?: number | null;
  holders?: number | null;
  volume_cum_usd?: number | null;
  txn_count?: number | null;
  change_30d_pct?: number | null;
  near_ipo: boolean;
  /** True when the underlying company has already IPO'd (from metrics if present). */
  ipo_completed?: boolean;
  /**
   * True when metrics flag an invalid/expired deadline (or past expires_at/expiry/deadline).
   * Live /api/metrics often omits these — filter is a no-op until data exists.
   */
  deadline_invalid?: boolean;
};

export type RankRow = PrestocksProduct & {
  score: number;
  score_raw?: number | null;
  confidence?: number | null;
};

export type RankResult = {
  mode: "hosted_jev" | "byok_ai" | "metrics_fallback";
  sourceLabel: string;
  pipeline: string[];
  top3: RankRow[];
  scores: RankRow[];
  products: PrestocksProduct[];
  choice?: { choice?: string; confidence?: number | null };
  grok?: { skipped: boolean; reason?: string; summary?: string };
  error?: string;
  fetchedAt: string;
};
