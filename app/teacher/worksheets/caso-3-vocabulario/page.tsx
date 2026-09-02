import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { CASO_3_PAGES } from "@/lib/worksheets/caso-3-vocab";
import { buildAnswerKey } from "@/lib/worksheets/paper";
import PaperPacketClient from "../PaperPacketClient";

export const metadata = { title: "Caso 3 — Guía de Campo — La Liga Sombra" };

/**
 * Caso 3's week is four days — Labor Day takes the Monday the vocabulary would
 * have been introduced on. Pages 1–2 are an illustrated field guide meant to
 * stay open beside the Chromebook all week; pages 3–5 are the lost Monday,
 * front-loaded onto Tuesday.
 */
export default async function Caso3VocabPage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");
  return (
    <PaperPacketClient
      pages={CASO_3_PAGES}
      key_={buildAnswerKey(CASO_3_PAGES)}
      title="Caso 3 · Guía de Campo"
      blurb="Four-day week (Labor Day). Pages 1–2 are the illustrated reference — print those single-sided and have students keep them out during the case. Pages 3–5 replace the Monday vocabulary lesson. The icons are line art, so they survive a photocopier."
    />
  );
}
