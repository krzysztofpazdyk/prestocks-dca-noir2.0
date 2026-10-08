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
import { useKeeperSignMessage } from "@/components/PrivyWalletBridge";
import {
  clearStatusAuthCache,
  keeperDisable,
  keeperEnable,
  keeperHealth,
  keeperHealthInfo,
  keeperNextBuyAtMs,
  keeperStatus,
  type KeeperMode,
  type KeeperRunResult,
} from "@/lib/keeper-client";
import { rankPrefsForApi, readRankPrefs } from "@/lib/rank-prefs";
import { DEFAULT_SETTINGS, type JevRank } from "@/lib/mock-data";
import {
  AUTO_BUY_TICK_MS,
  BANNER_HOLD_MS,
  ENABLE_PENDING_POLL_MS,
  WEEK_MS,
  canCommitEnabledFromStatus,
  cleanupOwnerForFailedCycle,
  isBannerHoldActive,
  resolvePendingEnable,
  pendingEnableStillFor,
  shouldCommitAutoBuyEnabled,
  shouldPollInProgressEnable,
  shouldSendEnable,
  formatWarsawWhen,
  writeAutoBuyMeta,
  writeAutoWeeklyBuy,
  writeWeeklyBudgetUsd,
  type AutoBuyBlockReason,
  type EnableStatusBaseline,
} from "@/lib/auto-weekly-buy";
import { useI18n } from "@/lib/i18n";
import { usePredca } from "@/lib/hooks/usePredca";
import { keeperEnabledForConnectedOwner } from "@/lib/keeper-enabled";
import { unresolvedSignatureBlocksTx } from "@/lib/vault-follow-up";

export type AutoBuyPhase =
  | "idle"
  | "ranking"
  | "buying"
  | "pending"
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
  /** From daemon /health|/status — same flag that gates real txs. */
  keeperMode: KeeperMode | null;
};

const AutoWeeklyBuyContext = createContext<AutoWeeklyBuyApi | null>(null);

/** Stable id for a keeper purchase so a new run refreshes on-chain history once. */
function keeperRunMarker(st: KeeperRunResult): string | null {
  if (typeof st.signature === "string" && st.signature.length > 0) {
    return `sig:${st.signature}`;
  }
  const ts = st.lastRunTs ?? st.last_run_ts ?? st.lastBuy ?? st.last_buy;
  if (ts == null || ts === "") return null;
  return `ts:${String(ts)}`;
}

/** Module lock — Strict Mode remounts must not double-enable. */
let cycleInFlight = false;

