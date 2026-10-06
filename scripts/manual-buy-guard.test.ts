import assert from "node:assert/strict";
import test from "node:test";
import { RUN_INDEX_TAKEN_MSG } from "../lib/predca";
import {
  BUY_ALREADY_IN_FLIGHT_MSG,
  leaveManualBuy,
  noteUnconfirmedRunIndex,
  recoverRunCollision,
  shouldRetryRunIndex,
  tryEnterManualBuy,
  type ManualBuyGate,
} from "../lib/manual-buy-guard";

/** Same gate OverviewView.handlePurchase uses around simulateBuy. */
async function handlePurchase(
  gate: ManualBuyGate,
  txPending: boolean,
  simulateBuy: () => Promise<string>,
): Promise<string> {
  if (!tryEnterManualBuy(gate, txPending)) return "blocked";
  try {
    return await simulateBuy();
  } finally {
    leaveManualBuy(gate);
  }
}

test("two parallel handlePurchase calls submit simulateBuy once", async () => {
  const gate: ManualBuyGate = { current: false };
  let submits = 0;
  let release!: () => void;
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });

  const simulateBuy = async () => {
    submits += 1;
    await hold;
    return "sig";
  };

  const first = handlePurchase(gate, false, simulateBuy);
  const second = handlePurchase(gate, false, simulateBuy);
  assert.equal(submits, 1);
  assert.equal(gate.current, true);
  release();
  const results = await Promise.all([first, second]);
  assert.deepEqual(results.slice().sort(), ["blocked", "sig"]);
  assert.equal(submits, 1);
  assert.equal(gate.current, false);
});

test("a click during setWeeklyBudget does not start a second buy", async () => {
  const gate: ManualBuyGate = { current: false };
  let submits = 0;
  let releaseBudget!: () => void;
  const budgetHold = new Promise<void>((resolve) => {
    releaseBudget = resolve;
  });

  const first = handlePurchase(gate, false, async () => {
    await budgetHold;
    submits += 1;
    return "sig";
  });
  const second = handlePurchase(gate, false, async () => {
    submits += 1;
    return "sig-2";
  });
  assert.equal(submits, 0);
  releaseBudget();
  const results = await Promise.all([first, second]);
  assert.deepEqual(results.slice().sort(), ["blocked", "sig"]);
  assert.equal(submits, 1);
});

test("txPending blocks entry and does not stick the gate", async () => {
  const gate: ManualBuyGate = { current: false };
  const result = await handlePurchase(gate, true, async () => "sig");
  assert.equal(result, "blocked");
  assert.equal(gate.current, false);
});

test("a later single purchase can enter after the gate is released", async () => {
  const gate: ManualBuyGate = { current: false };
  assert.equal(await handlePurchase(gate, false, async () => "a"), "a");
  assert.equal(await handlePurchase(gate, false, async () => "b"), "b");
  assert.equal(gate.current, false);
});

test("collision on an index this card created does not submit the next one", async () => {
  const createdRunIndices = new Set<number>([4]);
  assert.equal(shouldRetryRunIndex(createdRunIndices, 4), false);
  const submitted: number[] = [];
  await assert.rejects(
    () =>
      recoverRunCollision({
        failedIndex: 4,
        createdRunIndices,
        findNextIndex: async () => 5,
        submitOnce: async (index) => {
          submitted.push(index);
          return "sig";
        },
      }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, BUY_ALREADY_IN_FLIGHT_MSG);
      return true;
    },
  );
  assert.deepEqual(submitted, []);
});

test("a keeper collision retries once and then that index is ours", async () => {
  const createdRunIndices = new Set<number>();
  assert.equal(shouldRetryRunIndex(createdRunIndices, 4), true);
  const submitted: number[] = [];
  const sig = await recoverRunCollision({
    failedIndex: 4,
    createdRunIndices,
    findNextIndex: async () => 5,
    submitOnce: async (index) => {
      submitted.push(index);
      createdRunIndices.add(index);
      return "sig";
    },
  });
  assert.equal(sig, "sig");
  assert.deepEqual(submitted, [5]);
  assert.equal(shouldRetryRunIndex(createdRunIndices, 5), false);

  const again: number[] = [];
  await assert.rejects(
    () =>
      recoverRunCollision({
        failedIndex: 5,
        createdRunIndices,
        findNextIndex: async () => 6,
        submitOnce: async (index) => {
          again.push(index);
          return "sig-2";
        },
      }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, BUY_ALREADY_IN_FLIGHT_MSG);
      return true;
    },
  );
  assert.deepEqual(again, []);
});

test("missing or same retry index stops without another submit", async () => {
  for (const retryIndex of [null, 4] as const) {
    const createdRunIndices = new Set<number>();
    assert.equal(shouldRetryRunIndex(createdRunIndices, 4), true);
    const submitted: number[] = [];
    await assert.rejects(
      () =>
        recoverRunCollision({
          failedIndex: 4,
          createdRunIndices,
          findNextIndex: async () => retryIndex,
          submitOnce: async (index) => {
            submitted.push(index);
            return "sig";
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, RUN_INDEX_TAKEN_MSG);
        return true;
      },
    );
    assert.deepEqual(submitted, []);
  }
});

test("a Kup confirm timeout records the index and does not buy the next one", async () => {
  const created = new Set<number>();
  const err = new Error("Transaction was not confirmed in 30.00 seconds.");
  err.name = "TransactionExpiredTimeoutError";
  (err as Error & { signature: string }).signature = "5".repeat(88);
  noteUnconfirmedRunIndex(created, 7, err);
  assert.equal(created.has(7), true);
  assert.equal(shouldRetryRunIndex(created, 7), false);
  const submitted: number[] = [];
  await assert.rejects(
    () =>
      recoverRunCollision({
        failedIndex: 7,
        createdRunIndices: created,
        findNextIndex: async () => 8,
        submitOnce: async (index) => {
          submitted.push(index);
          return "sig";
        },
      }),
    (caught: unknown) => {
      assert.ok(caught instanceof Error);
      assert.equal(caught.message, BUY_ALREADY_IN_FLIGHT_MSG);
      return true;
    },
  );
  assert.deepEqual(submitted, []);
});

test("a non-timeout buy error does not record the run index", () => {
  const created = new Set<number>();
  noteUnconfirmedRunIndex(created, 7, new Error("User rejected the request."));
  assert.equal(created.has(7), false);
  assert.equal(shouldRetryRunIndex(created, 7), true);
});
