import { test } from "node:test";
import assert from "node:assert/strict";
import { cacheKey } from "../../scripts/review/cache-key.mjs";

const input = {
  diff: "diff --git a/x b/x",
  commits: "abc\nfeat: x",
  agent: "you review",
  rules: "base rules",
  config: { threshold: 4 },
};

test("the same input gives the same key", () => {
  assert.equal(cacheKey(input), cacheKey({ ...input }));
});

for (const [part, changed] of [
  ["diff", "diff --git a/y b/y"],
  ["commits", "def\nfeat: y"],
  ["agent", "you review harder"],
  ["rules", "stricter rules"],
  ["config", { threshold: 5 }],
]) {
  test(`a change to the ${part} asks for a new review`, () => {
    assert.notEqual(cacheKey({ ...input, [part]: changed }), cacheKey(input));
  });
}

test("parts cannot run into each other", () => {
  const a = cacheKey({ ...input, diff: "ab", commits: "c" });
  const b = cacheKey({ ...input, diff: "a", commits: "bc" });
  assert.notEqual(a, b);
});
