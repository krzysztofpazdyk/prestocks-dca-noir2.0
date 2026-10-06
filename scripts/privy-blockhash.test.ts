import assert from "node:assert/strict";
import test from "node:test";
import {
  isStaleBlockhashError,
  withOneStaleBlockhashRetry,
} from "../lib/privy-blockhash";

const STALE = new Error(
  "Transaction simulation failed: Blockhash not found",
);

test("simulation Blockhash not found is stale", () => {
  assert.equal(isStaleBlockhashError(STALE), true);
  assert.equal(isStaleBlockhashError(new Error("insufficient funds")), false);
});

test("Phantom stale blockhash is a single attempt", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      withOneStaleBlockhashRetry(false, async () => {
        calls += 1;
        throw STALE;
      }),
    /Blockhash not found/,
  );
  assert.equal(calls, 1);
});

test("Privy stale blockhash rebuilds and prompts once", async () => {
  let calls = 0;
  const sig = await withOneStaleBlockhashRetry(true, async () => {
    calls += 1;
    if (calls === 1) throw STALE;
    return "sig-retry";
  });
  assert.equal(sig, "sig-retry");
  assert.equal(calls, 2);
});

test("Privy does not retry a second stale blockhash", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      withOneStaleBlockhashRetry(true, async () => {
        calls += 1;
        throw STALE;
      }),
    /Blockhash not found/,
  );
  assert.equal(calls, 2);
});

test("Privy does not retry other send errors", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      withOneStaleBlockhashRetry(true, async () => {
        calls += 1;
        throw new Error("insufficient funds");
      }),
    /insufficient funds/,
  );
  assert.equal(calls, 1);
});

test("a successful first send is not repeated", async () => {
  let calls = 0;
  const sig = await withOneStaleBlockhashRetry(true, async () => {
    calls += 1;
    return "sig-ok";
  });
  assert.equal(sig, "sig-ok");
  assert.equal(calls, 1);
});
