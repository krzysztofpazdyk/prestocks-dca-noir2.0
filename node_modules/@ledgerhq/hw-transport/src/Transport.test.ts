import Transport, {
  type DescriptorEvent,
  type Observer,
  type Subscription,
  StatusCodes,
} from "./Transport";
import { TransportRaceCondition } from "./errors";

type Options = { abortTimeoutMs?: number };
type Deferred<T> = { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void };

const noop = () => {};
const sw = (code: number) => Buffer.from([code >> 8, code & 0xff]);
const OK = sw(StatusCodes.OK);
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const observer = () => ({ next: jest.fn(), error: jest.fn(), complete: jest.fn() });
const counts = (o: ReturnType<typeof observer>) =>
  [o.next, o.complete, o.error].map(f => f.mock.calls.length);

function deferred<T>(): Deferred<T> {
  let resolve: (v: T) => void = noop;
  let reject: (e: unknown) => void = noop;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

class FakeTransport extends Transport {
  calls: Array<[number[], Options]> = [];
  reply: () => Promise<Buffer> = () => Promise.resolve(OK);

  override exchange(apdu: Buffer, options: Options = {}): Promise<Buffer> {
    this.calls.push([[...apdu], options]);
    return this.reply();
  }
}

describe("Transport", () => {
  it("exposes defaults, tracing and base implementations", async () => {
    const transport = new Transport({ context: { a: 1 }, logType: "custom" });
    const warn = jest.spyOn(console, "warn").mockImplementation(noop);
    const listener = jest.fn();

    expect(() => transport.exchange(Buffer.alloc(0))).toThrow("exchange not implemented");
    expect(transport.setScrambleKey("B0L0")).toBeUndefined();
    transport.setDebugMode();
    transport.updateTraceContext({ b: 2 });
    transport.on("e", listener);
    transport.emit("e", 42);
    transport.off("e", listener);
    transport.emit("e", 43);

    expect([
      transport.exchangeTimeout,
      transport.unresponsiveTimeout,
      transport.deviceModel,
    ]).toEqual([30000, 15000, null]);
    expect([transport.tracer.getType(), new Transport().tracer.getType()]).toEqual([
      "custom",
      "transport",
    ]);
    expect(transport.getTraceContext()).toEqual({ a: 1, b: 2 });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("setDebugMode is deprecated"));
    expect(listener.mock.calls).toEqual([[42]]);

    transport.setExchangeTimeout(1);
    transport.setExchangeUnresponsiveTimeout(2);
    transport.setTraceContext();
    expect([
      transport.exchangeTimeout,
      transport.unresponsiveTimeout,
      transport.getTraceContext(),
    ]).toEqual([1, 2, undefined]);
    await expect(transport.close()).resolves.toBeUndefined();
    warn.mockRestore();
  });

  it("send assembles the apdu, forwards options and validates the status word", async () => {
    const transport = new FakeTransport();
    transport.reply = () => Promise.resolve(sw(0x6a82));

    await expect(
      transport.send(0xe0, 1, 2, 3, Buffer.from([0xaa]), [0x6a82], { abortTimeoutMs: 5 }),
    ).resolves.toEqual(sw(0x6a82));
    await expect(transport.send(0xe0, 1, 2, 3)).rejects.toMatchObject({
      name: "TransportStatusError",
      statusCode: 0x6a82,
    });
    await expect(transport.send(0, 0, 0, 0, Buffer.alloc(256))).rejects.toMatchObject({
      id: "DataLengthTooBig",
      message: "data.length exceed 256 bytes limit. Got: 256",
    });
    expect(transport.calls).toEqual([
      [[0xe0, 1, 2, 3, 1, 0xaa], { abortTimeoutMs: 5 }],
      [[0xe0, 1, 2, 3, 0], {}],
    ]);
  });

  it.each<[string, Buffer, boolean, number[], unknown[]]>([
    ["relays every response then completes", OK, false, [2, 1, 0], []],
    [
      "stops on a bad status word",
      sw(0x6700),
      false,
      [0, 0, 1],
      [expect.objectContaining({ name: "TransportStatusError", statusCode: 0x6700 })],
    ],
    ["goes silent once unsubscribed", OK, true, [0, 0, 0], []],
  ])("exchangeBulk %s", async (_title, reply, unsubscribe, expected, errors) => {
    const transport = new FakeTransport();
    transport.reply = () => Promise.resolve(reply);
    const o = observer();

    const sub = transport.exchangeBulk([Buffer.from([1]), Buffer.from([2])], o);
    if (unsubscribe) sub.unsubscribe();
    await flush();

    expect(counts(o)).toEqual(expected);
    expect(o.error.mock.calls.flat()).toEqual(errors);
    expect(transport.calls.map(([apdu]) => apdu)).toEqual(expected[0] === 2 ? [[1], [2]] : [[1]]);
  });

  it("decorates app API methods with a scramble key and a re-entrancy lock", async () => {
    const transport = new FakeTransport();
    const setScrambleKey = jest.spyOn(transport, "setScrambleKey");
    const pending = deferred<string>();
    const api = {
      prefix: "app",
      slow: (): Promise<string> => pending.promise,
      greet(suffix: string): Promise<string> {
        return Promise.resolve(`${this.prefix}:${suffix}`);
      },
      fail: (): Promise<string> => Promise.reject(new Error("boom")),
    };
    transport.decorateAppAPIMethods(api, ["slow", "greet", "fail"], "BTC");

    const first = api.slow();
    expect(transport._appAPIlock).toBe("slow");
    await expect(api.greet("hi")).rejects.toMatchObject({
      id: "TransportLocked",
      message: "Ledger Device is busy (lock slow)",
    });

    pending.resolve("done");
    await expect(first).resolves.toBe("done");
    await expect(api.greet("hi")).resolves.toBe("app:hi");
    await expect(api.fail()).rejects.toThrow("boom");
    expect([transport._appAPIlock, setScrambleKey.mock.calls.flat()]).toEqual([
      null,
      ["BTC", "BTC", "BTC"],
    ]);
  });

  describe("exchangeAtomicImpl", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("serialises exchanges and always releases the guard", async () => {
      const transport = new FakeTransport();
      const job = deferred<string>();
      const first = transport.exchangeAtomicImpl(() => job.promise);

      expect(transport.exchangeBusyPromise).toBeInstanceOf(Promise);
      await expect(transport.exchangeAtomicImpl(() => Promise.resolve("x"))).rejects.toThrow(
        TransportRaceCondition,
      );

      job.resolve("a");
      await expect(first).resolves.toBe("a");
      await expect(
        transport.exchangeAtomicImpl(() => Promise.reject(new Error("boom"))),
      ).rejects.toThrow("boom");
      expect(transport.exchangeBusyPromise).toBeNull();
    });

    it.each<[string, (job: Deferred<string>) => void, string[]]>([
      ["responsive once the job resolves", job => job.resolve("v"), ["unresponsive", "responsive"]],
      ["nothing more when the job rejects", job => job.reject(new Error("e")), ["unresponsive"]],
    ])("emits unresponsive then %s", async (_title, settle, expected) => {
      const transport = new FakeTransport();
      transport.setExchangeUnresponsiveTimeout(500);
      const events: string[] = [];
      transport.on("unresponsive", () => events.push("unresponsive"));
      transport.on("responsive", () => events.push("responsive"));

      const job = deferred<string>();
      const run = transport.exchangeAtomicImpl(() => job.promise);
      jest.advanceTimersByTime(499);
      expect(events).toEqual([]);

      jest.advanceTimersByTime(1);
      settle(job);
      await run.catch(noop);
      expect(events).toEqual(expected);
    });
  });
});

