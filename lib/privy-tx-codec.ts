import {
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Privy `signTransaction` takes encoded bytes and returns bytes.
 * Anchor and wallet-adapter use web3.js Transaction objects.
 * A 64-byte result is a raw ed25519 signature, not a serialized transaction.
 */
export function serializeTransactionForPrivy(
  transaction: Transaction | VersionedTransaction,
): Uint8Array {
  if (transaction instanceof VersionedTransaction) {
    return transaction.serialize();
  }
  return new Uint8Array(
    transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }),
  );
}

export function signedBytesToTransaction<
  T extends Transaction | VersionedTransaction,
>(original: T, signed: Uint8Array, feePayer: PublicKey): T {
  if (!(signed instanceof Uint8Array) || signed.byteLength === 0) {
    throw new Error("Privy nie zwrócił podpisanej transakcji.");
  }
  if (original instanceof VersionedTransaction) {
    if (signed.byteLength === 64) {
      const tx = VersionedTransaction.deserialize(original.serialize());
      tx.addSignature(feePayer, signed);
      return tx as T;
    }
    return VersionedTransaction.deserialize(signed) as T;
  }
  if (signed.byteLength === 64) {
    const tx = Transaction.from(
      original.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    );
    tx.addSignature(feePayer, Buffer.from(signed));
    return tx as T;
  }
  return Transaction.from(Buffer.from(signed)) as T;
}

export function signatureBytesFromPrivy(signature: Uint8Array): Uint8Array {
  if (!(signature instanceof Uint8Array) || signature.byteLength === 0) {
    throw new Error("Privy nie zwrócił bajtów podpisu.");
  }
  return signature;
}
