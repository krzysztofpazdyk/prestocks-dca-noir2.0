/**
 * Whether keeper status authoritatively says this owner has auto-buy on.
 * `null` means the payload is not a status for this wallet (missing sign,
 * unreachable keeper, rejected signature, or no `enabled` field). Callers
 * must not turn the toggle Off on `null`.
 */
export function keeperEnabledForConnectedOwner(
  st: { ok?: boolean; enabled?: boolean; owner?: string; error?: string },
  wallet: string | null,
): boolean | null {
  if (!wallet) return null;
  const error = typeof st.error === "string" ? st.error : "";
  if (
    error === "wallet_required" ||
    error === "signature_rejected" ||
    error.startsWith("sign_rejected")
  ) {
    return null;
  }
  // keeper_unreachable with no enabled field is unknown. A payload that still
  // carries enabled + this owner is authoritative; the banner handles the blip.
  if (error === "keeper_unreachable" && typeof st.enabled !== "boolean") {
    return null;
  }
  if (typeof st.enabled !== "boolean") return null;
  const configured =
    typeof st.owner === "string" && st.owner.trim() ? st.owner.trim() : null;
  if (!configured) return null;
  if (configured !== wallet) return false;
  return st.enabled;
}
