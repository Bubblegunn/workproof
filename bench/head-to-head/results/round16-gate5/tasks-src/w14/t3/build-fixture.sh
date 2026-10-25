#!/usr/bin/env bash
REPO_URL=https://github.com/mattn/go-isatty; PIN=13e91bf4058fb93d5629deb7b2e3763ec8f4fdf8
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

ap() { mkdir -p "$(dirname "$DEST/$1")"; cat >> "$DEST/$1"; }
MARA=("Mara Linden" mara@example.com)
subj_sha() { G log -1 --format=%H --fixed-strings --grep="$1" fixture; }

ap doc.go <<'GO'
// Release v0.0.21 baseline.
GO
c "${MARA[@]}" "2025-03-20T09:00:00+00:00" "Release v0.0.21"

# 1. plain feature, kept
ap isatty_windows.go <<'GO'

// IsMSYS2Terminal reports whether fd is an MSYS2 pty.
func IsMSYS2Terminal(fd uintptr) bool { return IsCygwinTerminal(fd) }
GO
c "Ola Berg" ola@example.com "2025-03-24T10:00:00+00:00" "Add IsMSYS2Terminal for MSYS2 ptys"

# 2. two-file commit, one file later backed out (partial)
ap isatty_others.go <<'GO'

// IsTerminalFd is the uintptr form of IsTerminal.
func IsTerminalFd(fd uintptr) bool { return IsTerminal(fd) }
GO
ap doc.go <<'GO'
// IsTerminalFd is safe to call from signal handlers.
GO
c "Pia Paz" pia@example.com "2025-03-25T10:00:00+00:00" "Add IsTerminalFd helper and docs"

# 2b. the doc.go half of that commit is taken back by hand (no revert trailer, only one file)
F2=$(G log -1 --format=%H --fixed-strings --grep="Add IsTerminalFd helper and docs" fixture)
G checkout -q "${F2}^" -- doc.go
c "${MARA[@]}" "2025-03-26T09:00:00+00:00" "doc.go: drop the signal-handler claim, it is not true on Windows"

# 3. plan9 feature: author clock is ahead, so the commit is dated AFTER its own revert
ap isatty_plan9.go <<'GO'

// IsPlan9Console reports whether fd is the plan9 console.
func IsPlan9Console(fd uintptr) bool { return fd < 3 }
GO
c "Quan Qiu" quan@example.com "2025-04-05T10:00:00+00:00" "Add IsPlan9Console"
PL=$(G rev-parse HEAD)
G revert --no-commit "$PL" >/dev/null
c "${MARA[@]}" "2025-04-01T09:00:00+00:00" "Revert \"Add IsPlan9Console\"

This reverts commit ${PL:0:10}."

# 4. NetBSD, removed by a hand-written back-out (no revert trailer)
w isatty_netbsd.go <<'GO'
//go:build netbsd

package isatty

// IsNetBSDTerminal reports whether fd is a NetBSD tty.
func IsNetBSDTerminal(fd uintptr) bool { return true }
GO
c "Ravi Rao" ravi@example.com "2025-03-27T10:00:00+00:00" "Add NetBSD support"
rm "$DEST/isatty_netbsd.go"
c "${MARA[@]}" "2025-03-28T09:00:00+00:00" "Back out NetBSD support, it breaks the build on 1.12"

# 5. solaris fix: reverted, then re-landed with the same patch under a new message
ap isatty_solaris.go <<'GO'

// termioOK is true when TCGETA succeeds.
const termioOK = true
GO
c "Tomas Teixeira" tomas@example.com "2025-03-29T10:00:00+00:00" "Fix solaris TCGETA detection"
SO=$(G rev-parse HEAD)
G revert --no-commit "$SO" >/dev/null
c "${MARA[@]}" "2025-03-30T09:00:00+00:00" "Revert \"Fix solaris TCGETA detection\"

This reverts commit $SO."
ap isatty_solaris.go <<'GO'

// termioOK is true when TCGETA succeeds.
const termioOK = true
GO
c "Tomas Teixeira" tomas@example.com "2025-04-02T10:00:00+00:00" "Fix solaris TCGETA detection, take two"

# 6. a whole PR merged, then the merge itself reverted
BASE=$(G rev-parse HEAD)
G checkout -q -b topic "$BASE"
ap go.mod <<'GO'
// bump: golang.org/x/sys v0.1.0
GO
c "Uli Uzun" uli@example.com "2025-04-03T10:00:00+00:00" "Bump x/sys to v0.1.0"
ap go.mod <<'GO'
// bump: golang.org/x/sys v0.2.0
GO
c "Uli Uzun" uli@example.com "2025-04-04T10:00:00+00:00" "Bump x/sys to v0.2.0"
G checkout -q fixture
GIT_AUTHOR_NAME="${MARA[0]}" GIT_AUTHOR_EMAIL="${MARA[1]}" GIT_AUTHOR_DATE="2025-04-06T09:00:00+00:00" \
GIT_COMMITTER_NAME="${MARA[0]}" GIT_COMMITTER_EMAIL="${MARA[1]}" GIT_COMMITTER_DATE="2025-04-06T09:00:00+00:00" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff topic -m "Merge pull request #77 from uli/x-sys"
G branch -q -D topic
MG=$(G rev-parse HEAD)
G revert --no-commit -m 1 "$MG" >/dev/null
c "${MARA[@]}" "2025-04-08T09:00:00+00:00" "Revert \"Merge pull request #77 from uli/x-sys\"

This reverts commit $MG, reversing
changes made to 1a2b3c4."

# 7. title starts with "Revert" but nothing is undone: a real, new change
ap isatty_bsd.go <<'GO'

// build constraints are kept in sorted order
GO
c "Vera Voss" vera@example.com "2025-04-09T10:00:00+00:00" "Revert to sorted order of build constraints"

# 8. a kept feature
w isatty_dragonfly.go <<'GO'
//go:build dragonfly

package isatty

// IsDragonflyTerminal reports whether fd is a DragonFly tty.
func IsDragonflyTerminal(fd uintptr) bool { return true }
GO
c "Wes Wolfe" wes@example.com "2025-04-10T10:00:00+00:00" "Add DragonFly BSD terminal check"

finish
