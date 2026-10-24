#!/usr/bin/env bash
# Deterministic fixture builder.  Usage: build-fixture.sh <dest>
set -euo pipefail
REPO_URL=https://github.com/pkg/errors.git; PIN=87f8819acf6dc28bf5d3c14b334268236d686f48
DEST="${1:?usage: build-fixture.sh <dest>}"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C GIT_TERMINAL_PROMPT=0

rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
git clone -q --no-tags "$REPO_URL" "$DEST"
cd "$DEST"
git checkout -q -B main "$PIN"
git remote remove origin
for b in $(git for-each-ref --format='%(refname:short)' refs/heads); do [ "$b" = main ] || git branch -q -D "$b"; done
git for-each-ref --format='%(refname)' refs/tags | while read -r t; do git update-ref -d "$t"; done

# ci <author> <email> <author-date> <message> [committer-date] [committer] [committer-email]
ci() {
  local an="$1" ae="$2" ad="$3" msg="$4" cd="${5:-$3}" cn="${6:-$1}" ce="${7:-$2}"
  git add -A
  GIT_AUTHOR_NAME="$an" GIT_AUTHOR_EMAIL="$ae" GIT_AUTHOR_DATE="$ad" \
  GIT_COMMITTER_NAME="$cn" GIT_COMMITTER_EMAIL="$ce" GIT_COMMITTER_DATE="$cd" \
  git commit -q --allow-empty -m "$msg"
}
rv() { # rv <sha> <author> <email> <date>
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  git revert --no-edit "$1" >/dev/null
}
# gen <n-lines> <tag> : n go-ish lines (tab indented)
gen() { awk -v n="$1" -v t="$2" 'BEGIN{for(i=0;i<n;i++){k=1+int(i/3); r=i%3; if(r==0) printf "func %s%d() int {\n", t, k; else if(r==1) printf "\treturn %d\n", k; else printf "}\n"}}'; }
put() { # put <file> <n> <tag>   (creates the file with a package clause when new)
  mkdir -p "$(dirname "$1")"; [ -f "$1" ] || printf 'package ledger\n\n' > "$1"; gen "$2" "$3" >> "$1"; }

HANNAH=("Hannah Lee" hannah.lee@students.example.org)
TOMAS=("Tomás Weber" tomas.weber@students.example.org)
TOMAS2=("Tomas Weber" tweber@dorm.example.invalid)
MEI=("Mei Tanaka" mei.tanaka@students.example.org)
OLEG=("Oleg Petrov" oleg.petrov@students.example.org)
PROF=("Prof. Gruber" gruber@informatik.example.org)

# --- instructor setup (before the term) ---
mkdir -p ledger
cat > TEAM.md <<'T'
# Ledger team (Software Engineering, group 6)

| Name         | GitHub    | Emails seen on our machines |
|--------------|-----------|-----------------------------|
| Hannah Lee   | @hlee     | hannah.lee@students.example.org |
| Tomás Weber  | @tweber   | tomas.weber@students.example.org, tweber@dorm.example.invalid (the dorm PC drops the accent: "Tomas Weber") |
| Mei Tanaka   | @mtanaka  | mei.tanaka@students.example.org |
| Oleg Petrov  | @opetrov  | oleg.petrov@students.example.org |

Instructor: Prof. Gruber (not a team member).
The repository began as a copy of the open-source pkg/errors library; our own code lives in ledger/.
Pull requests are squash-merged into main. Put "Co-authored-by:" lines in the squash message when somebody else did the work.
T
printf 'package ledger\n\n// Package ledger is the team project.\n' > ledger/doc.go
ci "${PROF[@]}" 2026-09-10T11:00:00+02:00 "Add team file and ledger package stub"

put ledger/util.go 18 util1
ci "${TOMAS2[@]}" 2026-09-13T22:00:00-04:00 "util: helpers"
put ledger/scratch.go 30 scratch
ci "${TOMAS[@]}" 2026-09-13T23:50:00+02:00 "scratch experiments"
put ledger/ledger.go 70 ledger1
ci "${HANNAH[@]}" 2026-09-15T10:00:00+02:00 "Add ledger core"
put ledger/account.go 60 acct1
ci "${MEI[@]}" 2026-09-18T14:00:00+02:00 "Add accounts"

