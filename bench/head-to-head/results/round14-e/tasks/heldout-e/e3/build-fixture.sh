#!/usr/bin/env bash
# build-fixture.sh <dest-dir>  -- deterministic fixture (public repo pinned at an exact commit + synthetic commits)
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
DEST="${1:?usage: build-fixture.sh <dest-dir>}"
case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then echo "dest not empty: $DEST" >&2; exit 1; fi
CL=/private/tmp/claude-uid/-Users-user-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/he-clones
mkdir -p "$CL"; T=$(mktemp -d "$CL/build.XXXXXX")
git clone -q https://github.com/dtolnay/anyhow.git "$T/r"
cd "$T/r"
git checkout -q -B main 9c0fb8b56cd19dfed91d05072c75fa7e0ec1a947
git remote remove origin
git tag -l | while read -r t; do git tag -d "$t" >/dev/null; done
git for-each-ref --format='%(refname:short)' refs/heads | { grep -vx main || true; } | while read -r b; do git branch -q -D "$b"; done
# cm NAME EMAIL AUTHOR_DATE MSG [CNAME CEMAIL CDATE] : commit with fixed identities and dates
cm() {
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  git commit -q --allow-empty -m "$4"
}
ci() { git add -A; cm "$@"; }
# mg NAME EMAIL DATE BRANCH MSG : non-fast-forward merge
mg() {
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" GIT_COMMITTER_DATE="$3" \
  git merge -q --no-ff -m "$5" "$4"
}
# gen N TEMPLATE : N lines, %d replaced by the line number
gen() { awk -v n="$1" -v t="$2" 'BEGIN{for(i=1;i<=n;i++){s=t; gsub(/%d/,i,s); print s}}'; }
S1=("Sam Lindqvist" "sam.lindqvist@mailbox.example")
S2=("Sam Lindqvist" "sam.lindqvist@othercorp.example")
WZ=("Wen Zhao" "wen.zhao@oss.example")
TM=("Tariq Mansour" "tariq.mansour@oss.example")
HR=("TalentCo Recruiting" "recruiting@talentco.example")
E=tools/errtrace/src
mkdir -p $E

gen 100 'pub fn trace_entry_%d() -> usize { %d }' > $E/lib.rs
ci "${S1[@]}" "2025-03-04T10:00:00+00:00" "add errtrace skeleton"
gen 150 'pub fn frame_%d() -> usize { %d }' > $E/trace.rs
ci "${S1[@]}" "2025-03-11T10:00:00+00:00" "errtrace: frame collection"
gen 11500 'pub const SYM_%d: u32 = %d;' > $E/table.rs
ci "${S1[@]}" "2025-03-20T10:00:00+00:00" "errtrace: generate symbol tables"
gen 80 'pub fn wen_helper_%d() -> usize { %d }' >> $E/lib.rs
ci "${WZ[@]}" "2025-03-27T10:00:00+00:00" "errtrace: public helpers"
gen 60 'pub fn render_%d() -> usize { %d }' > $E/render.rs
ci "${WZ[@]}" "2025-04-02T10:00:00+00:00" "errtrace: renderer"
gen 40 'fn test_errtrace_%d() { assert_eq!(%d, %d); }' > tools/errtrace/tests.rs
ci "${S1[@]}" "2025-04-09T10:00:00+00:00" "errtrace: tests"
for d in 10 11 14 15; do
  echo "Note $d: typo fixed." >> README.md
  ci "${S1[@]}" "2025-04-${d}T09:00:00+00:00" "docs: typo $d"
done
# commits authored by others but committed by candidate (he applied the patches)
echo "// patch a" >> tools/errtrace/tests.rs
ci "${WZ[@]}" "2025-04-20T10:00:00+00:00" "errtrace: test for render" "${S1[@]}" "2025-04-21T08:00:00+00:00"
echo "// patch b" >> tools/errtrace/tests.rs
ci "${TM[@]}" "2025-04-22T10:00:00+00:00" "errtrace: test for frames" "${S1[@]}" "2025-04-22T18:00:00+00:00"
echo "// patch c" >> tools/errtrace/tests.rs
ci "${TM[@]}" "2025-04-23T10:00:00+00:00" "errtrace: test for tables" "${S1[@]}" "2025-04-24T08:00:00+00:00"
# a different person with the same display name
gen 90 'pub fn metric_%d() -> usize { %d }' > $E/metrics.rs
ci "${S2[@]}" "2025-06-02T10:00:00+00:00" "errtrace: metrics"
for m in "06-20" "07-08" "07-30" "08-12" "09-01" "09-15"; do
  echo "// $m" >> tools/errtrace/tests.rs
  ci "${S2[@]}" "2025-${m}T10:00:00+00:00" "errtrace: metrics tests $m"
done
cat > CANDIDATE_CLAIMS.md <<'XEOF'
# Submission from Sam Lindqvist
Git identity used for the project: Sam Lindqvist <sam.lindqvist@mailbox.example>
Role applied for: Senior Rust Engineer

1. In calendar year 2025 I made 214 commits to this repository.
2. I am the sole author of the errtrace module (tools/errtrace).
3. I contributed over 11,000 lines of Rust to the project.
4. I worked on the project continuously from January to December 2025.
5. My errtrace work shipped in the 1.0.100 release of the crate.
XEOF
ci "${HR[@]}" "2026-01-05T09:00:00+00:00" "add candidate submission"
git reflog expire --expire=now --all
git gc -q --prune=now
mkdir -p "$(dirname "$DEST")"
mv "$T/r" "$DEST"; rmdir "$T"
echo "built $DEST HEAD=$(git -C "$DEST" rev-parse HEAD)"
