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
  applyDisconnectContinuation,
  armPrivyLogoutForChoice,
  capPromise,
  CONNECT_DISCONNECT_WAIT_MS,
  CONNECT_LOGOUT_RACE_MS,
  CONNECT_PROMPT_MS,
  ConnectTimeoutError,
  createDisconnectTracker,
  createOnceTask,
  decidePrivyPick,
  failShowsError,
  nextPinnedAddress,
  privyOtpAfterLogout,
  replayLiveConnect,
  runSwitchAttempt,
  shouldEndPrivySession,
  shouldRestoreExternalWallet,
  walletButtonLabel,
  type CapTimers,
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
  /** One logout for this Phantom/Solflare click. Absent when no Privy session. */
  endPrivy?: OnceTask;
  /** Rozłącz already ran; the same wallet may still look connected. */
  forceFresh?: boolean;
};

const browserTimers: CapTimers = {
  setTimer: (fn, ms) => window.setTimeout(fn, ms),
  clearTimer: (handle) => window.clearTimeout(handle as number),
};

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
  // Job id whose still-connected session must stay hidden until it drops.
  const [staleHoldJobId, setStaleHoldJobId] = useState<number | null>(null);
  const staleHoldJobIdRef = useRef<number | null>(null);
  // Last target address, set from the connect callback. The pin itself is derived.
  const [rememberedAddress, setRememberedAddress] = useState<string | null>(null);
  // True while the next job is waiting out the previous disconnect().
  const [awaitingDisconnect, setAwaitingDisconnect] = useState(false);
  const pinTargetRef = useRef<string | null>(null);
  const endPrivyRef = useRef<OnceTask | null>(null);
  const disconnects = useRef(createDisconnectTracker());
  // External wallet we must put back if Privy logout clears the selected name.
  const [logoutGuard, setLogoutGuard] = useState<string | null>(null);
  const guardGen = useRef(0);
  const walletRef = useRef(wallet);
  const walletsRef = useRef(wallets);
  const connectedRef = useRef(connected);
  const connectingRef = useRef(connecting);
  const disconnectingRef = useRef(disconnecting);
  const jobRef = useRef(job);
  const selectRef = useRef(select);
  const connectRef = useRef(connect);
  const droppedRef = useRef(dropped);
  const logoutPendingRef = useRef(false);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);

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
    droppedRef.current = dropped;
  });

  const releasePin = useCallback(() => {
    pinTargetRef.current = null;
    setRememberedAddress(null);
  }, []);

  const fail = useCallback((message: string) => {
    setJob(null);
    setBusy(false);
    setAwaitingDisconnect(false);
    const target = pinTargetRef.current;
    const listed = target
      ? walletsRef.current.find((item) => item.adapter.name === target)
      : undefined;
    const show = failShowsError({
      target,
      selectedName: walletRef.current?.adapter.name ?? null,
      adapterConnected: Boolean(listed?.adapter.connected),
      adapterHasKey: Boolean(listed?.adapter.publicKey),
    });
    releasePin();
    if (show) setError(message);
  }, [releasePin]);

  const requestConnect = useCallback((target: string, endPrivy?: OnceTask) => {
    const previous = endPrivyRef.current;
    if (previous && previous !== endPrivy && !previous.hasStarted()) {
      void previous.start();
    }
    endPrivyRef.current = endPrivy ?? null;
    const forceFresh = droppedRef.current || disconnectingRef.current;
    // Same adapter and nothing to finish afterward: already settled.
    // A session that still has to log out goes through the job. A wallet
    // Rozłącz just dropped is not settled, even if `connected` is still true.
    if (
      !endPrivy &&
      !forceFresh &&
      connectedRef.current &&
      walletRef.current?.adapter.name === target
    ) {
      setBusy(false);
      setJob(null);
      setAwaitingDisconnect(false);
      return;
    }
    // The in-flight disconnect continuation must not undo this connect.
    disconnects.current.bump();
    guardGen.current += 1;
    setLogoutGuard(null);
    setDropped(false);
    setError(null);
    releasePin();
    pinTargetRef.current = target;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const holdId = forceFresh && connectedRef.current ? id : null;
    staleHoldJobIdRef.current = holdId;
    setStaleHoldJobId(holdId);
    setAwaitingDisconnect(disconnects.current.pending() != null);
    setBusy(true);
    setJob({ id, target, endPrivy, forceFresh });
  }, [releasePin]);

  const cancel = useCallback((endPrivy?: boolean) => {
    if (endPrivy) void endPrivyRef.current?.start();
    releasePin();
    staleHoldJobIdRef.current = null;
    setStaleHoldJobId(null);
    setAwaitingDisconnect(false);
    setJob(null);
    setBusy(false);
    setError(null);
  }, [releasePin]);

  const clearError = useCallback(() => setError(null), []);

  const disconnect = useCallback(async () => {
    guardGen.current += 1;
    setLogoutGuard(null);
    staleHoldJobIdRef.current = null;
    setStaleHoldJobId(null);
    setAwaitingDisconnect(false);
    releasePin();
    // `select(null)` also calls `adapter.disconnect()` and does not wait.
    // A second call emits immediately. Track the first call: Phantom emits
    // `disconnect` only after `wallet.disconnect()` resolves.
    const generation = disconnects.current.begin(
      Promise.resolve(walletDisconnect()).then(
        () => undefined,
        () => undefined,
      ),
    );
    setDropped(true);
    selectRef.current(null);
    clearStatusAuthCache();
    const pending = disconnects.current.pending();
    if (pending) await pending;
    applyDisconnectContinuation(disconnects.current, generation, {
      selectNull: () => selectRef.current(null),
      setDropped: () => setDropped(true),
      touchPin: () => releasePin(),
    });
  }, [releasePin, walletDisconnect]);

  // Hide the session Rozłącz has not dropped yet. Cleared once `connected`
  // flips false (from the job, not from an effect) so it cannot come back.
  const staleHold =
    staleHoldJobId != null && staleHoldJobId === job?.id && connected;
  const pinTarget = job?.target ?? logoutGuard;
  const listedPin = pinTarget
    ? wallets.find((item) => item.adapter.name === pinTarget)
    : undefined;
  const adapterLive = Boolean(
    listedPin?.adapter.connected && listedPin.adapter.publicKey,
  );
  const onTarget =
    Boolean(connected && publicKey) &&
    (wallet?.adapter.name ?? null) === pinTarget;
  const guarded =
    logoutGuard != null && logoutGuard === pinTarget && adapterLive;
  const pinnedAddress = nextPinnedAddress({
    dropped: dropped || staleHold,
    jobActive: job != null || guarded,
    adapterLive: adapterLive || guarded,
    liveAddress: onTarget && publicKey ? shortPk(publicKey) : null,
    currentPin: rememberedAddress,
    switchWithLogout: Boolean(job?.endPrivy) || guarded,
  });

  // A Privy logout that lands after the switch must not clear Phantom.
  const restores = useRef(0);
  useEffect(() => {
    if (!logoutGuard) {
      restores.current = 0;
      return;
    }
    const listed = wallets.find((item) => item.adapter.name === logoutGuard);
    const adapter = listed?.adapter;
    const superseded = job != null && job.target !== logoutGuard;
    if (
      !shouldRestoreExternalWallet({
        target: logoutGuard,
        dropped: dropped || staleHold,
        guarding: true,
        superseded,
        selectedName: wallet?.adapter.name ?? null,
        hookConnected: connected,
        adapterConnected: Boolean(adapter?.connected),
        adapterHasKey: Boolean(adapter?.publicKey),
      }) ||
      !adapter
    ) {
      return;
    }
    if ((wallet?.adapter.name ?? null) !== logoutGuard) {
      if (restores.current >= 4) return;
      restores.current += 1;
      select(logoutGuard as WalletName);
      return;
    }
    if (!connected) replayLiveConnect(adapter, logoutGuard);
  }, [logoutGuard, dropped, staleHold, job, wallets, wallet, connected, select]);

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

    void runSwitchAttempt(
      {
        target,
        now: () => Date.now(),
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
        isCancelled: () => cancelled || jobRef.current?.id !== jobId,
        forceFresh: job.forceFresh,
        adapterStillLive: () => {
          const listed = walletsRef.current.find(
            (item) => item.adapter.name === target,
          );
          return Boolean(listed?.adapter.connected && listed.adapter.publicKey);
        },
        waitForPendingDisconnect: async () => {
          const pending = disconnects.current.pending();
          if (!pending) return;
          await capPromise(pending, CONNECT_DISCONNECT_WAIT_MS, browserTimers);
          if (cancelled || jobRef.current?.id !== jobId) return;
          setAwaitingDisconnect(false);
        },
        getState: () => {
          if (staleHoldJobIdRef.current === jobId && !connectedRef.current) {
            staleHoldJobIdRef.current = null;
            setStaleHoldJobId(null);
          }
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
        disconnectAdapter: async (force) => {
          const adapter = walletRef.current?.adapter;
          if (!adapter) return;
          if (!force && adapter.name === target) return;
          await Promise.race([
            adapter.disconnect().catch(() => undefined),
            new Promise((resolve) => setTimeout(resolve, CONNECT_DISCONNECT_WAIT_MS)),
          ]);
        },
        select: (name) => {
          selectRef.current(name == null ? null : (name as WalletName));
        },
        connect: async () => {
          const adapter = walletRef.current?.adapter;
          if (adapter && replayLiveConnect(adapter, target)) return;
          await connectRef.current();
        },
        onTargetConnected: () => {
          const listed = walletsRef.current.find(
            (item) => item.adapter.name === target,
          );
          const key =
            listed?.adapter.publicKey ?? walletRef.current?.adapter.publicKey;
          if (key) setRememberedAddress(shortPk(key));
          setAwaitingDisconnect(false);
          setBusy(false);
        },
      },
      {
        logout: endPrivy,
        capMs: CONNECT_LOGOUT_RACE_MS,
        timers: browserTimers,
        logoutOnCancel: false,
        onError: (err) => {
          if (cancelled || jobRef.current?.id !== jobId) return;
          fail(connectFailureMessage(err, tRef.current));
        },
      },
    ).then((result) => {
      if (cancelled || jobRef.current?.id !== jobId) return;
      if (result === "connected") {
        staleHoldJobIdRef.current = null;
        setStaleHoldJobId(null);
        setAwaitingDisconnect(false);
        setJob(null);
        setBusy(false);
      }
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
    staleHold,
    awaitingDisconnect,
    pinnedAddress,
    error,
    target: job?.target ?? null,
    externalSwitch:
      logoutGuard != null ||
      (job != null && (job.target === PHANTOM || job.target === SOLFLARE)),
    isLogoutInFlight: () => logoutPendingRef.current,
    requestConnect,
    cancel,
    disconnect,
    clearError,
    fail,
    /**
     * The one logout for this Phantom/Solflare click.
     * A second call awaits the same promise instead of logging out again.
     */
    takeArmedLogout: () => {
      const armed = endPrivyRef.current;
      if (armed && !armed.hasStarted()) return armed.start();
      // A logout that already finished must not swallow a later Rozłącz.
      if (logoutPendingRef.current) return logoutPromiseRef.current;
      return null;
    },
    noteLogout: (run: Promise<void>) => {
      logoutPendingRef.current = true;
      logoutPromiseRef.current = run;
      void run.finally(() => {
        if (logoutPromiseRef.current === run) logoutPendingRef.current = false;
      });
    },
    /** Keep this external wallet across a Privy logout that finishes late. */
    holdThroughLogout: (run: Promise<void>) => {
      const target = pinTargetRef.current;
      if (target !== PHANTOM && target !== SOLFLARE) return;
      const gen = ++guardGen.current;
      setLogoutGuard(target);
      void run.finally(() => {
        window.setTimeout(() => {
          if (guardGen.current !== gen) return;
          setLogoutGuard((current) => (current === target ? null : current));
        }, 800);
      });
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
  /** True when a Privy session may still be open. */
  authenticated: boolean;
  /**
   * Phantom/Solflare, and only when a session may exist. One logout for
   * success, rejection, timeout, or cancel.
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
    const action = decidePrivyPick({
      ready,
      authenticated,
      hasEmbeddedWallet: hasSolanaEmbeddedWallet(user),
      externalSwitch: job.externalSwitch,
      logoutInFlight: job.isLogoutInFlight(),
    });
    if (action === "not-ready") {
      job.fail(t("connect.notReady"));
      return "connect";
    }
    job.clearError();
    if (action === "otp") {
      // End the external attempt first. Connecting Privy here waits until
      // the embedded account is gone and then times out.
      const pending = job.takeArmedLogout();
      wantPrivy.current = false;
      if (job.externalSwitch) {
        job.cancel();
        void job.disconnect();
      }
      void privyOtpAfterLogout({
        pending,
        authenticated,
        logout: () => logout().then(() => undefined, () => undefined),
        login: () => {
          wantPrivy.current = true;
          login();
        },
        capMs: CONNECT_LOGOUT_RACE_MS,
        timers: browserTimers,
      });
      return "login";
    }
    if (action === "connect") {
      wantPrivy.current = false;
      job.requestConnect(PRIVY_WALLET_NAME);
      return "connect";
    }
    wantPrivy.current = false;
    // Authenticated, but the first create crashed or was skipped.
    // Close our list so Privy's create screen is the only dialog.
    void (async () => {
      const ok = await ensureRef.current(user);
      if (ok) requestRef.current(PRIVY_WALLET_NAME);
    })();
    return "login";
  }, [authenticated, job, login, logout, ready, t, user]);

  const armExternalLogout = useCallback((): OnceTask => {
    // Before connect, so a mount-time onComplete cannot select Privy again.
    wantPrivy.current = false;
    return createOnceTask(() => {
      const run = logout().then(() => undefined, () => undefined);
      job.noteLogout(run);
      job.holdThroughLogout(run);
      return capPromise(run, CONNECT_LOGOUT_RACE_MS, browserTimers);
    });
  }, [job, logout]);

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
    // Register before the adapter await so a Privy click in between opens OTP.
    let own: Promise<void> | null = null;
    if (!pendingSwitch && endPrivy) {
      own = logout().then(() => undefined, () => undefined);
      job.noteLogout(own);
    }
    try {
      await job.disconnect();
    } catch {
      /* adapter may already be disconnected */
    }
    const waiting = pendingSwitch ?? own;
    if (waiting) await capPromise(waiting, CONNECT_LOGOUT_RACE_MS, browserTimers);
  }, [authenticated, job, logout]);

  return (
    <ConnectUi
      job={job}
      privy={{
        ready,
        authenticated,
        onPick,
        onLogout,
        armExternalLogout,
      }}
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
      !job.staleHold &&
      ((job.connected && Boolean(job.publicKey)) || Boolean(job.pinnedAddress));
    if (!job.busy && settled && !job.error) setPickerOpen(false);
  }, [
    job.busy,
    job.connected,
    job.publicKey,
    job.pinnedAddress,
    job.dropped,
    job.staleHold,
    job.error,
  ]);

  const address = job.publicKey ? shortPk(job.publicKey) : "";
  // Waiting out the previous disconnect shows „Łączenie…”, not the dying
  // address and not „Zaloguj”. Rozłącz itself stays on „Zaloguj”.
  const settling = job.awaitingDisconnect || (job.staleHold && job.busy);
  const hiding = !settling && (job.dropped || job.staleHold);
  const shownConnected =
    !hiding &&
    !settling &&
    ((job.connected && Boolean(address)) || Boolean(job.pinnedAddress));
  const label = walletButtonLabel({
    dropped: hiding,
    busy: job.busy || settling,
    connected: job.connected && !hiding && !settling,
    address,
    pinnedAddress: hiding || settling ? null : job.pinnedAddress,
    connectingLabel: t("connect.busy"),
    selectLabel: t("nav.selectWallet"),
  });

  const dismissPicker = useCallback(() => {
    setPickerOpen(false);
    setMenuOpen(false);
    // Closing the list is not a logout. Cancelling an in-flight
    // Phantom/Solflare attempt is, and it logs out once.
    if (job.connecting || shownConnected) return;
    job.cancel(true);
  }, [job, shownConnected]);

  useEffect(() => {
    if (!pickerOpen && !menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      dismissPicker();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen, menuOpen, dismissPicker]);

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
    const endSession =
      privy != null &&
      armPrivyLogoutForChoice({
        nextName: name,
        activeName: job.wallet?.adapter.name,
        privyAuthenticated: privy.authenticated,
        privyName: PRIVY_WALLET_NAME,
        privyReady: privy.ready,
      });
    job.requestConnect(name, endSession ? privy.armExternalLogout() : undefined);
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
                        disabled={
                          !privy.ready ||
                          (job.connecting &&
                            job.target !== PHANTOM &&
                            job.target !== SOLFLARE)
                        }
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
