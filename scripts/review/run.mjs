#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { cacheKey } from "./cache-key.mjs";
import { loadConfig } from "./config.mjs";
import { readOutput } from "./output.mjs";
import { pushedCommits, unreviewablePush } from "./push.mjs";
import { findingsSchema, formatFinding, judge } from "./verdict.mjs";

const PLUGIN_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const AGENT_FILE = join(PLUGIN_ROOT, "agents", "reviewer.md");
const BASE_CONSTITUTION = join(PLUGIN_ROOT, "docs", "constitution.md");
const PROJECT_RULES = ["docs/constitution.md", "AGENTS.md"];
const PROJECT_CONFIG = "xigos.review.json";
const MAX_REVIEWER_OUTPUT_BYTES = 64 * 1024 * 1024;
const CACHE_BASE_CHARS = 12;
const CACHE_KEY_CHARS = 24;
const REVIEWER_TOOLS = [
  "Read",
  "Grep",
  "Glob",
  "Bash(git diff:*)",
  "Bash(git log:*)",
  "Bash(git show:*)",
];

function say(text) {
  process.stderr.write(`${text}\n`);
}

function git(...args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed`);
  return result.stdout.trim();
}

function readIfPresent(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function rulesText() {
  return [BASE_CONSTITUTION, ...PROJECT_RULES].map(readIfPresent).join("\0");
}

function cachePath(base, diff, config) {
  const key = cacheKey({
    diff,
    commits: git("log", "--format=%H%n%B", `${base}..HEAD`),
    agent: readFileSync(AGENT_FILE, "utf8"),
    rules: rulesText(),
    config,
  });
  const dir = git("rev-parse", "--git-path", "xigos-review-cache");
  mkdirSync(dir, { recursive: true });
  const name = `${base.slice(0, CACHE_BASE_CHARS)}-${key.slice(0, CACHE_KEY_CHARS)}`;
  return join(dir, `${name}.json`);
}

function askReviewer(base, config) {
  const prompt =
    `Review the change \`git diff ${base}...HEAD\` ` +
    `(commits: \`git log ${base}..HEAD\`). ` +
    `The xigo base constitution is ${BASE_CONSTITUTION}. ` +
    "Report findings as instructed.";
  const result = spawnSync(
    "claude",
    [
      ...[
        "-p",
        prompt,
        "--plugin-dir",
        PLUGIN_ROOT,
        "--agent",
        "xigos:reviewer",
      ],
      ...["--add-dir", PLUGIN_ROOT],
      ...["--output-format", "json", "--no-session-persistence"],
      ...["--json-schema", JSON.stringify(findingsSchema(config))],
      ...["--permission-mode", "dontAsk", "--allowedTools", ...REVIEWER_TOOLS],
    ],
    { encoding: "utf8", maxBuffer: MAX_REVIEWER_OUTPUT_BYTES },
  );
  if (result.error !== undefined) return { failure: result.error.message };
  if (result.status !== 0)
    return { failure: `claude exited with ${result.status}` };
  return readOutput(result.stdout);
}

function reviewerAvailable() {
  return spawnSync("claude", ["--version"]).status === 0;
}

function findingsFor(base, diff, config) {
  const cache = cachePath(base, diff, config);
  if (existsSync(cache)) {
    say("review: unchanged since the last review, reusing its verdict");
    return { findings: JSON.parse(readFileSync(cache, "utf8")) };
  }

  say("review: asking the reviewer agent (this takes a minute or two)…");
  const result = askReviewer(base, config);
  if ("findings" in result)
    writeFileSync(cache, JSON.stringify(result.findings));
  return result;
}

function report(findings, config) {
  const verdict = judge(findings, config);
  for (const finding of verdict.advisory) say(formatFinding(finding, config));

  if (!verdict.blocked) {
    say(`review: passed (${verdict.advisory.length} advisory)`);
    return 0;
  }

  say(`\nreview: blocked — findings scoring ${config.threshold}+:`);
  for (const finding of verdict.blocking) say(formatFinding(finding, config));
  say("\nFix them, or answer them in the PR. Do not bypass with --no-verify.");
  return 1;
}

function isInCheckedOut(sha) {
  const commit = spawnSync(
    "git",
    ["rev-parse", "--verify", `${sha}^{commit}`],
    {
      encoding: "utf8",
    },
  );
  if (commit.status !== 0) return false;
  const ancestor = spawnSync("git", [
    "merge-base",
    "--is-ancestor",
    commit.stdout.trim(),
    "HEAD",
  ]);
  return ancestor.status === 0;
}

function hookInput() {
  return process.argv.includes("--pre-push") ? readFileSync(0, "utf8") : "";
}

function main() {
  const config = loadConfig(PROJECT_CONFIG);
  const refused = unreviewablePush(pushedCommits(hookInput()), isInCheckedOut);
  if (refused !== null) {
    say(`review: blocked — ${refused}`);
    return 1;
  }

  const base = git(
    "merge-base",
    "HEAD",
    process.env.REVIEW_BASE ?? "origin/main",
  );
  const diff = git("diff", "--no-color", `${base}...HEAD`);
  if (diff === "") return 0;

  if (!reviewerAvailable()) {
    say("review: SKIPPED — the `claude` CLI is not installed or not on PATH");
    return 0;
  }

  const result = findingsFor(base, diff, config);
  if ("failure" in result) {
    say(
      `review: SKIPPED — the reviewer failed (${result.failure}); push allowed`,
    );
    return 0;
  }
  return report(result.findings, config);
}

process.exitCode = main();
