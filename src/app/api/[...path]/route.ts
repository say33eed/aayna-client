import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The backend is the only upstream. Never accept a caller-supplied URL.
const upstream = (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  // Explicitly allow application API groups; do not proxy the Stripe webhook.
  const allowed = ["auth", "appointments", "services", "admin", "payments", "profile", "journal"];
  if (!path?.length || !allowed.includes(path[0]) ||
      (path[0] === "payments" && path[1] === "webhook")) {
    return NextResponse.json({ success: false, message: "Route not found." }, { status: 404 });
  }
  const target = new URL(`${upstream}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;
  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "user-agent", "authorization", "origin", "referer"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.slice(0, -1));
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
    });
    const outgoing = new Headers();
    for (const [name, value] of response.headers) {
      if (["content-length", "content-encoding", "transfer-encoding", "connection", "set-cookie"].includes(name.toLowerCase())) continue;
      outgoing.set(name, value);
    }
    // Preserve individual Set-Cookie headers (especially Better Auth OAuth state).
    for (const cookie of response.headers.getSetCookie()) outgoing.append("set-cookie", cookie);
    outgoing.set("cache-control", "no-store");
    return new NextResponse(response.body, { status: response.status, headers: outgoing });
  } catch {
    return NextResponse.json({ success: false, message: "Authentication service unavailable." }, { status: 503 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