git checkout -q -b tomas/transfers
put ledger/transfer.go 40 xfer1
ci "${TOMAS[@]}" 2026-09-22T20:00:00+02:00 "transfers: basic move"
put ledger/transfer.go 40 xfer2
ci "${TOMAS[@]}" 2026-09-24T21:00:00+02:00 "transfers: validation"
put ledger/transfer.go 30 xfer3
ci "${TOMAS[@]}" 2026-09-27T11:00:00+02:00 "transfers: atomic apply"
git checkout -q main
put ledger/account.go 20 acct2
ci "${MEI[@]}" 2026-09-26T16:00:00+02:00 "accounts: closing"
GIT_COMMITTER_NAME=Hannah GIT_COMMITTER_EMAIL=h@example.org GIT_AUTHOR_NAME=Hannah GIT_AUTHOR_EMAIL=h@example.org git merge -q --squash tomas/transfers >/dev/null 2>&1
ci "${HANNAH[@]}" 2026-10-01T16:00:00+02:00 "$(printf 'Add transfers (#12)\n\nSquash of tomas/transfers (3 commits).\n\nCo-authored-by: Tomás Weber <tomas.weber@students.example.org>')"
git branch -q -D tomas/transfers

put ledger/report.go 90 rep1
ci "${OLEG[@]}" 2026-10-05T09:30:00+02:00 "Add reports"
put ledger/interest.go 60 int1
ci "${MEI[@]}" 2026-10-12T15:00:00+02:00 "$(printf 'Add interest calculation\n\nPair programming session with Tomás.\n\nCo-authored-by: Tomás Weber <tomas.weber@students.example.org>')"
put ledger/transfer.go 25 xfer4
ci "${TOMAS2[@]}" 2026-10-18T21:00:00-04:00 "transfer: fee rounding"
put ledger/audit.go 30 aud1
ci "${TOMAS[@]}" 2026-10-25T10:00:00+01:00 "audit: record entries" 2026-11-02T18:00:00+01:00 "${HANNAH[@]}"
put ledger/audit.go 20 aud2
ci "${TOMAS[@]}" 2026-10-26T11:00:00+01:00 "audit: query by account" 2026-11-02T18:05:00+01:00 "${HANNAH[@]}"
git mv ledger/audit.go ledger/auditlog.go
ci "${HANNAH[@]}" 2026-11-03T09:00:00+01:00 "rename audit to auditlog"
{ printf '// Code generated by stringer; DO NOT EDIT.\n\npackage ledger\n\n'; gen 400 zz; } > ledger/zz_generated.go
ci "${HANNAH[@]}" 2026-11-08T12:00:00+01:00 "generate string tables"
put ledger/currency.go 80 cur1
ci "${TOMAS[@]}" 2026-11-12T13:00:00+01:00 "Add currency conversion"
rv "$(git rev-parse HEAD)" "${HANNAH[@]}" 2026-11-14T10:00:00+01:00
put ledger/currency.go 45 cur2
ci "${TOMAS[@]}" 2026-11-20T17:00:00+01:00 "currency: conversion, fixed this time"
git rm -q ledger/scratch.go
ci "${MEI[@]}" 2026-11-22T10:00:00+01:00 "remove scratch file"
put ledger/report.go 30 rep2
ci "${OLEG[@]}" 2026-11-25T14:00:00+01:00 "reports: totals"
{ head -9 ledger/account.go; gen 25 acctnew; tail -n +35 ledger/account.go; } > ledger/account.go.new && mv ledger/account.go.new ledger/account.go
ci "${OLEG[@]}" 2026-11-28T11:00:00+01:00 "accounts: rewrite balance code"
put ledger/export.go 120 exp1
ci "${OLEG[@]}" 2026-12-03T15:00:00+01:00 "Add export"
put ledger/ledger.go 90 ledger2
ci "${HANNAH[@]}" 2026-12-08T10:00:00+01:00 "ledger: batching"
put ledger/ledger_test.go 100 lt1
ci "${HANNAH[@]}" 2026-12-10T19:00:00+01:00 "Add ledger tests"
put ledger/interest.go 20 int2
ci "${MEI[@]}" 2026-12-12T12:00:00+01:00 "interest: compounding"
put ledger/currency_test.go 35 curt1
ci "${TOMAS[@]}" 2026-12-18T23:40:00+01:00 "currency tests"
put ledger/util.go 20 util2
ci "${TOMAS[@]}" 2026-12-19T00:30:00+01:00 "util: more helpers"
put ledger/util.go 15 util3
ci "${TOMAS2[@]}" 2026-12-18T20:00:00-05:00 "util: small fixes"

git reflog expire --expire=now --all
git gc -q --prune=now
git rev-parse HEAD
