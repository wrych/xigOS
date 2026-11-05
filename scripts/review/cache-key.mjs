import { createHash } from "node:crypto";

/** A hash of everything a verdict depends on: the diff, how it is split into
 * commits (base §1 makes that reviewable), the reviewer's instructions, the
 * rules it judges against, and the scores. Change any one, review again. */
export function cacheKey({ diff, commits, agent, rules, config }) {
  const hash = createHash("sha256");
  for (const part of [diff, commits, agent, rules, JSON.stringify(config)]) {
    hash.update(part).update("\0");
  }
  return hash.digest("hex");
}
