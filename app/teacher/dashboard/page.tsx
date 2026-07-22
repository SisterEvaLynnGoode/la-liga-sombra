import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "Cuartel General — La Liga Sombra" };

export default async function DashboardPage() {
  const session = await getTeacherSession();
  if (!session) redirect("/teacher/login");
  return <DashboardClient isAdmin={session.isAdmin} />;
}
