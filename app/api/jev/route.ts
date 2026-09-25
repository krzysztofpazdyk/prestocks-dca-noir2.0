import { NextRequest, NextResponse } from "next/server";

const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Same-origin Jev proxy — TypeSafe CORS blocks browser calls to api.typesafe.ai. */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.trim()) {
    return NextResponse.json(
      {
        detail: {
          error_type: "authentication_error",
          message: "Missing Authorization bearer key.",
        },
      },
      { status: 401 },
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { detail: { error_type: "invalid_request", message: "Unreadable body." } },
      { status: 400 },
    );
  }

  let up: Response;
  try {
    up = await fetch(TYPESAFE_URL, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { detail: { error_type: "upstream_error", message: msg } },
      { status: 502 },
    );
  }

  const text = await up.text();
  return new NextResponse(text, {
    status: up.status,
    headers: {
      "Content-Type": up.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, proxy: "jev" });
}
