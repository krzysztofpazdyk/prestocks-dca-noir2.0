export type PendingTxKind = "deposit" | "init_deposit" | "withdraw" | "budget" | "buy";

export type PendingTxRecord = {
  signature: string;
  owner: string;
  kind: PendingTxKind;
  amountUsd: number | null;
  createdAtMs: number;
  /** Upper bound of lastValidBlockHeight; null when the height was unknown. */
  expiryBlockHeight: number | null;
  /** True when web3 threw TransactionExpiredBlockheightExceededError / "block height exceeded". */
  expiredAtError: boolean;
};

export type PendingVerdict = "confirmed" | "rejected" | "failed_expired" | "unresolved";

export const BLOCKHASH_VALID_BLOCKS = 150;
export const EXPIRY_MARGIN_BLOCKS = 10;
/** Used only when the block height at timeout is unknown. */
export const EXPIRY_TIME_FALLBACK_MS = 5 * 60_000;
export const UNRESOLVED_POLL_MS = 10_000;
export const UNRESOLVED_POLL_MAX_MS = 3 * 60_000;
export const PENDING_TX_LS_PREFIX = "predca.pendingTx.v1.";
export const PENDING_TX_MAX_AGE_MS = 24 * 60 * 60_000;
export const PENDING_TX_MAX_RECORDS = 5;

export const FAILED_EXPIRED_MSG =
  "Transakcja nie dotarła do sieci (blockhash wygasł) — możesz spróbować ponownie.";
export const UNRESOLVED_MSG =
  "Transakcja niepotwierdzona — sprawdź w explorerze. Nie wysyłaj tej samej operacji, dopóki status się nie wyjaśni.";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type SignatureSnapshot = {
  err: unknown;
  confirmationStatus?: string | null;
};

const KINDS: ReadonlySet<string> = new Set([
  "deposit",
  "init_deposit",
  "withdraw",
  "budget",
  "buy",
]);

export function expiryFromHeight(heightAtTimeout: number): number {
  return heightAtTimeout + BLOCKHASH_VALID_BLOCKS + EXPIRY_MARGIN_BLOCKS;
}

function errorName(err: unknown): string {
  if (err instanceof Error) return err.name;
  if (err && typeof err === "object" && "name" in err) {
    const name = (err as { name?: unknown }).name;
    if (typeof name === "string") return name;
  }
  return "";
}

function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

export function isBlockheightExpiredError(err: unknown): boolean {
  if (errorName(err) === "TransactionExpiredBlockheightExceededError") return true;
  return /block height exceeded/i.test(`${errorMessage(err)}\n${String(err)}`);
}

export function decidePendingVerdict(i: {
  status: SignatureSnapshot | null | "rpc_error";
  currentBlockHeight: number | null;
  record: PendingTxRecord;
  nowMs: number;
}): PendingVerdict {
  if (i.status === "rpc_error") return "unresolved";
  if (i.status && i.status.err) return "rejected";
  const confirmation = i.status?.confirmationStatus ?? null;
  if (confirmation === "confirmed" || confirmation === "finalized") return "confirmed";
  if (confirmation === "processed") return "unresolved";
  const heightExpired =
    i.currentBlockHeight != null &&
    i.record.expiryBlockHeight != null &&
    i.currentBlockHeight > i.record.expiryBlockHeight;
  const timeExpired =
    i.record.expiryBlockHeight == null &&
    i.nowMs - i.record.createdAtMs > EXPIRY_TIME_FALLBACK_MS;
  if (i.status == null && (i.record.expiredAtError || heightExpired || timeExpired)) {
    return "failed_expired";
  }
  return "unresolved";
}

export async function checkPendingOnce(
  record: PendingTxRecord,
  deps: {
    getStatus(sig: string): Promise<SignatureSnapshot | null>;
    getBlockHeight(): Promise<number>;
    now(): number;
  },
): Promise<PendingVerdict> {
  let status: SignatureSnapshot | null | "rpc_error";
  try {
    status = await deps.getStatus(record.signature);
  } catch {
    status = "rpc_error";
  }
  let currentBlockHeight: number | null = null;
  try {
    currentBlockHeight = await deps.getBlockHeight();
  } catch {
    currentBlockHeight = null;
  }
  return decidePendingVerdict({
    status,
    currentBlockHeight,
    record,
    nowMs: deps.now(),
  });
}

