# 0004. Projects run the review gate from a pinned git dependency

- **Status:** Accepted
- **Date:** 2026-11-05
- **Deciders:** Andy Moesch

## Context

Rebel Match gates every push on a reviewer agent (its ADR 0019): a fresh,
read-only agent reviews the branch against the rules, files each finding under a
category whose score is fixed, and a finding at the threshold blocks the push.
Every xigo project should have that gate, and it should be the same gate.

A git hook needs a stable path to the gate's script. An installed Claude Code
plugin lives in a per-user cache whose path changes with each version, and CI
has no plugin installed at all. The gate must also run the same reviewer for
everyone on a project, whatever version of xigOS each person has installed.

## Decision

- The reviewer is a plugin agent, **`agents/reviewer.md`**, usable in a session
  as `xigos:reviewer`. The base rules and the project's own rules are both its
  input; nothing project-specific is in it.
- The gate is **`scripts/review/run.mjs`**, published as the `xigos-review`
  command of this repository's `package.json`. Plain Node, no dependencies.
- A project adds xigOS as a **dev dependency from GitHub, pinned to a tag**
  (`"xigos": "github:wrych/xigOS#v0.2.0"`) and calls `npx xigos-review` from
  its pre-push hook. The gate starts the reviewer with `--plugin-dir` pointing
  at that copy, so the version the project pinned is the version that reviews.
- Categories and their scores ship with the gate. A project may change a
  category's score or the threshold in `xigos.review.json`; it cannot invent a
  category the reviewer does not know.

## Alternatives considered

- **Publish to the npm registry** — an account and a release step for no gain
  while only xigo projects use it.
- **Copy the script into each project** — the drift ADR 0002 exists to prevent.
- **Run the reviewer from the installed plugin** — the path is per user and per
  version, and missing in CI.

## Consequences

- A project upgrades its gate deliberately, by changing the tag.
- xigOS tags its releases; the three manifests carry the same version.
- The behavior of Rebel Match ADR 0019 carries over: the review is skipped with
  a warning when the `claude` CLI is missing or fails, and agents never bypass
  it with `--no-verify`.

## References

Rebel Match ADR 0019 and `scripts/review/`. ADR 0002.
