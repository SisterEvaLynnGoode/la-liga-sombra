import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { WEEK_TWO_PAGES } from "@/lib/worksheets/week-two";
import { buildAnswerKey } from "@/lib/worksheets/paper";
import PaperPacketClient from "../PaperPacketClient";

export const metadata = { title: "Semana 2 — Paper Packet — La Liga Sombra" };

/**
 * Week two on paper: origins, numbers, classroom objects, then two application
 * pages. Independent of the game by design — nothing here needs a Chromebook
 * and no page points at a case the class may not be able to open yet.
 */
export default async function WeekTwoWorksheetsPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return (
    <PaperPacketClient
      pages={WEEK_TWO_PAGES}
      key_={buildAnswerKey(WEEK_TWO_PAGES)}
      title="Semana 2"
      blurb="Five more student pages for a second week with no devices: ¿de dónde eres?, numbers, classroom objects, then two pages that apply all three. Print single-sided — Día 9 and Día 10 are drawing pages."
    />
  );
}
