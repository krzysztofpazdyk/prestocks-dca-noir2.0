"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "pl" | "en";

export const LOCALE_STORAGE_KEY = "predca_locale";
export const DEFAULT_LOCALE: Locale = "pl";

type Dict = Record<string, string>;

const pl: Dict = {
  "nav.overview": "Overview",
  "nav.settings": "Ustawienia",
  "nav.history": "Historia",
  "nav.selectWallet": "Select Wallet",

  "overview.kicker": "Trading desk · PreStocks Weekly DCA",
  "overview.title": "Overview",
  "overview.disconnectedHint":
    "Portfel odłączony — podłącz wallet, by zobaczyć salda on-chain. {cluster}.",
  "overview.noMintHint":
    "Ustaw NEXT_PUBLIC_USDC_MINT na lokalny mock mint.",
  "overview.onChainHint": "On-chain · {cluster} · wartości z RPC",
  "overview.clusterMainnet":
    "Uwaga: RPC wygląda na Mainnet — ta aplikacja jest Devnet-only. Sprawdź NEXT_PUBLIC_RPC_URL.",
  "overview.clusterNotDevnet":
    "Uwaga: oczekiwano Devnet, genesis RPC = {genesis}. Sprawdź sieć / RPC.",

  "faucet.button": "Weź 1000 USDC + 0.1 SOL (demo)",
  "faucet.busy": "Wysyłam USDC + SOL…",
  "faucet.success": "Wysłano 1000 USDC + 0.1 SOL do portfela (demo) · sig {sig}.",
  "faucet.nextSteps": "Następnie: Deposit do vaulta (≥ budżet tygodniowy) + Wygeneruj rekomendacje — wtedy Dokonaj zakupu się odblokuje.",
  "faucet.error": "Faucet: {error}",
  "faucet.needWallet": "Podłącz portfel, by wziąć demo USDC + SOL.",

  "predca.title": "Predca on-chain ({cluster})",
  "predca.rpc": "RPC:",
  "predca.refresh": "Odśwież",
  "predca.loading": "Ładowanie…",
  "predca.budget": "Budżet tygodniowy",
  "predca.vault": "Vault",
  "predca.deposit": "Deposit",
  "predca.withdraw": "Withdraw",
  "predca.hintNoAta":
    "Hint: brak ATA mock USDC — Deposit zwykle się nie uda, dopóki nie masz konta tokenowego dla mint {mint} na Devnet.",
  "predca.hintZeroUsdc":
    "Hint: saldo mock USDC = 0 — doładuj ATA (mint {mint}) przed Deposit.",
  "predca.mintLabel": "Mint mock USDC:",
  "predca.mintNoAta":
    "· Brak ATA / saldo — utwórz konto tokenowe i zrób mint testowych USDC na Devnet przed Deposit.",
  "predca.initBudget": "Budżet przy init (USDC)",
  "predca.initialize": "Initialize",
  "predca.waiting": "Czekam…",
  "predca.initHint":
    "Predca nie jest zainicjalizowane — najpierw Initialize, potem Deposit (wymaga mock USDC w ATA portfela).",
  "predca.depositUnavailable":
    "Deposit niedostępny ({reason}). Gdy status = ready, pojawi się formularz wpłaty/wypłaty.",
  "predca.status.loading": "ładowanie…",
  "predca.status.no_mint": "brak mint",
  "predca.status.disconnected": "brak portfela",
  "predca.status.error": "błąd",
  "predca.lastRun": "Ostatni RunRecord on-chain",

  "tile.sol": "SOL",
  "tile.usdcWallet": "USDC (portfel)",
  "tile.portfolioPreStock": "Wartość portfela PreStock",
  "tile.portfolioHint":
    "Wartość portfela PreStock: vault USDC + suma wartości akcji (Devnet: 1 token unit = 1 USD). USDC w portfelu osobno.",

  "holdings.titleOnChain": "Alokacja holdings (on-chain ATAs)",
  "holdings.titleOffline": "Alokacja holdings (offline)",
  "holdings.titleDisconnected": "Alokacja holdings",
  "holdings.emptyConnected":
    "Brak niezerowych sald mock PreStock w ATA — wykonaj simulate_buy lub czekaj na mint.",
  "holdings.empty": "Brak holdings.",
  "holdings.emptyDisconnected": "Podłącz portfel, by zobaczyć holdings on-chain.",
  "holdings.allocation": "alokacja",
  "holdings.share": "udział",

  "top3.title": "Top-3 · rekomendacje",
  "top3.titleLive": "Top-3 · ranking (live)",
  "btn.generate": "Wygeneruj rekomendacje",
  "btn.generating": "Generuję…",
  "btn.purchase": "Dokonaj zakupu",
  "btn.txPending": "Transakcja…",
  "empty.generateTips": "Kliknij Wygeneruj rekomendacje.",
  "empty.connectWallet": "Podłącz portfel, potem wygeneruj rekomendacje.",

  "lastPurchase.titleOnChain": "Ostatni zakup (on-chain)",
  "lastPurchase.titleConnected": "Ostatni zakup",
  "lastPurchase.titleOffline": "Ostatni zakup (offline)",
  "lastPurchase.titleDisconnected": "Ostatni zakup",
  "lastPurchase.emptyConnected":
    "Brak RunRecord — wykonaj pierwszy zakup (simulate_buy).",
  "lastPurchase.empty": "Brak zapisanych zakupów.",
  "lastPurchase.emptyDisconnected": "Podłącz portfel, by zobaczyć zakupy on-chain.",
  "lastPurchase.date": "Data:",
  "lastPurchase.budget": "Budżet:",
  "lastPurchase.perToken":
    "· po równo na 3 spółki (~${amount} USDC na każdą, liczba akcji zależy od ceny)",
  "lastPurchase.bought": "Kupione:",

  "msg.noTop3Proxy": "Proxy /rank nie zwróciło top3.",
  "msg.noTypesafeKey": "Brak TYPESAFE_API_KEY w Ustawieniach",
  "msg.tooFewProducts": "Za mało produktów PreStocks do rankingu (<3).",
  "purchase.disabled.tx": "Transakcja w toku…",
  "purchase.disabled.noRecs": "Zakup nieaktywny — najpierw kliknij Wygeneruj rekomendacje (top-3).",
  "purchase.disabled.notReady": "Zakup nieaktywny — Initialize Predca, potem Deposit USDC do vaulta.",
  "purchase.disabled.vaultLow": "Zakup nieaktywny — vault ma {have} USDC, potrzeba ≥ {need}. Zrób Deposit z portfela (faucet zasila portfel, nie vault).",
  "purchase.disabled.generic": "Zakup nieaktywny — sprawdź vault, ranking i status Predca.",
  "msg.noRecs": "Brak rekomendacji do zakupu.",
  "msg.vaultLowOnChain":
    "Za mało USDC w vault (on-chain): {have} < {need}.",
  "msg.purchaseOk":
    "Zakup on-chain OK · sig {sig}… · ${amount} z vault → {tokens}",
  "msg.purchaseFail":
    "Zakup nieudany — szczegóły w sekcji Predca powyżej (czerwony komunikat).",
  "msg.predcaNotReady":
    "Predca nie jest ready — Initialize + Deposit, potem zakup on-chain.",
  "msg.vaultLowMock":
    "Za mało USDC w vault (mock): {have} < {need}.",
  "msg.purchaseOffline":
    "Zakup zapisany (offline mock): ${amount} z vault → ⅓ na {tokens}",
  "msg.connectForPurchase":
    "Podłącz portfel i Initialize + Deposit, by kupować on-chain.",
  "msg.purchaseError": "Nie udało się wykonać zakupu.",
  "msg.autoNoRecs": "Auto-zakup: ranking nie zwrócił top-3.",

  "auto.status.off": "Auto-zakup wyłączony — włącz w Ustawieniach.",
  "auto.status.next": "Następny automatyczny zakup z vaulta: {when}",
  "auto.status.due":
    "Auto-zakup zaległy — ranking i zakup z vaulta odpalą się same.",
  "auto.status.ranking": "Auto-zakup: generuję ranking (Grok→Jev)…",
  "auto.status.buying":
    "Auto-zakup: pierwszy zakup — podpisz transakcję w portfelu.",
  "auto.status.buyingKeeper":
    "Auto-zakup: keeper kupuje z vaulta (bez podpisu portfela).",
  "auto.status.keeperDown":
    "Keeper niedostępny (tunel lub usługa). UI nie kupuje sam — spróbuj później lub sprawdź połączenie.",
  "auto.status.ok":
    "Automatyczny zakup tygodniowy OK · ${amount} z vault → {tokens}",
  "auto.status.vaultLow":
    "Auto-zakup wstrzymany — za mało USDC w vault ({have} < {need}).",
  "auto.status.needWallet":
    "Podłącz portfel, żeby włączyć keepersa (wystarczy pubkey — zakup zrobi bot).",
  "auto.status.notReady":
    "Auto-zakup czeka na Initialize + Deposit, potem cotygodniowy zakup keepersa z vaulta.",
  "auto.status.error": "Auto-zakup nieudany: {reason}",
  "auto.status.backoff":
    "Auto-zakup: ponowna próba za chwilę (ostatnia nieudana).",
  "auto.banner.ranking": "Cotygodniowy zakup z vaulta: ranking…",
  "auto.banner.buying":
    "Cotygodniowy zakup z vaulta: keeper (bez podpisu w karcie).",

  "settings.kicker": "Konfiguracja DCA",
  "settings.title": "Ustawienia",
  "settings.intro":
    "Tygodniowa kwota zostaje zapisana przy włączeniu cotygodniowych zakupów. BYOK pozostaje w localStorage.",
  "settings.weeklyAmount": "Tygodniowa kwota (USDC)",
  "settings.weeklyAtEnable":
    "Zapisze się przy włączeniu cotygodniowych zakupów (nie trzeba osobno na chain).",
  "settings.autoWeekly": "Automatyczny cotygodniowy zakup z vaulta",
  "settings.autoWeeklyHint":
    "Domyślnie wyłączone. Włączenie bierze kwotę z pola powyżej i od razu kupuje 3 PreStock. Ta transakcja uruchamia cotygodniowy harmonogram. Późniejszych zakupów nie musisz już potwierdzać.",
  "settings.autoWeeklyConfirmTitle": "Włączyć cotygodniowy zakup z vaulta?",
  "settings.autoWeeklyConfirmBody":
    "Kontynuacja podzieli ${amount} USDC z vaulta po równo na 3 spółki PreStock. Dostaniesz różną liczbę akcji, zależnie od ceny każdej. Ta transakcja uruchamia cotygodniowy harmonogram. Późniejszych zakupów nie musisz już potwierdzać.",
  "settings.autoWeeklyConfirmOk": "Kontynuuj",
  "settings.autoWeeklyConfirmCancel": "Anuluj",
  "settings.weeklySplit":
    "Po równo na 3 spółki z top-3 (~${amount} USDC na każdą; liczba akcji zależy od ceny)",
  "settings.onChainBudget": "· on-chain:",
  "settings.saveLocal": "Zapisz lokalnie",
  "settings.savedLocal": "Zapisano lokalnie (brak portfela)",
  "settings.noMint": "Brak NEXT_PUBLIC_USDC_MINT",
  "settings.initBudget": "Initialize + ustaw budżet on-chain",
  "settings.initPending": "Inicjalizacja…",
  "settings.saveOnChain": "Zapisz budżet on-chain",
  "settings.savingOnChain": "Zapis on-chain…",
  "settings.connectForBudget":
    "Podłącz portfel, aby zapisać budżet w Predca (set_weekly_budget / initialize_user).",
  "settings.saved": "· zapisano ✓",
  "settings.cleared": "· wyczyszczono ✓",
  "settings.exclusions": "Wykluczenia (np. xAI, OpenAI) — stosowane w rankingu",
  "settings.buyDespiteIpo": "Kup PreStock mimo odbytego IPO",
  "settings.deadlineInvalid": "Termin bez znaczenia",
  "settings.ipoPremium": "Premia IPO ma znaczenie",
  "settings.prefsDirtyHint":
    "Zmieniono ustawienia. Aby zapisać je u keepersa, trzeba podpisać wiadomość w portfelu.",
  "settings.prefsSignSave": "Podpisz i zapisz",
  "settings.prefsSignSaving": "Podpisywanie…",
  "settings.prefsConnectWallet": "Podłącz portfel, aby podpisać i zapisać",
  "settings.prefsSignNeedWallet": "Podłącz portfel z signMessage, aby zapisać",
  "settings.prefsSignFailed": "Nie udało się zapisać (podpis lub keeper).",
  "settings.prefsSignOk": "Zapisano u keepersa ✓",
  "settings.byokTitle": "BYOK — własne klucze API (Bring Your Own)",
  "settings.byokIntro":
    "Wklej własne klucze.",
  "settings.typesafeLabel": "(Jev) — wymagany do rankingu",
  "settings.xaiLabel":
    "/ Grok — opcjonalny klucz klienta do analizy Grok (wysyłany do API rankingu); pusty = Jev/metryki bez Grok. TypeSafe nadal wymagany do Jev.",
  "settings.show": "Pokaż",
  "settings.hide": "Ukryj",
  "settings.saveKeys": "Zapisz klucze w localStorage",
  "settings.keysSaved": "Zapisano w localStorage ✓",

  "history.kicker": "Przebiegi DCA",
  "history.title": "Historia",
  "history.onChainIntro":
    "RunRecord on-chain · {count} wpis(ów) ({cluster}).",
  "history.connectHint":
    "Podłącz portfel, aby zobaczyć historię zakupów (RunRecord) z Predca.",
  "history.noRuns":
    "Brak RunRecord on-chain — wykonaj pierwszy zakup (simulate_buy) lub poczekaj na record_run.",
  "history.notReady":
    "Predca nie jest gotowe — Initialize (+ Deposit), potem pojawią się przebiegi.",
  "history.loading": "Ładowanie historii on-chain…",
  "history.runMeta": "Run #{index} · budżet ~${budget} · slot {slot}",
};

