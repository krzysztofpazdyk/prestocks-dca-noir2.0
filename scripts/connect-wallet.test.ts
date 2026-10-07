import assert from "node:assert/strict";
import test from "node:test";
import {
  adapterHasAccount,
  CONNECT_STALL_MS,
  ConnectTimeoutError,
  nextConnectStep,
  runConnectJob,
  shouldEndPrivySession,
  type ConnectRuntime,
} from "../lib/connect-wallet";

test("stuck disconnect flag does not block the next wallet", () => {
  const step = nextConnectStep({
    phase: "disconnect",
    target: "Privy",
    selectedName: "Phantom",
    connected: false,
    connecting: false,
    disconnecting: true,
    targetReady: true,
  });
  assert.equal(step, "clear");
});

test("wait while another wallet is still connected", () => {
  assert.equal(
    nextConnectStep({
      phase: "disconnect",
      target: "Privy",
      selectedName: "Phantom",
      connected: true,
      connecting: false,
      disconnecting: true,
      targetReady: true,
    }),
    "wait",
  );
});

test("select only when the target adapter is ready", () => {
  assert.equal(
    nextConnectStep({
      phase: "select",
      target: "Privy",
      selectedName: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      targetReady: false,
    }),
    "wait",
  );
  assert.equal(
    nextConnectStep({
      phase: "select",
      target: "Privy",
      selectedName: null,
      connected: false,
      connecting: false,
      disconnecting: false,
      targetReady: true,
    }),
    "select",
  );
});

test("do not connect a selected wallet that still has no account", () => {
  assert.equal(
    nextConnectStep({
      phase: "connect",
      target: "Privy",
      selectedName: "Privy",
      connected: false,
      connecting: false,
      disconnecting: false,
      targetReady: false,
    }),
    "wait",
  );
});

test("connect once the selected wallet is ready and not already connecting", () => {
  assert.equal(
    nextConnectStep({
      phase: "connect",
      target: "Privy",
      selectedName: "Privy",
      connected: false,
      connecting: true,
      disconnecting: false,
      targetReady: true,
    }),
    "wait",
  );
  assert.equal(
    nextConnectStep({
      phase: "connect",
      target: "Privy",
      selectedName: "Privy",
      connected: false,
      connecting: false,
      disconnecting: false,
      targetReady: true,
    }),
    "connect",
  );
  assert.equal(
    nextConnectStep({
      phase: "connect",
      target: "Privy",
      selectedName: "Privy",
      connected: true,
      connecting: false,
      disconnecting: true,
      targetReady: true,
    }),
    "done",
  );
});

test("adapterHasAccount requires a non-empty address", () => {
  assert.equal(adapterHasAccount(undefined), false);
  assert.equal(adapterHasAccount({}), false);
  assert.equal(adapterHasAccount({ wallet: { accounts: [] } }), false);
  assert.equal(
    adapterHasAccount({ wallet: { accounts: [{ address: "" }] } }),
    false,
  );
  assert.equal(
    adapterHasAccount({ wallet: { accounts: [{ address: "PrivyPubkey" }] } }),
    true,
  );
});

type Sim = {
  selectedName: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  targetReady: boolean;
};

function virtualRuntime(
  state: Sim,
  hooks: {
    onDisconnect?: () => void;
    onSelect?: (name: string | null) => void;
    onConnect?: () => void | Promise<void>;
  } = {},
): { rt: ConnectRuntime; selects: Array<string | null>; connects: number } {
  let now = 0;
  const selects: Array<string | null> = [];
  let connects = 0;
  const rt: ConnectRuntime = {
    target: "Privy",
    now: () => now,
    sleep: async (ms) => {
      now += ms;
    },
    isCancelled: () => false,
    getState: () => ({ ...state }),
    disconnectAdapter: async () => {
      hooks.onDisconnect?.();
    },
    select: (name) => {
      selects.push(name);
      hooks.onSelect?.(name);
    },
    connect: async () => {
      connects += 1;
      await hooks.onConnect?.();
    },
  };
  return {
    rt,
    get selects() {
      return selects;
    },
    get connects() {
      return connects;
    },
  };
}

