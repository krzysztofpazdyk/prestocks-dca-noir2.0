"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  WalletReadyState,
  type WalletName,
} from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useI18n } from "@/lib/i18n";
import { shortPk } from "@/lib/predca";
import { nextConnectStep } from "@/lib/connect-wallet";
import { privyAppId } from "@/lib/privy-devnet";
import {
  PRIVY_WALLET_ICON,
  PRIVY_WALLET_NAME,
} from "@/lib/privy-embedded-adapter";

const PHANTOM = "Phantom";
const SOLFLARE = "Solflare";

type Job = {
  id: number;
  target: string;
  phase: "disconnect" | "select" | "connect";
};

function connectFailureMessage(
  err: unknown,
  t: (key: string) => string,
): string {
  if (err instanceof Error && err.message) return err.message;
  if (err instanceof Error && err.name === "WalletNotReadyError") {
    return t("connect.notReady");
  }
  return t("connect.failed");
}

function useConnectJob() {
  const { t } = useI18n();
  const tRef = useRef(t);
  tRef.current = t;
  const {
    wallets,
    wallet,
    select,
    connect,
    disconnect,
    connected,
    connecting,
    disconnecting,
    publicKey,
  } = useWallet();
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disconnectStarted = useRef(0);
  const connectStarted = useRef(0);
  const selectStamp = useRef("");
  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  const connectedRef = useRef(connected);
  connectedRef.current = connected;
  const jobRef = useRef(job);
  jobRef.current = job;

  const requestConnect = useCallback(
    (target: string) => {
      setError(null);
      if (
        connectedRef.current &&
        walletRef.current?.adapter.name === target
      ) {
        setBusy(false);
        setJob(null);
        return;
      }
      const current = walletRef.current;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      disconnectStarted.current = 0;
      connectStarted.current = 0;
      selectStamp.current = "";
      const needsDisconnect =
        connectedRef.current ||
        (current != null && current.adapter.name !== target);
      setBusy(true);
      setJob({
        id,
        target,
        phase: needsDisconnect ? "disconnect" : "select",
      });
    },
    [],
  );

  const cancel = useCallback(() => {
    setJob(null);
    setBusy(false);
    setError(null);
    connectStarted.current = 0;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!job) return;
    const selectedName = wallet?.adapter.name ?? null;
    const targetReady = wallets.some((item) => item.adapter.name === job.target);
    const step = nextConnectStep({
      phase: job.phase,
      target: job.target,
      selectedName,
      connected,
      connecting,
      disconnecting,
      targetReady,
    });

    if (step === "done") {
      setJob(null);
      setBusy(false);
      return;
    }

    if (step === "wait") {
      if (job.phase === "disconnect" && disconnectStarted.current !== job.id) {
        disconnectStarted.current = job.id;
        const jobId = job.id;
        const target = job.target;
        void (async () => {
          try {
            await disconnect();
          } catch {
            /* already disconnected */
          }
          // If the name is still the previous wallet and it is no longer
          // connected, drop it. A connected adapter must not be select(null)'d
          // here — that disconnects without waiting and can wipe the next name.
          await new Promise((resolve) => setTimeout(resolve, 50));
          if (jobRef.current?.id !== jobId) return;
          const current = walletRef.current;
          if (
            current &&
            current.adapter.name !== target &&
            !connectedRef.current
          ) {
            select(null);
          }
        })();
      }
      return;
    }

    if (step === "select") {
      if (!targetReady) return;
      const stamp = `${job.id}:${selectedName ?? ""}`;
      if (selectStamp.current === stamp) return;
      selectStamp.current = stamp;
      if (job.phase !== "select") setJob({ ...job, phase: "select" });
      select(job.target as WalletName);
      return;
    }

    selectStamp.current = "";
    if (selectedName !== job.target || connecting || disconnecting) return;
    if (connectStarted.current === job.id) return;
    connectStarted.current = job.id;
    if (job.phase !== "connect") setJob({ ...job, phase: "connect" });
    void connect().catch((err: unknown) => {
      connectStarted.current = 0;
      setJob(null);
      setBusy(false);
      setError(connectFailureMessage(err, tRef.current));
    });
  }, [
    job,
    wallet,
    wallets,
    connected,
    connecting,
    disconnecting,
    select,
    connect,
    disconnect,
  ]);

  return {
    wallets,
    wallet,
    connected,
    connecting,
    publicKey,
    busy,
    error,
    requestConnect,
    cancel,
    disconnect,
    clearError,
  };
}

