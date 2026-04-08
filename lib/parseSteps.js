// Smart parser for free-form recipe instructions.
//
// TheMealDB (and its translated variants) uses wildly inconsistent formats.
// Observed patterns:
//
//   A) Step headers on their own line, content on next:
//      "STEP 1\nPreheat the oven.\nSTEP 2\nHeat oil in a pan..."
//      "1\nCaramel chicken with olive oil...\n2\nIn another pot..."
//
//   B) Inline numbering on the same line:
//      "1. Preheat oven.\n2. Heat oil."
//      "1) Preheat oven.\n2) Heat oil."
//
//   C) Translated step headers:
//      "Bước 1\n...\nBước 2\n..."
//      "Paso 1:\n...\nPaso 2:\n..."
//      "第1步\n...\n第2步\n..."
//
//   D) Plain prose, no numbering — separated only by periods.
//
// The old code did `text.split(/\r?\n+/)` and treated every non-empty line
// as a step, so formats A and C produced steps whose content was just "1",
// "2", "3", "Bước 1", etc. This parser filters those out and merges content
// onto the following line.

// Matches lines that are JUST a step header with no content:
//   "1", "1.", "1)", "Step 1", "STEP 1:", "Bước 1", "Paso 1:", "第1步"
const STEP_HEADER_ONLY = new RegExp(
  "^(?:" +
    // Latin step headers
    "(?:step|bước|buoc|paso|etapa|étape|étapes|schritt|passo)\\s*\\d+" +
    "|" +
    // Chinese step header: "第1步", "第 1 步"
    "第\\s*\\d+\\s*步" +
    "|" +
    // Just a number, possibly with a trailing punctuation
    "\\d+" +
  ")\\s*[:：\\.\\)、\\-]?\\s*$",
  "i"
);

// Matches leading step prefix on a content line that also has body text:
//   "Step 1: Preheat...", "1. Preheat...", "1) Preheat...", "Bước 1: Preheat..."
const INLINE_STEP_PREFIX = new RegExp(
  "^(?:" +
    "(?:step|bước|buoc|paso|etapa|étape|schritt|passo)\\s*\\d+\\s*[:：\\.\\-]\\s*" +
    "|" +
    "第\\s*\\d+\\s*步\\s*[:：\\.\\-]?\\s*" +
    "|" +
    "\\d+\\s*[\\.\\)：:、\\-]\\s+" +
  ")",
  "i"
);

/**
 * Parse a free-form instructions string into an array of clean step sentences.
 * Never returns empty or number-only strings.
 */
export function parseInstructionSteps(text) {
  if (!text || typeof text !== "string") return [];

  // Normalize
  const raw = text
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n") // handle any lingering HTML line breaks
    .trim();
  if (!raw) return [];

  // Split by newlines (one or more)
  const rawLines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Walk the lines: drop standalone step headers, strip inline prefixes
  const steps = [];
  for (const line of rawLines) {
    if (STEP_HEADER_ONLY.test(line)) {
      // This line is just "1" or "Bước 1" — skip it, the next line is content
      continue;
    }
    const cleaned = line.replace(INLINE_STEP_PREFIX, "").trim();
    if (cleaned && !STEP_HEADER_ONLY.test(cleaned)) {
      steps.push(cleaned);
    }
  }

  // Fallback: if we ended up with only 1 big step, check if it's actually
  // a paragraph of prose with multiple sentences and split by sentence boundary.
  if (steps.length <= 1 && raw.length > 80) {
    const normalized = raw
      .replace(/。\s*/g, "。\n") // Chinese period → force a line break
      .replace(/([.!?])\s+(?=[^\s])/g, "$1\n"); // Latin period + space → line break
    const sentences = normalized
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    if (sentences.length > 1) {
      return sentences.map((s) =>
        s.replace(INLINE_STEP_PREFIX, "").trim()
      ).filter(Boolean);
    }
  }

  return steps;
}
