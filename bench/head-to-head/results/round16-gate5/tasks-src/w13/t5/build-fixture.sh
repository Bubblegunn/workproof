#!/usr/bin/env bash
REPO_URL=https://github.com/sinatra/mustermann; PIN=573cd316cc33755b38ebd04021870fce4c87cdc1
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
# ---- t5: tenure and timing of Alex Kim ----
AN="Alex Kim"; AE1="akim@oldjob.example.invalid"; AE2="alex.kim@example.com"
XE="alex.kim@othercorp.example"   # a different person who is also called Alex Kim
IN="Ines Duarte"; IE="ines@example.org"
RB="%s_%03d = '%s_%03d'"
echo "Typo fixed by the other Alex Kim." >> "$DEST/README.md"
c "$AN" "$XE" "2025-01-08T10:00:00+00:00" "docs: fix typo in README"
G checkout -q -b alex-limiter
gen mustermann/lib/mustermann/limiter.rb LIMIT 40 "$RB"
c "$AN" "$AE1" "2025-01-01T08:30:00+09:00" "wip: limiter draft" "$AN" "$AE1" "2025-03-20T10:00:00+00:00"
gen mustermann/lib/mustermann/limiter.rb WINDOW 30 "$RB"
c "$AN" "$AE1" "2025-02-14T10:00:00+09:00" "wip: limiter window logic" "$AN" "$AE1" "2025-03-20T10:01:00+00:00"
G checkout -q fixture
echo "Escaping note by Alex." >> "$DEST/mustermann/README.md"
c "$AN" "$AE1" "2025-03-06T10:00:00+00:00" "docs: clarify pattern escaping"
M alex-limiter "$IN" "$IE" "2025-03-24T15:00:00+00:00" "Merge pull request #61 from alex/limiter"
G branch -q -D alex-limiter
gen mustermann/lib/mustermann/limiter.rb BURST 12 "$RB"
c "$IN" "$IE" "2025-04-02T12:00:00+00:00" "Limiter: add burst setting (#64)

Squash of the branch from #64.

Co-authored-by: $AN <$AE1>"
gen mustermann/lib/mustermann/limiter.rb RESET 6 "$RB"
c "$AN" "$AE2" "2025-06-10T08:00:00+00:00" "limiter: fix reset race"
echo "Other Alex Kim added a name." >> "$DEST/README.md"
c "$AN" "$XE" "2025-08-20T10:00:00+00:00" "docs: update contributors"
gen mustermann/docs/limiter.md GUIDE 25 "%s_%03d: %s_%03d"
c "$AN" "$AE2" "2025-09-02T09:00:00+00:00" "docs: limiter guide"
finish
