import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { UNITS } from "@/lib/game/units";
import { buildWorksheetPacket, type WorksheetPacket } from "@/lib/worksheets/generate";
import WorksheetsClient from "./WorksheetsClient";

export const metadata = { title: "Lesson Plans & Worksheets — La Liga Sombra" };

// Unit content registry (mirrors the gate/play pages)
function getUnitContent(n: number): { vocab: Array<{ spanish: string; english: string }>; city?: string } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/content/unit-0${n}.json`);
  } catch {
    return null;
  }
}

export default async function WorksheetsPage() {
  const isTeacher = await getTeacherSession();
  if (!isTeacher) redirect("/teacher/login");

  // Pre-build every packet server-side so the client can switch units instantly
  // and print without any data fetching.
  const packets: WorksheetPacket[] = [];
  for (const unit of UNITS) {
    const content = getUnitContent(unit.number);
    if (!content?.vocab?.length) continue; // skip units without content yet
    packets.push(
      buildWorksheetPacket({
        unitNumber: unit.number,
        country: unit.country,
        city: content.city,
        caseTitle: unit.titleEs,
        caseDescription: unit.description,
        criminalName: unit.criminal,
        vocab: content.vocab,
        grammarDescription: unit.description,
      })
    );
  }

  return <WorksheetsClient packets={packets} />;
}
