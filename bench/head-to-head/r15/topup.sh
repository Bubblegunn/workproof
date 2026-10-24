#!/bin/bash
# usage: topup.sh <workdir> <tasks.json> <task> <seed-prefix> <vote numbers...>
# Extra blind votes (new shuffles) for ONE packet whose first votes were unreadable; only that task's file is kept in the new vote folders.
set -uo pipefail
W=$(cd "$1" && pwd); export H2H_TASKS=$2; T=$3; SP=$4; shift 4
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
cd "$W" || exit 1
for v in "$@"; do
  python3 "$H2H/r14/assemble-r14.py" "$W/runs" "$W/grades/v$v" "$SP-$v" "$W/fixtures" >/dev/null || exit 1
  ( cd "$W/grades/v$v" && for f in *-prompt.txt *-packet.txt *-labels.json; do case $f in $T-*) ;; *) rm -f "$f";; esac; done
    claude -p --model "${H2H_GRADER_MODEL:-sonnet}" --setting-sources project --strict-mcp-config --tools "" < "$T-prompt.txt" > "$T-grade.json" 2> "$T-grade.err" ) &
done
wait
