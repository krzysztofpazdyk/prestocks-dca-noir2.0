"use client";

import { useMemo, type ReactNode } from "react";
import type { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { rpcUrl } from "@/lib/predca";
import { PredcaProvider } from "@/lib/hooks/usePredca";
import { PrivyEmbeddedWalletAdapter } from "@/lib/privy-embedded-adapter";
import { privyAppId } from "@/lib/privy-devnet";
import { PrivyWalletBridge } from "@/components/PrivyWalletBridge";

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => rpcUrl(), []);
  const privyOn = privyAppId().length > 0;
  const wallets = useMemo(() => {
    const list: Adapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    // Shown only until Wallet Standard registers the same name "Privy".
    if (privyOn) list.push(new PrivyEmbeddedWalletAdapter());
    return list;
  }, [privyOn]);
  const config = useMemo(() => ({ commitment: "confirmed" as const }), []);

  const tree = <PredcaProvider>{children}</PredcaProvider>;

  return (
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {privyOn ? <PrivyWalletBridge>{tree}</PrivyWalletBridge> : tree}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
