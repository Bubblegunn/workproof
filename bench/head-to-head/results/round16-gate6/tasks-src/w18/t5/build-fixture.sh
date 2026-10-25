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
ap() { mkdir -p "$(dirname "$DEST/$1")"; printf '%s\n' "$2" >> "$DEST/$1"; }
N="Noor Hashemi"; NE="noor@example.invalid"
GH="GitHub"; GHE="noreply@github.com"
DEP="dependabot[bot]"; DEPE="49699333+dependabot[bot]@users.noreply.github.com"

# before the window
ap README.md "
Supports more platforms."
c "Gwen Akhtar" gwen@example.invalid 2026-05-28T10:00:00+0000 "Mention more platforms in the readme" "$N" $NE 2026-05-28T12:00:00+0000

# Lucia: lands, then is reverted and never comes back
w isatty_aix.go <<'T'
//go:build aix

package isatty

func IsTerminal(fd uintptr) bool { return false }
T
c "Lucía Fernández" lucia@example.invalid 2026-06-05T09:00:00+0000 "Add AIX support" "$GH" $GHE 2026-06-05T09:00:00+0000
S1=$(G rev-parse HEAD)

# Kofi: lands, is reverted, then lands again as a reland written by the maintainer
cp "$DEST/isatty_plan9.go" "$DEST/.plan9.orig"
ap isatty_plan9.go "// treat named pipes as non-terminals"
c "Kofi Mensah" kofi@example.invalid 2026-06-08T09:00:00+0000 "Fix isatty on plan9 pipes" "$GH" $GHE 2026-06-08T09:00:00+0000
S2=$(G rev-parse HEAD)
mv "$DEST/.plan9.orig" "$DEST/isatty_plan9.go"
c "$N" $NE 2026-06-12T10:00:00+0000 "$(printf 'Revert "Fix isatty on plan9 pipes"\n\nThis reverts commit %s.\nThe new test fails on plan9.' "$S2")"
rm "$DEST/isatty_aix.go"
c "$N" $NE 2026-06-20T10:00:00+0000 "$(printf 'Revert "Add AIX support"\n\nThis reverts commit %s.\nIt breaks the build on 32-bit targets.' "$S1")"
ap isatty_plan9.go "// treat named pipes as non-terminals (test fixed)"
ap isatty_others_test.go "// plan9 pipe test"
c "$N" $NE 2026-06-25T10:00:00+0000 $'Reland "Fix isatty on plan9 pipes"\n\nOriginal change by Kofi Mensah, with the test fixed.\n\nCo-authored-by: Kofi Mensah <kofi@example.invalid>'

ap .github/workflows/test.yml "# setup-go v6"
c "$DEP" "$DEPE" 2026-07-01T03:00:00+0000 "Bump actions/setup-go from 5 to 6"
ap isatty_others.go "// simplified"
c "$N" $NE 2026-07-02T09:00:00+0000 "Simplify the fallback implementation"

ap isatty_windows.go "// pseudo-console handles"
ap isatty_windows_test.go "// pseudo-console test"
c "$N" $NE 2026-07-14T09:00:00+0000 $'Detect Windows pseudo-console handles (#98)\n\nCo-Authored-By: Dana Whitfield <dana@example.invalid>\nCo-authored-by: Hiro Saito <hiro@example.invalid>\nCo-authored-by: copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>\nCo-authored-by: Noor Hashemi <noor@example.invalid>\nReviewed-by: Petra Novak <petra@example.invalid>\nTested-by: Quentin Dube <quentin@example.invalid>'

# Fatima: authored 2 Aug, rebased by the maintainer, landed 4 Aug; the maintainer then fixes a typo
ap doc.go "// Build constraints: see the go:build lines."
c "Fatima Rahman" fatima@example.invalid 2026-08-02T09:00:00+0000 "Document the build constraints" "$N" $NE 2026-08-04T09:00:00+0000
ap doc.go "// (typo fixed)"
c "$N" $NE 2026-08-05T09:00:00+0000 $'Fix a typo in the build constraints doc\n\nFollow-up to Fatima Rahman\'s change.'

ap isatty_others_test.go "// pedro: non-tty file"
c "Pedro Alves" pedro@example.invalid 2026-08-20T15:00:00+0000 "Test a regular file is not a terminal" "$GH" $GHE 2026-08-20T15:00:00+0000
ap isatty_windows_test.go "// hiro: console test"
c "Hiro Saito" hiro@example.invalid 2026-09-10T09:00:00+0000 "Add a Windows console test" "$GH" $GHE 2026-09-10T09:00:00+0000
ap isatty_others_test.go "// palves: closed fd"
c "palves" pedro@example.invalid 2026-09-18T15:00:00+0000 "Test a closed descriptor is not a terminal" "$GH" $GHE 2026-09-18T15:00:00+0000
ap go.mod "// go 1.21"
c "$N" $NE 2026-10-05T09:00:00+0000 "Prepare the next release"
finish
