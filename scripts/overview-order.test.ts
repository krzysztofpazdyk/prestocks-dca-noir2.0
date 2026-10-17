import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("positions and the price panel open together under profit/loss", () => {
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
    /const showPnl = connected && predca\.positions\.length > 0;/,
  );
  assert.match(
    overview,
    /const \[detailsOpen, setDetailsOpen\] = useState\(false\);/,
  );
  assert.match(
    overview,
    /\{showPnl && detailsOpen && \(\s*<PositionsCard[\s\S]*?\/>\s*\)\}\s*\{showPnl && detailsOpen && \(\s*<PricesPanel/,
  );
  const pnlFn = overview.slice(
    overview.indexOf("function PnlSection"),
    overview.indexOf("function PositionsCard"),
  );
  assert.match(pnlFn, /aria-expanded=\{detailsOpen\}/);
  assert.match(
    pnlFn,
    /detailsOpen \? t\("pnl\.hideDetails"\) : t\("pnl\.details"\)/,
  );
  assert.match(overview, /^      <div className="grid gap-4 lg:grid-cols-2/m);
});
