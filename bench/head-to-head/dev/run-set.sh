#!/bin/bash
# usage: run-set.sh <workdir> <public|d> [parallel=3] [runs=3] [arms="OURS BASE RCP RCP_I JD JD_I CV CV_I"] [model=sonnet]
# Final-measurement runner for one task set, all arms on the subscription path (sub-shim first on PATH, sdk-shim removed).
# Arm directories are read from the environment: ARM_OURS ARM_BASE ARM_RCP ARM_JD ARM_CV (git-archive copies, see arms.json).
# Set d is taken from the git branch heldout-2026-10-d with `git archive` (never a checkout) into <workdir>/d-src; the script
# builds its fixtures with the set's own build-fixture.sh and never prints a task, prompt or criterion.
# Fixtures for the public set come from make-fixtures.sh (needs RECEIPTS_PLUGIN, JD_PLUGIN, GAP_REPO and network for tj/co).
set -uo pipefail
W=$1; SET=$2; P=${3:-3}; N=${4:-3}; ARMS_LIST=${5:-"OURS BASE RCP RCP_I JD JD_I CV CV_I"}; export H2H_MODEL=${6:-sonnet}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd); REPO=$(cd "$H2H/../.." && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
export H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_GUARD=$W/guard H2H_HOME_ROOT=$W/homes
mkdir -p "$H2H_RUNS"
[ -f "$H2H_GUARD/config.base" ] || "$H2H/guard.sh" init "$H2H_GUARD"
if [ "$SET" = d ]; then
  if [ ! -d "$W/d-src" ]; then
    mkdir -p "$W/d-src"; git -C "$REPO" archive heldout-2026-10-d bench/head-to-head/heldout-d | tar -x -C "$W/d-src" || exit 1
  fi
  D=$W/d-src/bench/head-to-head/heldout-d
  export H2H_TASKS=$D/tasks.json
  if [ ! -f "$W/fixtures.done" ]; then
    mkdir -p "$H2H_FIXTURES"
    python3 - "$D" "$H2H_FIXTURES" > "$W/fixture-plan.txt" <<'PY'
import json, os, sys
d, fx = sys.argv[1], sys.argv[2]
cfg = json.load(open(os.path.join(d, "tasks.json")))
for tid, t in cfg["tasks"].items():
    print(tid, t["fixture"])
PY
    while read -r tid fix; do
      src=$(ls -d "$D"/d* 2>/dev/null | while read -r x; do [ -f "$x/build-fixture.sh" ] && echo "$x"; done | grep -i "/${tid}$" | head -1)
      [ -n "$src" ] || src=$(ls -d "$D"/"$(echo "$tid" | tr 'A-Z' 'a-z')" 2>/dev/null)
      [ -n "$src" ] || { echo "no builder folder for $tid" >&2; exit 1; }
      bash "$src/build-fixture.sh" "$H2H_FIXTURES/$fix" > "$W/build-$tid.log" 2>&1 || { echo "fixture build failed for $tid (see $W/build-$tid.log)" >&2; exit 1; }
    done < "$W/fixture-plan.txt"
    touch "$W/fixtures.done"
  fi
  TASKS_LIST=$(python3 -c "import json,sys;print(' '.join(json.load(open('$D/tasks.json'))['tasks']))")
else
  unset H2H_TASKS
  if [ ! -f "$W/fixtures.done" ]; then
    : "${RECEIPTS_PLUGIN:?}" "${JD_PLUGIN:?}" "${GAP_REPO:?}"
    "$H2H/make-fixtures.sh" "$H2H_FIXTURES" ${TJ_CO_SOURCE:-} > "$W/fixtures.log" 2>&1 || { echo "make-fixtures failed (see $W/fixtures.log)" >&2; exit 1; }
    touch "$W/fixtures.done"
  fi
  TASKS_LIST="T1 T2 T3 T4 T5 T6 T7 T8"
fi
for t in $TASKS_LIST; do for a in $ARMS_LIST; do for n in $(seq 1 "$N"); do
  [ -f "$H2H_RUNS/$t-$a-$n/DONE" ] || echo "$t $a $n"
done; done; done | xargs -P "$P" -L 1 "$H2H/run-one.sh"
python3 "$H2H/failed-cells.py" "$H2H_RUNS" | tee "$W/failed-cells.txt"
[ -f "$H2H_GUARD/STOP" ] && { echo "guard STOP present"; exit 1; }
[ -s "$W/failed-cells.txt" ] && exit 3
exit 0
