/** localStorage BYOK — never commit secrets; never bake hosted key into Pages. */

export const LS_TYPESAFE = "prestocks.TYPESAFE_API_KEY";
export const LS_XAI = "prestocks.XAI_API_KEY";
export const SS_PRODUCTS = "prestocks.session.products";
export const SS_RANK = "prestocks.session.rank";

export function readTypesafeKey(): string {
  try {
    return (localStorage.getItem(LS_TYPESAFE) ?? "").trim();
  } catch {
    return "";
  }
}

export function readXaiKey(): string {
  try {
    return (localStorage.getItem(LS_XAI) ?? "").trim();
  } catch {
    return "";
  }
}

export function hasByokTypesafe(): boolean {
  return readTypesafeKey().length > 0;
}

export function hasByokXai(): boolean {
  return readXaiKey().length > 0;
}

/** Hosted DCA API base (no trailing slash). Empty = Pages without backend. */
export function dcaApiBase(): string {
  return (process.env.NEXT_PUBLIC_DCA_API_URL ?? "").trim().replace(/\/$/, "");
}

/** Same-origin `/api/jev` exists only under `next dev`, not GitHub Pages. */
export function canUseSameOriginJevProxy(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}
