#!/usr/bin/env bash
REPO_URL=https://github.com/mattn/go-isatty; PIN=a7c02353c47bc4ec6b30dc9628154ae4fe760c11
# --- common header (inlined into each build-fixture.sh) ---
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C
export GIT_AUTHOR_NAME=x GIT_AUTHOR_EMAIL=x@example.invalid GIT_COMMITTER_NAME=x GIT_COMMITTER_EMAIL=x@example.invalid
rm -rf "$DEST"
git clone -q --no-checkout "$REPO_URL" "$DEST"
cd "$DEST"
git checkout -q -B main "$PIN"
git remote remove origin
for r in $(git for-each-ref --format='%(refname)' | grep -v '^refs/heads/main$'); do git update-ref -d "$r"; done
git config core.autocrlf false
# cm AUTHOR_KEY AUTHOR_DATE COMMITTER_KEY COMMITTER_DATE MESSAGE  (stages everything)
cm() {
  local a="$1" ad="$2" c="$3" cd="$4" msg="$5"
  ident "$a"; local an="$N" ae="$E"
  ident "$c"; local cn="$N" ce="$E"
  git add -A
  GIT_AUTHOR_NAME="$an" GIT_AUTHOR_EMAIL="$ae" GIT_AUTHOR_DATE="$ad" \
  GIT_COMMITTER_NAME="$cn" GIT_COMMITTER_EMAIL="$ce" GIT_COMMITTER_DATE="$cd" \
    git commit -q --allow-empty -m "$msg"
}
# mg BRANCH AUTHOR_KEY DATE MESSAGE : merge --no-ff, committer = author
mg() {
  ident "$2"
  GIT_AUTHOR_NAME="$N" GIT_AUTHOR_EMAIL="$E" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="$N" GIT_COMMITTER_EMAIL="$E" GIT_COMMITTER_DATE="$3" \
    git merge -q --no-ff "$1" -m "$4"
}
# ap FILE TEXT : append a line
ap() { printf '%s\n' "$2" >> "$1"; }
finish() {
  git reflog expire --expire=now --all
  git gc -q --prune=now
  git rev-parse HEAD
}
ident() { case "$1" in
  work)  N="Maren Okafor";   E="maren.okafor@brightloom.example";;
  gh)    N="maren okafor";   E="4821907+mokafor@users.noreply.example.org";;
  pers)  N="M. Okafor";      E="maren@okafor.example.com";;
  lind)  N="Maren Okafor-Lindqvist"; E="maren.lindqvist@northpine.example";;
  marc)  N="Marcus Okafor";  E="marcus@okafor.example.com";;
  jonas) N="Jonas Weber";    E="jonas.weber@example.org";;
  bot)   N="dependabot[bot]"; E="49699333+dependabot[bot]@users.noreply.example.org";;
  web)   N="GitHub";         E="noreply@github.example";;
esac; }

