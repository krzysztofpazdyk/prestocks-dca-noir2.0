"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { DEFAULT_SETTINGS } from "@/lib/mock-data";
import { usePredca } from "@/lib/hooks/usePredca";
import { useI18n } from "@/lib/i18n";
import {
  parseExclusions,
  readExclusionsRaw,
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
  keeperGetPrefs,
  keeperPushPrefs,
  keeperStatus,
} from "@/lib/keeper-client";
import {
  writeWeeklyBudgetUsd,
} from "@/lib/auto-weekly-buy";
import { useAutoWeeklyBuy } from "@/lib/hooks/useAutoWeeklyBuy";

const LS_TYPESAFE = "prestocks.TYPESAFE_API_KEY";
const LS_XAI = "prestocks.XAI_API_KEY";

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
  const { publicKey, signMessage } = useWallet();
  const { t } = useI18n();
  const [weekly, setWeekly] = useState(DEFAULT_SETTINGS.weeklyAmountUsd);
  const [exclusions, setExclusions] = useState(
    DEFAULT_SETTINGS.exclusions.join(", "),
  );
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
  const prevAutoPhase = useRef(autoBuy.phase);

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
        setTypesafeKey(localStorage.getItem(LS_TYPESAFE) ?? "");
        setXaiKey(localStorage.getItem(LS_XAI) ?? "");
      } catch {
        /* ignore */
      }

      let exclusionsRaw = readExclusionsRaw();
      let deadline = readDeadlineInvalid();
      let ipo = readIpoPremiumMatters();
      let buyDespite = readBuyDespiteIpo();

      try {
        const [status, prefsRes] = await Promise.all([
          keeperStatus(),
          keeperGetPrefs(),
        ]);
        if (cancelled) return;

        const configuredOwner =
          (typeof status.owner === "string" && status.owner.trim()) || null;
        const wallet = publicKey?.toBase58() ?? null;
        const ownerConflict =
          !!configuredOwner && !!wallet && configuredOwner !== wallet;

        // Daemon stores a single prefs.json (global). Apply when GET ok and
        // there is no owner/wallet mismatch.
        if (prefsRes.ok && prefsRes.prefs && !ownerConflict) {
          const applied = applyApiPrefsToLocal(prefsRes.prefs);
          exclusionsRaw = applied.exclusionsRaw;
          deadline = applied.deadlineInvalid;
          ipo = applied.ipoPremiumMatters;
          buyDespite = applied.buyDespiteIpo;
        }
      } catch {
        /* keeper down / empty → keep localStorage */
      }

      if (cancelled) return;
      setExclusions(exclusionsRaw);
      setDeadlineInvalid(deadline);
      setIpoPremium(ipo);
      setBuyDespiteIpo(buyDespite);
      setSyncedBaseline(
        makeBaseline(exclusionsRaw, deadline, ipo, buyDespite),
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
      writeExclusionsRaw(exclusions);
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

  useEffect(() => {
    if (!prefsReady) return;
    const id = window.setTimeout(() => {
      writeWeeklyBudgetUsd(weekly);
    }, 300);
    return () => window.clearTimeout(id);
  }, [weekly, prefsReady]);

  useEffect(() => {
    if (predca.weeklyBudgetUsd != null && predca.weeklyBudgetUsd > 0) {
      setWeekly(predca.weeklyBudgetUsd);
    }
  }, [predca.weeklyBudgetUsd]);

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

  async function signAndSavePrefs() {
    setPrefsSaveMsg(null);
    const owner = publicKey?.toBase58();
    if (!owner || !signMessage) {
      setPrefsSaveMsg(t("settings.prefsSignNeedWallet"));
      return;
    }
    setPrefsSaving(true);
    try {
      writeExclusionsRaw(exclusions);
      writeDeadlineInvalid(deadlineInvalid);
      writeIpoPremiumMatters(ipoPremium);
      writeBuyDespiteIpo(buyDespiteIpo);
      const res = await keeperPushPrefs(
        rankPrefsForApi(readRankPrefs()),
        owner,
        signMessage,
      );
      if (!res.ok) {
        setPrefsSaveMsg(t("settings.prefsSignFailed"));
        return;
      }
      setSyncedBaseline(
        makeBaseline(exclusions, deadlineInvalid, ipoPremium, buyDespiteIpo),
      );
      setPrefsSaveMsg(t("settings.prefsSignOk"));
    } catch {
      setPrefsSaveMsg(t("settings.prefsSignFailed"));
    } finally {
      setPrefsSaving(false);
    }
  }

  function saveByok() {
    try {
      localStorage.setItem(LS_TYPESAFE, typesafeKey.trim());
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
        <h1 className="mt-1 text-2xl font-bold text-[#e8eef5]">{t("settings.title")}</h1>
        <p className="mt-1 text-xs text-[#8b95a8]">{t("settings.intro")}</p>
      </div>

      {predca.error && (
        <p className="rounded border border-[#f8717133] bg-[#f8717111] px-3 py-2 text-xs text-[#fca5a5]">
          {predca.error}
        </p>
      )}
      {predca.okMsg && (
        <p className="rounded border border-[#2dd4bf33] bg-[#2dd4bf11] px-3 py-2 text-xs text-[#2dd4bf]">
          {predca.okMsg}
        </p>
      )}

      <label className="block space-y-2 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <span className="text-[11px] uppercase tracking-wider text-[#8b95a8]">
          {t("settings.exclusions")}
        </span>
        <input
          type="text"
          value={exclusions}
          onChange={(e) => setExclusions(e.target.value)}
          onBlur={() => writeExclusionsRaw(exclusions)}
          placeholder="xAI, OpenAI"
          className="w-full rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2 text-sm outline-none focus:border-[#a78bfa66]"
        />
      </label>

      <div className="space-y-3 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <Toggle
          label={t("settings.buyDespiteIpo")}
          checked={buyDespiteIpo}
          onChange={setBuyDespiteIpo}
        />
        <Toggle
          label={t("settings.deadlineInvalid")}
          checked={deadlineInvalid}
          onChange={setDeadlineInvalid}
        />
        <Toggle
          label={t("settings.ipoPremium")}
          checked={ipoPremium}
          onChange={setIpoPremium}
        />
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
              <p
                className={`text-[10px] ${
                  prefsSaveMsg === t("settings.prefsSignOk")
                    ? "text-[#2dd4bf]"
                    : "text-[#fca5a5]"
                }`}
              >
                {prefsSaveMsg}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-lg border border-[#1e2633] bg-[#141820] p-5">
        <label className="block space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-[#8b95a8]">
            {t("settings.weeklyAmount")}
          </span>
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            value={weekly}
            onChange={(e) => {
              const n = Number(e.target.value);
              setWeekly(Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : 1);
              predca.clearMessages();
            }}
            className="mono-num w-full rounded border border-[#1e2633] bg-[#0c0e12] px-3 py-2.5 text-base text-[#2dd4bf] outline-none focus:border-[#2dd4bf66]"
          />
          <p className="text-xs text-[#8b95a8]">
            {t("settings.weeklySplit", { amount: (weekly / 3).toFixed(2) })}
            {" "}
            {t("settings.weeklyAtEnable")}
          </p>
        </label>
        <div className="border-t border-[#1e2633] pt-4">
          <Toggle
            label={t("settings.autoWeekly")}
            checked={autoBuy.enabled}
            onChange={(v) => {
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
                className="rounded border border-[#1e2633] px-4 py-2 text-xs uppercase tracking-wider text-[#8b95a8] hover:text-[#e8eef5]"
              >
                {t("settings.autoWeeklyConfirmCancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoConfirmOpen(false);
                  void autoBuy.startCycle(weekly);
                }}
                className="rounded border border-[#2dd4bf66] bg-[#0c0e12] px-4 py-2 text-xs uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11]"
              >
                {t("settings.autoWeeklyConfirmOk")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-3 rounded-lg border border-[#2dd4bf33] bg-[#141820] p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[11px] uppercase tracking-wider text-[#2dd4bf]">
            {t("settings.byokTitle")}
          </h2>
          <span className="mono-num text-[10px] text-[#8b95a8]">
            localStorage
          </span>
        </div>
        <p className="text-xs text-[#8b95a8]">{t("settings.byokIntro")}</p>

        <label className="block space-y-1.5">
          <span className="text-[11px] text-[#c5cedb]">
            <span className="mono-num text-[#2dd4bf]">TYPESAFE_API_KEY</span>{" "}
            {t("settings.typesafeLabel")}
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
              className="rounded border border-[#1e2633] px-3 text-xs text-[#8b95a8] hover:text-[#e8eef5]"
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
              className="rounded border border-[#1e2633] px-3 text-xs text-[#8b95a8] hover:text-[#e8eef5]"
            >
              {showXai ? t("settings.hide") : t("settings.show")}
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={saveByok}
          className="w-full rounded border border-[#2dd4bf44] bg-[#0c0e12] py-2 text-xs uppercase tracking-wider text-[#2dd4bf] hover:bg-[#2dd4bf11]"
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
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-left font-sans text-sm font-medium tracking-normal text-[#e8eef5]"
    >
      <span className="font-sans text-sm font-medium tracking-normal">{label}</span>
      <span
          className={`relative h-6 w-11 rounded-full transition ${
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
