#!/bin/bash
# Recomputes every score table of SUMMARY.md from grades/ and tasks/ (no network, no model call). Run from this folder.
set -e
cd "$(dirname "$0")"
T=$(mktemp -d)
for set in public heldout-d; do
  for n in 5 3; do
    rm -rf "$T/votes"; mkdir -p "$T/votes"
    for v in $(seq 1 $n); do ln -s "$PWD/grades/$set/votes/v$v" "$T/votes/v$v"; done
    echo "### Set $set, first $n votes (outcome criteria only)"
    echo '```'
    python3 -I score.py "$T/votes" "tasks/$set/tasks.json" --labels "tasks/$set/labels.json" --seed r13-final
    echo '```'
    echo
  done
done
rm -rf "$T"
