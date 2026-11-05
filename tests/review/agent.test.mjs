import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_CONFIG } from "../../scripts/review/config.mjs";

const agent = readFileSync(
  new URL("../../agents/reviewer.md", import.meta.url),
  "utf8",
);
const frontMatter = agent.split("---")[1];
const tools = /^tools:(.*)$/m
  .exec(frontMatter)[1]
  .split(",")
  .map((tool) => tool.trim());

test("the reviewer can return structured findings", () => {
  assert.ok(tools.includes("StructuredOutput"));
});

test("the reviewer cannot edit anything", () => {
  for (const tool of ["Edit", "Write", "NotebookEdit"]) {
    assert.ok(!tools.includes(tool), `${tool} must not be granted`);
  }
});

test("the reviewer is told about every category the gate scores", () => {
  for (const category of Object.keys(DEFAULT_CONFIG.categories)) {
    assert.match(agent, new RegExp(`\\| \`${category}\` `));
  }
});
