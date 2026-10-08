import assert from "node:assert/strict";
import test from "node:test";
import {
  adapterHasAccount,
  armPrivyLogoutForChoice,
  CONNECT_STALL_MS,
  ConnectTimeoutError,
  createOnceTask,
  decidePrivyPick,
  externalWalletChoiceEndsPrivy,
  nextConnectStep,
  nextPinnedAddress,
  replayLiveConnect,
  runConnectJob,
  shouldEndPrivySession,
  shouldRestoreExternalWallet,
  walletButtonLabel,
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

test("afterConnected runs only once the target is connected, then a wipe is repaired", async () => {
  const state: Sim = {
    selectedName: "Privy",
    connected: true,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const order: string[] = [];
  let hooks = 0;
  const sim = virtualRuntime(state, {
    onDisconnect: () => {
      order.push("disconnect");
      state.connected = false;
    },
    onSelect: (name) => {
      order.push(name == null ? "clear" : `select:${name}`);
      state.selectedName = name;
    },
    onConnect: () => {
      order.push("connect");
      if (state.selectedName === "Phantom") state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.afterConnected = async () => {
    hooks += 1;
    order.push("logout");
    assert.equal(state.connected, true);
    assert.equal(state.selectedName, "Phantom");
    state.selectedName = null;
    state.connected = false;
  };
  await runConnectJob(sim.rt);
  assert.equal(hooks, 1);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Phantom");
  const logoutAt = order.indexOf("logout");
  const firstConnect = order.indexOf("connect");
  assert.ok(firstConnect >= 0 && logoutAt > firstConnect);
  assert.equal(order.filter((item) => item === "logout").length, 1);
  assert.equal(order.filter((item) => item === "connect").length, 2);
  assert.ok(order.indexOf("disconnect") < firstConnect);
});

test("afterConnected failure still leaves the connected target", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: true,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const sim = virtualRuntime(state);
  sim.rt.target = "Phantom";
  sim.rt.afterConnected = async () => {
    throw new Error("logout down");
  };
  await runConnectJob(sim.rt);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Phantom");
});

test("plain connect does not need afterConnected", async () => {
  const state: Sim = {
    selectedName: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      state.selectedName = name;
    },
    onConnect: () => {
      state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  await runConnectJob(sim.rt);
  assert.equal(sim.connects, 1);
  assert.equal(state.selectedName, "Phantom");
  assert.equal(sim.rt.afterConnected, undefined);
});

test("Phantom and Solflare end Privy; Privy and a closed picker do not", () => {
  assert.equal(externalWalletChoiceEndsPrivy("Phantom"), true);
  assert.equal(externalWalletChoiceEndsPrivy("Solflare"), true);
  assert.equal(externalWalletChoiceEndsPrivy("Privy"), false);
  assert.equal(externalWalletChoiceEndsPrivy(null), false);
});

test("one external click logs out once across success, rejection, timeout, and cancel", async () => {
  let calls = 0;
  const task = createOnceTask(async () => {
    calls += 1;
  });
  await task.start();
  await task.start();
  task.start();
  await task.start();
  assert.equal(calls, 1);
  assert.equal(task.hasStarted(), true);
});

test("approved address stays put while connecting is still set or the link flickers", () => {
  const label = (over: Partial<Parameters<typeof walletButtonLabel>[0]> = {}) =>
    walletButtonLabel({
      dropped: false,
      busy: true,
      connected: true,
      address: "US51…ELFx",
      pinnedAddress: "US51…ELFx",
      connectingLabel: "Łączenie…",
      selectLabel: "Zaloguj",
      ...over,
    });
  assert.equal(label(), "US51…ELFx");
  assert.equal(label({ connected: false, address: "" }), "US51…ELFx");
  assert.equal(
    label({
      connected: false,
      address: "",
      pinnedAddress: null,
    }),
    "Łączenie…",
  );
  assert.equal(label({ dropped: true }), "Zaloguj");
  assert.equal(
    label({
      busy: false,
      connected: false,
      address: "",
      pinnedAddress: null,
    }),
    "Zaloguj",
  );
});

test("rejected connect does not run the post-connect logout hook", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  let hooks = 0;
  const sim = virtualRuntime(state);
  sim.rt.target = "Phantom";
  sim.rt.select = (name) => {
    state.selectedName = name;
  };
  sim.rt.afterConnected = async () => {
    hooks += 1;
  };
  sim.rt.connect = async () => {
    const error = new Error("User rejected the request.");
    error.name = "WalletConnectionError";
    throw error;
  };
  await assert.rejects(runConnectJob(sim.rt), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.name, "WalletConnectionError");
    return true;
  });
  assert.equal(hooks, 0);
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

test("same wallet after Rozłącz is not already done", () => {
  const base = {
    phase: "connect" as const,
    target: "Phantom",
    selectedName: "Phantom",
    connected: true,
    connecting: false,
    disconnecting: true,
    targetReady: true,
  };
  assert.equal(nextConnectStep(base), "done");
  assert.equal(nextConnectStep({ ...base, forceFresh: true }), "wait");
  assert.equal(
    nextConnectStep({
      ...base,
      forceFresh: true,
      connected: false,
      selectedName: "Phantom",
    }),
    "clear",
  );
  assert.equal(
    nextConnectStep({
      ...base,
      forceFresh: true,
      connected: false,
      selectedName: null,
    }),
    "select",
  );
});

test("forceFresh reconnects a wallet that still looks connected", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: true,
    connecting: false,
    disconnecting: true,
    targetReady: true,
  };
  let disconnects = 0;
  const sim = virtualRuntime(state, {
    onDisconnect: () => {
      disconnects += 1;
      state.connected = false;
      state.selectedName = null;
      state.disconnecting = false;
    },
    onSelect: (name) => {
      state.selectedName = name;
    },
    onConnect: () => {
      if (state.selectedName === "Phantom") state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.forceFresh = true;
  await runConnectJob(sim.rt);
  assert.equal(disconnects, 1);
  assert.equal(sim.connects, 1);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Phantom");
});

test("extension lock after settle does not prompt the wallet again", async () => {
  const state: Sim = {
    selectedName: "Phantom",
    connected: true,
    connecting: false,
    disconnecting: false,
    targetReady: true,
  };
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      state.selectedName = name;
    },
    onConnect: () => {
      state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.adapterStillLive = () => false;
  sim.rt.afterConnected = async () => {
    state.connected = false;
    state.selectedName = null;
  };
  await runConnectJob(sim.rt);
  assert.equal(sim.connects, 0);
  assert.equal(state.connected, false);
  assert.equal(state.selectedName, null);
});

test("logout is armed only when a Privy session may exist", () => {
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Phantom",
      activeName: "Privy",
      privyAuthenticated: true,
    }),
    true,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Solflare",
      activeName: "Phantom",
      privyAuthenticated: false,
    }),
    false,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Phantom",
      activeName: "Privy",
      privyAuthenticated: false,
    }),
    true,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Privy",
      activeName: "Privy",
      privyAuthenticated: true,
    }),
    false,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: null,
      activeName: "Privy",
      privyAuthenticated: true,
    }),
    false,
  );
});

