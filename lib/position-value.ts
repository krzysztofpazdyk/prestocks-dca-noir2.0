/**
 * Portfolio marks for Devnet mock balances.
 * Legacy buys minted 1 token per 1 USDC — those units stay at cost.
 * v2 lots (RunPrice) are marked at the Jupiter UI price when we have one.
 */

import { nameByMint } from "@/lib/devnet-mock-mints";
import {
  canonicalName,
  quoteByName,
  type JupPrices,
  type JupQuote,
} from "@/lib/jup-prices";

export type RunLot = {
  name: string;
  devnetMint: string;
  runIndex: number;
  ts: number;
  /** USDC spent on this leg (RunRecord.amounts[i] / 1e6). */
  usdcCost: number;
  /** RunPrice.units[i] / 1e6. null = legacy 1:1 mint. */
  units: number | null;
  /** RunPrice.prices_e6[i] / 1e6. null = legacy. */
  buyPrice: number | null;
};

export type RunLotSource = {
  runIndex: number;
  ts: number;
  mints: string[];
  amountsUsd: number[];
};

export type DecodedLots = {
  mints: { toBase58(): string }[];
  units: Array<bigint | number>;
  pricesE6: Array<bigint | number>;
};

export type TokenAmount = { name: string; amount: number };

export type PositionRow = {
  name: string;
  units: number;
  /** Cost basis of the tokens still in the balance (after mismatch scaling). */
  costUsd: number;
  pricedUnits: number;
  legacyCostUsd: number;
  priceNow: number | null;
  valueUsd: number;
  pnlUsd: number | null;
  pnlPct: number | null;
  avgBuyPrice: number | null;
  basis: "market" | "cost" | "mixed";
  stale: boolean;
  mismatch: boolean;
};

const DUST = 0.000001;

function relDiff(a: number, b: number): boolean {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) > DUST * scale;
}

