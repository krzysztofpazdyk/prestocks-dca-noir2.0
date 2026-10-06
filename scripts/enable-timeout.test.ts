import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ENABLE_PENDING_MAX_MS,
  ENABLE_PENDING_POLL_MS,
  canCommitEnabledFromStatus,
  pendingEnableStillFor,
  resolvePendingEnable,
  shouldSendEnable,
} from "../lib/auto-weekly-buy";
import {
  enableResultFromTransport,
  isKeeperTimeoutError,
} from "../lib/keeper-client";

const OWNER = "OwnerPubkey111";
const OTHER = "OtherPubkey222";
const NAMES = ["A", "B", "C"];

const bought = {
  ok: true,
  enabled: true,
  owner: OWNER,
  phase: "ok",
  signature: "sig-1",
  amountUsd: 30,
  names: NAMES,
};

test("enable transport timeout and status 0 stay pending", () => {
  const timeout = new Error("The operation was aborted");
  timeout.name = "AbortError";
  assert.equal(isKeeperTimeoutError(timeout), true);
  assert.equal(isKeeperTimeoutError(new Error("Failed to fetch")), false);
  assert.deepEqual(
    enableResultFromTransport({
      ok: false,
      status: 0,
      data: null,
      timedOut: true,
    }),
    { ok: false, pending: true, error: "enable_timeout" },
  );
  assert.deepEqual(
    enableResultFromTransport({
      ok: false,
      status: 0,
      data: null,
      timedOut: false,
    }),
    { ok: false, pending: true, error: "enable_timeout" },
  );
  const http = enableResultFromTransport({
    ok: false,
    status: 500,
    data: null,
    timedOut: false,
  });
  assert.equal(http.pending, undefined);
  assert.equal(http.error, "http_500");
  assert.equal(
    enableResultFromTransport({
      ok: false,
      status: 401,
      data: { ok: false, error: "signature_rejected" },
      timedOut: false,
    }).error,
    "signature_rejected",
  );
});

test("poll waits, then commits On or Off without a second enable", () => {
  assert.equal(ENABLE_PENDING_POLL_MS, 5_000);
  assert.equal(ENABLE_PENDING_MAX_MS, 5 * 60 * 1000);
  assert.equal(shouldSendEnable(true), false);
  assert.equal(shouldSendEnable(false), true);

  const baseline = { error: null, phase: "idle" };
  assert.equal(
    resolvePendingEnable(
      { ok: true, enabled: false, owner: OWNER, phase: "buying" },
      OWNER,
      0,
      baseline,
    ),
    "pending",
  );
  assert.equal(resolvePendingEnable(bought, OWNER, 10_000, baseline), "on");
  assert.equal(
    resolvePendingEnable(
      {
        ok: false,
        enabled: false,
        owner: OWNER,
        phase: "error",
        error: "vault_low",
      },
      OWNER,
      1_000,
      baseline,
    ),
    "off",
  );
  assert.equal(
    resolvePendingEnable(
      { ok: true, enabled: false, owner: OWNER, phase: "idle" },
      OWNER,
      ENABLE_PENDING_MAX_MS,
      baseline,
    ),
    "deadline",
  );
  assert.equal(
    resolvePendingEnable(bought, OWNER, ENABLE_PENDING_MAX_MS, baseline),
    "on",
  );
});

test("a stale error is not a new failure; a finished On skips /enable", () => {
  const baseline = { error: "old_vault", phase: "error" };
  assert.equal(
    resolvePendingEnable(
      {
        ok: false,
        enabled: false,
        owner: OWNER,
        phase: "error",
        error: "old_vault",
      },
      OWNER,
      0,
      baseline,
    ),
    "pending",
  );
  assert.equal(canCommitEnabledFromStatus(bought, OWNER), true);
  assert.equal(
    canCommitEnabledFromStatus({ ...bought, names: ["A"] }, OWNER),
    false,
  );
  assert.equal(canCommitEnabledFromStatus(bought, OTHER), false);
  assert.equal(
    canCommitEnabledFromStatus({ ...bought, enabled: false }, OWNER),
    false,
  );
});

test("wallet switch does not keep the previous pending owner", () => {
  assert.equal(pendingEnableStillFor(OWNER, OWNER), true);
  assert.equal(pendingEnableStillFor(OWNER, OTHER), false);
  assert.equal(pendingEnableStillFor(OWNER, null), false);
  assert.equal(pendingEnableStillFor(null, OWNER), false);
});

test("enable pending copy does not ask for another try", () => {
  const src = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  for (const key of ["enablePending", "enableUnknown"]) {
    const re = new RegExp(
      `auto\\.status\\.${key}":\\s*"([^"]+)"`,
      "g",
    );
    const hits = [...src.matchAll(re)].map((m) => m[1]);
    assert.equal(hits.length, 2, key);
    for (const line of hits) {
      assert.doesNotMatch(line, /spróbuj ponownie|try again/i);
    }
  }
  const hook = readFileSync(
    new URL("../lib/hooks/useAutoWeeklyBuy.tsx", import.meta.url),
    "utf8",
  );
  const disables = hook.match(/keeperDisable\(/g) ?? [];
  assert.equal(disables.length, 1);
});
