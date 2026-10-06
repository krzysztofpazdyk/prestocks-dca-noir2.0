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
