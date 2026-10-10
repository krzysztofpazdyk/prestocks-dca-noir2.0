import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the price panel sits under profit/loss and the whole positions table", () => {
  const overview = readFileSync(
    new URL("../components/OverviewView.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(overview.split("<PricesPanel").length - 1, 1);
  const lastPurchase = overview.lastIndexOf('t("lastPurchase.');
  const pnl = overview.indexOf("<PnlSection");
  const positions = overview.indexOf("<PositionsCard");
  const panel = overview.indexOf("<PricesPanel");
  assert.ok(lastPurchase > 0 && lastPurchase < pnl);
  assert.ok(pnl < positions && positions < panel);
  assert.match(
    overview,
    /\{showPnl && \(?\s*<PositionsCard[\s\S]*?\/>\s*\)?\}\s*<PricesPanel/,
  );
  assert.match(
    overview,
    /const showPnl = connected && predca\.positions\.length > 0;/,
  );
  const panelLine = overview.split("\n").find((line) => line.includes("<PricesPanel"));
  assert.equal(panelLine?.startsWith("      <PricesPanel"), true);
  assert.match(overview, /^      <div className="grid gap-4 lg:grid-cols-2/m);
});
