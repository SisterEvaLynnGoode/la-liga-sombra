import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import PresentationsClient from "./PresentationsClient";

export const metadata = { title: "Presentations & Capstone — La Liga Sombra" };

export default async function PresentationsPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return <PresentationsClient />;
}
