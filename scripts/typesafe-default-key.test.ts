import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  LS_TYPESAFE,
  ensureDefaultTypesafeKey,
  hasByokTypesafe,
  readTypesafeKey,
} from "../lib/keys";

const ENV = "NEXT_PUBLIC_TYPESAFE_DEFAULT_KEY";
const DEMO = "test-default-key";

type Mem = {
  store: Map<string, string>;
  sets: string[];
};

type Globals = {
  window?: unknown;
  localStorage?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  };
};

function install(opts: { window: boolean }): Mem {
  const store = new Map<string, string>();
  const sets: string[] = [];
  const g = globalThis as unknown as Globals;
  if (opts.window) g.window = {};
  else delete g.window;
  g.localStorage = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      sets.push(`${key}=${value}`);
      store.set(key, value);
    },
  };
  return { store, sets };
}

function restore(prevEnv: string | undefined) {
  const g = globalThis as unknown as Globals;
  delete g.window;
  delete g.localStorage;
  if (prevEnv === undefined) delete process.env[ENV];
  else process.env[ENV] = prevEnv;
}

describe("default TypeSafe seed", { concurrency: false }, () => {
  test("seeds only when the localStorage key was never written", () => {
    const prev = process.env[ENV];
    process.env[ENV] = `  ${DEMO}  `;
    const mem = install({ window: true });
    try {
      assert.equal(readTypesafeKey(), DEMO);
      assert.equal(mem.store.get(LS_TYPESAFE), DEMO);
      assert.deepEqual(mem.sets, [`${LS_TYPESAFE}=${DEMO}`]);
      assert.equal(hasByokTypesafe(), true);
      ensureDefaultTypesafeKey();
      assert.equal(mem.sets.length, 1);
    } finally {
      restore(prev);
    }
  });

  test("does not overwrite a saved key", () => {
    const prev = process.env[ENV];
    process.env[ENV] = DEMO;
    const mem = install({ window: true });
    mem.store.set(LS_TYPESAFE, "user-key");
    try {
      assert.equal(readTypesafeKey(), "user-key");
      assert.equal(mem.sets.length, 0);
    } finally {
      restore(prev);
    }
  });

  test("a saved empty string is not re-seeded", () => {
    const prev = process.env[ENV];
    process.env[ENV] = DEMO;
    const mem = install({ window: true });
    mem.store.set(LS_TYPESAFE, "");
    try {
      assert.equal(readTypesafeKey(), "");
      assert.equal(hasByokTypesafe(), false);
      assert.equal(mem.sets.length, 0);
      mem.store.set(LS_TYPESAFE, "   ");
      assert.equal(readTypesafeKey(), "");
      assert.equal(mem.sets.length, 0);
    } finally {
      restore(prev);
    }
  });

  test("missing or blank env does not write", () => {
    const prev = process.env[ENV];
    const mem = install({ window: true });
    try {
      delete process.env[ENV];
      ensureDefaultTypesafeKey();
      process.env[ENV] = "   ";
      assert.equal(readTypesafeKey(), "");
      assert.equal(mem.store.has(LS_TYPESAFE), false);
      assert.equal(mem.sets.length, 0);
    } finally {
      restore(prev);
    }
  });

  test("no window is a no-op", () => {
    const prev = process.env[ENV];
    process.env[ENV] = DEMO;
    const mem = install({ window: false });
    try {
      ensureDefaultTypesafeKey();
      assert.equal(readTypesafeKey(), "");
      assert.equal(mem.sets.length, 0);
    } finally {
      restore(prev);
    }
  });

  test("localStorage failures are swallowed", () => {
    const prev = process.env[ENV];
    process.env[ENV] = DEMO;
    const g = globalThis as unknown as Globals;
    g.window = {};
    g.localStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("quota");
      },
    };
    try {
      assert.equal(readTypesafeKey(), "");
      assert.doesNotThrow(() => ensureDefaultTypesafeKey());
    } finally {
      restore(prev);
    }
  });
});
