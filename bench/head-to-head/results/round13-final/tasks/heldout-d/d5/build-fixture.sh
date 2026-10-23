#!/usr/bin/env bash
URL=https://github.com/jekyll/jekyll-feed
PIN=43cc5d51e30b59ab8d8ba970e42c8c437e2b233f
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

L="Lena Hoffmann"; LE=lena@hoffmann-dev.example; LN=lena.hoffmann@users.noreply.github.example
H="Lena Hofmann"; HE=l.hofmann@other-agency.example   # different person, look-alike name
PM="Chris Meyer"; PME=chris.meyer@client.example
sha() { git rev-parse --short=7 HEAD; }

# Lena works in +02:00
gen lib/feed_ext/pagination.rb 40 page;   c "$L" $LE 2025-10-01T11:00:00+02:00 "Add feed pagination"; S1=$(sha)
gen lib/feed_ext/categories.rb 35 cat;    c "$L" $LN 2025-10-02T14:00:00+02:00 "Add category feeds (#51)"; S2=$(sha)
gen lib/feed_ext/hofmann_tags.rb 15 tag;  c "$H" $HE 2025-10-03T12:00:00+02:00 "Tag cleanup"; S3=$(sha)
printf 'def x\n  1   \nend\n' > lib/feed_ext/space.rb; c "$L" $LE 2025-09-30T09:00:00+02:00 "Add space helper"
printf 'def x\n  1\nend\n' > lib/feed_ext/space.rb;    c "$L" $LE 2025-10-06T10:00:00+02:00 "Trim trailing whitespace"; S4=$(sha)
gen lib/feed_ext/dates.rb 28 dates;       c "$L" $LE 2025-10-07T15:00:00+02:00 "Normalise feed dates"; S5=$(sha)
gen lib/feed_ext/atom_links.rb 22 links;  c "$L" $LE 2025-09-29T16:00:00+02:00 "Add atom self links" 2025-10-08T10:00:00+02:00; S6=$(sha)
gen lib/feed_ext/summary.rb 18 summary;    c "$L" $LE 2025-10-09T13:00:00+02:00 "Add summary truncation"; S7=$(sha)
git checkout -q -b lena/sync
git checkout -q main
printf 'Release notes draft\n' > RELEASE_DRAFT.md; c "$PM" $PME 2025-10-09T17:00:00+02:00 "Add release notes draft"
git checkout -q lena/sync
git add -A
GIT_AUTHOR_NAME="$L" GIT_AUTHOR_EMAIL=$LE GIT_AUTHOR_DATE=2025-10-10T10:00:00+02:00 GIT_COMMITTER_NAME="$L" GIT_COMMITTER_EMAIL=$LE GIT_COMMITTER_DATE=2025-10-10T10:00:00+02:00 \
  git merge -q --no-ff --no-gpg-sign main -m "Merge branch 'main' into lena/sync"; S8=$(sha)
git checkout -q main; git merge -q --ff-only lena/sync; git branch -q -d lena/sync
gen lib/feed_ext/lang.rb 14 lang;         c "$L" $LE 2025-10-12T16:00:00+02:00 "Fix feed lang attribute"   # a Sunday, not billed
gen lib/feed_ext/etag.rb 30 etag;         c "$L" $LE 2025-10-14T11:00:00+02:00 "Add ETag support"; S10=$(sha)
gen lib/feed_ext/robots.rb 26 robots;     c "$L" $LE 2025-10-15T12:00:00+02:00 "Add robots meta to feed"; S11=$(sha)
cat > timesheet.csv <<CSV
date,hours,commit,description
2025-10-01,8,$S1,feed pagination
2025-10-02,8,$S2,category feeds
2025-10-03,8,$S3,tag cleanup
2025-10-06,8,$S4,code quality
2025-10-07,6,$S5,date handling
2025-10-08,8,$S6,atom links
2025-10-09,4,$S7,summaries
2025-10-10,8,$S8,integration and sync
2025-10-13,8,9f3e1ab,performance work
2025-10-14,8,$S10,etag support
2025-10-15,8,$S11,robots meta
CSV
c "$PM" $PME 2025-10-31T09:00:00+01:00 "Add October timesheet from contractor"
