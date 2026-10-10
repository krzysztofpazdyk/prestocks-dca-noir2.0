/**
 * A refresh may write only for the wallet epoch and pubkey it started with.
 * Switch or disconnect makes this false, so a late Devnet read cannot land
 * on the next wallet or clear that wallet's loading flag.
 */
export function refreshWriteStillCurrent(
  epochAtStart: number,
  ownerAtStart: string | null,
  epochNow: number,
  ownerNow: string | null,
): boolean {
  return epochAtStart === epochNow && ownerAtStart === ownerNow;
}

/**
 * Jupiter prices for one refresh. The returned promise stays pending while
 * `load` does, so the caller must not await it. A quote is applied only while
 * `still` is true. Rejection is swallowed; `setLoading(false)` runs only for
 * the same wallet epoch.
 */
export function loadJupPricesInBackground<T>(
  load: () => Promise<T>,
  still: () => boolean,
  apply: (value: T) => void,
  setLoading: (loading: boolean) => void,
): Promise<void> {
  return (async () => {
    setLoading(true);
    try {
      const value = await load();
      if (!still()) return;
      apply(value);
    } catch {
      /* a price failure must not surface on the RPC path */
    } finally {
      if (still()) setLoading(false);
    }
  })();
}
