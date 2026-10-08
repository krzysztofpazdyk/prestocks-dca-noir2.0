import type { MockTokenBalance, RunRecordData, UserConfigData } from "@/lib/predca";

export type PredcaStatus =
  | "disconnected"
  | "loading"
  | "no_config"
  | "ready"
  | "no_mint"
  | "error";

export type ConfigState = "unknown" | "missing" | "present";

export type PredcaSnapshot = {
  config: UserConfigData | null;
  configState: ConfigState;
  vaultUsdc: number | null;
  ownerUsdc: number | null;
  solBalance: number | null;
  tokenBalances: MockTokenBalance[];
  runs: RunRecordData[];
  rpcError: string | null;
};

export const EMPTY_SNAPSHOT: PredcaSnapshot = {
  config: null,
  configState: "unknown",
  vaultUsdc: null,
  ownerUsdc: null,
  solBalance: null,
  tokenBalances: [],
  runs: [],
  rpcError: null,
};

export type RefreshOutcome =
  | {
      ok: true;
      config: UserConfigData | null;
      vaultUsdc: number | null;
      ownerUsdc: number | null;
      solBalance: number | null;
      tokenBalances: MockTokenBalance[];
      runs: RunRecordData[];
    }
  | { ok: false; error: string };

/** Success replaces the snapshot. Failure keeps the last-known fields and sets rpcError. */
export function nextSnapshotAfterRefresh(
  prev: PredcaSnapshot,
  outcome: RefreshOutcome,
): PredcaSnapshot {
  if (!outcome.ok) {
    return { ...prev, rpcError: outcome.error };
  }
  return {
    config: outcome.config,
    configState: outcome.config ? "present" : "missing",
    vaultUsdc: outcome.vaultUsdc,
    ownerUsdc: outcome.ownerUsdc,
    solBalance: outcome.solBalance,
    tokenBalances: outcome.tokenBalances,
    runs: outcome.runs,
    rpcError: null,
  };
}

export function derivePredcaStatus(i: {
  hasOwner: boolean;
  hasMint: boolean;
  loading: boolean;
  configState: ConfigState;
  rpcError: string | null;
}): PredcaStatus {
  if (!i.hasOwner) return "disconnected";
  if (!i.hasMint) return "no_mint";
  if (i.rpcError) return "error";
  if (i.configState === "present") return "ready";
  if (i.configState === "missing") return i.loading ? "loading" : "no_config";
  return "loading";
}

export type DepositPlan = "init_deposit" | "deposit" | "blocked";

export function depositPlan(
  configState: ConfigState,
  rpcError: string | null,
): DepositPlan {
  if (rpcError) return "blocked";
  if (configState === "present") return "deposit";
  if (configState === "missing") return "init_deposit";
  return "blocked";
}

export type WithdrawUi = "enabled" | "disabled" | "hidden";

export function withdrawUi(
  status: PredcaStatus,
  hasLastKnownConfig: boolean,
): WithdrawUi {
  if (status === "ready") return "enabled";
  if (status === "error" && hasLastKnownConfig) return "disabled";
  return "hidden";
}

export const RPC_READ_ERROR_MSG =
  "Brak połączenia z RPC Devnet — nie udało się odczytać konta. Dane mogą być nieaktualne. Kliknij Odśwież.";
