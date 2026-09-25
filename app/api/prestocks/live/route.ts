import { NextResponse } from "next/server";
import { loadLivePrestocks } from "@/lib/prestocks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Same-origin live PreStocks pull — browser CORS often blocks prestocks.com. */
export async function GET() {
  try {
    const live = await loadLivePrestocks();
    return NextResponse.json({
      ok: true,
      products: live.products,
      totals: live.totals,
      premiumsSource: live.premiumsSource,
      source: "prestocks.com",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: msg, source: "prestocks.com" },
      { status: 502 },
    );
  }
}
