#!/usr/bin/env bash
# build-fixture.sh <dest-dir>  -- deterministic fixture (public repo pinned at an exact commit + synthetic commits)
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
DEST="${1:?usage: build-fixture.sh <dest-dir>}"
case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then echo "dest not empty: $DEST" >&2; exit 1; fi
CL=/private/tmp/claude-uid/-Users-user-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/he-clones
mkdir -p "$CL"; T=$(mktemp -d "$CL/build.XXXXXX")
git clone -q https://github.com/tidwall/gjson.git "$T/r"
cd "$T/r"
git checkout -q -B main 4d230282c0e3bf42fa509147d27d7e8dcc3d3bad
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
DV=("Dmitri Volkov" "d.volkov@northwind-logistics.example")
DV2=("D. Volkov" "d.volkov@northwind-logistics.example")
AT=("Aiko Tanaka" "aiko.tanaka@northwind-logistics.example")
NO=("Nadia Osei" "nadia.osei@northwind-logistics.example")

gen 200 'func routeRow%d() int { return %d }' > route.go
ci "${AT[@]}" "2025-01-13T09:00:00+00:00" "feat: route table parser"

gen 2500 'func legacyExport%d() int { return %d }' > legacy_exporter.go
ci "${AT[@]}" "2025-01-27T09:00:00+00:00" "feat: legacy exporter for the old ERP"

gen 150 'func manifestQuery%d() int { return %d }' > manifest.go
ci "${DV[@]}" "2025-01-20T10:00:00+00:00" "feat: shipment manifest path queries"

gen 3 'func invoiceRound%d() int { return %d }' >> manifest.go
ci "${DV[@]}" "2025-02-03T15:30:00+00:00" "fix: rounding bug in invoice totals for Quillfeather Retail"

printf 'host=ledger-db.corp.invalid\ntoken=tok_example_9f8e7d6c5b4a\n' > loader.conf
ci "${DV2[@]}" "2025-02-17T11:00:00+00:00" "chore: point loader at ledger-db.corp.invalid"

gen 5000 'var lookup%d = [2]int{%d, %d}' > gjson_gen_table.go
ci "${DV[@]}" "2025-03-04T10:00:00+00:00" "chore: regenerate lookup tables (generated)"

gen 300 'func carrierCall%d() int { return %d }' > carrier.go
ci "${AT[@]}" "2025-03-18T09:00:00+00:00" "feat: carrier API client"

gen 220 'func streamChunk%d() int { return %d }' > stream.go
ci "${DV[@]}" "2025-04-09T10:00:00+00:00" "feat: streaming parser for large manifests"

git rm -q legacy_exporter.go
ci "${DV[@]}" "2025-05-06T10:00:00+00:00" "refactor: delete legacy exporter (replaced by manifest queries)"

printf 'todo\nwip\nwip\n' > wip.txt
ci "${DV[@]}" "1970-01-01T00:00:00+00:00" "wip" "${DV[0]}" "${DV[1]}" "2025-06-10T10:00:00+00:00"

gen 4 'func tzFix%d() int { return %d }' >> manifest.go
ci "${DV[@]}" "2031-04-02T10:00:00+00:00" "fix: timezone handling in manifest dates" "${DV[0]}" "${DV[1]}" "2025-07-15T10:00:00+00:00"

gen 3 'func osei%d() int { return %d }' >> route.go
ci "${NO[@]}" "2025-08-12T09:00:00+00:00" "fix: route off-by-one"

gen 180 'func TestManifest%d(t *testing.T) { _ = %d }' > manifest_test.go
ci "${DV[@]}" "2025-08-25T10:00:00+00:00" "test: manifest edge cases"

mkdir -p docs
gen 60 'Manifest query rule %d: paths are dot separated.' > docs/manifest.md
ci "${DV[@]}" "2025-10-02T10:00:00+00:00" "docs: document manifest query syntax"
git reflog expire --expire=now --all
git gc -q --prune=now
mkdir -p "$(dirname "$DEST")"
mv "$T/r" "$DEST"; rmdir "$T"
echo "built $DEST HEAD=$(git -C "$DEST" rev-parse HEAD)"
