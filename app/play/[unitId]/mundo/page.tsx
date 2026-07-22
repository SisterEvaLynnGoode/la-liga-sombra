import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/session";
import { WORLDS } from "@/lib/scroll-world/worlds";
import ScrollWorld from "@/components/scroll-world/ScrollWorld";

export const metadata = { title: "El Mundo — La Liga Sombra" };

// Student-facing "fly through the city" intro shown at the beginning of a case.
// Teaches the unit's vocabulary + grammar before the online/worksheet stages.
export default async function StudentMundoPage({ params }: { params: { unitId: string } }) {
  const session = await getStudentSession();
  if (!session) redirect("/login");

  const unitNumber = parseInt(params.unitId, 10);
  const world = WORLDS[unitNumber];
  if (!world) redirect(`/play/${unitNumber}/gate`);

  return (
    <main style={{ background: "#0d0b0a", minHeight: "100vh" }}>
      <ScrollWorld
        unitNumber={unitNumber}
        cta={{
          primaryLabel: "Entrar al caso →",
          primaryHref: `/play/${unitNumber}`,
          secondaryLabel: "← Volver",
          secondaryHref: `/play/${unitNumber}/gate`,
        }}
      />
    </main>
  );
}
