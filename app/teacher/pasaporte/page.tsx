import { redirect } from "next/navigation";
import { getTeacherSession } from "@/lib/auth/session";
import { UNITS } from "@/lib/game/units";
import { CULTURE } from "@/lib/worksheets/culture";
import PasaporteClient, { type CountryEntry } from "./PasaporteClient";

export const metadata = { title: "Pasaporte Cultural — La Liga Sombra" };

export default async function PasaportePage() {
  if (!(await getTeacherSession())) redirect("/teacher/login");

  const countries: CountryEntry[] = UNITS.map((u) => ({
    number: u.number,
    country: u.country,
    code: u.countryCode,
    caseTitle: u.titleEs,
    theme: CULTURE[u.number]?.theme ?? null,
    project: CULTURE[u.number]?.project.title ?? null,
  }));

  return <PasaporteClient countries={countries} />;
}
