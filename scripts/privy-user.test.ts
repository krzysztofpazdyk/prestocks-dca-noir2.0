import assert from "node:assert/strict";
import test from "node:test";
import { hasSolanaEmbeddedWallet } from "../lib/privy-user";

test("new email user has no embedded Solana wallet", () => {
  assert.equal(
    hasSolanaEmbeddedWallet({
      linkedAccounts: [{ type: "email" }],
    }),
    false,
  );
});

test("privy solana wallet counts", () => {
  assert.equal(
    hasSolanaEmbeddedWallet({
      linkedAccounts: [
        { type: "email" },
        {
          type: "wallet",
          chainType: "solana",
          walletClientType: "privy",
          connectorType: "embedded",
        },
      ],
    }),
    true,
  );
});

test("phantom linked on the same user does not count as embedded", () => {
  assert.equal(
    hasSolanaEmbeddedWallet({
      linkedAccounts: [
        {
          type: "wallet",
          chainType: "solana",
          walletClientType: "phantom",
          connectorType: "injected",
        },
      ],
    }),
    false,
  );
});
