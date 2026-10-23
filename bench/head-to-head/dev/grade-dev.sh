#!/bin/bash
# usage: grade-dev.sh <workdir> [seed-prefix]  - three independent blind votes (own shuffle seed each), graded in parallel through the subscription wrapper.
set -uo pipefail
W=$(cd "$1" && pwd); SP=${2:-r13-dev}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export H2H_TASKS=$HERE/dev-tasks.json
for v in 1 2 3; do
  python3 "$H2H/assemble.py" "$W/runs" "$W/grades/v$v" "$SP-$v" "$W/fixtures" >/dev/null || exit 1
  ( "$H2H/grade.sh" "$W/grades/v$v" ) &
done
wait
for v in 1 2 3; do for f in "$W"/grades/v$v/*-grade.err; do [ -s "$f" ] && { echo "grader error in $f"; head -c 300 "$f"; }; done; done
python3 "$HERE/score-dev.py" "$W/grades" "$HERE/dev-tasks.json" | tee "$W/results.txt"