test("phantom disconnect that leaves the name and a stuck flag still reaches Privy", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: true,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  let wiped = false;
  const sim = virtualRuntime(state, {
    onDisconnect: () => {
      // Event dropped the session. The adapter promise never resolves, and
      // wallet-adapter can leave `disconnecting` true. The name is still Phantom.
      state.connected = false;
      state.disconnecting = true;
    },
    onSelect: (name) => {
      if (name == null) {
        state.selectedName = null;
        state.disconnecting = false;
        return;
      }
      // First select is wiped by a late disconnect event.
      if (!wiped) {
        wiped = true;
        state.selectedName = null;
        return;
      }
      state.selectedName = name;
    },
    onConnect: () => {
      if (state.selectedName === "Privy") state.connected = true;
    },
  });
  await runConnectJob(sim.rt);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Privy");
  assert.ok(sim.selects.includes(null));
  assert.equal(sim.selects.filter((name) => name === "Privy").length, 2);
  assert.equal(sim.connects, 1);
});

test("wait for Privy to register, then connect once", async () => {
  const state: Sim = {
    selectedName: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: false,
  };
  let ticks = 0;
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      state.selectedName = name;
    },
    onConnect: () => {
      state.connected = true;
    },
  });
  const originalSleep = sim.rt.sleep;
  sim.rt.sleep = async (ms) => {
    ticks += 1;
    if (ticks === 3) state.targetReady = true;
    await originalSleep(ms);
  };
  await runConnectJob(sim.rt);
  assert.equal(sim.connects, 1);
  assert.equal(state.selectedName, "Privy");
  assert.ok(sim.rt.now() < CONNECT_STALL_MS);
});

test("no-op connect is retried, then times out instead of spinning", async () => {
  const state: Sim = {
    selectedName: "Privy",
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const sim = virtualRuntime(state, {
    onConnect: () => {
      /* adapter swallowed the call */
    },
  });
  await assert.rejects(runConnectJob(sim.rt), (error: unknown) => {
    assert.ok(error instanceof ConnectTimeoutError);
    return true;
  });
  assert.ok(sim.connects > 1);
  assert.ok(sim.connects < 500);
});

test("disconnect ends a background Privy session and a Privy wallet", () => {
  assert.equal(
    shouldEndPrivySession({
      nextName: null,
      activeName: "Phantom",
      privyAuthenticated: true,
    }),
    true,
  );
  assert.equal(
    shouldEndPrivySession({
      nextName: null,
      activeName: "Solflare",
      privyAuthenticated: false,
    }),
    false,
  );
  assert.equal(
    shouldEndPrivySession({
      nextName: null,
      activeName: "Privy",
      privyAuthenticated: false,
    }),
    true,
  );
});

test("Phantom or Solflare switch ends a Privy session; picking Privy keeps it", () => {
  assert.equal(
    shouldEndPrivySession({
      nextName: "Phantom",
      activeName: "Privy",
      privyAuthenticated: true,
    }),
    true,
  );
  assert.equal(
    shouldEndPrivySession({
      nextName: "Solflare",
      activeName: "Phantom",
      privyAuthenticated: true,
    }),
    true,
  );
  assert.equal(
    shouldEndPrivySession({
      nextName: "Phantom",
      activeName: "Phantom",
      privyAuthenticated: false,
    }),
    false,
  );
  assert.equal(
    shouldEndPrivySession({
      nextName: "Privy",
      activeName: "Phantom",
      privyAuthenticated: true,
    }),
    false,
  );
});

test("wallet rejection surfaces instead of a timeout", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const sim = virtualRuntime(state);
  sim.rt.target = "Phantom";
  sim.rt.select = (name) => {
    state.selectedName = name;
  };
  sim.rt.connect = async () => {
    const error = new Error("Wallet not ready");
    error.name = "WalletNotReadyError";
    throw error;
  };
  await assert.rejects(runConnectJob(sim.rt), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.name, "WalletNotReadyError");
    return true;
  });
});
