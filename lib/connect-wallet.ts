/**
 * Steps for switching the Solana wallet adapter without a reload.
 *
 * `select()` disconnects the current adapter and does not wait. That adapter's
 * `disconnect` event can land after the new name is stored and wipe it, so
 * Privy (or Solflare) never becomes active until a full reload.
 *
 * Callers must:
 * 1. `disconnect()` and stay on "wait" until the previous name is gone,
 * 2. `select(target)` only once that listener is gone,
 * 3. `connect()` only after the selected adapter name matches the target.
 * `autoConnect` stays false — this helper never connects by itself.
 */
export type ConnectPhase = "disconnect" | "select" | "connect";
export type ConnectStep = "wait" | "select" | "connect" | "done";

export function nextConnectStep(input: {
  phase: ConnectPhase;
  target: string;
  selectedName: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  /** Target name is present in the adapter list (Wallet Standard included). */
  targetReady: boolean;
}): ConnectStep {
  const selected = input.selectedName === input.target;
  if (selected && input.connected) return "done";

  if (input.phase === "disconnect") {
    const otherStillSelected =
      input.connected || (input.selectedName != null && !selected);
    if (otherStillSelected || input.disconnecting) return "wait";
  }

  if (input.disconnecting || (input.connected && !selected)) return "wait";
  if (!selected) return input.targetReady ? "select" : "wait";
  if (input.connecting) return "wait";
  return "connect";
}
