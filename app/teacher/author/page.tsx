import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import AuthorClient from "./AuthorClient";

export const metadata = { title: "Unit Author — La Liga Sombra" };

export default async function AuthorPage() {
  const isTeacher = await getTeacherSession();
  if (!isTeacher) redirect("/teacher/login");
  return <AuthorClient />;
}
