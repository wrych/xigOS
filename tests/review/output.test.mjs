import { test } from "node:test";
import assert from "node:assert/strict";
import { readOutput } from "../../scripts/review/output.mjs";

test("structured findings are read", () => {
  const findings = [{ category: "style" }];
  const stdout = JSON.stringify({ structured_output: { findings } });
  assert.deepEqual(readOutput(stdout), { findings });
});

test("an empty findings list is a pass, not a failure", () => {
  const stdout = JSON.stringify({ structured_output: { findings: [] } });
  assert.deepEqual(readOutput(stdout), { findings: [] });
});

test("output that is not JSON is a failure", () => {
  assert.match(readOutput("Error: boom").failure, /not JSON/);
});

test("an error from the CLI is a failure with its reason", () => {
  const stdout = JSON.stringify({ is_error: true, result: "rate limited" });
  assert.match(readOutput(stdout).failure, /rate limited/);
});

test("output without structured findings is a failure, never a pass", () => {
  assert.match(readOutput("{}").failure, /no structured findings/);
  const notAList = JSON.stringify({ structured_output: { findings: "none" } });
  assert.match(readOutput(notAList).failure, /no structured findings/);
});
