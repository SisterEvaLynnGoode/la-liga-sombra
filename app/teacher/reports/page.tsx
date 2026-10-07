import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import ReportsClient from "./ReportsClient";

export const metadata = { title: "Reports — La Liga Sombra" };

/**
 * The printable end of the Notas data: an administrator summary and a parent
 * report card. Everything comes from /api/teacher/dashboard/mastery, the same
 * endpoint the Bosses & skills tab reads, so the three can never disagree
 * about a child's numbers.
 */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { classId?: string; mode?: string; studentId?: string };
}) {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  return (
    <ReportsClient
      classId={searchParams.classId ?? ""}
      initialMode={searchParams.mode === "students" || searchParams.mode === "parent" ? searchParams.mode : "class"}
      initialStudentId={searchParams.studentId ?? null}
    />
  );
}
