# Architecture Decision Records

One decision per file, numbered in order, never renumbered. An ADR is a page:
what the situation was, what we chose, and what we now live with.

## When an ADR is required

Before the decision lands — not after. Required when the decision is:

- **hard to reverse** — what the plugin contains or enforces, a dependency, a
  public contract other projects rely on;
- **surprising later** — a future maintainer would ask "why is it like this?";
- **a rule everyone must follow** — anything added to `docs/constitution.md`.

Not required for: a bug fix, a refactor that preserves behavior, a dependency
bump, or a vendored piece ADR 0003 already lists.

## How to add one

1. Copy `template.md` to `NNNN-short-kebab-title.md`, next number up.
2. Fill it in. Keep it to one page.
3. Open it in the PR that implements the decision, or ahead of it.
4. Superseding, never editing: a reversed decision gets a new ADR, and the old
   one's status becomes `Superseded by NNNN`.

## Status values

`Proposed` · `Accepted` · `Accepted, amended by NNNN` · `Superseded by NNNN` ·
`Deprecated`

## Index

| #                                                                         | Decision                                                      | Status   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)                             | Record architecture decisions                                 | Accepted |
| [0002](0002-xigos-is-a-shared-claude-code-plugin.md)                      | xigOS is a shared Claude Code plugin with a marketplace       | Accepted |
| [0003](0003-vendor-a-curated-set-from-ecc.md)                             | Vendor a curated set of agents and skills from ECC            | Accepted |
| [0004](0004-projects-run-the-review-gate-from-a-pinned-git-dependency.md) | Projects run the review gate from a pinned git dependency     | Accepted |
| [0006](0006-show-what-changed-on-screen.md)                               | Show what changed on screen, in the chat and the pull request | Accepted |
