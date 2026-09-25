/**
 * GitHub Pages static export cannot include the Jev Route Handler.
 * Stash app/api for the duration of `next build`, then restore.
 */
import { existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const api = "app/api";
const bak = "app/_api_export_stash";

if (existsSync(api)) {
  if (existsSync(bak)) {
    renameSync(bak, `${bak}_${Date.now()}`);
  }
  renameSync(api, bak);
}

// Drop leftover `next dev` types that still import the stashed Route Handlers.
for (const stale of [".next/dev/types/app/api", ".next/types/app/api"]) {
  if (existsSync(stale)) {
    rmSync(stale, { recursive: true, force: true });
  }
}

const result = spawnSync(
  "npx",
  ["next", "build", "--webpack"],
  { stdio: "inherit", env: process.env, shell: false },
);

if (existsSync(bak)) {
  renameSync(bak, api);
}

if (result.status === 0 && existsSync("out")) {
  writeFileSync("out/.nojekyll", "");
}

process.exit(result.status ?? 1);
