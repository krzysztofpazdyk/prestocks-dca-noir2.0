/**
 * Optional company facts from /prestocks/products or /rank.
 * Missing or stale facts leave filters and toggles as they are today.
 * The server may add these fields later (Annex A). The client accepts them now.
 */

import { canonicalName } from "@/lib/jup-prices";
import { MINTS, NEAR_IPO_NAMES, type PrestocksProduct } from "@/lib/universe";

export const COMPANY_DATA_KEY = "prestocks.companyData.v1";
export const COMPANY_DATA_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const FUTURE_SLACK_MS = 60 * 60 * 1000;
const NEAR_IPO_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export type IpoStatus = "listed" | "announced" | "rumored" | "none";

export type CompanyData = {
  ipoDate: number | null;
  ipoStatus: IpoStatus | null;
  deadline: number | null;
  source: string;
  checkedAt: number;
};

export type ToggleBucket = {
  enabled: boolean;
  known: string[];
  unknown: string[];
  stale: string[];
};

export type CompanyAvailability = {
  buyDespiteIpo: ToggleBucket;
  deadlinesUnimportant: ToggleBucket;
};

type CacheFile = { byName: Record<string, CompanyData>; savedAt: number };

export type CompanySnap = {
  byName: Record<string, CompanyData>;
  readAt: number;
};

type MemoryStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const IPO_STATUSES: readonly IpoStatus[] = ["listed", "announced", "rumored", "none"];

const NAME_BY_CANON = new Map<string, string>();
for (const name of Object.keys(MINTS)) {
  NAME_BY_CANON.set(canonicalName(name), name);
}

const SERVER_SNAP: CompanySnap = { byName: {}, readAt: 0 };

let cachedRaw: string | null | undefined;
let cachedSnap: CompanySnap = SERVER_SNAP;
const listeners = new Set<() => void>();

export function displayMintName(name: unknown): string | null {
  if (typeof name !== "string" || !name.trim()) return null;
  return NAME_BY_CANON.get(canonicalName(name)) ?? null;
}

function httpsSource(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("https://")) return null;
  try {
    const url = new URL(s);
    if (url.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return s;
}

function optionalDate(
  obj: Record<string, unknown>,
  camel: string,
  snake?: string,
): number | null | "bad" {
  const hasCamel = Object.prototype.hasOwnProperty.call(obj, camel);
  const hasSnake = snake ? Object.prototype.hasOwnProperty.call(obj, snake) : false;
  if (!hasCamel && !hasSnake) return null;
  const value = hasCamel ? obj[camel] : obj[snake as string];
  if (value == null) return null;
  if (typeof value !== "string" || !value.trim()) return "bad";
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "bad";
  return ms;
}

/** Invalid records are null. A null date field is allowed and means "unknown". */
export function normalizeCompanyData(raw: unknown, now: number): CompanyData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const source = httpsSource(obj.source);
  if (!source) return null;
  const checkedRaw = Object.prototype.hasOwnProperty.call(obj, "checkedAt")
    ? obj.checkedAt
    : obj.checked_at;
  if (typeof checkedRaw !== "string" || !checkedRaw.trim()) return null;
  const checkedAt = Date.parse(checkedRaw);
  if (!Number.isFinite(checkedAt)) return null;
  if (checkedAt - now > FUTURE_SLACK_MS) return null;

  const hasStatus =
    Object.prototype.hasOwnProperty.call(obj, "ipoStatus") ||
    Object.prototype.hasOwnProperty.call(obj, "ipo_status");
  let ipoStatus: IpoStatus | null = null;
  if (hasStatus) {
    const statusRaw = Object.prototype.hasOwnProperty.call(obj, "ipoStatus")
      ? obj.ipoStatus
      : obj.ipo_status;
    if (statusRaw == null) {
      ipoStatus = null;
    } else if (
      typeof statusRaw === "string" &&
      (IPO_STATUSES as readonly string[]).includes(statusRaw)
    ) {
      ipoStatus = statusRaw as IpoStatus;
    } else {
      return null;
    }
  }

  const ipoDate = optionalDate(obj, "ipoDate", "ipo_date");
  if (ipoDate === "bad") return null;
  const deadline = optionalDate(obj, "deadline");
  if (deadline === "bad") return null;

  return { ipoDate, ipoStatus, deadline, source, checkedAt };
}

export function isFresh(data: CompanyData, now: number): boolean {
  return now - data.checkedAt <= COMPANY_DATA_MAX_AGE_MS;
}

