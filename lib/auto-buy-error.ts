import { translate, type Locale } from "@/lib/i18n";
import { PREDCA_ERROR_PL } from "@/lib/predca";

/** Visible auto-buy failures stay one short sentence. Raw text is for title/debug only. */
export const AUTO_BUY_ERROR_TITLE_MAX = 160;

export type AutoBuyErrorT = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

const PREDCA_NAME_TO_CODE: Record<string, number> = {
  unauthorized: 6000,
  zeroamount: 6001,
  insufficientvault: 6002,
  invalidbudget: 6003,
  runalreadyexists: 6004,
  invalidmintauthority: 6005,
  mintmismatch: 6006,
  duplicatemints: 6007,
  toosoon: 6008,
};

const STATUS_ERROR_PREFIXES = ["Auto-zakup nieudany:", "Auto-buy failed:"];

const TECHNICAL_RE =
  /custom program error|simulation failed|error number:|error code:|anchorerror|program log|0x[0-9a-f]+|blockhash|insufficient|slippage|timed?\s*out|timeout|econn|enotfound|failed to fetch|fetch failed|network request failed|sign_rejected|signature_rejected|user rejected|podpis odrzucony|http_\d+|enable_failed|enable_timeout|keeper_unreachable|\{\s*"|\blog:|instruction \d|json-rpc|transaction expired|block height exceeded|disable failed|purchase skipped|without a completed purchase/i;

function translator(langOrT: Locale | AutoBuyErrorT): AutoBuyErrorT {
  if (typeof langOrT === "function") return langOrT;
  return (key, vars) => translate(langOrT, key, vars);
}

/** Drop the "Auto-buy failed: {reason}" wrapper so classification sees the raw reason. */
export function unwrapAutoBuyError(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  for (const prefix of STATUS_ERROR_PREFIXES) {
    if (lower.startsWith(prefix.toLowerCase())) {
      return trimmed.slice(prefix.length).trim();
    }
  }
  return trimmed;
}

function predcaCode(raw: string): number | null {
  const numbered = raw.match(/Error Number:\s*(\d+)/i);
  if (numbered) {
    const code = Number(numbered[1]);
    if (PREDCA_ERROR_PL[code]) return code;
  }
  const named = raw.match(/Error Code:\s*([A-Za-z0-9_]+)/);
  if (named) {
    const code = PREDCA_NAME_TO_CODE[named[1].toLowerCase()];
    if (code && PREDCA_ERROR_PL[code]) return code;
  }
  for (const match of raw.matchAll(/custom program error:\s*0x([0-9a-f]+)/gi)) {
    const code = Number.parseInt(match[1], 16);
    if (PREDCA_ERROR_PL[code]) return code;
  }
  return null;
}

function isUserRejected(raw: string): boolean {
  return /user rejected|rejected the request|user denied|user cancel(?:ed|led)|sign_rejected|signature_rejected|podpis odrzucony/i.test(
    raw,
  );
}

function categoryKey(raw: string): string | null {
  const code = predcaCode(raw);
  // Program code wins over a "signature rejected" wrapper that quotes the logs.
  if (code != null) return `auto.error.predca.${code}`;
  if (isUserRejected(raw)) return "auto.error.rejected";
  if (
    /slippage|price impact too high|price moved|exceeds desired price|priceslippage/i.test(
      raw,
    )
  ) {
    return "auto.error.slippage";
  }
  if (
    /insufficient funds|insufficient lamports|insufficient balance|insufficient vault|not enough (?:usdc|funds|balance|sol|lamports)|custom program error:\s*0x1\b|vault_low|niewystarczaj|za mało/i.test(
      raw,
    )
  ) {
    return "auto.error.insufficient";
  }
  if (
    /blockhash|timed?\s*out|timeout|etimedout|econn(?:refused|reset|aborted)?|enotfound|failed to fetch|fetch failed|network request failed|too many requests|\b429\b|keeper_unreachable|enable_timeout|block height exceeded|transaction expired|gateway time-?out|\bhttp_5\d\d\b|\bhttp_0\b/i.test(
      raw,
    )
  ) {
    return "auto.error.network";
  }
  if (
    /simulation failed|error processing instruction|custom program error/i.test(
      raw,
    )
  ) {
    return "auto.error.simulation";
  }
  return null;
}

/**
 * Map a raw auto-buy / RPC / program error onto one short sentence.
 * `langOrT` is a locale ("pl" | "en") or the app translator `t`.
 * Empty, unknown, and huge inputs all use the generic fallback.
 */
export function friendlyAutoBuyError(
  raw: string | null | undefined,
  langOrT: Locale | AutoBuyErrorT,
): string {
  const t = translator(langOrT);
  const text = unwrapAutoBuyError(typeof raw === "string" ? raw : "");
  if (!text) return t("auto.error.fallback");
  const key = categoryKey(text);
  if (!key) return t("auto.error.fallback");
  const message = t(key);
  if (!message || message === key) {
    const code = Number(key.slice("auto.error.predca.".length));
    if (PREDCA_ERROR_PL[code]) return PREDCA_ERROR_PL[code];
    return t("auto.error.fallback");
  }
  return message;
}

export function looksLikeRawAutoBuyError(text: string): boolean {
  if (text.length > 180) return true;
  return TECHNICAL_RE.test(text);
}

/** One line, capped, for a title tooltip — never the visible banner copy. */
export function autoBuyErrorTitle(raw: string): string {
  const oneLine = raw.replace(/\s+/g, " ").trim();
  if (oneLine.length <= AUTO_BUY_ERROR_TITLE_MAX) return oneLine;
  return `${oneLine.slice(0, AUTO_BUY_ERROR_TITLE_MAX - 1)}…`;
}

/**
 * Banner / settings presentation. Already-friendly status lines pass through.
 * Wrapped or technical errors become the short sentence; raw stays on `title`.
 */
export function presentAutoBuyError(
  stored: string,
  langOrT: Locale | AutoBuyErrorT,
): { text: string; title?: string } {
  const trimmed = (stored ?? "").trim();
  if (!trimmed) return { text: friendlyAutoBuyError("", langOrT) };
  const reason = unwrapAutoBuyError(trimmed);
  const wrapped = reason !== trimmed;
  if (!wrapped && !looksLikeRawAutoBuyError(trimmed)) {
    return { text: stored };
  }
  const text = friendlyAutoBuyError(reason, langOrT);
  const title = autoBuyErrorTitle(reason || trimmed);
  if (!title || title === text) return { text };
  return { text, title };
}
