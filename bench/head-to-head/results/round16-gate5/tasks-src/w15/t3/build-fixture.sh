#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/is-plain-obj; PIN=97f38e8836f86a642cce98fc6ab3058bc36df181
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

# ---- lab history -------------------------------------------------------
# gen <file> <prefix> <n>: n distinct lines of plausible module code
gen() { mkdir -p "$(dirname "$DEST/$1")"; : > "$DEST/$1"; for i in $(seq 1 "$3"); do echo "export const $2$i = (value) => value !== undefined && value !== $i;" >> "$DEST/$1"; done; }
GH="GitHub"; GHM="noreply@github.example"

gen lab/ingest.js base 60
c "Frank Ito" frank.ito@lab.example "2025-01-20T10:00:00+0000" "Add ingestion skeleton"

gen lab/csv.js csv 120
c "Gita Rao" gita.rao@univ.example "2025-03-04T15:00:00+0000" "$(printf 'Add CSV reader (#1)\n\nReads the field-station exports.\n\nCo-authored-by: Hamid Aziz <hamid.aziz@lab.example>')" "$GH" "$GHM" "2025-03-10T09:00:00+0000"

gen lab/schema.js schema 90
c "Hamid Aziz" hamid.aziz@lab.example "2025-05-02T11:00:00+0000" "$(printf 'Add schema validation (#2)\n\nCo-authored-by: Gita Rao <gita.rao@univ.example>\nCo-authored-by: Ines Kuhn <ines.kuhn@students.example>\nReviewed-by: Frank Ito <frank.ito@lab.example>\nSigned-off-by: Hamid Aziz <hamid.aziz@lab.example>')" "$GH" "$GHM" "2025-05-06T09:00:00+0000"

echo "// bump" >> "$DEST/lab/ingest.js"
c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.example" "2025-05-19T04:00:00+0000" "Bump the dev-dependencies group (#3)" "$GH" "$GHM" "2025-05-19T08:00:00+0000"

gen lab/units.js unit 45
c "Ines Kuhn" ines.kuhn@students.example "2025-07-08T16:00:00+0000" "$(printf 'Add unit conversion (#4)\n\nco-authored-by: Hamid Aziz <hamid.aziz@personal.example>')" "$GH" "$GHM" "2025-07-14T09:00:00+0000"

gen lab/stream.js stream 70
c "Jorge Vidal" jorge.vidal@partner.example "2025-08-20T10:00:00+0000" "Add streaming parser (#5)" "$GH" "$GHM" "2025-08-25T09:00:00+0000"

G rm -q lab/stream.js
c "Frank Ito" frank.ito@lab.example "2025-09-02T12:00:00+0000" "$(printf 'Revert "Add streaming parser (#5)"\n\nThis reverts commit for #5; it broke the validation step.')"

G checkout -q -b docs-fix
printf '\nSee lab/ for the ingestion code.\nData files are described in the data-management plan.\n' >> "$DEST/readme.md"
c "Lena Fischer" lena.fischer@lab.example "2025-10-03T10:00:00+0000" "docs: describe lab/ in the readme"
G checkout -q fixture
GIT_AUTHOR_NAME="Frank Ito" GIT_AUTHOR_EMAIL=frank.ito@lab.example GIT_AUTHOR_DATE="2025-10-06T09:00:00+0000" \
GIT_COMMITTER_NAME="Frank Ito" GIT_COMMITTER_EMAIL=frank.ito@lab.example GIT_COMMITTER_DATE="2025-10-06T09:00:00+0000" \
G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "Merge pull request #6 from lab/docs-fix" docs-fix
G branch -q -D docs-fix

echo "export const VERSION = '1.0.0';" > "$DEST/lab/version.js"
c "Frank Ito" frank.ito@lab.example "2025-11-30T18:00:00+0000" "Freeze for submission"

gen lab/parquet.js parquet 80
c "Kira Lund" kira.lund@lab.example "2026-02-04T10:00:00+0000" "$(printf 'Add Parquet writer (#7)\n\nCo-authored-by: Gita Rao <gita.rao@univ.example>')" "$GH" "$GHM" "2026-02-11T09:00:00+0000"

echo "// handle empty rows" >> "$DEST/lab/csv.js"
c "Gita Rao" gita.rao@univ.example "2026-03-03T10:00:00+0000" "csv: handle empty rows"

finish
