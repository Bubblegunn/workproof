#!/usr/bin/env bash
# Fixture for task 4. Deterministic: same pin + fixed identities/dates => same HEAD sha.
REPO_URL=https://github.com/lukeed/kleur.git; PIN=fa3454483899ddab550d08c18c028e6db1aab0e5
set -euo pipefail
D=${1:?usage: build-fixture.sh <dest>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C GIT_TERMINAL_PROMPT=0
case "$D" in /*) ;; *) D="$PWD/$D" ;; esac
rm -rf "$D"; mkdir -p "$D"
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
git init -q "$W/up"
git -C "$W/up" fetch -q --depth 1 "$REPO_URL" "$PIN"
test "$(git -C "$W/up" rev-parse FETCH_HEAD)" = "$PIN"
git -C "$W/up" archive FETCH_HEAD | tar -x -C "$D"
git init -q -b main "$D"
g() { git -C "$D" "$@"; }
# cm AUTHOR_NAME AUTHOR_EMAIL AUTHOR_DATE COMMITTER_NAME COMMITTER_EMAIL COMMITTER_DATE MESSAGE
cm() { GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="$4" GIT_COMMITTER_EMAIL="$5" GIT_COMMITTER_DATE="$6" git -C "$D" commit -q --allow-empty -m "$7"; }
# sc NAME EMAIL DATE MESSAGE : author and committer identical
sc() { cm "$1" "$2" "$3" "$1" "$2" "$3" "$4"; }
# ap FILE LINE : append a line to FILE and stage everything
ap() { mkdir -p "$(dirname "$D/$1")"; printf '%s\n' "$2" >> "$D/$1"; g add -Af; }
# mg BRANCH DATE MESSAGE : no-ff merge by the maintainer (M_NAME, M_EMAIL), then delete the branch
mg() { g checkout -q main
  GIT_AUTHOR_NAME="$M_NAME" GIT_AUTHOR_EMAIL="$M_EMAIL" GIT_AUTHOR_DATE="$2" GIT_COMMITTER_NAME="$M_NAME" GIT_COMMITTER_EMAIL="$M_EMAIL" GIT_COMMITTER_DATE="$2" git -C "$D" merge -q --no-ff -m "$3" "$1"
  g branch -q -d "$1"; }
M_NAME="Noor Haddad"; M_EMAIL="noor@example.com"
NN="Noor Haddad"
g add -Af
sc "$NN" noor@example.com "2026-01-05T09:00:00+0000" "Import kleur snapshot"
ap index.mjs "// NO_COLOR support"
sc "Jonas Weber" jonas@example.org "2026-02-02T10:00:00+0100" "Respect NO_COLOR"
g checkout -q -b feat-ansi
ap colors.mjs "// 256-colour helpers"
sc "Ibrahim Yilmaz" ibrahim@example.net "2026-02-10T14:00:00+0300" "Add 256-colour helpers"
ap test/colors.js "// 256-colour tests"
sc "Ibrahim Yilmaz" ibrahim@example.net "2026-02-18T14:00:00+0300" "Add tests for 256-colour helpers"
g checkout -q main
ap readme.md "Prepare notes."
sc "$NN" noor@example.com "2026-02-25T09:00:00+0000" "Prepare 1.4.0 notes"
ap VERSION "1.4.0"
sc "$NN" noor@example.com "2026-03-01T09:00:00+0000" "Release 1.4.0"
ap readme.md "Release notes typo."
sc "Marek Novak" marek@example.invalid "2026-03-03T08:00:00+0000" "Fix typo in Release 1.4.0 notes"
ap index.mjs "// bold reset"
sc "Jonas Weber" jonas@example.org "2026-03-09T10:00:00+0900" "Fix bold reset sequence"
ap VERSION "dep bump"
sc "dependabot[bot]" bot@example.invalid "2026-03-12T07:00:00+0000" "Bump uvu from 0.5.1 to 0.5.6"
mg feat-ansi "2026-03-20T09:00:00+0000" "Merge pull request #58 from ibrahim/feat-ansi"
ap colors.mjs "// chalk-compat shim"
sc "Kim Tran" kim@example.com "2026-04-02T12:00:00+0000" "Add chalk-compat shim"
KS=$(g rev-parse HEAD)
GIT_AUTHOR_NAME="$NN" GIT_AUTHOR_EMAIL=noor@example.com GIT_AUTHOR_DATE="2026-04-04T09:00:00+0000" GIT_COMMITTER_NAME="$NN" GIT_COMMITTER_EMAIL=noor@example.com GIT_COMMITTER_DATE="2026-04-04T09:00:00+0000" git -C "$D" revert --no-edit "$KS"
ap colors.mjs "// chalk-compat shim v2 with tests"
sc "Kim Tran" kim@example.com "2026-04-20T12:00:00+0000" "Reland chalk-compat shim with tests"
ap colors.d.ts "// typings update"
sc "$NN" noor.haddad@example.org "2026-05-05T09:00:00+0200" "Update typings for colors.d.ts"
ap VERSION "1.5.0"
sc "$NN" noor@example.com "2026-05-20T09:00:00+0000" "Release 1.5.0"
# authored 12 May (inside the dates of the range) but rebased and only landed on 27 May, after Release 1.5.0
ap readme.md "Document chalk-compat."
cm "Leila Farouk" leila@example.net "2026-05-12T09:00:00+0000" "$NN" noor@example.com "2026-05-27T09:00:00+0000" "Document chalk-compat shim"
ap index.mjs "// start 1.6.0"
sc "Jonas Weber" jonas@example.org "2026-06-10T10:00:00+0100" "Start work after Release 1.5.0"
