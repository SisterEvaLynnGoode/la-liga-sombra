import { z } from "zod";

export const CharacterSheet = z.object({
  id: z.string(),                              // e.g. "unit-01-camaleon", "chief", "unit-05-boss-tejedor"
  role: z.enum(["suspect", "witness", "recurring", "villain"]),
  unitNumber: z.number().optional(),           // omit for recurring / cross-unit characters
  name: z.string(),                            // Spanish alias as shown in-game
  realName: z.string().optional(),             // Real name if known
  age: z.number(),
  gender: z.string(),                          // "hombre", "mujer", "no binario", etc.
  skinTone: z.string(),                        // match Spanish descriptors: "morena", "blanca", "negra", "trigueña", etc.
  build: z.string(),                           // "alto y delgado", "bajo y robusto", etc.
  hair: z.string(),                            // "cabello negro corto", "rizado castaño largo", etc.
  distinctiveFeatures: z.array(z.string()),    // ["bigote espeso", "cicatriz en la mejilla", "lentes redondos"]
  clothing: z.string(),                        // "camisa blanca y chaleco verde", "uniforme de chef blanco", etc.
  accessories: z.array(z.string()),            // ["sombrero de charro negro", "reloj de oro"] — must appear in generated image
  expression: z.string(),                      // "mirada seria", "sonrisa nerviosa", "expresión amable"
  pose: z.string().default("retrato de busto, mirando ligeramente hacia un lado"),
  spanishDescription: z.string(),              // EXACT Spanish text shown in-game — generated image MUST match this
  country: z.string(),                         // for cultural context
  currentImageUrl: z.string().optional(),      // existing stock image (what we're replacing)
  generatedImageUrl: z.string().optional(),    // Higgsfield output after generation
  notes: z.string().optional(),               // extra context for image generation
});

export type CharacterSheet = z.infer<typeof CharacterSheet>;

/** Fields that contribute to the completeness score (excludes optional/derived fields) */
export const REQUIRED_FOR_COMPLETENESS: Array<keyof CharacterSheet> = [
  "gender", "skinTone", "build", "hair", "clothing", "expression",
];

export function completenessScore(c: CharacterSheet): number {
  const filled = REQUIRED_FOR_COMPLETENESS.filter((k) => {
    const v = c[k];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  }).length;
  return Math.round((filled / REQUIRED_FOR_COMPLETENESS.length) * 100);
}
