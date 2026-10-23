#!/usr/bin/env bash
URL=https://github.com/BurntSushi/walkdir
PIN=b0d16b759a59836756f8d0ec637f7f8d121a48cd
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"; git clone -q "$URL" "$DEST"; cd "$DEST"
git checkout -q "$PIN"; git checkout -q -B main
for b in $(git for-each-ref --format='%(refname:short)' refs/heads | grep -vx main); do git branch -q -D "$b"; done
git tag -l | xargs -r git tag -d >/dev/null
git remote remove origin
git reflog expire --expire=now --all; git gc -q --prune=now
c() { # author_name author_email author_date message [committer_date] [committer_name] [committer_email]
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="${6:-$1}" GIT_COMMITTER_EMAIL="${7:-$2}" GIT_COMMITTER_DATE="${5:-$3}" git commit -q --no-gpg-sign -m "$4"
}
gen() { mkdir -p "$(dirname "$1")"; seq -f "$3 line %g" 1 "$2" > "$1"; }

S="Sam Okafor"; SE=sam.okafor@brightlabs.example
P="Priya Nair"; PE=priya.nair@gmail.example
# body <indent> <guard-lines> <perm-lines>: prints the module with a fixed 45-field struct plus optional extra fields
body() {
  echo "// loop detection"; echo "pub struct LoopCheck {"
  for i in $(seq 1 45); do printf '%spub field_%s: u64,\n' "$1" $i; done
  for i in $(seq 1 $2); do printf '    pub depth_guard_%s: u32,\n' $i; done
  for i in $(seq 1 $3); do printf '    pub perm_err_%s: bool,\n' $i; done
  echo "}"
}
TAB=$(printf '\t')

body "$TAB" 0 0 > src/loopdetect.rs;  c "$S" $SE 2024-02-12T10:00:00+00:00 "Add loop detection for symlink cycles"
gen src/tests/loopdetect_tests.rs 30 test; c "$S" $SE 2024-02-20T10:00:00+00:00 "Add loopdetect tests"
git mv src/loopdetect.rs src/loops.rs;  c "$P" $PE 2024-05-03T09:00:00+05:30 "Move loop detection into loops module"
body "    " 0 0 > src/loops.rs;           c "$P" $PE 2024-05-03T11:30:00+05:30 "Rewrite loop detection module"
body "    " 13 0 > src/loops.rs;          c "$P" $PE 2024-05-06T10:00:00+05:30 "Add max-depth guard to loop check"
gen docs/loops.md 20 doc;               c "$P" $PE 2024-05-08T10:00:00+05:30 "Docs for loops module"
gen notes/prototype.md 10 proto;        c "$P" $PE 2023-11-02T12:00:00+05:30 "Initial loop detection prototype" 2024-05-09T10:00:00+05:30
body "    " 13 8 > src/loops.rs;          c "$S" $SE 2024-05-20T10:00:00+00:00 "Handle permission errors in loop check"
