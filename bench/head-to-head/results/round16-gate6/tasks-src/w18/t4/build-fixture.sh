#!/usr/bin/env bash
REPO_URL=https://github.com/DaveGamble/cJSON; PIN=12c4bf1986c288950a3d06da757109a6aa1ece38
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
E="Ewa Kowalska"; EE="ewa@example.invalid"
GH="GitHub"; GHE="noreply@github.com"
DEP="dependabot[bot]"; DEPE="49699333+dependabot[bot]@users.noreply.github.com"

# Q2 in Pacific time (2026-07-01 00:30 UTC is 2026-06-30 17:30 PDT)
ap cJSON.c "/* NULL check in cJSON_Delete */"
c "Dmitri Volkov" dmitri@example.invalid 2026-06-30T17:30:00-0700 "Fix NULL check in cJSON_Delete"

# mailing-list patch written 20 Jun, applied by the maintainer 8 Jul
ap cJSON.c "/* print_number: avoid integer overflow */"
c "Beatriz Alves" beatriz@example.invalid 2026-06-20T10:00:00+0000 $'Fix integer overflow in print_number\n\nSigned-off-by: Beatriz Alves <beatriz@example.invalid>\nReported-by: Hugo Lemaire <hugo@example.invalid>\nReviewed-by: Sana Iqbal <sana@example.invalid>' "$E" $EE 2026-07-08T16:00:00+0000

ap cJSON.h "/* cJSON_GetNumberValueOr */"
ap cJSON.c "/* cJSON_GetNumberValueOr */"
c "Jun Takeda" jun@work.example.invalid 2026-07-14T09:00:00+0000 "Add cJSON_GetNumberValueOr" "$GH" $GHE 2026-07-14T09:00:00+0000

# Sana: branch with a merge-from-master commit, then a merge commit by the maintainer
G checkout -q -b fix-nesting
ap cJSON.c "/* nesting limit check for arrays */"
c "Sana Iqbal" sana@example.invalid 2026-07-20T12:00:00+0000 "Enforce the nesting limit in array parsing"
G checkout -q fixture
ap CHANGELOG.md "- unreleased: nesting fixes"
c "$E" $EE 2026-07-21T09:00:00+0000 "Update the changelog"
G checkout -q fix-nesting
GIT_AUTHOR_NAME="Sana Iqbal" GIT_AUTHOR_EMAIL=sana@example.invalid GIT_AUTHOR_DATE=2026-07-21T18:00:00+0000 \
GIT_COMMITTER_NAME="Sana Iqbal" GIT_COMMITTER_EMAIL=sana@example.invalid GIT_COMMITTER_DATE=2026-07-21T18:00:00+0000 \
G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "Merge branch 'master' into fix-nesting" fixture
G checkout -q fixture
GIT_AUTHOR_NAME="$E" GIT_AUTHOR_EMAIL=$EE GIT_AUTHOR_DATE=2026-07-23T09:00:00+0000 \
GIT_COMMITTER_NAME="$E" GIT_COMMITTER_EMAIL=$EE GIT_COMMITTER_DATE=2026-07-23T09:00:00+0000 \
G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "Merge pull request #640 from sana/fix-nesting" fix-nesting
G branch -q -D fix-nesting

w .mailmap <<'MM'
Jun Takeda <jun@work.example.invalid> <jun.takeda@home.example.invalid>
MM
c "$E" $EE 2026-08-01T10:00:00+0000 "Add a mailmap"

ap .github/workflows/CI.yml "# actions/checkout v5"
c "$DEP" "$DEPE" 2026-08-05T03:00:00+0000 "Bump actions/checkout from 4 to 5"

ap cJSON.c "/* free the parse buffer on error */"
c "Roberto Botelho" roberto@example.invalid 2026-08-11T08:00:00+0000 "Fix a leak in cJSON_ParseWithOpts" "$E" $EE 2026-08-11T12:00:00+0000

ap tests/misc_tests.c "/* GetNumberValueOr test */"
c "jtakeda" jun.takeda@home.example.invalid 2026-08-19T20:00:00+0000 "Test cJSON_GetNumberValueOr" "$GH" $GHE 2026-08-19T20:00:00+0000

ap cJSON.c "/* big numbers compare equal */"
c "$E" $EE 2026-08-27T09:00:00+0000 $'Support big numbers in cJSON_Compare (#633)\n\nCo-authored-by: Yusuf Demir <yusuf@example.invalid>\nCo-authored-by: Sana Iqbal <sana@example.invalid>'

ap CMakeLists.txt "# version bump 1.7.19-dev"
c "cjson-ci-bot" ci-bot@example.invalid 2026-09-01T00:05:00+0000 "chore: automated version bump [skip ci]"

ap README.md "
See the nesting limit section."
c "Sana Iqbal" sana.iqbal@uni.example.invalid 2026-09-03T14:00:00+0000 "Document the nesting limit" "$GH" $GHE 2026-09-03T14:00:00+0000

ap cJSON.c "/* ParseWithLength bounds */"
c "$E" $EE 2026-09-15T09:00:00+0000 "Check bounds in cJSON_ParseWithLength"

# 2026-09-30 23:30 PDT is 2026-10-01 06:30 UTC: still Q3 in Pacific time
ap cJSON.h "/* doxygen */"
c "Lucas Pereira" lucas@example.invalid 2026-09-30T23:30:00-0700 "Add Doxygen comments to cJSON.h"

ap CHANGELOG.md "- 1.7.19 notes"
c "$E" $EE 2026-10-02T09:00:00+0000 "Prepare 1.7.19"
finish
