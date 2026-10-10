"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useKeeperSignMessage } from "@/components/PrivyWalletBridge";
import {
  companyDataClientSnapshot,
  companyDataNeedsRefresh,
  companyDataServerSnapshot,
  formatCompanyDate,
  refreshStaleCompanyData,
  subscribeCompanyData,
  toggleAvailability,
  type CompanyData,
  type ToggleBucket,
} from "@/lib/company-data";
import { DEFAULT_SETTINGS } from "@/lib/mock-data";
import { usePredca } from "@/lib/hooks/usePredca";
import { TxNotice } from "@/components/TxNotice";
import { explorerTxUrl, formatUsd } from "@/lib/predca";
import { UNRESOLVED_MSG } from "@/lib/pending-tx";
import { autoToggleBlocked } from "@/lib/auto-weekly-buy";
import { useI18n } from "@/lib/i18n";
import {
  parseExclusions,
  readExclusionsRaw,
  userExclusions,
  writeExclusionsRaw,
} from "@/lib/exclusions";
import {
  applyApiPrefsToLocal,
  rankPrefsForApi,
  readBuyDespiteIpo,
  readDeadlineInvalid,
  readIpoPremiumMatters,
  readRankPrefs,
  writeBuyDespiteIpo,
  writeDeadlineInvalid,
  writeIpoPremiumMatters,
} from "@/lib/rank-prefs";
import {
  keeperPushPrefs,
  keeperStatus,
  type KeeperPrefsPayload,
} from "@/lib/keeper-client";
import {
  readStoredWeeklyBudgetUsd,
  writeWeeklyBudgetUsd,
} from "@/lib/auto-weekly-buy";
import {
  adoptWeeklyDraft,
  adoptWeeklyDraftForOwner,
  budgetsDiffer,
  parseWeeklyDraft,
  readWeeklyDraft,
  writeWeeklyDraft,
} from "@/lib/weekly-budget";
import { useAutoWeeklyBuy } from "@/lib/hooks/useAutoWeeklyBuy";
import { dcaApiBase, LS_TYPESAFE, LS_XAI, readTypesafeKey } from "@/lib/keys";

/** Keeper-synced ranking prefs snapshot for dirty detection. */
type PrefsBaseline = {
  exclusionsKey: string;
  deadlineInvalid: boolean;
  ipoPremium: boolean;
  buyDespiteIpo: boolean;
};

function exclusionsKey(raw: string): string {
  return parseExclusions(raw)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("\0");
}

function makeBaseline(
  exclusionsRaw: string,
  deadlineInvalid: boolean,
  ipoPremium: boolean,
  buyDespiteIpo: boolean,
): PrefsBaseline {
  return {
    exclusionsKey: exclusionsKey(exclusionsRaw),
    deadlineInvalid,
    ipoPremium,
    buyDespiteIpo,
  };
}

function budgetTxNotice(
  message: string | null,
  tone: "pending" | "error" | "ok",
) {
  if (!message) return null;
  if (tone === "ok") {
    return <p className="text-[10px] text-[#2dd4bf]">{message}</p>;
  }
  return <TxNotice message={message} tone={tone} />;
}

function baselinesEqual(a: PrefsBaseline | null, b: PrefsBaseline): boolean {
  if (!a) return false;
  return (
    a.exclusionsKey === b.exclusionsKey &&
    a.deadlineInvalid === b.deadlineInvalid &&
    a.ipoPremium === b.ipoPremium &&
    a.buyDespiteIpo === b.buyDespiteIpo
  );
}

