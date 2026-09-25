import {
  HOLDINGS,
  LAST_PURCHASE,
  MOCK_BALANCES,
  MOCK_VAULT_USDC,
  type Holding,
  type Purchase,
} from "@/lib/mock-data";

export type PortfolioBalances = {
  sol: number;
  usdc: number;
  portfolioUsd: number;
};

export type PortfolioState = {
  balances: PortfolioBalances;
  vaultUsdc: number;
  holdings: Holding[];
  lastPurchase: Purchase;
};

export const PORTFOLIO_STORAGE_KEY = "predca_mock_portfolio_v1";

const NEW_HOLDING_COLORS = ["#14b8a6", "#8b5cf6", "#22d3ee"] as const;

function deepCopyDefaults(): PortfolioState {
  return {
    balances: { ...MOCK_BALANCES },
    vaultUsdc: MOCK_VAULT_USDC,
    holdings: HOLDINGS.map((h) => ({ ...h })),
    lastPurchase: {
      ...LAST_PURCHASE,
      tokens: [...LAST_PURCHASE.tokens],
    },
  };
}

function todayIsoWarsaw(): string {
  try {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Europe/Warsaw",
    });
  } catch {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
}

/** Round holdings to 1 decimal % summing to 100; remainder on largest. */
function normalizeHoldingsToPercents(holdings: Holding[]): Holding[] {
  if (holdings.length === 0) return holdings;

  const total = holdings.reduce((s, h) => s + h.value, 0);
  if (total <= 0) {
    const equal = Math.round((100 / holdings.length) * 10) / 10;
    const out = holdings.map((h) => ({ ...h, value: equal }));
    const sum = out.reduce((s, h) => s + h.value, 0);
    const rem = Math.round((100 - sum) * 10) / 10;
    if (rem !== 0) {
      let maxIdx = 0;
      for (let i = 1; i < out.length; i++) {
        if (out[i].value > out[maxIdx].value) maxIdx = i;
      }
      out[maxIdx] = {
        ...out[maxIdx],
        value: Math.round((out[maxIdx].value + rem) * 10) / 10,
      };
    }
    return out;
  }

  const out = holdings.map((h) => ({
    ...h,
    value: Math.round((h.value / total) * 1000) / 10,
  }));

  const sum = out.reduce((s, h) => s + h.value, 0);
  const rem = Math.round((100 - sum) * 10) / 10;
  if (rem !== 0) {
    let maxIdx = 0;
    for (let i = 1; i < out.length; i++) {
      if (out[i].value > out[maxIdx].value) maxIdx = i;
    }
    out[maxIdx] = {
      ...out[maxIdx],
      value: Math.round((out[maxIdx].value + rem) * 10) / 10,
    };
  }
  return out;
}

export function loadPortfolioState(): PortfolioState {
  if (typeof window === "undefined") {
    return deepCopyDefaults();
  }
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return deepCopyDefaults();
    const parsed = JSON.parse(raw) as Partial<PortfolioState>;
    if (
      !parsed?.balances ||
      typeof parsed.balances.sol !== "number" ||
      typeof parsed.balances.usdc !== "number" ||
      typeof parsed.balances.portfolioUsd !== "number" ||
      !Array.isArray(parsed.holdings) ||
      !parsed.lastPurchase
    ) {
      return deepCopyDefaults();
    }
    return {
      balances: {
        sol: parsed.balances.sol,
        usdc: parsed.balances.usdc,
        portfolioUsd: parsed.balances.portfolioUsd,
      },
      // Migrate portfolios saved before the mock vault was introduced.
      vaultUsdc:
        typeof parsed.vaultUsdc === "number" && Number.isFinite(parsed.vaultUsdc)
          ? Math.max(0, parsed.vaultUsdc)
          : MOCK_VAULT_USDC,
      holdings: parsed.holdings.map((h) => ({
        name: String(h.name),
        value: Number(h.value) || 0,
        color: String(h.color || "#14b8a6"),
      })),
      lastPurchase: {
        date: String(parsed.lastPurchase.date),
        amountUsd: Number(parsed.lastPurchase.amountUsd) || 0,
        tokens: Array.isArray(parsed.lastPurchase.tokens)
          ? parsed.lastPurchase.tokens.map(String)
          : [],
        perTokenUsd: Number(parsed.lastPurchase.perTokenUsd) || 0,
        signature: String(parsed.lastPurchase.signature || ""),
      },
    };
  } catch {
    return deepCopyDefaults();
  }
}

export function savePortfolioState(state: PortfolioState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function applyPurchase(
  state: PortfolioState,
  opts: { amountUsd: number; tokens: string[]; scores?: number[] },
): PortfolioState {
  const amountUsd = Math.max(0, Number(opts.amountUsd) || 0);
  const vaultUsdc = Number(state.vaultUsdc);
  if (!Number.isFinite(vaultUsdc) || vaultUsdc < amountUsd) {
    throw new Error(
      `Za mało USDC w vault: ${Number.isFinite(vaultUsdc) ? vaultUsdc.toFixed(2) : "0.00"} < ${amountUsd.toFixed(2)}.`,
    );
  }
  const tokens = opts.tokens.slice(0, 3);
  const perTokenUsd = tokens.length > 0 ? amountUsd / tokens.length : 0;

  const balances: PortfolioBalances = {
    sol: state.balances.sol,
    // Purchases are funded by the Predca vault; wallet USDC is untouched.
    usdc: state.balances.usdc,
    portfolioUsd: state.balances.portfolioUsd + amountUsd,
  };

  const lastPurchase: Purchase = {
    date: todayIsoWarsaw(),
    amountUsd,
    tokens: [...tokens],
    perTokenUsd,
    signature: `mock-buy-${Date.now()}`,
  };

  // Work in weight-space: current % values are relative points; add spend.
  const holdings: Holding[] = state.holdings.map((h) => ({ ...h }));
  let colorIdx = holdings.length;

  for (const name of tokens) {
    const existing = holdings.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      existing.value = existing.value + perTokenUsd;
    } else {
      holdings.push({
        name,
        value: perTokenUsd,
        color: NEW_HOLDING_COLORS[colorIdx % NEW_HOLDING_COLORS.length],
      });
      colorIdx += 1;
    }
  }

  return {
    balances,
    vaultUsdc: vaultUsdc - amountUsd,
    holdings: normalizeHoldingsToPercents(holdings),
    lastPurchase,
  };
}
