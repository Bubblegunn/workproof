#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/p-limit; PIN=7d14b3f04aa990f621a853e24e2a4b796baf1ec9
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
ch() { ap CHANGES.txt "$4"; c "$@"; }
# mg <branch> <author-name> <author-email> <date> <committer-name> <committer-email> <message>
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$5" GIT_COMMITTER_EMAIL="$6" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$7" "$1"
}
SO="Sofia Alvarez"; OM="Omar Haddad"; LE="Lena Fischer"
GHN=GitHub; GHE=noreply@github.com
DB="49699333+dependabot[bot]@users.noreply.github.com"

ch "$SO" sofia@example.com "2025-01-14T10:00:00+0000" "Document concurrency edge case"
ch "$OM" omar@example.com "2025-02-03T09:00:00+0000" "Add rejectOnClear option test"
ch "$SO" s.alvarez@example.org "2025-02-18T15:30:00+0000" "Tidy benchmark script"
ch "$OM" omar.haddad@example.net "2025-03-04T21:15:00+0000" "Loosen type for limit argument"
ch "$LE" lena@example.com "2025-03-20T11:00:00+0000" "Update typings test" "Kai Brandt" kai@example.com "2025-03-21T08:00:00+0000"
G checkout -q -b priya-docs
ch "Priya Nair" priya@example.com "2025-04-09T13:00:00+0000" "Add recipe for batching"
G checkout -q fixture
mg priya-docs "$OM" omar@example.com "2025-04-10T09:30:00+0000" "$GHN" $GHE "Merge pull request #12 from priya/docs"
G branch -q -D priya-docs
ch "dependabot[bot]" "$DB" "2025-05-05T04:00:00+0000" "Bump xo from 0.60.0 to 0.61.0" "$GHN" $GHE "2025-05-05T04:01:00+0000"
ch "dependabot[bot]" dependabot@mail.example.org "2025-05-19T04:00:00+0000" "Bump ava from 6.2.0 to 6.3.0"
ch "$SO" sofia@example.com "2025-06-02T10:00:00+0000" $'Simplify queue handling (#14)\n\nCo-authored-by: Wes Doyle <wes@example.net>' "$GHN" $GHE "2025-06-02T10:05:00+0000"
ch "$SO" sofia@example.com "2025-07-15T12:00:00+0000" "Release prep" "root" root@buildhost.invalid "2025-07-15T12:30:00+0000"
ch "$LE" Lena@Example.COM "2025-09-09T14:00:00+0000" "Fix readme example"
ch "$OM" omar@example.com "2026-01-20T10:00:00+0000" "Drop Node 18 from CI" "$GHN" $GHE "2026-01-20T10:02:00+0000"
finish
