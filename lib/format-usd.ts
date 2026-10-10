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
