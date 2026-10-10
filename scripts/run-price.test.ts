import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { runLots } from "../lib/position-value";
import { fillsFor } from "../lib/run-fills";
import {
  RUN_PRICE_DISC,
  RUN_PRICE_LEN,
  decodeRunPriceAccount,
  fetchRunPrices,
  mergeRunPrices,
  runPricePda,
} from "../lib/run-price";

const PROGRAM = new PublicKey("HajLzgcp6fyHVgVLFtwujnU53re47PSMJcQZZes8ZvbU");
const ANTHROPIC = new PublicKey("2yqHN6bCAJZHngGuRnuTKBB43F2S6GGLAJqgwZ4WVXT1");

function account(opts: {
  disc?: Buffer;
  len?: number;
  program?: PublicKey;
  wallet: PublicKey;
  runIndex?: bigint;
  mints?: PublicKey[];
  units?: bigint[];
  prices?: bigint[];
  ts?: bigint[];
  bump?: number;
}) {
  const len = opts.len ?? RUN_PRICE_LEN;
  const buf = Buffer.alloc(len);
  const disc = opts.disc ?? Buffer.from(RUN_PRICE_DISC);
  disc.copy(buf, 0, 0, Math.min(disc.length, len));
  if (len < RUN_PRICE_LEN) return { data: buf, owner: opts.program ?? PROGRAM };
  buf.set(opts.wallet.toBytes(), 8);
  buf.writeBigUInt64LE(opts.runIndex ?? BigInt(7), 40);
  const mints = opts.mints ?? [ANTHROPIC, ANTHROPIC, ANTHROPIC];
  mints.forEach((mint, i) => buf.set(mint.toBytes(), 48 + i * 32));
  buf.writeBigUInt64LE(BigInt(50_000_000), 144);
  (opts.units ?? [BigInt(2_000_000), BigInt(0), BigInt(0)]).forEach((n, i) =>
    buf.writeBigUInt64LE(n, 152 + i * 8),
  );
  (opts.prices ?? [BigInt(80_000_000), BigInt(0), BigInt(0)]).forEach((n, i) =>
    buf.writeBigUInt64LE(n, 176 + i * 8),
  );
  (opts.ts ?? [BigInt(1_700_000_000), BigInt(0), BigInt(-5)]).forEach((n, i) =>
    buf.writeBigInt64LE(n, 200 + i * 8),
  );
  buf[224] = opts.bump ?? 9;
  return { data: buf, owner: opts.program ?? PROGRAM };
}

test("discriminator is sha256(account:RunPrice) and PDA seeds are run_price", () => {
  const expect = createHash("sha256").update("account:RunPrice").digest().subarray(0, 8);
  assert.deepEqual(Buffer.from(RUN_PRICE_DISC), expect);
  const owner = Keypair.generate().publicKey;
  const [pda] = runPricePda(owner, 7, PROGRAM);
  const [again] = PublicKey.findProgramAddressSync(
    [Buffer.from("run_price"), owner.toBuffer(), new BN(7).toArrayLike(Buffer, "le", 8)],
    PROGRAM,
  );
  assert.equal(pda.toBase58(), again.toBase58());
});

test("decodes a valid RunPrice account", () => {
  const wallet = Keypair.generate().publicKey;
  const decoded = decodeRunPriceAccount(
    account({
      wallet,
      runIndex: BigInt(4),
      units: [BigInt(2_500_000), BigInt(1), BigInt(2)],
      prices: [BigInt(80_000_000), BigInt(3), BigInt(4)],
      ts: [BigInt(11), BigInt(12), BigInt(-5)],
      bump: 4,
    }),
    PROGRAM,
  );
  assert.ok(decoded);
  assert.equal(decoded.owner.toBase58(), wallet.toBase58());
  assert.equal(decoded.runIndex, 4);
  assert.equal(decoded.mints[0].toBase58(), ANTHROPIC.toBase58());
  assert.equal(decoded.usdcEach, BigInt(50_000_000));
  assert.equal(decoded.units[0], BigInt(2_500_000));
  assert.equal(decoded.pricesE6[0], BigInt(80_000_000));
  assert.equal(decoded.priceTs[2], BigInt(-5));
  assert.equal(decoded.bump, 4);
});

test("bad discriminator, bad length, wrong program, and a missing account are legacy", () => {
  const wallet = Keypair.generate().publicKey;
  const badDisc = Buffer.from(RUN_PRICE_DISC);
  badDisc[0] = badDisc[0] ^ 0xff;
  assert.equal(
    decodeRunPriceAccount(account({ wallet, disc: badDisc }), PROGRAM),
    null,
  );
  assert.equal(decodeRunPriceAccount(account({ wallet, len: 20 }), PROGRAM), null);
  assert.equal(
    decodeRunPriceAccount(
      account({ wallet, program: Keypair.generate().publicKey }),
      PROGRAM,
    ),
    null,
  );
  assert.equal(decodeRunPriceAccount(null, PROGRAM), null);

  const lots = runLots(
    [{ runIndex: 4, ts: 1, mints: [ANTHROPIC.toBase58()], amountsUsd: [50] }],
    new Map([[4, null]]),
  );
  assert.equal(lots[0].units, null);
  assert.equal(lots[0].buyPrice, null);
  assert.equal(lots[0].usdcCost, 50);
  assert.equal(lots[0].name, "Anthropic");
});

test("fetchRunPrices reports ok false when the RPC read throws", async () => {
  const owner = Keypair.generate().publicKey;
  const connection = {
    getMultipleAccountsInfo: async () => {
      throw new Error("rpc down");
    },
  } as unknown as Connection;
  const got = await fetchRunPrices(connection, owner, [3, 3, 4]);
  assert.equal(got.ok, false);
});

test("mergeRunPrices keeps previous entries when the read failed", () => {
  const prev = new Map<number, string | null>([
    [1, "keep"],
    [2, null],
  ]);
  const failed = new Map<number, string | null>([
    [1, null],
    [2, null],
  ]);
  const kept = mergeRunPrices(prev, { map: failed, ok: false });
  assert.equal(kept.get(1), "keep");
  assert.equal(kept.get(2), null);
  const replaced = mergeRunPrices(prev, { map: failed, ok: true });
  assert.equal(replaced.get(1), null);
});

test("fillsFor treats a zero price as no slot and keeps a positive fill", () => {
  const mint = "MintA";
  const runs = [{ runIndex: 4, mints: [mint] }];
  const zero = fillsFor(
    runs,
    new Map([
      [
        4,
        {
          mints: [{ toBase58: () => mint }],
          units: [BigInt(1_000_000)],
          pricesE6: [BigInt(0)],
        },
      ],
    ]),
  );
  assert.equal(zero[0].slots?.[0], null);
  const good = fillsFor(
    runs,
    new Map([
      [
        4,
        {
          mints: [{ toBase58: () => mint }],
          units: [BigInt(2_000_000)],
          pricesE6: [BigInt(3_500_000)],
        },
      ],
    ]),
  );
  assert.deepEqual(good[0].slots?.[0], { units: 2, price: 3.5 });
});