type ConnectJob = ReturnType<typeof useConnectJob>;

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="wallet-adapter-button wallet-adapter-button-trigger"
      style={{ pointerEvents: "none", opacity: 0.5 }}
      aria-hidden
    >
      {label}
    </div>
  );
}

function isDetected(ready: WalletReadyState | undefined): boolean {
  return (
    ready === WalletReadyState.Installed || ready === WalletReadyState.Loadable
  );
}

export function ConnectWalletButton() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Placeholder label={t("nav.selectWallet")} />;
  if (!privyAppId()) return <AdapterConnect />;
  return <PrivyConnect />;
}

function AdapterConnect() {
  const job = useConnectJob();
  return <ConnectUi job={job} privy={null} />;
}

type PrivyUi = {
  ready: boolean;
  authenticated: boolean;
  /** "login" closes our list so the Privy modal is the only dialog. */
  onPick: () => "login" | "connect";
  onLogout: () => Promise<void>;
};

function PrivyConnect() {
  const job = useConnectJob();
  const { ready, authenticated, logout } = usePrivy();
  const wantPrivy = useRef(false);
  const requestRef = useRef(job.requestConnect);
  requestRef.current = job.requestConnect;
  const cancelRef = useRef(job.cancel);
  cancelRef.current = job.cancel;

  const loginCallbacks = useMemo(
    () => ({
      onComplete: () => {
        if (!wantPrivy.current) return;
        wantPrivy.current = false;
        requestRef.current(PRIVY_WALLET_NAME);
      },
      onError: () => {
        wantPrivy.current = false;
        cancelRef.current();
      },
    }),
    [],
  );
  const { login } = useLogin(loginCallbacks);

  const onPick = useCallback((): "login" | "connect" => {
    if (!ready) return "login";
    job.clearError();
    if (authenticated) {
      wantPrivy.current = false;
      job.requestConnect(PRIVY_WALLET_NAME);
      return "connect";
    }
    wantPrivy.current = true;
    login();
    return "login";
  }, [authenticated, job, login, ready]);

  const onLogout = useCallback(async () => {
    wantPrivy.current = false;
    job.cancel();
    if (walletNameIsPrivy(job.wallet?.adapter.name)) {
      try {
        await job.disconnect();
      } catch {
        /* adapter may already be disconnected */
      }
    }
    await logout();
  }, [job, logout]);

  return (
    <ConnectUi
      job={job}
      privy={{ ready, authenticated, onPick, onLogout }}
    />
  );
}

function walletNameIsPrivy(name: string | undefined): boolean {
  return name === PRIVY_WALLET_NAME;
}

