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

ap() { mkdir -p "$(dirname "$DEST/$1")"; cat >> "$DEST/$1"; }
MARA=("Mara Linden" mara@example.com)
rb() { ap "$1" <<EOR

# $2
EOR
}
setver() { sed -i.bak "s/VERSION ||= '[0-9.]*'/VERSION ||= '$1'/" "$DEST/mustermann/lib/mustermann/version.rb"; rm "$DEST/mustermann/lib/mustermann/version.rb.bak"; }
mc() { # committer-env helper for cherry-picks: <date>
  GIT_COMMITTER_NAME="${MARA[0]}" GIT_COMMITTER_EMAIL="${MARA[1]}" GIT_COMMITTER_DATE="$1"
}

setver 3.1.1
c "${MARA[@]}" "2025-03-01T09:00:00+00:00" "Release 3.1.1"
R1=$(G rev-parse HEAD)

# ---- development line (becomes main)
rb mustermann/lib/mustermann/pattern.rb "feature: Pattern#to_proc"
c "Ann Adler" ann@example.com "2025-03-05T10:00:00+00:00" "Add Pattern#to_proc"
rb mustermann-contrib/lib/mustermann/flask.rb "fix: escape | in Flask patterns"
c "Bea Blom" bea@example.com "2025-03-10T10:00:00+00:00" "Fix escaping of | in Flask patterns"
M2=$(G rev-parse HEAD)
rb mustermann-contrib/lib/mustermann/rails.rb "feature: Rails 7.2 syntax"
c "Cyd Cole" cyd@example.com "2025-03-12T10:00:00+00:00" "Add Rails 7.2 syntax"
rb mustermann/lib/mustermann/regular.rb "fix: frozen string error in Regular"
c "Dov Dahl" dov@example.com "2025-03-14T10:00:00+00:00" "Fix frozen string error in Regular"
M4=$(G rev-parse HEAD)
rb mustermann-contrib/lib/mustermann/express.rb "fix: greedy match in Express"
c "Eli Ek" eli@example.com "2025-03-18T10:00:00+00:00" "Fix greedy match in Express"

# ---- stable line from 3.1.1
G checkout -q -b stable "$R1"
(
  mc "2025-03-25T11:00:00+00:00"; export GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL GIT_COMMITTER_DATE
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null cherry-pick -x "$M2" >/dev/null
)
(
  mc "2025-03-26T11:00:00+00:00"; export GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL GIT_COMMITTER_DATE
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null cherry-pick --no-commit "$M4" >/dev/null
  GIT_AUTHOR_NAME="Dov Dahl" GIT_AUTHOR_EMAIL=dov@example.com GIT_AUTHOR_DATE="2025-03-14T10:00:00+00:00" \
    G -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q -m "Backport: frozen string error in Regular"
)
rb mustermann/lib/mustermann/identity.rb "fix: thread safety of the pattern cache"
c "Fay Fox" fay@example.com "2025-03-27T10:00:00+00:00" "Fix thread-safety in the pattern cache (#210)

Squashed from 5 commits.

Co-authored-by: Gus Gil <gus@example.com>"
setver 3.1.2
c "${MARA[@]}" "2025-03-30T09:00:00+00:00" "Release 3.1.2"

# ---- merge stable back into the development line
G checkout -q fixture
GIT_AUTHOR_NAME="${MARA[0]}" GIT_AUTHOR_EMAIL="${MARA[1]}" GIT_AUTHOR_DATE="2025-04-01T09:00:00+00:00" \
GIT_COMMITTER_NAME="${MARA[0]}" GIT_COMMITTER_EMAIL="${MARA[1]}" GIT_COMMITTER_DATE="2025-04-01T09:00:00+00:00" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff stable -m "Merge branch 'stable-3.1'" || { echo "merge conflict" >&2; exit 1; }
G branch -q -D stable

rb mustermann/lib/mustermann/ast/translator.rb "fix: translator nil guard"
c "Hal Hart" hal@example.com "2025-04-03T10:00:00+00:00" "Fix nil guard in translator"

finish
