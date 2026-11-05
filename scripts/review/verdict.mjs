function isEvidenced(finding) {
  return (
    finding.file.trim() !== "" &&
    finding.line > 0 &&
    finding.rule.trim() !== "" &&
    finding.failure.trim() !== ""
  );
}

/** Scores findings by category and splits them at the threshold. A finding
 * with no location, rule or failure scenario, or an unknown category, is
 * dropped: an unbacked claim never blocks a push. */
export function judge(findings, config) {
  const scored = findings
    .filter(isEvidenced)
    .flatMap((finding) => {
      const score = config.categories[finding.category];
      return score === undefined ? [] : [{ ...finding, score }];
    })
    .sort((a, b) => b.score - a.score);

  const blocking = scored.filter((f) => f.score >= config.threshold);
  const advisory = scored.filter((f) => f.score < config.threshold);
  return { blocked: blocking.length > 0, blocking, advisory };
}

/** The JSON Schema the reviewer's structured output must satisfy, with the
 * categories taken from config so the two cannot drift. */
export function findingsSchema(config) {
  const text = { type: "string" };
  return {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string", enum: Object.keys(config.categories) },
            rule: text,
            file: text,
            line: { type: "integer" },
            summary: text,
            failure: text,
          },
          required: ["category", "rule", "file", "line", "summary", "failure"],
        },
      },
    },
    required: ["findings"],
  };
}

/** One finding as a line a developer can act on, scored out of the highest
 * score the config can give. */
export function formatFinding(finding, config) {
  const top = Math.max(...Object.values(config.categories));
  return (
    `  [${finding.score}/${top} ${finding.category}] ` +
    `${finding.file}:${finding.line} — ${finding.summary}\n` +
    `      rule: ${finding.rule}\n` +
    `      fails when: ${finding.failure}`
  );
}
