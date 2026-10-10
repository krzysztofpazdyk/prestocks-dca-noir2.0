/**
 * RunRecord × RunPrice slots for History.
 * A missing account stays slots=null (legacy). A zero price or zero units is not a fill.
 */

export type RunFillView = {
  runIndex: string;
  /** null when this run has no RunPrice account (legacy 1:1). */
  slots: Array<{ units: number; price: number } | null> | null;
};

export type FillRun = {
  runIndex: number;
  mints: string[];
};

export type FillDecoded = {
  mints: Array<{ toBase58(): string } | null | undefined>;
  units: Array<bigint | number>;
  pricesE6: Array<bigint | number>;
};

export function fillsFor(
  runs: FillRun[],
  decoded: ReadonlyMap<number, FillDecoded | null>,
): RunFillView[] {
  return runs.map((run) => {
    const dec = decoded.get(run.runIndex) ?? null;
    if (!dec) return { runIndex: String(run.runIndex), slots: null };
    const slots = run.mints.map((mint, i) => {
      const decMint = dec.mints[i]?.toBase58();
      if (decMint !== mint) return null;
      const units = Number(dec.units[i]) / 1e6;
      const price = Number(dec.pricesE6[i]) / 1e6;
      if (!Number.isFinite(units) || !Number.isFinite(price)) return null;
      if (units <= 0 || price <= 0) return null;
      return { units, price };
    });
    return { runIndex: String(run.runIndex), slots };
  });
}
