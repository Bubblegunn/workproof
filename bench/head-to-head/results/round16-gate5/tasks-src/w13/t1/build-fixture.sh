#!/usr/bin/env bash
REPO_URL=https://github.com/pypa/sampleproject; PIN=621e4974ca25ce531773def586ba3ed8e736b3fc
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
# ---- t1: caching layer in src/cache ----
DW1="Dana Whitfield"; DE1="dana.whitfield@acme-old.example"
DE2="dwhitfield@personal.example"
DN3="D. Whitfield"; DE3="dana.w@users.noreply.example"
MN="Marcus Obi"; ME="marcus@example.org"
Q1="%s_%03d = '%s_%03d'"
Q2='%s_%03d = "%s_%03d"'
gen src/cache/store.py STORE 60 "$Q1"
c "$DW1" "$DE1" "2025-02-03T10:00:00+00:00" "Add cache store"
gen src/cache/eviction.py EVICT 40 "$Q1"
c "$DW1" "$DE1" "2025-02-10T11:30:00+00:00" "Add LRU eviction"
gen src/cache/__init__.py INIT 5 "$Q1"
gen src/cache/ttl.py TTL 30 "$Q1"
c "$MN" "$ME" "2025-03-01T09:00:00+00:00" "Add package init and TTL support"
gen src/cache/store.py SERIAL 20 "$Q1"
c "$DW1" "$DE2" "2025-04-12T14:00:00+00:00" "Add serialization to the store"
for f in store eviction __init__ ttl; do subst src/cache/$f.py "s/'/\"/g"; done
c "$MN" "$ME" "2025-06-01T08:00:00+00:00" "style: reformat src/cache to double quotes"
gen src/cache/backend_redis.py REDIS 80 "$Q2"
gen src/cache/__init__.py REDISINIT 2 "$Q2"
c "$MN" "$ME" "2025-07-15T16:00:00+00:00" "Add redis backend (#41)

Squash of the branch from #41.

Co-authored-by: $DN3 <$DE3>"
gen src/cache/metrics.py METRIC 25 "$Q2"
c "$DN3" "$DE3" "2026-01-20T13:00:00+00:00" "Add cache metrics"
rm "$DEST/src/cache/eviction.py"; gen src/cache/eviction.py LFU 50 "$Q2"
c "$MN" "$ME" "2026-03-05T10:00:00+00:00" "Rewrite eviction as LFU"
for f in "$DEST"/src/cache/*.py; do { echo "# Copyright Example Corp"; cat "$f"; } > "$f.tmp" && mv "$f.tmp" "$f"; done
c "ci-bot" "ci-bot@example.invalid" "2026-04-01T00:05:00+00:00" "chore: add license headers"
finish
