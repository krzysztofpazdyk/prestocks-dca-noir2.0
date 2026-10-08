import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Connection } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
import {
  fetchMockTokenBalances,
  fetchOwnerUsdcBalance,
  fetchSolBalance,
  fetchUserConfig,
  fetchVaultBalance,
  isMissingAccountError,
  type UserConfigData,
} from "../lib/predca";
import type { Predca } from "../types/predca";
import {
  depositPlan,
  depositUi,
  derivePredcaStatus,
  nextSnapshotAfterRefresh,
  withdrawUi,
  type PredcaSnapshot,
} from "../lib/predca-status";

const owner = new PublicKey("11111111111111111111111111111111");

function programWith(
  fetchNullable: (pda: unknown) => Promise<unknown>,
): Program<Predca> {
  return {
    account: { userConfig: { fetchNullable } },
  } as unknown as Program<Predca>;
}

function connectionWith(impl: Partial<Connection>): Connection {
  return impl as Connection;
}

test("fetchUserConfig rejects a real RPC error instead of returning null", async () => {
  const program = programWith(async () => {
    throw new Error("failed to fetch");
  });
  await assert.rejects(() => fetchUserConfig(program, owner), /failed to fetch/);
});

test("fetchUserConfig returns null when fetchNullable finds no account", async () => {
  const program = programWith(async () => null);
  assert.equal(await fetchUserConfig(program, owner), null);
});

test("vault and owner USDC reads reject transport errors and return null when the account is missing", async () => {
  const missing = connectionWith({
    getTokenAccountBalance: async () => {
      throw new Error("Invalid param: could not find account");
    },
  });
  const down = connectionWith({
    getTokenAccountBalance: async () => {
      throw new Error("failed to fetch");
    },
  });
  assert.equal(await fetchVaultBalance(missing, owner), null);
  await assert.rejects(() => fetchVaultBalance(down, owner), /failed to fetch/);
  const mint = PublicKey.unique();
  assert.equal(await fetchOwnerUsdcBalance(missing, owner, mint), null);
  await assert.rejects(
    () => fetchOwnerUsdcBalance(down, owner, mint),
    /failed to fetch/,
  );
});

test("SOL balance rejects, and one missing ATA does not hide another token RPC error", async () => {
  const ownerKey = PublicKey.unique();
  await assert.rejects(
    () =>
      fetchSolBalance(
        connectionWith({
          getBalance: async () => {
            throw new Error("failed to fetch");
          },
        }),
        ownerKey,
      ),
    /failed to fetch/,
  );

  const missingMint = PublicKey.unique();
  const badMint = PublicKey.unique();
  const missingAta = getAssociatedTokenAddressSync(
    missingMint,
    ownerKey,
    false,
    TOKEN_PROGRAM_ID,
  );
  const badAta = getAssociatedTokenAddressSync(badMint, ownerKey, false, TOKEN_PROGRAM_ID);
  const connection = connectionWith({
    getTokenAccountBalance: async (ata: PublicKey) => {
      if (ata.equals(missingAta)) throw new Error("could not find account");
      if (ata.equals(badAta)) throw new Error("503");
      throw new Error("unexpected ata");
    },
  });
  await assert.rejects(
    () =>
      fetchMockTokenBalances(connection, ownerKey, [
        { name: "Missing", mint: missingMint },
        { name: "Down", mint: badMint },
      ]),
    /503/,
  );
});

test("an RPC error is status error for a known account and for an unknown one", () => {
  assert.equal(
    derivePredcaStatus({
      hasOwner: true,
      hasMint: true,
      loading: false,
      configState: "present",
      rpcError: "x",
    }),
    "error",
  );
  assert.equal(
    derivePredcaStatus({
      hasOwner: true,
      hasMint: true,
      loading: false,
      configState: "unknown",
      rpcError: "x",
    }),
    "error",
  );
});

