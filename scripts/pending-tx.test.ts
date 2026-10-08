import assert from "node:assert/strict";
import test from "node:test";
import {
  TransactionExpiredBlockheightExceededError,
  TransactionExpiredTimeoutError,
} from "@solana/web3.js";
import { autoToggleBlocked } from "../lib/auto-weekly-buy";
import {
  DUPLICATE_GUARD_KINDS,
  EXPIRY_TIME_FALLBACK_MS,
  PENDING_TX_MAX_AGE_MS,
  checkPendingOnce,
  decidePendingVerdict,
  expiryFromHeight,
  isBlockheightExpiredError,
  leaveDupCheck,
  nextDuplicateStep,
  pendingLockHeld,
  tryEnterDupCheck,
  visibleUnresolved,
  readPendingRecords,
  removePendingRecord,
  sameActionFamily,
  signatureStatusDeps,
  writePendingRecord,
  type PendingTxRecord,
  type StorageLike,
} from "../lib/pending-tx";
import { isUnconfirmedTimeout } from "../lib/vault-follow-up";

const OWNER = "Owner111111111111111111111111111111111111111";
const OTHER = "Other222222222222222222222222222222222222222";

function sig(n: number): string {
  return `${n}${"5".repeat(87)}`.slice(0, 88);
}

function rec(over: Partial<PendingTxRecord> = {}): PendingTxRecord {
  return {
    signature: sig(1),
    owner: OWNER,
    kind: "deposit",
    amountUsd: 10,
    createdAtMs: 1_000_000,
    expiryBlockHeight: 999,
    expiredAtError: false,
    ...over,
  };
}

function memStorage(): StorageLike & { dump(): Map<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    dump: () => map,
  };
}

test("an expired blockhash, an expiry error, and the 5 minute fallback are failed_expired", () => {
  assert.equal(
    decidePendingVerdict({
      status: null,
      currentBlockHeight: 1000,
      record: rec({ expiryBlockHeight: 999 }),
      nowMs: 1_000_000,
    }),
    "failed_expired",
  );
  assert.equal(
    decidePendingVerdict({
      status: null,
      currentBlockHeight: 1,
      record: rec({ expiredAtError: true, expiryBlockHeight: 9_999 }),
      nowMs: 1_000_000,
    }),
    "failed_expired",
  );
  assert.equal(
    decidePendingVerdict({
      status: null,
      currentBlockHeight: null,
      record: rec({
        expiryBlockHeight: null,
        createdAtMs: 0,
      }),
      nowMs: EXPIRY_TIME_FALLBACK_MS + 1,
    }),
    "failed_expired",
  );
  assert.equal(pendingLockHeld("failed_expired"), false);
});

test("a still-valid blockhash and an RPC outage stay unresolved and do not hold the lock", () => {
  assert.equal(
    decidePendingVerdict({
      status: null,
      currentBlockHeight: 900,
      record: rec({ expiryBlockHeight: 999 }),
      nowMs: 1_000_000,
    }),
    "unresolved",
  );
  assert.equal(
    decidePendingVerdict({
      status: "rpc_error",
      currentBlockHeight: 9_000,
      record: rec({ expiryBlockHeight: 1, expiredAtError: true }),
      nowMs: 9_000_000,
    }),
    "unresolved",
  );
  assert.equal(pendingLockHeld("unresolved"), false);
  assert.equal(pendingLockHeld("pending"), true);
});

test("checkPendingOnce reports confirmed, rejected, processed, and read failures", async () => {
  const base = rec();
  const now = () => 1_000_000;
  assert.equal(
    await checkPendingOnce(base, {
      getStatus: async () => ({ err: null, confirmationStatus: "confirmed" }),
      getBlockHeight: async () => 1,
      now,
    }),
    "confirmed",
  );
  assert.equal(
    await checkPendingOnce(base, {
      getStatus: async () => ({
        err: { InstructionError: [0, "Custom"] },
        confirmationStatus: "confirmed",
      }),
      getBlockHeight: async () => 1,
      now,
    }),
    "rejected",
  );
  assert.equal(
    await checkPendingOnce(base, {
      getStatus: async () => ({ err: null, confirmationStatus: "processed" }),
      getBlockHeight: async () => 1,
      now,
    }),
    "unresolved",
  );
  assert.equal(
    await checkPendingOnce(base, {
      getStatus: async () => {
        throw new Error("failed to fetch");
      },
      getBlockHeight: async () => 1,
      now,
    }),
    "unresolved",
  );
  assert.equal(
    await checkPendingOnce(rec({ createdAtMs: 1_000_000, expiryBlockHeight: 999 }), {
      getStatus: async () => null,
      getBlockHeight: async () => {
        throw new Error("no height");
      },
      now: () => 1_000_000,
    }),
    "unresolved",
  );
});

test("the hook status wrapper asks for searchTransactionHistory", async () => {
  let seen: { searchTransactionHistory?: boolean } | undefined;
  const connection = {
    async getSignatureStatuses(
      _sigs: string[],
      config?: { searchTransactionHistory?: boolean },
    ) {
      seen = config;
      return { value: [{ err: null, confirmationStatus: "confirmed" as const }] };
    },
    async getBlockHeight() {
      return 10;
    },
  };
  const verdict = await checkPendingOnce(rec(), signatureStatusDeps(connection));
  assert.equal(verdict, "confirmed");
  assert.deepEqual(seen, { searchTransactionHistory: true });
});

