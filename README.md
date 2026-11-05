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

## License

[MIT](LICENSE).
