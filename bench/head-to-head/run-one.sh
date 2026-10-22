#!/bin/bash
# usage: run-one.sh <task T1..T8> <arm> <n>
# Environment (all absolute paths):
#   H2H_FIXTURES  the folder make-fixtures.sh wrote (F1, F3, F4, F7, F8)
#   H2H_RUNS      where run folders go
#   ARM_OURS ARM_BASE ARM_RCP ARM_JD ARM_GAP  plugin directories (BASE is an empty plugin)
#   Arms: OURS BASE RCP JD GAP and the invoked arms RCP_I JD_I GAP_I (plugin of the same name; JD_I also gets fixtures/portfolio-bank.md).
#   H2H_HOME_ROOT where the per-run temporary HOME folders are made (run.sh); H2H_GUARD a folder for guard.sh (hooks and mcpServers tripwire)
#   H2H_MODEL     default sonnet
#   OURS runs put bench/head-to-head/shim first on PATH so `npx workproof` runs ARM_OURS/dist/src/cli.js (build it first).
# Each run gets a fresh copy of its fixture. The transcript is written to <run>/out.jsonl.
set -euo pipefail
T=$1; A=$2; N=${3:-1}
HERE=$(cd "$(dirname "$0")" && pwd)
MODEL=${H2H_MODEL:-sonnet}
# An arm ending in _I is the "invoked" arm of a competitor: same plugin, and the prompt names its skill (tasks.json "invoked").
BASEARM=${A%_I}; INVOKED=0; [ "$BASEARM" != "$A" ] && INVOKED=1
VAR=ARM_$BASEARM; P=${!VAR:?set $VAR}
D=$H2H_RUNS/$T-$A-$N; rm -rf "$D"; mkdir -p "$D"
FIX=$(python3 "$HERE/task.py" "$T" fixture)
PROMPT=$(python3 "$HERE/task.py" "$T" prompt "$H2H_FIXTURES")
if [ $INVOKED = 1 ]; then PROMPT="$(python3 "$HERE/task.py" "$BASEARM" invoked) $PROMPT"; fi
case $FIX in
  F4) mkdir -p "$D/fx"; cp -R "$H2H_FIXTURES/F4/home/code/acme-api/." "$D/fx/"; export RECEIPTS_HOME=$H2H_FIXTURES/F4/home;;
  *) cp -R "$H2H_FIXTURES/$FIX" "$D/fx";;
esac
if [ "$A" = "OURS" ]; then
  export H2H_REAL_NPX=$(command -v npx); export H2H_WORKPROOF_CLI=$(cd "$P" && pwd)/dist/src/cli.js
  export PATH="$HERE/shim:$PATH"
fi
if [ "$BASEARM" = "JD" ] && [ $INVOKED = 1 ]; then cp -n "$HERE/fixtures/portfolio-bank.md" "$D/fx/portfolio-bank.md" || true; fi
export HOME_REAL=${HOME_REAL:-$HOME}
if [ -n "${H2H_GUARD:-}" ]; then "$HERE/guard.sh" check "$H2H_GUARD" || { echo "stopped $T $A $N" > "$D/STOPPED"; exit 1; }; fi
bash "$HERE/run.sh" "$D/fx" "$P" "$MODEL" "$D/out.jsonl" "$PROMPT" || true
if [ -n "${H2H_GUARD:-}" ]; then "$HERE/guard.sh" check "$H2H_GUARD" || { echo "config changed during $T $A $N" > "$D/STOPPED"; exit 1; }; fi
echo "done $T $A $N" > "$D/DONE"
