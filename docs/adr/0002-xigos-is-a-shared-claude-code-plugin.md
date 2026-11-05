# 0002. xigOS is a shared Claude Code plugin with its own marketplace

- **Status:** Accepted
- **Date:** 2026-11-05
- **Deciders:** Andy Moesch

## Context

Rebel Match has a harness that works: a constitution citable in review, ADRs
before code, one change per pull request, and a reviewer agent that blocks a
push on a scored finding. It lives inside that one repository, mixed with
product rules (its privacy model, its deadline, its requirement ids). The
xigo homepage and every project after it need the same method. Copying it into
each repository means each copy drifts, and an improvement made in one project
never reaches the others.

## Decision

xigOS is a **Claude Code plugin**, published from this repository through its
own **plugin marketplace**:

- `.claude-plugin/marketplace.json` at the root lists one plugin, `xigos`,
  whose source is the repository root.
- The root **is** the plugin: `.claude-plugin/plugin.json`, `agents/`,
  `skills/`, `hooks/` and `scripts/` sit beside `docs/`. An installed plugin
  receives only its own folder, so the base constitution must be inside it to
  reach the projects that extend it.
- `docs/constitution.md` is the **base constitution**. A project extends it in
  its own `docs/constitution.md`; it adds and tightens, and loosens only with an
  ADR of its own.

A project installs the plugin and keeps what is its own: specs, ADRs,
constitution additions, the configuration of the review gate, and its CI. What
is shared lives here once.

## Alternatives considered

- **A template repository** — copied once, then every project drifts; fixes do
  not flow back.
- **A plugin and a template together** — possible later as a scaffold skill
  inside the plugin; not a second artefact to maintain now.
- **Keep the harness in Rebel Match** — the homepage would have to depend on a
  product repository to get its rules.

## Consequences

- One place to improve the method; every project gets it on update.
- Projects must pin a plugin version and update deliberately, or a change here
  alters every project's review gate at once.
- The reviewer and hooks must read project-specific rules from the project
  (its constitution, specs and ADRs), never assume Rebel Match's.
- Rebel Match migrates onto xigOS in its own changes, after the plugin exists.

## References

Rebel Match `AGENTS.md`, `docs/constitution.md`, ADR 0019, ADR 0022.
