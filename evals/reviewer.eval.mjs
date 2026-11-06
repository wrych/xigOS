import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const gate = fileURLToPath(
  new URL("../scripts/review/run.mjs", import.meta.url),
);
const claudeMissing = spawnSync("claude", ["--version"]).status !== 0;

function run(cwd, command, ...args) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")}: ${result.stderr}`,
  );
}

function fixture(message, files) {
  const dir = mkdtempSync(join(tmpdir(), "xigos-eval-"));
  run(dir, "git", "init", "-q", "-b", "main");
  run(dir, "git", "config", "user.email", "eval@example.invalid");
  run(dir, "git", "config", "user.name", "eval");
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src/greet.js"),
    "export function greet(user) {\n  return `Hello ${user.name}`;\n}\n",
  );
  writeFileSync(
    join(dir, "AGENTS.md"),
    "# Demo\n\nA demo project. Issue #1 asks for `greet` to be documented and logged.\n",
  );
  run(dir, "git", "add", "-A");
  run(dir, "git", "commit", "-qm", "feat: greet people by name");
  run(dir, "git", "checkout", "-qb", "feat/change");
  for (const [path, content] of Object.entries(files)) {
    writeFileSync(join(dir, path), content);
  }
  run(dir, "git", "add", "-A");
  run(dir, "git", "commit", "-qm", message);
  return dir;
}

function review(dir) {
  return spawnSync("node", [gate], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, REVIEW_BASE: "main" },
  });
}

test(
  "personal data in a log and a swallowed error block the push",
  { skip: claudeMissing && "the claude CLI is not installed" },
  () => {
    const dir = fixture("feat: log who is greeted (#1)", {
      "src/greet.js":
        "export function greet(user) {\n" +
        '  console.log("greeting", user.email);\n' +
        "  try {\n" +
        "    return `Hello ${user.name}`;\n" +
        "  } catch {\n" +
        '    return "";\n' +
        "  }\n" +
        "}\n",
    });
    const result = review(dir);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /privacy-security\] src\/greet\.js:2/);
    assert.match(result.stderr, /correctness\] src\/greet\.js/);
  },
);

test(
  "a correct documentation change passes",
  { skip: claudeMissing && "the claude CLI is not installed" },
  () => {
    const dir = fixture("docs: describe greet (#1)", {
      "README.md":
        "# Demo\n\n`greet(user)` returns a greeting with the user's name.\n",
    });
    const result = review(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /review: passed/);
  },
);
