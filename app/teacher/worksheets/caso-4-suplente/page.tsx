import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { CASO_4_PAGES } from "@/lib/worksheets/caso-4-suplente";
import { buildAnswerKey } from "@/lib/worksheets/paper";
import PaperPacketClient from "../PaperPacketClient";

export const metadata = { title: "Caso 4 — Paquete del suplente — La Liga Sombra" };

/**
 * The Monday that opens Caso 4, run by a substitute who speaks no Spanish.
 *
 * Deliberately owns a different half of the work from the HQ packet later the
 * same week: drawing, deduction, talking and personal writing here; matching,
 * translating, unscrambling and fill-in-the-blank there. Nothing is done twice.
 */
export default async function Caso4SubPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return (
    <PaperPacketClient
      pages={CASO_4_PAGES}
      key_={buildAnswerKey(CASO_4_PAGES)}
      title="Caso 4 · Suplente"
      blurb="For the Monday you are out. PAGE 1 IS FOR THE SUBSTITUTE — print it once for the desk and start the student copies at page 2. No Spanish is required to run it. The activities deliberately avoid everything the HQ packet does later in the week."
    />
  );
}
