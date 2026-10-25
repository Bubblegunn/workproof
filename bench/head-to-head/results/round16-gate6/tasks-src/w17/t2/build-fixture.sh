#!/usr/bin/env bash
REPO_URL=https://github.com/mattn/go-isatty; PIN=a7c02353c47bc4ec6b30dc9628154ae4fe760c11
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

# ---- synthetic history ----
ap() { printf '%s\n' "$2" >> "$DEST/$1"; }
# ch <author-name> <author-email> <author-date> <message> [committer-name committer-email committer-date]
ch() { ap CHANGES.txt "$4"; c "$@"; }
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"
}
ANA="Ana Kim"; AE=ana@example.com
JOON="Joon Park"; JE1=joon@example.kr; JE2=joon.park@example.com
MARA="Mara Ruiz"; ME=mara@example.com
TOM="Tomas Berg"; TE=tomas@example.com
GHN=GitHub; GHE=noreply@github.com

ch "$ANA" $AE "2025-12-31T19:30:00-0500" "Prepare year-end release notes"
ch "$ANA" $AE "2026-01-05T09:00:00-0500" "Document tty detection on aix"
ch "$JOON" $JE1 "2026-01-07T23:15:00+0900" "Handle cygwin pty names"
ch "$ANA" $AE "2026-01-13T03:10:00+0000" "Fix typo in doc comment"
ch "$JOON" $JE2 "2026-02-14T11:00:00-0500" "Add plan9 note"
ch "$ANA" $AE "2026-02-20T19:59:59-0500" "Refresh example"
ch "$ANA" $AE "2026-02-20T20:00:00-0500" "Refresh example output"
ch "$MARA" $ME "2026-02-23T08:00:00-0500" "Bump go.mod directive"
ch "$MARA" $ME "2026-03-09T12:30:00+0000" "Clarify solaris build tag"
ch "$MARA" $ME "2026-03-10T00:30:00+0000" "Add windows console test note"
ch "$ANA" $AE "2026-04-14T14:00:00-0400" "Rework tiocgwinsz helper docs" "$ANA" $AE "2026-04-18T22:00:00-0400"
ch "$MARA" $ME "2026-04-19T23:00:00-0400" "Tidy bsd constants" "$MARA" $ME "2026-04-20T10:00:00-0400"
ch "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.github.com" "2026-05-04T07:00:00+0000" "Bump golang.org/x/sys from 0.28.0 to 0.29.0" "$GHN" $GHE "2026-05-04T07:00:00+0000"
ch "$JOON" $JE1 "2026-05-17T10:00:00-0400" "Add fuzz seed for fd checks"
ch "$MARA" $ME "2026-05-26T10:00:00-0400" "Update CI matrix"
ch "$TOM" $TE "2026-05-20T03:00:00-0400" "Remove unused helper"
G checkout -q -b feat-pty
ch "$JOON" $JE2 "2026-05-30T23:00:00-0400" "Detect ptys on freebsd"
G checkout -q fixture
mg feat-pty "$ANA" $AE "2026-06-01T09:00:00-0400" "Merge pull request #88 from joon/freebsd-pty"
G branch -q -D feat-pty
ch "$MARA" $ME "2026-06-30T20:30:00-0700" "Prepare 0.0.21 notes"
ch "$ANA" $AE "2026-07-01T00:10:00-0400" "Post-release housekeeping"
ch "$TOM" $TE "2026-06-02T10:00:00-0400" "Update LICENSE year" "$TOM" $TE "2027-03-02T10:00:00-0500"
finish
