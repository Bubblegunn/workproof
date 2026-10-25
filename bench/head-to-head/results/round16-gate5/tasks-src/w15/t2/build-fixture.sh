#!/usr/bin/env bash
REPO_URL=https://github.com/mattn/go-isatty; PIN=a7c02353c47bc4ec6b30dc9628154ae4fe760c11
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
N=0
# t <name> <email> <author-date> <message> [committer-name committer-email committer-date]
# appends one line to a lab file so every commit really changes something
t() {
  N=$((N+1))
  mkdir -p "$DEST/analysis"
  echo "step $N: $4" >> "$DEST/analysis/pipeline.go.txt"
  c "$@"
}
w analysis/README.md <<'EOF'
# analysis

Lab analysis code built on top of the terminal detection helpers.
EOF
c "Frank Ito" frank.ito@lab.example "2025-09-15T10:00:00+0200" "analysis: scaffold"

# --- winter semester 2025/26 ---
t "Alice Moreau" alice.moreau@lab.example "2025-09-30T23:30:00+0000" "load raw traces"
t "Alice Moreau" alice.moreau@lab.example "2025-10-01T08:00:00+0200" "normalise traces"
t "Bob Okafor" bob.okafor@lab.example "2025-10-01T09:10:00+0200" "outlier filter"
t "Bob Okafor" bob.okafor@lab.example "2025-10-01T15:00:00+0200" "outlier filter: tests"
t "Dan Petrov" dan.petrov@lab.example "2025-10-20T14:00:00+0200" "plot helpers"
t "Dan Petrov" dpetrov@students.example "2025-10-21T09:00:00+0200" "plot helpers: legend"
t "Bob Okafor" bob.okafor@lab.example "2025-11-12T23:50:00-0500" "fix from the conference hotel"
t "Bob Okafor" bob.okafor@lab.example "2025-11-13T10:00:00+0100" "tidy fix"
t "Dependabot" "49699333+dependabot[bot]@users.noreply.example" "2025-11-17T04:00:00+0000" "chore: bump dependency"
# Carol's work is done in December, rebased onto the main line only in April
t "Carol Yan" carol.yan@partner.example "2025-12-05T11:00:00+0100" "window function" "Carol Yan" carol.yan@partner.example "2026-04-08T09:00:00+0200"
t "Carol Yan" carol.yan@partner.example "2025-12-05T16:30:00+0100" "window function: docs" "Carol Yan" carol.yan@partner.example "2026-04-08T09:00:05+0200"
t "Alice Moreau" alice.moreau@lab.example "2026-01-12T09:30:00+0100" "spectral estimate"
G checkout -q -b feat
t "Eva Santos" eva.santos@lab.example "2026-01-28T17:00:00+0100" "calibration table"
G checkout -q fixture
GIT_AUTHOR_NAME="Frank Ito" GIT_AUTHOR_EMAIL=frank.ito@lab.example GIT_AUTHOR_DATE="2026-02-02T09:00:00+0100" \
GIT_COMMITTER_NAME="Frank Ito" GIT_COMMITTER_EMAIL=frank.ito@lab.example GIT_COMMITTER_DATE="2026-02-02T09:00:00+0100" \
G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff -m "Merge branch 'feat' (calibration table)" feat
G branch -q -D feat
t "Dependabot" "49699333+dependabot[bot]@users.noreply.example" "2026-02-10T04:00:00+0000" "chore: bump dependency"
t "Dan Petrov" dan.petrov@lab.example "2026-03-02T10:00:00+0100" "cross-validation"
t "Eva Santos" eva.santos@lab.example "2026-03-31T21:30:00+0000" "export tables"

# --- summer semester 2026 ---
t "Eva Santos" eva.santos@lab.example "2026-03-31T22:30:00+0000" "export tables: csv"
t "Alice Moreau" alice.moreau@lab.example "2026-04-14T09:00:00+0200" "bootstrap intervals"
t "Alice Moreau" alice.moreau@lab.example "2026-04-15T09:00:00+0200" "bootstrap intervals: speed"
# a laptop with a dead clock battery
t "Gina Torres" gina.torres@lab.example "1970-01-01T00:00:00+0000" "wip figures"
t "Alice Moreau" alice.moreau@lab.example "2026-05-05T13:00:00+0200" "report script"
t "Hugo Marsh" hugo.marsh@lab.example "2031-06-01T09:00:00+0000" "wip clustering"
t "Bob Okafor" bob.okafor@lab.example "2026-06-10T09:00:00+0200" "ablation runner"
t "Bob Okafor" bob.okafor@lab.example "2026-06-10T18:30:00+0200" "ablation runner: logging"
t "Dan Petrov" dpetrov@students.example "2026-07-02T11:00:00+0200" "final plots"
t "Gina Torres" gina.torres@lab.example "2026-09-30T21:30:00+0000" "figure 4"
t "Eva Santos" eva.santos@lab.example "2026-09-30T23:00:00+0000" "camera-ready tables"

finish
