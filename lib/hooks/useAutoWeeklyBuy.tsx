"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  keeperDisable,
  keeperEnable,
  keeperHealth,
  keeperStatus,
} from "@/lib/keeper-client";
import { rankPrefsForApi, readRankPrefs } from "@/lib/rank-prefs";
import { DEFAULT_SETTINGS, type JevRank } from "@/lib/mock-data";
import {
  AUTO_BUY_TICK_MS,
  WEEK_MS,
  formatWarsawWhen,
  readAutoBuyMeta,
  readAutoWeeklyBuyPref,
  writeAutoBuyMeta,
  writeAutoWeeklyBuy,
  writeWeeklyBudgetUsd,
  type AutoBuyBlockReason,
} from "@/lib/auto-weekly-buy";
import { useI18n } from "@/lib/i18n";
import { usePredca } from "@/lib/hooks/usePredca";

export type AutoBuyPhase =
  | "idle"
  | "ranking"
  | "buying"
  | "ok"
  | "error"
  | "blocked";

export type AutoWeeklyBuyApi = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  /** Confirm-enable: start keeper (UI does not buy). */
  startCycle: (weeklyBudgetUsd: number) => Promise<void>;
  phase: AutoBuyPhase;
  blockReason: AutoBuyBlockReason | null;
  message: string | null;
  nextAt: number | null;
  nextLabel: string | null;
  lastTop3: JevRank[];
  due: boolean;
};

const AutoWeeklyBuyContext = createContext<AutoWeeklyBuyApi | null>(null);

/** Module lock — Strict Mode remounts must not double-enable. */
let cycleInFlight = false;

