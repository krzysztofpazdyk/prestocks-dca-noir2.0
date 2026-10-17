import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTO_BUY_ERROR_TITLE_MAX,
  friendlyAutoBuyError,
  presentAutoBuyError,
} from "../lib/auto-buy-error";
import { translate } from "../lib/i18n";
import { PREDCA_ERROR_PL } from "../lib/predca";

const SIM_LOG = [
  "Simulation failed: Error processing Instruction 0: custom program error: 0x1772.",
  "Program log: AnchorError caused by account: vault.",
  "Error Code: InsufficientVault. Error Number: 6002.",
  "Error Message: Insufficient vault balance.",
  "Left: 100, Right: 5000000",
  "logs: " + "Compute budget exceeded ".repeat(40),
].join("\n");

const REJECT_LOG =
  "Podpis odrzucony: sign_rejected: User rejected the request. " +
  JSON.stringify({
    error: "User rejected the request.",
    logs: ["Wallet window closed", "x".repeat(400)],
  });

const BLOCKHASH_LOG =
  "failed to send transaction: Transaction simulation failed: Blockhash not found. " +
  "Transaction expired. block height exceeded. " +
  "RPC JSON {\"jsonrpc\":\"2.0\",\"error\":{\"code\":-32002,\"message\":\"Blockhash not found\"}} " +
  "y".repeat(1500);

const samples: Array<{ name: string; raw: string; pl: string; en: string }> = [
  {
    name: "predca vault program error",
    raw: SIM_LOG,
    pl: "Niewystarczające saldo w vault.",
    en: "Not enough balance in the vault.",
  },
  {
    name: "predca too soon by hex",
    raw: "custom program error: 0x1778",
    pl: "Za wcześnie: odczekaj 7 dni od ostatniego zakupu (TooSoon).",
    en: "Too soon. Wait 7 days since the last purchase.",
  },
  {
    name: "wallet rejected",
    raw: REJECT_LOG,
    pl: "Odrzucono prośbę w portfelu.",
    en: "The wallet rejected the request.",
  },
  {
    name: "insufficient lamports",
    raw: "Transfer: insufficient lamports 1400, need 5000000. custom program error: 0x1",
    pl: "Za mało środków na auto-zakup.",
    en: "Not enough funds for the auto-buy.",
  },
  {
    name: "slippage",
    raw: "Simulation failed: Slippage tolerance exceeded. The price moved too much.",
    pl: "Cena się zmieniła. Spróbuj ponownie później.",
    en: "The price moved. Try again later.",
  },
  {
    name: "blockhash / rpc",
    raw: BLOCKHASH_LOG,
    pl: "Problem z siecią. Spróbuj ponownie później.",
    en: "Network problem. Try again later.",
  },
  {
    name: "generic simulation",
    raw: "Simulation failed: Error processing Instruction 2: custom program error: 0xbc4",
    pl: "Symulacja transakcji nie powiodła się.",
    en: "The transaction simulation failed.",
  },
  {
    name: "unknown keeper code",
    raw: "enable_failed",
    pl: "Auto-zakup nieudany. Spróbuj ponownie później.",
    en: "Auto-buy failed. Try again later.",
  },
];

test("friendly auto-buy errors are short sentences in Polish and English", () => {
  for (const sample of samples) {
    const pl = friendlyAutoBuyError(sample.raw, "pl");
    const en = friendlyAutoBuyError(sample.raw, "en");
    assert.equal(pl, sample.pl, sample.name);
    assert.equal(en, sample.en, sample.name);
    for (const text of [pl, en]) {
      assert.equal(text.includes("\n"), false, sample.name);
      assert.ok(text.length < 120, sample.name);
      assert.equal(text.includes("0x"), false, sample.name);
      assert.equal(text.includes("Program log"), false, sample.name);
    }
    if (sample.raw.length > 80) {
      assert.equal(pl.includes(sample.raw.slice(0, 40)), false, sample.name);
      assert.equal(en.includes(sample.raw.slice(0, 40)), false, sample.name);
    }
  }
});

test("wrapped banner text and the t() translator use the same sentences", () => {
  const raw = `Auto-zakup nieudany: ${SIM_LOG}`;
  const t = (key: string) => translate("pl", key);
  assert.equal(
    friendlyAutoBuyError(raw, t),
    "Niewystarczające saldo w vault.",
  );
  assert.equal(
    friendlyAutoBuyError(`Auto-buy failed: ${BLOCKHASH_LOG}`, "en"),
    "Network problem. Try again later.",
  );
});

test("Polish Predca sentences match PREDCA_ERROR_PL", () => {
  for (const [code, msg] of Object.entries(PREDCA_ERROR_PL)) {
    assert.equal(translate("pl", `auto.error.predca.${code}`), msg);
    assert.equal(
      friendlyAutoBuyError(`Error Number: ${code}. Error Code: Unused.`, "pl"),
      msg,
    );
  }
});

test("a missing Predca translation falls back to PREDCA_ERROR_PL", () => {
  const msg = friendlyAutoBuyError("Error Number: 6004", (key) => key);
  assert.equal(msg, PREDCA_ERROR_PL[6004]);
});

test("empty input uses the generic fallback", () => {
  assert.equal(
    friendlyAutoBuyError("", "pl"),
    "Auto-zakup nieudany. Spróbuj ponownie później.",
  );
  assert.equal(
    friendlyAutoBuyError("   \n\t", "en"),
    "Auto-buy failed. Try again later.",
  );
  assert.equal(
    friendlyAutoBuyError(null, "en"),
    "Auto-buy failed. Try again later.",
  );
  assert.equal(
    friendlyAutoBuyError(undefined, "pl"),
    "Auto-zakup nieudany. Spróbuj ponownie później.",
  );
});

test("a very long unknown input stays the short fallback", () => {
  const raw = `{"error":"weird_internal","detail":"${"nope ".repeat(2000)}"}`;
  assert.ok(raw.length > 5000);
  for (const lang of ["pl", "en"] as const) {
    const text = friendlyAutoBuyError(raw, lang);
    assert.equal(
      text,
      lang === "pl"
        ? "Auto-zakup nieudany. Spróbuj ponownie później."
        : "Auto-buy failed. Try again later.",
    );
    assert.ok(text.length < 80);
    assert.equal(text.includes("weird_internal"), false);
    assert.equal(text.includes("nope nope"), false);
  }
});

test("the banner keeps friendly status lines and hides raw errors behind a title", () => {
  const vault = "Auto-zakup wstrzymany — za mało USDC w vault (? < 12.00).";
  assert.deepEqual(presentAutoBuyError(vault, "pl"), { text: vault });

  const stored = `Auto-buy failed: ${BLOCKHASH_LOG}`;
  const view = presentAutoBuyError(stored, "en");
  assert.equal(view.text, "Network problem. Try again later.");
  assert.ok(view.title);
  assert.ok(view.title.length <= AUTO_BUY_ERROR_TITLE_MAX);
  assert.equal(view.title.includes("\n"), false);
  assert.ok(view.title.endsWith("…"));
  assert.equal(view.text.includes(BLOCKHASH_LOG.slice(0, 30)), false);
});
