import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { WEEK_ONE_PAGES } from "@/lib/worksheets/week-one";
import { buildAnswerKey } from "@/lib/worksheets/paper";
import PaperPacketClient from "../PaperPacketClient";

export const metadata = { title: "Semana 1 — Paper Packet — La Liga Sombra" };

/**
 * Week one on paper: five student pages and a teacher key, for a week with no
 * devices. Not unit-derived — week one happens before Caso 1 — but the survival
 * phrases come from the Day 1 deck so paper and projector match.
 */
export default async function WeekOneWorksheetsPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return (
    <PaperPacketClient
      pages={WEEK_ONE_PAGES}
      key_={buildAnswerKey(WEEK_ONE_PAGES)}
      title="Semana 1"
      blurb="Five student pages, one per day, for a week with no computers. Print single-sided so the drawing pages have a clean back. The answer key is off by default so you don't hand it out by accident."
    />
  );
}
