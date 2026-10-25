#!/usr/bin/env bash
REPO_URL=https://github.com/dtolnay/semver; PIN=dd8dc0ad9055adea8abdf4516d156fd723c0b15a
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
rs() { ap "$1" <<EOR

// $2
EOR
}
bump() { sed -i.bak "s/^version = \"[0-9.]*\"/version = \"$1\"/" "$DEST/Cargo.toml"; rm "$DEST/Cargo.toml.bak"; }

w .mailmap <<'MM'
Lena Ortiz <lena@example.com> Lena O. <lena.ortiz@uni.example>
MM
c "${MARA[@]}" "2025-02-10T09:00:00+00:00" "Add mailmap"

rs src/identifier.rs "Identifier::is_inline"
c "Priya Nair" priya@old.example "2025-03-01T10:00:00+00:00" "Add Identifier::is_inline"
P1=$(G rev-parse HEAD)

# author clock far in the future, commit lands before the 1.0.26 release
rs src/error.rs "Error::position"
c "Omar Odum" omar@example.com "2027-01-05T10:00:00+00:00" "Expose Error::position" "Omar Odum" omar@example.com "2025-03-05T10:00:00+00:00"

bump 1.0.26
c "${MARA[@]}" "2025-03-10T09:00:00+00:00" "Release 1.0.26"

# long-lived branch started before 1.0.26, merged after it
G checkout -q -b longlived "$P1"
rs tests/test_version.rs "test: build metadata ordering"
c "Zed Zhu" zed@example.com "2025-02-15T10:00:00+00:00" "test: build metadata ordering"
rs tests/test_version.rs "test: prerelease ordering"
c "Zed Zhu" zed@example.com "2025-02-16T10:00:00+00:00" "test: prerelease ordering"
G checkout -q fixture

rs src/impls.rs "VersionReq::from_iter"
c "Priya Nair" priya@new.example "2025-03-20T10:00:00+00:00" "Add VersionReq::from_iter"

rs src/eval.rs "eval: skip empty comparators"
c "Omar Odum" omar@example.com "2025-03-22T10:00:00+00:00" "eval: skip empty comparators"

rs src/serde.rs "serde: accept borrowed str"
c "Lena Ortiz" lena@example.com "2025-04-02T10:00:00+00:00" "serde: accept borrowed str" "Lena Ortiz" lena@example.com "2025-05-20T10:00:00+00:00"

rs src/display.rs "display: alternate flag"
c "Lena O." lena.ortiz@uni.example "2025-04-15T10:00:00+00:00" "display: alternate flag"
D4=$(G rev-parse HEAD)

w .github/dependabot.yml <<'Y'
version: 2
updates:
  - package-ecosystem: cargo
    directory: /
    schedule:
      interval: weekly
Y
c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.example" "2025-04-20T04:00:00+00:00" "Bump serde_derive from 1.0.200 to 1.0.201"

rs README.md "clarify minimum supported Rust version"
c "Kai Kemp" kai@example.com "1970-01-01T00:00:00+00:00"  "docs: state MSRV in readme"

rs benches/parse.rs "bench: long prerelease"
c "Jun Ito" jun@example.com "2031-06-01T10:00:00+00:00" "bench: long prerelease" "Jun Ito" jun@example.com "2025-05-02T10:00:00+00:00"

G revert --no-commit "$D4" >/dev/null
c "${MARA[@]}" "2025-05-05T09:00:00+00:00" "Revert \"display: alternate flag\"

This reverts commit $D4."

GIT_AUTHOR_NAME="${MARA[0]}" GIT_AUTHOR_EMAIL="${MARA[1]}" GIT_AUTHOR_DATE="2025-05-10T09:00:00+00:00" \
GIT_COMMITTER_NAME="${MARA[0]}" GIT_COMMITTER_EMAIL="${MARA[1]}" GIT_COMMITTER_DATE="2025-05-10T09:00:00+00:00" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff longlived -m "Merge pull request #339 from zed/ordering-tests"
G branch -q -D longlived

rs src/lib.rs "Prerelease::is_empty"
c "Rae Rowe" rae@example.com "2025-06-02T10:00:00+00:00" "Add Prerelease::is_empty (#341)

Squashed from 4 commits.

Co-authored-by: Sol Sato <sol@example.com>"

bump 1.0.27
c "${MARA[@]}" "2025-07-01T09:00:00+00:00" "Release 1.0.27"

# after the release: must not be counted
bump 1.0.28
c "${MARA[@]}" "2025-07-02T09:00:00+00:00" "Start 1.0.28 development"
rs src/parse.rs "parse: faster path"
c "Tess Tran" tess@example.com "2025-07-03T10:00:00+00:00" "parse: faster path"

finish
