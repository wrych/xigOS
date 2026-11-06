import { test } from "node:test";
import assert from "node:assert/strict";
import { pushedCommits, unreviewablePush } from "../../scripts/review/push.mjs";

const head = "a".repeat(40);
const ancestor = "c".repeat(40);
const other = "b".repeat(40);
const zeros = "0".repeat(40);
const inCheckedOut = (sha) => sha === head || sha === ancestor;

test("reads each pushed ref and what it points at", () => {
  const stdin =
    `refs/heads/feat/x ${head} refs/heads/feat/x ${zeros}\n` +
    `refs/tags/v1 ${other} refs/tags/v1 ${zeros}\n`;
  assert.deepEqual(pushedCommits(stdin), [
    { ref: "refs/heads/feat/x", sha: head },
    { ref: "refs/tags/v1", sha: other },
  ]);
});

test("a deleted ref sends nothing to review", () => {
  assert.deepEqual(
    pushedCommits(`(delete) ${zeros} refs/heads/old ${other}\n`),
    [],
  );
});

test("no stdin, as when run by hand, names nothing", () => {
  assert.deepEqual(pushedCommits(""), []);
});

test("the checked-out commit, and a tag on one it contains, can be reviewed", () => {
  const pushed = [
    { ref: "refs/heads/feat/x", sha: head },
    { ref: "refs/tags/v0.2.0", sha: ancestor },
  ];
  assert.equal(unreviewablePush(pushed, inCheckedOut), null);
});

test("anything the checked-out branch does not contain is refused, by name", () => {
  const reason = unreviewablePush(
    [
      { ref: "refs/heads/feat/x", sha: head },
      { ref: "refs/tags/v1", sha: other },
    ],
    inCheckedOut,
  );
  assert.match(reason, /refs\/tags\/v1 is not in the checked-out branch/);
  assert.doesNotMatch(reason, /feat\/x/);
});
