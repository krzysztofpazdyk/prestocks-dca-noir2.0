/**
 * Shared Solana RPC endpoint resolution for UI and keeper.
 * Prefer NEXT_PUBLIC_RPC_URL, then NEXT_PUBLIC_SOLANA_RPC.
 *
 * Default: public Solana Devnet. Do NOT default to Tatum free gateway —
 * free Tatum rejects getBalance (paid-only), so SOL tiles stay "—".
 */
export const PUBLIC_DEVNET_RPC = "https://api.devnet.solana.com";
export const LOCAL_RPC = "http://127.0.0.1:8899";

/**
 * @param {{ allowLocalFallback?: boolean }} [opts]
 *   allowLocalFallback: when true and NODE_ENV !== production and no env,
 *   use local validator (UI `next dev` only). Keeper should leave this false.
 */
export function resolveSolanaRpcUrl(opts = {}) {
  const fromEnv =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_RPC_URL?.trim() ||
        process.env.NEXT_PUBLIC_SOLANA_RPC?.trim())) ||
    "";
  if (fromEnv) return fromEnv;

  const allowLocal = Boolean(opts.allowLocalFallback);
  if (
    allowLocal &&
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    return LOCAL_RPC;
  }

  return PUBLIC_DEVNET_RPC;
}
