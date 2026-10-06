import assert from "node:assert/strict";
import test from "node:test";
import { shouldCommitAutoBuyEnabled } from "../lib/auto-weekly-buy";

const NAMES = ["A", "B", "C"];

test("busy skip does not commit enabled", () => {
  assert.equal(
    shouldCommitAutoBuyEnabled({
      ok: true,
      skipped: true,
    }),
    false,
  );
});

test("a real purchase commits enabled", () => {
  assert.equal(
    shouldCommitAutoBuyEnabled({
      ok: true,
      skipped: false,
      signature: "sig",
      names: NAMES,
    }),
    true,
  );
});

test("skipped purchase with a signature still does not commit", () => {
  assert.equal(
    shouldCommitAutoBuyEnabled({
      ok: true,
      skipped: true,
      signature: "sig",
      names: NAMES,
    }),
    false,
  );
});

test("success without three names does not commit", () => {
  assert.equal(
    shouldCommitAutoBuyEnabled({
      ok: true,
      signature: "sig",
      names: ["A", "B"],
    }),
    false,
  );
});

test("a failed enable does not commit", () => {
  assert.equal(
    shouldCommitAutoBuyEnabled({
      ok: false,
      signature: "sig",
      names: NAMES,
    }),
    false,
  );
});
