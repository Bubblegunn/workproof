#!/bin/bash
# One command re-run: fixtures, every run, blind grading, scores.
# usage: rerun.sh <workdir> [parallel=4]
# Needs: claude (Claude Code CLI) logged in, node 22+, git, python3, a built checkout (npm run build), network for the first clone.
# Set the plugin directories first (absolute paths):
#   ARM_OURS  this checkout            ARM_BASE  an empty plugin (a folder with .claude-plugin/plugin.json {"name":"baseline","version":"0.0.0"})
#   ARM_RCP   receipts plugin dir (set it up as its README says; RECEIPTS_HOME is honoured by a one-line patch, see docs/HEAD-TO-HEAD.md)
#   ARM_JD    JD Resume Tailor dir             ARM_GAP   GapToGrowth plugin dir
#   RECEIPTS_PLUGIN  the receipts plugin dir used to build fixture F4; JD_PLUGIN (fixture F7) and GAP_REPO (fixture F8) are the clones of the other two
# Arms: OURS BASE RCP RCP_I JD JD_I GAP GAP_I; tasks T1..T8; 3 runs each. It costs real model usage (about 190 runs).
set -euo pipefail
W=$1; P=${2:-4}; HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$W"; W=$(cd "$W" && pwd)
export H2H_FIXTURES=$W/fixtures H2H_RUNS=$W/runs H2H_MODEL=${H2H_MODEL:-sonnet}
"$HERE/make-fixtures.sh" "$H2H_FIXTURES" ${TJ_CO_SOURCE:-}
mkdir -p "$H2H_RUNS"
for t in T1 T2 T3 T4 T5 T6 T7 T8; do for a in OURS BASE RCP RCP_I JD JD_I GAP GAP_I; do for n in 1 2 3; do echo "$t $a $n"; done; done; done \
  | xargs -P "$P" -L 1 "$HERE/run-one.sh"
python3 "$HERE/assemble.py" "$H2H_RUNS" "$W/grade" "${H2H_SEED:-rerun}" "$H2H_FIXTURES"
"$HERE/grade.sh" "$W/grade"
python3 "$HERE/score.py" "$W/grade" "$H2H_RUNS" | tee "$W/results.md"
