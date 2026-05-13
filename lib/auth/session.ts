import { SignJWT, jwtVerify } from "jose";

export interface StudentSession {
  studentId: string;
  displayName: string;
  classId: string;
}

export interface TeacherSession {
  role: "teacher";
}

export type SessionPayload = StudentSession | TeacherSession;

const AGENT_COOKIE = "agent_session";
const TEACHER_COOKIE = "teacher_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function getSecret() {
  // Use || not ?? so an empty-string env var falls back to the dev default
  const s = process.env.SESSION_SECRET || "dev-secret-must-be-at-least-32-chars!!";
  return new TextEncoder().encode(s);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Server-Component / Route-Handler helpers ──────────────────────────────────
// These import next/headers and CANNOT be used in middleware.ts

export async function getStudentSession(): Promise<StudentSession | null> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(AGENT_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !("studentId" in payload)) return null;
  return payload as StudentSession;
}

export async function getTeacherSession(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(TEACHER_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload && "role" in payload && payload.role === "teacher";
}

export { AGENT_COOKIE, TEACHER_COOKIE, THIRTY_DAYS };
