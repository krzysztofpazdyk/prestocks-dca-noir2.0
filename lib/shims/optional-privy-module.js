/** Optional Privy imports this Solana app does not use.
 * Webpack still resolves dynamic import() at build time.
 * Farcaster mini-app registration is inside try/catch.
 * Stripe fiat onramp is not a login or buy path. */
module.exports = {};
