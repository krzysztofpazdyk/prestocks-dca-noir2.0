/** Jupiter amounts for the UI. USDC totals stay on their own formatters. */
export function fmtUsdAmount(
  value: number | null,
  locale: string,
  digits = 2,
  signed = false,
): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const text = value.toLocaleString(locale === "en" ? "en-US" : "pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? "exceptZero" : "auto",
  });
  return `${text} USD`;
}

/** "+12,30 USD (+4,1%)". Null when the dollar amount is missing. */
export function fmtSignedPnl(
  pnlUsd: number | null,
  pnlPct: number | null,
  locale: string,
): string | null {
  const money = fmtUsdAmount(pnlUsd, locale, 2, true);
  if (money == null) return null;
  if (pnlPct == null || !Number.isFinite(pnlPct)) return money;
  const pct = pnlPct.toLocaleString(locale === "en" ? "en-US" : "pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  });
  return `${money} (${pct}%)`;
}

type WarsawParts = { y: string; m: string; d: string; h: string; min: string };

function warsawParts(ms: number): WarsawParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  let h = pick("hour");
  if (h === "24") h = "00";
  return { y: pick("year"), m: pick("month"), d: pick("day"), h, min: pick("minute") };
}

/**
 * Same Warsaw calendar day → HH:MM. Another day → dd.MM HH:MM (PL) or dd/MM HH:MM (EN).
 * `now` is explicit so the UI can pass the page clock without calling Date.now during render.
 */
export function fmtPriceClock(fetchedAt: number, now: number, locale: string): string {
  const at = warsawParts(fetchedAt);
  const today = warsawParts(now);
  const hm = `${at.h}:${at.min}`;
  if (at.y === today.y && at.m === today.m && at.d === today.d) return hm;
  const sep = locale === "en" ? "/" : ".";
  return `${at.d}${sep}${at.m} ${hm}`;
}
