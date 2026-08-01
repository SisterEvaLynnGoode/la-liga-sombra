import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/session";

// Cookies used for sessions
const AGENT_COOKIE = "agent_session";
const TEACHER_COOKIE = "teacher_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Teacher pages reachable WITHOUT a session. Signup has to be here or the
  // account-creation page requires an account to open it — the link on the
  // login page just bounces straight back to the login page.
  // /teacher/reset is reached from an emailed link by someone who by
  // definition cannot log in. Gating it would make the reset link useless.
  const TEACHER_PUBLIC = ["/teacher/login", "/teacher/signup", "/teacher/reset"];

  // ── Teacher routes (everything except the public ones above) ───────────────
  if (pathname.startsWith("/teacher") && !TEACHER_PUBLIC.includes(pathname)) {
    const token = request.cookies.get(TEACHER_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/teacher/login", request.url));
    const payload = await verifyToken(token);
    if (!payload || !("role" in payload) || payload.role !== "teacher") {
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Student-protected routes ───────────────────────────────────────────────
  if (pathname.startsWith("/mission-board") || pathname.startsWith("/game") || pathname.startsWith("/play") || pathname.startsWith("/expediente") || pathname.startsWith("/season")) {
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
  matcher: ["/mission-board/:path*", "/game/:path*", "/play/:path*", "/expediente/:path*", "/expediente", "/season/:path*", "/season", "/teacher/:path*"],
};
