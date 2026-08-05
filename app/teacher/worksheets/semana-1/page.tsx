import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { WEEK_ONE_PAGES, buildAnswerKey } from "@/lib/worksheets/week-one";
import WeekOneClient from "./WeekOneClient";

export const metadata = { title: "Semana 1 — Paper Packet — La Liga Sombra" };

/**
 * Week one on paper: five student pages and a teacher key, for a week with no
 * devices. Not unit-derived — week one happens before Caso 1 — but the survival
 * phrases come from the Day 1 deck so paper and projector match.
 */
export default async function WeekOneWorksheetsPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return <WeekOneClient pages={WEEK_ONE_PAGES} key_={buildAnswerKey()} />;
}
