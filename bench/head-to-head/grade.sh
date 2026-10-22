#!/bin/bash
# usage: grade.sh <grade-dir>   (after assemble_grade.py) - one blind Sonnet call per task, JSON to <task>-grade.json
set -euo pipefail
G=$1
for f in "$G"/T*-prompt.txt; do
  t=$(basename "$f" -prompt.txt)
  claude -p --model "${H2H_GRADER_MODEL:-sonnet}" --setting-sources project --strict-mcp-config --tools "" < "$f" > "$G/$t-grade.json" 2> "$G/$t-grade.err" || true
done
