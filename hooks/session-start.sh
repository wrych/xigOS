#!/usr/bin/env bash
# Context only: installing a project's dependencies stays the project's own
# SessionStart hook, because only the project knows its toolchain (ADR 0002).
set -euo pipefail

root="${CLAUDE_PLUGIN_ROOT:?CLAUDE_PLUGIN_ROOT is not set}"

json_escape() {
  local s=${1//\\/\\\\}
  s=${s//\"/\\\"}
  printf '%s' "$s"
}

context="This project uses xigOS. The base rules are ${root}/docs/constitution.md; the project's own docs/constitution.md and AGENTS.md extend them and win where they are stricter. Work on a branch named type/short-topic with the Conventional Commit type of the change, one change per branch. Never use --no-verify."

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  context="${context} This is a cloud session: create the type/short-topic branch from origin/main and push from it, not from the claude/... branch the session was handed."
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$(json_escape "$context")"
