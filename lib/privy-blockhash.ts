/**
 * A legacy transaction may be refreshed only when every existing signature
 * belongs to the fee payer. Replacing `recentBlockhash` after another signer
 * has signed invalidates that signature.
 */
export function hasForeignSignature(
  entries: ReadonlyArray<{ pubkey: string; signed: boolean }>,
  feePayer: string,
): boolean {
  return entries.some((entry) => entry.signed && entry.pubkey !== feePayer);
}

/**
 * Privy shows "Transaction signed!" and only sends after Close. A slow close
 * expires the blockhash (simulation: Blockhash not found). Rebuild and prompt
 * once. Phantom and Solflare stay on a single attempt. A second failure
 * propagates so the caller can show an honest error.
 */
export async function withOneStaleBlockhashRetry<T>(
  isPrivy: boolean,
  submit: () => Promise<T>,
): Promise<T> {
  try {
    return await submit();
  } catch (error) {
    if (!isPrivy || !isStaleBlockhashError(error)) throw error;
    return await submit();
  }
}

/** True when a send/confirm failure is an expired or missing blockhash. */
export function isStaleBlockhashError(error: unknown): boolean {
  const chunks: string[] = [];
  if (error instanceof Error) chunks.push(error.message);
  if (error && typeof error === "object") {
    const record = error as { message?: unknown; logs?: unknown };
    if (typeof record.message === "string") chunks.push(record.message);
    if (Array.isArray(record.logs)) chunks.push(record.logs.map(String).join("\n"));
  }
  chunks.push(String(error));
  return /blockhash not found|blockhash.*expired|expired blockhash|transaction expired/i.test(
    chunks.join("\n"),
  );
}
