import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dupOutcomeMessage } from "../lib/dup-message";

test("dupOutcomeMessage names only a confirmed previous action", () => {
  assert.equal(dupOutcomeMessage("confirmed"), "dup.prevConfirmed");
  assert.equal(dupOutcomeMessage("rejected"), null);
  assert.equal(dupOutcomeMessage("failed_expired"), null);
  assert.equal(dupOutcomeMessage("unresolved"), null);
  assert.equal(dupOutcomeMessage("pending"), null);
});

test("allowDuplicate keeps the gate closed and sets dupInfo when the previous tx confirmed", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  const fn = overview.slice(
    overview.indexOf("async function allowDuplicate"),
    overview.indexOf("async function submitDeposit"),
  );
  const hit = fn.indexOf('dupOutcomeMessage(verdict) === "dup.prevConfirmed"');
  assert.ok(hit > 0);
  const branch = fn.slice(hit, hit + 180);
  assert.match(branch, /setDupInfo\(\{ kind, amount \}\)/);
  assert.match(branch, /return false/);

  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const values = [...i18n.matchAll(/"dup\.prevConfirmed":\s*"([^"]*)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(values, [
    "Poprzednia {action} weszła. Kliknij ponownie, aby wysłać nową.",
    "Your previous {action} went through. Click again to send a new one.",
  ]);
});

test("Settings shows tx messages once, and History does not show a foreign predca.error", () => {
  const settings = readFileSync(
    new URL("../components/SettingsView.tsx", import.meta.url),
    "utf8",
  );
  const history = readFileSync(
    new URL("../components/HistoryView.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(settings.match(/predca\.error\b/g)?.length, 1);
  assert.equal(settings.match(/predca\.pendingMsg\b/g)?.length, 1);
  assert.equal(settings.match(/predca\.okMsg\b/g)?.length, 1);
  assert.doesNotMatch(history, /predca\.error &&/);
  assert.match(history, /predca\.rpcError/);
});
