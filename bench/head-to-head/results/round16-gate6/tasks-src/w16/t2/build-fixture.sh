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

# gen <file> <prefix> <lines> <multiplier>: deterministic python file, N lines
gen() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" -v m="$4" 'BEGIN{for(i=1;i<=n;i++) printf "def %s_%d():\n    return %d\n", p, i, i*m}' > "$DEST/$1"; }
# genl <file> <prefix> <lines> <multiplier>: exactly N lines (one assignment per line)
genl() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" -v m="$4" 'BEGIN{for(i=1;i<=n;i++) printf "%s_%d = %d\n", p, i, i*m}' > "$DEST/$1"; }
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"
}
MAYA=(Maya\ Fischer maya.fischer@example.com); TOM=(Tom\ Reyes tom.reyes@example.com); LENA=(Lena\ Kovacs lena.kovacs@example.com)

# --- before the quarter ---
genl src/itsdangerous/compare.py cmp 40 3
genl src/itsdangerous/payload.py pay 20 2
genl src/itsdangerous/legacy_sign.py leg 50 4
genl src/itsdangerous/errors2.py err 26 5
c "Tom Reyes" tom.reyes@example.com "2026-05-12T10:00:00Z" "Add comparison, payload, legacy signing and error modules"
genl src/itsdangerous/outside_fix.py old 10 1
c "Lena Kovacs" lena.kovacs@example.com "2026-06-29T08:00:00Z" "Fix stale cache key"

# --- the quarter: 2026-07-01 .. 2026-09-30 ---
genl src/itsdangerous/maxage.py maxage 45 2
c "Maya Fischer" maya.fischer@example.com "2026-07-06T09:00:00Z" "feat: add max_age to URLSafeSerializer.loads"
genl src/itsdangerous/rotation.py rot 60 3
c "Tom Reyes" tom.reyes@example.com "2026-07-10T09:00:00Z" "Add support for key rotation"
genl src/itsdangerous/bulk.py bulk 30 7
c "Lena Kovacs" lena.kovacs@example.com "2026-07-15T09:00:00Z" "fix: add dumps_many helper for batches"
genl src/itsdangerous/compare.py cmp 42 5
c "Tom Reyes" tom.reyes@example.com "2026-07-20T09:00:00Z" "Fix signature timing comparison"
genl src/itsdangerous/payload.py pay 24 9
c "Maya Fischer" maya.fischer@example.com "2026-07-28T09:00:00Z" "chore: handle None payload"
genl src/itsdangerous/msgpack_ser.py mp 50 11
c "Lena Kovacs" lena.kovacs@example.com "2026-08-03T09:00:00Z" "Add experimental msgpack serializer"
G rm -q src/itsdangerous/msgpack_ser.py
c "Lena Kovacs" lena.kovacs@example.com "2026-08-04T09:00:00Z" 'Revert "Add experimental msgpack serializer"'
for i in 1 2 3 4; do echo "- badge $i updated" >> "$DEST/README.md"; done
c "Tom Reyes" tom.reyes@example.com "2026-08-10T09:00:00Z" "Update README badges"
for f in src/itsdangerous/encoding.py src/itsdangerous/exc.py src/itsdangerous/serializer.py src/itsdangerous/signer.py src/itsdangerous/timed.py src/itsdangerous/url_safe.py; do awk '{print} /:$/ {print ""}' "$DEST/$f" > "$DEST/$f.tmp" && mv "$DEST/$f.tmp" "$DEST/$f"; done
c "Maya Fischer" maya.fischer@example.com "2026-08-12T09:00:00Z" "style: apply formatter to src"
genl third_party/simplejson/decoder.py sj 600 1
printf 'Vendored copy of simplejson 3.19, do not edit.\n' > "$DEST/third_party/simplejson/VENDORED.txt"
c "Tom Reyes" tom.reyes@example.com "2026-08-14T09:00:00Z" "Vendor simplejson 3.19 for the JSON fallback"
genl src/itsdangerous/legacy_sign.py leg 45 6
c "Maya Fischer" maya.fischer@example.com "2026-08-20T09:00:00Z" "Refactor legacy signer into smaller pieces"
genl docs/rotation.rst doc 35 1
c "Lena Kovacs" lena.kovacs@example.com "2026-08-25T09:00:00Z" "docs: document key rotation"
printf '      - uses: actions/checkout@v5\n' >> "$DEST/.github/workflows/tests.yaml"
c "dependabot[bot]" dependabot@example.invalid "2026-08-26T05:00:00Z" "Bump actions/checkout from 4 to 5"
printf '      - uses: actions/setup-python@v6\n' >> "$DEST/.github/workflows/tests.yaml"
c "dependabot[bot]" dependabot@example.invalid "2026-09-01T05:00:00Z" "Bump actions/setup-python from 5 to 6"
G checkout -q -b fix/errors
genl src/itsdangerous/errors2.py err 28 8
c "Maya Fischer" maya.fischer@example.com "2026-09-01T09:00:00Z" "Fix loads() raising the wrong exception type"
G checkout -q fixture
mg fix/errors "Tom Reyes" tom.reyes@example.com "2026-09-02T09:00:00Z" "Merge pull request #212 from maya/errors"
G branch -q -D fix/errors
printf '  - repo: local-hook-bump\n' >> "$DEST/.pre-commit-config.yaml"
c "pre-commit-ci[bot]" pre-commit-ci@example.invalid "2026-09-07T05:00:00Z" "[pre-commit.ci] pre-commit autoupdate"
for i in 1 2 3; do echo "        - \"3.14\"" >> "$DEST/.github/workflows/tests.yaml"; done
c "Maya Fischer" maya.fischer@example.com "2026-09-15T09:00:00Z" "Add Python 3.14 to the test matrix"
genl src/itsdangerous/saltcfg.py salt 33 4
c "Tom Reyes" tom.reyes@example.com "2026-09-22T09:00:00Z" "feat: configurable salt length"
genl src/itsdangerous/after.py after 15 3
c "Lena Kovacs" lena.kovacs@example.com "2026-10-02T09:00:00Z" "feat: add after-quarter helper"
finish
