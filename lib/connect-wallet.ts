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
 * If a late disconnect wipes the new name, select the target again.
 * `autoConnect` stays false — this helper never connects by itself.
 */
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
}): ConnectStep {
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
  /** Disconnect the current adapter. Must resolve even if the wallet promise hangs. */
  disconnectAdapter: () => Promise<void>;
  select: (name: string | null) => void;
  connect: () => Promise<void>;
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

  while (!rt.isCancelled()) {
    const state = rt.getState();
    const step = nextConnectStep({
      phase,
      target: rt.target,
      selectedName: state.selectedName,
      connected: state.connected,
      connecting: state.connecting,
      disconnecting: state.disconnecting,
      targetReady: state.targetReady,
    });
    if (step === "done") return;

    const now = rt.now();
    const limit =
      promptedAt == null ? started + CONNECT_STALL_MS : promptedAt + CONNECT_PROMPT_MS;
    if (now > limit) throw new ConnectTimeoutError();

    if (step === "wait") {
      if (state.connected && state.selectedName !== rt.target) {
        phase = "disconnect";
        await rt.disconnectAdapter();
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
      throw error;
    }
    if (rt.isCancelled()) return;
    await rt.sleep(200);
  }
}