type StatusConnection = {
  getSignatureStatuses(
    signatures: string[],
    config?: { searchTransactionHistory?: boolean },
  ): Promise<{ value: ReadonlyArray<SignatureSnapshot | null> }>;
  getBlockHeight(commitment?: "processed" | "confirmed" | "finalized"): Promise<number>;
};

/** Wrapper the hook uses. Asks RPC for history, not only the recent status cache. */
export function signatureStatusDeps(connection: StatusConnection): {
  getStatus(sig: string): Promise<SignatureSnapshot | null>;
  getBlockHeight(): Promise<number>;
  now(): number;
} {
  return {
    async getStatus(sig: string) {
      const { value } = await connection.getSignatureStatuses([sig], {
        searchTransactionHistory: true,
      });
      return value[0] ?? null;
    },
    getBlockHeight: () => connection.getBlockHeight("confirmed"),
    now: () => Date.now(),
  };
}

function storageKey(owner: string): string {
  return `${PENDING_TX_LS_PREFIX}${owner}`;
}

function isPendingRecord(value: unknown): value is PendingTxRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as PendingTxRecord;
  if (typeof row.signature !== "string" || row.signature.length < 80) return false;
  if (typeof row.owner !== "string" || row.owner.length === 0) return false;
  if (typeof row.kind !== "string" || !KINDS.has(row.kind)) return false;
  if (row.amountUsd != null && typeof row.amountUsd !== "number") return false;
  if (typeof row.createdAtMs !== "number" || !Number.isFinite(row.createdAtMs)) return false;
  if (row.expiryBlockHeight != null && typeof row.expiryBlockHeight !== "number") return false;
  if (typeof row.expiredAtError !== "boolean") return false;
  return true;
}

function loadRecords(storage: StorageLike, owner: string): PendingTxRecord[] {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey(owner));
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: PendingTxRecord[] = [];
  for (const item of parsed) {
    if (!isPendingRecord(item) || item.owner !== owner) continue;
    out.push(item);
  }
  return out;
}

export function readPendingRecords(
  storage: StorageLike,
  owner: string,
  nowMs: number,
): PendingTxRecord[] {
  return loadRecords(storage, owner)
    .filter((rec) => nowMs - rec.createdAtMs <= PENDING_TX_MAX_AGE_MS)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function writePendingRecord(storage: StorageLike, rec: PendingTxRecord): void {
  const existing = loadRecords(storage, rec.owner).filter(
    (row) => row.signature !== rec.signature,
  );
  const next = [rec, ...existing]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, PENDING_TX_MAX_RECORDS);
  storage.setItem(storageKey(rec.owner), JSON.stringify(next));
}

export function removePendingRecord(
  storage: StorageLike,
  owner: string,
  signature: string,
): void {
  const next = loadRecords(storage, owner).filter((row) => row.signature !== signature);
  if (next.length === 0) {
    storage.removeItem(storageKey(owner));
    return;
  }
  storage.setItem(storageKey(owner), JSON.stringify(next));
}

export const DUPLICATE_GUARD_KINDS: ReadonlySet<PendingTxKind> = new Set([
  "deposit",
  "init_deposit",
  "withdraw",
  "buy",
]);

export function sameActionFamily(a: PendingTxKind, b: PendingTxKind): boolean {
  if (a === b) return true;
  const depositish = (kind: PendingTxKind) => kind === "deposit" || kind === "init_deposit";
  return depositish(a) && depositish(b);
}

export type DuplicateStep = "proceed" | "recheck" | "warn";

export function nextDuplicateStep(i: {
  unresolvedSameFamily: boolean;
  recheckedVerdict: PendingVerdict | null;
  acknowledged: boolean;
}): DuplicateStep {
  if (!i.unresolvedSameFamily) return "proceed";
  if (i.acknowledged) return "proceed";
  if (i.recheckedVerdict == null) return "recheck";
  if (i.recheckedVerdict === "unresolved") return "warn";
  return "proceed";
}

/** The global lock is only the in-window pending phase. */
export function pendingLockHeld(verdict: PendingVerdict | "pending"): boolean {
  return verdict === "pending";
}