export function SettingsView() {
  const predca = usePredca();
  const autoBuy = useAutoWeeklyBuy();
  const { connected, publicKey } = useWallet();
  const signMessage = useKeeperSignMessage();
  const signMessageRef = useRef(signMessage);
  signMessageRef.current = signMessage;
  const { t } = useI18n();
  const [weekly, setWeekly] = useState(DEFAULT_SETTINGS.weeklyAmountUsd);
  const [weeklyDraft, setWeeklyDraft] = useState(
    String(DEFAULT_SETTINGS.weeklyAmountUsd),
  );
  const [exclusions, setExclusions] = useState("");
  const [deadlineInvalid, setDeadlineInvalid] = useState(
    DEFAULT_SETTINGS.deadlineInvalid,
  );
  const [ipoPremium, setIpoPremium] = useState(
    DEFAULT_SETTINGS.ipoPremiumMatters,
  );
  const [buyDespiteIpo, setBuyDespiteIpo] = useState(
    DEFAULT_SETTINGS.buyDespiteIpo,
  );
  const [typesafeKey, setTypesafeKey] = useState("");
  /** LS/seed only. Starts false so SSR does not claim a demo key is present. */
  const [typesafeFilled, setTypesafeFilled] = useState(false);
  const [xaiKey, setXaiKey] = useState("");
  const [showTypesafe, setShowTypesafe] = useState(false);
  const [showXai, setShowXai] = useState(false);
  const [byokSaved, setByokSaved] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const [autoConfirmOpen, setAutoConfirmOpen] = useState(false);
  const [syncedBaseline, setSyncedBaseline] = useState<PrefsBaseline | null>(
    null,
  );
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaveMsg, setPrefsSaveMsg] = useState<string | null>(null);
  const [prefsOk, setPrefsOk] = useState(false);
  const prefsOkTimer = useRef<number | null>(null);
  const prevAutoPhase = useRef(autoBuy.phase);
  useEffect(() => {
    return () => {
      if (prefsOkTimer.current != null) window.clearTimeout(prefsOkTimer.current);
    };
  }, []);

  // Settings weekly amount is SoT for init-on-deposit (Overview reads same LS key).
  // Hydrate from per-wallet LS; do not keep syncing from on-chain (that stomped LS saves).
  const [weeklyReady, setWeeklyReady] = useState(false);
  const ownerBase58 = publicKey?.toBase58() ?? null;
  useEffect(() => {
    const draft = readWeeklyDraft();
    if (!ownerBase58) {
      const amount = draft ?? DEFAULT_SETTINGS.weeklyAmountUsd;
      setWeekly(amount);
      setWeeklyDraft(String(Math.round(amount * 100) / 100));
      setWeeklyReady(true);
      return;
    }
    const scoped = readStoredWeeklyBudgetUsd(ownerBase58);
    const adopted = adoptWeeklyDraft(scoped, draft);
    const written = adoptWeeklyDraftForOwner(ownerBase58);
    const amount = written ?? adopted.value ?? DEFAULT_SETTINGS.weeklyAmountUsd;
    const parsed = parseWeeklyDraft(String(amount));
    const next = parsed.ok ? parsed.value : amount;
    setWeekly(next);
    setWeeklyDraft(String(Math.round(next * 100) / 100));
    setWeeklyReady(true);
  }, [ownerBase58]);

  const companySnap = useSyncExternalStore(
    subscribeCompanyData,
    companyDataClientSnapshot,
    companyDataServerSnapshot,
  );
  const availability = toggleAvailability(companySnap.byName, companySnap.readAt);
  useEffect(() => {
    const snap = companyDataClientSnapshot();
    if (!companyDataNeedsRefresh(snap.byName, snap.readAt)) return;
    const base = dcaApiBase();
    if (!base) return;
    void refreshStaleCompanyData(base);
  }, []);

  // Hydrate ranking toggles from keeper GET /prefs (authoritative for buys).
  // prefsReady stays false until hydrate finishes so we never push stale local
  // over keeper. Prefs file is global on the demo daemon; still skip apply when
  // a connected wallet differs from the registered owner.
  useEffect(() => {
    let cancelled = false;
    setPrefsReady(false);
    setSyncedBaseline(null);
    setPrefsSaveMsg(null);
    void (async () => {
      try {
        const seeded = readTypesafeKey();
        setTypesafeKey(seeded);
        setTypesafeFilled(seeded.length > 0);
        setXaiKey(localStorage.getItem(LS_XAI) ?? "");
      } catch {
        /* ignore */
      }

      let exclusionsRaw = readExclusionsRaw();
      let deadline = readDeadlineInvalid();
      let ipo = readIpoPremiumMatters();
      let buyDespite = readBuyDespiteIpo();

      try {
        const wallet = publicKey?.toBase58() ?? null;
        const sign = signMessageRef.current ?? undefined;
        // Without wallet/sign: keep localStorage; do not call detailed status.
        // signMessage identity changes often — use ref so we do not re-hydrate
        // (and re-hit status) on every adapter render.
        const status = await keeperStatus(wallet ?? undefined, sign);
        if (cancelled) return;

        const configuredOwner =
          (typeof status.owner === "string" && status.owner.trim()) || null;
        const ownerConflict =
          !!configuredOwner && !!wallet && configuredOwner !== wallet;

        const statusPrefs = (status as typeof status & { prefs?: KeeperPrefsPayload }).prefs;
        // Per-owner prefs when wallet known. Skip apply on owner mismatch.
        if (status.ok && statusPrefs && !ownerConflict) {
          const applied = applyApiPrefsToLocal(statusPrefs);
          exclusionsRaw = applied.exclusionsRaw;
          deadline = applied.deadlineInvalid;
          ipo = applied.ipoPremiumMatters;
          buyDespite = applied.buyDespiteIpo;
        }
      } catch {
        /* keeper down / empty → keep localStorage */
      }

      if (cancelled) return;
      const shown = userExclusions(exclusionsRaw).join(", ");
      setExclusions(shown);
      setDeadlineInvalid(deadline);
      setIpoPremium(ipo);
      setBuyDespiteIpo(buyDespite);
      setSyncedBaseline(
        makeBaseline(shown, deadline, ipo, buyDespite),
      );
      setPrefsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  // Persist exclusions (debounced) so ranking reads localStorage mid-session.
  useEffect(() => {
    if (!prefsReady) return;
    const id = window.setTimeout(() => {
      writeExclusionsRaw(userExclusions(exclusions).join(", "));
    }, 300);
    return () => window.clearTimeout(id);
  }, [exclusions, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    writeDeadlineInvalid(deadlineInvalid);
  }, [deadlineInvalid, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    writeIpoPremiumMatters(ipoPremium);
  }, [ipoPremium, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    writeBuyDespiteIpo(buyDespiteIpo);
  }, [buyDespiteIpo, prefsReady]);

  // Enable flow already signed-pushes prefs — adopt current UI as baseline
  // when a buy cycle completes successfully (buying → ok).
  useEffect(() => {
    const prev = prevAutoPhase.current;
    prevAutoPhase.current = autoBuy.phase;
    if (!prefsReady) return;
    if (prev === "buying" && autoBuy.phase === "ok") {
      setSyncedBaseline(
        makeBaseline(exclusions, deadlineInvalid, ipoPremium, buyDespiteIpo),
      );
      setPrefsSaveMsg(null);
    }
  }, [
    autoBuy.phase,
    prefsReady,
    exclusions,
    deadlineInvalid,
    ipoPremium,
    buyDespiteIpo,
  ]);

  // Persist weekly to this wallet's key. Disconnected edits stay in React state.
  // On-chain budget is a separate step, and only after UserConfig exists.
  // `weekly` changes only after parseWeeklyDraft succeeds, so an empty or
  // partial draft never replaces the last valid amount.
  useEffect(() => {
    if (!weeklyReady) return;
    const parsed = parseWeeklyDraft(String(weekly));
    if (!parsed.ok) return;
    const id = window.setTimeout(() => {
      if (ownerBase58) writeWeeklyBudgetUsd(parsed.value, ownerBase58);
      else writeWeeklyDraft(parsed.value);
    }, 300);
    return () => window.clearTimeout(id);
  }, [weekly, weeklyReady, ownerBase58]);

  useEffect(() => {
    if (!autoConfirmOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAutoConfirmOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoConfirmOpen]);

  const currentBaseline = useMemo(
    () =>
      makeBaseline(exclusions, deadlineInvalid, ipoPremium, buyDespiteIpo),
    [exclusions, deadlineInvalid, ipoPremium, buyDespiteIpo],
  );

  const prefsDirty =
    prefsReady &&
    syncedBaseline != null &&
    !baselinesEqual(syncedBaseline, currentBaseline);

  const onChainWeekly = predca.weeklyBudgetUsd;
  const weeklyParsed = parseWeeklyDraft(weeklyDraft);
  // Hide Save until UserConfig exists. A null on-chain budget is "no account",
  // not a dirty value — that used to send initialize_user with no deposit.
  const budgetDirtyOnChain =
    onChainWeekly != null && budgetsDiffer(weekly, onChainWeekly);

  async function saveWeeklyBudgetOnChain() {
    const parsed = parseWeeklyDraft(weeklyDraft);
    if (!parsed.ok) return;
    if (predca.pendingSignature != null || predca.pendingSignatureNow()) return;
    if (predca.status === "error") return;
    writeWeeklyBudgetUsd(parsed.value, ownerBase58);
    predca.clearMessages();
    if (!connected || !predca.mint || !predca.config) return;
    await predca.setWeeklyBudget(parsed.value);
  }

  const budgetBtnLabel = predca.txPending
    ? t("settings.savingOnChain")
    : t("settings.saveOnChain");
  const chainBusy = predca.txPending || predca.pendingSignature != null;

  async function signAndSavePrefs() {
    setPrefsSaveMsg(null);
    const owner = publicKey?.toBase58();
    if (!owner || !signMessage) {
      setPrefsSaveMsg(t("settings.prefsSignNeedWallet"));
      return;
    }
    setPrefsSaving(true);
    try {
      const shown = userExclusions(exclusions).join(", ");
      writeExclusionsRaw(shown);
      if (shown !== exclusions) setExclusions(shown);
      writeDeadlineInvalid(deadlineInvalid);
      writeIpoPremiumMatters(ipoPremium);
      writeBuyDespiteIpo(buyDespiteIpo);
      const res = await keeperPushPrefs(
        rankPrefsForApi(readRankPrefs()),
        owner,
        signMessage,
      );
      if (!res.ok) {
        setPrefsOk(false);
        if (prefsOkTimer.current != null) window.clearTimeout(prefsOkTimer.current);
        setPrefsSaveMsg(
          res.error
            ? `${t("settings.prefsSignFailed")}: ${res.error}`
            : t("settings.prefsSignFailed"),
        );
        return;
      }
      setSyncedBaseline(
        makeBaseline(shown, deadlineInvalid, ipoPremium, buyDespiteIpo),
      );
      setPrefsSaveMsg(null);
      if (prefsOkTimer.current != null) window.clearTimeout(prefsOkTimer.current);
      setPrefsOk(true);
      prefsOkTimer.current = window.setTimeout(() => {
        prefsOkTimer.current = null;
        setPrefsOk(false);
      }, 4000);
    } catch {
      setPrefsOk(false);
      if (prefsOkTimer.current != null) window.clearTimeout(prefsOkTimer.current);
      setPrefsSaveMsg(t("settings.prefsSignFailed"));
    } finally {
      setPrefsSaving(false);
    }
  }

  function saveByok() {
    try {
      const nextTypesafe = typesafeKey.trim();
      localStorage.setItem(LS_TYPESAFE, nextTypesafe);
      setTypesafeFilled(nextTypesafe.length > 0);
      localStorage.setItem(LS_XAI, xaiKey.trim());
      writeExclusionsRaw(exclusions);
      writeDeadlineInvalid(deadlineInvalid);
      writeIpoPremiumMatters(ipoPremium);
      writeBuyDespiteIpo(buyDespiteIpo);
      // Prefs require a wallet signature — do not pretend an unsigned push saves.
      setByokSaved(true);
    } catch {
      setByokSaved(false);
    }
  }

  const canSign = !!publicKey && !!signMessage;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a78bfa]">
          {t("settings.kicker")}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-[#e8eef5]">{t("settings.title")}</h1>
        <p className="mt-1 text-xs text-[#8b95a8]">{t("settings.intro")}</p>
      </div>

      {predca.sessionCheckMsg ? (
        <TxNotice message={predca.sessionCheckMsg} tone="pending" />
      ) : null}
      {predca.visibleUnresolvedTxs.slice(0, 2).map((rec) => (
        <TxNotice
          key={rec.signature}
          tone="pending"
          message={`${UNRESOLVED_MSG} ${rec.signature} ${explorerTxUrl(rec.signature)}`}
          action={{
            label: predca.rechecking ? t("tx.rechecking") : t("tx.recheck"),
            disabled: predca.rechecking,
            onClick: () => {
              void predca.recheckUnresolved(rec.signature);
            },
          }}
        />
      ))}
      {predca.visibleUnresolvedTxs.length > 2 ? (
        <p className="text-[10px] text-[#fbbf24]">+{predca.visibleUnresolvedTxs.length - 2}</p>
      ) : null}

      <label className="block space-y-2 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <span className="text-[11px] uppercase tracking-[0.15em] text-[#8b95a8]">
          {t("settings.exclusions")}
        </span>
        <p className="text-xs text-[#8b95a8]">{t("settings.fixedExclusion")}</p>
        <input
          type="text"
          value={exclusions}
          disabled={!prefsReady}
          title={!prefsReady ? t("settings.prefsLoading") : undefined}
          onChange={(e) => setExclusions(e.target.value)}
          onBlur={() => {
            const shown = userExclusions(exclusions).join(", ");
            setExclusions(shown);
            writeExclusionsRaw(shown);
          }}
          placeholder="OpenAI, Kalshi"
          className="w-full rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm outline-none focus:border-[#a78bfa66] disabled:opacity-40"
        />
      </label>

      <div className="space-y-3 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <CompanyToggle
          label={t("settings.buyDespiteIpo")}
          checked={buyDespiteIpo}
          onChange={setBuyDespiteIpo}
          disabled={!availability.buyDespiteIpo.enabled}
          prefsReady={prefsReady}
          bucket={availability.buyDespiteIpo}
          kind="ipo"
          byName={companySnap.byName}
        />
        <CompanyToggle
          label={t("settings.deadlineInvalid")}
          checked={deadlineInvalid}
          onChange={setDeadlineInvalid}
          disabled={!availability.deadlinesUnimportant.enabled}
          prefsReady={prefsReady}
          bucket={availability.deadlinesUnimportant}
          kind="deadline"
          byName={companySnap.byName}
        />
        <Toggle
          label={t("settings.ipoPremium")}
          checked={ipoPremium}
          onChange={setIpoPremium}
          disabled={!prefsReady}
          title={!prefsReady ? t("settings.prefsLoading") : undefined}
        />
        {prefsOk ? (
          <p className="text-[10px] text-[#2dd4bf]">{t("settings.prefsSignOk")}</p>
        ) : null}
        {prefsDirty ? (
          <div className="space-y-2 border-t border-[#fbbf2433] pt-3">
            <p className="text-xs leading-relaxed text-[#fbbf24]">
              {t("settings.prefsDirtyHint")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={prefsSaving || !canSign}
                onClick={() => void signAndSavePrefs()}
                title={
                  !canSign ? t("settings.prefsConnectWallet") : undefined
                }
                className="rounded border border-[#fbbf2466] bg-[#0c0e12] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#fbbf24] hover:bg-[#fbbf2411] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prefsSaving
                  ? t("settings.prefsSignSaving")
                  : t("settings.prefsSignSave")}
              </button>
              {!canSign ? (
                <span className="text-[10px] text-[#8b95a8]">
                  {t("settings.prefsConnectWallet")}
                </span>
              ) : null}
            </div>
            {prefsSaveMsg ? (
              <p className="text-[10px] text-[#fca5a5]">{prefsSaveMsg}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <label className="block space-y-2">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#8b95a8]">
            {t("settings.weeklyAmount")}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={weeklyDraft}
            onChange={(e) => {
              const next = e.target.value;
              setWeeklyDraft(next);
              const parsed = parseWeeklyDraft(next);
              if (parsed.ok) setWeekly(parsed.value);
              predca.clearToasts();
            }}
            onBlur={() => {
              const parsed = parseWeeklyDraft(weeklyDraft);
              if (!parsed.ok) return;
              if (ownerBase58) writeWeeklyBudgetUsd(parsed.value, ownerBase58);
              else writeWeeklyDraft(parsed.value);
            }}
            className="mono-num w-full rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2.5 text-base text-[#2dd4bf] outline-none focus:border-[#2dd4bf66]"
          />
          {weeklyParsed.ok ? null : (
            <p className="text-xs text-[#fbbf24]">{t("settings.weeklyInvalid")}</p>
          )}
          <p className="text-xs text-[#8b95a8]">
            {t("settings.weeklySplit", { amount: (weekly / 3).toFixed(2) })}
            {" "}
            {t("settings.weeklyAtEnable")}
            {onChainWeekly != null && (
              <>
                {" "}
                {t("settings.onChainBudget")}{" "}
                <span className="mono-num text-[#2dd4bf]">
                  {formatUsd(onChainWeekly)} USDC
                </span>
              </>
            )}
          </p>
        </label>
        {connected && predca.status === "no_config" ? (
          <p className="text-xs leading-relaxed text-[#8b95a8]">
            {t("settings.budgetNeedsDeposit")}
          </p>
        ) : null}
        {budgetDirtyOnChain && connected && predca.mint ? (
          <button
            type="button"
            disabled={chainBusy || predca.status === "error" || !weeklyParsed.ok}
            onClick={() => void saveWeeklyBudgetOnChain()}
            className="w-full rounded border border-[#2dd4bf44] bg-[#0c0e12] py-2 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
          >
            {budgetBtnLabel}
          </button>
        ) : null}
        {!connected ? (
          <p className="text-[10px] text-[#8b95a8]">
            {t("settings.connectForBudget")}
          </p>
        ) : null}
        {budgetTxNotice(predca.pendingMsg, "pending")}
        {budgetTxNotice(predca.error, "error")}
        {budgetTxNotice(predca.okMsg, "ok")}
        <div className="border-t border-[#1e2633] pt-4">
          <Toggle
            label={t("settings.autoWeekly")}
            checked={autoBuy.enabled}
            disabled={chainBusy && !autoBuy.enabled}
            onChange={(v) => {
              if (
                autoToggleBlocked(
                  v,
                  chainBusy || predca.pendingSignatureNow() != null,
                )
              ) {
                return;
              }
              if (v) {
                setAutoConfirmOpen(true);
                return;
              }
              autoBuy.setEnabled(false);
            }}
          />
          <p className="mt-2 text-xs leading-relaxed text-[#8b95a8] text-justify">
            {t("settings.autoWeeklyHint")}
          </p>
          {autoBuy.keeperMode ? (
            <p
              className={`mt-2 text-[10px] font-medium ${
                autoBuy.keeperMode === "live"
                  ? "text-[#2dd4bf]"
                  : "text-[#fbbf24]"
              }`}
            >
              {autoBuy.keeperMode === "live"
                ? t("settings.keeperModeLive")
                : t("settings.keeperModeDryRun")}
            </p>
          ) : null}
          {autoBuy.nextLabel && autoBuy.enabled ? (
            <p className="mt-2 text-[10px] text-[#2dd4bf]">
              {t("auto.status.next", { when: autoBuy.nextLabel })}
            </p>
          ) : null}
          {autoBuy.message && autoBuy.phase !== "idle" ? (
            <p
              className={`mt-2 text-[10px] ${
                autoBuy.phase === "error"
                  ? "text-[#fca5a5]"
                  : autoBuy.phase === "pending"
                    ? "text-[#fbbf24]"
                    : "text-[#8b95a8]"
              }`}
            >
              {autoBuy.message}
            </p>
          ) : null}
        </div>
      </div>

      {autoConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0e12cc] px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auto-weekly-confirm-title"
          onClick={() => setAutoConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[#2dd4bf44] bg-[#141820] p-5 shadow-[0_0_40px_#2dd4bf22]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="auto-weekly-confirm-title"
              className="text-sm font-semibold text-[#e8eef5]"
            >
              {t("settings.autoWeeklyConfirmTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#c5cedb] text-justify">
              {t("settings.autoWeeklyConfirmBody", {
                amount: weekly.toFixed(2),
                each: (weekly / 3).toFixed(2),
              })}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setAutoConfirmOpen(false)}
                className="rounded border border-[#1e2633] px-4 py-2 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5]"
              >
                {t("settings.autoWeeklyConfirmCancel")}
              </button>
              <button
                type="button"
                disabled={chainBusy}
                onClick={() => {
                  if (
                    predca.txPending ||
                    predca.pendingSignature != null ||
                    predca.pendingSignatureNow()
                  ) {
                    return;
                  }
                  setAutoConfirmOpen(false);
                  void autoBuy.startCycle(weekly);
                }}
                className="rounded border border-[#2dd4bf66] bg-[#0c0e12] px-4 py-2 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11] disabled:opacity-40"
              >
                {t("settings.autoWeeklyConfirmOk")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-3 rounded-lg border border-[#2dd4bf33] bg-[#141820] p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#2dd4bf]">
            {t("settings.byokTitle")}
          </h2>
          <span className="mono-num text-[10px] text-[#8b95a8]">
            localStorage
          </span>
        </div>
        <p className="text-xs text-[#8b95a8]">
          {t(typesafeFilled ? "settings.byokIntro" : "settings.byokIntroEmpty")}
        </p>

        <label className="block space-y-1.5">
          <span className="text-[11px] text-[#c5cedb]">
            <span className="mono-num text-[#2dd4bf]">TYPESAFE_API_KEY</span>{" "}
            {t(
              typesafeFilled
                ? "settings.typesafeLabel"
                : "settings.typesafeLabelEmpty",
            )}
          </span>
          <div className="flex gap-2">
            <input
              type={showTypesafe ? "text" : "password"}
              value={typesafeKey}
              onChange={(e) => {
                setTypesafeKey(e.target.value);
                setByokSaved(false);
              }}
              placeholder="pk_…"
              autoComplete="off"
              spellCheck={false}
              className="mono-num flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm text-[#e8eef5] outline-none focus:border-[#2dd4bf66]"
            />
            <button
              type="button"
              onClick={() => setShowTypesafe((v) => !v)}
              className="rounded border border-[#1e2633] px-3 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5]"
            >
              {showTypesafe ? t("settings.hide") : t("settings.show")}
            </button>
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] text-[#c5cedb]">
            <span className="mono-num text-[#a78bfa]">XAI_API_KEY</span>{" "}
            {t("settings.xaiLabel")}
          </span>
          <div className="flex gap-2">
            <input
              type={showXai ? "text" : "password"}
              value={xaiKey}
              onChange={(e) => {
                setXaiKey(e.target.value);
                setByokSaved(false);
              }}
              placeholder="xai-…"
              autoComplete="off"
              spellCheck={false}
              className="mono-num flex-1 rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm text-[#e8eef5] outline-none focus:border-[#a78bfa66]"
            />
            <button
              type="button"
              onClick={() => setShowXai((v) => !v)}
              className="rounded border border-[#1e2633] px-3 text-[10px] uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5]"
            >
              {showXai ? t("settings.hide") : t("settings.show")}
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={saveByok}
          className="w-full rounded border border-[#2dd4bf44] bg-[#0c0e12] py-2 text-[10px] uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11]"
        >
          {byokSaved ? t("settings.keysSaved") : t("settings.saveKeys")}
        </button>
      </section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      title={title}
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      className="grid w-full grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-x-4 text-left font-sans text-sm tracking-normal text-[#e8eef5] disabled:opacity-40"
    >
      <span className="min-w-0 whitespace-normal break-words font-sans text-sm leading-snug tracking-normal">
        {label}
      </span>
      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 justify-self-end rounded-full transition ${
          checked ? "bg-[#2dd4bf]" : "bg-[#1e2633]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function CompanyFacts({
  bucket,
  kind,
  byName,
}: {
  bucket: ToggleBucket;
  kind: "ipo" | "deadline";
  byName: Record<string, CompanyData>;
}) {
  const { t, locale } = useI18n();
  const known = bucket.known.map((name, index) => {
    const data = byName[name];
    if (!data) return null;
    let phrase = name;
    if (kind === "ipo" && data.ipoStatus === "listed" && data.ipoDate != null) {
      phrase = `${name} — ${t("settings.ipoListed", {
        date: formatCompanyDate(data.ipoDate, locale, "full"),
      })}`;
    } else if (
      kind === "ipo" &&
      data.ipoStatus === "announced" &&
      data.ipoDate != null
    ) {
      phrase = `${name} — ${t("settings.ipoAnnounced", {
        date: formatCompanyDate(data.ipoDate, locale, "full"),
      })}`;
    } else if (kind === "deadline" && data.deadline != null) {
      phrase = `${name} — ${t("settings.deadlineOn", {
        date: formatCompanyDate(data.deadline, locale, "full"),
      })}`;
    }
    const checked = t("settings.checkedOn", {
      date: formatCompanyDate(data.checkedAt, locale, "short"),
    });
    return (
      <span key={name}>
        {index > 0 ? ", " : null}
        <a
          href={data.source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a78bfa] underline"
        >
          {phrase}
        </a>
        {` ${checked}`}
      </span>
    );
  });
  const knownTemplate = t("settings.dataKnown");
  const knownAt = knownTemplate.indexOf("{list}");
  const staleNames = bucket.stale
    .map((name) => {
      const data = byName[name];
      if (!data) return name;
      const checked = t("settings.checkedOn", {
        date: formatCompanyDate(data.checkedAt, locale, "short"),
      });
      return `${name} (${checked})`;
    })
    .join(", ");
  return (
    <div className="space-y-1 text-[10px] normal-case leading-relaxed tracking-normal text-[#8b95a8]">
      {bucket.known.length > 0 ? (
        <p>
          {knownAt < 0 ? knownTemplate : knownTemplate.slice(0, knownAt)}
          {known}
          {knownAt < 0 ? null : knownTemplate.slice(knownAt + "{list}".length)}
        </p>
      ) : null}
      {bucket.unknown.length > 0 ? (
        <p>{t("settings.dataUnknown", { names: bucket.unknown.join(", ") })}</p>
      ) : null}
      {bucket.stale.length > 0 ? (
        <p>{t("settings.dataStale", { names: staleNames })}</p>
      ) : null}
    </div>
  );
}

function CompanyToggle({
  label,
  checked,
  onChange,
  disabled,
  prefsReady,
  bucket,
  kind,
  byName,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  prefsReady: boolean;
  bucket: ToggleBucket;
  kind: "ipo" | "deadline";
  byName: Record<string, CompanyData>;
}) {
  const { t } = useI18n();
  const blocked = disabled || !prefsReady;
  const title = !prefsReady
    ? t("settings.prefsLoading")
    : disabled
      ? t("settings.noDataTooltip")
      : undefined;
  return (
    <div className="space-y-1">
      <Toggle
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={blocked}
        title={title}
      />
      {disabled ? (
        <p
          className="text-[10px] normal-case tracking-normal text-[#8b95a8]"
          title={title}
        >
          {t("settings.noData")}
        </p>
      ) : (
        <CompanyFacts bucket={bucket} kind={kind} byName={byName} />
      )}
    </div>
  );
}
