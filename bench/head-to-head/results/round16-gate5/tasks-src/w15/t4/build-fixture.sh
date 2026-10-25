#!/usr/bin/env bash
REPO_URL=https://github.com/benhoyt/inih; PIN=63a302cfe53f087e3c44233cc2f08f05aa29e4c6
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

# ---- lab history -------------------------------------------------------
mkdir -p "$DEST/core"
{
  echo '/* Core weighted-accumulation method. */'
  echo '#include <stddef.h>'
  echo ''
  echo 'double method_accumulate(const double *x, const double *coeff, size_t n)'
  echo '{'
  echo '    double acc = 0.0;'
  for i in $(seq 1 140); do echo "    acc += coeff[$((i % 7))] * x[$((i % 11))] * $i.0;"; done
  echo '    return acc;'
  echo '}'
} > "$DEST/core/method.c"
c "Kai Oksanen" kai.oksanen@lab.example "2025-02-03T09:30:00+0000" "$(printf 'Import legacy solver from the lab Subversion server (r1-r412)\n\nThe old history was not converted, this is one snapshot of r412.\nOriginal authors according to the svn log: Lars Weber (r1-r300, 2019-2021)\nand Hana Ito (r301-r412, 2021-2022). Neither has a git account.')"

# patches written by Jun Park, applied by Ivan Pop (author != committer)
perl -pi -e 's/acc \+=/acc += (double)/ if $. >= 20 && $. <= 25' "$DEST/core/method.c"
c "Jun Park" jun.park@univ.example "2025-04-07T08:00:00+0000" "method: fix integer promotion in accumulate" "Ivan Pop" ivan.pop@lab.example "2025-04-09T14:00:00+0000"
perl -pi -e 's/\* (\d+)\.0;/* $1.0; \/* weight *\// if $. >= 60 && $. <= 73' "$DEST/core/method.c"
c "Jun Park" jun.park@univ.example "2025-06-02T08:00:00+0000" "method: document weights" "Ivan Pop" ivan.pop@lab.example "2025-06-03T10:00:00+0000"

mkdir -p "$DEST/src"
G mv core/method.c src/method.c
c "Ivan Pop" ivan.pop@lab.example "2025-08-18T11:00:00+0000" "move method into src/"

perl -pi -e 's/^    acc \+= \(double\)/    acc += (double)/; $_ = "    acc += fma(coeff[".(($. % 7))."], x[".(($. % 11))."], 0.0) * ".($. - 6).".0; /* simd-friendly */\n" if $. >= 100 && $. <= 129' "$DEST/src/method.c"
c "Mira Costa" mira.costa@students.example "2025-10-21T15:00:00+0000" "method: restructure inner terms for vectorisation"

perl -pi -e '$_ = "    acc += coeff[0] * x[0] * 0.5;\n" if $. >= 140 && $. <= 145' "$DEST/src/method.c"
c "Ivan Pop" ivan.pop@lab.example "2026-02-10T09:00:00+0000" "method: simplify tail terms"

finish
