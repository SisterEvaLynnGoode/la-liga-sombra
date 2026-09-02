import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { CASO_4_PAGES } from "@/lib/worksheets/caso-4-suplente";
import { buildAnswerKey } from "@/lib/worksheets/paper";
import PaperPacketClient from "../PaperPacketClient";

export const metadata = { title: "Caso 4 — Paquete del suplente — La Liga Sombra" };

/**
 * The Monday that opens Caso 4, covered by a substitute.
 *
 * Built on the assumption that the sub hands out the packet and does nothing
 * else: every page is silent desk work, and the students' own route through the
 * period is printed at the top of page 1.
 *
 * Deliberately owns a different half of the work from the HQ packet later the
 * same week: drawing, deduction, reading-for-evidence and personal writing
 * here; matching, translating, unscrambling and fill-in-the-blank there.
 */
export default async function Caso4SubPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return (
    <PaperPacketClient
      pages={CASO_4_PAGES}
      key_={buildAnswerKey(CASO_4_PAGES)}
      title="Caso 4 · Suplente"
      blurb="For the Monday you are out. PAGE 1 IS FOR THE SUBSTITUTE — print it once for the desk and start the student copies at page 2. Five student pages, all silent desk work, with the route printed for the students so the packet runs itself. The activities deliberately avoid everything the HQ packet does later in the week."
    />
  );
}
