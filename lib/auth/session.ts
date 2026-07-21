import { SignJWT, jwtVerify } from "jose";

export interface StudentSession {
  studentId: string;
  displayName: string;
  classId: string;
}

export interface TeacherSession {
  role: "teacher";
  teacherId: string;
  isAdmin: boolean;
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

/**
 * Returns the teacher session (with teacherId + isAdmin) or null.
 * Truthiness still works as the old boolean gate, but callers can now read
 * teacherId to scope data to the owning teacher (Phase 2).
 */
export async function getTeacherSession(): Promise<TeacherSession | null> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(TEACHER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || !("role" in payload) || payload.role !== "teacher") return null;
  // Require a teacherId — legacy tokens without one are treated as logged out
  // so a fresh, owner-scoped session is minted on the next login.
  if (!("teacherId" in payload) || !payload.teacherId) return null;
  return payload as TeacherSession;
}

export { AGENT_COOKIE, TEACHER_COOKIE, THIRTY_DAYS };
