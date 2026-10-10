import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { historyView } from "../lib/history-view";

test("historyView keeps the last runs when RPC fails", () => {
  assert.equal(historyView("error", 2, true), "list_stale");
  assert.equal(historyView("ready", 2, true), "list");
  assert.equal(historyView("error", 0, true), "error");
  assert.equal(historyView("ready", 0, true), "empty");
  assert.equal(historyView("loading", 2, true), "loading");
  assert.equal(historyView("ready", 3, false), "disconnected");
  assert.equal(historyView("no_config", 0, true), "not_ready");
  assert.equal(historyView("no_mint", 0, true), "not_ready");
});

test("History shows the stale note above a saved list and still shows rpcError", () => {
  const history = readFileSync(
    new URL("../components/HistoryView.tsx", import.meta.url),
    "utf8",
  );
  assert.match(history, /historyView\(predca\.status, predca\.runs\.length, connected\)/);
  assert.match(history, /mode === "list_stale"/);
  assert.match(history, /t\("history\.staleRuns"\)/);
  assert.match(history, /predca\.rpcError/);
  assert.doesNotMatch(history, /predca\.error &&/);
  const i18n = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
  const values = [...i18n.matchAll(/"history\.staleRuns":\s*"([^"]*)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(values, [
    "Ostatni odczyt — RPC niedostępne, dane mogą być nieaktualne.",
    "Last read — RPC unavailable, data may be stale.",
  ]);
});
