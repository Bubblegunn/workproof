#!/bin/bash
# usage: run-e.sh <workdir> [parallel=3] [runs=3] [arms="OURS BASE RCP RCP_I JD JD_I CV CV_I"] [model=sonnet]
# Round 14 runner for held-out set e. All arms on the subscription path (sub-shim first on PATH, sdk-shim removed).
# ARM_OURS ARM_BASE ARM_RCP ARM_JD ARM_CV are read from the environment (git-archive copies, as in round 13).
# Set e is taken from the local branch heldout-2026-10-wp-e with `git archive` (never a checkout); the script builds its
# fixtures with the set's own build-fixture.sh and never prints a task, prompt or criterion.
set -uo pipefail
W=$1; P=${2:-3}; N=${3:-3}; ARMS_LIST=${4:-"OURS BASE RCP RCP_I JD JD_I CV CV_I"}; export H2H_MODEL=${5:-sonnet}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd); REPO=$(cd "$H2H/../.." && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
export H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_GUARD=$W/guard H2H_HOME_ROOT=$W/homes
mkdir -p "$H2H_RUNS"
[ -f "$H2H_GUARD/config.base" ] || "$H2H/guard.sh" init "$H2H_GUARD"
if [ ! -d "$W/e-src" ]; then
  mkdir -p "$W/e-src"; git -C "$REPO" archive heldout-2026-10-wp-e bench/head-to-head/heldout-e | tar -x -C "$W/e-src" || exit 1
fi
D=$W/e-src/bench/head-to-head/heldout-e
export H2H_TASKS=$D/tasks.json
if [ ! -f "$W/fixtures.done" ]; then
  mkdir -p "$H2H_FIXTURES"
  python3 -c "
import json
for tid, t in json.load(open('$D/tasks.json'))['tasks'].items(): print(tid, t['fixture'])" > "$W/fixture-plan.txt"
  while read -r tid fix; do
    src="$D/$(echo "$tid" | tr 'A-Z' 'a-z')"
    [ -f "$src/build-fixture.sh" ] || { echo "no builder for $tid" >&2; exit 1; }
    bash "$src/build-fixture.sh" "$H2H_FIXTURES/$fix" > "$W/build-$tid.log" 2>&1 || { echo "fixture build failed for $tid (see $W/build-$tid.log)" >&2; exit 1; }
  done < "$W/fixture-plan.txt"
  touch "$W/fixtures.done"
fi
TASKS_LIST=$(python3 -c "import json;print(' '.join(json.load(open('$D/tasks.json'))['tasks']))")
for t in $TASKS_LIST; do for a in $ARMS_LIST; do for n in $(seq 1 "$N"); do
  [ -f "$H2H_RUNS/$t-$a-$n/DONE" ] || echo "$t $a $n"
done; done; done | xargs -P "$P" -L 1 "$H2H/run-one.sh"
python3 "$H2H/dev/failed-cells-any.py" "$H2H_RUNS" | tee "$W/failed-cells.txt"
[ -f "$H2H_GUARD/STOP" ] && { echo "guard STOP present"; exit 1; }
[ -s "$W/failed-cells.txt" ] && exit 3
exit 0
