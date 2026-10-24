#!/bin/bash
# usage: grade-r14.sh <workdir> <set-tasks.json> <seed-prefix> [model=sonnet] [votes="1 2 3 4 5"] [fixtures-dir] [runs-dir]
# Five independent blind votes per packet, reason before verdict (assemble-r14.py). A vote whose JSON cannot be read is asked once
# more (same prompt); a packet with fewer than three readable votes is reported as an error by score-r14.py.
set -uo pipefail
W=$(cd "$1" && pwd); export H2H_TASKS=$2; SP=$3; export H2H_GRADER_MODEL=${4:-sonnet}; VOTES=${5:-"1 2 3 4 5"}
FX=${6:-$W/fixtures}; RUNS=${7:-$W/runs}; OUTROOT=${8:-$W/grades}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
cd "$W" || exit 1   # the grader must not run below /Users/efe (the wrapper refuses it)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
for v in $VOTES; do
  python3 "$HERE/assemble-r14.py" "$RUNS" "$OUTROOT/v$v" "$SP-$v" "$FX" >/dev/null || exit 1
  ( "$H2H/dev/grade-any.sh" "$OUTROOT/v$v"
    for f in "$OUTROOT/v$v"/*-prompt.txt; do
      t=$(basename "$f" -prompt.txt)
      python3 -c "
import json,re,sys
m=re.search(r'\{.*\}',open('$OUTROOT/v$v/$t-grade.json').read(),re.S); json.loads(m.group(0))" 2>/dev/null || {
        cp "$OUTROOT/v$v/$t-grade.json" "$OUTROOT/v$v/$t-grade-attempt1.json" 2>/dev/null
        claude -p --model "$H2H_GRADER_MODEL" --setting-sources project --strict-mcp-config --tools "" < "$f" > "$OUTROOT/v$v/$t-grade.json" 2> "$OUTROOT/v$v/$t-grade.err" || true; }
    done ) &
done
wait
for v in $VOTES; do for f in "$OUTROOT"/v$v/*-grade.err; do [ -s "$f" ] && { echo "grader error in $f"; head -c 300 "$f"; }; done; done
