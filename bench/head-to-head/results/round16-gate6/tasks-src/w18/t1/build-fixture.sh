#!/usr/bin/env bash
REPO_URL=https://github.com/pallets/itsdangerous; PIN=62fde54d4ff717fa1c4af688dbebf97845fed495
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
ap() { mkdir -p "$(dirname "$DEST/$1")"; printf '%s\n' "$2" >> "$DEST/$1"; }
M="Gareth Imani"; ME="gareth@example.com"
GH="GitHub"; GHE="noreply@github.com"
DEP="dependabot[bot]"; DEPE="49699333+dependabot[bot]@users.noreply.github.com"
PCI="pre-commit-ci[bot]"; PCIE="66853113+pre-commit-ci[bot]@users.noreply.github.com"
GA="github-actions[bot]"; GAE="41898282+github-actions[bot]@users.noreply.github.com"

# before the window
ap docs/timed.rst "
Note: max_age is measured in seconds."
c "Ines Duarte" ines@example.com 2025-03-11T10:00:00+0000 "Clarify max_age in the timed serializer docs" "$M" $ME 2025-03-11T12:00:00+0000

# window opens 2025-10-24
ap .github/workflows/tests.yaml "# python matrix trimmed"
c "$M" $ME 2025-10-28T09:00:00+0000 "Trim the CI Python matrix"

# written 10 Oct, rebased and landed 2 Nov
ap src/itsdangerous/signer.py "# an empty secret key is rejected up front"
c "Marcus Oyelaran" marcus@example.com 2025-10-10T14:00:00+0000 "Raise a clear error for an empty secret key" "$M" $ME 2025-11-02T09:00:00+0000

ap .github/workflows/tests.yaml "# actions/checkout v5"
c "$DEP" "$DEPE" 2025-11-03T03:00:00+0000 "Bump actions/checkout from 4 to 5"
ap .pre-commit-config.yaml "# autoupdate 2025-11"
c "$PCI" "$PCIE" 2025-11-10T04:00:00+0000 "[pre-commit.ci] pre-commit autoupdate"

ap docs/signer.rst "
Rotating keys: pass a list of secret keys, newest last."
ap CHANGES.rst "- Document key rotation in the signing guide."
c "Hana Kobayashi" hana@example.com 2025-12-05T11:30:00+0000 "Document key rotation in the signing guide" "$M" $ME 2025-12-06T08:00:00+0000

ap tests/test_itsdangerous/test_timed.py "# edge case: max_age=0"
c "Omar Haddad" omar@example.com 2026-01-12T16:20:00+0000 "Add tests for timestamp edge cases" "$GH" $GHE 2026-01-12T16:20:00+0000

ap tests/test_itsdangerous/test_signer.py "# empty key raises"
c "M. Oyelaran" marcus@example.com 2026-02-14T10:00:00+0000 "Test the empty secret key error" "$M" $ME 2026-02-15T09:00:00+0000

ap src/itsdangerous/url_safe.py "# padding is restored before decoding"
ap tests/test_itsdangerous/test_url_safe.py "# padding round trip"
c "$M" $ME 2026-03-03T13:00:00+0000 $'Fix padding handling in URLSafeSerializer (#412)\n\nRestore base64 padding before decoding compressed payloads.\n\nCo-authored-by: Tomasz Nowak <tomasz@example.com>\nCo-authored-by: Priya Raman <priya@example.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>'

ap src/itsdangerous/signer.py "# derive_key reuses one digest object"
c "Priya Raman" priya@example.com 2026-03-20T09:15:00+0000 "Speed up Signer.derive_key" "$GH" $GHE 2026-03-20T09:15:00+0000

w .mailmap <<'MM'
Priya Raman <priya@example.com> <12345678+priyar@users.noreply.github.com>
MM
c "$M" $ME 2026-04-01T10:00:00+0000 "Add a mailmap"

ap src/itsdangerous/serializer.py "# loads_unsafe is typed"
c "priyar" 12345678+priyar@users.noreply.github.com 2026-05-02T18:00:00+0000 "Add typing for Serializer.loads_unsafe" "$GH" $GHE 2026-05-02T18:00:00+0000

ap README.md "
See the docs for a full tour."
c "Li Wei" liwei@example.com 2026-06-09T07:45:00+0000 "Fix typo in README" "$GH" $GHE 2026-06-09T07:45:00+0000

ap CHANGES.rst "- Fix a broken link."
c "Abbott Reyes" abbott@example.com 2026-07-07T12:00:00+0000 "Fix broken link in the changelog" "$M" $ME 2026-07-07T14:00:00+0000

ap uv.lock "# refreshed"
c "$GA" "$GAE" 2026-07-15T02:00:00+0000 "Update uv.lock"

ap tests/test_itsdangerous/test_serializer.py "# loads with empty payload"
c "Wei Li" liwei@example.com 2026-08-01T20:10:00+0000 "Add test for loads with an empty payload" "$GH" $GHE 2026-08-01T20:10:00+0000

# merge commit with a branch
G checkout -q -b pr430
ap docs/index.rst "
Navigation is grouped by task."
c "Hana Kobayashi" hana@example.com 2026-09-09T10:00:00+0000 "Reorganize the docs navigation"
G checkout -q fixture
ap pyproject.toml "# dev version"
c "$M" $ME 2026-09-10T09:00:00+0000 "Start the next development version"
GIT_AUTHOR_NAME="$M" GIT_AUTHOR_EMAIL=$ME GIT_AUTHOR_DATE=2026-09-12T09:00:00+0000 \
GIT_COMMITTER_NAME="$M" GIT_COMMITTER_EMAIL=$ME GIT_COMMITTER_DATE=2026-09-12T09:00:00+0000 \
G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "Merge pull request #430 from hana/docs-nav" pr430
G branch -q -D pr430

ap docs/conf.py "# docs build pinned"
c "$M" $ME 2026-10-02T09:00:00+0000 "Pin the docs build requirements"
finish
