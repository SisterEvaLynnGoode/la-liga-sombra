import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import AdminCodes from "./AdminCodes";

export const metadata = { title: "Admin — La Liga Sombra" };

export default async function AdminPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/teacher/login");
  if (!session.isAdmin) redirect("/teacher/dashboard");
  return <AdminCodes />;
}
