#!/usr/bin/env bash
URL=https://github.com/fatih/color
PIN=6e1bb0d896cf05029c367950a73fd47828a17df5
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"; git clone -q "$URL" "$DEST"; cd "$DEST"
git checkout -q "$PIN"; git checkout -q -B main
for b in $(git for-each-ref --format='%(refname:short)' refs/heads | grep -vx main); do git branch -q -D "$b"; done
git tag -l | xargs -r git tag -d >/dev/null
git remote remove origin
git reflog expire --expire=now --all; git gc -q --prune=now
c() { # author_name author_email author_date message [committer_date] [committer_name] [committer_email]
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="${6:-$1}" GIT_COMMITTER_EMAIL="${7:-$2}" GIT_COMMITTER_DATE="${5:-$3}" git commit -q --no-gpg-sign -m "$4"
}
gen() { mkdir -p "$(dirname "$1")"; seq -f "$3 line %g" 1 "$2" > "$1"; }

J="Jun Park"; JE=jun.park@helios.example
D="Dana Whitfield"; DE=dana.whitfield@helios.example
n=0
jun() { n=$((n+1)); gen ext/jun_$n.go 12 "jun$n"; c "$J" $JE "$1" "$2" "${3:-$1}"; }

jun 2025-01-06T09:10:00+09:00 "Add NO_COLOR docs helper"
jun 2025-01-28T18:00:00+09:00 "Add attribute combination tests"
jun 2025-02-17T10:00:00+09:00 "Cache color escape sequences"
jun 2025-03-10T10:30:00+09:00 "Add Windows console detection test"
jun 2025-03-31T23:30:00-08:00 "Fix bold reset sequence"
gen ext/dana_1.go 9 dana1; c "$D" $DE 2025-05-02T11:00:00-07:00 "Add benchmark for Sprint helpers"
jun 2025-04-09T12:00:00-07:00 "Add Fprint wrapper tests"
jun 2025-05-14T15:00:00-07:00 "Add 256-color helper" 2025-09-20T10:00:00-07:00
jun 2025-06-23T11:00:00-07:00 "Handle nil writer in color.Fprintf"
jun 2025-07-15T14:00:00-07:00 "Document attribute precedence"
jun 2025-08-11T10:00:00-07:00 "Add fuzz test for sequence builder"
gen ext/dana_2.go 9 dana2; c "$D" $DE 2025-08-25T11:00:00-07:00 "Bump Go version in CI"
jun 2025-09-22T10:00:00-07:00 "Expose color profile detection"
jun 2025-10-06T10:00:00-07:00 "Add tests for profile detection"
jun 2025-11-04T10:00:00-08:00 "Refactor attribute table"
jun 2025-12-01T10:00:00-08:00 "Add accessibility notes"
jun 2025-12-31T21:00:00-08:00 "Year-end cleanup of examples"
jun 2027-03-15T10:00:00-07:00 "Fix typo in README example"
