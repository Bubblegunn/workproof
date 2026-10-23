#!/usr/bin/env bash
# build-fixture.sh <dest-dir>  -- deterministic fixture (public repo pinned at an exact commit + synthetic commits)
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
DEST="${1:?usage: build-fixture.sh <dest-dir>}"
case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then echo "dest not empty: $DEST" >&2; exit 1; fi
CL=/private/tmp/claude-uid/-Users-user-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/he-clones
mkdir -p "$CL"; T=$(mktemp -d "$CL/build.XXXXXX")
git clone -q https://github.com/rack/rack-attack.git "$T/r"
cd "$T/r"
git checkout -q -B main 77195a5be6f69645aef0f62c1c54f13998d3a08d
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
MK=("Marta Kowal" "marta.kowal@ledgerly.example")
BA=("Ben Adeyemi" "ben.adeyemi@ledgerly.example")
BL=("Ben Adeyemi" "ben.a@laptop.invalid")
CP=("Chloe Park" "chloe.park@ledgerly.example")
DB=("dependabot[bot]" "dependabot@bot.example")
L=lib/rack/attack
nl=$'\n'

printf 'Ben Adeyemi <ben.adeyemi@ledgerly.example> <ben.a@laptop.invalid>\n' > .mailmap
ci "${MK[@]}" "2026-01-02T09:00:00+00:00" "chore: add .mailmap for known aliases"

gen 10 'LEDGERLY_ONE_%d = %d' > $L/ledgerly_1.rb
ci "${MK[@]}" "2026-01-08T10:00:00+00:00" "feat: throttle key helper${nl}${nl}Reviewed-by: Ben Adeyemi <ben.adeyemi@ledgerly.example>"

gen 10 'LEDGERLY_TWO_%d = %d' > $L/ledgerly_2.rb
ci "${BL[@]}" "2026-01-15T10:00:00+00:00" "feat: blocklist reason codes${nl}${nl}Reviewed-by: Ben Adeyemi <ben.adeyemi@ledgerly.example>"

gen 10 'LEDGERLY_THREE_%d = %d' > $L/ledgerly_3.rb
ci "${CP[@]}" "2026-01-29T10:00:00+00:00" "feat: safelist cache"

gen 10 'LEDGERLY_FOUR_%d = %d' > $L/ledgerly_4.rb
ci "${MK[@]}" "2026-02-04T10:00:00+00:00" "fix: change the cache key format${nl}${nl}We agreed with Chloe (Reviewed-by: Chloe Park <chloe.park@ledgerly.example> in the PR thread) to change the key.${nl}${nl}See ticket 4411."

gen 10 'LEDGERLY_FIVE_%d = %d' > $L/ledgerly_5.rb
ci "${CP[@]}" "2026-02-12T10:00:00+00:00" "fix: request id propagation${nl}${nl}reviewed-by: Marta Kowal <marta.kowal@ledgerly.example>"

echo "Internal note: Q1 doc pass." >> README.md
ci "${MK[@]}" "2026-02-20T10:00:00+00:00" "docs: README note"

gen 10 'LEDGERLY_SEVEN_%d = %d' > $L/ledgerly_7.rb
ci "${BA[@]}" "2026-02-25T10:00:00+00:00" "feat: track limiter hits${nl}${nl}Reviewed-by: Ben Adeyemi <ben.adeyemi@ledgerly.example>${nl}Reviewed-by: Chloe Park <chloe.park@ledgerly.example>"

echo "# bump" >> Gemfile
ci "${DB[@]}" "2026-02-27T04:00:00+00:00" "chore(deps): bump minitest"

git rm -q $L/ledgerly_3.rb
ci "${MK[@]}" "2026-03-03T10:00:00+00:00" "Revert \"feat: safelist cache\""

git checkout -q -b feature/limits
gen 10 'LEDGERLY_NINE_A_%d = %d' > $L/ledgerly_9a.rb
ci "${CP[@]}" "2026-03-06T10:00:00+00:00" "feat: per-account limits"
gen 10 'LEDGERLY_NINE_B_%d = %d' > $L/ledgerly_9b.rb
ci "${CP[@]}" "2026-03-08T10:00:00+00:00" "feat: per-account limit docs hook"
git checkout -q main
mg "${BA[@]}" "2026-03-10T10:00:00+00:00" feature/limits "Merge pull request #212 from feature/limits${nl}${nl}Reviewed-by: Marta Kowal <marta.kowal@ledgerly.example>"
git branch -q -D feature/limits

gen 10 'LEDGERLY_TEN_%d = %d' > $L/ledgerly_10.rb
ci "${CP[@]}" "2026-03-18T10:00:00+00:00" "fix: reset counters${nl}${nl}Reviewed-by: Chloe Park <chloe.park@ledgerly.example>"

gen 10 'LEDGERLY_ELEVEN_%d = %d' > $L/ledgerly_11.rb
ci "${BA[@]}" "2026-03-30T10:00:00+00:00" "feat: expose counters${nl}${nl}Reviewed-by: Marta Kowal <marta.kowal@ledgerly.example>" "${BA[0]}" "${BA[1]}" "2026-04-02T09:00:00+00:00"

gen 10 'LEDGERLY_TWELVE_%d = %d' > $L/ledgerly_12.rb
ci "${MK[@]}" "2026-03-27T10:00:00+00:00" "feat: log throttled keys${nl}${nl}Acked-by: Ben Adeyemi <ben.adeyemi@ledgerly.example>"

gen 10 'LEDGERLY_Q2_%d = %d' > $L/ledgerly_q2.rb
ci "${BA[@]}" "2026-04-01T10:00:00+00:00" "feat: q2 work${nl}${nl}Reviewed-by: Marta Kowal <marta.kowal@ledgerly.example>"
git reflog expire --expire=now --all
git gc -q --prune=now
mkdir -p "$(dirname "$DEST")"
mv "$T/r" "$DEST"; rmdir "$T"
echo "built $DEST HEAD=$(git -C "$DEST" rev-parse HEAD)"
