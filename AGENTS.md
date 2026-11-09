How to work in this repository. Read this first; it is short on purpose.

- **What this is** — xigOS: the way xigo builds software, packaged as a Claude
  Code plugin that every xigo project installs (ADR 0002). It combines the
  working method proven in Rebel Match with a curated set of agents and skills
  adapted from ECC (ADR 0003).
- **The rules** — [`docs/constitution.md`](docs/constitution.md). They apply to
  this repository and are the base every xigo project extends.
- **Why it is like this** — [`docs/adr/`](docs/adr/README.md).

## Repo map

```
docs/
  constitution.md   the shared engineering rules (the base for every project)
  adr/              decisions about xigOS itself
THIRD_PARTY.md      everything vendored, with its source, version and license
```

The repository root is the plugin (ADR 0002):

```
.claude-plugin/     the plugin and marketplace manifests (one version, kept equal)
agents/             plugin agents — reviewer.md is the review gate's reviewer
hooks/              the session-start hook
scripts/review/     the review gate, run by projects as `npx xigos-review` (ADR 0004)
tests/              node:test suites for all of the above (`npm test`)
evals/              agents run against fixtures (`npm run eval`; needs `claude`)
```

A release bumps the version in `package.json` and both manifests together and
is tagged `vX.Y.Z`; projects pin that tag.

## How a change happens

1. **Find what it serves** — an issue or an ADR. No issue covers it? Open one.
2. **Check for a decision.** Major and not yet decided? Write the ADR before the
   change (constitution §8).
3. **Branch**, one change per branch, named `type/short-topic`. A branch handed
   to you under another name is renamed before it is pushed.
4. **Write the test with the change**, same commit (§2). A prompt counts as
   behavior: an agent or skill that changes ships with the example or eval that
   shows it.
5. **Open a PR** citing what it serves. Squash-merge.
6. **Show what changed.** A change a person can see — a screen, an email,
   command output — is shown in screenshots or a short video (ADR 0006):
   before and after, phone and desktop width, seeded data only. **In the
   chat**, send them inline with the message that reports the change, asks
   for approval or offers options — that is where they matter most. **In the
   PR**, publish them on one private Artifact page and link it under "How it
   is tested"; where you cannot publish one, say there that they were sent in
   the chat. Never commit them. Cannot run it? Say why instead.

Do not batch unrelated fixes. Do not land a refactor and a behavior change
together.

### Before you push

`npm install` sets up the git hooks; in a cloud session the SessionStart hook
runs it. Commit messages are checked by commitlint, staged files are
formatted, and the pre-push hook runs the format check, the tests, and then
xigOS's own review gate on the branch — the same gate projects use.

A finding at the threshold blocks the push. Fix it, or — if the reviewer is
wrong — say why in the PR. **Agents never use `--no-verify`.** A prompt change
also runs `npm run eval` before the push.

### Merging

| The change                                                          | Merged by                         |
| ------------------------------------------------------------------- | --------------------------------- |
| Fix, refactor, test, CI or tooling, docs                            | the agent, by enabling auto-merge |
| An agent, skill or hook the maintainers have discussed              | the agent, by enabling auto-merge |
| An ADR recording a decision the maintainers already made            | the agent, by enabling auto-merge |
| A decision not yet made: new ADR choosing options, the constitution | a maintainer                      |
| Anything weakening privacy or security, or loosening a check        | a maintainer                      |
| A change to this rule                                               | a maintainer                      |

An agent that merges says so, with the PR link. When unsure which row a change
falls in, it is a maintainer's. Maintainers: Ivo Pejakovic, Andy Moesch.

## Bringing something in from ECC

xigOS vendors from [ECC](https://github.com/affaan-m/ecc) by hand, one piece per
change (ADR 0003):

1. Name the upstream file and commit in the PR.
2. **Adapt it, do not paste it.** It must obey the constitution: cite xigo's
   rules instead of ECC's, drop advice that contradicts ours, drop what does not
   apply to our stacks.
3. Read every line. Vendored text is third-party content (§5) until it has been
   reviewed and made ours.
4. Add it to `THIRD_PARTY.md` with its upstream path and commit.

## Working with a stale assumption

If this file and the constitution disagree, the constitution wins and this file
is the bug. Never silently widen scope to resolve a contradiction; ask.
