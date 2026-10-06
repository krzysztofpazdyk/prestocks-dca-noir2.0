import assert from "node:assert/strict";
import test from "node:test";
import { parseAnchorError } from "../lib/predca";
import {
  UNCONFIRMED_TIMEOUT_MSG,
  isOnChainSignatureReject,
  isUnconfirmedTimeout,
  textKeepingSignature,
} from "../lib/vault-follow-up";

const SIG = "5".repeat(88);

function timeoutMessage(signature: string): string {
  return (
    "failed to send transaction: Transaction was not confirmed in 30.00 seconds. " +
    "It is unknown if it succeeded or failed. Check signature " +
    signature +
    " using the Solana Explorer or CLI tools."
  );
}

test("confirm timeout with a signature is pending, not a hard failure", () => {
  const err = new Error(timeoutMessage(SIG));
  err.name = "TransactionExpiredTimeoutError";
  (err as Error & { signature: string }).signature = SIG;
  assert.deepEqual(isUnconfirmedTimeout(err), { signature: SIG });
  assert.equal(isOnChainSignatureReject(err), false);
  assert.doesNotMatch(UNCONFIRMED_TIMEOUT_MSG, /ponownie|spróbuj|wpłać|deposit/i);
  assert.match(UNCONFIRMED_TIMEOUT_MSG, /explorerze/);
});

test("timeout phrase in the message is enough when the signature is only in the text", () => {
  const found = isUnconfirmedTimeout(new Error(timeoutMessage(SIG)));
  assert.deepEqual(found, { signature: SIG });
});

test("block height exceeded with a signature is the same pending case", () => {
  const err = new Error(`Signature ${SIG} has expired: block height exceeded.`);
  err.name = "TransactionExpiredBlockheightExceededError";
  (err as Error & { signature: string }).signature = SIG;
  assert.deepEqual(isUnconfirmedTimeout(err), { signature: SIG });
});

test("block height exceeded without a signature is not pending", () => {
  assert.equal(
    isUnconfirmedTimeout(new Error("block height exceeded")),
    null,
  );
});

test("a program reject is not an unconfirmed timeout", () => {
  const err = new Error(
    `Simulation failed: custom program error: 0x1. Signature ${SIG} has expired: block height exceeded.`,
  );
  assert.equal(isUnconfirmedTimeout(err), null);
  assert.equal(isUnconfirmedTimeout(new Error("User rejected the request.")), null);
  assert.equal(
    isUnconfirmedTimeout(new Error(`Raw transaction ${SIG} failed ({"err":"AccountNotFound"})`)),
    null,
  );
});

test("on-chain reject is an error; a later confirm wait is not", () => {
  assert.equal(
    isOnChainSignatureReject(new Error("Transakcja odrzucona przez Devnet.")),
    true,
  );
  assert.equal(
    isOnChainSignatureReject(
      new Error("Brak potwierdzenia transakcji na Devnet. Spróbuj ponownie."),
    ),
    false,
  );
});

test("parseAnchorError keeps an 88-character signature", () => {
  const msg = timeoutMessage(SIG);
  assert.ok(msg.length > 220);
  const parsed = parseAnchorError(new Error(msg));
  assert.ok(parsed.includes(SIG), parsed);
  assert.equal(textKeepingSignature(msg).includes(SIG), true);
});

test("parseAnchorError still truncates text that has no signature", () => {
  const msg = `nieznany blad ${"0".repeat(300)}`;
  assert.equal(parseAnchorError(new Error(msg)), `${msg.slice(0, 220)}…`);
});