export function ipoKnown(data: CompanyData | null | undefined, now: number): boolean {
  return !!data && isFresh(data, now) && data.ipoStatus != null;
}

export function deadlineKnown(
  data: CompanyData | null | undefined,
  now: number,
): boolean {
  return !!data && isFresh(data, now) && data.deadline != null;
}

export function mergeCompanyData(
  a: Record<string, CompanyData>,
  b: Record<string, CompanyData>,
): Record<string, CompanyData> {
  const out: Record<string, CompanyData> = { ...a };
  for (const [name, rec] of Object.entries(b)) {
    const prev = out[name];
    if (!prev || rec.checkedAt >= prev.checkedAt) out[name] = rec;
  }
  return out;
}

function lookup(
  byName: Record<string, CompanyData>,
  name: string,
): CompanyData | undefined {
  if (byName[name]) return byName[name];
  const display = displayMintName(name);
  if (display && byName[display]) return byName[display];
  const want = canonicalName(name);
  for (const [key, rec] of Object.entries(byName)) {
    if (canonicalName(key) === want) return rec;
  }
  return undefined;
}

export function companyDataFromProducts(
  products: ReadonlyArray<{ name?: string }>,
  now: number,
): Record<string, CompanyData> {
  const out: Record<string, CompanyData> = {};
  for (const product of products) {
    const display = displayMintName(product.name);
    if (!display) continue;
    const rec = normalizeCompanyData(product, now);
    if (!rec) continue;
    const prev = out[display];
    if (!prev || rec.checkedAt >= prev.checkedAt) out[display] = rec;
  }
  return out;
}

export function companyDataFromRankMap(
  raw: Record<string, unknown> | null | undefined,
  now: number,
): Record<string, CompanyData> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, CompanyData> = {};
  for (const [name, value] of Object.entries(raw)) {
    const display = displayMintName(name);
    if (!display) continue;
    const rec = normalizeCompanyData(value, now);
    if (!rec) continue;
    const prev = out[display];
    if (!prev || rec.checkedAt >= prev.checkedAt) out[display] = rec;
  }
  return out;
}

