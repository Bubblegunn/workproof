#!/usr/bin/env bash
# Fixture for task 1. Deterministic: same pin + fixed identities/dates => same HEAD sha.
REPO_URL=https://github.com/hukkin/tomli.git; PIN=43a86ade8b795c6ef9b4ec53372a607cd1ed426f
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
M_NAME="Mira Kovacs"; M_EMAIL="mira@example.com"
P=src/tomli/_parser.py
printf 'Mira Kovacs <mira@example.com> <mira.kovacs@example.org>\n' > "$D/.mailmap"
g add -Af
sc "Mira Kovacs" mira@example.com "2025-10-01T09:00:00+0000" "Import tomli snapshot"
# before the window
ap $P "# note: empty inline tables"
sc "Ana Souza" ana@example.com "2025-11-12T10:00:00+0000" "Handle empty inline tables"
ap CHANGELOG.md "- 2.1.0 release notes"
sc "Mira Kovacs" mira.kovacs@example.org "2025-12-20T14:00:00+0100" "Bump version to 2.1.0"
# 2025-12-31 23:30 at UTC-5 is 2026-01-01 04:30 UTC: inside the window
ap README.md "Offsets such as -05:00 are kept as fixed-offset timezones."
sc "Cara Lindqvist" cara@example.org "2025-12-31T23:30:00-0500" "Document datetime offsets in README"
# 2026-01-01 00:20 at UTC+2 is 2025-12-31 22:20 UTC: outside the window
ap CHANGELOG.md "- fix typo"
sc "Dana Whitfield" dana@example.com "2026-01-01T00:20:00+0200" "Fix typo in CHANGELOG"
ap .github/workflows/tests.yaml "# checkout v5"
sc "dependabot[bot]" bot@example.invalid "2026-01-08T09:15:00+0000" "Bump actions/checkout from 4 to 5"
g checkout -q -b dotted-keys
ap $P "# dotted keys may contain spaces around the dot"
sc "Ana Souza" ana@example.com "2026-01-14T11:00:00+0000" "Fix parsing of dotted keys with spaces"
mg dotted-keys "2026-01-16T09:00:00+0000" "Merge pull request #41 from ana/dotted-keys"
ap $P "# faster scan loop"
sc "Mira Kovacs" mira.kovacs@example.org "2026-01-22T16:40:00+0100" "Speed up string scanning in _parser"
ap tests/test_misc.py "# nested arrays of tables"
sc "Ben Okoro" ben@example.net "2026-02-03T10:00:00+0000" "Add test for nested arrays of tables"
ap $P "# literal strings: reject control characters"
sc "Mira Kovacs" mira@example.com "2026-02-17T12:00:00+0000" "Reject control characters in literal strings"
g checkout -q -b noreply-fix
ap $P "# keep key order stable for inline tables"
cm "asouza" asouza@users.noreply.example.org "2026-02-25T18:00:00+0000" "asouza" asouza@users.noreply.example.org "2026-02-25T18:00:00+0000" $'Keep key order stable for inline tables\n\nSigned-off-by: Ana Souza <ana@example.com>'
mg noreply-fix "2026-02-26T08:00:00+0000" "Merge pull request #44 from asouza/noreply-fix"
ap .github/workflows/tests.yaml "# setup-python v6"
sc "dependabot[bot]" bot@example.invalid "2026-03-02T09:15:00+0000" "Bump actions/setup-python from 5 to 6"
ap README.md "Docs: error messages now show line and column."
sc "Cara Lindqvist" cara@example.org "2026-03-05T13:20:00+0000" "Show line and column in error messages (docs)"
ap benchmark/run.py "# benchmark with 3.14"
sc "Mira Kovacs" mira@example.com "2026-03-19T10:00:00+0000" "Run benchmark on Python 3.14"
ap $P "# offset-aware datetime parsing"
sc "Ben Okoro" ben@example.net "2026-04-02T15:30:00+0100" "Parse offset datetimes without regex backtracking"
g checkout -q -b asouza-escape
ap $P "# unicode escapes: \\U00110000 is invalid"
cm "asouza" asouza@users.noreply.example.org "2026-04-08T09:00:00+0000" "asouza" asouza@users.noreply.example.org "2026-04-08T09:00:00+0000" $'Reject out-of-range unicode escapes\n\nSigned-off-by: Ana Souza <ana@example.com>'
mg asouza-escape "2026-04-09T08:00:00+0000" "Merge pull request #47 from asouza/asouza-escape"
ap .pre-commit-config.yaml "# pin hooks"
sc "github-actions[bot]" actions@example.invalid "2026-04-14T00:05:00+0000" "chore: autoupdate pre-commit hooks"
ap $P "# int parsing: underscores"
sc "Ana Souza" ana@example.com "2026-04-21T10:10:00+0000" "Validate underscores in integer literals"
ap $P "# date-time: allow space separator"
sc "Ana Souza" ana@example.com "2026-05-06T10:10:00+0000" "Accept space separator in date-times"
g checkout -q -b eli-types
ap src/tomli/_types.py "# type alias cleanup"
sc "Eli Park" eli@example.org "2026-05-11T12:00:00-0700" "Tidy type aliases in _types"
mg eli-types "2026-05-12T08:00:00+0000" "Merge pull request #51 from eli/types"
ap .github/workflows/tests.yaml "# codecov v5"
sc "dependabot[bot]" bot@example.invalid "2026-05-18T09:15:00+0000" "Bump codecov/codecov-action from 4 to 5"
ap $P "# fuzz: crash on deeply nested arrays"
sc "Mira Kovacs" mira.kovacs@example.org "2026-06-03T09:00:00+0200" "Fix recursion crash found by fuzzer"
ap .github/workflows/tests.yaml "# upload-artifact v5"
sc "dependabot[bot]" bot@example.invalid "2026-06-09T09:15:00+0000" "Bump actions/upload-artifact from 4 to 5"
ap tests/test_misc.py "# nested tables ordering"
sc "Ben Okoro" ben@example.net "2026-06-17T10:00:00+0000" "Add regression test for table ordering"
ap CHANGELOG.md "- 2.2.0 notes"
sc "Mira Kovacs" mira@example.com "2026-06-25T17:00:00+0000" "Prepare 2.2.0 changelog"
ap .github/workflows/tests.yaml "# python 3.14"
sc "github-actions[bot]" actions@example.invalid "2026-06-29T00:05:00+0000" "chore: sync CI matrix"
# 2026-07-01 00:30 at UTC+2 is 2026-06-30 22:30 UTC: inside the window
ap tests/test_misc.py "# trailing comma edge case"
sc "Ben Okoro" ben@example.net "2026-07-01T00:30:00+0200" "Cover trailing comma edge case in arrays"
# after the window
ap CHANGELOG.md "- 2.2.0 released"
sc "Dana Whitfield" dana@example.com "2026-07-01T00:05:00+0000" "Release notes wording"
ap $P "# py3.15 compat"
sc "Eli Park" eli@example.org "2026-08-12T10:00:00+0000" "Prepare for Python 3.15"
