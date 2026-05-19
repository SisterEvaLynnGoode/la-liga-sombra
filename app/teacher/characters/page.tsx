import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import CharactersClient from "./CharactersClient";

export const metadata = { title: "Character Sheets — La Liga Sombra" };

export default async function CharactersPage() {
  const isTeacher = await getTeacherSession();
  if (!isTeacher) redirect("/teacher/login");
  return <CharactersClient />;
}
