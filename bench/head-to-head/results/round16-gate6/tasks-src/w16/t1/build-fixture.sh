#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/slugify; PIN=d572cba97a8f661d201f4e8bdc0842bc532c9773
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

# gen <file> <prefix> <lines> <multiplier>: deterministic file, N lines
gen() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" -v m="$4" 'BEGIN{for(i=1;i<=n;i++) printf "export const %s%d = %d;\n", p, i, i*m}' > "$DEST/$1"; }
# mg <branch> <name> <email> <date> <message>: merge commit with --no-ff
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"
}

PRIYA=(Priya\ Nair priya.nair@example.com)
# --- setup: identity hints and generated-file marker ---
w .mailmap <<'M'
Ana Ruiz <ana.ruiz@example.com> <ana@personal.example.net>
Ben Okafor <ben.okafor@example.com> bokafor <bokafor@users.noreply.example>
M
printf '\ndist/** linguist-generated=true\n' >> "$DEST/.gitattributes"
c "Priya Nair" priya.nair@example.com "2025-03-11T10:00:00Z" "Add .mailmap and mark dist as generated"

# --- history before the quarter ---
gen lib/locales.js loc 40 3
c "Priya Nair" priya.nair@example.com "2025-03-12T09:00:00Z" "Add locale tables"
gen lib/lookup.js look 30 5
c "Ana R." ana@personal.example.net "2025-11-04T14:20:00Z" "Add lookup helper"
gen lib/german.js de 22 2
c "Chen Wei" chen.wei@example.com "2026-05-20T08:45:00Z" "Add german transliteration"
gen dist/slugify.min.js min 200 1
c "Ben Okafor" ben.okafor@example.com "2026-02-12T16:00:00Z" "Build dist"

# --- inside / around the quarter (reporting zone Pacific/Auckland) ---
gen lib/tr.js tr 25 4
c "Chen Wei" chen.wei@example.com "2026-06-30T12:30:00Z" "Add Turkish transliteration table"
gen lib/sep.js sep 30 6
c "Ana Ruiz" ana@personal.example.net "2026-06-24T09:00:00Z" "Support custom separators" "Ana Ruiz" ana@personal.example.net "2026-07-09T03:00:00Z"
gen lib/empty.js empty 12 9
c "Ana Ruiz" aruiz@contractor.example.org "2026-07-14T09:00:00Z" "Handle empty input"

G checkout -q -b feat/locales
gen lib/locales-eu.js eu 20 3
c "Chen Wei" chen.wei@example.com "2026-08-03T01:10:00Z" "Add Basque table"
gen lib/locales-ca.js ca 15 3
c "Chen Wei" chen.wei@example.com "2026-08-04T02:20:00Z" "Add Catalan table"
gen lib/locales-gl.js gl 10 3
c "Chen Wei" chen.wei@example.com "2026-08-05T03:30:00Z" "Add Galician table"
G checkout -q fixture
mg feat/locales "Priya Nair" priya.nair@example.com "2026-08-06T02:00:00Z" "Merge pull request #41 from chen/locales"
G branch -q -D feat/locales

gen lib/lookup.js look 18 8
c "bokafor" bokafor@users.noreply.example "2026-08-12T22:15:00Z" "Speed up lookup"
w deps/xo.version <<'M'
xo 1.2.0
M
c "renovate[bot]" bot@renovate.example "2026-08-15T05:00:00Z" "Update dependency xo to v1.2.0"
w version.txt <<'M'
4.2.0
M
c "Release Bot" release-bot@example.invalid "2026-08-31T12:00:00Z" "chore(release): v4.2.0"
gen dist/slugify.min.js min 400 2
printf 'See the changelog for the rebuilt bundle.\nIt is generated.\nDo not edit by hand.\n' >> "$DEST/readme.md"
c "Ben Okafor" ben.okafor@example.com "2026-09-02T07:30:00Z" "Rebuild dist and note it in the readme"
for i in $(seq 1 22); do echo "Overridable replacement note $i." >> "$DEST/readme.md"; done
c "Priya Nair" priya.nair@example.com "2026-09-10T09:00:00Z" "Docs: explain overridable replacements"
gen lib/counter.js cnt 6 11
c "Ben Okafor" ben.okafor@example.com "2026-09-30T10:30:00Z" "Fix off-by-one in counter"
gen lib/normalise.js norm 16 13
c "Ana Ruiz" ana.ruiz@example.com "2026-09-30T11:30:00Z" "Add normalise option"
gen lib/korean.js ko 9 2
c "Chen Wei" chen.wei@example.com "2026-10-02T09:00:00Z" "Add Korean table"
finish
