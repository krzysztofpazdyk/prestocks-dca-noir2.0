/**
 * Optional v2 RunPrice account. Missing or invalid → caller treats the lot as legacy.
 * Decoder is manual: idl/predca.json is unchanged until the keeper brief lands.
 *
 * Layout after the 8-byte discriminator sha256("account:RunPrice")[0..8]:
 * owner pubkey · run_index u64 · mints [pubkey;3] · usdc_each u64 ·
 * units [u64;3] · prices_e6 [u64;3] · price_ts [i64;3] · bump u8
 * = 217 bytes, 225 with the discriminator.
 */

import { BN } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { programId } from "@/lib/predca";

/** sha256("account:RunPrice").subarray(0, 8) */
export const RUN_PRICE_DISC = Uint8Array.from([
  164, 96, 163, 110, 17, 106, 42, 211,
]);

export const RUN_PRICE_LEN = 225;

export type DecodedRunPrice = {
  owner: PublicKey;
  runIndex: number;
  mints: [PublicKey, PublicKey, PublicKey];
  usdcEach: bigint;
  units: [bigint, bigint, bigint];
  pricesE6: [bigint, bigint, bigint];
  priceTs: [bigint, bigint, bigint];
  bump: number;
};

export function runPricePda(
  owner: PublicKey,
  runIndex: number | BN,
  program: PublicKey = programId(),
): [PublicKey, number] {
  const idx = BN.isBN(runIndex) ? runIndex : new BN(runIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("run_price"), owner.toBuffer(), idx.toArrayLike(Buffer, "le", 8)],
    program,
  );
}

function readU64(data: Uint8Array, off: number): bigint {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(off, true);
}

function readI64(data: Uint8Array, off: number): bigint {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getBigInt64(off, true);
}

function readPubkey(data: Uint8Array, off: number): PublicKey {
  return new PublicKey(data.subarray(off, off + 32));
}

/**
 * null account → null (legacy). Bad discriminator, length, or program owner → null + warn.
 */
export function decodeRunPriceAccount(
  account: { data: Uint8Array; owner: PublicKey } | null,
  program: PublicKey,
): DecodedRunPrice | null {
  if (!account) return null;
  const data = account.data;
  if (data.length !== RUN_PRICE_LEN) {
    console.warn("RunPrice: zła długość", data.length);
    return null;
  }
  if (!account.owner.equals(program)) {
    console.warn("RunPrice: owner ≠ program");
    return null;
  }
  for (let i = 0; i < RUN_PRICE_DISC.length; i++) {
    if (data[i] !== RUN_PRICE_DISC[i]) {
      console.warn("RunPrice: zły dyskryminator");
      return null;
    }
  }
  let off = 8;
  const owner = readPubkey(data, off);
  off += 32;
  const runIndex = Number(readU64(data, off));
  off += 8;
  const mints: [PublicKey, PublicKey, PublicKey] = [
    readPubkey(data, off),
    readPubkey(data, off + 32),
    readPubkey(data, off + 64),
  ];
  off += 96;
  const usdcEach = readU64(data, off);
  off += 8;
  const units: [bigint, bigint, bigint] = [
    readU64(data, off),
    readU64(data, off + 8),
    readU64(data, off + 16),
  ];
  off += 24;
  const pricesE6: [bigint, bigint, bigint] = [
    readU64(data, off),
    readU64(data, off + 8),
    readU64(data, off + 16),
  ];
  off += 24;
  const priceTs: [bigint, bigint, bigint] = [
    readI64(data, off),
    readI64(data, off + 8),
    readI64(data, off + 16),
  ];
  off += 24;
  const bump = data[off];
  return { owner, runIndex, mints, usdcEach, units, pricesE6, priceTs, bump };
}

/** Batch-read RunPrice PDAs. RPC failure → all null (legacy) and a warning. */
export async function fetchRunPrices(
  connection: Connection,
  owner: PublicKey,
  runIndices: number[],
): Promise<Map<number, DecodedRunPrice | null>> {
  const program = programId();
  const unique = [...new Set(runIndices)];
  const out = new Map<number, DecodedRunPrice | null>();
  for (const idx of unique) out.set(idx, null);
  try {
    for (let i = 0; i < unique.length; i += 100) {
      const slice = unique.slice(i, i + 100);
      const pdas = slice.map((idx) => runPricePda(owner, idx, program)[0]);
      const infos = await connection.getMultipleAccountsInfo(pdas);
      infos.forEach((info, j) => {
        out.set(slice[j], decodeRunPriceAccount(info, program));
      });
    }
  } catch (e) {
    console.warn("RunPrice: odczyt nieudany, loty legacy", e);
  }
  return out;
}