function browserStore(): MemoryStore | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function readStored(
  store: MemoryStore | null,
): Record<string, CompanyData> {
  if (!store) return {};
  try {
    const raw = store.getItem(COMPANY_DATA_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CacheFile;
    const byName: Record<string, CompanyData> = {};
    for (const [name, rec] of Object.entries(parsed?.byName ?? {})) {
      const display = displayMintName(name);
      if (!display || !rec || typeof rec.checkedAt !== "number") continue;
      if (typeof rec.source !== "string" || !rec.source.startsWith("https://")) continue;
      byName[display] = rec;
    }
    return byName;
  } catch {
    return {};
  }
}

export function rememberCompanyRecords(
  incoming: Record<string, CompanyData>,
  now = Date.now(),
  storage?: MemoryStore | null,
): Record<string, CompanyData> {
  const store = storage === undefined ? browserStore() : storage;
  const merged = mergeCompanyData(readStored(store), incoming);
  if (store) {
    try {
      const raw = JSON.stringify({ byName: merged, savedAt: now } satisfies CacheFile);
      store.setItem(COMPANY_DATA_KEY, raw);
      if (store === browserStore()) {
        cachedRaw = raw;
        cachedSnap = { byName: merged, readAt: now };
        for (const listener of listeners) listener();
      }
    } catch {
      /* keep the merged map even when the browser refuses the write */
    }
  }
  return merged;
}

export function companyDataNeedsRefresh(
  byName: Record<string, CompanyData>,
  now: number,
): boolean {
  const rows = Object.values(byName);
  if (rows.length === 0) return true;
  const oldest = Math.min(...rows.map((row) => row.checkedAt));
  return now - oldest > COMPANY_DATA_MAX_AGE_MS;
}

/** One unauthenticated GET. A failure leaves the cache as it was. */
export async function refreshStaleCompanyData(base: string): Promise<void> {
  if (!base) return;
  try {
    const resp = await fetch(`${base}/prestocks/products`, {
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) return;
    const data = (await resp.json()) as { products?: Array<{ name?: string }> };
    const now = Date.now();
    rememberCompanyRecords(companyDataFromProducts(data.products ?? [], now), now);
  } catch {
    /* keep cache */
  }
}

function bucketFor(
  names: string[],
  byName: Record<string, CompanyData>,
  now: number,
  isKnown: (data: CompanyData) => boolean,
): ToggleBucket {
  const known: string[] = [];
  const unknown: string[] = [];
  const stale: string[] = [];
  for (const name of names) {
    const data = lookup(byName, name);
    if (!data) {
      unknown.push(name);
      continue;
    }
    if (!isFresh(data, now)) {
      stale.push(name);
      continue;
    }
    if (isKnown(data)) known.push(name);
    else unknown.push(name);
  }
  return { enabled: known.length > 0, known, unknown, stale };
}

export function toggleAvailability(
  byName: Record<string, CompanyData>,
  now: number,
): CompanyAvailability {
  const names = Object.keys(MINTS);
  return {
    buyDespiteIpo: bucketFor(names, byName, now, (data) => data.ipoStatus != null),
    deadlinesUnimportant: bucketFor(
      names,
      byName,
      now,
      (data) => data.deadline != null,
    ),
  };
}

function inNearIpoList(name: string): boolean {
  const want = canonicalName(name);
  return NEAR_IPO_NAMES.some((entry) => canonicalName(entry) === want);
}

/**
 * Fresh facts only. No fresh record returns the same product object.
 * `rumored` / `none` do not change `near_ipo`.
 */
export function applyCompanyData(
  products: PrestocksProduct[],
  byName: Record<string, CompanyData>,
  now: number,
): PrestocksProduct[] {
  return products.map((product) => {
    const data = lookup(byName, product.name);
    if (!data || !isFresh(data, now)) return product;
    let ipoCompleted = product.ipo_completed;
    let deadlineInvalid = product.deadline_invalid;
    let nearIpo = product.near_ipo;
    if (
      ipoKnown(data, now) &&
      data.ipoStatus === "listed" &&
      data.ipoDate != null &&
      data.ipoDate <= now
    ) {
      ipoCompleted = true;
    }
    if (deadlineKnown(data, now) && data.deadline != null && data.deadline < now) {
      deadlineInvalid = true;
    }
    if (data.ipoStatus === "announced" && data.ipoDate != null) {
      const delta = data.ipoDate - now;
      nearIpo = inNearIpoList(product.name) || (delta >= 0 && delta <= NEAR_IPO_WINDOW_MS);
    } else if (inNearIpoList(product.name)) {
      nearIpo = true;
    } else if (data.ipoStatus === "listed") {
      nearIpo = false;
    }
    if (
      ipoCompleted === product.ipo_completed &&
      deadlineInvalid === product.deadline_invalid &&
      nearIpo === product.near_ipo
    ) {
      return product;
    }
    return {
      ...product,
      ipo_completed: ipoCompleted,
      deadline_invalid: deadlineInvalid,
      near_ipo: nearIpo,
    };
  });
}

/** Europe/Warsaw. PL `dd.MM.yyyy` / `dd.MM`. EN `dd/MM/yyyy` / `dd/MM`. */
export function formatCompanyDate(
  ms: number,
  locale: string,
  style: "full" | "short",
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const sep = locale === "en" ? "/" : ".";
  const day = `${pick("day")}${sep}${pick("month")}`;
  if (style === "short") return day;
  return `${day}${sep}${pick("year")}`;
}

function parseSnap(raw: string | null, readAt: number): CompanySnap {
  if (!raw) return { byName: {}, readAt };
  try {
    const parsed = JSON.parse(raw) as CacheFile;
    const byName: Record<string, CompanyData> = {};
    for (const [name, rec] of Object.entries(parsed?.byName ?? {})) {
      const display = displayMintName(name);
      if (!display || !rec || typeof rec.checkedAt !== "number") continue;
      if (typeof rec.source !== "string" || !rec.source.startsWith("https://")) continue;
      byName[display] = rec;
    }
    return { byName, readAt };
  } catch {
    return { byName: {}, readAt };
  }
}

export function companyDataClientSnapshot(): CompanySnap {
  let raw: string | null = null;
  try {
    raw = browserStore()?.getItem(COMPANY_DATA_KEY) ?? null;
  } catch {
    raw = null;
  }
  if (cachedRaw !== undefined && raw === cachedRaw) return cachedSnap;
  cachedRaw = raw;
  cachedSnap = parseSnap(raw, Date.now());
  return cachedSnap;
}

export function companyDataServerSnapshot(): CompanySnap {
  return SERVER_SNAP;
}

export function subscribeCompanyData(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(onStoreChange);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== COMPANY_DATA_KEY) return;
    cachedRaw = undefined;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}
