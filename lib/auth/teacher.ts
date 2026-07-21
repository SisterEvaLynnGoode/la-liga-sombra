/**
 * Teacher account + ownership helpers (Phase 2 multi-tenancy).
 *
 * Every teacher dashboard route must scope data to the logged-in teacher's
 * own classes. These guards centralize that: they return the session on
 * success or a ready-to-return NextResponse (401/403) on failure.
 *
 * Admins (the owner account) bypass ownership and can see every class.
 */

import { NextResponse } from "next/server";
import { getTeacherSession, type TeacherSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generateSalt, hashPin, verifyPin } from "@/lib/auth/pin";

// Reuse the salted-HMAC scheme the app already uses for student PINs.
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = generateSalt();
  return { hash: hashPin(password, salt), salt };
}
export function verifyPassword(password: string, salt: string, hash: string): boolean {
  return verifyPin(password, salt, hash);
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Not your class" }, { status: 403 });

/** True if the teacher owns (or, as admin, may access) the class. */
export async function ownsClass(session: TeacherSession, classId: string): Promise<boolean> {
  if (session.isAdmin) return true;
  const supabase = createClient();
  const { data } = await supabase
    .from("classes").select("id").eq("id", classId).eq("teacher_id", session.teacherId).limit(1);
  return !!(data as unknown[] | null)?.length;
}

/** True if the teacher may access this student (via an owned class). */
export async function ownsStudent(session: TeacherSession, studentId: string): Promise<boolean> {
  if (session.isAdmin) return true;
  const supabase = createClient();
  const { data } = await supabase.from("students").select("class_id").eq("id", studentId).limit(1);
  const classId = (data as Array<{ class_id: string | null }> | null)?.[0]?.class_id;
  return classId ? ownsClass(session, classId) : false;
}

/** Require a logged-in teacher (no class scope). */
export async function guardTeacher(): Promise<TeacherSession | NextResponse> {
  const session = await getTeacherSession();
  return session ?? unauthorized();
}

/** Require a logged-in teacher who owns `classId`. */
export async function guardClass(classId: string | null | undefined): Promise<TeacherSession | NextResponse> {
  const session = await getTeacherSession();
  if (!session) return unauthorized();
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });
  if (!(await ownsClass(session, classId))) return forbidden();
  return session;
}

/** Require a logged-in teacher who owns the class this `studentId` is in. */
export async function guardStudent(studentId: string | null | undefined): Promise<TeacherSession | NextResponse> {
  const session = await getTeacherSession();
  if (!session) return unauthorized();
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  if (!(await ownsStudent(session, studentId))) return forbidden();
  return session;
}

/** Require an admin (owner) teacher. */
export async function guardAdmin(): Promise<TeacherSession | NextResponse> {
  const session = await getTeacherSession();
  if (!session) return unauthorized();
  if (!session.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  return session;
}

export function isResponse(x: TeacherSession | NextResponse): x is NextResponse {
  return x instanceof NextResponse;
}
