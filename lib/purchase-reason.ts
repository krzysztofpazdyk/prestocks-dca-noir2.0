export type PurchaseBlockInput = {
  purchaseDisabled: boolean;
  sigUnresolved: boolean;
  buyInFlight: boolean;
  txPending: boolean;
  statusError: boolean;
  rankFlat: boolean;
  top3Empty: boolean;
  connected: boolean;
  onChainReady: boolean;
  vaultTooLow: boolean;
};

/** Why Manual Buy stays disabled. A missing wallet is not a vault problem. */
export function purchaseDisabledReasonKey(i: PurchaseBlockInput): string | null {
  if (!i.purchaseDisabled) return null;
  if (i.sigUnresolved || i.buyInFlight) return null;
  if (!i.connected) return "msg.connectForPurchase";
  if (i.txPending) return "purchase.disabled.tx";
  if (i.statusError) return "purchase.disabled.rpcError";
  if (i.rankFlat) return "purchase.disabled.flatRanking";
  if (i.top3Empty) return "purchase.disabled.noRecs";
  if (!i.onChainReady) return "purchase.disabled.notReady";
  if (i.vaultTooLow) return "purchase.disabled.vaultLow";
  return "purchase.disabled.generic";
}
