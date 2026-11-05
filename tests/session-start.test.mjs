import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const hook = fileURLToPath(
  new URL("../hooks/session-start.sh", import.meta.url),
);

function run(env) {
  const result = spawnSync("bash", [hook], {
    encoding: "utf8",
    env: { PATH: process.env.PATH, ...env },
  });
  return result;
}

function contextOf(result) {
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, "SessionStart");
  return output.hookSpecificOutput.additionalContext;
}

test("points the session at the base constitution inside the plugin", () => {
  const context = contextOf(run({ CLAUDE_PLUGIN_ROOT: "/plugins/xigos" }));
  assert.match(context, /\/plugins\/xigos\/docs\/constitution\.md/);
  assert.match(context, /type\/short-topic/);
  assert.match(context, /Never use --no-verify/);
});

test("tells a cloud session to leave the branch it was handed", () => {
  const local = contextOf(run({ CLAUDE_PLUGIN_ROOT: "/p" }));
  const cloud = contextOf(
    run({ CLAUDE_PLUGIN_ROOT: "/p", CLAUDE_CODE_REMOTE: "true" }),
  );
  assert.doesNotMatch(local, /claude\/\.\.\./);
  assert.match(cloud, /not from the claude\/\.\.\. branch/);
});

test("stays valid JSON when the plugin path holds quotes or backslashes", () => {
  const context = contextOf(run({ CLAUDE_PLUGIN_ROOT: 'C:\\Users\\a "b"' }));
  assert.match(context, /C:\\Users\\a "b"\/docs\/constitution\.md/);
});

test("fails loudly without a plugin root", () => {
  const result = run({});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CLAUDE_PLUGIN_ROOT is not set/);
});