test("a missing account is no_config only after loading finishes", () => {
  assert.equal(
    derivePredcaStatus({
      hasOwner: true,
      hasMint: true,
      loading: false,
      configState: "missing",
      rpcError: null,
    }),
    "no_config",
  );
  assert.equal(
    derivePredcaStatus({
      hasOwner: true,
      hasMint: true,
      loading: true,
      configState: "missing",
      rpcError: null,
    }),
    "loading",
  );
});

test("a failed refresh keeps the last snapshot, and a later empty account clears it", () => {
  const config = { weeklyBudgetUsdc: 1 } as unknown as UserConfigData;
  const prev: PredcaSnapshot = {
    config,
    configState: "present",
    vaultUsdc: 42,
    ownerUsdc: 7,
    solBalance: 1,
    tokenBalances: [],
    runs: [{ runIndex: 3 } as unknown as PredcaSnapshot["runs"][number]],
    rpcError: null,
  };
  const failed = nextSnapshotAfterRefresh(prev, { ok: false, error: "rpc down" });
  assert.equal(failed.config, config);
  assert.equal(failed.vaultUsdc, 42);
  assert.equal(failed.runs, prev.runs);
  assert.equal(failed.configState, "present");
  assert.equal(failed.rpcError, "rpc down");

  const cleared = nextSnapshotAfterRefresh(failed, {
    ok: true,
    config: null,
    vaultUsdc: null,
    ownerUsdc: null,
    solBalance: null,
    tokenBalances: [],
    runs: [],
  });
  assert.equal(cleared.configState, "missing");
  assert.equal(cleared.rpcError, null);
  assert.equal(cleared.config, null);
});

test("withdraw stays disabled on a stale account and deposit does not init while the read is unknown", () => {
  assert.equal(withdrawUi("error", true), "disabled");
  assert.equal(withdrawUi("error", false), "hidden");
  assert.equal(withdrawUi("ready", true), "enabled");
  assert.equal(depositPlan("present", "x"), "blocked");
  assert.equal(depositPlan("unknown", null), "blocked");
  assert.equal(depositPlan("missing", null), "init_deposit");
  assert.equal(depositPlan("present", null), "deposit");
});

test("deposit stays visible but disabled on an RPC error and still refuses init", () => {
  assert.equal(depositUi("error", true, true), "disabled");
  assert.equal(depositUi("ready", true, true), "enabled");
  assert.equal(depositUi("no_config", true, true), "enabled");
  assert.equal(depositUi("loading", true, true), "hidden");
  assert.equal(depositUi("ready", false, true), "hidden");
  assert.equal(depositUi("ready", true, false), "hidden");
  assert.equal(depositPlan("unknown", null), "blocked");
  assert.equal(depositPlan("missing", "x"), "blocked");
});

test("the deposit tile stays mounted on an RPC error and does not enter the duplicate gate", () => {
  const src = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(src, /depositPresentation !== "hidden"/);
  const initAt = src.indexOf('t("predca.initHint")');
  assert.ok(initAt > 0);
  const initGuard = src.slice(Math.max(0, initAt - 900), initAt);
  assert.match(initGuard, /canDeposit/);
  assert.match(initGuard, /predca\.status === "no_config"/);
  for (const name of ["submitDeposit", "submitWithdraw"]) {
    const start = src.indexOf(`async function ${name}`);
    const gate = src.indexOf("tryEnterDupCheck", start);
    assert.ok(start > 0 && gate > start, name);
    const head = src.slice(start, gate);
    assert.match(head, /!== "enabled"\) return;/);
  }
});

test("isMissingAccountError matches missing accounts and not transport or rate limits", () => {
  assert.equal(isMissingAccountError(new Error("could not find account")), true);
  assert.equal(
    isMissingAccountError(new Error("Account does not exist or has no data")),
    true,
  );
  assert.equal(isMissingAccountError(new Error("failed to fetch")), false);
  assert.equal(isMissingAccountError(new Error("429 Too Many Requests")), false);
  assert.equal(isMissingAccountError(new Error("fetch failed")), false);
});
