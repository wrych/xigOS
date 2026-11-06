import { existsSync, readFileSync } from "node:fs";

/** The scores every project starts from. The reviewer agent knows exactly
 * these categories; a project may rescore them, never add to them. */
export const DEFAULT_CONFIG = Object.freeze({
  threshold: 4,
  categories: Object.freeze({
    "privacy-security": 7,
    correctness: 6,
    "rejection-rule": 5,
    "spec-contradiction": 4,
    "design-rule": 3,
    style: 1,
  }),
});

function isScore(value) {
  return Number.isInteger(value) && value >= 0;
}

/** Applies a project's overrides to the defaults. Throws on an unknown key,
 * an unknown category or a score that is not a non-negative integer, so a
 * typo never silently weakens the gate. */
export function mergeConfig(overrides) {
  const unknownKeys = Object.keys(overrides).filter(
    (key) => key !== "threshold" && key !== "categories",
  );
  if (unknownKeys.length > 0) {
    throw new Error(`unknown setting: ${unknownKeys.join(", ")}`);
  }

  const categories = { ...DEFAULT_CONFIG.categories };
  for (const [name, score] of Object.entries(overrides.categories ?? {})) {
    if (!Object.hasOwn(categories, name)) {
      throw new Error(`unknown category: ${name}`);
    }
    if (!isScore(score))
      throw new Error(`score of ${name} must be an integer ≥ 0`);
    categories[name] = score;
  }

  const threshold = overrides.threshold ?? DEFAULT_CONFIG.threshold;
  if (!isScore(threshold)) throw new Error("threshold must be an integer ≥ 0");
  return { threshold, categories };
}

/** The review configuration for a project: the defaults, with its
 * `xigos.review.json` applied when it has one. */
export function loadConfig(path) {
  if (!existsSync(path)) return mergeConfig({});
  const text = readFileSync(path, "utf8");
  try {
    return mergeConfig(JSON.parse(text));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}
