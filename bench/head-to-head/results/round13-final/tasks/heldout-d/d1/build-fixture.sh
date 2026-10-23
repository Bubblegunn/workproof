#!/usr/bin/env bash
URL=https://github.com/pallets/itsdangerous
PIN=672971d66a2ef9f85151e53283113f33d642dabd
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"; git clone -q "$URL" "$DEST"; cd "$DEST"
git checkout -q "$PIN"; git checkout -q -B main
for b in $(git for-each-ref --format='%(refname:short)' refs/heads | grep -vx main); do git branch -q -D "$b"; done
git tag -l | xargs -r git tag -d >/dev/null
git remote remove origin
git reflog expire --expire=now --all; git gc -q --prune=now
c() { # author_name author_email author_date message [committer_date] [committer_name] [committer_email]
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="${6:-$1}" GIT_COMMITTER_EMAIL="${7:-$2}" GIT_COMMITTER_DATE="${5:-$3}" git commit -q --no-gpg-sign -m "$4"
}
gen() { mkdir -p "$(dirname "$1")"; seq -f "$3 line %g" 1 "$2" > "$1"; }

A="Alex Rivera"; AW=alex.rivera@northwind.example; AN=alex.rivera@users.noreply.github.example
M="Maya Chen"; ME=maya.chen@northwind.example
S=src/itsdangerous

gen notes/prep.md 10 prep;                    c "$A" $AW 2025-06-30T23:00:00-07:00 "Prep notes for H2 planning"
gen $S/rotation.py 60 rotation;               c "$A" $AW 2025-07-08T10:15:00-07:00 "Add key rotation helper"
gen tests/test_rotation.py 45 rotation_test;  c "$A" $AW 2025-07-22T14:00:00-07:00 "Add rotation tests"
gen $S/skew.py 30 skew;                       c "$M" $ME 2025-08-05T09:30:00-07:00 "Add timestamp skew tolerance"
seq -f '  "symbol_%g": {"kind": "function", "since": "3.0"},' 1 12000 > docs/api-snapshot.json
                                              c "$A" $AW 2025-08-12T11:00:00-07:00 "Import generated API snapshot for docs site"
gen $S/metrics.py 80 metrics;                 c "$A" $AW 2025-08-19T16:20:00-07:00 "Add token expiry metrics hook"
gen docs/typos.md 5 typo;                     c "Alex Rivero" alex.rivero@northwind.example 2025-09-02T10:00:00-07:00 "Fix typos in docs"
gen $S/msgpack_ser.py 100 msgpack;            c "$A" $AW 2025-09-09T13:00:00-07:00 "Switch serializer to msgpack (experiment)"
git rm -q $S/msgpack_ser.py;                  c "$A" $AW 2025-09-16T13:00:00-07:00 'Revert "Switch serializer to msgpack (experiment)"'
gen $S/compare.py 40 compare;                 c "$A" $AN 2025-10-01T09:00:00-07:00 "Harden signature comparison (#412)" 2025-10-01T16:00:05+00:00 GitHub noreply@github.example
gen $S/cli.py 70 cli;                         c "$M" $ME 2025-10-10T15:00:00-07:00 "Add CLI inspector" 2025-10-14T09:00:00-07:00 "$A" $AW
git checkout -q -b feature/audit-log
gen $S/audit.py 55 audit;                     c "$A" $AW 2025-10-28T10:00:00-07:00 "Add audit log for signing failures"
git checkout -q main
git add -A
GIT_AUTHOR_NAME="$A" GIT_AUTHOR_EMAIL=$AW GIT_AUTHOR_DATE=2025-11-03T09:00:00-08:00 GIT_COMMITTER_NAME="$A" GIT_COMMITTER_EMAIL=$AW GIT_COMMITTER_DATE=2025-11-03T09:00:00-08:00 \
  git merge -q --no-ff --no-gpg-sign feature/audit-log -m "Merge branch 'feature/audit-log'"
git branch -q -d feature/audit-log
gen notes/release-2025.md 3 release;          c "$A" $AW 2025-12-31T22:30:00-08:00 "Year-end release notes"
gen notes/plan-2026.md 6 plan;                c "$A" $AW 2026-01-05T09:00:00-08:00 "Plan 2026"
