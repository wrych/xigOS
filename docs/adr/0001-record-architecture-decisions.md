# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-05
- **Deciders:** Andy Moesch

## Context

xigOS will shape how every xigo project is built. Choices made here — what the
plugin contains, what it borrows, what it enforces — will be questioned later by
the two of us, by contributors and by agents working in projects that install
it. Rebel Match showed that a decision written down once is not re-argued in
every pull request.

## Decision

xigOS keeps Architecture Decision Records in `docs/adr/`, one decision per file,
numbered in order, in the format of `template.md`. The process is in
`docs/adr/README.md`. Every xigo project that installs xigOS keeps its own ADRs
in the same shape.

## Alternatives considered

- **Decisions in pull request descriptions** — they scroll away and cannot be
  superseded visibly.
- **A single decisions log** — grows into a document nobody reads, and cannot
  be cited by number.

## Consequences

- A major change carries an extra page, written before the code.
- Reviewers, human or agent, can reject a change by citing an ADR number.

## References

Rebel Match `docs/adr/0001-record-architecture-decisions.md`.
