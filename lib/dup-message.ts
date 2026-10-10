/** Local copy after a duplicate recheck. Does not send the new transaction. */
export function dupOutcomeMessage(
  verdict: string,
): "dup.prevConfirmed" | null {
  if (verdict === "confirmed") return "dup.prevConfirmed";
  return null;
}
