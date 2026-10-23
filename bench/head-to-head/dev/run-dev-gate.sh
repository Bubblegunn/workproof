#!/bin/bash
# usage: run-dev-gate.sh <workdir> <ours-dir> <rcp-dir> <base-dir> [parallel=3] [runs-per-cell=3] [tasks="T11 ... T16"] [arms="OURS BASE RCP RCP_I"]
# Round 13 development gate runner. Every claude call goes through the subscription wrapper (sub-shim first on PATH).
# <ours-dir> is a built git-archive copy of the product commit, <rcp-dir> a git-archive copy of the receipts plugin with a
# minimal .claude-plugin/plugin.json, <base-dir> an empty plugin. Stops (exit 1) on any guard change; failed cells are
# listed by failed-cells.py afterwards and never graded.
set -uo pipefail
W=$1; export ARM_OURS=$2 ARM_RCP=$3 ARM_BASE=$4; P=${5:-3}; N=${6:-3}
TASKS_LIST=${7:-"T11 T12 T13 T14 T15 T16"}; ARMS_LIST=${8:-"OURS BASE RCP RCP_I"}
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
export H2H_TASKS=$HERE/dev-tasks.json H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_MODEL=${H2H_MODEL:-sonnet} H2H_GUARD=$W/guard H2H_HOME_ROOT=$W/homes
[ -d "$H2H_FIXTURES/HCV1" ] || node "$HERE/make-dev-fixtures.mjs" "$H2H_FIXTURES" > "$W/fixtures.log" || exit 1
mkdir -p "$H2H_RUNS"
[ -f "$H2H_GUARD/config.base" ] || "$H2H/guard.sh" init "$H2H_GUARD"
for t in $TASKS_LIST; do for a in $ARMS_LIST; do for n in $(seq 1 "$N"); do
  [ -f "$H2H_RUNS/$t-$a-$n/DONE" ] || echo "$t $a $n"
done; done; done | xargs -P "$P" -L 1 "$H2H/run-one.sh"
python3 "$H2H/failed-cells.py" "$H2H_RUNS" | tee "$W/failed-cells.txt"
[ -f "$H2H_GUARD/STOP" ] && { echo "guard STOP present"; exit 1; }
exit 0
