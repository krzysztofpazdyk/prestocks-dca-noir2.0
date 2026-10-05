"use client";

import { useEffect, useRef } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { useI18n } from "@/lib/i18n";
import { shortPk } from "@/lib/predca";
import { privyAppId } from "@/lib/privy-devnet";
import { PRIVY_WALLET_NAME } from "@/lib/privy-embedded-adapter";

const buttonClass =
  "rounded border border-[#a78bfa66] bg-[#0c0e12] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#a78bfa] hover:bg-[#a78bfa11] disabled:opacity-40";

/** Email / Google login. Does not replace WalletMultiButton and does not auto-connect. */
export function PrivyLoginButton() {
  if (!privyAppId()) return null;
  return <PrivyLoginButtonInner />;
}

function PrivyLoginButtonInner() {
  const { t } = useI18n();
  const { ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const { wallets: privyWallets } = useWallets();
  const { wallets, wallet, select, connect, disconnect, connected, connecting } =
    useWallet();
  const wantConnect = useRef(false);

  const embedded =
    privyWallets.find((item) => item.standardWallet.name === "Privy") ?? null;
  const adapter =
    wallets.find((item) => item.adapter.name === PRIVY_WALLET_NAME) ?? null;
  const privyConnected =
    connected && wallet?.adapter.name === PRIVY_WALLET_NAME;
  const address = embedded?.address ?? wallet?.adapter.publicKey?.toBase58() ?? "";

  useEffect(() => {
    if (!wantConnect.current) return;
    if (wallet?.adapter.name !== PRIVY_WALLET_NAME) return;
    wantConnect.current = false;
    void connect();
  }, [wallet, connect]);

  async function onUsePrivyWallet() {
    if (!adapter) return;
    if (wallet?.adapter.name !== PRIVY_WALLET_NAME) {
      wantConnect.current = true;
      select(adapter.adapter.name);
      return;
    }
    await connect();
  }

  async function onLogout() {
    wantConnect.current = false;
    if (wallet?.adapter.name === PRIVY_WALLET_NAME) {
      try {
        await disconnect();
      } catch {
        /* adapter may already be disconnected */
      }
    }
    await logout();
  }

  if (!ready) {
    return (
      <button type="button" className={buttonClass} disabled>
        {t("privy.busy")}
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button type="button" className={buttonClass} onClick={() => login()}>
        {t("privy.login")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {address ? (
        <span className="mono-num text-[10px] text-[#c5cedb]" title={address}>
          {t("privy.connected", { address: shortPk(address) })}
        </span>
      ) : null}
      {!privyConnected ? (
        <button
          type="button"
          className={buttonClass}
          disabled={!adapter || connecting}
          onClick={() => void onUsePrivyWallet()}
        >
          {t("privy.connect")}
        </button>
      ) : null}
      <button
        type="button"
        className="rounded px-1.5 py-1 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5]"
        onClick={() => void onLogout()}
      >
        {t("privy.logout")}
      </button>
    </div>
  );
}
