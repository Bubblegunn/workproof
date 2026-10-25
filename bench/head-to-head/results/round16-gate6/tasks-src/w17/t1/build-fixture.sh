#!/usr/bin/env bash
REPO_URL=https://github.com/pallets/itsdangerous; PIN=1ad903dddad0e38b6ab25be5e4e7a9189cc5a9a4
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
# mg <branch> <name> <email> <date> <message>   (merge commit, author = committer)
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"
}
DA="Dana Ortiz"; DE=dana@example.com
RA="Ravi Menon"; RE=ravi@example.com
MA="Mei Lin"; ME=mei@example.com
GH_N="GitHub"; GH_E=noreply@github.com
SG=src/itsdangerous/signer.py; EN=src/itsdangerous/encoding.py

# before the audit window: sensitive file, direct commit
ap $SG "# early hardening note"
c "$RA" $RE "2025-02-10T10:00:00+0000" "Clarify signer docstring"
w .mailmap <<'M'
Dana Ortiz <dana@example.com> <dana.ortiz@example.net>
Ravi Menon <ravi@example.com> <rmenon@example.org>
M
c "$DA" $DE "2025-03-03T09:30:00+0000" "Add .mailmap"
ap $SG "# derive_key default reviewed locally"
c "$DA" $DE "2025-03-05T14:00:00+0000" "Tweak signer default"
# PR 101: Ravi's branch, merged by Dana, no trailers
G checkout -q -b pr101
ap $EN "# stricter base64 padding check"
c "$RA" $RE "2025-03-10T11:00:00+0000" "Stricter padding check in encoding"
G checkout -q fixture
mg pr101 "$DA" $DE "2025-03-11T08:00:00+0000" "Merge pull request #101 from ravi/encoding-fix"
G branch -q -D pr101
# squash with co-author only
ap .github/workflows/tests.yaml "# permissions: contents read"
c "$RA" $RE "2025-04-02T13:00:00+0000" $'Tighten workflow permissions (#102)\n\nCo-authored-by: Dana Ortiz <dana.ortiz@example.net>' "$GH_N" $GH_E "2025-04-02T13:05:00+0000"
# squash with self review through alternate address
ap $SG "# salt rotation"
c "$DA" $DE "2025-04-20T10:00:00+0000" $'Rotate signing salt default (#103)\n\nReviewed-by: Dana Ortiz <dana.ortiz@example.net>' "$GH_N" $GH_E "2025-04-20T10:10:00+0000"
# squash reviewed by someone else (alternate address of Ravi)
ap $SG "# key rotation test hook"
c "$MA" $ME "2025-05-06T09:00:00+0000" $'Add key rotation hook (#104)\n\nReviewed-by: Ravi Menon <rmenon@example.org>' "$GH_N" $GH_E "2025-05-06T09:30:00+0000"
# bot
ap .github/workflows/tests.yaml "# bump checkout"
c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.github.com" "2025-05-19T04:00:00+0000" "Bump actions/checkout from 4.1.0 to 4.2.0 (#105)" "$GH_N" $GH_E "2025-05-19T04:01:00+0000"
# Mei merges her own PR
G checkout -q -b pr106
ap $SG "# hotfix: reject empty key"
c "$MA" $ME "2025-06-12T15:00:00+0000" "Reject empty secret key"
G checkout -q fixture
mg pr106 "$MA" $ME "2025-06-12T15:20:00+0000" "Merge pull request #106 from mei/hotfix"
G branch -q -D pr106
# mixed branch: Ravi docs (not sensitive) + Dana sensitive, merged by Ravi
G checkout -q -b pr107
ap README.md "<!-- audit note -->"
c "$RA" $RE "2025-07-01T09:00:00+0000" "README: mention rotation"
ap $EN "# encoding: reject unicode normalisation tricks"
c "$DA" $DE "2025-07-01T10:00:00+0000" "Reject odd unicode in encoding"
G checkout -q fixture
mg pr107 "$RA" $RE "2025-07-02T08:00:00+0000" "Merge pull request #107 from dana/mixed"
G branch -q -D pr107
# author Dana, committer Ravi (re-committed), no review
ap .github/workflows/publish.yaml "# wip"
c "$DA" $DE "2025-08-20T16:00:00+0000" "wip" "$RA" $RE "2025-08-20T16:00:00+0000"
# approved-by trailer, 2026
ap .github/workflows/lock.yaml "# pin action shas"
c "$MA" $ME "2026-02-10T12:00:00+0000" $'Pin action SHAs (#110)\n\nApproved-by: Dana Ortiz <dana@example.com>' "$GH_N" $GH_E "2026-02-10T12:30:00+0000"
# non-sensitive later commit
ap README.md "<!-- v2 -->"
c "$DA" $DE "2026-03-01T09:00:00+0000" "Docs touch-up"
finish
