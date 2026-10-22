#!/usr/bin/env bash
# build-fixture.sh <dest-dir> : hexyl (Rust) + synthetic history for task c3
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"
git clone -q https://github.com/sharkdp/hexyl "$DEST"
cd "$DEST"
git checkout -q -B main abc20a380c8c2d9d76c1976222725d3211cef809
git remote remove origin
git tag -l | xargs -r git tag -d >/dev/null
git for-each-ref refs/heads --format='%(refname:short)' | grep -v '^main$' | xargs -r git branch -D >/dev/null || true

# c AUTHOR_NAME AUTHOR_EMAIL AUTHOR_DATE COMMITTER_NAME COMMITTER_EMAIL COMMITTER_DATE MSG
c() {
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="$4" GIT_COMMITTER_EMAIL="$5" GIT_COMMITTER_DATE="$6" \
  git commit -q -m "$7"
}
genrs() { awk -v n="$3" -v p="$2" 'BEGIN{for(i=1;i<=n;i++) printf "pub fn %s_%d(x: u8) -> u8 {\n    x.wrapping_add(%d)\n}\n\n", p,i,i}' > "$1"; }
J='Jun Park'; EJ='jun.park@candidate-mail.example'
S='Sam Ortiz'; ES='sam.ortiz@themes.example'

genrs src/theme.rs theme 50
c "$S" "$ES" '2025-03-04T10:00:00+00:00' "$J" "$EJ" '2025-04-29T09:00:00+00:00' 'Add Theme trait and palette struct'

genrs src/theme_load.rs load 30
c "$J" "$EJ" '2025-03-10T14:00:00+00:00' "$J" "$EJ" '2025-04-29T09:01:00+00:00' 'Add theme loading from TOML'

for i in $(seq 1 35); do printf '// theme flag wiring %d\n' $i >> src/main.rs; done
c "$J" "$EJ" '2025-03-12T16:30:00+00:00' "$J" "$EJ" '2025-04-29T09:02:00+00:00' 'Wire --theme flag'

awk '{print} /^ *(pub )?fn .*\{$/ {print ""}' src/lib.rs > src/lib.rs.new && mv src/lib.rs.new src/lib.rs
c "$J" "$EJ" '2025-03-14T11:00:00+00:00' "$J" "$EJ" '2025-04-29T09:03:00+00:00' 'Run cargo fmt'

mkdir -p themes
for t in solarized gruvbox nord; do
  { printf '# Copied from https://github.com/alexrivera/termthemes (MIT) Copyright (c) 2019 Alex Rivera\n'
    for i in $(seq 1 49); do printf 'color%d = "#%02x%02x%02x"\n' $i $((i*3)) $((i*5)) $((i*7)); done; } > themes/$t.toml
done
c "$J" "$EJ" '2025-03-20T09:45:00+00:00' "$J" "$EJ" '2025-04-29T09:04:00+00:00' 'Add bundled themes: solarized, gruvbox, nord'

genrs tests/theme_tests.rs test_theme 20
c "$J" "$EJ" '2025-03-24T13:15:00+00:00' "$J" "$EJ" '2025-04-29T09:05:00+00:00' 'Add theme tests'

{ printf '\n## Themes\n\n'; for i in $(seq 1 23); do printf 'Theme usage note %d.\n' $i; done; } >> README.md
c "$J" "$EJ" '2025-03-26T17:00:00+00:00' "$J" "$EJ" '2025-04-29T09:06:00+00:00' 'docs: theme section in README'

printf '\nSee themes/ for the bundled palettes.\n' >> README.md
c "$J" "$EJ" '2025-03-27T10:00:00+00:00' "$J" "$EJ" '2025-04-29T09:07:00+00:00' 'fix typos'
git status --porcelain | grep . && exit 1 || true
