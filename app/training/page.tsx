import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import TrainingClient from "./TrainingClient";

export const metadata = { title: "La Sala de Entrenamiento — La Liga Sombra" };

export default async function TrainingPage() {
  const session = await getStudentSession();
  if (!session) redirect("/login");
  return <TrainingClient displayName={session.displayName} />;
}
