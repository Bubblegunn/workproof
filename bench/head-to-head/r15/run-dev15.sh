#!/bin/bash
# usage: run-dev15.sh <workdir> [parallel=3] [runs=3] [arms="OURS BASE RCP_I CV_I"] [model=sonnet]
# Round 15 development gate runner: tasks D1-D5, E1-E5, T11-T16 (merged by make-dev15.py), arms on the subscription path.
# ARM_OURS ARM_BASE ARM_RCP ARM_CV from the environment. FIX_D, FIX_E, FIX_V and the d/e source folders are read once to build the merged set.
set -uo pipefail
W=$1; P=${2:-3}; N=${3:-3}; ARMS_LIST=${4:-"OURS BASE RCP_I CV_I"}; export H2H_MODEL=${5:-sonnet}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
export H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_GUARD=$W/guard H2H_HOME_ROOT=$W/homes H2H_TASKS=$W/tasks.json
mkdir -p "$H2H_RUNS"
[ -f "$W/tasks.json" ] || python3 "$HERE/make-dev15.py" "$W" "${D_SRC:?}" "${E_SRC:?}" "$H2H/dev" > "$W/plan.txt" || exit 1
[ -f "$H2H_GUARD/config.base" ] || "$H2H/guard.sh" init "$H2H_GUARD"
TASKS_LIST=$(python3 -c "import json;print(' '.join(json.load(open('$W/tasks.json'))['tasks']))")
for t in $TASKS_LIST; do for a in $ARMS_LIST; do for n in $(seq 1 "$N"); do
  [ -f "$H2H_RUNS/$t-$a-$n/DONE" ] || echo "$t $a $n"
done; done; done | xargs -P "$P" -L 1 "$H2H/run-one.sh"
python3 "$H2H/dev/failed-cells-any.py" "$H2H_RUNS" | tee "$W/failed-cells.txt"
[ -f "$H2H_GUARD/STOP" ] && { echo "guard STOP present"; exit 1; }
[ -s "$W/failed-cells.txt" ] && exit 3
exit 0
