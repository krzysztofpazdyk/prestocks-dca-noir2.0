/**
 * Steps for switching the Solana wallet adapter without a reload.
 *
 * `select()` disconnects the current adapter and does not wait. That adapter's
 * `disconnect` event can land after the new name is stored and wipe it, so
 * Privy (or Solflare) never becomes active until a full reload.
 *
 * Wallet-adapter can also leave `disconnect()` pending after the session is
 * already gone. Callers must not treat that flag as "still connected" — that
 * is the v4.10 hang on "Łączenie…" / "Connecting…".
 *
 * Callers must:
 * 1. disconnect the other adapter, then `select(null)` if its name remains,
 * 2. `select(target)` only once the previous name is gone and the target is ready,
 * 3. `connect()` only after the selected name matches the target.
 * If a late disconnect wipes the new name while this loop is watching, select
 * the target again. Privy `logout()` runs only after that connect has settled
 * (`afterConnected`), and only when a Privy session may exist. A logout that
 * finishes after the loop stops must not disconnect an external wallet that
 * is still live — callers restore the name instead of treating it as Rozłącz.
 * Once the target adapter itself drops (extension lock or disconnect), stop.
 * Do not reconnect it. `autoConnect` stays false.
 */

/** Cap a post-connect Privy logout so a hung session cannot hold "Łączenie…". */
export const CONNECT_LOGOUT_RACE_MS = 3_000;
export type ConnectPhase = "disconnect" | "select" | "connect";
export type ConnectStep = "wait" | "clear" | "select" | "connect" | "done";

/** No pubkey yet, and no wallet prompt is open. */
export const CONNECT_STALL_MS = 20_000;
/** User is in a wallet approval prompt. Longer than the stall, still finite. */
export const CONNECT_PROMPT_MS = 90_000;

export class ConnectTimeoutError extends Error {
  constructor() {
    super("connect-timeout");
    this.name = "ConnectTimeoutError";
  }
}

export function nextConnectStep(input: {
  phase: ConnectPhase;
  target: string;
  selectedName: string | null;
  connected: boolean;
  connecting: boolean;
  /**
   * Kept so callers can pass the adapter flag. Ignored once `connected` is
   * false: a stuck disconnect promise must not block the next wallet.
   */
  disconnecting: boolean;
  /** Target name is present and, for an embedded wallet, has an account. */
  targetReady: boolean;
  /**
   * Rozłącz, then the same wallet again, while the old session is still
   * marked connected. Do not treat that as already done.
   */
  forceFresh?: boolean;
}): ConnectStep {
  if (input.forceFresh) {
    if (input.connected) return "wait";
    if (input.selectedName != null) return "clear";
  }
  const selected = input.selectedName === input.target;
  if (selected && input.connected) return "done";

  // Still on another session. Stay here until that session drops, in every phase.
  if (input.connected && !selected) return "wait";

  // Session is gone but the previous name is still selected — including when
  // `disconnecting` is stuck true. Clear it before choosing the target.
  if (!selected && input.selectedName != null) return "clear";

  if (!selected) return input.targetReady ? "select" : "wait";
  // Name matches, but an embedded wallet may still have no account.
  // standard `connect()` would return immediately and throw.
  if (!input.targetReady) return "wait";
  if (input.connecting) return "wait";
  return "connect";
}

/**
 * Disconnect (`nextName == null`) ends a Privy session that is still open.
 * Picking Privy does not. Phantom and Solflare end it only when a session
 * may exist (`authenticated` or the Privy adapter is active). No second
 * logout button.
 */
export function shouldEndPrivySession(input: {
  /** null = Disconnect. Otherwise the wallet the user just picked. */
  nextName: string | null;
  activeName: string | undefined;
  privyAuthenticated: boolean;
  privyName?: string;
}): boolean {
  const privyName = input.privyName ?? "Privy";
  const privyActive = input.activeName === privyName;
  const hasSession = input.privyAuthenticated || privyActive;
  if (!hasSession) return false;
  if (input.nextName == null) return true;
  return input.nextName === "Phantom" || input.nextName === "Solflare";
}

/**
 * Phantom and Solflare are the clicks that can end Privy.
 * Picking Privy, or dismissing the picker (`null`), does not.
 * A session must still exist — {@link armPrivyLogoutForChoice}.
 */
export function externalWalletChoiceEndsPrivy(name: string | null): boolean {
  return name === "Phantom" || name === "Solflare";
}

