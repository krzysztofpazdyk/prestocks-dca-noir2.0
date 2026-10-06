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
