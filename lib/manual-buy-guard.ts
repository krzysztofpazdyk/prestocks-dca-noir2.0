import { RUN_INDEX_TAKEN_MSG } from "./predca";

/** Shown when this tab already submitted the colliding RunRecord index. */
export const BUY_ALREADY_IN_FLIGHT_MSG = "Zakup już w toku.";

/** Mutable flag. A ref `{ current: boolean }` satisfies this. */
export type ManualBuyGate = { current: boolean };

/**
 * Synchronous Manual Buy gate. React `txPending` flips only after await,
 * so a second click must be rejected before the first paint.
 * Returns false when a buy is already held or another tx is pending.
 */
export function tryEnterManualBuy(gate: ManualBuyGate, txPending: boolean): boolean {
  if (gate.current || txPending) return false;
  gate.current = true;
  return true;
}

export function leaveManualBuy(gate: ManualBuyGate): void {
  gate.current = false;
}

/** How many times this tab has submitted `index`. Call before `submitOnce`. */
export function noteRunSubmit(counts: Map<number, number>, index: number): number {
  const next = (counts.get(index) ?? 0) + 1;
  counts.set(index, next);
  return next;
}

export type CollisionRetry =
  | { kind: "stop"; message: string }
  | { kind: "retry"; index: number };

/**
 * One retry only, and only when this tab did not already submit `failedIndex`.
 * Count 1 is a keeper (or other) collision: take the next free index.
 * Count > 1 means a sibling click or this tab already sent that index:
 * do not buy the following index.
 */
export function decideCollisionRetry(args: {
  failedIndex: number;
  retryIndex: number | null;
  submitCountForFailed: number;
}): CollisionRetry {
  if (args.submitCountForFailed > 1) {
    return { kind: "stop", message: BUY_ALREADY_IN_FLIGHT_MSG };
  }
  if (args.retryIndex == null || args.retryIndex === args.failedIndex) {
    return { kind: "stop", message: RUN_INDEX_TAKEN_MSG };
  }
  return { kind: "retry", index: args.retryIndex };
}

/**
 * After RunAlreadyExists on `failedIndex`: maybe submit the next free index once.
 * Does not call `submitOnce` when the decision is stop.
 */
export async function recoverRunCollision(args: {
  failedIndex: number;
  counts: ReadonlyMap<number, number>;
  findNextIndex: () => Promise<number | null>;
  submitOnce: (index: number) => Promise<string>;
}): Promise<string> {
  const retryIndex = await args.findNextIndex();
  const decision = decideCollisionRetry({
    failedIndex: args.failedIndex,
    retryIndex,
    submitCountForFailed: args.counts.get(args.failedIndex) ?? 0,
  });
  if (decision.kind === "stop") throw new Error(decision.message);
  return args.submitOnce(decision.index);
}