/** Logout only when this click is external and a Privy session may exist. */
export function armPrivyLogoutForChoice(input: {
  nextName: string | null;
  activeName: string | undefined;
  privyAuthenticated: boolean;
  privyName?: string;
}): boolean {
  if (!externalWalletChoiceEndsPrivy(input.nextName)) return false;
  return shouldEndPrivySession({
    nextName: input.nextName,
    activeName: input.activeName,
    privyAuthenticated: input.privyAuthenticated,
    privyName: input.privyName,
  });
}

export type PrivyPickAction = "not-ready" | "otp" | "connect" | "create";

/**
 * During an external switch, Privy must open login (OTP). Connecting the
 * embedded adapter waits out the stall timer: logout removes the account
 * `connect()` can see. A settled session with an embedded wallet still connects.
 */
export function decidePrivyPick(input: {
  ready: boolean;
  authenticated: boolean;
  hasEmbeddedWallet: boolean;
  externalSwitch: boolean;
}): PrivyPickAction {
  if (!input.ready) return "not-ready";
  if (input.externalSwitch || !input.authenticated) return "otp";
  if (input.hasEmbeddedWallet) return "connect";
  return "create";
}

/**
 * Remembered header address. It lives only while the switch job is running
 * and the target adapter still has a key. Rozłącz, an extension lock, and a
 * finished job all drop it so the live wallet (or „Zaloguj”) shows through.
 */
export function nextPinnedAddress(input: {
  dropped: boolean;
  jobActive: boolean;
  adapterLive: boolean;
  liveAddress: string | null;
  currentPin: string | null;
}): string | null {
  if (input.dropped || !input.jobActive || !input.adapterLive) return null;
  if (input.liveAddress) return input.liveAddress;
  return input.currentPin;
}

/**
 * Privy logout can clear the selected name after Phantom or Solflare has
 * settled, without disconnecting that adapter. Put the name back.
 * An extension lock clears the adapter key — leave it. Rozłącz and a newer
 * wallet choice are not restored.
 */
export function shouldRestoreExternalWallet(input: {
  target: string | null;
  dropped: boolean;
  guarding: boolean;
  superseded: boolean;
  selectedName: string | null;
  hookConnected: boolean;
  adapterConnected: boolean;
  adapterHasKey: boolean;
}): boolean {
  if (!input.guarding || input.dropped || input.superseded || !input.target) {
    return false;
  }
  if (!input.adapterConnected || !input.adapterHasKey) return false;
  if (input.selectedName !== input.target) return true;
  return !input.hookConnected;
}

/**
 * `connect()` on an already-connected Phantom returns without emitting.
 * Re-emitting lets the provider pick the key back up after a logout wipe.
 */
export function replayLiveConnect(
  adapter: {
    name: string;
    connected: boolean;
    publicKey: unknown;
  } | null
    | undefined,
  target: string,
): boolean {
  if (!adapter || adapter.name !== target) return false;
  if (!adapter.connected || adapter.publicKey == null) return false;
  const emit = (
    adapter as { emit?: (event: "connect", publicKey: unknown) => void }
  ).emit;
  emit?.("connect", adapter.publicKey);
  return true;
}

/** Header label. A shown or pinned address beats the connecting text. */
export function walletButtonLabel(input: {
  dropped: boolean;
  busy: boolean;
  connected: boolean;
  address: string;
  pinnedAddress: string | null;
  connectingLabel: string;
  selectLabel: string;
}): string {
  if (input.dropped) return input.selectLabel;
  if (input.connected && input.address) return input.address;
  if (input.pinnedAddress) return input.pinnedAddress;
  if (input.busy) return input.connectingLabel;
  return input.selectLabel;
}

/**
 * One Privy logout for a single Phantom/Solflare click.
 * Success, rejection, timeout, and cancel all call {@link OnceTask.start}.
 */
export type OnceTask = {
  start: () => Promise<void>;
  hasStarted: () => boolean;
};

export function createOnceTask(run: () => Promise<void> | void): OnceTask {
  let started = false;
  let pending: Promise<void> | null = null;
  return {
    hasStarted: () => started,
    start: () => {
      if (!pending) {
        started = true;
        pending = Promise.resolve()
          .then(() => run())
          .then(() => undefined)
          .catch(() => undefined);
      }
      return pending;
    },
  };
}

/** Privy's standard `connect()` only returns accounts it already has. */
export function adapterHasAccount(adapter: unknown): boolean {
  if (!adapter || typeof adapter !== "object" || !("wallet" in adapter)) {
    return false;
  }
  const wallet = (adapter as { wallet?: { accounts?: ReadonlyArray<{ address?: string }> } })
    .wallet;
  const accounts = wallet?.accounts;
  if (!accounts || accounts.length === 0) return false;
  return accounts.some((account) => (account.address ?? "").length > 0);
}

