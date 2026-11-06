const DELETED = /^0+$/;

/** What a `git push` sends, read from the lines git writes to a pre-push
 * hook's stdin: each local ref and the object it points at. Deleted refs send
 * nothing and are left out. */
export function pushedCommits(stdin) {
  return stdin
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length === 4 && !DELETED.test(fields[1]))
    .map(([localRef, localSha]) => ({ ref: localRef, sha: localSha }));
}

/** Why a push cannot be reviewed, or null when it can. The reviewer judges
 * the checked-out commit from the files on disk, so everything pushed must be
 * that commit or one it already contains. */
export function unreviewablePush(pushed, isInCheckedOut) {
  const elsewhere = pushed.filter((commit) => !isInCheckedOut(commit.sha));
  if (elsewhere.length === 0) return null;
  const refs = elsewhere.map((commit) => commit.ref).join(", ");
  return `${refs} is not in the checked-out branch; check it out and push it from there, so the reviewer reads its files`;
}
