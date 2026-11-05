# xigOS

The way xigo builds software, packaged as a Claude Code plugin.

Every xigo project installs xigOS and gets the same working method: a
constitution, decisions recorded before they land, small reviewed changes, and
a reviewer agent that gates each push. Each project keeps its own specs,
decisions and additions to the rules.

## Install

In a project, inside Claude Code:

```
/plugin install xigos --marketplace wrych/xigOS
```

On every session start the plugin tells Claude which rules apply: the base
constitution in [`docs/constitution.md`](docs/constitution.md), extended by the
project's own `docs/constitution.md` and `AGENTS.md`.

## The review gate

Before each push, a reviewer agent reads the branch's change against the base
constitution and the project's own rules, specs and decisions (ADR 0004). Each
finding has a category, and the category fixes its score; a finding at the
threshold blocks the push. Verdicts are cached per change.

In a project:

```sh
npm install --save-dev github:wrych/xigOS#v0.2.0
```

and in its pre-push hook, after the tests:

```sh
npx xigos-review --pre-push
```

With `--pre-push` the gate reads which commits git is pushing, and refuses a
push of a branch that is not checked out: the reviewer reads the files on
disk. Without it, it reviews the checked-out branch.

A project may rescore categories in `xigos.review.json`:

```json
{ "threshold": 4, "categories": { "design-rule": 4 } }
```

Categories: `privacy-security` 7, `correctness` 6, `rejection-rule` 5,
`spec-contradiction` 4, `design-rule` 3, `style` 1. Without the `claude` CLI the
review is skipped with a warning. Agents never bypass it with `--no-verify`.

## License

[MIT](LICENSE).
