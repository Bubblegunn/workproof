#!/usr/bin/env bash
REPO_URL=https://github.com/dtolnay/itoa; PIN=758499d5663211927f5c4e3b5694542b7e755952
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
# ---- t4: three CV claims about Noor Haddad ----
NN="Noor Haddad"; NE1="noor.haddad@example.com"; NE2="noor@users.noreply.example"
EN="Eli Moreau"; EE="eli@example.org"
RS='pub const %s_%03d: &str = "%s_%03d";'
gen src/error.rs ERR 30 "$RS"
c "$EN" "$EE" "2025-02-10T10:00:00+00:00" "Add error enum"
G checkout -q -b noor-harness
gen benches/harness.rs HARNESS 40 "$RS"
c "$NN" "$NE1" "2025-03-03T09:00:00+00:00" "bench: scaffold harness" "$EN" "$EE" "2025-04-14T09:00:00+00:00"
gen benches/harness.rs CASES 30 "$RS"
c "$NN" "$NE1" "2025-03-05T09:30:00+00:00" "bench: add u64 cases" "$EN" "$EE" "2025-04-14T09:01:00+00:00"
gen benches/harness.rs TABLE 20 "$RS"
c "$NN" "$NE1" "2025-03-11T10:15:00+00:00" "bench: add output table" "$EN" "$EE" "2025-04-14T09:02:00+00:00"
G checkout -q fixture
M noor-harness "$EN" "$EE" "2025-04-14T09:10:00+00:00" "Merge branch 'noor-harness'"
G branch -q -D noor-harness
gen src/simd.rs SIMD 120 "$RS"
c "$EN" "$EE" "2025-05-02T14:00:00+00:00" "Add SIMD formatting path (#27)

Based on the prototype in #19 by Noor Haddad.

Co-authored-by: $NN <$NE2>"
gen src/error.rs ERRV2 40 "$RS"
c "$EN" "$EE" "2025-06-16T11:00:00+00:00" "Rework error handling (#33)

Reviewed-by: $NN <$NE2>
Reviewed-by: Kim Lowe <kim@example.org>"
G mv benches/harness.rs benches/runner.rs
c "$EN" "$EE" "2025-07-01T09:00:00+00:00" "bench: move harness to runner"
subst benches/runner.rs '1,5s/;$/; \/\/ tidy/'
c "$EN" "$EE" "2025-08-12T09:00:00+00:00" "bench: tidy runner"
subst benches/runner.rs '60s/;$/; \/\/ fix/'
c "$NN" "$NE2" "2026-01-15T10:00:00+00:00" "fix: off-by-one in benchmark output table"
finish
