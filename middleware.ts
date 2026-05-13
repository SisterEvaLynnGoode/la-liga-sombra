import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/session";

// Cookies used for sessions
const AGENT_COOKIE = "agent_session";
const TEACHER_COOKIE = "teacher_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Teacher routes (/teacher/* except /teacher/login) ──────────────────────
  if (pathname.startsWith("/teacher") && pathname !== "/teacher/login") {
    const token = request.cookies.get(TEACHER_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/teacher/login", request.url));
    const payload = await verifyToken(token);
    if (!payload || !("role" in payload) || payload.role !== "teacher") {
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Student-protected routes ───────────────────────────────────────────────
  if (pathname.startsWith("/mission-board") || pathname.startsWith("/game") || pathname.startsWith("/play")) {
    const token = request.cookies.get(AGENT_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const payload = await verifyToken(token);
    if (!payload || !("studentId" in payload)) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete(AGENT_COOKIE);
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mission-board/:path*", "/game/:path*", "/play/:path*", "/teacher/:path*"],
};
