#!/bin/bash
# usage: validate-e.sh <stage-dir> <scratch-dir>
# Builds every fixture twice with the writer's build-fixture.sh, checks that HEAD is identical, runs truth.py and compares its
# output with truth.txt. Prints only OK/DIFF lines per task; never prints a prompt, a truth or a criterion.
set -uo pipefail
S=$1; T=$2; mkdir -p "$T"; bad=0
for d in "$S"/t[0-9]*/; do
  n=$(basename "$d")
  rm -rf "$T/$n-a" "$T/$n-b"
  bash "$d/build-fixture.sh" "$T/$n-a" >/dev/null 2>&1 || { echo "$n BUILD-FAIL"; bad=1; continue; }
  bash "$d/build-fixture.sh" "$T/$n-b" >/dev/null 2>&1 || { echo "$n BUILD2-FAIL"; bad=1; continue; }
  h1=$(git -C "$T/$n-a" rev-parse HEAD); h2=$(git -C "$T/$n-b" rev-parse HEAD)
  [ "$h1" = "$h2" ] || { echo "$n HEAD-DIFFERS"; bad=1; continue; }
  python3 -I "$d/truth.py" "$T/$n-a" > "$T/$n-truth.out" 2>/dev/null
  if diff -q "$T/$n-truth.out" "$d/truth.txt" >/dev/null; then echo "$n OK head=${h1:0:10}"; else echo "$n TRUTH-DIFF"; bad=1; fi
done
exit $bad
