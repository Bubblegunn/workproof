#!/bin/sh
# workproof SessionStart pointer. Reads the hook input JSON on stdin and prints one JSON line only when
# the session's working directory is inside a git work tree. No writes, no network, exit 0 always.
input=$(cat)
flat=$(printf '%s' "$input" | tr '\n\r' '  ' | head -c 100000)
cwd=$(printf '%s' "$flat" | sed -E -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"([^"\\]*)".*/\1/p')
case $cwd in *[\\]*) exit 0 ;; esac
[ -n "$cwd" ] || cwd=.
export GIT_OPTIONAL_LOCKS=0
[ "$(git -C "$cwd" rev-parse --is-inside-work-tree 2>/dev/null)" = true ] || exit 0
root=${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)}
root=$(printf '%s' "$root" | tr -d '[:cntrl:]"\\')
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "workproof: when asked to write, summarise, check or judge someone's work from git history or exported Claude Code sessions (statement, promotion or review file, quarterly summary, hiring or contractor claim, invoice check, usage report),\\napply the rules in $root/skills/workproof/references/core-rules.md (read that file; do not search the disk),\\nand use the workproof skill for figures about the user's own work."
exit 0
