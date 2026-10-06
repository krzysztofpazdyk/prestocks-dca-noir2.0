import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  clearStatusAuthCache,
  getStatusAuth,
  keeperStatus,
} from "../lib/keeper-client";

const store = new Map<string, string>();

function installStorage(): void {
  const ls = {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: ls,
  });
  if (typeof globalThis.window === "undefined") {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
  }
}

function sessionKey(owner: string): string {
  return `predca.keeper.session.${owner}`;
}

function writeSession(owner: string, token: string): void {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem(
    sessionKey(owner),
    JSON.stringify({ token, expiresAt, owner }),
  );
}

beforeEach(() => {
  store.clear();
  installStorage();
  clearStatusAuthCache();
});

afterEach(() => {
  clearStatusAuthCache();
});

test("clearStatusAuthCache(owner) drops that signature and session only", async () => {
  let signsA = 0;
  let signsB = 0;
  const signA = async () => Uint8Array.of(++signsA);
  const signB = async () => Uint8Array.of(++signsB);
  await getStatusAuth("ownerA", signA);
  await getStatusAuth("ownerB", signB);
  writeSession("ownerA", "bearer-a");
  writeSession("ownerB", "bearer-b");

  await getStatusAuth("ownerA", signA);
  assert.equal(signsA, 1);

  clearStatusAuthCache("ownerA");
  assert.equal(localStorage.getItem(sessionKey("ownerA")), null);
  assert.ok(localStorage.getItem(sessionKey("ownerB")));

  await getStatusAuth("ownerA", signA);
  await getStatusAuth("ownerB", signB);
  assert.equal(signsA, 2);
  assert.equal(signsB, 1);
});

test("clearStatusAuthCache() drops every owner", async () => {
  let signsA = 0;
  let signsB = 0;
  await getStatusAuth("ownerA", async () => Uint8Array.of(++signsA));
  await getStatusAuth("ownerB", async () => Uint8Array.of(++signsB));
  writeSession("ownerA", "bearer-a");
  writeSession("ownerB", "bearer-b");

  clearStatusAuthCache();
  assert.equal(localStorage.getItem(sessionKey("ownerA")), null);
  assert.equal(localStorage.getItem(sessionKey("ownerB")), null);

  await getStatusAuth("ownerA", async () => Uint8Array.of(++signsA));
  await getStatusAuth("ownerB", async () => Uint8Array.of(++signsB));
  assert.equal(signsA, 2);
  assert.equal(signsB, 2);
});

test("an in-flight status sign cannot refill the cache after clear", async () => {
  let release: (bytes: Uint8Array) => void = () => {};
  let signs = 0;
  const first = getStatusAuth("ownerA", () => {
    signs += 1;
    return new Promise((resolve) => {
      release = resolve;
    });
  });
  clearStatusAuthCache("ownerA");
  const second = getStatusAuth("ownerA", async () => {
    signs += 1;
    return Uint8Array.of(7);
  });
  release(Uint8Array.of(1));
  const stale = await first;
  const fresh = await second;
  assert.equal(signs, 2);
  assert.notEqual(stale.signature, fresh.signature);
  const before = signs;
  const reused = await getStatusAuth("ownerA", async () => {
    signs += 1;
    return Uint8Array.of(9);
  });
  assert.equal(signs, before);
  assert.equal(reused.signature, fresh.signature);
});

test("Bearer 401 keeps the status signature and only drops the session", async () => {
  let signs = 0;
  const sign = async () => Uint8Array.of(++signs);
  await getStatusAuth("ownerA", sign);
  writeSession("ownerA", "bearer-old");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    ({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, error: "unauthorized" }),
    })) as unknown as typeof fetch;
  try {
    const status = await keeperStatus("ownerA", sign);
    assert.equal(status.ok, false);
    assert.equal(signs, 1);
    assert.equal(localStorage.getItem(sessionKey("ownerA")), null);
    await getStatusAuth("ownerA", sign);
    assert.equal(signs, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
