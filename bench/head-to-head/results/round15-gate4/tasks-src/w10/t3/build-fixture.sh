#!/usr/bin/env bash
# Fixture for task 3. Deterministic: same pin + fixed identities/dates => same HEAD sha.
REPO_URL=https://github.com/dtolnay/itoa.git; PIN=1577ed901354d0d7448ac162328f9dbf5183124c
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
DN="David Nowak"; DE="david@example.com"
d() { sc "$DN" "$DE" "$1" "$2"; }      # d DATE MESSAGE : the maintainer authors and commits
# am DATE AUTHOR EMAIL MESSAGE : patch applied by the maintainer (author differs from committer)
am() { cm "$2" "$3" "$1" "$DN" "$DE" "$1" "$4"; }
g add -Af
d "2026-05-01T09:00:00+0000" "Import itoa snapshot"
ap src/lib.rs "// isize path"
d "2026-06-28T10:00:00+0000" $'Fix off-by-one in isize path\n\nReported-by: Tomas Ek <tomas@example.net>'
ap README.md "MSRV note."
d "2026-07-01T00:10:00+0300" $'Clarify MSRV docs\n\nReported-by: Tomas Ek <tomas@example.net>'
ap src/lib.rs "// i128 fast path"
am "2026-07-06T11:00:00+0900" "Hye-jin Seo" hyejin@example.org "Add i128 fast path"
ap src/lib.rs "// bounds check removed"
d "2026-07-14T16:00:00+0200" $'Avoid bounds check in write_u64\n\nReported-by: Tomas Ek <tomas.ek@example.org>\nReviewed-by: Priya Nair <priya@example.com>'
ap README.md "no_std usage."
cm "Omar Khalil" omar@example.net "2026-07-29T09:00:00-0400" "$DN" "$DE" "2026-07-30T08:00:00+0000" $'Document no_std usage\n\nReviewed-by: Priya Nair <priya@example.com>'
ap benches/bench.rs "// harness rewrite"
d "2026-08-05T13:00:00+0000" $'Rewrite benchmarks harness\n\nCo-authored-by: Hye-jin Seo <hyejin.seo@example.net>'
ap src/lib.rs "// u128 on 32-bit"
d "2026-08-12T10:30:00+0000" $'Handle u128 on 32-bit targets\n\nSuggested-by: Lena Fischer <lena@example.org>\nCo-Authored-By: Hye-jin Seo <hyejin@example.org>\nTested-by: Priya Nair <priya@example.com>'
ap .github/workflows/ci.yml "# checkout v5"
sc "dependabot[bot]" bot@example.invalid "2026-08-19T07:00:00+0000" "Bump actions/checkout from 4 to 5"
ap README.md "Example tidy."
d "2026-08-21T15:00:00+0000" $'Tidy README example\n\nCo-authored-by: Copilot <copilot@example.invalid>'
ap README.md "Typo."
d "2026-09-02T08:45:00+0000" $'Fix typo in docs\n\nIssue #27 said:\n> Co-authored-by: Quentin Moreau <quentin@example.com> (suggested wording)\n\nReported-by: Tomas Ek <tomas@example.net>'
ap src/lib.rs "// const fn conversion"
cm "Omar Khalil" omar@example.net "2026-09-10T12:00:00-0400" "GitHub" noreply@example.invalid "2026-09-10T16:05:00+0000" $'Add const-fn conversion (#31)\n\n* wip\n* review fixes\n\nCo-authored-by: Hye-jin Seo <hyejin@example.org>\nReviewed-by: Priya Nair <priya@example.com>'
ap src/lib.rs "// u64 formatting speedup"
am "2026-09-17T09:00:00+0900" "Hye-jin Seo" hyejin@example.org "Speed up u64 formatting"
# 2026-09-30 23:30 at UTC-2 is 2026-10-01 01:30 UTC: outside the quarter
ap README.md "1.0.19 notes."
d "2026-09-30T23:30:00-0200" $'Prepare 1.0.19 notes\n\nReviewed-by: Priya Nair <priya@example.com>'
ap README.md "Typo 2."
d "2026-10-03T10:00:00+0000" $'Fix link in README\n\nReported-by: Marta Silva <marta@example.net>'
