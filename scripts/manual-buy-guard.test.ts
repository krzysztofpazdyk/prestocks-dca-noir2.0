import assert from "node:assert/strict";
import test from "node:test";
import { RUN_INDEX_TAKEN_MSG } from "../lib/predca";
import {
  BUY_ALREADY_IN_FLIGHT_MSG,
  decideCollisionRetry,
  leaveManualBuy,
  noteRunSubmit,
  recoverRunCollision,
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

test("same-tab collision does not submit the next index", async () => {
  const counts = new Map<number, number>();
  noteRunSubmit(counts, 4);
  noteRunSubmit(counts, 4);
  const submitted: number[] = [];
  await assert.rejects(
    () =>
      recoverRunCollision({
        failedIndex: 4,
        counts,
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

test("two in-flight submits of the same index do not buy the next one", async () => {
  const counts = new Map<number, number>();
  const submitted: number[] = [];

  async function loseIndex(index: number) {
    noteRunSubmit(counts, index);
    submitted.push(index);
    return recoverRunCollision({
      failedIndex: index,
      counts,
      findNextIndex: async () => index + 1,
      submitOnce: async (retry) => {
        submitted.push(retry);
        return "sig-2";
      },
    });
  }

  const results = await Promise.allSettled([loseIndex(3), loseIndex(3)]);
  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.status === "rejected"));
  for (const r of results) {
    if (r.status === "rejected") {
      assert.ok(r.reason instanceof Error);
      assert.equal(r.reason.message, BUY_ALREADY_IN_FLIGHT_MSG);
    }
  }
  assert.deepEqual(submitted, [3, 3]);
});

test("a single in-flight keeper collision retries once", async () => {
  const counts = new Map<number, number>();
  noteRunSubmit(counts, 4);
  const submitted: number[] = [];
  const sig = await recoverRunCollision({
    failedIndex: 4,
    counts,
    findNextIndex: async () => 5,
    submitOnce: async (index) => {
      submitted.push(index);
      return "sig";
    },
  });
  assert.equal(sig, "sig");
  assert.deepEqual(submitted, [5]);
  assert.equal(
    decideCollisionRetry({
      failedIndex: 4,
      retryIndex: 5,
      submitCountForFailed: 1,
    }).kind,
    "retry",
  );
});

test("missing or same retry index stops without another submit", async () => {
  for (const retryIndex of [null, 4] as const) {
    const counts = new Map<number, number>();
    noteRunSubmit(counts, 4);
    const submitted: number[] = [];
    await assert.rejects(
      () =>
        recoverRunCollision({
          failedIndex: 4,
          counts,
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