export type ConnectRuntime = {
  target: string;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  isCancelled: () => boolean;
  getState: () => {
    selectedName: string | null;
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
    targetReady: boolean;
  };
  /**
   * Disconnect the current adapter. Must resolve even if the wallet promise hangs.
   * `force` disconnects the target itself (Rozłącz, then the same wallet).
   */
  disconnectAdapter: (force?: boolean) => Promise<void>;
  select: (name: string | null) => void;
  connect: () => Promise<void>;
  /**
   * Same wallet was optimistically disconnected and may still look connected.
   * Wait until that session is gone before accepting "done".
   */
  forceFresh?: boolean;
  /**
   * After the target has connected once: false means the adapter itself
   * dropped (extension lock). The loop stops instead of prompting again.
   * Omit to keep repairing until the stall timer.
   */
  adapterStillLive?: () => boolean;
  /**
   * Once, after `target` is connected. The header already shows that address.
   * Privy `logout()` belongs here so it does not run before the switch settles.
   * A throw is ignored. A wipe here is repaired; the hook does not run again.
   * Rejection, timeout, and cancel do not reach this hook — the caller logs
   * out on those paths with the same {@link OnceTask}.
   */
  afterConnected?: () => Promise<void>;
};

/**
 * Disconnect → clear leftover name → select target → connect.
 * Retries a wiped selection. Throws {@link ConnectTimeoutError} instead of spinning.
 * A `connect()` rejection (user rejected, wallet missing) is rethrown as-is.
 * A `connect()` promise that never settles is the caller's watchdog problem.
 */
export async function runConnectJob(rt: ConnectRuntime): Promise<void> {
  const started = rt.now();
  let phase: ConnectPhase = "disconnect";
  let promptedAt: number | null = null;
  let ranAfterConnected = false;
  let awaitDrop = rt.forceFresh === true;
  let settledOnce = false;

  while (!rt.isCancelled()) {
    const state = rt.getState();
    if (awaitDrop && !state.connected && state.selectedName == null) {
      awaitDrop = false;
    }
    if (state.connected && state.selectedName === rt.target) settledOnce = true;
    // The target was up, then the adapter itself dropped (extension lock).
    // A logout that only clears the selected name leaves the adapter live
    // and still gets repaired below.
    if (
      !rt.forceFresh &&
      settledOnce &&
      !state.connected &&
      rt.adapterStillLive &&
      !rt.adapterStillLive()
    ) {
      return;
    }
    const step = nextConnectStep({
      phase,
      target: rt.target,
      selectedName: state.selectedName,
      connected: state.connected,
      connecting: state.connecting,
      disconnecting: state.disconnecting,
      targetReady: state.targetReady,
      forceFresh: awaitDrop,
    });
    if (step === "done") {
      if (!ranAfterConnected && rt.afterConnected) {
        ranAfterConnected = true;
        try {
          await rt.afterConnected();
        } catch {
          // The new wallet is already connected. Logout must not fail the switch.
        }
        if (rt.isCancelled()) return;
        // A disconnect event can land just after logout resolves.
        await rt.sleep(200);
        continue;
      }
      return;
    }

    const now = rt.now();
    const limit =
      promptedAt == null ? started + CONNECT_STALL_MS : promptedAt + CONNECT_PROMPT_MS;
    if (now > limit) throw new ConnectTimeoutError();

    if (step === "wait") {
      if (state.connected && (awaitDrop || state.selectedName !== rt.target)) {
        phase = "disconnect";
        await rt.disconnectAdapter(awaitDrop);
      } else if (state.connecting) {
        if (promptedAt == null) promptedAt = rt.now();
      }
      if (rt.isCancelled()) return;
      await rt.sleep(100);
      continue;
    }

    if (step === "clear") {
      phase = "disconnect";
      rt.select(null);
      if (rt.isCancelled()) return;
      await rt.sleep(50);
      continue;
    }

    if (step === "select") {
      phase = "select";
      rt.select(rt.target);
      if (rt.isCancelled()) return;
      await rt.sleep(50);
      continue;
    }

    phase = "connect";
    try {
      await rt.connect();
    } catch (error) {
      if (rt.isCancelled()) return;
      // The first connect's rejection is the user's. After logout, a wipe
      // can make the repair connect throw; keep trying until the stall timer.
      if (ranAfterConnected) {
        await rt.sleep(50);
        continue;
      }
      throw error;
    }
    if (rt.isCancelled()) return;
    await rt.sleep(200);
  }
}
