"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { useMemo, type ReactNode } from "react";
import { privyAppId, privyDevnetEndpoints } from "@/lib/privy-devnet";

/**
 * Outermost client provider. Phantom and Solflare stay on wallet-adapter
 * inside this tree. With no App ID the children render unchanged.
 */
export function PrivyClientProvider({ children }: { children: ReactNode }) {
  const appId = privyAppId();
  const config = useMemo(() => {
    const { http, ws } = privyDevnetEndpoints();
    return {
      appearance: {
        walletChainType: "solana-only" as const,
      },
      loginMethods: ["email", "google"] as ("email" | "google")[],
      embeddedWallets: {
        solana: {
          createOnLogin: "users-without-wallets" as const,
        },
      },
      solana: {
        rpcs: {
          "solana:devnet": {
            rpc: createSolanaRpc(http),
            rpcSubscriptions: createSolanaRpcSubscriptions(ws),
          },
        },
      },
      // Dashboard has Solana wallet login on. An empty connector list silences
      // Privy's missing-connectors warning without registering Phantom or
      // Solflare again (those stay on wallet-adapter, autoConnect stays false).
      externalWallets: {
        solana: {
          connectors: {
            onMount() {},
            onUnmount() {},
            get: () => [],
          },
        },
      },
    };
  }, []);

  if (!appId) return <>{children}</>;

  return (
    <PrivyProvider appId={appId} config={config}>
      {children}
    </PrivyProvider>
  );
}
