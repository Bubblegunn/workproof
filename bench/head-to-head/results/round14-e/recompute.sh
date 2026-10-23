#!/bin/bash
# Recomputes every score table and the F6-grader comparison of SUMMARY.md from grades/ and tasks/ (no network, no model call). Run from this folder.
set -e
cd "$(dirname "$0")"
T=$(mktemp -d)
ln -s "$PWD/grades/heldout-e/votes" "$T/votes"
echo '### Set heldout-e, five-vote scores (outcome criteria only)'
echo '```'
python3 -I score.py "$T/votes" tasks/heldout-e/tasks.json --labels tasks/heldout-e/labels.json --seed r14-final
echo '```'
echo
mkdir -p "$T/w/f6"; ln -s "$PWD/grades/heldout-e/votes" "$T/w/grades"
cp grades/heldout-e/f6/sample.txt "$T/w/f6/sample.txt"
for v in grades/heldout-e/f6/votes/v*; do ln -s "$PWD/$v" "$T/w/f6/$(basename "$v")"; done
echo '### F6-grader (fresh Opus votes against the original majority, sampled cells)'
echo '```'
python3 -I f6-grader.py "$T/w" tasks/heldout-e/tasks.json compare
echo '```'
rm -rf "$T"