function ConnectUi({ job, privy }: { job: ConnectJob; privy: PrivyUi | null }) {
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const busyWas = useRef(false);

  useEffect(() => {
    if (job.busy && !busyWas.current) setPickerOpen(true);
    busyWas.current = job.busy;
  }, [job.busy]);

  useEffect(() => {
    if (job.error) setPickerOpen(true);
  }, [job.error]);

  useEffect(() => {
    if (!job.busy && job.connected && !job.error) setPickerOpen(false);
  }, [job.busy, job.connected, job.error]);

  useEffect(() => {
    if (!pickerOpen && !menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPickerOpen(false);
      setMenuOpen(false);
      if (!job.connecting) job.cancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen, menuOpen, job]);

  const address = job.publicKey ? shortPk(job.publicKey) : "";
  const label = job.busy
    ? t("connect.busy")
    : job.connected && address
      ? address
      : t("nav.selectWallet");

  function openPrimary() {
    job.clearError();
    if (job.connected) {
      setMenuOpen((open) => !open);
      setPickerOpen(false);
      return;
    }
    setMenuOpen(false);
    setPickerOpen(true);
  }

  function choose(name: string) {
    setMenuOpen(false);
    setPickerOpen(true);
    job.requestConnect(name);
  }

  const phantom = job.wallets.find((item) => item.adapter.name === PHANTOM);
  const solflare = job.wallets.find((item) => item.adapter.name === SOLFLARE);
  const privyAdapter = job.wallets.find(
    (item) => item.adapter.name === PRIVY_WALLET_NAME,
  );

  return (
    <div className="relative">
      <button
        type="button"
        className="wallet-adapter-button wallet-adapter-button-trigger"
        onClick={openPrimary}
        aria-haspopup="dialog"
        aria-expanded={pickerOpen || menuOpen}
        data-testid="connect-wallet"
      >
        {label}
      </button>

      {menuOpen && job.connected ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-52 rounded-lg border border-[#1e2633] bg-[#141820] p-2 shadow-[0_12px_40px_#000a]"
          role="menu"
        >
          <MenuItem
            label={t("connect.change")}
            onClick={() => {
              setMenuOpen(false);
              setPickerOpen(true);
            }}
          />
          <MenuItem
            label={t("connect.disconnect")}
            onClick={() => {
              setMenuOpen(false);
              job.cancel();
              void job.disconnect();
            }}
          />
          {privy?.authenticated ? (
            <MenuItem
              label={t("connect.logoutPrivy")}
              onClick={() => {
                setMenuOpen(false);
                void privy.onLogout();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {pickerOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0c0e12cc] px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-wallet-title"
          onClick={() => {
            setPickerOpen(false);
            if (!job.connecting) job.cancel();
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-[#2dd4bf44] bg-[#141820] p-5 shadow-[0_0_40px_#2dd4bf22]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="connect-wallet-title"
              className="text-sm font-semibold text-[#e8eef5]"
            >
              {t("connect.title")}
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              <WalletRow
                name={PHANTOM}
                icon={phantom?.adapter.icon}
                hint={
                  isDetected(phantom?.readyState)
                    ? t("connect.detected")
                    : t("connect.notDetected")
                }
                testId="connect-option-phantom"
                onClick={() => choose(PHANTOM)}
              />
              <WalletRow
                name={SOLFLARE}
                icon={solflare?.adapter.icon}
                hint={
                  isDetected(solflare?.readyState)
                    ? t("connect.detected")
                    : t("connect.notDetected")
                }
                testId="connect-option-solflare"
                onClick={() => choose(SOLFLARE)}
              />
              {privy ? (
                <WalletRow
                  name={t("connect.privy")}
                  icon={privyAdapter?.adapter.icon || PRIVY_WALLET_ICON}
                  hint={privy.ready ? t("connect.privyHint") : t("privy.busy")}
                  disabled={!privy.ready || job.connecting}
                  testId="connect-option-privy"
                  onClick={() => {
                    const mode = privy.onPick();
                    setMenuOpen(false);
                    if (mode === "login") setPickerOpen(false);
                    else setPickerOpen(true);
                  }}
                />
              ) : null}
            </div>
            {job.busy ? (
              <p className="mt-3 text-[10px] uppercase tracking-wider text-[#a78bfa]">
                {t("connect.busy")}
              </p>
            ) : null}
            {job.error ? (
              <p className="mt-3 text-[10px] text-[#fca5a5]">{job.error}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full rounded px-3 py-2 text-left text-[11px] uppercase tracking-wider text-[#c5cedb] hover:bg-[#1a2330] hover:text-[#e8eef5]"
    >
      {label}
    </button>
  );
}

function WalletRow({
  name,
  icon,
  hint,
  onClick,
  disabled,
  testId,
}: {
  name: string;
  icon?: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex w-full items-center gap-3 rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2.5 text-left hover:border-[#2dd4bf66] disabled:opacity-40"
    >
      {icon ? (
        // Adapter icons are data-URLs or package https URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" className="h-6 w-6 rounded" />
      ) : (
        <span className="inline-block h-6 w-6 rounded bg-[#1a2330]" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-[#e8eef5]">{name}</span>
        <span className="block text-[10px] text-[#8b95a8]">{hint}</span>
      </span>
    </button>
  );
}
