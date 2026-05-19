/**
 * build-prompt.ts
 *
 * Constructs a Higgsfield-ready image generation prompt from a CharacterSheet.
 * Run standalone or import into a generation pipeline.
 *
 * Usage (dry run):
 *   npx tsx scripts/generate-images/build-prompt.ts unit-01-camaleon
 */

import type { CharacterSheet } from "../../lib/character-schema.js";
import { ILLUSTRATED_NOIR_STYLE } from "../../lib/image-style.js";

/**
 * Build a Higgsfield (or equivalent image gen) prompt from a character sheet.
 *
 * Structure:
 *   [STYLE]        — locked visual identity
 *   [CHARACTER]    — age, gender, country, build, skin
 *   [FEATURES]     — hair + distinctive features
 *   [CLOTHING]     — outfit + accessories (accessories are what stock photos miss!)
 *   [EXPRESSION]   — facial expression / mood
 *   [COMPOSITION]  — framing / pose
 *   [CRITICAL]     — the EXACT Spanish description from game — image MUST match this
 *   [NEGATIVE]     — what NOT to generate
 */
export function buildImagePrompt(character: CharacterSheet): string {
  const {
    name, age, gender, country, build, skinTone,
    hair, distinctiveFeatures, clothing, accessories,
    expression, pose, spanishDescription, notes,
  } = character;

  const featureList = [
    hair,
    ...distinctiveFeatures,
  ].filter(Boolean).join(". ");

  const accessoryText = accessories.length > 0
    ? `with ${accessories.join(" and ")}`
    : "";

  const lines: string[] = [
    `[STYLE]: ${ILLUSTRATED_NOIR_STYLE.styleDescriptor}`,
    "",
    `[CHARACTER]: ${name}. A ${age}-year-old ${gender} from ${country}.`,
    `${build}. ${skinTone} skin tone.`,
    "",
    `[FEATURES]: ${featureList}.`,
    "",
    `[CLOTHING]: Wearing ${clothing}${accessoryText ? `, ${accessoryText}` : ""}.`,
    "",
    `[EXPRESSION]: ${expression}.`,
    "",
    `[COMPOSITION]: ${pose}. ${ILLUSTRATED_NOIR_STYLE.compositionDescriptor}.`,
    `${ILLUSTRATED_NOIR_STYLE.backgroundDescriptor}.`,
    "",
    `[CRITICAL — DO NOT IGNORE]: This character is described in the game in Spanish as:`,
    `"${spanishDescription}"`,
    `The generated image MUST exactly match this description.`,
    `Every accessory, clothing item, hair style, and physical feature mentioned MUST be clearly visible.`,
    `If the description mentions a hat, show the hat. If it mentions a bag, show the bag.`,
    `Students read this description and look at the image — any mismatch destroys educational trust.`,
    "",
    `[STYLE CONSISTENCY]: ${ILLUSTRATED_NOIR_STYLE.styleEnforcer}.`,
    "",
    `[NEGATIVE]: ${ILLUSTRATED_NOIR_STYLE.negativePrompt}.`,
  ];

  if (notes) {
    lines.push("");
    lines.push(`[NOTES for generator]: ${notes}`);
  }

  return lines.join("\n");
}

/** Format a character sheet as a concise review summary */
export function buildPromptSummary(character: CharacterSheet): string {
  return [
    `ID: ${character.id}`,
    `Name: ${character.name}${character.realName ? ` (${character.realName})` : ""}`,
    `Age: ${character.age} | Gender: ${character.gender} | Country: ${character.country}`,
    `Build: ${character.build}`,
    `Skin: ${character.skinTone}`,
    `Hair: ${character.hair}`,
    `Features: ${character.distinctiveFeatures.join(", ") || "(none)"}`,
    `Clothing: ${character.clothing}`,
    `Accessories: ${character.accessories.join(", ") || "(none)"}`,
    `Expression: ${character.expression}`,
  ].join("\n");
}

// ── CLI dry-run ────────────────────────────────────────────────────────────────

async function main() {
  const targetId = process.argv[2];
  if (!targetId) {
    console.log("Usage: npx tsx scripts/generate-images/build-prompt.ts <character-id>");
    console.log("       npx tsx scripts/generate-images/build-prompt.ts --all");
    process.exit(1);
  }

  // Dynamic import to avoid circular deps at module load time
  const { characters } = await import("../../content/characters/index.js");

  const targets = targetId === "--all"
    ? characters
    : characters.filter((c) => c.id === targetId);

  if (targets.length === 0) {
    console.error(`No character found with id: "${targetId}"`);
    console.log("Available IDs:", characters.map((c) => c.id).join(", "));
    process.exit(1);
  }

  for (const char of targets) {
    console.log("\n" + "=".repeat(70));
    console.log(buildPromptSummary(char));
    console.log("─".repeat(70));
    console.log("FULL PROMPT:");
    console.log("─".repeat(70));
    console.log(buildImagePrompt(char));
  }
}

main().catch(console.error);
