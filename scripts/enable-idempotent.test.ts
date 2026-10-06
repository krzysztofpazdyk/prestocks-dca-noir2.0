import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CONFIRM_POLL_MAX_MS,
  CONFIRM_POLL_MS,
  RECENT_RUN_GUARD_MS,
  classifySignatureStatus,
  isRecentForcedRun,
  signatureFromConfirmError,
} from "./enable-idempotent.mjs";

const SIG = "5".repeat(88);

test("confirm timeout with a signature is not a hard failure", () => {
  const err = new Error(
    `Transaction was not confirmed in 30.00 seconds. It is unknown if it succeeded or failed. Check signature ${SIG} using the Solana Explorer or CLI tools.`,
  ) as Error & { signature?: string };
  err.name = "TransactionExpiredTimeoutError";
  err.signature = SIG;
  assert.equal(signatureFromConfirmError(err), SIG);

  const fromMessage = new Error(`Check signature ${SIG} using the Solana Explorer`);
  assert.equal(signatureFromConfirmError(fromMessage), SIG);
  assert.equal(signatureFromConfirmError(new Error("vault too low")), null);
  assert.equal(CONFIRM_POLL_MS, 3_000);
  assert.equal(CONFIRM_POLL_MAX_MS, 90_000);
});

test("signature status: confirmed is ok, err is failed, null stays pending", () => {
  assert.equal(
    classifySignatureStatus({ err: null, confirmationStatus: "confirmed" }),
    "ok",
  );
  assert.equal(
    classifySignatureStatus({ err: null, confirmationStatus: "finalized" }),
    "ok",
  );
  assert.equal(
    classifySignatureStatus({
      err: { InstructionError: [0, { Custom: 1 }] },
      confirmationStatus: "confirmed",
    }),
    "failed",
  );
  assert.equal(classifySignatureStatus(null), "pending");
  assert.equal(
    classifySignatureStatus({ err: null, confirmationStatus: "processed" }),
    "pending",
  );
});

test("force enable inside 10 minutes does not buy again", () => {
  assert.equal(RECENT_RUN_GUARD_MS, 10 * 60 * 1000);
  const now = 1_700_000_000_000;
  const recent = Math.floor(now / 1000) - 60;
  const old = Math.floor(now / 1000) - 11 * 60;
  assert.equal(isRecentForcedRun(true, recent, now), true);
  assert.equal(isRecentForcedRun(true, old, now), false);
  assert.equal(isRecentForcedRun(false, recent, now), false);
  assert.equal(isRecentForcedRun(true, 0, now), false);
});

test("daemon busy path does not clear enabled; UI polls instead of retry copy", () => {
  const daemon = readFileSync(
    new URL("./weekly-vault-buy.mjs", import.meta.url),
    "utf8",
  );
  const busyAt = daemon.indexOf('result.reason === "busy"');
  const pendingAt = daemon.indexOf("if (result && result.pending)");
  assert.ok(busyAt > 0 && pendingAt > busyAt);
  const busy = daemon.slice(busyAt, pendingAt);
  assert.match(busy, /readEnabled\(owner\)/);
  assert.doesNotMatch(busy, /writeEnabled/);
  assert.match(daemon, /enable force refused: recent_run/);
  assert.match(daemon, /phase: "confirming"/);

  const hook = readFileSync(
    new URL("../lib/hooks/useAutoWeeklyBuy.tsx", import.meta.url),
    "utf8",
  );
  const pollAt = hook.indexOf("shouldPollInProgressEnable");
  const postAt = hook.indexOf("await keeperEnable");
  const unknownAt = hook.indexOf('ran.reason === "busy"');
  const notOkAt = hook.indexOf("if (!ran.ok)");
  assert.ok(pollAt > 0 && postAt > pollAt);
  assert.ok(unknownAt > 0 && notOkAt > unknownAt);
  assert.doesNotMatch(hook, /spróbuj za chwilę/);
});
