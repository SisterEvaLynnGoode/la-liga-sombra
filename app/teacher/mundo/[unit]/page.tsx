import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { WORLDS } from "@/lib/scroll-world/worlds";
import ScrollWorld from "@/components/scroll-world/ScrollWorld";

export const metadata = { title: "Mundo de enseñanza — La Liga Sombra" };

// Teacher-facing full-screen projection of a unit's teaching world. Use on the
// board/projector to teach the vocab + grammar before assigning the case.
export default async function TeacherMundoPage({ params }: { params: { unit: string } }) {
  const session = await getTeacherSession();
  if (!session) redirect("/teacher/login");

  const unitNumber = parseInt(params.unit, 10);
  const world = WORLDS[unitNumber];
  if (!world) redirect("/teacher/dashboard");

  return (
    <main style={{ background: "#0d0b0a", minHeight: "100vh" }}>
      <ScrollWorld
        unitNumber={unitNumber}
        cta={{ primaryLabel: "← Volver al panel", primaryHref: "/teacher/dashboard" }}
      />
    </main>
  );
}
