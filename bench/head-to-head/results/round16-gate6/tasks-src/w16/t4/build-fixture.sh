#!/usr/bin/env bash
REPO_URL=https://github.com/sharkdp/hexyl; PIN=abc20a380c8c2d9d76c1976222725d3211cef809
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
# gen <file> <prefix> <lines> <multiplier>: deterministic Rust file, exactly N lines
gen() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" -v m="$4" 'BEGIN{for(i=1;i<=n;i++) printf "pub const %s_%d: u32 = %d;\n", p, i, i*m}' > "$DEST/$1"; }
mg() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "$5" "$1"
}
lock() { for i in $(seq 1 "$1"); do echo "# locked-$2-$i" >> "$DEST/Cargo.lock"; done; }
SV=(Sven\ Larsen sven.larsen@example.com); TA=(Tara\ Singh tara.singh@example.com)

# --- Q1 2026 (before the compared quarters) ---
gen src/palette.rs pal 14 2
c "Sven Larsen" sven.larsen@example.com "2026-03-28T10:00:00Z" "Add palette module"

# --- Q2 2026 ---
gen src/offsets.rs off 30 3
c "Sven Larsen" sven.larsen@example.com "2026-04-06T10:00:00Z" "Add offset parsing"
gen src/blocks.rs blk 20 5
c "Tara Singh" tara.singh@example.com "2026-04-14T10:00:00Z" "Add block size option"
gen src/offsets.rs off 55 3
c "Sven Larsen" sven.larsen@example.com "2026-05-05T10:00:00Z" "Support negative offsets"
lock 200 q2
c "dependabot[bot]" dependabot@example.invalid "2026-05-12T05:00:00Z" "Bump clap from 4.5.1 to 4.5.9"
gen src/blocks.rs blk 15 7
c "Tara Singh" tara.singh@example.com "2026-05-19T10:00:00Z" "Rework block size option"
gen src/empty.rs emp 12 1
c "Sven Larsen" sven.larsen@example.com "2037-05-28T10:00:00Z" "Handle zero-length input"
gen src/squeeze.rs sq 18 4
c "Tara Singh" tara.singh@example.com "2026-06-10T10:00:00Z" "Fix squeeze on final line"

# --- Q3 2026 ---
gen src/themes.rs th 40 2
c "Sven Larsen" sven.larsen@example.com "2026-07-07T10:00:00Z" "Add theme loading"
gen src/pipe.rs pipe 22 6
c "Tara Singh" tara.singh@example.com "1970-01-01T00:00:00Z" "Read from pipes without buffering everything" "Tara Singh" tara.singh@example.com "2026-07-15T10:00:00Z"
G checkout -q -b feat/colours
gen src/colour_a.rs ca 10 2
c "Sven Larsen" sven.larsen@example.com "2026-08-03T10:00:00Z" "Add colour table A"
gen src/colour_b.rs cb 12 2
c "Tara Singh" tara.singh@example.com "2026-08-04T10:00:00Z" "Add colour table B"
gen src/colour_c.rs cc 8 2
c "Sven Larsen" sven.larsen@example.com "2026-08-05T10:00:00Z" "Wire colour tables into the printer"
G checkout -q fixture
mg feat/colours "Sven Larsen" sven.larsen@example.com "2026-08-06T10:00:00Z" "Merge branch 'feat/colours'"
G branch -q -D feat/colours
lock 4 q3a
c "dependabot[bot]" dependabot@example.invalid "2026-08-10T05:00:00Z" "Bump serde from 1.0.200 to 1.0.210"
gen src/themes_builtin.rs thb 60 5
c "Tara Singh" tara.singh@example.com "2026-08-20T10:00:00Z" "$(printf 'Add built-in colour themes (#58)\n\nSquashed from 6 commits.\n\nCo-authored-by: Mei Okoro <mei.okoro@example.com>')"
lock 300 q3b
printf '\n# bumped dependencies\n' >> "$DEST/Cargo.toml"
c "Sven Larsen" sven.larsen@example.com "2026-09-01T10:00:00Z" "Update dependencies"
gen src/ansi.rs ansi 17 3
c "Tara Singh" tara.singh@example.com "2037-03-03T10:00:00Z" "Strip ANSI sequences in text column"
lock 2 q3c
c "dependabot[bot]" dependabot@example.invalid "2026-09-09T05:00:00Z" "Bump regex from 1.10.0 to 1.11.0"
gen src/width.rs wid 28 9
c "Tara Singh" tara.singh@example.com "2026-09-18T10:00:00Z" "Respect terminal width"
w VERSION <<'M'
0.17.0
M
c "github-actions[bot]" actions@example.invalid "2026-09-25T12:00:00Z" "Release 0.17.0"

# --- after the quarter ---
gen src/after.rs aft 9 1
c "Sven Larsen" sven.larsen@example.com "2026-10-03T10:00:00Z" "Add after-quarter option"
finish
