#!/usr/bin/env bash
REPO_URL=https://github.com/lukeed/kleur; PIN=fa3454483899ddab550d08c18c028e6db1aab0e5
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
# --- helpers added by the task author (below the required header) ---
# gen <file> <prefix> <count> <printf-format taking name,i,name,i>: append count unique lines
gen() { local f="$DEST/$1" p="$2" n="$3" fmt="$4" i=1; mkdir -p "$(dirname "$f")"
  while [ $i -le $n ]; do printf "$fmt
" "$p" $i "$p" $i; i=$((i+1)); done >> "$f"; }
# M <branch> <name> <email> <date> <message>: no-ff merge
M() { GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"; }
# subst <file> <sed-expr>: portable in-place sed
subst() { sed "$2" "$DEST/$1" > "$DEST/$1.tmp" && mv "$DEST/$1.tmp" "$DEST/$1"; }
# ---- t3: top contributor in 2025 ----
JN="Jordan Lee"; JE1="jlee@laptop.example.invalid"; JE2="jordan.lee@example.com"
SN="Sam Okoye"; SE="sam@example.org"; SN2="Samuel Okoye"; SE2="samuel.okoye@example.com"
RN="Rin Takeda"; RE="rin@example.net"
BN="renovate[bot]"; BE="29139614+renovate[bot]@users.noreply.example"
J1="export const %s_%03d = '%s_%03d';"
J2='export const %s_%03d = "%s_%03d";'
gen src/palette.mjs PALETTE 40 "$J1"
c "$SN" "$SE" "2025-01-14T10:00:00+00:00" "Add palette module"
w .mailmap <<'M'
Jordan Lee <jordan.lee@example.com> <jlee@laptop.example.invalid>
Sam Okoye <sam@example.org> Samuel Okoye <samuel.okoye@example.com>
M
c "$RN" "$RE" "2025-02-03T09:00:00+00:00" "Add .mailmap"
gen src/detect.mjs DETECT 50 "$J1"
c "$SN2" "$SE2" "2025-02-20T10:00:00+00:00" "Add color detection"
gen vendor/ansi-regex/index.js VENDOR 4000 "var %s_%03d = '%s_%03d';"
c "$JN" "$JE1" "2025-03-05T12:00:00+00:00" "Vendor ansi-regex for strip support"
gen npm-shrinkwrap.json LOCK 2500 '"%s_%03d": {"resolved": "%s_%03d"},'
c "$JN" "$JE1" "2025-03-06T12:00:00+00:00" "Add npm-shrinkwrap.json"
gen src/strip.mjs STRIP 35 "$J1"
c "$JN" "$JE1" "2025-03-10T12:00:00+00:00" "Add strip helper"
gen test/detect.test.mjs DTEST 45 "$J1"
c "$SN" "$SE" "2025-04-02T10:00:00+00:00" "Add tests for detect"
echo '"renovate_pin": {"resolved": "uvu"},' >> "$DEST/npm-shrinkwrap.json"
c "$BN" "$BE" "2025-04-15T02:00:00+00:00" "chore(deps): update dependency uvu to v0.5.6"
gen src/env.mjs ENV 30 "$J1"
c "$RN" "$RE" "2025-05-08T09:00:00+00:00" "Add NO_COLOR support"
for f in palette detect strip env; do subst src/$f.mjs "s/'/\"/g"; done
c "$JN" "$JE2" "2025-06-02T12:00:00+00:00" "style: apply prettier to src"
gen dist/kleur.min.js DIST 1200 "var %s_%03d=\"%s_%03d\";"
c "$JN" "$JE2" "2025-06-03T12:00:00+00:00" "Add dist build output"
gen src/palette.mjs ALIAS 20 "$J2"
c "$SN" "$SE" "2025-07-21T10:00:00+00:00" "Add palette aliases"
gen src/detect.mjs CI 10 "$J2"
c "$SN2" "$SE2" "2025-08-30T10:00:00+00:00" "Fix detect for CI environments"
gen test/strip.test.mjs STEST 25 "$J2"
c "$JN" "$JE2" "2025-09-12T12:00:00+00:00" "Add strip tests"
gen readme.md NOCOLOR 12 "%s_%03d documents %s_%03d"
c "$RN" "$RE" "2025-10-01T09:00:00+00:00" "Document NO_COLOR"
gen test/env.test.mjs ETEST 30 "$J2"
c "$SN" "$SE" "2025-11-18T10:00:00+00:00" "Add env tests"
gen src/strip.mjs FAST 15 "$J2"
c "$JN" "$JE2" "2025-12-31T21:00:00-08:00" "Add strip fast path"
gen vendor/ansi-regex/index.js VENDOR2 1500 "var %s_%03d = '%s_%03d';"
c "$JN" "$JE2" "2026-01-09T12:00:00+00:00" "Update vendored ansi-regex"
gen bench/run.mjs BENCH 20 "$J2"
c "$JN" "$JE2" "2026-02-02T12:00:00+00:00" "Add benchmark"
finish
