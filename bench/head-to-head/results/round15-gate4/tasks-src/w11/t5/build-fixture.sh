#!/usr/bin/env bash
REPO_URL=https://github.com/heartcombo/responders; PIN=9bdc60dfbfa8001641c1c4df7bc73c3fc2a4cf41
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
  nA)    N="Nadia Petrova";   E="nadia.petrova@sparrowdata.example";;
  nB)    N="npetrova";        E="5521870+npetrova@users.noreply.example.org";;
  nC)    N="Nadia Sol";       E="nadia.petrova@sparrowdata.example";;
  nD)    N="Nadia Petrova";   E="nadia.petrova@othercorp.example";;
  omar)  N="Omar Haddad";     E="omar.haddad@example.org";;
  web)   N="GitHub";          E="noreply@github.example";;
esac; }
n=0
edit() { n=$((n+1)); printf '%s\n' "- note $n: $1" >> CHANGELOG.md; }

edit "document respond_with defaults"
cm nA 2024-10-28T12:00:00+00:00 nA 2024-10-28T12:00:00+00:00 "changelog: respond_with defaults"
edit "flash responder keys are strings"
cm nA 2025-01-14T10:00:00+00:00 nA 2025-01-14T10:00:00+00:00 "flash responder: note string keys"
edit "http cache responder etag"
cm nA 2025-02-03T09:00:00+01:00 nA 2025-02-03T09:00:00+01:00 "http cache responder: document etag option"
edit "collection responder redirect"
cm nD 2025-02-10T11:00:00+00:00 nD 2025-02-10T11:00:00+00:00 "collection responder: redirect note"
edit "locales fallback"
cm nB 2025-03-12T15:00:00+00:00 nB 2025-03-12T15:00:00+00:00 "locales: document fallback order"
edit "rails 8 gemfile"
cm nB 2025-04-30T23:50:00-07:00 nB 2025-04-30T23:50:00-07:00 "gemfiles: note rails 8 support"
edit "generator templates"
cm nA 2025-06-17T08:00:00+00:00 nA 2025-06-17T08:00:00+00:00 "generators: mention api template"
edit "name changed after marriage"
cm nC 2025-09-09T10:00:00+02:00 nC 2025-09-09T10:00:00+02:00 "readme: update maintainer note"
edit "patch applied from a contributor"
cm omar 2025-10-02T09:00:00+00:00 nA 2025-10-02T14:00:00+00:00 "controller_method: fix typo in comment"
edit "rebased onto main"
cm nA 2025-08-20T13:00:00+00:00 nA 2025-11-05T09:00:00+00:00 "respond_with: note about status codes"
edit "docs polish"
cm nB 2025-11-18T20:30:00-05:00 nB 2025-11-18T20:30:00-05:00 "docs: wording pass"
edit "clock was not set on this machine"
cm nA 1970-01-01T00:00:00+00:00 nA 2025-11-20T09:00:00+00:00 "changelog: tidy"
edit "typo in the year"
cm nA 2031-06-01T09:00:00+00:00 nA 2025-12-02T09:00:00+00:00 "changelog: more tidy"
edit "squash merged later"
cm nB 2025-12-10T16:00:00+00:00 web 2026-01-06T10:00:00+00:00 "Document flash redirect options (#72)"
finish
