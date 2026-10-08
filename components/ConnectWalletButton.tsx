"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/solana";
import {
  WalletReadyState,
  type WalletName,
} from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useI18n } from "@/lib/i18n";
import { shortPk } from "@/lib/predca";
import {
  adapterHasAccount,
  CONNECT_LOGOUT_RACE_MS,
  CONNECT_PROMPT_MS,
  ConnectTimeoutError,
  createOnceTask,
  externalWalletChoiceEndsPrivy,
  runConnectJob,
  shouldEndPrivySession,
  walletButtonLabel,
  type OnceTask,
} from "@/lib/connect-wallet";
import { clearStatusAuthCache } from "@/lib/keeper-client";
import { privyAppId } from "@/lib/privy-devnet";
import { hasSolanaEmbeddedWallet } from "@/lib/privy-user";
import {
  PRIVY_WALLET_ICON,
  PRIVY_WALLET_NAME,
} from "@/lib/privy-embedded-adapter";

const PHANTOM = "Phantom";
const SOLFLARE = "Solflare";

type Job = {
  id: number;
  target: string;
  /** One logout for this Phantom/Solflare click. Absent for Privy. */
  endPrivy?: OnceTask;
};

function raceLogout(run: () => Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, CONNECT_LOGOUT_RACE_MS);
    void run().finally(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

function connectFailureMessage(
  err: unknown,
  t: (key: string) => string,
): string {
  if (err instanceof ConnectTimeoutError) return t("connect.timeout");
  if (err instanceof Error && err.name === "WalletNotReadyError") {
    return t("connect.notReady");
  }
  if (err instanceof Error && err.message) return err.message;
  return t("connect.failed");
}

function useConnectJob() {
  const { t } = useI18n();
  const tRef = useRef(t);
  const {
    wallets,
    wallet,
    select,
    connect,
    disconnect: walletDisconnect,
    connected,
    connecting,
    disconnecting,
    publicKey,
  } = useWallet();
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Header treats this as logged out before `useWallet().connected` flips.
  // Do not clear it when `connected` is still true — that undoes Rozłącz.
  const [dropped, setDropped] = useState(false);
  // Address kept while a background Privy logout briefly clears `connected`.
  const [pinnedAddress, setPinnedAddress] = useState<string | null>(null);
  const pinnedRef = useRef<string | null>(null);
  const pinTargetRef = useRef<string | null>(null);
  const endPrivyRef = useRef<OnceTask | null>(null);
  const walletRef = useRef(wallet);
  const walletsRef = useRef(wallets);
  const connectedRef = useRef(connected);
  const connectingRef = useRef(connecting);
  const disconnectingRef = useRef(disconnecting);
  const jobRef = useRef(job);
  const selectRef = useRef(select);
  const connectRef = useRef(connect);

  useEffect(() => {
    tRef.current = t;
    walletRef.current = wallet;
    walletsRef.current = wallets;
    connectedRef.current = connected;
    connectingRef.current = connecting;
    disconnectingRef.current = disconnecting;
    jobRef.current = job;
    selectRef.current = select;
    connectRef.current = connect;
  });

  const fail = useCallback((message: string) => {
    setJob(null);
    setBusy(false);
    // The address is already on screen. A later repair failure must not
    // replace it with "Łączenie…" or an error dialog.
    if (pinnedRef.current) return;
    setError(message);
    pinTargetRef.current = null;
    setPinnedAddress(null);
  }, []);

  const requestConnect = useCallback((target: string, endPrivy?: OnceTask) => {
    const previous = endPrivyRef.current;
    if (previous && previous !== endPrivy && !previous.hasStarted()) {
      void previous.start();
    }
    endPrivyRef.current = endPrivy ?? null;
    setDropped(false);
    setError(null);
    pinnedRef.current = null;
    setPinnedAddress(null);
    pinTargetRef.current = target;
    // Same adapter and nothing to finish afterward: already settled.
    // A Phantom/Solflare logout still goes through the job so a wipe
    // can be repaired after the address is on screen.
    if (
      !endPrivy &&
      connectedRef.current &&
      walletRef.current?.adapter.name === target
    ) {
      setBusy(false);
      setJob(null);
      return;
    }
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setBusy(true);
    setJob({ id, target, endPrivy });
  }, []);

  const cancel = useCallback((endPrivy?: boolean) => {
    if (endPrivy) void endPrivyRef.current?.start();
    if (!pinnedRef.current) {
      pinTargetRef.current = null;
      setPinnedAddress(null);
    }
    setJob(null);
    setBusy(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const disconnect = useCallback(async () => {
    pinnedRef.current = null;
    pinTargetRef.current = null;
    setPinnedAddress(null);
    setDropped(true);
    selectRef.current(null);
    clearStatusAuthCache();
    try {
      await walletDisconnect();
    } catch {
      // select(null) already started disconnect. The header does not wait.
    }
  }, [walletDisconnect]);

  // As soon as the chosen wallet is connected, drop "Łączenie…" and remember
  // the address. A later Privy logout must not put the connecting label back.
  useEffect(() => {
    if (dropped || !connected || !publicKey) return;
    if ((wallet?.adapter.name ?? null) !== pinTargetRef.current) return;
    const next = shortPk(publicKey);
    pinnedRef.current = next;
    setPinnedAddress(next);
    setBusy(false);
  }, [connected, publicKey, wallet, dropped]);

  useEffect(() => {
    if (!job) return;
    const jobId = job.id;
    const target = job.target;
    const endPrivy = job.endPrivy;
    let cancelled = false;

    // Backstop for a connect() promise that never settles (wallet popup or
    // a stuck adapter). The runner itself times out the steps that do return.
    const watchdog = window.setTimeout(() => {
      if (cancelled || jobRef.current?.id !== jobId) return;
      if (
        connectedRef.current &&
        walletRef.current?.adapter.name === target
      ) {
        return;
      }
      cancelled = true;
      void endPrivy?.start();
      fail(tRef.current("connect.timeout"));
    }, CONNECT_PROMPT_MS);

    void runConnectJob({
      target,
      now: () => Date.now(),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      isCancelled: () => cancelled || jobRef.current?.id !== jobId,
      getState: () => {
        const selectedName = walletRef.current?.adapter.name ?? null;
        const listed = walletsRef.current.find(
          (item) => item.adapter.name === target,
        );
        const targetReady =
          target === PRIVY_WALLET_NAME
            ? adapterHasAccount(listed?.adapter)
            : Boolean(listed);
        return {
          selectedName,
          connected: connectedRef.current,
          connecting: connectingRef.current,
          disconnecting: disconnectingRef.current,
          targetReady,
        };
      },
      disconnectAdapter: async () => {
        const adapter = walletRef.current?.adapter;
        if (!adapter || adapter.name === target) return;
        await Promise.race([
          adapter.disconnect().catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      },
      select: (name) => {
        selectRef.current(name == null ? null : (name as WalletName));
      },
      connect: () => connectRef.current(),
      afterConnected: endPrivy ? () => endPrivy.start() : undefined,
    })
      .then(() => {
        if (cancelled || jobRef.current?.id !== jobId) return;
        setJob(null);
        setBusy(false);
      })
      .catch((err: unknown) => {
        if (cancelled || jobRef.current?.id !== jobId) return;
        void endPrivy?.start();
        fail(connectFailureMessage(err, tRef.current));
      });

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
    };
  }, [job, fail]);

  return {
    wallets,
    wallet,
    connected,
    connecting,
    publicKey,
    busy,
    dropped,
    pinnedAddress,
    error,
    requestConnect,
    cancel,
    disconnect,
    clearError,
    fail,
    /** Starts the Phantom/Solflare logout if this click has not logged out yet. */
    takeArmedLogout: () => {
      const armed = endPrivyRef.current;
      if (!armed || armed.hasStarted()) return null;
      return armed.start();
    },
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
  /** "login" closes our list so the Privy modal is the only dialog. */
  onPick: () => "login" | "connect";
  onLogout: () => Promise<void>;
  /**
   * Phantom/Solflare. Clears the Privy re-entry flag now and returns one
   * logout for success, rejection, timeout, or cancel.
   */
  armExternalLogout: () => OnceTask;
};

function PrivyConnect() {
  const { t } = useI18n();
  const tRef = useRef(t);
  const job = useConnectJob();
  const { ready, authenticated, logout, user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const wantPrivy = useRef(false);
  const requestRef = useRef(job.requestConnect);
  const cancelRef = useRef(job.cancel);
  const failRef = useRef(job.fail);
  const createRef = useRef(createWallet);
  const ensureRef = useRef<
    (accountUser: Parameters<typeof hasSolanaEmbeddedWallet>[0]) => Promise<boolean>
  >(async () => false);

  useEffect(() => {
    tRef.current = t;
    requestRef.current = job.requestConnect;
    cancelRef.current = job.cancel;
    failRef.current = job.fail;
    createRef.current = createWallet;
    ensureRef.current = async (accountUser) => {
      // Returning users already have the embedded address. createWallet()
      // would no-op or open UI; skip it and connect the standard wallet.
      if (hasSolanaEmbeddedWallet(accountUser)) return true;
      try {
        await createRef.current();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/already/i.test(message)) return true;
        if (/exit|cancel|closed|dismiss/i.test(message)) {
          cancelRef.current();
          return false;
        }
        failRef.current(tRef.current("connect.failed"));
        return false;
      }
    };
  });

  const loginCallbacks = useMemo(
    () => ({
      onComplete: (params: {
        user?: Parameters<typeof hasSolanaEmbeddedWallet>[0];
      }) => {
        // Fires on mount when a session already exists. Connect only after
        // the user picked Privy (autoConnect stays false).
        if (!wantPrivy.current) return;
        wantPrivy.current = false;
        void (async () => {
          const ok = await ensureRef.current(params.user);
          if (ok) requestRef.current(PRIVY_WALLET_NAME);
        })();
      },
      onError: (code: string) => {
        wantPrivy.current = false;
        // Closing the Privy dialog is not a failed connect.
        if (code === "exited_auth_flow") {
          cancelRef.current();
          return;
        }
        failRef.current(tRef.current("connect.failed"));
      },
    }),
    [],
  );
  const { login } = useLogin(loginCallbacks);

  const onPick = useCallback((): "login" | "connect" => {
    if (!ready) {
      job.fail(t("connect.notReady"));
      return "connect";
    }
    job.clearError();
    if (authenticated) {
      wantPrivy.current = false;
      if (hasSolanaEmbeddedWallet(user)) {
        job.requestConnect(PRIVY_WALLET_NAME);
        return "connect";
      }
      // Authenticated, but the first create crashed or was skipped.
      // Close our list so Privy's create screen is the only dialog.
      void (async () => {
        const ok = await ensureRef.current(user);
        if (ok) requestRef.current(PRIVY_WALLET_NAME);
      })();
      return "login";
    }
    wantPrivy.current = true;
    login();
    return "login";
  }, [authenticated, job, login, ready, t, user]);

  const armExternalLogout = useCallback((): OnceTask => {
    // Before connect, so a mount-time onComplete cannot select Privy again.
    wantPrivy.current = false;
    return createOnceTask(() =>
      raceLogout(async () => {
        try {
          await logout();
        } catch {
          /* session may already be gone */
        }
      }),
    );
  }, [logout]);

  const onLogout = useCallback(async () => {
    const endPrivy = shouldEndPrivySession({
      nextName: null,
      activeName: job.wallet?.adapter.name,
      privyAuthenticated: authenticated,
      privyName: PRIVY_WALLET_NAME,
    });
    const pendingSwitch = job.takeArmedLogout();
    if (endPrivy || pendingSwitch) wantPrivy.current = false;
    job.cancel();
    try {
      await job.disconnect();
    } catch {
      /* adapter may already be disconnected */
    }
    if (pendingSwitch) {
      await pendingSwitch;
      return;
    }
    if (!endPrivy) return;
    try {
      await logout();
    } catch {
      /* session may already be gone */
    }
  }, [authenticated, job, logout]);

  return (
    <ConnectUi
      job={job}
      privy={{ ready, onPick, onLogout, armExternalLogout }}
    />
  );
}

function readViewportFrame(): { top: number; height: number } {
  if (typeof window === "undefined") return { top: 0, height: 0 };
  const viewport = window.visualViewport;
  return {
    top: viewport?.offsetTop ?? 0,
    height: viewport?.height ?? window.innerHeight,
  };
}

function ConnectUi({ job, privy }: { job: ConnectJob; privy: PrivyUi | null }) {
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [frame, setFrame] = useState(readViewportFrame);
  const busyWas = useRef(false);

  useEffect(() => {
    if (!pickerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const update = () => setFrame(readViewportFrame());
    const handle = window.requestAnimationFrame(update);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      document.body.style.overflow = previous;
      window.cancelAnimationFrame(handle);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (job.busy && !busyWas.current) setPickerOpen(true);
    busyWas.current = job.busy;
  }, [job.busy]);

  useEffect(() => {
    if (job.error) setPickerOpen(true);
  }, [job.error]);

  useEffect(() => {
    const settled =
      !job.dropped &&
      ((job.connected && Boolean(job.publicKey)) || Boolean(job.pinnedAddress));
    if (!job.busy && settled && !job.error) setPickerOpen(false);
  }, [job.busy, job.connected, job.publicKey, job.pinnedAddress, job.dropped, job.error]);

  useEffect(() => {
    if (!pickerOpen && !menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPickerOpen(false);
      setMenuOpen(false);
      dismissPicker();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen, menuOpen, job]);

  const address = job.publicKey ? shortPk(job.publicKey) : "";
  const shownConnected =
    !job.dropped &&
    ((job.connected && Boolean(address)) || Boolean(job.pinnedAddress));
  const label = walletButtonLabel({
    dropped: job.dropped,
    busy: job.busy,
    connected: job.connected && !job.dropped,
    address,
    pinnedAddress: job.dropped ? null : job.pinnedAddress,
    connectingLabel: t("connect.busy"),
    selectLabel: t("nav.selectWallet"),
  });

  function attemptSettled() {
    return shownConnected;
  }

  function dismissPicker() {
    setPickerOpen(false);
    setMenuOpen(false);
    // Closing the list is not a logout. Cancelling an in-flight
    // Phantom/Solflare attempt is, and it logs out once.
    if (job.connecting || attemptSettled()) return;
    job.cancel(true);
  }

  function openPrimary() {
    job.clearError();
    if (shownConnected) {
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
    if (!privy || !externalWalletChoiceEndsPrivy(name)) {
      job.requestConnect(name);
      return;
    }
    job.requestConnect(name, privy.armExternalLogout());
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

      {menuOpen && shownConnected ? (
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
              if (privy) {
                void privy.onLogout();
                return;
              }
              job.cancel();
              void job.disconnect();
            }}
          />
        </div>
      ) : null}

      {pickerOpen
        ? createPortal(
            <div
              className="fixed inset-x-0 z-[200] box-border overflow-hidden bg-[#0c0e12cc] p-4"
              style={{
                top: frame.top,
                height: frame.height || "100svh",
                display: "grid",
                placeItems: "safe center",
              }}
              onClick={() => {
                dismissPicker();
              }}
            >
              {/*
                Portaled to document.body and sized to the visual viewport.
                A centered flex child inside a scrolling overlay clips the
                title above the fold. This grid does not scroll; a too-tall
                list scrolls inside the dialog, under a sticky title.
              */}
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="connect-wallet-title"
                data-testid="connect-wallet-modal"
                className="w-full max-w-sm overflow-y-auto overscroll-contain rounded-lg border border-[#2dd4bf44] bg-[#141820] shadow-[0_0_40px_#2dd4bf22]"
                style={{
                  maxHeight: frame.height
                    ? Math.max(160, frame.height - 48)
                    : "calc(100svh - 3rem)",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-[#141820] px-5 pt-5 pb-3">
                  <h2
                    id="connect-wallet-title"
                    className="text-sm font-semibold text-[#e8eef5]"
                  >
                    {t("connect.title")}
                  </h2>
                  <button
                    type="button"
                    aria-label={t("connect.close")}
                    data-testid="connect-close"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg leading-none text-[#8b95a8] hover:bg-[#1a2330] hover:text-[#e8eef5]"
                    onClick={() => {
                      dismissPicker();
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-2 px-5 pb-5">
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
                        hint={
                          privy.ready ? t("connect.privyHint") : t("privy.busy")
                        }
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
                  {job.busy ? (
                    <p
                      className="mt-3 text-[10px] uppercase tracking-wider text-[#a78bfa]"
                      data-testid="connect-status"
                    >
                      {t("connect.busy")}
                    </p>
                  ) : null}
                  {job.error ? (
                    <p
                      className="mt-3 text-[10px] text-[#fca5a5]"
                      data-testid="connect-error"
                    >
                      {job.error}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
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
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 shrink-0 text-[#8b95a8]"
        aria-hidden
      >
        <path
          d="M7 4.5 12.5 10 7 15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
