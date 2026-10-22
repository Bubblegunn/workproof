#!/bin/bash
# usage: archive.sh <runs-dir> <grade-dir> <out.tar.gz> [extra file or folder ...]
# Packs every transcript (out.jsonl), the files each run left behind (without the cloned fixture history), the grader prompts,
# packets, label maps and grades (Gmail addresses redacted), so anyone can re-read and re-grade a round without re-running it.
set -euo pipefail
RUNS=$1; GRADE=$2; OUT=$3; shift 3
T=$(mktemp -d); mkdir -p "$T/runs" "$T/grade"
for d in "$RUNS"/T*-*; do
  n=$(basename "$d"); mkdir -p "$T/runs/$n"; cp "$d/out.jsonl" "$T/runs/$n/"
  for f in "$d"/fx/*; do b=$(basename "$f")
    case $b in test|tests|src|.git|.gitignore|.travis.yml|History.md|LICENSE|Readme.md|component.json|index.js|package.json) ;; *) [ -f "$f" ] && cp "$f" "$T/runs/$n/";; esac
  done
done
cp "$GRADE"/* "$T/grade/"
for x in "$@"; do cp -R "$x" "$T/"; done
# Redact every Gmail address (the maintainer's own address reaches agent transcripts through git configuration and system context).
# OWNER_LOCAL_PART (optional): the maintainer's account name, also redacted when set.
OWNER_RE=${OWNER_LOCAL_PART:-__no_owner_set__}
find "$T" -type f -exec env OWNER_RE="$OWNER_RE" perl -pi.bak -e 's/[A-Za-z0-9._+-]+\@gmail\.com/REDACTED\@gmail.invalid/gi; s/\Q$ENV{OWNER_RE}\E\d*/REDACTED-ACCOUNT/gi' {} +
find "$T" -name '*.bak' -type f -delete
tar -czf "$OUT" -C "$T" .
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