function useAutoWeeklyBuyImpl(): AutoWeeklyBuyApi {
  const { connected, publicKey } = useWallet();
  const signMessage = useKeeperSignMessage();
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
  const [keeperMode, setKeeperMode] = useState<KeeperMode | null>(null);

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
  const nextAtRef = useRef<number | null>(null);
  nextAtRef.current = nextAt;
  const ignoreOffUntilRef = useRef(0);
  /** Bumped on every publicKey change — ignore in-flight status/tick/startCycle. */
  const statusEpochRef = useRef(0);
  /** Previous keeper purchase marker. A change means a new on-chain run. */
  const seenKeeperRunRef = useRef<string | null>(null);
  /**
   * Epoch ms. While now < this, tick may refresh schedule/mode but must not
   * replace phase or message (startCycle ok / error / blocked).
   */
  const bannerHoldUntilRef = useRef(0);
  /** Last pubkey this effect observed. Null until the first run. */
  const prevOwnerRef = useRef<string | null>(null);
  /** /enable timed out. Tick must not replace this banner or turn the toggle off. */
  const enablePendingRef = useRef(false);
  const enablePendingOwnerRef = useRef<string | null>(null);
  const enableBaselineRef = useRef<EnableStatusBaseline | null>(null);

  const ownerKey = publicKey?.toBase58() ?? null;
  const signReady = typeof signMessage === "function";

  const resetBannerState = useCallback(() => {
    setPhase("idle");
    setMessage(null);
    setNextAt(null);
    setLastTop3([]);
    setDue(false);
    setBlockReason(null);
    setEnabledState(false);
  }, []);

  useEffect(() => {
    const prev = prevOwnerRef.current;
    if (prev && prev !== ownerKey) {
      // Disconnect drops every wallet. A switch drops only the one we left.
      if (!ownerKey) clearStatusAuthCache();
      else clearStatusAuthCache(prev);
    }
    prevOwnerRef.current = ownerKey;
    statusEpochRef.current += 1;
    seenKeeperRunRef.current = null;
    bannerHoldUntilRef.current = 0;
    enablePendingRef.current = false;
    enablePendingOwnerRef.current = null;
    enableBaselineRef.current = null;
    // Drop the previous owner's On immediately. Status below corrects it.
    resetBannerState();
    setPrefsReady(false);
    setKeeperMode(null);
    cycleInFlight = false;
    if (ownerKey) ignoreOffUntilRef.current = Date.now() + 2000;
  }, [ownerKey, resetBannerState]);

  useEffect(() => {
    if (!ownerKey || !signReady) return;
    const epoch = statusEpochRef.current;
    let cancelled = false;
    void (async () => {
      const sign = signMessageRef.current;
      const [st, health] = await Promise.all([
        keeperStatus(ownerKey, sign ?? undefined),
        keeperHealthInfo(),
      ]);
      if (cancelled || statusEpochRef.current !== epoch) return;
      const modeFromStatus =
        st.mode === "live" || st.mode === "dry-run" ? st.mode : null;
      setKeeperMode(modeFromStatus ?? health.mode);
      // Unknown status (no sign, unreachable, rejected) must not force Off.
      const verdict = keeperEnabledForConnectedOwner(st, ownerKey);
      if (verdict === true) {
        setEnabledState(true);
        writeAutoWeeklyBuy(true, ownerKey);
      } else if (verdict === false) {
        setEnabledState(false);
        writeAutoWeeklyBuy(false, ownerKey);
      }
      setPrefsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerKey, signReady]);
  const setEnabled = useCallback((value: boolean) => {
    if (!value && Date.now() < ignoreOffUntilRef.current) {
      return;
    }
    // User changed enable — release the sticky startCycle banner.
    bannerHoldUntilRef.current = 0;
    const owner = ownerRef.current;
    setEnabledState(value);
    writeAutoWeeklyBuy(value, owner);
    if (!value) {
      const sign = signMessageRef.current;
      if (owner && sign) {
        const epoch = statusEpochRef.current;
        void (async () => {
          const res = await keeperDisable(owner, sign);
          if (statusEpochRef.current !== epoch) return;
          if (!res.ok) {
            // Idempotent off: keeper already off → success (no scary mismatch error).
            const st = await keeperStatus(owner, sign);
            if (statusEpochRef.current !== epoch) return;
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
    const pendingNow = predcaRef.current;
    if (
      pendingNow.txPending ||
      unresolvedSignatureBlocksTx(pendingNow.pendingSignature) ||
      unresolvedSignatureBlocksTx(pendingNow.pendingSignatureNow())
    ) {
      bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
      setPhase("blocked");
      setBlockReason(null);
      setMessage(tRef.current("btn.waiting"));
      return;
    }
    const amount = Number(weeklyBudgetUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
      setPhase("error");
      setMessage("Budżet tygodniowy musi być > 0.");
      return;
    }
    // Snapshot. ownerRef updates on the wallet-switch render, before the
    // status effect bumps the epoch. Failed-cycle cleanup must keep this pubkey.
    const cycleOwner = ownerRef.current;
    if (!cycleOwner) {
      bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
      setPhase("blocked");
      setBlockReason("need_wallet");
      setMessage(tRef.current("auto.status.needWallet"));
      return;
    }
    if (!shouldSendEnable(cycleInFlight)) return;
    cycleInFlight = true;
    const epoch = statusEpochRef.current;
    const stillCurrent = () => statusEpochRef.current === epoch;
    const sign = signMessageRef.current;
    try {
      if (!sign) {
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setPhase("blocked");
        setBlockReason("need_wallet");
        setMessage("Portfel musi obsługiwać signMessage (włącz auto-buy wymaga podpisu).");
        return;
      }
      writeWeeklyBudgetUsd(amount, cycleOwner);
      const p = predcaRef.current;
      if (p.status === "error") {
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setPhase("blocked");
        setBlockReason("not_ready");
        setMessage(p.rpcError ?? "");
        return;
      }
      // No UserConfig yet: do not initialize_user alone. First deposit on
      // Overview creates the account and the vault in one transaction.
      if (!p.config) {
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setPhase("blocked");
        setBlockReason("not_ready");
        setMessage(
          p.status === "loading"
            ? tRef.current("auto.status.stillLoading")
            : tRef.current("auto.status.notReady"),
        );
        return;
      }
      if (p.vaultUsdc == null || !(p.vaultUsdc > 0)) {
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setPhase("blocked");
        setBlockReason("vault_low");
        setMessage(tRef.current("auto.status.needVault"));
        return;
      }
      const alive = await keeperHealth();
      if (!stillCurrent()) return;
      if (!alive) {
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setPhase("error");
        setMessage(tRef.current("auto.status.keeperDown"));
        return;
      }
      if (
        connectedRef.current &&
        p.mint &&
        (p.weeklyBudgetUsd == null ||
          Math.abs(p.weeklyBudgetUsd - amount) > 0.000001)
      ) {
        const sig = await p.setWeeklyBudget(amount);
        if (!stillCurrent()) return;
        if (!sig) {
          bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
          setPhase("error");
          setMessage(
            predcaRef.current.lastTxError() ||
              "Nie udało się zapisać kwoty tygodniowej.",
          );
          return;
        }
      }
      writeAutoBuyMeta(
        {
          lastAttemptMs: Date.now(),
          lastSuccessMs: 0,
          lastError: null,
          cycleStartedAtMs: Date.now(),
          cycleBudgetUsd: amount,
        },
        cycleOwner,
      );
      if (!stillCurrent()) return;
      const prior = await keeperStatus(cycleOwner, sign);
      if (!stillCurrent()) return;
      const baseline: EnableStatusBaseline = {
        error: prior.error ?? null,
        phase: prior.phase ?? null,
      };
      const commitPurchase = (ran: KeeperRunResult) => {
        enablePendingRef.current = false;
        enablePendingOwnerRef.current = null;
        enableBaselineRef.current = null;
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setEnabledState(true);
        writeAutoWeeklyBuy(true, cycleOwner);
        if (ran.names && ran.names.length > 0) {
          setLastTop3(ran.names.map((name) => ({ name, score: 0 })));
        }
        writeAutoBuyMeta(
          {
            lastAttemptMs: Date.now(),
            lastSuccessMs: Date.now(),
            lastError: null,
            cycleStartedAtMs: Date.now(),
            cycleBudgetUsd: amount,
          },
          cycleOwner,
        );
        setPhase("ok");
        setDue(false);
        setBlockReason(null);
        seenKeeperRunRef.current = keeperRunMarker(ran);
        void predcaRef.current.refresh();
        const nextBuyMs = keeperNextBuyAtMs(ran) ?? Date.now() + WEEK_MS;
        setNextAt(nextBuyMs);
        const amountLabel = (ran.amountUsd ?? amount).toFixed(2);
        const tokensLabel = (ran.names ?? []).join(" · ");
        setMessage(
          tRef.current("auto.status.okWithNext", {
            amount: amountLabel,
            tokens: tokensLabel,
            nextBuy: formatWarsawWhen(nextBuyMs, localeRef.current),
          }),
        );
      };
      // Daemon writes Off itself when enable fails. Do not ask for a second signature.
      const forceOff = async (reason: string) => {
        enablePendingRef.current = false;
        enablePendingOwnerRef.current = null;
        const cleanupOwner = cleanupOwnerForFailedCycle(
          cycleOwner,
          epoch,
          statusEpochRef.current,
        );
        if (!cleanupOwner) return;
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setEnabledState(false);
        writeAutoWeeklyBuy(false, cleanupOwner);
        if (statusEpochRef.current !== epoch) return;
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
      const pollPendingEnable = async () => {
        enablePendingRef.current = true;
        enablePendingOwnerRef.current = cycleOwner;
        enableBaselineRef.current = baseline;
        setPhase("pending");
        setBlockReason(null);
        setMessage(tRef.current("auto.status.enablePending"));
        const started = Date.now();
        while (stillCurrent()) {
          const st = await keeperStatus(cycleOwner, sign);
          if (!stillCurrent()) return;
          const verdict = resolvePendingEnable(
            st,
            cycleOwner,
            Date.now() - started,
            baseline,
          );
          if (verdict === "pending") {
            await new Promise((resolve) =>
              setTimeout(resolve, ENABLE_PENDING_POLL_MS),
            );
            continue;
          }
          if (verdict === "on") {
            commitPurchase(st);
            return;
          }
          if (verdict === "off") {
            await forceOff(st.error || "enable_failed");
            return;
          }
          setPhase("pending");
          setMessage(tRef.current("auto.status.enableUnknown"));
          enablePendingRef.current = true;
          return;
        }
      };
      // Already On with a finished purchase: do not POST /enable again.
      if (canCommitEnabledFromStatus(prior, cycleOwner)) {
        commitPurchase(prior);
        return;
      }
      // Already On and this week's buy is still in flight. Poll, do not force-buy.
      if (shouldPollInProgressEnable(prior, cycleOwner)) {
        await pollPendingEnable();
        return;
      }
      setPhase("buying");
      setMessage(tRef.current("auto.status.buyingKeeper"));
      // One signature: daemon syncs prefs on enable.
      const ran = await keeperEnable(
        cycleOwner,
        true,
        sign,
        rankPrefsForApi(readRankPrefs()),
      );
      if (!stillCurrent()) return;
      // Unknown outcome (confirm timeout, proxy timeout, busy, recent run)
      // stays on the v4.19 pending poll. Never roll the toggle Off.
      if (
        ran.pending ||
        ran.error === "enable_timeout" ||
        ran.reason === "busy" ||
        ran.reason === "confirming" ||
        ran.reason === "recent_run"
      ) {
        await pollPendingEnable();
        return;
      }
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
      // Do not commit On until the purchase itself is complete.
      if (!shouldCommitAutoBuyEnabled(ran) || !ran.names) {
        const err = ran.skipped
          ? String(ran.error || ran.reason || "purchase skipped")
          : "Keeper returned success without a completed purchase.";
        await forceOff(err);
        return;
      }
      commitPurchase(ran);
    } catch (e) {
      enablePendingRef.current = false;
      enablePendingOwnerRef.current = null;
      const cleanupOwner = cleanupOwnerForFailedCycle(
        cycleOwner,
        epoch,
        statusEpochRef.current,
      );
      if (!cleanupOwner) return;
      const reason = e instanceof Error ? e.message : String(e);
      bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
      setEnabledState(false);
      writeAutoWeeklyBuy(false, cleanupOwner);
      if (statusEpochRef.current !== epoch) return;
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
      // A wallet switch already cleared the lock. An unresolved enable keeps it
      // so Confirm cannot POST /enable again.
      if (stillCurrent() && !enablePendingRef.current) cycleInFlight = false;
    }
  }, []);

  const tick = useCallback(async () => {
    if (!prefsReady) return;
    const epoch = statusEpochRef.current;
    const wallet = ownerRef.current;
    const sign = signMessageRef.current;
    const st = await keeperStatus(wallet ?? undefined, sign ?? undefined);
    if (statusEpochRef.current !== epoch) return;
    const runMarker = keeperRunMarker(st);
    if (runMarker && runMarker !== seenKeeperRunRef.current) {
      seenKeeperRunRef.current = runMarker;
      void predcaRef.current.refresh();
    }
    if (st.mode === "live" || st.mode === "dry-run") {
      setKeeperMode(st.mode);
    }
    if (enablePendingRef.current) {
      if (!wallet || !pendingEnableStillFor(enablePendingOwnerRef.current, wallet)) {
        return;
      }
      const verdict = resolvePendingEnable(
        st,
        wallet,
        0,
        enableBaselineRef.current ?? undefined,
      );
      if (verdict === "on") {
        enablePendingRef.current = false;
        enablePendingOwnerRef.current = null;
        enableBaselineRef.current = null;
        cycleInFlight = false;
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setEnabledState(true);
        writeAutoWeeklyBuy(true, wallet);
        if (st.names && st.names.length > 0) {
          setLastTop3(st.names.map((name) => ({ name, score: 0 })));
        }
        setPhase("ok");
        setDue(false);
        setBlockReason(null);
        const nextBuyMs = keeperNextBuyAtMs(st) ?? Date.now() + WEEK_MS;
        setNextAt(nextBuyMs);
        if (st.amountUsd != null && st.names) {
          setMessage(
            tRef.current("auto.status.okWithNext", {
              amount: st.amountUsd.toFixed(2),
              tokens: st.names.join(" · "),
              nextBuy: formatWarsawWhen(nextBuyMs, localeRef.current),
            }),
          );
        }
        void predcaRef.current.refresh();
      } else if (verdict === "off") {
        enablePendingRef.current = false;
        enablePendingOwnerRef.current = null;
        enableBaselineRef.current = null;
        cycleInFlight = false;
        bannerHoldUntilRef.current = Date.now() + BANNER_HOLD_MS;
        setEnabledState(false);
        writeAutoWeeklyBuy(false, wallet);
        setPhase("error");
        setBlockReason(null);
        setMessage(
          tRef.current("auto.status.error", {
            reason: st.error || "enable_failed",
          }),
        );
      }
      return;
    }
    // Toggle follows keeper for this owner. A stale Off during the banner hold
    // must not clobber a just-confirmed enable. Unknown status must not force Off.
    const verdict = keeperEnabledForConnectedOwner(st, wallet);
    const hold = isBannerHoldActive(bannerHoldUntilRef.current, Date.now());
    if (verdict === true && wallet && !enabledRef.current) {
      setEnabledState(true);
      writeAutoWeeklyBuy(true, wallet);
    } else if (verdict === false && wallet && !hold && enabledRef.current) {
      setEnabledState(false);
      writeAutoWeeklyBuy(false, wallet);
    }
    // startCycle just showed ok / error / blocked. Keeper status often still
    // says off and would replace that banner with "wyłączone".
    if (hold) {
      const heldNext = keeperNextBuyAtMs(st);
      if (heldNext != null) {
        setNextAt(heldNext);
        setDue(false);
      }
      return;
    }
    if (verdict === null) return;
    const configuredOwner =
      (typeof st.owner === "string" && st.owner.trim()) || null;
    const sameOwner =
      !!wallet && !!configuredOwner && wallet === configuredOwner;
    const on = Boolean(sameOwner && st.enabled === true);
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
    const keeperNextBuyMs = keeperNextBuyAtMs(st);
    const nextBuyMs =
      keeperNextBuyMs ??
      (nextAtRef.current == null
        ? keeperNextBuyAtMs(st, predcaRef.current.lastPurchaseOnChain?.ts ?? null)
        : null);
    if (nextBuyMs != null) {
      setNextAt(nextBuyMs);
      setDue(false);
    }
    // Keeper settles on not_due after a successful buy while keeping
    // signature/names/amountUsd/nextAt. Gating only on phase===ok hid the
    // OK status line in Settings + banner (fell through to local idle).
    const purchaseComplete =
      (st.phase === "ok" || st.phase === "not_due") &&
      !!st.signature &&
      st.amountUsd != null &&
      Array.isArray(st.names) &&
      st.names.length > 0;
    if (purchaseComplete || (st.phase === "ok" && st.signature)) {
      setPhase("ok");
      if (st.names && st.names.length >= 3) {
        setLastTop3(st.names.map((name) => ({ name, score: 0 })));
      }
      if (st.amountUsd != null && st.names) {
        const nextBuy = nextBuyMs ?? nextAtRef.current;
        const amountLabel = st.amountUsd.toFixed(2);
        const tokensLabel = st.names.join(" · ");
        setMessage(
          nextBuy != null
            ? tRef.current("auto.status.okWithNext", {
                amount: amountLabel,
                tokens: tokensLabel,
                nextBuy: formatWarsawWhen(nextBuy, localeRef.current),
              })
            : tRef.current("auto.status.ok", {
                amount: amountLabel,
                tokens: tokensLabel,
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
    if (
      st.phase === "buying" ||
      st.phase === "ranking" ||
      st.phase === "confirming"
    ) {
      setPhase("buying");
      setMessage(
        st.phase === "confirming"
          ? tRef.current("auto.banner.confirming")
          : tRef.current("auto.status.buyingKeeper"),
      );
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
      keeperMode,
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
      keeperMode,
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
    value.phase === "pending" ||
    value.phase === "error" ||
    (value.phase === "ok" && value.message != null);
  if (!showBanner || !value.message) return null;
  return (
    <div
      role="status"
      className={`border-b px-4 py-2 text-center text-xs ${
        value.phase === "error"
          ? "border-[#f8717133] bg-[#f8717111] text-[#fca5a5]"
          : value.phase === "pending"
            ? "border-[#fbbf2433] bg-[#fbbf2411] text-[#fbbf24]"
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
