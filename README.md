> **Pages mirror:** This repository is a GitHub Pages deploy mirror of [`prestocks-dca-noir`](https://github.com/krzysztofpazdyk/prestocks-dca-noir) (same app, `basePath` `/prestocks-dca-noir2.0`). Future UI ships need redeploying both repos (or automate later).

# PreStocks UI — Noir

Interfejs **PreStocks Weekly DCA** w stylu trading desk: głęboki charcoal, neonowy teal/violet, liczby monospace.

Podłączony do programu Anchor **predca** (custody USDC + config + RunRecord). Sieć: **Solana localnet lub devnet** (wybierana przez `NEXT_PUBLIC_RPC_URL`) — bez seedów / kluczy prywatnych w repo.

## Wymagania

- Node.js 20+
- npm
- `solana-test-validator` (CLI Solana) — do transakcji on-chain
- Program **predca** wdrożony na localnet (`HajLzgcp6fyHVgVLFtwujnU53re47PSMJcQZZes8ZvbU`)

## Instalacja

```bash
cd /workspace/prestocks-ui-noir
cp .env.example .env.local   # uzupełnij NEXT_PUBLIC_USDC_MINT po utworzeniu mintu
npm install
```

## Localnet + Predca

1. Uruchom validator:

```bash
solana-test-validator
```

2. Ustaw CLI na localnet i upewnij się, że **predca** jest zdeployowany (z katalogu `/workspace/predca`):

```bash
solana config set --url http://127.0.0.1:8899
anchor deploy   # lub równoważny deploy programu predca
```

3. Utwórz lokalny mock mint USDC (6 decimals) i wpisz pubkey do env:

```bash
spl-token create-token --decimals 6
# skopiuj mint → NEXT_PUBLIC_USDC_MINT w .env.local
```

Mint **nie jest zahardcodowany** w programie — to konto w instrukcjach. Bez `NEXT_PUBLIC_USDC_MINT` UI pokaże ostrzeżenie i zablokuje init/deposit/withdraw.

4. Dev UI:

```bash
cd /workspace/prestocks-ui-noir
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000).

Zmienne (patrz `.env.example`):

| Zmienna | Domyślnie |
|---------|-----------|
| `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8899` |
| `NEXT_PUBLIC_PREDCA_PROGRAM_ID` | `HajLzgcp6fyHVgVLFtwujnU53re47PSMJcQZZes8ZvbU` |
| `NEXT_PUBLIC_USDC_MINT` | *(puste — ustaw po create-token)* |

IDL jest skopiowane do `idl/predca.json` (aplikacja self-contained — bez runtime importu z `/workspace/predca`).

## Build

```bash
npm run build
npm start
```

Build **nie wymaga** żywego validatora (tylko typy + IDL).

## Ekrany

1. **Overview** — salda Predca on-chain (budżet, vault USDC, ostatni RunRecord), Initialize / Deposit / Withdraw, mock holdings pie (off-chain), connect wallet
2. **Ustawienia** — budżet → `set_weekly_budget` / `initialize_user` gdy portfel + mint; BYOK w localStorage
3. **Historia** — RunRecord on-chain (skan `run_index` 0…), inaczej mock z adnotacją

`record_run` **nie** jest akcją użytkownika w UI — zapisuje go job off-chain; UI tylko czyta RunRecord.

## Portfel podłączony vs odłączony

| Stan | Zachowanie |
|------|------------|
| Odłączony | Mock salda/holdings/historia; brak tx Predca |
| Podłączony, brak mint | Ostrzeżenie o `NEXT_PUBLIC_USDC_MINT` |
| Podłączony, brak UserConfig | Przycisk **Initialize** |
| Podłączony + config | Deposit / Withdraw / zapis budżetu; Historia z chain jeśli są RunRecord |

## BYOK (Bring Your Own Key)

W **Ustawieniach** wklejasz własne klucze (nie konta autora apki). Zapis w **localStorage** — off-chain, nie wysyłamy na serwer:

| Klucz | Opis |
|-------|------|
| `TYPESAFE_API_KEY` | Jev — **wymagany** do rankingu (`prestocks.TYPESAFE_API_KEY`) |
| `XAI_API_KEY` | Grok — **opcjonalny**; pusty = metrics→Jev bez LLM (`prestocks.XAI_API_KEY`) |

## GitHub Pages (static / DEVNET)

Static export deploys to:
**https://krzysztofpazdyk.github.io/prestocks-dca-noir2.0/**

- Build uses `output: 'export'` with `basePath` / `assetPrefix` `/prestocks-dca-noir2.0`.
- Production env (`.env.production`) points at **Solana DEVNET** only — public `NEXT_PUBLIC_*` values, no private keys.
- CI: `.github/workflows/pages.yml` builds on push to `main` and uploads `out/` to GitHub Pages.

### Phantom / wallet

W Phantom (lub innym walletcie) ustaw sieć na **Devnet** przed łączeniem. UI jest zahardcodowane na `https://api.devnet.solana.com` w buildzie Pages — Mainnet nie zadziała z tym deployem.

