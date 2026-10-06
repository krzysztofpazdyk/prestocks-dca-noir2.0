/** Linked account shape we need. Privy's User type is wider. */
export type PrivyLinkedAccount = {
  type?: string;
  chainType?: string;
  walletClientType?: string;
  connectorType?: string;
};

/**
 * True when this Privy user already has an embedded Solana wallet.
 * External wallets (Phantom, Solflare) do not count.
 */
export function hasSolanaEmbeddedWallet(
  user: { linkedAccounts?: readonly PrivyLinkedAccount[] | null } | null | undefined,
): boolean {
  for (const account of user?.linkedAccounts ?? []) {
    if (account.type !== "wallet" || account.chainType !== "solana") continue;
    const client = account.walletClientType ?? "";
    if (
      client === "privy" ||
      client === "privy-v2" ||
      account.connectorType === "embedded"
    ) {
      return true;
    }
  }
  return false;
}
