export type HistoryMode =
  | "disconnected"
  | "loading"
  | "list"
  | "list_stale"
  | "empty"
  | "error"
  | "not_ready";

/** Which History block to show. An RPC error keeps the last runs. */
export function historyView(
  status: string,
  runsLength: number,
  connected: boolean,
): HistoryMode {
  if (!connected) return "disconnected";
  if (status === "loading") return "loading";
  if (runsLength > 0 && (status === "ready" || status === "error")) {
    return status === "error" ? "list_stale" : "list";
  }
  if (status === "ready") return "empty";
  if (status === "error") return "error";
  if (status === "no_config" || status === "no_mint") return "not_ready";
  return "not_ready";
}