function num(v: bigint | number): number {
  const n = typeof v === "bigint" ? Number(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** RunRecord legs + optional RunPrice. No decoded account → legacy (units null). */
export function runLots(
  runs: RunLotSource[],
  decoded: ReadonlyMap<number, DecodedLots | null>,
): RunLot[] {
  const lots: RunLot[] = [];
  for (const run of runs) {
    const dec = decoded.get(run.runIndex) ?? null;
    const n = Math.max(run.mints.length, run.amountsUsd.length);
    for (let i = 0; i < n; i++) {
      const devnetMint = run.mints[i] ?? "";
      if (!devnetMint) continue;
      const name = nameByMint(devnetMint) ?? devnetMint;
      const usdcCost = Number(run.amountsUsd[i] ?? 0);
      let units: number | null = null;
      let buyPrice: number | null = null;
      const decMint = dec?.mints[i]?.toBase58();
      if (dec && decMint === devnetMint) {
        const rawUnits = num(dec.units[i] ?? 0);
        const rawPx = num(dec.pricesE6[i] ?? 0);
        if (Number.isFinite(rawUnits) && rawUnits >= 0) units = rawUnits / 1e6;
        if (Number.isFinite(rawPx) && rawPx > 0) buyPrice = rawPx / 1e6;
        if (units == null) buyPrice = null;
      }
      lots.push({
        name,
        devnetMint,
        runIndex: run.runIndex,
        ts: run.ts,
        usdcCost: Number.isFinite(usdcCost) ? usdcCost : 0,
        units,
        buyPrice,
      });
    }
  }
  return lots;
}

function listed(names: string[], name: string): boolean {
  const want = canonicalName(name);
  return names.some((n) => canonicalName(n) === want);
}

/**
 * One row per token balance > 0.
 * Legacy units are $1 of cost each. A smaller balance scales v2 units and
 * legacy cost together (and the v2 USDC cost, so avg buy stays put).
 * A larger balance is extra legacy at $1.
 */
export function buildPositions(
  lots: RunLot[],
  balances: TokenAmount[],
  prices: JupPrices,
): PositionRow[] {
  const lotsByName = new Map<string, RunLot[]>();
  for (const lot of lots) {
    const key = canonicalName(lot.name);
    const list = lotsByName.get(key) ?? [];
    list.push(lot);
    lotsByName.set(key, list);
  }

  const rows: PositionRow[] = [];
  const seen = new Set<string>();
  for (const bal of balances) {
    if (!Number.isFinite(bal.amount) || bal.amount <= 0) continue;
    const key = canonicalName(bal.name);
    if (seen.has(key)) continue;
    seen.add(key);
    const group = lotsByName.get(key) ?? [];
    let pricedUnits = 0;
    let v2Cost = 0;
    let legacyCost = 0;
    for (const lot of group) {
      if (lot.units != null) {
        pricedUnits += lot.units;
        v2Cost += lot.usdcCost;
      } else {
        legacyCost += lot.usdcCost;
      }
    }

    const balance = bal.amount;
    const expected = pricedUnits + legacyCost;
    let mismatch = false;
    if (relDiff(balance, expected)) {
      mismatch = true;
      if (balance < expected) {
        const scale = expected > 0 ? balance / expected : 0;
        pricedUnits *= scale;
        v2Cost *= scale;
        legacyCost *= scale;
      } else {
        legacyCost += balance - expected;
      }
    }

    const quote: JupQuote | undefined = quoteByName(prices.quotes, bal.name);
    const priceNow = quote?.usdPrice ?? null;
    const v2Active = pricedUnits > DUST;
    const legacyActive = legacyCost > DUST;
    const stale =
      prices.source === "cache" ||
      listed(prices.suspect, bal.name) ||
      listed(prices.carried ?? [], bal.name);

    let valueUsd: number;
    let pnlUsd: number | null;
    let pnlPct: number | null;
    let basis: PositionRow["basis"];
    if (v2Active && priceNow != null) {
      const market = pricedUnits * priceNow;
      valueUsd = market + legacyCost;
      pnlUsd = market - v2Cost;
      pnlPct = v2Cost > DUST ? (pnlUsd / v2Cost) * 100 : null;
      basis = legacyActive ? "mixed" : "market";
    } else {
      valueUsd = v2Cost + legacyCost;
      pnlUsd = null;
      pnlPct = null;
      basis = "cost";
    }

    rows.push({
      name: bal.name,
      units: balance,
      costUsd: v2Cost + legacyCost,
      pricedUnits,
      legacyCostUsd: legacyCost,
      priceNow,
      valueUsd,
      pnlUsd,
      pnlPct,
      avgBuyPrice: v2Active ? v2Cost / pricedUnits : null,
      basis,
      stale,
      mismatch,
    });
  }

  rows.sort((a, b) => b.valueUsd - a.valueUsd || a.name.localeCompare(b.name));
  return rows;
}

export type PnlSummary = {
  /** Sum of row PnL. Null when no row has a market PnL — never a fake 0. */
  pnlUsd: number | null;
  /** pnlUsd / v2 cost of those rows, in percent. */
  pnlPct: number | null;
  /** v2 cost (costUsd − legacyCostUsd) of rows that have a PnL. */
  pricedCostUsd: number;
  /** Legacy cost of every row. Stays out of the PnL. */
  legacyCostUsd: number;
  hasLegacy: boolean;
  hasPriced: boolean;
};

/** Portfolio PnL from rows `buildPositions` already produced. Does not revalue. */
export function pnlSummary(rows: PositionRow[]): PnlSummary {
  let pnlUsd = 0;
  let pricedCostUsd = 0;
  let legacyCostUsd = 0;
  let hasPriced = false;
  for (const row of rows) {
    if (Number.isFinite(row.legacyCostUsd)) legacyCostUsd += row.legacyCostUsd;
    if (row.pnlUsd == null || !Number.isFinite(row.pnlUsd)) continue;
    hasPriced = true;
    pnlUsd += row.pnlUsd;
    const v2Cost = row.costUsd - row.legacyCostUsd;
    if (Number.isFinite(v2Cost)) pricedCostUsd += v2Cost;
  }
  return {
    pnlUsd: hasPriced ? pnlUsd : null,
    pnlPct: hasPriced && pricedCostUsd > DUST ? (pnlUsd / pricedCostUsd) * 100 : null,
    pricedCostUsd: hasPriced ? pricedCostUsd : 0,
    legacyCostUsd,
    hasLegacy: legacyCostUsd > DUST,
    hasPriced,
  };
}

export type RunPnlLeg = {
  name: string;
  valueUsd: number;
  pnlUsd: number;
  pnlPct: number | null;
};

export type RunPnlResult = {
  legs: Array<RunPnlLeg | null>;
  totalPnlUsd: number | null;
  totalPnlPct: number | null;
};

/**
 * PnL of one run against current Jupiter prices.
 * `slots === null` means no RunPrice account — the run stays unlabeled.
 * A leg with no current price is null and is left out of the total.
 */
export function runPnl(
  slots: Array<{ units: number; price: number } | null> | null,
  usdcEach: number[],
  quotes: Record<string, JupQuote>,
  names: string[],
): RunPnlResult | null {
  if (slots == null) return null;
  const n = Math.max(slots.length, usdcEach.length, names.length);
  const legs: Array<RunPnlLeg | null> = [];
  let totalPnl = 0;
  let totalCost = 0;
  let any = false;
  for (let i = 0; i < n; i++) {
    const slot = slots[i] ?? null;
    const name = names[i] ?? "";
    const usdc = usdcEach[i];
    const px = name ? quoteByName(quotes, name)?.usdPrice ?? null : null;
    if (!slot || px == null || !Number.isFinite(usdc)) {
      legs.push(null);
      continue;
    }
    const valueUsd = slot.units * px;
    const pnlUsd = valueUsd - usdc;
    legs.push({
      name,
      valueUsd,
      pnlUsd,
      pnlPct: usdc > DUST ? (pnlUsd / usdc) * 100 : null,
    });
    totalPnl += pnlUsd;
    totalCost += usdc;
    any = true;
  }
  return {
    legs,
    totalPnlUsd: any ? totalPnl : null,
    totalPnlPct: any && totalCost > DUST ? (totalPnl / totalCost) * 100 : null,
  };
}

export function portfolioValue(vaultUsdc: number, rows: PositionRow[]): number {
  const vault = Number.isFinite(vaultUsdc) ? vaultUsdc : 0;
  return rows.reduce((sum, row) => sum + (Number.isFinite(row.valueUsd) ? row.valueUsd : 0), vault);
}

/** Pie weights from USD value. Same remainder fix as the old unit weights. */
export function valueWeights(
  rows: Pick<PositionRow, "name" | "valueUsd">[],
): { name: string; value: number }[] {
  const nonzero = rows.filter((r) => r.valueUsd > 0);
  const total = nonzero.reduce((s, r) => s + r.valueUsd, 0);
  if (total <= 0) return [];
  const out = nonzero.map((r) => ({
    name: r.name,
    value: Math.round((r.valueUsd / total) * 1000) / 10,
  }));
  const sum = out.reduce((s, h) => s + h.value, 0);
  const rem = Math.round((100 - sum) * 10) / 10;
  if (rem !== 0 && out.length > 0) {
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
