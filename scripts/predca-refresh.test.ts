import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { refreshWriteStillCurrent } from "../lib/predca-refresh";

const A = "WalletA";
const B = "WalletB";

test("stable owner may write refresh results and clear loading", () => {
  assert.equal(refreshWriteStillCurrent(0, A, 0, A), true);
  assert.equal(refreshWriteStillCurrent(3, null, 3, null), true);
});

test("switch A→B blocks the old refresh, including its finally", () => {
  const started = { epoch: 1, owner: A };
  const afterSwitch = { epoch: 2, owner: B };
  assert.equal(
    refreshWriteStillCurrent(
      started.epoch,
      started.owner,
      afterSwitch.epoch,
      afterSwitch.owner,
    ),
    false,
  );
  assert.equal(
    refreshWriteStillCurrent(
      afterSwitch.epoch,
      afterSwitch.owner,
      afterSwitch.epoch,
      afterSwitch.owner,
    ),
    true,
  );
});

test("disconnect during refresh blocks a late write", () => {
  assert.equal(refreshWriteStillCurrent(1, A, 2, null), false);
  assert.equal(refreshWriteStillCurrent(1, A, 1, null), false);
});

test("owner change alone is stale even before the epoch bump lands", () => {
  assert.equal(refreshWriteStillCurrent(4, A, 4, B), false);
  assert.equal(refreshWriteStillCurrent(4, A, 5, A), false);
});

test("wallet change bumps both epochs before any refresh write", () => {
  const src = readFileSync(
    new URL("../lib/hooks/usePredca.ts", import.meta.url),
    "utf8",
  );
  const effectAt = src.indexOf("const prev = seenOwnerKey.current");
  const refreshAt = src.indexOf("const refresh = useCallback");
  assert.ok(effectAt > 0 && refreshAt > effectAt);
  const effect = src.slice(effectAt, refreshAt);
  const guard = effect.indexOf("prev === undefined || prev === ownerKey");
  const dataBump = effect.indexOf("dataEpoch.current += 1");
  const followBump = effect.indexOf("vaultFollowEpoch.current += 1");
  assert.ok(guard >= 0 && dataBump > guard && followBump > guard);
  assert.match(effect, /setPending\(null\)/);
  assert.match(effect, /setOkMsg\(null\)/);
  assert.match(effect, /reportError\(null\)/);
  // v4.30 stores the read in one snapshot. EMPTY_SNAPSHOT clears config, vault, runs, and tokens.
  assert.match(effect, /setSnapshot\(EMPTY_SNAPSHOT\)/);
  assert.match(effect, /setUnresolvedTxs\(\[\]\)/);

  const refreshFn = src.slice(refreshAt, src.indexOf("void refresh()"));
  assert.match(refreshFn, /refreshWriteStillCurrent\(/);
  const loadingOff = refreshFn.indexOf("setLoading(false)");
  assert.ok(loadingOff > 0);
  assert.match(refreshFn.slice(loadingOff - 40, loadingOff), /if \(!still\(\)\) return;/);
});
