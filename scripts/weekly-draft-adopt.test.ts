import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LS_WEEKLY_BUDGET, scopedLsKey } from "../lib/auto-weekly-buy";
import {
  adoptWeeklyDraftForOwner,
  WEEKLY_DRAFT_SESSION_KEY,
  writeWeeklyDraft,
} from "../lib/weekly-budget";

const OWNER = "Owner1111111111111111111111111111111111";

function installStorage(): { restore: () => void } {
  const local = new Map<string, string>();
  const session = new Map<string, string>();
  const make = (data: Map<string, string>): Storage =>
    ({
      getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
      setItem: (key: string, value: string) => {
        data.set(key, String(value));
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
      clear: () => data.clear(),
      key: (index: number) => [...data.keys()][index] ?? null,
      get length() {
        return data.size;
      },
    }) as Storage;
  const prevLocal = globalThis.localStorage;
  const prevSession = globalThis.sessionStorage;
  globalThis.localStorage = make(local);
  globalThis.sessionStorage = make(session);
  return {
    restore() {
      if (prevLocal === undefined) {
        delete (globalThis as { localStorage?: Storage }).localStorage;
      } else {
        globalThis.localStorage = prevLocal;
      }
      if (prevSession === undefined) {
        delete (globalThis as { sessionStorage?: Storage }).sessionStorage;
      } else {
        globalThis.sessionStorage = prevSession;
      }
    },
  };
}

test("adoptWeeklyDraftForOwner stores a draft only when the wallet has no amount", () => {
  const storage = installStorage();
  try {
    writeWeeklyDraft(200);
    assert.equal(adoptWeeklyDraftForOwner(OWNER), 200);
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), "200");
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), null);
    assert.equal(localStorage.getItem(LS_WEEKLY_BUDGET), null);

    writeWeeklyDraft(80);
    assert.equal(adoptWeeklyDraftForOwner(OWNER), null);
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), "200");
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), null);
  } finally {
    storage.restore();
  }
});

test("adoptWeeklyDraftForOwner keeps a saved wallet amount and drops the draft", () => {
  const storage = installStorage();
  try {
    localStorage.setItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER), "300");
    writeWeeklyDraft(200);
    assert.equal(adoptWeeklyDraftForOwner(OWNER), null);
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), "300");
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), null);
  } finally {
    storage.restore();
  }
});

test("adoptWeeklyDraftForOwner does nothing without a draft or without an owner", () => {
  const storage = installStorage();
  try {
    assert.equal(adoptWeeklyDraftForOwner(OWNER), null);
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), null);
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), null);

    writeWeeklyDraft(200);
    assert.equal(adoptWeeklyDraftForOwner(null), null);
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), "200");
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), null);
    assert.equal(localStorage.getItem(LS_WEEKLY_BUDGET), null);
  } finally {
    storage.restore();
  }
});

test("a second adoptWeeklyDraftForOwner call leaves storage unchanged", () => {
  const storage = installStorage();
  try {
    writeWeeklyDraft(200);
    assert.equal(adoptWeeklyDraftForOwner(OWNER), 200);
    const scoped = localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER));
    assert.equal(adoptWeeklyDraftForOwner(OWNER), null);
    assert.equal(localStorage.getItem(scopedLsKey(LS_WEEKLY_BUDGET, OWNER)), scoped);
    assert.equal(sessionStorage.getItem(WEEKLY_DRAFT_SESSION_KEY), null);
  } finally {
    storage.restore();
  }
});

test("Overview adopts the weekly draft in an effect that depends on the owner", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    overview,
    /useEffect\(\(\) => \{\s*adoptWeeklyDraftForOwner\(ownerBase58\);\s*\}, \[ownerBase58\]\);/,
  );
});