const en: Dict = {
  "nav.overview": "Overview",
  "nav.settings": "Settings",
  "nav.history": "History",
  "nav.selectWallet": "Select Wallet",

  "overview.kicker": "Trading desk · PreStocks Weekly DCA",
  "overview.title": "Overview",
  "overview.disconnectedHint":
    "Wallet disconnected — connect to see on-chain balances. {cluster}.",
  "overview.noMintHint":
    "Set NEXT_PUBLIC_USDC_MINT to a local mock mint.",
  "overview.onChainHint": "On-chain · {cluster} · values from RPC",
  "overview.clusterMainnet":
    "Warning: RPC looks like Mainnet — this app is Devnet-only. Check NEXT_PUBLIC_RPC_URL.",
  "overview.clusterNotDevnet":
    "Warning: expected Devnet, RPC genesis = {genesis}. Check network / RPC.",

  "faucet.button": "Get 1000 USDC + 0.1 SOL (demo)",
  "faucet.busy": "Sending USDC + SOL…",
  "faucet.success": "Sent 1000 USDC + 0.1 SOL to wallet (demo) · sig {sig}.",
  "faucet.nextSteps": "Next: Deposit into vault (≥ weekly budget) + Generate recommendations — then Purchase unlocks.",
  "faucet.error": "Faucet: {error}",
  "faucet.needWallet": "Connect a wallet to claim demo USDC + SOL.",

  "predca.title": "Predca on-chain ({cluster})",
  "predca.rpc": "RPC:",
  "predca.refresh": "Refresh",
  "predca.loading": "Loading…",
  "predca.budget": "Weekly budget",
  "predca.vault": "Vault",
  "predca.deposit": "Deposit",
  "predca.withdraw": "Withdraw",
  "predca.hintNoAta":
    "Hint: no mock USDC ATA — Deposit usually fails until you have a token account for mint {mint} on Devnet.",
  "predca.hintZeroUsdc":
    "Hint: mock USDC balance = 0 — fund the ATA (mint {mint}) before Deposit.",
  "predca.mintLabel": "Mock USDC mint:",
  "predca.mintNoAta":
    "· No ATA / balance — create a token account and mint test USDC on Devnet before Deposit.",
  "predca.initBudget": "Budget at init (USDC)",
  "predca.initialize": "Initialize",
  "predca.waiting": "Waiting…",
  "predca.initHint":
    "Predca is not initialized — Initialize first, then Deposit (needs mock USDC in the wallet ATA).",
  "predca.depositUnavailable":
    "Deposit unavailable ({reason}). When status = ready, the deposit/withdraw form appears.",
  "predca.status.loading": "loading…",
  "predca.status.no_mint": "no mint",
  "predca.status.disconnected": "no wallet",
  "predca.status.error": "error",
  "predca.lastRun": "Last RunRecord on-chain",

  "tile.sol": "SOL",
  "tile.usdcWallet": "USDC (wallet)",
  "tile.portfolioPreStock": "PreStock portfolio value",
  "tile.portfolioHint":
    "PreStock portfolio value: vault USDC + sum of stock values (Devnet: 1 token unit = 1 USD). Wallet USDC is separate.",

  "holdings.titleOnChain": "Holdings allocation (on-chain ATAs)",
  "holdings.titleOffline": "Holdings allocation (offline)",
  "holdings.titleDisconnected": "Holdings allocation",
  "holdings.emptyConnected":
    "No non-zero mock PreStock ATA balances — run simulate_buy or wait for mint.",
  "holdings.empty": "No holdings.",
  "holdings.emptyDisconnected": "Connect wallet to see on-chain holdings.",
  "holdings.allocation": "allocation",
  "holdings.share": "share",

  "top3.title": "Top-3 · recommendations",
  "top3.titleLive": "Top-3 · ranking (live)",
  "btn.generate": "Generate recommendations",
  "btn.generating": "Generating…",
  "btn.purchase": "Purchase",
  "btn.txPending": "Transaction…",
  "empty.generateTips": "Click Generate recommendations.",
  "empty.connectWallet": "Connect wallet, then generate recommendations.",

  "lastPurchase.titleOnChain": "Last purchase (on-chain)",
  "lastPurchase.titleConnected": "Last purchase",
  "lastPurchase.titleOffline": "Last purchase (offline)",
  "lastPurchase.titleDisconnected": "Last purchase",
  "lastPurchase.emptyConnected":
    "No RunRecord — make the first purchase (simulate_buy).",
  "lastPurchase.empty": "No saved purchases.",
  "lastPurchase.emptyDisconnected": "Connect wallet to see on-chain purchases.",
  "lastPurchase.date": "Date:",
  "lastPurchase.budget": "Budget:",
  "lastPurchase.perToken":
    "· split equally across 3 companies (~${amount} USDC each; share count depends on price)",
  "lastPurchase.bought": "Bought:",

  "msg.noTop3Proxy": "Proxy /rank returned no top3.",
  "msg.noTypesafeKey": "Missing TYPESAFE_API_KEY in Settings",
  "msg.tooFewProducts": "Too few PreStocks products for ranking (<3).",
  "purchase.disabled.tx": "Transaction in progress…",
  "purchase.disabled.noRecs": "Purchase disabled — click Generate recommendations first (top-3).",
  "purchase.disabled.notReady": "Purchase disabled — Initialize Predca, then Deposit USDC into the vault.",
  "purchase.disabled.vaultLow": "Purchase disabled — vault has {have} USDC, need ≥ {need}. Deposit from wallet (faucet fills wallet, not vault).",
  "purchase.disabled.generic": "Purchase disabled — check vault, ranking, and Predca status.",
  "msg.noRecs": "No recommendations to purchase.",
  "msg.vaultLowOnChain":
    "Not enough USDC in vault (on-chain): {have} < {need}.",
  "msg.purchaseOk":
    "On-chain purchase OK · sig {sig}… · ${amount} from vault → {tokens}",
  "msg.purchaseFail":
    "Purchase failed — see details in the Predca section above (red message).",
  "msg.predcaNotReady":
    "Predca is not ready — Initialize + Deposit, then purchase on-chain.",
  "msg.vaultLowMock":
    "Not enough USDC in vault (mock): {have} < {need}.",
  "msg.purchaseOffline":
    "Purchase saved (offline mock): ${amount} from vault → ⅓ to {tokens}",
  "msg.connectForPurchase":
    "Connect wallet and Initialize + Deposit to purchase on-chain.",
  "msg.purchaseError": "Purchase could not be completed.",
  "msg.autoNoRecs": "Auto-buy: ranking did not return a top-3.",

  "auto.status.off": "Auto-buy is off — enable it in Settings.",
  "auto.status.next": "Next automatic vault purchase: {when}",
  "auto.status.due":
    "Auto-buy is due — ranking and vault purchase will run on their own.",
  "auto.status.ranking": "Auto-buy: generating ranking (Grok→Jev)…",
  "auto.status.buying":
    "Auto-buy: first purchase — sign the transaction in your wallet.",
  "auto.status.buyingKeeper":
    "Auto-buy: keeper is purchasing from the vault (no wallet signature).",
  "auto.status.keeperDown":
    "Keeper unavailable (tunnel or service). This tab does not buy on its own — try again later or check the connection.",
  "auto.status.ok":
    "Weekly auto-buy OK · ${amount} from vault → {tokens}",
  "auto.status.vaultLow":
    "Auto-buy paused — not enough USDC in vault ({have} < {need}).",
  "auto.status.needWallet":
    "Connect a wallet to start the keeper (pubkey only — the bot performs the buy).",
  "auto.status.notReady":
    "Auto-buy is waiting for Initialize + Deposit, then weekly keeper purchase from the vault.",
  "auto.status.error": "Auto-buy failed: {reason}",
  "auto.status.backoff":
    "Auto-buy: retrying shortly (last attempt failed).",
  "auto.banner.ranking": "Weekly vault purchase: ranking…",
  "auto.banner.buying":
    "Weekly vault purchase: keeper (no in-tab signature).",

  "settings.kicker": "DCA configuration",
  "settings.title": "Settings",
  "settings.intro":
    "The weekly amount is saved when you turn on weekly purchases. BYOK stays in localStorage.",
  "settings.weeklyAmount": "Weekly amount (USDC)",
  "settings.weeklyAtEnable":
    "Saved when you enable weekly purchases (no separate on-chain save).",
  "settings.autoWeekly": "Automatic weekly purchase from the vault",
  "settings.autoWeeklyHint":
    "Off by default. Enabling takes the amount above and immediately buys 3 PreStocks. That transaction starts the weekly schedule. You will not need to confirm later purchases.",
  "settings.autoWeeklyConfirmTitle": "Enable weekly vault purchases?",
  "settings.autoWeeklyConfirmBody":
    "Continuing will split ${amount} USDC from the vault equally across 3 PreStock companies. You will receive a different number of shares depending on each price. This transaction starts the weekly schedule. You will not need to confirm later purchases.",
  "settings.autoWeeklyConfirmOk": "Continue",
  "settings.autoWeeklyConfirmCancel": "Cancel",
  "settings.weeklySplit":
    "Split equally across 3 top-3 companies (~${amount} USDC each; share count depends on price)",
  "settings.onChainBudget": "· on-chain:",
  "settings.saveLocal": "Save locally",
  "settings.savedLocal": "Saved locally (no wallet)",
  "settings.noMint": "Missing NEXT_PUBLIC_USDC_MINT",
  "settings.initBudget": "Initialize + set budget on-chain",
  "settings.initPending": "Initializing…",
  "settings.saveOnChain": "Save budget on-chain",
  "settings.savingOnChain": "Saving on-chain…",
  "settings.connectForBudget":
    "Connect wallet to save budget in Predca (set_weekly_budget / initialize_user).",
  "settings.saved": "· saved ✓",
  "settings.cleared": "· cleared ✓",
  "settings.exclusions": "Exclusions (e.g. xAI, OpenAI) — applied to ranking",
  "settings.buyDespiteIpo": "Buy PreStock even after IPO",
  "settings.deadlineInvalid": "Deadline irrelevant",
  "settings.ipoPremium": "IPO premium matters",
  "settings.prefsDirtyHint":
    "Settings changed. Sign a wallet message to save them to the keeper.",
  "settings.prefsSignSave": "Sign & save",
  "settings.prefsSignSaving": "Signing…",
  "settings.prefsConnectWallet": "Connect wallet to sign and save",
  "settings.prefsSignNeedWallet": "Connect a wallet with signMessage to save",
  "settings.prefsSignFailed": "Could not save (signature or keeper).",
  "settings.prefsSignOk": "Saved to keeper ✓",
  "settings.byokTitle": "BYOK — Bring Your Own API Keys",
  "settings.byokIntro":
    "Paste your own keys.",
  "settings.typesafeLabel": "(Jev) — required for ranking",
  "settings.xaiLabel":
    "/ Grok — optional client key for Grok analysis (sent to the ranking API); empty = Jev/metrics without Grok. TypeSafe still required for Jev.",
  "settings.show": "Show",
  "settings.hide": "Hide",
  "settings.saveKeys": "Save keys to localStorage",
  "settings.keysSaved": "Saved to localStorage ✓",

  "history.kicker": "DCA runs",
  "history.title": "History",
  "history.onChainIntro":
    "RunRecord on-chain · {count} entries ({cluster}).",
  "history.connectHint":
    "Connect your wallet to see purchase history (RunRecord) from Predca.",
  "history.noRuns":
    "No on-chain RunRecord yet — make a purchase (simulate_buy) or wait for record_run.",
  "history.notReady":
    "Predca is not ready — Initialize (+ Deposit), then runs will appear.",
  "history.loading": "Loading on-chain history…",
  "history.runMeta": "Run #{index} · budget ~${budget} · slot {slot}",
};

const dictionaries: Record<Locale, Dict> = { pl, en };

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v === "pl" || v === "en") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const dict = dictionaries[locale] ?? dictionaries.pl;
      const raw = dict[key] ?? dictionaries.pl[key] ?? dictionaries.en[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
