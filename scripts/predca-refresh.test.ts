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

test("refresh marks sibling reads handled before fetchUserConfig", () => {
  const src = readFileSync(
    new URL("../lib/hooks/usePredca.ts", import.meta.url),
    "utf8",
  );
  const refreshAt = src.indexOf("const refresh = useCallback");
  const fetchAt = src.indexOf("await fetchUserConfig", refreshAt);
  assert.ok(refreshAt > 0 && fetchAt > refreshAt);
  const head = src.slice(refreshAt, fetchAt);
  for (const name of ["solPromise", "ownerBalPromise", "tokensPromise"]) {
    const decl = head.indexOf(`const ${name}`);
    assert.ok(decl >= 0, name);
    const after = head.slice(decl);
    assert.match(after, new RegExp(`markHandled\\(${name}\\)|${name}\\.catch\\(`));
  }
});

test("a restored session hides unresolved notes until each signature is checked", () => {
  const src = readFileSync(
    new URL("../lib/hooks/usePredca.ts", import.meta.url),
    "utf8",
  );
  const restoreAt = src.indexOf("restoreRef.current = async");
  const restoreEnd = src.indexOf("async function recheckUnresolved", restoreAt);
  assert.ok(restoreAt > 0 && restoreEnd > restoreAt);
  const restore = src.slice(restoreAt, restoreEnd);
  const arm = restore.indexOf("setSessionChecking(");
  const sync = restore.indexOf("syncUnresolved(records)");
  assert.ok(arm >= 0 && sync > arm);
  const settleAt = restore.indexOf("settleRecord(");
  const tryAt = restore.lastIndexOf("try {", settleAt);
  const finallyAt = restore.indexOf("finally", settleAt);
  assert.ok(tryAt >= 0 && tryAt < settleAt && finallyAt > settleAt);
  const fin = restore.slice(finallyAt, finallyAt + 280);
  assert.match(fin, /setSessionChecking/);
  assert.match(fin, /delete\(rec\.signature\)/);

  const effectAt = src.indexOf("const prev = seenOwnerKey.current");
  const refreshAt = src.indexOf("const refresh = useCallback");
  assert.match(src.slice(effectAt, refreshAt), /setSessionChecking\(new Set\(\)\)/);

  const ov = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  const sv = readFileSync(
    new URL("../components/SettingsView.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(ov.includes("predca.unresolvedTxs.slice("), false);
  assert.equal(sv.includes("predca.unresolvedTxs.slice("), false);
  assert.match(ov, /visibleUnresolvedTxs\.slice\(/);
  assert.match(sv, /visibleUnresolvedTxs\.slice\(/);
});

test("recheckUnresolved confirms from signature history without a vault wait", () => {
  const src = readFileSync(
    new URL("../lib/hooks/usePredca.ts", import.meta.url),
    "utf8",
  );
  const start = src.indexOf("async function recheckUnresolved");
  const end = src.indexOf("async function depositUsdc", start);
  assert.ok(start > 0 && end > start);
  const body = src.slice(start, end);
  assert.match(body, /requireVaultIncrease:\s*false/);
  assert.doesNotMatch(body, /isPrivy/);
  assert.match(body, /vaultBefore:\s*null/);
});
