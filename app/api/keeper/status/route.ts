import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENABLED_PATH = join(homedir(), ".config", "predca", "enabled");
const OWNER_PATH = join(homedir(), ".config", "predca", "owner.txt");
const STATUS_PATH = join(
  homedir(),
  ".grok",
  "long-running-background-tasks",
  "weekly_vault_buy_status.json",
);

function readEnabledFile(): boolean {
  try {
    if (!existsSync(ENABLED_PATH)) return false;
    const v = readFileSync(ENABLED_PATH, "utf8").trim().toLowerCase();
    return v === "true" || v === "1";
  } catch {
    return false;
  }
}

function readOwnerFile(): string | null {
  try {
    if (!existsSync(OWNER_PATH)) return null;
    const v = readFileSync(OWNER_PATH, "utf8").trim();
    return v || null;
  } catch {
    return null;
  }
}

function readStatusJson(): Record<string, unknown> {
  try {
    if (!existsSync(STATUS_PATH)) return {};
    return JSON.parse(readFileSync(STATUS_PATH, "utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

/** Prefer live keeper HTTP; fall back to ~/.config/predca + status JSON. */
export async function GET() {
  const keeperBase = (
    process.env.NEXT_PUBLIC_KEEPER_URL?.trim() || "http://127.0.0.1:8791"
  ).replace(/\/$/, "");

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const resp = await fetch(`${keeperBase}/status`, {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    if (resp.ok) {
      const data = (await resp.json()) as Record<string, unknown>;
      return NextResponse.json({
        ...data,
        ok: true,
        enabled:
          data.enabled === true ||
          data.enabled === "true" ||
          readEnabledFile(),
        owner:
          (typeof data.owner === "string" && data.owner) ||
          readOwnerFile() ||
          process.env.PREDCA_OWNER?.trim() ||
          process.env.NEXT_PUBLIC_PREDCA_OWNER?.trim() ||
          undefined,
        source: "daemon",
      });
    }
  } catch {
    /* daemon down — file fallback */
  }

  const fileEnabled = readEnabledFile();
  const fileOwner = readOwnerFile();
  const extra = readStatusJson();
  const statusEnabled = extra.enabled === true || extra.enabled === "true";
  const enabled = fileEnabled || statusEnabled;
  const owner =
    fileOwner ||
    (typeof extra.owner === "string" ? extra.owner : null) ||
    process.env.PREDCA_OWNER?.trim() ||
    process.env.NEXT_PUBLIC_PREDCA_OWNER?.trim() ||
    undefined;

  return NextResponse.json({
    ok: true,
    ...extra,
    enabled,
    owner,
    source: "file",
    daemon: false,
  });
}
