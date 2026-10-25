#!/usr/bin/env bash
REPO_URL=https://github.com/google/uuid; PIN=2d3c2a9cc518326daf99a383f07c4d3c44317e4d
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
# --- helpers added by the task author (below the required header) ---
# gen <file> <prefix> <count> <printf-format taking name,i,name,i>: append count unique lines
gen() { local f="$DEST/$1" p="$2" n="$3" fmt="$4" i=1; mkdir -p "$(dirname "$f")"
  while [ $i -le $n ]; do printf "$fmt
" "$p" $i "$p" $i; i=$((i+1)); done >> "$f"; }
# M <branch> <name> <email> <date> <message>: no-ff merge
M() { GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"; }
# subst <file> <sed-expr>: portable in-place sed
subst() { sed "$2" "$DEST/$1" > "$DEST/$1.tmp" && mv "$DEST/$1.tmp" "$DEST/$1"; }
# ---- t2: migration to the new store in internal/store ----
PN="Priya Raman"; PE1="priya.raman@example.com"; PE2="praman@corp.example.invalid"
TN="Tom Becker"; TE="tom@example.net"
LN="Lena Ortiz"; LE="lena@example.org"
BN="dependabot[bot]"; BE="49699333+dependabot[bot]@users.noreply.example"
GO='const %s_%03d = "%s_%03d"'
gen docs/migration-plan.md PLAN 30 "%s_%03d: step %s_%03d"
c "$TN" "$TE" "2025-12-18T15:00:00-08:00" "docs: migration plan for the new store"
gen internal/store/store.go IFACE 20 "$GO"
c "$PN" "$PE1" "2025-12-31T20:30:00-08:00" "migrate: add store interface"
gen docs/migration-plan.md ROLLOUT 15 "%s_%03d: phase %s_%03d"
c "$PN" "$PE1" "2026-01-05T09:00:00-08:00" "docs: add rollout phases to the migration plan"
gen internal/store/sqlite.go SQLITE 40 "$GO"
c "$PN" "$PE1" "2026-01-12T10:00:00-08:00" "migrate: sqlite backend"
echo "// bump x/sys 1" >> "$DEST/go.mod"
c "$BN" "$BE" "2026-01-15T03:00:00+00:00" "build(deps): bump golang.org/x/sys from 0.1.0 to 0.2.0"
gen internal/store/read.go READ 25 "$GO"
c "$LN" "$LE" "2026-01-20T09:00:00-06:00" "migrate: port reads to the new store"
gen internal/store/write.go WRITE 30 "$GO"
c "$PN" "$PE1" "2026-02-03T11:00:00-08:00" "migrate: port writes"
gen internal/store/batch.go BATCH 15 "$GO"
c "$PN" "$PE1" "1970-01-01T00:00:00+00:00" "migrate: add batch writer"
gen internal/store/metrics.go METRICS 10 "$GO"
c "$TN" "$TE" "2026-02-12T10:00:00-08:00" "migrate: add metrics hooks"
gen internal/store/backfill.go BACKFILL 35 "$GO"
c "$PN" "$PE2" "2026-02-20T09:30:00-08:00" "migrate: backfill tool"
echo "// bump x/sys 2" >> "$DEST/go.mod"
c "$BN" "$BE" "2026-02-25T03:00:00+00:00" "build(deps): bump golang.org/x/sys from 0.2.0 to 0.3.0"
gen internal/store/dual.go DUAL 20 "$GO"
c "$PN" "$PE2" "2026-03-02T10:00:00-08:00" "migrate: dual-write mode"
G checkout -q -b priya-store-cutover
gen internal/store/cutover.go CUTOVER 12 "$GO"
c "$PN" "$PE2" "2026-03-05T10:00:00-08:00" "migrate: cutover flag"
gen internal/store/cutover_test.go CUTTEST 18 "$GO"
c "$PN" "$PE2" "2026-03-08T16:00:00-07:00" "migrate: cutover tests"
G checkout -q fixture
gen docs/runbook.md RUNBOOK 10 "%s_%03d: %s_%03d"
c "$TN" "$TE" "2026-03-06T08:00:00-08:00" "docs: update runbook for cutover"
M priya-store-cutover "$LN" "$LE" "2026-03-10T12:00:00+00:00" "Merge pull request #52 from priya/store-cutover"
G branch -q -D priya-store-cutover
gen internal/store/cutover.go DEFAULTNEW 3 "$GO"
c "$PN" "$PE2" "2026-03-12T10:00:00-07:00" "cutover: switch default to new store"
G revert --no-commit HEAD
c "$TN" "$TE" "2026-03-14T08:00:00-07:00" 'Revert "cutover: switch default to new store"

Incident: readers saw a nil cursor under load.'
gen internal/store/cutover.go DEFAULTFIX 4 "$GO"
c "$PN" "$PE2" "2026-03-31T19:30:00-07:00" "cutover: re-land default switch with nil cursor fix"
gen internal/store/cutover_test.go CURSORTEST 6 "$GO"
c "$PN" "$PE2" "2026-03-31T21:00:00-07:00" "cutover: regression test for nil cursor"
gen internal/store/cleanup.go CLEANUP 8 "$GO"
c "$PN" "$PE2" "2026-04-02T10:00:00-07:00" "migrate: remove legacy store code"
finish
