/** Solana chain id Privy embedded wallet UIs must use. This app is Devnet-only. */
export const PRIVY_SOLANA_CHAIN = "solana:devnet" as const;

const PUBLIC_DEVNET_HTTP = "https://api.devnet.solana.com";
const PUBLIC_DEVNET_WS = "wss://api.devnet.solana.com";

/** Public App ID. Empty until set. Never an App Secret. */
export function privyAppId(): string {
  return (process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "").trim();
}

/**
 * HTTPS RPC for Privy embedded-wallet UIs.
 * Uses NEXT_PUBLIC_RPC_URL when it is https, otherwise public Devnet.
 * Never falls back to mainnet.
 */
export function privyDevnetEndpoints(): { http: string; ws: string } {
  const fromEnv = (
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    ""
  ).trim();
  if (fromEnv.startsWith("https://")) {
    return { http: fromEnv, ws: fromEnv.replace(/^https:/, "wss:") };
  }
  return { http: PUBLIC_DEVNET_HTTP, ws: PUBLIC_DEVNET_WS };
}