# 1. local date 31 Mar (UTC-8), UTC date 1 Apr -> inside Q2 UTC
ap doc.go "// note: isatty probing is best effort on plan9"
cm work 2025-03-31T23:40:00-08:00 work 2025-03-31T23:40:00-08:00 "Document plan9 behaviour of IsTerminal"
# 2. boundary: exactly 2025-04-01T00:00:00Z
ap README.md "<!-- tested on Alpine 3.21 -->"
cm gh 2025-04-01T00:00:00+00:00 gh 2025-04-01T00:00:00+00:00 "readme: mention Alpine"
# decoy: same surname
ap isatty_bsd.go "// bsd: see also kqueue notes"
cm marc 2025-04-09T10:00:00+00:00 marc 2025-04-09T10:00:00+00:00 "Clarify BSD comment"
# 3. bot
ap go.test.sh "# bumped by bot"
cm bot 2025-04-10T04:00:00+00:00 bot 2025-04-10T04:00:00+00:00 "Bump actions/setup-go from 5.2.0 to 5.3.0"
# 4. normal +02:00
ap isatty_solaris.go "// solaris: TCGETA is the portable probe"
cm gh 2025-04-14T16:30:00+02:00 gh 2025-04-14T16:30:00+02:00 "solaris: explain probe choice"
# 5. authored in Q2, committed (rebased by maintainer) in July -> author date inside
ap isatty_plan9.go "// plan9: uses fd2path"
cm work 2025-04-25T09:12:00+00:00 jonas 2025-07-03T11:00:00+00:00 "plan9: document fd2path usage"
# 6. authored in Feb, rebased into Q2 by author -> author date outside
ap isatty_windows.go "// windows: handle ERROR_INVALID_HANDLE"
cm work 2025-02-10T09:00:00+00:00 work 2025-04-20T09:00:00+00:00 "windows: document invalid handle case"
# 7. work address, normal
ap example_test.go "// example: piping output through less"
cm work 2025-05-09T13:05:00+00:00 work 2025-05-09T13:05:00+00:00 "example: show non-terminal behaviour"
# 8. personal address after leaving the company
ap isatty_tiocgwinsz.go "// tiocgwinsz: linux only"
cm pers 2025-05-20T20:45:00+00:00 pers 2025-05-20T20:45:00+00:00 "Note TIOCGWINSZ is Linux specific"
# decoy: different person, hyphenated surname
ap isatty_others.go "// others: fallback returns false"
cm lind 2025-05-21T08:00:00+00:00 lind 2025-05-21T08:00:00+00:00 "others: comment the fallback"
# 9. co-author only
ap isatty_others_test.go "// test: covers /dev/null"
cm jonas 2025-06-02T15:00:00+00:00 jonas 2025-06-02T15:00:00+00:00 $'Add /dev/null case to others test\n\nPairing session.\n\nCo-authored-by: Maren Okafor <maren.okafor@brightloom.example>'
# 10. feature branch, merge commit authored by Maren
git checkout -q -b feature/docs
ap doc.go "// package doc: see README for platform matrix"
cm gh 2025-06-05T12:00:00+00:00 gh 2025-06-05T12:00:00+00:00 "doc: point at README platform matrix"
git checkout -q main
ap isatty_windows_test.go "// windows test: skip on CI without console"
cm jonas 2025-06-06T09:00:00+00:00 jonas 2025-06-06T09:00:00+00:00 "windows test: skip without console"
mg feature/docs gh 2025-06-10T18:00:00+00:00 "Merge branch 'feature/docs'"
git branch -q -d feature/docs
# 11. add then revert, both authored by Maren
ap README.md "<!-- experimental: wasm support -->"
cm gh 2025-06-12T10:00:00+00:00 gh 2025-06-12T10:00:00+00:00 "readme: mention wasm support"
sed -i.bak '$d' README.md; rm README.md.bak
cm gh 2025-06-13T10:00:00+00:00 gh 2025-06-13T10:00:00+00:00 $'Revert "readme: mention wasm support"\n\nThis reverts the previous commit; wasm is not supported yet.'
# 12. squash-merged PR: author Maren, committer GitHub web
ap isatty_bsd.go "// bsd: DragonFly is covered by the same build tag"
cm gh 2025-06-18T07:30:00-05:00 web 2025-06-19T09:00:00+00:00 "Cover DragonFly in build tag (#61)"
# 13. last second of Q2 in UTC
ap isatty_solaris.go "// solaris: tested on illumos"
cm pers 2025-06-30T23:59:59+00:00 pers 2025-06-30T23:59:59+00:00 "solaris: note illumos"
# 14. local June 30, UTC July 1 -> outside Q2 UTC
ap isatty_windows.go "// windows: console mode flags"
cm gh 2025-06-30T22:15:00-05:00 gh 2025-06-30T22:15:00-05:00 "windows: comment console mode flags"
# 15. July, after the window
ap README.md "<!-- v0.0.21 -->"
cm pers 2025-07-08T09:00:00+00:00 pers 2025-07-08T09:00:00+00:00 "readme: version note"
finish
