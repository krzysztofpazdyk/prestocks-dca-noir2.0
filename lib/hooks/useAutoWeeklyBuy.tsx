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
  keeperPushPrefs,
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
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const ignoreOffUntilRef = useRef(0);

  useEffect(() => {
    if (publicKey) ignoreOffUntilRef.current = Date.now() + 2000;
    let cancelled = false;
    void (async () => {
      const st = await keeperStatus();
      const local = readAutoWeeklyBuyPref();
      const owner = ownerRef.current;
      if (cancelled) return;
      const keeperOn = st.enabled === true;
      const configuredOwner =
        (typeof st.owner === "string" && st.owner.trim()) || null;
      const sameOwner =
        !!owner && !!configuredOwner && owner === configuredOwner;
      // Prefer same-owner + keeper status; do not auto-sign enable on mount
      // (wallet popup). Toggle / startCycle signs explicitly.
      const showOn = (sameOwner && keeperOn) || (sameOwner && local === true);
      setEnabledState(showOn);
      if (showOn) writeAutoWeeklyBuy(true);
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
      const prefsRes = await keeperPushPrefs(
        rankPrefsForApi(readRankPrefs()),
        owner,
        sign,
      );
      if (!prefsRes.ok) {
        throw new Error(
          prefsRes.error?.includes("signature") || prefsRes.error?.includes("sign_")
            ? `Podpis odrzucony (prefs): ${prefsRes.error}`
            : prefsRes.error || "prefs failed",
        );
      }
      const ran = await keeperEnable(owner, true, sign);
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
      setEnabledState(true);
      writeAutoWeeklyBuy(true);
      if (ran.skipped) {
        if (ran.reason === "busy") {
          throw new Error("Keeper jest w trakcie zakupu — spróbuj za chwilę.");
        }
        setPhase("idle");
        setDue(false);
        if (ran.nextAt) {
          setNextAt(Date.parse(ran.nextAt) || Date.now() + WEEK_MS);
        }
        setMessage(tRef.current("auto.status.next", {
          when: formatWarsawWhen(
            ran.nextAt ? Date.parse(ran.nextAt) : Date.now() + WEEK_MS,
            localeRef.current,
          ),
        }));
        return;
      }
      if (ran.names && ran.names.length >= 3) {
        setLastTop3(ran.names.map((name) => ({ name, score: 0 })));
      }
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
      setPhase("error");
      setMessage(tRef.current("auto.status.error", { reason }));
    } finally {
      cycleInFlight = false;
    }
  }, []);

  const tick = useCallback(async () => {
    if (!prefsReady) return;
    const st = await keeperStatus();
    const wallet = ownerRef.current;
    const configuredOwner =
      (typeof st.owner === "string" && st.owner.trim()) || null;
    const sameOwner =
      !!wallet && !!configuredOwner && wallet === configuredOwner;
    // Matching wallet: keeper/file enabled wins over localStorage OFF.
    if (sameOwner && st.enabled === true && !enabledRef.current) {
      setEnabledState(true);
      writeAutoWeeklyBuy(true);
    }
    // Non-matching connected wallet should not inherit another owner's ON.
    if (wallet && configuredOwner && !sameOwner && enabledRef.current) {
      setEnabledState(false);
    }
    const on = wallet && configuredOwner
      ? Boolean(sameOwner && (st.enabled === true || enabledRef.current))
      : Boolean(st.enabled === true || enabledRef.current);
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
