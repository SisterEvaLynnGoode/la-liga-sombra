/**
 * Build-time check: no two multiple-choice questions a student can meet in one
 * sitting may offer the same four options.
 *
 * WHY THIS EXISTS
 *
 * Caso 2 asked "¿Cómo es Valentina?" on the Evidencia page with
 * [Alta y rubia | Alta y morena | Baja y rubia | Baja y morena], then asked
 * "¿Cómo es el sospechoso físicamente?" two stages later on the audio page with
 * the same grid in the masculine. To a student it reads as the game recycling
 * one question and not listening to the answer — which is exactly how it was
 * reported. Caso 4 was worse: two questions in the SAME audio stage had
 * identical options AND the same correct position, so the second one could be
 * answered without listening at all.
 *
 * The Zod schema cannot catch this. It checks that four options exist and that
 * correctIndex is in range; it has no idea the four options are the same four
 * as a question three screens earlier.
 *
 * GENDER-INSENSITIVE ON PURPOSE
 *
 * "Alta y rubia" and "Alto y rubio" are the same option set to a student. The
 * comparison collapses trailing -o/-a so agreement cannot hide a duplicate.
 *
 * DIFFICULTY VARIANTS ARE NOT DUPLICATES
 *
 * Boss stages carry questions.easy and questions.normal — parallel versions of
 * one stage, and a student is served exactly one of them. Those branches are
 * compared separately, never against each other, or every scaffolded boss in
 * the game would fail this check.
 */

import fs from "fs";
import path from "path";

const NEAR_DUPLICATE = 0.75;  // Jaccard overlap that counts as "the same question again"

function stem(s) {
  const flat = String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
  // Collapse Spanish gender agreement: alta/alto -> alt~
  return flat.split(/\s+/).map((w) => w.replace(/[oa]$/, "~")).join(" ");
}

/** Every MC question in one served branch, tagged with where it lives. */
function collect(node, trail, out, branch) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, `${trail}[${i}]`, out, branch));
    return;
  }
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node.options) && typeof node.correctIndex === "number") {
    out.push({
      branch,
      where: trail,
      text: node.text ?? node.question ?? "(untitled)",
      set: new Set(node.options.map(stem)),
      options: node.options,
      correctIndex: node.correctIndex,
    });
  }

  for (const [k, v] of Object.entries(node)) {
    // easy/normal/hard are alternative versions of one stage — a student sees
    // one. Tag them so they are never compared with each other.
    const nextBranch = ["easy", "normal", "hard"].includes(k) ? `${branch}:${k}` : branch;
    collect(v, `${trail}/${k}`, out, nextBranch);
  }
}

const roots = [
  path.join(process.cwd(), "content"),
  path.join(process.cwd(), "content", "bosses"),
];

let failures = 0;
let scanned = 0;

for (const dir of roots) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) continue;

    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, "utf-8"));
    } catch {
      continue;  // the Zod validator already reports malformed JSON
    }

    const items = [];
    collect(data, "", items, "main");
    scanned += items.length;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (a.branch !== b.branch) continue;  // different difficulty paths

        const shared = [...a.set].filter((x) => b.set.has(x)).length;
        const union = new Set([...a.set, ...b.set]).size;
        const overlap = union ? shared / union : 0;
        if (overlap < NEAR_DUPLICATE) continue;

        failures++;
        const sameAnswer = a.options[a.correctIndex] === b.options[b.correctIndex];
        console.error(
          `\n❌  ${file}: two questions offer the same options (${Math.round(overlap * 100)}% overlap)` +
            (sameAnswer ? " AND the same answer — the second is free" : "") +
            `\n      «${a.text}»\n        ${JSON.stringify(a.options)}\n        at ${a.where}` +
            `\n      «${b.text}»\n        ${JSON.stringify(b.options)}\n        at ${b.where}`
        );
      }
    }
  }
}

if (failures) {
  console.error(
    `\n${failures} duplicated option set${failures === 1 ? "" : "s"}. ` +
      `Rewrite one of each pair so students cannot answer the second from the first.\n`
  );
  process.exit(1);
}

console.log(`✅  ${scanned} multiple-choice questions — no duplicated option sets.`);
