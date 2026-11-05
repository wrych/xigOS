import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONFIG } from "../../scripts/review/config.mjs";
import {
  findingsSchema,
  formatFinding,
  judge,
} from "../../scripts/review/verdict.mjs";

const finding = (overrides = {}) => ({
  category: "correctness",
  rule: "base §4",
  file: "src/app.js",
  line: 12,
  summary: "the error is swallowed",
  failure: "a missing file renders an empty page",
  ...overrides,
});

test("a finding at the threshold blocks, one below is advice", () => {
  const verdict = judge(
    [
      finding({ category: "spec-contradiction" }),
      finding({ category: "design-rule" }),
    ],
    DEFAULT_CONFIG,
  );
  assert.equal(verdict.blocked, true);
  assert.deepEqual(
    verdict.blocking.map((f) => f.category),
    ["spec-contradiction"],
  );
  assert.deepEqual(
    verdict.advisory.map((f) => f.category),
    ["design-rule"],
  );
});

test("findings are ordered by score, highest first", () => {
  const verdict = judge(
    [finding({ category: "style" }), finding({ category: "privacy-security" })],
    { ...DEFAULT_CONFIG, threshold: 100 },
  );
  assert.deepEqual(
    verdict.advisory.map((f) => f.score),
    [7, 1],
  );
});

for (const [name, broken] of [
  ["file", { file: " " }],
  ["line", { line: 0 }],
  ["rule", { rule: "" }],
  ["failure scenario", { failure: "" }],
]) {
  test(`a finding without a ${name} never blocks`, () => {
    const verdict = judge(
      [finding({ category: "privacy-security", ...broken })],
      DEFAULT_CONFIG,
    );
    assert.equal(verdict.blocked, false);
    assert.equal(verdict.advisory.length, 0);
  });
}

test("a category the config does not know is dropped", () => {
  const verdict = judge([finding({ category: "vibes" })], DEFAULT_CONFIG);
  assert.equal(verdict.blocked, false);
  assert.equal(verdict.advisory.length, 0);
});

test("the schema offers exactly the configured categories", () => {
  const schema = findingsSchema(DEFAULT_CONFIG);
  assert.deepEqual(
    schema.properties.findings.items.properties.category.enum,
    Object.keys(DEFAULT_CONFIG.categories),
  );
});

test("a finding is printed with its score, place, rule and failure", () => {
  const text = formatFinding({ ...finding(), score: 6 }, DEFAULT_CONFIG);
  assert.match(text, /\[6\/7 correctness\] src\/app\.js:12/);
  assert.match(text, /rule: base §4/);
  assert.match(text, /fails when: a missing file/);
});
