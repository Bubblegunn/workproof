#!/usr/bin/env bash
REPO_URL=https://github.com/rubocop/rubocop-rake; PIN=f4e8b7644b357ff91d527b052153d8127a9ad7a1
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
# gen <file> <prefix> <lines> <multiplier>: deterministic Ruby file, exactly N lines
gen() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" -v m="$4" 'BEGIN{for(i=1;i<=n;i++) printf "%s_%d = %d\n", p, i, i*m}' > "$DEST/$1"; }
add() { for i in $(seq 1 "$3"); do echo "$2 line $i" >> "$DEST/$1"; done; }
COPS=lib/rubocop/cop/rake

# --- roster (who is on which team, effective-dated) ---
w docs/teams.csv <<'M'
email,name,team,effective_from
hanna.berg@example.com,Hanna Berg,Cops,2026-01-01
hberg@personal.example.net,Hanna Berg,Cops,2026-01-01
ravi.menon@example.com,Ravi Menon,Cops,2026-01-01
sofia.alvarez@example.com,Sofia Alvarez,Tooling,2026-01-01
yusuf.demir@example.com,Yusuf Demir,Docs,2026-01-01
M
c "Hanna Berg" hanna.berg@example.com "2026-01-05T10:00:00Z" "Add team roster"

# --- just before the quarter ---
gen $COPS/old_cop.rb old 10 1
c "Hanna Berg" hanna.berg@example.com "2026-06-30T10:00:00Z" "Add old cop"

# --- Q3 2026 ---
gen $COPS/task_name_convention.rb tnc 40 2
c "Hanna Berg" hanna.berg@example.com "2026-07-02T10:00:00Z" "Add Rake/TaskNameConvention cop"
gen $COPS/desc_fix.rb dfx 24 3
c "Ravi Menon" ravi.menon@example.com "2026-07-09T10:00:00Z" "Fix false positive in Desc"
add .github/workflows/main.yml "      # cache" 6
c "Sofia Alvarez" sofia.alvarez@example.com "2026-07-16T10:00:00Z" "Speed up CI with bundler cache"
add README.md "Docs for the new cop:" 20
c "Yusuf Demir" yusuf.demir@example.com "2026-07-23T10:00:00Z" "Document new cop"
gen $COPS/prerequisite_order.rb pre 55 4
c "Hanna Berg" hanna.berg@example.com "2026-08-04T10:00:00Z" "$(printf 'Add Rake/PrerequisiteOrder cop (#91)\n\nSquashed from 4 commits.\n\nCo-authored-by: Yusuf Demir <yusuf.demir@example.com>\nCo-authored-by: H. Berg <hberg@personal.example.net>')"
gen $COPS/helper_refactor.rb hlp 30 5
c "Ravi Menon" ravi.menon@example.com "2026-08-12T10:00:00Z" "Refactor helper module"
echo "ravi.menon@example.com,Ravi Menon,Tooling,2026-08-15" >> "$DEST/docs/teams.csv"
c "Hanna Berg" hanna.berg@example.com "2026-08-14T16:00:00Z" "Update roster: Ravi moves to Tooling on 2026-08-15"
add .github/workflows/main.yml "      # lint" 9
c "Ravi Menon" ravi.menon@example.com "2026-08-19T10:00:00Z" "Add CI lint job for gemspec"
gen bin/release_pipeline.rb rel 48 6
c "Ravi Menon" ravi.menon@example.com "2026-09-03T10:00:00Z" "$(printf 'Rework release pipeline (#97)\n\nSquashed from 3 commits.\n\nCo-authored-by: Sofia Alvarez <sofia.alvarez@example.com>')"
add config/default.yml "# note" 3
c "Guest Dev" guest@example.org "2026-09-10T10:00:00Z" "Fix typo in config"
printf '# deps bump\n' >> "$DEST/Gemfile"
c "dependabot[bot]" dependabot@example.invalid "2026-09-12T05:00:00Z" "Bump rubocop from 1.70 to 1.71"
mkdir -p "$DEST/spec/support"; G mv spec/spec_helper.rb spec/support/spec_helper.rb
echo "# moved into support" >> "$DEST/spec/support/spec_helper.rb"
c "Sofia Alvarez" sofia.alvarez@example.com "2026-09-14T10:00:00Z" "Move spec helper into support/"
gen $COPS/desc_autocorrect.rb dac 35 7
c "Hanna Berg" hanna.berg@example.com "2026-09-18T10:00:00Z" "Add autocorrect for Desc cop"
add docs/contributing.md "Contributor guide:" 28
c "Yusuf Demir" yusuf.demir@example.com "2026-09-25T10:00:00Z" "Docs: contributor guide"

# --- after the quarter ---
gen $COPS/after.rb aft 7 1
c "Sofia Alvarez" sofia.alvarez@example.com "2026-10-05T10:00:00Z" "Add after-quarter cop"
finish
