# 0003. Vendor a curated set of agents and skills from ECC

- **Status:** Accepted
- **Date:** 2026-11-05
- **Deciders:** Andy Moesch

## Context

[ECC](https://github.com/affaan-m/ecc) (MIT) is a large Claude Code plugin: 71
agents, 314 skills, 98 commands, around 27 hooks and rules for many languages.
Some of it is excellent and fills gaps the Rebel Match harness has — a planner,
a test-first guide, a security reviewer, language reviewers for TypeScript and
Vue, a hunter for swallowed errors, hook profiles. Most of it covers stacks and
domains xigo does not use. Its rules also differ from ours in places, and every
hook it installs runs code on our machines.

## Decision

xigOS **vendors a curated set** from ECC: each piece copied by hand, adapted to
the xigo constitution, read in full, and listed in `THIRD_PARTY.md` with its
upstream path and commit. We do not install ECC alongside xigOS.

The first candidates, each its own change:

| Upstream (ECC)                            | Why                                              |
| ----------------------------------------- | ------------------------------------------------ |
| `agents/planner.md`                       | plans a multi-step change before code            |
| `agents/tdd-guide.md`                     | test first, in the same commit (constitution §2) |
| `agents/security-reviewer.md`             | a deeper look at §5 for sensitive changes        |
| `agents/typescript-reviewer.md`           | our main language                                |
| `agents/vue-reviewer.md`                  | our main client framework                        |
| `agents/silent-failure-hunter.md`         | "fail loudly" (constitution §4)                  |
| hook profiles (minimal, standard, strict) | let a project choose how much runs               |

Anything else is proposed in an issue first.

## Alternatives considered

- **Install ECC as a second plugin, pinned** — least work, but hundreds of
  skills compete for the model's attention, its rules contradict ours in
  places, and its hooks run code we have not read.
- **Rebel Match only, ECC later** — leaves known gaps (planning, security,
  language review) open while the homepage starts.

## Consequences

- Upstream improvements do not arrive by themselves; someone looks at ECC's
  changes from time to time and brings over what is worth it.
- Every vendored line is ours to maintain and to keep consistent with the
  constitution.
- The MIT notice travels with the copies in `THIRD_PARTY.md`.

## References

ECC at commit `b38be6a7f6350964d59328b52f0624e1d1d552d1`. ADR 0002.
