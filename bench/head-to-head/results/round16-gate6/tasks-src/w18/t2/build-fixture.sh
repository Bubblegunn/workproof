#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/slugify; PIN=d572cba97a8f661d201f4e8bdc0842bc532c9773
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <dest-dir>" >&2; exit 2; }
DEST="$1"; case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
export TZ=UTC LC_ALL=C
rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
git clone -q "$REPO_URL" "$DEST"
G() { git -C "$DEST" "$@"; }
G checkout -q -B fixture "$PIN"
for b in $(G for-each-ref --format='%(refname:short)' refs/heads); do [ "$b" = fixture ] || G branch -q -D "$b"; done
for r in $(G remote); do G remote remove "$r"; done
for t in $(G tag -l); do G tag -d "$t" >/dev/null; done
# c <author-name> <author-email> <author-date> <message> [committer-name committer-email committer-date]
c() {
  G add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q --allow-empty -m "$4"
}
finish() {
  G branch -q -m fixture main
  G reflog expire --expire=now --all
  G gc -q --prune=now
  echo "HEAD $(G rev-parse HEAD)"
}
w() { mkdir -p "$(dirname "$DEST/$1")"; cat > "$DEST/$1"; }
ap() { mkdir -p "$(dirname "$DEST/$1")"; printf '%s\n' "$2" >> "$DEST/$1"; }
P="Priscilla Oduya"; PE="priscilla@example.invalid"

# 2025: people who already contributed before this year
ap readme.md "
Separators can be any string."
c "Zoë Lindqvist" zoe@example.invalid 2025-04-03T12:00:00+0000 "Document custom separators" "$P" $PE 2025-04-03T15:00:00+0000
ap index.js "// custom separators also apply to non-latin input"
c "Elena Marchetti" elena@oldjob.example.invalid 2025-06-10T09:00:00+0000 "Apply the separator option to non-latin input" "$P" $PE 2025-06-11T09:00:00+0000
ap index.js "// ligature handling stays as before"
c "$P" $PE 2025-08-14T10:00:00+0000 $'Support custom separators for unicode (#31)\n\nCo-authored-by: Chloé Martin <chloe@example.invalid>'
ap test.js "// december regression test"
c "Kenji Mori" kenji@example.invalid 2025-12-31T23:40:00+0900 "Add a regression test for repeated separators" "$P" $PE 2025-12-31T23:55:00+0900

# 2026
ap test.js "// first test of the new year"
c "Nadia Petrova" nadia@example.invalid 2026-01-01T00:20:00+0900 "Test slugify with an empty string" "$P" $PE 2026-01-01T00:20:00+0900
ap index.js "// elena: preserve case for acronyms"
c "Elena Marchetti" elena.marchetti@example.invalid 2026-02-10T08:30:00+0000 "Keep acronyms upper case when lowercase is false"
ap index.js "// drop deprecated option"
c "renovate[bot]" 29139614+renovate[bot]@users.noreply.github.com 2026-03-01T03:00:00+0000 "Update dependency xo to v1"
ap test.js "// kenji: multiple dashes"
c "Kenji Mori" kenji@example.invalid 2026-03-15T11:00:00+0900 "Collapse multiple dashes in the middle of a string"
ap index.js "// ligature replacement is overridable"
c "$P" $PE 2026-04-02T10:00:00+0000 $'Add overridable replacement for ligatures (#40)\n\nCo-authored-by: Rahul Verma <rahul@example.invalid>'
ap readme.md "
The zoe option explains ascii folding."
c "Zoe Lindqvist" zoe@example.invalid 2026-05-04T14:00:00+0000 "Explain ASCII folding in the readme"
ap index.js "// chloe: trim leading separators"
c "Chloé Martin" chloe@example.invalid 2026-06-01T10:00:00+0000 "Trim leading separators"
ap index.js "// jonas: handle numbers"
c "Jonas Berg" jonas@example.invalid 1980-01-01T00:00:00+0000 "Do not split digits from letters" "$P" $PE 2026-06-15T09:00:00+0000
ap test.js "// samira: apostrophes"
c "Samira Ndiaye" samira@example.invalid 2026-08-21T09:00:00+0000 "Treat apostrophes as part of the word" "$P" $PE 2026-08-24T09:00:00+0000
ap readme.md "
Release notes live on GitHub."
c "$P" $PE 2026-09-20T09:00:00+0000 "Point the readme to the release notes"
finish
