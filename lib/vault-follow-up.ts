/** Re-read the vault after the signature is confirmed or finalized. */
export const POST_CONFIRM_VAULT_POLL_MS = 45_000;

/**
 * Further reads after the button is released. A confirmed transaction can
 * still show the previous vault balance on public Devnet RPC.
 */
export const CONFIRMED_VAULT_BACKGROUND_POLL_MS = 30_000;

/** Shown when the signature landed but the vault balance has not moved yet. */
export const CONFIRMED_VAULT_LAG_MSG =
  "Potwierdzono on-chain; saldo odświeża się. Odśwież Overview albo sprawdź transakcję w explorerze.";

/**
 * Confirmed signature + a flat vault is RPC lag, not a failed deposit.
 * Never tell the user to send the same deposit again.
 */
export function outcomeAfterVaultCheck(input: {
  confirmed: boolean;
  increased: boolean;
  success: string;
}): { ok: string | null; error: string | null } {
  if (input.increased) return { ok: input.success, error: null };
  if (input.confirmed) return { ok: CONFIRMED_VAULT_LAG_MSG, error: null };
  return {
    ok: null,
    error: "Nie potwierdzono podpisu transakcji. Sprawdź explorer.",
  };
}

/** Solana transaction signatures are 64 bytes, base58, about 87–88 characters. */
export const TX_SIGNATURE_RE = /[1-9A-HJ-NP-Za-km-z]{80,90}/;

/**
 * Shown when sendAndConfirm hit the ~30s confirm timeout but the signature
 * was already broadcast. Not a failure and not a prompt to send again.
 */
export const UNCONFIRMED_TIMEOUT_MSG =
  "Transakcja wysłana. Devnet jeszcze nie potwierdził — nie wysyłaj jej drugi raz. Sprawdź podpis w explorerze.";

/** confirmLanded gave up. No second-send nudge. */
export const CONFIRM_STILL_PENDING_MSG =
  "Brak potwierdzenia transakcji na Devnet.";

function errorName(err: unknown): string {
  if (err instanceof Error) return err.name;
  if (err && typeof err === "object" && "name" in err) {
    const name = (err as { name?: unknown }).name;
    if (typeof name === "string") return name;
  }
  return "";
}

function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

function asTxSignature(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(trimmed) ? trimmed : null;
}

/**
 * Anchor / web3.js confirm timeout where the signature may already have landed.
 * `block height exceeded` counts only when a signature is present, so a program
 * reject is not treated as "still pending".
 */
export function isUnconfirmedTimeout(err: unknown): { signature: string } | null {
  if (err == null) return null;
  const name = errorName(err);
  const message = errorMessage(err);
  const fromField =
    err && typeof err === "object" && "signature" in err
      ? asTxSignature((err as { signature?: unknown }).signature)
      : null;
  const fromMessage = message.match(TX_SIGNATURE_RE)?.[0] ?? null;
  const signature = fromField ?? (fromMessage && asTxSignature(fromMessage));
  if (!signature) return null;

  if (
    name === "TransactionExpiredTimeoutError" ||
    /Transaction was not confirmed in/i.test(message)
  ) {
    return { signature };
  }

  const blockHeight =
    name === "TransactionExpiredBlockheightExceededError" ||
    /block height exceeded/i.test(message);
  if (!blockHeight) return null;
  if (/simulation failed|custom program error|User rejected|AnchorError/i.test(message)) {
    return null;
  }
  return { signature };
}

/** confirmLanded throws this when the signature status has `err`. */
export function isOnChainSignatureReject(err: unknown): boolean {
  return /odrzucona przez Devnet/i.test(errorMessage(err));
}

/**
 * Keep a base58 signature intact. Truncate only the text around it.
 * Messages with no signature still stop at `limit`.
 */
export function textKeepingSignature(text: string, limit = 220): string {
  const trimmed = text.trim();
  if (trimmed.length <= limit) return trimmed;
  const match = TX_SIGNATURE_RE.exec(trimmed);
  if (!match || match.index == null) return `${trimmed.slice(0, limit)}…`;
  const sig = match[0];
  if (sig.length >= limit) return sig;
  const before = trimmed.slice(0, match.index).replace(/\s+$/, "");
  const room = limit - sig.length - 1;
  const head =
    before.length > room ? `${before.slice(0, Math.max(0, room - 1))}…` : before;
  return head ? `${head} ${sig}` : sig;
}
