import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_CONFIG,
  loadConfig,
  mergeConfig,
} from "../../scripts/review/config.mjs";

test("without overrides, the defaults apply", () => {
  assert.deepEqual(mergeConfig({}), {
    threshold: DEFAULT_CONFIG.threshold,
    categories: { ...DEFAULT_CONFIG.categories },
  });
});

test("a project can rescore a category and move the threshold", () => {
  const config = mergeConfig({
    threshold: 3,
    categories: { "design-rule": 4 },
  });
  assert.equal(config.threshold, 3);
  assert.equal(config.categories["design-rule"], 4);
  assert.equal(config.categories.correctness, 6);
});

test("a category the reviewer does not know is refused", () => {
  assert.throws(
    () => mergeConfig({ categories: { vibes: 5 } }),
    /unknown category: vibes/,
  );
});

test("an inherited property name is not a category", () => {
  for (const name of ["constructor", "toString", "__proto__"]) {
    assert.throws(
      () => mergeConfig(JSON.parse(`{"categories": {"${name}": 9}}`)),
      /unknown category/,
    );
  }
});

test("a misspelled setting is refused rather than ignored", () => {
  assert.throws(
    () => mergeConfig({ treshold: 9 }),
    /unknown setting: treshold/,
  );
});

test("a score must be a non-negative integer", () => {
  assert.throws(() => mergeConfig({ categories: { style: "1" } }), /integer/);
  assert.throws(() => mergeConfig({ threshold: -1 }), /integer/);
});

test("a project file is read, and its errors name the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "xigos-review-"));
  const good = join(dir, "good.json");
  const bad = join(dir, "bad.json");
  writeFileSync(good, JSON.stringify({ threshold: 5 }));
  writeFileSync(bad, "{ not json");
  assert.equal(loadConfig(good).threshold, 5);
  assert.equal(loadConfig(join(dir, "missing.json")).threshold, 4);
  assert.throws(() => loadConfig(bad), new RegExp(bad.replaceAll("/", "\\/")));
});