test("returning to Privy during an external switch asks for OTP", () => {
  assert.equal(
    decidePrivyPick({
      ready: true,
      authenticated: true,
      hasEmbeddedWallet: true,
      externalSwitch: true,
    }),
    "otp",
  );
  assert.equal(
    decidePrivyPick({
      ready: true,
      authenticated: true,
      hasEmbeddedWallet: true,
      externalSwitch: false,
    }),
    "connect",
  );
  assert.equal(
    decidePrivyPick({
      ready: true,
      authenticated: false,
      hasEmbeddedWallet: false,
      externalSwitch: false,
    }),
    "otp",
  );
  assert.equal(
    decidePrivyPick({
      ready: false,
      authenticated: true,
      hasEmbeddedWallet: true,
      externalSwitch: true,
    }),
    "not-ready",
  );
  assert.equal(
    decidePrivyPick({
      ready: true,
      authenticated: true,
      hasEmbeddedWallet: false,
      externalSwitch: false,
    }),
    "create",
  );
});

test("pinned address lasts only for the switch and dies with the adapter", () => {
  const pin = (
    over: Partial<Parameters<typeof nextPinnedAddress>[0]> = {},
  ) =>
    nextPinnedAddress({
      dropped: false,
      jobActive: true,
      adapterLive: true,
      liveAddress: "US51…ELFx",
      currentPin: null,
      ...over,
    });
  assert.equal(pin(), "US51…ELFx");
  assert.equal(pin({ liveAddress: null, currentPin: "US51…ELFx" }), "US51…ELFx");
  assert.equal(pin({ jobActive: false }), null);
  assert.equal(pin({ dropped: true }), null);
  assert.equal(pin({ adapterLive: false, currentPin: "US51…ELFx" }), null);
});

test("late logout restores a live Phantom and ignores a lock or Rozłącz", () => {
  const restore = (
    over: Partial<Parameters<typeof shouldRestoreExternalWallet>[0]> = {},
  ) =>
    shouldRestoreExternalWallet({
      target: "Phantom",
      dropped: false,
      guarding: true,
      superseded: false,
      selectedName: null,
      hookConnected: false,
      adapterConnected: true,
      adapterHasKey: true,
      ...over,
    });
  assert.equal(restore(), true);
  assert.equal(restore({ selectedName: "Phantom", hookConnected: false }), true);
  assert.equal(restore({ selectedName: "Phantom", hookConnected: true }), false);
  assert.equal(restore({ adapterConnected: false }), false);
  assert.equal(restore({ adapterHasKey: false }), false);
  assert.equal(restore({ dropped: true }), false);
  assert.equal(restore({ guarding: false }), false);
  assert.equal(restore({ superseded: true }), false);
  assert.equal(restore({ target: null }), false);
});

test("replay emits connect when the adapter is already live", () => {
  let emitted: unknown = null;
  const adapter = {
    name: "Phantom",
    connected: true,
    publicKey: { toBase58: () => "key" },
    emit: (_event: "connect", key: unknown) => {
      emitted = key;
    },
  };
  assert.equal(replayLiveConnect(adapter, "Phantom"), true);
  assert.equal(emitted, adapter.publicKey);
  adapter.connected = false;
  assert.equal(replayLiveConnect(adapter, "Phantom"), false);
  assert.equal(replayLiveConnect(adapter, "Solflare"), false);
  assert.equal(replayLiveConnect(null, "Phantom"), false);
});
