/**
 * Build-time content validator.
 * Run: npm run validate
 * Automatically runs before: npm run build
 *
 * Validates every /content/*.json file (except _template.json) against the
 * Zod schema in lib/content-schema.ts and prints clear error messages.
 */

import fs from "fs";
import path from "path";
import { UnitContentSchema } from "../lib/content-schema";
import type { ZodIssue } from "zod";

const contentDir = path.join(process.cwd(), "content");

const files = fs.readdirSync(contentDir).filter(
  (f) => f.endsWith(".json") && !f.startsWith("_")
);

if (files.length === 0) {
  console.log("⚠  No unit files found in /content/ — skipping validation.");
  process.exit(0);
}

let hasErrors = false;

function formatIssue(issue: ZodIssue): string {
  const path = issue.path.length ? issue.path.join(" › ") : "root";
  return `    ${path}: ${issue.message}`;
}

for (const file of files) {
  const filePath = path.join(contentDir, file);
  let raw: unknown;

  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    console.error(`❌  ${file}: invalid JSON — check for syntax errors\n`);
    hasErrors = true;
    continue;
  }

  const result = UnitContentSchema.safeParse(raw);

  if (result.success) {
    console.log(`✅  ${file}  (Unit ${result.data.unitNumber} — ${result.data.country})`);
  } else {
    hasErrors = true;
    console.error(`\n❌  ${file}: validation failed`);
    for (const issue of result.error.issues) {
      console.error(formatIssue(issue));
    }
    console.log();
  }
}

if (hasErrors) {
  console.error("\n💥  Fix the errors above before building.\n");
  process.exit(1);
} else {
  console.log("\n✨  All content files are valid.\n");
}