describe("Transport.create", () => {
  const unsubscribe = jest.fn();
  const opened = new Transport();
  let openCalls: unknown[][] = [];
  let listenImpl: (o: Observer<DescriptorEvent<string>>) => Subscription;
  let openImpl: (descriptor?: unknown, timeoutMs?: number) => Promise<Transport>;

  class Fake extends Transport {
    static readonly listen = (o: Observer<DescriptorEvent<string>>) => listenImpl(o);
    static readonly open = (descriptor?: unknown, timeoutMs?: number) =>
      openImpl(descriptor, timeoutMs);
  }

  const emit = (fn: (o: Observer<DescriptorEvent<string>>) => void) => {
    listenImpl = o => {
      setTimeout(() => fn(o), 0);
      return { unsubscribe };
    };
  };

  beforeEach(() => {
    unsubscribe.mockClear();
    openCalls = [];
    listenImpl = () => ({ unsubscribe });
    openImpl = (descriptor, timeoutMs) => {
      openCalls.push([descriptor, timeoutMs]);
      return Promise.resolve(opened);
    };
  });

  it.each([[undefined], [5000]])(
    "handles descriptor events (listenTimeout=%s)",
    async listenTimeout => {
      emit(o => {
        o.next({ type: "add", descriptor: "d1" });
        o.complete();
      });
      await expect(Fake.create(1500, listenTimeout)).resolves.toBe(opened);
      expect([openCalls, unsubscribe.mock.calls.length]).toEqual([[["d1", 1500]], 1]);

      emit(o => o.complete());
      await expect(Fake.create(1500, listenTimeout)).rejects.toMatchObject({
        id: "NoDeviceFound",
        message: Transport.ErrorMessage_NoDeviceFound,
      });

      const failure = new Error("listen failed");
      emit(o => o.error(failure));
      await expect(Fake.create(1500, listenTimeout)).rejects.toBe(failure);
    },
  );

  it("rejects when open fails", async () => {
    openImpl = () => Promise.reject(new Error("nope"));
    emit(o => o.next({ type: "add", descriptor: "d1" }));
    await expect(Fake.create()).rejects.toThrow("nope");
  });

  it("rejects with ListenTimeout when no descriptor shows up", async () => {
    await expect(Fake.create(3000, 1)).rejects.toMatchObject({
      id: "ListenTimeout",
      message: Transport.ErrorMessage_ListenTimeout,
    });
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
