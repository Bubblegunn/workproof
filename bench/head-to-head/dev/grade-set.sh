#!/bin/bash
# usage: grade-set.sh <workdir> <public|d> <seed-prefix> [model=sonnet]  - three independent blind votes, graded in parallel on the subscription path.
set -uo pipefail
W=$(cd "$1" && pwd); SET=$2; SP=$3; export H2H_GRADER_MODEL=${4:-sonnet}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
if [ "$SET" = d ]; then export H2H_TASKS=$W/d-src/bench/head-to-head/heldout-d/tasks.json; else unset H2H_TASKS; fi
for v in 1 2 3; do
  python3 "$H2H/assemble.py" "$W/runs" "$W/grades/v$v" "$SP-$v" "$W/fixtures" >/dev/null || exit 1
  ( "$H2H/grade.sh" "$W/grades/v$v" ) &
done
wait
for v in 1 2 3; do for f in "$W"/grades/v$v/*-grade.err; do [ -s "$f" ] && { echo "grader error in $f"; head -c 300 "$f"; }; done; done