function useAutoWeeklyBuyImpl(): AutoWeeklyBuyApi {
  const { connected, publicKey, signMessage } = useWallet();
  const predca = usePredca();
  const { locale, t } = useI18n();
  const [enabled, setEnabledState] = useState(DEFAULT_SETTINGS.autoWeeklyBuy);
  const [prefsReady, setPrefsReady] = useState(false);
  const [phase, setPhase] = useState<AutoBuyPhase>("idle");
  const [blockReason, setBlockReason] = useState<AutoBuyBlockReason | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [lastTop3, setLastTop3] = useState<JevRank[]>([]);
  const [due, setDue] = useState(false);

  const predcaRef = useRef(predca);
  predcaRef.current = predca;
  const connectedRef = useRef(connected);
  connectedRef.current = connected;
  const ownerRef = useRef(publicKey?.toBase58() ?? null);
  ownerRef.current = publicKey?.toBase58() ?? null;
  const signMessageRef = useRef(signMessage);
  signMessageRef.current = signMessage;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const tRef = useRef(t);
  tRef.current = t;
  const ignoreOffUntilRef = useRef(0);

  useEffect(() => {
    if (publicKey) ignoreOffUntilRef.current = Date.now() + 2000;
    let cancelled = false;
    void (async () => {
      const owner = ownerRef.current;
      const st = await keeperStatus(owner ?? undefined);
      const local = readAutoWeeklyBuyPref();
      if (cancelled) return;
      const keeperOn = st.enabled === true;
      const configuredOwner =
        (typeof st.owner === "string" && st.owner.trim()) || null;
      const sameOwner =
        !owner || !configuredOwner || owner === configuredOwner;
      // Per-owner status when wallet known; do not auto-sign enable on mount.
      // Keeper is source of truth for this wallet — never OR local over keeper Off.
      const showOn = Boolean(owner) && sameOwner && keeperOn;
      setEnabledState(showOn);
      writeAutoWeeklyBuy(showOn);
      setPrefsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey]);
  const setEnabled = useCallback((value: boolean) => {
    if (!value && Date.now() < ignoreOffUntilRef.current) {
      return;
    }
    setEnabledState(value);
    writeAutoWeeklyBuy(value);
    if (!value) {
      const owner = ownerRef.current;
      const sign = signMessageRef.current;
      if (owner && sign) {
        void (async () => {
          const res = await keeperDisable(owner, sign);
          if (!res.ok) {
            // Idempotent off: keeper already off → success (no scary mismatch error).
            const st = await keeperStatus(owner);
            if (st.enabled === false) {
              setPhase("idle");
              setMessage(tRef.current("auto.status.off"));
              return;
            }
            setPhase("error");
            setMessage(
              res.error?.includes("signature") || res.error?.includes("sign_")
                ? `Podpis odrzucony: ${res.error}`
                : res.error || "Keeper disable failed",
            );
          }
        })();
      }
    }
  }, []);

  const startCycle = useCallback(async (weeklyBudgetUsd: number) => {
    const amount = Number(weeklyBudgetUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPhase("error");
      setMessage("Budżet tygodniowy musi być > 0.");
      return;
    }
    const owner = ownerRef.current;
    if (!owner) {
      setPhase("blocked");
      setBlockReason("need_wallet");
      setMessage(tRef.current("auto.status.needWallet"));
      return;
    }
    if (cycleInFlight) return;
    cycleInFlight = true;
    try {
      const sign = signMessageRef.current;
      if (!sign) {
        setPhase("blocked");
        setBlockReason("need_wallet");
        setMessage("Portfel musi obsługiwać signMessage (włącz auto-buy wymaga podpisu).");
        return;
      }
      const alive = await keeperHealth();
      if (!alive) {
        setPhase("error");
        setMessage(tRef.current("auto.status.keeperDown"));
        return;
      }
      writeWeeklyBudgetUsd(amount);
      const p = predcaRef.current;
      if (
        connectedRef.current &&
        p.mint &&
        (p.weeklyBudgetUsd == null ||
          Math.abs(p.weeklyBudgetUsd - amount) > 0.000001)
      ) {
        const sig = await p.setWeeklyBudget(amount);
        if (!sig) {
          setPhase("error");
          setMessage(
            p.error || "Nie udało się zapisać kwoty tygodniowej.",
          );
          return;
        }
      }
      writeAutoBuyMeta({
        lastAttemptMs: Date.now(),
        lastSuccessMs: 0,
        lastError: null,
        cycleStartedAtMs: Date.now(),
        cycleBudgetUsd: amount,
      });
      setPhase("buying");
      setMessage(tRef.current("auto.status.buyingKeeper"));
      // One signature: daemon syncs prefs on enable.
      const ran = await keeperEnable(
        owner,
        true,
        sign,
        rankPrefsForApi(readRankPrefs()),
      );
      if (!ran.ok) {
        const err = ran.error || tRef.current("auto.status.keeperDown");
        if (
          String(err).includes("signature") ||
          String(err).includes("sign_") ||
          String(err).includes("Unauthorized") ||
          String(err).includes("403") ||
          String(err).includes("401")
        ) {
          throw new Error(`Podpis odrzucony: ${err}`);
        }
        throw new Error(err);
      }
      const forceOff = async (reason: string) => {
        setEnabledState(false);
        writeAutoWeeklyBuy(false);
        try {
          await keeperDisable(owner, sign);
        } catch {
          /* best-effort */
        }
        setPhase("error");
        const vaultish = /vault|USDC|za mało|Za mało|vault_low/i.test(reason);
        setMessage(
          vaultish
            ? tRef.current("auto.status.vaultLow", {
                have: "?",
                need: amount.toFixed(2),
              })
            : tRef.current("auto.status.error", { reason }),
        );
      };
      if (ran.skipped) {
        if (ran.reason === "busy") {
          // Busy-only: temporary — do not commit enabled.
          setPhase("buying");
          setMessage("Keeper jest w trakcie zakupu — spróbuj za chwilę.");
          return;
        }
        const err = String(ran.error || ran.reason || "purchase skipped");
        await forceOff(err);
        return;
      }
      if (!ran.signature || !ran.names || ran.names.length < 3) {
        await forceOff("Keeper returned success without a completed purchase.");
        return;
      }
      // Real purchase succeeded — only now commit enabled (UI + local cache).
      setEnabledState(true);
      writeAutoWeeklyBuy(true);
      setLastTop3(ran.names.map((name) => ({ name, score: 0 })));
      writeAutoBuyMeta({
        lastAttemptMs: Date.now(),
        lastSuccessMs: Date.now(),
        lastError: null,
        cycleStartedAtMs: Date.now(),
        cycleBudgetUsd: amount,
      });
      setPhase("ok");
      setDue(false);
      setNextAt(Date.now() + WEEK_MS);
      setMessage(
        tRef.current("auto.status.ok", {
          amount: (ran.amountUsd ?? amount).toFixed(2),
          tokens: (ran.names ?? []).join(" · "),
        }),
      );
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      setEnabledState(false);
      writeAutoWeeklyBuy(false);
      try {
        const o = ownerRef.current;
        const s = signMessageRef.current;
        if (o && s) await keeperDisable(o, s);
      } catch {
        /* best-effort */
      }
      setPhase("error");
      const vaultish = /vault|USDC|za mało|Za mało|vault_low/i.test(reason);
      setMessage(
        vaultish
          ? tRef.current("auto.status.vaultLow", {
              have: "?",
              need: "?",
            })
          : tRef.current("auto.status.error", { reason }),
      );
    } finally {
      cycleInFlight = false;
    }
  }, []);

  const tick = useCallback(async () => {
    if (!prefsReady) return;
    const wallet = ownerRef.current;
    const st = await keeperStatus(wallet ?? undefined);
    const configuredOwner =
      (typeof st.owner === "string" && st.owner.trim()) || null;
    const sameOwner =
      !!wallet && !!configuredOwner && wallet === configuredOwner;
    // Matching wallet: keeper enabled is sole source of truth (never OR local).
    if (sameOwner && st.enabled === true && !enabledRef.current) {
      setEnabledState(true);
      writeAutoWeeklyBuy(true);
    }
    if (sameOwner && st.enabled === false && enabledRef.current) {
      setEnabledState(false);
      writeAutoWeeklyBuy(false);
    }
    // Non-matching connected wallet should not inherit another owner's ON.
    if (wallet && configuredOwner && !sameOwner && enabledRef.current) {
      setEnabledState(false);
      writeAutoWeeklyBuy(false);
    }
    const on = Boolean(wallet && configuredOwner && sameOwner && st.enabled === true);
    if (!on) {
      setPhase("idle");
      setDue(false);
      setBlockReason("off");
      setMessage(tRef.current("auto.status.off"));
      return;
    }
    if (!st.ok && st.error === "keeper_unreachable") {
      setPhase("blocked");
      setBlockReason("not_ready");
      setMessage(tRef.current("auto.status.keeperDown"));
      return;
    }
    if (st.nextAt) {
      const next = Date.parse(st.nextAt);
      if (Number.isFinite(next)) setNextAt(next);
      setDue(false);
    }
    if (st.phase === "ok" && st.signature) {
      setPhase("ok");
      if (st.names && st.names.length >= 3) {
        setLastTop3(st.names.map((name) => ({ name, score: 0 })));
      }
      if (st.amountUsd != null && st.names) {
        setMessage(
          tRef.current("auto.status.ok", {
            amount: st.amountUsd.toFixed(2),
            tokens: st.names.join(" · "),
          }),
        );
      }
      return;
    }
    if (st.phase === "error" && st.error) {
      setPhase("error");
      setMessage(tRef.current("auto.status.error", { reason: st.error }));
      return;
    }
    if (st.phase === "buying" || st.phase === "ranking") {
      setPhase("buying");
      setMessage(tRef.current("auto.status.buyingKeeper"));
      return;
    }
    setPhase("idle");
    setBlockReason(null);
  }, [prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, AUTO_BUY_TICK_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [prefsReady, enabled, tick]);

  const nextLabel =
    nextAt != null ? formatWarsawWhen(nextAt, locale) : null;

  return useMemo(
    () => ({
      enabled,
      setEnabled,
      startCycle,
      phase,
      blockReason,
      message,
      nextAt,
      nextLabel,
      lastTop3,
      due,
    }),
    [
      enabled,
      setEnabled,
      startCycle,
      phase,
      blockReason,
      message,
      nextAt,
      nextLabel,
      lastTop3,
      due,
    ],
  );
}

export function AutoWeeklyBuyProvider({ children }: { children: ReactNode }) {
  const value = useAutoWeeklyBuyImpl();
  return (
    <AutoWeeklyBuyContext.Provider value={value}>
      {children}
    </AutoWeeklyBuyContext.Provider>
  );
}

export function AutoWeeklyBuyBanner() {
  const value = useAutoWeeklyBuy();
  const { t } = useI18n();
  const showBanner =
    value.phase === "ranking" ||
    value.phase === "buying" ||
    value.phase === "error" ||
    (value.phase === "ok" && value.message != null);
  if (!showBanner || !value.message) return null;
  return (
    <div
      role="status"
      className={`border-b px-4 py-2 text-center text-xs ${
        value.phase === "error"
          ? "border-[#f8717133] bg-[#f8717111] text-[#fca5a5]"
          : "border-[#2dd4bf33] bg-[#2dd4bf11] text-[#2dd4bf]"
      }`}
    >
      {value.phase === "ranking"
        ? t("auto.banner.ranking")
        : value.phase === "buying"
          ? value.message || t("auto.banner.buying")
          : value.message}
    </div>
  );
}

export function useAutoWeeklyBuy(): AutoWeeklyBuyApi {
  const ctx = useContext(AutoWeeklyBuyContext);
  if (!ctx) {
    throw new Error("useAutoWeeklyBuy must be used within AutoWeeklyBuyProvider");
  }
  return ctx;
}
