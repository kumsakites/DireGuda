import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = [
  "/login",
  "/api/auth",
  "/forgot-password",
  "/reset-password",
  "/api/user/forgot-password",
  "/api/user/reset-password",
];

const ADMIN_ONLY = ["/admin", "/api/admin"];

// Paths allowed while mustChangePassword is true
const MUST_CHANGE_ALLOWED = ["/change-password", "/api/user/change-password", "/api/auth"];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser requests (server-to-server) are fine
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

export const proxy = auth(function handler(
  req: NextRequest & { auth: { user?: { role?: string; mustChangePassword?: boolean } } | null }
) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // CSRF: reject cross-origin state-mutating API requests
  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(req.method) && !isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  if (
    session.user.mustChangePassword &&
    !MUST_CHANGE_ALLOWED.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
