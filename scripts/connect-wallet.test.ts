import assert from "node:assert/strict";
import test from "node:test";
import {
  adapterHasAccount,
  applyDisconnectContinuation,
  armPrivyLogoutForChoice,
  capPromise,
  CONNECT_DISCONNECT_WAIT_MS,
  CONNECT_LOGOUT_RACE_MS,
  CONNECT_STALL_MS,
  ConnectTimeoutError,
  createDisconnectTracker,
  createOnceTask,
  decidePrivyPick,
  externalWalletChoiceEndsPrivy,
  failShowsError,
  nextConnectStep,
  nextPinnedAddress,
  privyOtpAfterLogout,
  replayLiveConnect,
  runConnectJob,
  runSwitchAttempt,
  shouldEndPrivySession,
  shouldRestoreExternalWallet,
  walletButtonLabel,
  type CapTimers,
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

function createVirtualClock(): CapTimers & {
  now: () => number;
  sleep: (ms: number) => Promise<void>;
} {
  let now = 0;
  type Timer = { at: number; fn: () => void; cleared: boolean };
  const timers: Timer[] = [];
  return {
    now: () => now,
    sleep: async (ms) => {
      const end = now + ms;
      for (;;) {
        const next = timers
          .filter((timer) => !timer.cleared && timer.at <= end)
          .sort((a, b) => a.at - b.at)[0];
        if (!next) break;
        now = next.at;
        next.cleared = true;
        next.fn();
        for (let i = 0; i < 20; i++) await Promise.resolve();
      }
      now = end;
    },
    setTimer(fn, ms) {
      const timer: Timer = { at: now + ms, fn, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearTimer(handle) {
      (handle as Timer).cleared = true;
    },
  };
}

async function flushMicrotasks() {
  for (let i = 0; i < 30; i++) await Promise.resolve();
}

function phantomReady(over: Partial<Sim> = {}): Sim {
  return {
    selectedName: "Phantom",
    connected: false,
    connecting: false,
    disconnecting: false,
    targetReady: true,
    ...over,
  };
}

test("rejected connect fails the attempt and logs out once", async () => {
  const state = phantomReady();
  const sim = virtualRuntime(state);
  sim.rt.target = "Phantom";
  let hooks = 0;
  sim.rt.afterConnected = async () => {
    hooks += 1;
  };
  sim.rt.connect = async () => {
    const error = new Error("User rejected");
    error.name = "WalletConnectionError";
    throw error;
  };
  let logouts = 0;
  const logout = createOnceTask(async () => {
    logouts += 1;
  });
  const seen: unknown[] = [];
  const result = await runSwitchAttempt(sim.rt, {
    logout,
    onError: (error) => seen.push(error),
  });
  assert.equal(result, "failed");
  assert.equal(seen.length, 1);
  assert.ok(seen[0] instanceof Error);
  assert.equal((seen[0] as Error).name, "WalletConnectionError");
  assert.equal((seen[0] as Error).message, "User rejected");
  assert.equal(logouts, 1);
  assert.equal(hooks, 0);
  await logout.start();
  assert.equal(logouts, 1);
});

test("cancel during disconnect logs out once and does not select the target", async () => {
  const state = phantomReady({
    selectedName: "Privy",
    connected: true,
  });
  let cancelled = false;
  const sim = virtualRuntime(state, {
    onDisconnect: () => {
      cancelled = true;
      state.connected = false;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.isCancelled = () => cancelled;
  let logouts = 0;
  const logout = createOnceTask(async () => {
    logouts += 1;
  });
  const result = await runSwitchAttempt(sim.rt, { logout });
  assert.equal(result, "cancelled");
  assert.equal(logouts, 1);
  await logout.start();
  assert.equal(logouts, 1);
  assert.equal(sim.selects.includes("Phantom"), false);
});

test("a connect that never settles times out and logs out once", async () => {
  const state = phantomReady();
  const sim = virtualRuntime(state);
  sim.rt.target = "Phantom";
  let logouts = 0;
  const logout = createOnceTask(async () => {
    logouts += 1;
  });
  const seen: unknown[] = [];
  const result = await runSwitchAttempt(sim.rt, {
    logout,
    onError: (error) => seen.push(error),
  });
  assert.equal(result, "timeout");
  assert.equal(seen.length, 1);
  assert.ok(seen[0] instanceof ConnectTimeoutError);
  assert.equal(logouts, 1);
  await logout.start();
  assert.equal(logouts, 1);
});

test("capPromise resolves at 3000 virtual ms and leaves the real promise pending", async () => {
  const clock = createVirtualClock();
  let realSettled = false;
  const real = new Promise<void>(() => {});
  void real.then(
    () => {
      realSettled = true;
    },
    () => {
      realSettled = true;
    },
  );
  let resolved = false;
  void capPromise(real, CONNECT_LOGOUT_RACE_MS, clock).then(() => {
    resolved = true;
  });
  await flushMicrotasks();
  await clock.sleep(2999);
  await flushMicrotasks();
  assert.equal(clock.now(), 2999);
  assert.equal(resolved, false);
  assert.equal(realSettled, false);
  await clock.sleep(1);
  await flushMicrotasks();
  assert.equal(clock.now(), 3000);
  assert.equal(resolved, true);
  assert.equal(realSettled, false);
});

test("a throwing logout does not reject the attempt", async () => {
  const state = phantomReady();
  const sim = virtualRuntime(state, {
    onConnect: () => {
      state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  const logout = createOnceTask(() => {
    throw new Error("logout down");
  });
  const leaks: unknown[] = [];
  const onLeak = (reason: unknown) => {
    leaks.push(reason);
  };
  process.on("unhandledRejection", onLeak);
  try {
    const result = await runSwitchAttempt(sim.rt, {
      logout,
      timers: createVirtualClock(),
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(result, "connected");
    assert.equal(leaks.length, 0);
    assert.equal(state.connected, true);
  } finally {
    process.off("unhandledRejection", onLeak);
  }
});

test("the connected callback runs once before a slow logout, then the pin drops", async () => {
  const state = phantomReady();
  const sim = virtualRuntime(state, {
    onConnect: () => {
      state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  let resolveLogout: () => void = () => {};
  let resolved = false;
  const deferred = new Promise<void>((resolve) => {
    resolveLogout = () => {
      resolved = true;
      resolve();
    };
  });
  const logout = createOnceTask(() => deferred);
  let hits = 0;
  let hitBeforeResolve = false;
  const resultP = runSwitchAttempt(sim.rt, {
    logout,
    timers: {
      setTimer: (fn, ms) => setTimeout(fn, ms),
      clearTimer: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    },
    onTargetConnected: () => {
      hits += 1;
      hitBeforeResolve = !resolved;
    },
  });
  for (let i = 0; i < 400 && hits === 0; i++) await Promise.resolve();
  assert.equal(hits, 1);
  assert.equal(hitBeforeResolve, true);
  assert.equal(resolved, false);
  resolveLogout();
  const result = await resultP;
  assert.equal(result, "connected");
  assert.equal(hits, 1);
  assert.equal(
    nextPinnedAddress({
      dropped: false,
      jobActive: false,
      adapterLive: true,
      liveAddress: "Phan…tom1",
      currentPin: "Phan…tom1",
      switchWithLogout: true,
    }),
    null,
  );
});

test("a job without Privy logout never pins and the label is the live address", async () => {
  const state = phantomReady({ selectedName: null });
  const address = "Phan…tom1";
  const pins: Array<string | null> = [];
  const sample = (jobActive: boolean) => {
    pins.push(
      nextPinnedAddress({
        dropped: false,
        jobActive,
        adapterLive: true,
        liveAddress: state.connected ? address : null,
        currentPin: address,
        switchWithLogout: false,
      }),
    );
  };
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      sample(true);
      state.selectedName = name;
    },
    onConnect: () => {
      sample(true);
      state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  const result = await runSwitchAttempt(sim.rt, {
    onTargetConnected: () => sample(true),
  });
  sample(false);
  assert.equal(result, "connected");
  assert.deepEqual(pins, pins.map(() => null));
  assert.ok(pins.length >= 2);
  assert.equal(
    walletButtonLabel({
      dropped: false,
      busy: false,
      connected: true,
      address,
      pinnedAddress: null,
      connectingLabel: "Łączenie…",
      selectLabel: "Zaloguj",
    }),
    address,
  );
});

test("failShowsError is false only when the target adapter is actually up", () => {
  assert.equal(
    failShowsError({
      target: "Phantom",
      selectedName: "Phantom",
      adapterConnected: true,
      adapterHasKey: true,
    }),
    false,
  );
  assert.equal(
    failShowsError({
      target: "Phantom",
      selectedName: "Phantom",
      adapterConnected: true,
      adapterHasKey: false,
    }),
    true,
  );
  assert.equal(
    failShowsError({
      target: "Phantom",
      selectedName: "Solflare",
      adapterConnected: true,
      adapterHasKey: true,
    }),
    true,
  );
  assert.equal(
    failShowsError({
      target: "Phantom",
      selectedName: "Phantom",
      adapterConnected: false,
      adapterHasKey: true,
    }),
    true,
  );
  assert.equal(
    failShowsError({
      target: null,
      selectedName: null,
      adapterConnected: false,
      adapterHasKey: false,
    }),
    true,
  );
});

test("reconnect waits out a disconnect that wipes when it resolves", async () => {
  const clock = createVirtualClock();
  const state = phantomReady({
    selectedName: "Phantom",
    connected: true,
    disconnecting: true,
  });
  let dropped = true;
  let selectNulls = 0;
  const tracker = createDisconnectTracker();
  let resolveDisc: () => void = () => {};
  const disc = new Promise<void>((resolve) => {
    resolveDisc = resolve;
  });
  const generation = tracker.begin(disc);
  tracker.bump();
  dropped = false;
  let connectAt = -1;
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      assert.ok(clock.now() >= 300);
      state.selectedName = name;
    },
    onConnect: () => {
      connectAt = clock.now();
      if (state.selectedName === "Phantom") state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.now = clock.now;
  sim.rt.sleep = clock.sleep;
  sim.rt.forceFresh = true;
  sim.rt.adapterStillLive = () => true;
  sim.rt.waitForPendingDisconnect = async () => {
    await clock.sleep(300);
    state.selectedName = null;
    state.connected = false;
    state.disconnecting = false;
    resolveDisc();
    await disc;
    assert.equal(
      applyDisconnectContinuation(tracker, generation, {
        selectNull: () => {
          selectNulls += 1;
        },
        setDropped: () => {
          dropped = true;
        },
        touchPin: () => {
          throw new Error("pin");
        },
      }),
      false,
    );
  };
  const result = await runSwitchAttempt(sim.rt);
  assert.equal(result, "connected");
  assert.ok(connectAt >= 300);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Phantom");
  assert.equal(dropped, false);
  assert.equal(selectNulls, 0);
  assert.equal(
    walletButtonLabel({
      dropped: false,
      busy: false,
      connected: true,
      address: "Phan…tom1",
      pinnedAddress: null,
      connectingLabel: "Łączenie…",
      selectLabel: "Zaloguj",
    }),
    "Phan…tom1",
  );
  assert.equal(CONNECT_DISCONNECT_WAIT_MS, 2_000);
  const hung = new Promise<void>(() => {});
  const capClock = createVirtualClock();
  let capped = false;
  void capPromise(hung, CONNECT_DISCONNECT_WAIT_MS, capClock).then(() => {
    capped = true;
  });
  await capClock.sleep(1999);
  await flushMicrotasks();
  assert.equal(capped, false);
  await capClock.sleep(1);
  await flushMicrotasks();
  assert.equal(capClock.now(), 2000);
  assert.equal(capped, true);
});

test("a wipe 100ms after done is repaired by the settle window", async () => {
  const clock = createVirtualClock();
  const state = phantomReady({ selectedName: null });
  let scheduled = false;
  const sim = virtualRuntime(state, {
    onSelect: (name) => {
      state.selectedName = name;
    },
    onConnect: () => {
      if (state.selectedName === "Phantom") state.connected = true;
    },
  });
  sim.rt.target = "Phantom";
  sim.rt.now = clock.now;
  sim.rt.sleep = clock.sleep;
  sim.rt.adapterStillLive = () => true;
  const result = await runSwitchAttempt(sim.rt, {
    onTargetConnected: () => {
      if (scheduled) return;
      scheduled = true;
      clock.setTimer(() => {
        state.selectedName = null;
        state.connected = false;
      }, 100);
    },
  });
  assert.equal(result, "connected");
  assert.equal(scheduled, true);
  assert.equal(state.connected, true);
  assert.equal(state.selectedName, "Phantom");
  assert.equal(sim.connects, 2);
  assert.equal(
    walletButtonLabel({
      dropped: false,
      busy: false,
      connected: true,
      address: "Phan…tom1",
      pinnedAddress: null,
      connectingLabel: "Łączenie…",
      selectLabel: "Zaloguj",
    }),
    "Phan…tom1",
  );
});

test("a bumped disconnect continuation does not clear the new attempt", async () => {
  const tracker = createDisconnectTracker();
  let dropped = false;
  let selectNulls = 0;
  let touched = false;
  let resolveDisc: () => void = () => {};
  const disc = new Promise<void>((resolve) => {
    resolveDisc = resolve;
  });
  const generation = tracker.begin(disc);
  tracker.bump();
  resolveDisc();
  await disc;
  assert.equal(
    applyDisconnectContinuation(tracker, generation, {
      selectNull: () => {
        selectNulls += 1;
      },
      setDropped: () => {
        dropped = true;
      },
      touchPin: () => {
        touched = true;
      },
    }),
    false,
  );
  assert.equal(selectNulls, 0);
  assert.equal(dropped, false);
  assert.equal(touched, false);
});

test("returning to Privy waits at most 3s for logout, then logs in once", async () => {
  const hung = createVirtualClock();
  let lateLogins = 0;
  const pending = new Promise<void>(() => {});
  const late = privyOtpAfterLogout({
    pending,
    authenticated: true,
    logout: async () => {
      throw new Error("unused");
    },
    login: () => {
      lateLogins += 1;
    },
    capMs: 3000,
    timers: hung,
  });
  await hung.sleep(2999);
  await flushMicrotasks();
  assert.equal(lateLogins, 0);
  await hung.sleep(1);
  await late;
  assert.equal(hung.now(), 3000);
  assert.equal(lateLogins, 1);

  const quick = createVirtualClock();
  let resolvePending: () => void = () => {};
  const finishing = new Promise<void>((resolve) => {
    resolvePending = resolve;
  });
  quick.setTimer(() => resolvePending(), 100);
  let quickLogins = 0;
  let loginAt = -1;
  const quickDone = privyOtpAfterLogout({
    pending: finishing,
    authenticated: true,
    logout: async () => {
      throw new Error("unused");
    },
    login: () => {
      quickLogins += 1;
      loginAt = quick.now();
    },
    capMs: 3000,
    timers: quick,
  });
  await quick.sleep(100);
  await quickDone;
  assert.equal(quickLogins, 1);
  assert.equal(loginAt, 100);
});

test("Rozłącz logout still in flight sends Privy through OTP", async () => {
  assert.equal(
    decidePrivyPick({
      ready: true,
      authenticated: true,
      hasEmbeddedWallet: true,
      externalSwitch: false,
      logoutInFlight: true,
    }),
    "otp",
  );
  const clock = createVirtualClock();
  let resolveLogout: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    resolveLogout = resolve;
  });
  clock.setTimer(() => resolveLogout(), 100);
  let logins = 0;
  let logoutCalls = 0;
  const done = privyOtpAfterLogout({
    pending,
    authenticated: true,
    logout: async () => {
      logoutCalls += 1;
    },
    login: () => {
      logins += 1;
    },
    capMs: CONNECT_LOGOUT_RACE_MS,
    timers: clock,
  });
  await clock.sleep(100);
  await done;
  assert.equal(logoutCalls, 0);
  assert.equal(logins, 1);
  assert.equal(clock.now(), 100);
});

test("Phantom arms logout when Privy is not ready; Privy does not", () => {
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Phantom",
      privyReady: false,
      privyAuthenticated: false,
      activeName: undefined,
    }),
    true,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Solflare",
      privyReady: false,
      privyAuthenticated: false,
      activeName: undefined,
    }),
    true,
  );
  assert.equal(
    armPrivyLogoutForChoice({
      nextName: "Privy",
      privyReady: false,
      privyAuthenticated: false,
      activeName: undefined,
    }),
    false,
  );
});
