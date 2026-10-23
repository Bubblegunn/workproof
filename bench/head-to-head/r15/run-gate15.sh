#!/bin/bash
# usage: run-gate15.sh <workdir> [parallel=3] [runs=3]
# Round 15 development gate: writers' tasks (groups W1 W2 W3) with arms "OURS BASE RCP RCP_I CV CV_I"; read sets d and e (groups D E) with
# arms "OURS BASE RCP_I CV_I". Environment: ARM_OURS ARM_BASE ARM_RCP ARM_CV; W1_STAGE W2_STAGE W3_STAGE D_SRC E_SRC FIX_D FIX_E for the first call.
set -uo pipefail
W=$1; P=${2:-3}; N=${3:-3}; export H2H_MODEL=sonnet
HERE=$(cd "$(dirname "$0")" && pwd); H2H=$(cd "$HERE/.." && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
case $W in /private/tmp/*) ;; *) echo "work folder must be under /private/tmp" >&2; exit 4;; esac
export PATH="/Users/efe/claude-kredi-runs/sub-shim:$(echo "$PATH" | tr ':' '\n' | grep -v 'sdk-shim' | paste -sd: -)"
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN
export HOME_REAL=${HOME_REAL:-$HOME}
export H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_GUARD=$W/guard H2H_HOME_ROOT=$W/homes H2H_TASKS=$W/tasks.json
mkdir -p "$H2H_RUNS"
[ -f "$W/tasks.json" ] || python3 "$HERE/make-gate15.py" "$W" "$W1_STAGE" "$W2_STAGE" "$W3_STAGE" "$D_SRC" "$E_SRC" > "$W/plan.txt" || exit 1
[ -f "$H2H_GUARD/config.base" ] || "$H2H/guard.sh" init "$H2H_GUARD"
python3 - "$W" "$N" "${ARMS_ONLY:-}" <<'PY' | while read -r t a n; do [ -f "$H2H_RUNS/$t-$a-$n/DONE" ] || echo "$t $a $n"; done | xargs -P "$P" -L 1 "$H2H/run-one.sh"
import json, sys
W, N = sys.argv[1], int(sys.argv[2]); only = sys.argv[3].split()
g = json.load(open(f"{W}/groups.json"))
for grp, tids in g.items():
    arms = ["OURS", "BASE", "RCP_I", "CV_I"] if grp in ("D", "E") else ["OURS", "BASE", "RCP", "RCP_I", "CV", "CV_I"]
    for t in tids:
        for a in arms:
            if only and a not in only: continue
            for n in range(1, N + 1): print(t, a, n)
PY
python3 "$H2H/dev/failed-cells-any.py" "$H2H_RUNS" | tee "$W/failed-cells.txt"
[ -f "$H2H_GUARD/STOP" ] && { echo "guard STOP present"; exit 1; }
[ -s "$W/failed-cells.txt" ] && exit 3
exit 0