test("pending records survive a new session, then leave storage when the verdict is terminal", async () => {
  const storage = memStorage();
  const row = rec({ createdAtMs: 5_000 });
  writePendingRecord(storage, row);
  const loaded = readPendingRecords(storage, OWNER, 5_000);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].signature, row.signature);

  const confirmed = await checkPendingOnce(loaded[0], {
    getStatus: async () => ({ err: null, confirmationStatus: "finalized" }),
    getBlockHeight: async () => 1,
    now: () => 5_000,
  });
  assert.equal(confirmed, "confirmed");
  removePendingRecord(storage, OWNER, row.signature);
  assert.deepEqual(readPendingRecords(storage, OWNER, 5_000), []);

  writePendingRecord(storage, row);
  const expired = await checkPendingOnce(row, {
    getStatus: async () => null,
    getBlockHeight: async () => 2_000,
    now: () => 5_000,
  });
  assert.equal(expired, "failed_expired");
  removePendingRecord(storage, OWNER, row.signature);
  assert.deepEqual(readPendingRecords(storage, OWNER, 5_000), []);

  writePendingRecord(storage, row);
  assert.deepEqual(readPendingRecords(storage, OTHER, 5_000), []);
});

test("stale and corrupt pending records are dropped, and storage keeps five newest signatures", () => {
  const storage = memStorage();
  const fresh = rec({ signature: sig(9), createdAtMs: 10_000 });
  storage.setItem(
    `predca.pendingTx.v1.${OWNER}`,
    JSON.stringify([
      fresh,
      { nope: true },
      rec({ signature: sig(2), createdAtMs: 10_000 - PENDING_TX_MAX_AGE_MS - 1 }),
      "bad",
    ]),
  );
  const kept = readPendingRecords(storage, OWNER, 10_000);
  assert.deepEqual(kept.map((row) => row.signature), [fresh.signature]);

  storage.setItem(`predca.pendingTx.v1.${OWNER}`, "{not json");
  assert.deepEqual(readPendingRecords(storage, OWNER, 10_000), []);

  for (let i = 0; i < 6; i++) {
    writePendingRecord(
      storage,
      rec({ signature: sig(i), createdAtMs: 1_000 + i, amountUsd: i }),
    );
  }
  writePendingRecord(
    storage,
    rec({ signature: sig(3), createdAtMs: 1_003, amountUsd: 33 }),
  );
  const rows = readPendingRecords(storage, OWNER, 2_000);
  assert.equal(rows.length, 5);
  assert.equal(rows.some((row) => row.signature === sig(0)), false);
  assert.equal(rows.find((row) => row.signature === sig(3))?.amountUsd, 33);
  assert.deepEqual(
    rows.map((row) => row.createdAtMs),
    [1005, 1004, 1003, 1002, 1001],
  );
});

test("duplicate sends recheck, then warn, and budget is not in the guard", () => {
  assert.equal(
    nextDuplicateStep({
      unresolvedSameFamily: false,
      recheckedVerdict: null,
      acknowledged: false,
    }),
    "proceed",
  );
  assert.equal(
    nextDuplicateStep({
      unresolvedSameFamily: true,
      recheckedVerdict: null,
      acknowledged: false,
    }),
    "recheck",
  );
  assert.equal(
    nextDuplicateStep({
      unresolvedSameFamily: true,
      recheckedVerdict: "unresolved",
      acknowledged: false,
    }),
    "warn",
  );
  assert.equal(
    nextDuplicateStep({
      unresolvedSameFamily: true,
      recheckedVerdict: "unresolved",
      acknowledged: true,
    }),
    "proceed",
  );
  assert.equal(
    nextDuplicateStep({
      unresolvedSameFamily: true,
      recheckedVerdict: "failed_expired",
      acknowledged: false,
    }),
    "proceed",
  );
  assert.equal(sameActionFamily("deposit", "init_deposit"), true);
  assert.equal(sameActionFamily("deposit", "withdraw"), false);
  assert.equal(DUPLICATE_GUARD_KINDS.has("budget"), false);
});

test("block-height expiry is not a confirm timeout, and both still count as unconfirmed when signed", () => {
  const signature = sig(4);
  const height = new TransactionExpiredBlockheightExceededError(signature);
  const timeout = new TransactionExpiredTimeoutError(signature, 30);
  assert.equal(isBlockheightExpiredError(height), true);
  assert.equal(isBlockheightExpiredError(timeout), false);
  assert.deepEqual(isUnconfirmedTimeout(height), { signature });
  assert.deepEqual(isUnconfirmedTimeout(timeout), { signature });
});

test("expiryFromHeight adds the validity window and the margin", () => {
  assert.equal(expiryFromHeight(1000), 1160);
});

test("auto-buy Off stays clickable while a transaction is pending", () => {
  assert.equal(autoToggleBlocked(false, true), false);
  assert.equal(autoToggleBlocked(true, true), true);
  assert.equal(autoToggleBlocked(true, false), false);
});

test("visibleUnresolved hides signatures that are still being checked", () => {
  const a = rec({ signature: sig(1) });
  const b = rec({ signature: sig(2) });
  assert.deepEqual(visibleUnresolved([a, b], new Set([a.signature])), [b]);
  assert.deepEqual(visibleUnresolved([a, b], new Set()), [a, b]);
  assert.deepEqual(
    visibleUnresolved([a, b], new Set([a.signature, b.signature])),
    [],
  );
});

test("tryEnterDupCheck lets the first click in and blocks the next until leave", () => {
  const gate = { current: false };
  assert.equal(tryEnterDupCheck(gate), true);
  assert.equal(gate.current, true);
  assert.equal(tryEnterDupCheck(gate), false);
  leaveDupCheck(gate);
  assert.equal(gate.current, false);
  assert.equal(tryEnterDupCheck(gate), true);
});
