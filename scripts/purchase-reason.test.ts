import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { purchaseDisabledReasonKey } from "../lib/purchase-reason";

const base = {
  purchaseDisabled: true,
  sigUnresolved: false,
  buyInFlight: false,
  txPending: false,
  statusError: false,
  rankFlat: false,
  top3Empty: false,
  connected: true,
  onChainReady: true,
  vaultTooLow: false,
};

test("a disconnected purchase is blocked because the wallet is missing", () => {
  assert.equal(
    purchaseDisabledReasonKey({ ...base, connected: false, onChainReady: false, vaultTooLow: true }),
    "msg.connectForPurchase",
  );
  assert.equal(purchaseDisabledReasonKey({ ...base, purchaseDisabled: false, connected: false }), null);
  assert.equal(
    purchaseDisabledReasonKey({ ...base, connected: false, sigUnresolved: true }),
    null,
  );
  assert.equal(
    purchaseDisabledReasonKey({ ...base, vaultTooLow: true }),
    "purchase.disabled.vaultLow",
  );
  assert.equal(
    purchaseDisabledReasonKey({ ...base, onChainReady: false }),
    "purchase.disabled.notReady",
  );
});

test("Overview uses the disconnected copy and has no offline purchase path", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  for (const key of [
    "holdings.titleDisconnected",
    "holdings.emptyDisconnected",
    "lastPurchase.titleDisconnected",
    "lastPurchase.emptyDisconnected",
  ]) {
    assert.match(overview, new RegExp(key.replace(".", "\\.")));
  }
  assert.doesNotMatch(overview, /msg\.purchaseOffline/);
  assert.doesNotMatch(overview, /applyPurchase/);
  const purchase = overview.slice(
    overview.indexOf("async function handlePurchase"),
    overview.indexOf("const depositPresentation"),
  );
  assert.match(purchase, /if \(!connected\) return;/);
});
