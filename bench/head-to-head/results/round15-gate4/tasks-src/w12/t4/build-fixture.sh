#!/usr/bin/env bash
# Deterministic fixture builder.  Usage: build-fixture.sh <dest>
set -euo pipefail
REPO_URL=https://github.com/antirez/kilo.git; PIN=323d93b29bd89a2cb446de90c4ed4fea1764176e
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
mg() { # mg <branch> <author> <email> <date> <message>
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  git merge -q --no-ff -m "$5" "$1" >/dev/null 2>&1
}
# gen <n-lines> <tag> : n C-ish one-line functions
gen() { awk -v n="$1" -v t="$2" 'BEGIN{for(i=1;i<=n;i++) printf "static int %s_%d(int x) { return x + %d; }\n", t, i, i}'; }
put() { mkdir -p "$(dirname "$1")"; gen "$2" "$3" >> "$1"; }

JACK=("Jack Whitaker" jack.whitaker@students.example.ac.nz)
TAMA=("Tama Rangi" tama.rangi@students.example.ac.nz)
TAMA2=("trangi" tama@home.example.invalid)
MEI=("Mei-Ling Zhou" meiling.zhou@students.example.ac.nz)
GHA=("github-actions[bot]" 41898282+github-actions[bot]@users.noreply.example.org)
PROF=("Dr Hemi" hemi@cs.example.ac.nz)

cat > TEAM.md <<'T'
# Editor project, team 3

| Student        | GitHub  | Notes |
|----------------|---------|-------|
| Jack Whitaker  | @jackw  |       |
| Tama Rangi     | @trangi | commits from the home laptop show up as "trangi" |
| Mei-Ling Zhou  | @mlzhou | integrates the pull requests; on exchange in Singapore from November |

Dr Hemi (instructor) is not part of the team.
Progress is checked weekly (weeks start on Monday, we are in Auckland).
A CI job bumps the build number every Monday morning.
The repository began as a copy of antirez/kilo.
T
echo "build 0" > BUILDNUM
ci "${PROF[@]}" 2026-09-28T09:00:00+13:00 "Add team file and build number"

python3 - > .git/t4rows <<'PY'
from datetime import datetime, timedelta, timezone
rows = []
def add(kind, who, a, msg, f="", n=0, c=None):
    rows.append((kind, who, a, c or a, f, n, msg))
add("c","JACK","2026-10-02T10:00:00+13:00","sketch before term starts","src/jack.c",30)
add("c","MEI","2026-10-14T10:00:00+13:00","editor: line buffer","src/mei.c",40)
add("c","TAMA","2026-10-13T11:00:00+13:00","editor: cursor movement","src/tama.c",35)
add("c","JACK","2026-10-20T14:00:00+13:00","editor: file loading","src/jack.c",30)
add("c","TAMA2","2026-10-21T22:00:00+13:00","editor: scrolling","src/tama.c",30)
add("c","MEI","2026-10-27T10:30:00+13:00","editor: status bar","src/mei.c",25)
add("c","TAMA","2026-10-29T12:00:00+13:00","editor: search","src/tama.c",30)
add("c","TAMA2","2026-11-04T21:00:00+13:00","editor: search highlight","src/tama.c",25)
add("b:pr1","MEI","2026-11-05T10:00:00+13:00","editor: syntax table","src/pr1.c",30)
add("c","MEI","2026-11-08T22:30:00+08:00","editor: save command","src/mei.c",30)
add("b:pr2","JACK","2026-11-10T09:00:00+13:00","editor: tabs","src/pr2.c",30)
add("c","TAMA","2026-11-12T10:00:00+13:00","editor: undo stack","src/tama.c",40,"2027-01-29T21:00:01+13:00")
add("c","MEI","2026-11-19T21:00:00+08:00","editor: resize handling","src/mei.c",25)
add("c","TAMA2","2026-11-19T23:30:00+13:00","editor: undo tests","src/tama.c",20,"2027-01-29T21:00:02+13:00")
add("c","TAMA","2026-11-26T15:00:00+13:00","editor: redo","src/tama.c",25,"2027-01-29T21:00:03+13:00")
add("b:pr3","JACK","2026-11-28T16:00:00+13:00","editor: line numbers","src/pr3.c",30)
add("c","MEI","2026-12-02T20:00:00+08:00","editor: utf-8 input","src/mei.c",30)
add("c","TAMA2","2026-12-03T22:30:00+13:00","editor: copy and paste","src/tama.c",30,"2027-01-29T21:00:04+13:00")
add("b:pr4","MEI","2026-12-09T09:00:00+08:00","editor: help screen","src/pr4.c",30)
add("c","TAMA","2026-12-10T10:00:00+13:00","editor: key bindings","src/tama.c",25,"2027-01-29T21:00:05+13:00")
add("c","TAMA","2026-12-17T14:00:00+13:00","editor: config file","src/tama.c",30,"2027-01-29T21:00:06+13:00")
add("b:pr5","JACK","2026-12-15T11:00:00+13:00","editor: bracket matching","src/pr5.c",30)
add("c","TAMA2","2026-12-30T23:00:00+13:00","editor: fix crash on empty file","src/tama.c",15,"2027-01-29T21:00:07+13:00")
add("c","TAMA","2027-01-07T11:00:00+13:00","editor: soft wrap","src/tama.c",30,"2027-01-29T21:00:08+13:00")
add("c","JACK","2027-01-08T20:00:00+13:00","editor: README draft","src/jack.c",20)
add("b:pr6","MEI","2027-01-14T09:00:00+08:00","editor: macros","src/pr6.c",30)
add("c","TAMA2","2027-01-13T22:00:00+13:00","editor: tab completion","src/tama.c",25,"2027-01-29T21:00:09+13:00")
add("c","JACK","2027-01-18T00:20:00+13:00","editor: split view","src/jack.c",25)
add("c","JACK","2027-01-18T00:50:00+13:00","editor: split view fix","src/jack.c",10)
add("c","MEI","2027-01-19T10:00:00+08:00","editor: split view tests","src/mei.c",20)
add("c","JACK","2027-01-20T13:00:00+13:00","editor: split view resize","src/jack.c",25)
add("c","TAMA","2027-01-21T16:00:00+13:00","editor: fix redo bug","src/tama.c",15,"2027-01-29T21:00:10+13:00")
add("c","MEI","2027-01-21T20:00:00+08:00","editor: docs","src/mei.c",15)
add("c","JACK","2027-01-22T22:00:00+13:00","editor: final features","src/jack.c",30)
add("c","JACK","2027-01-25T10:00:00+13:00","editor: polish","src/jack.c",20)
add("m:pr1","MEI","2027-01-26T10:00:00+13:00","Merge pull request #1 from team/pr1")
add("m:pr2","MEI","2027-01-26T10:10:00+13:00","Merge pull request #2 from team/pr2")
add("m:pr3","MEI","2027-01-26T10:20:00+13:00","Merge pull request #3 from team/pr3")
add("m:pr4","MEI","2027-01-27T09:00:00+13:00","Merge pull request #4 from team/pr4")
add("m:pr5","MEI","2027-01-27T09:10:00+13:00","Merge pull request #5 from team/pr5")
add("m:pr6","MEI","2027-01-27T09:20:00+13:00","Merge pull request #6 from team/pr6")
add("c","MEI","2027-01-27T19:00:00+08:00","editor: release notes","src/mei.c",15)
add("c","JACK","2027-01-28T15:00:00+13:00","editor: more polish","src/jack.c",15)
add("c","JACK","2027-01-30T09:00:00+13:00","editor: last fixes","src/jack.c",10)
add("c","TAMA","2027-02-02T10:00:00+13:00","editor: post-term cleanup","src/tama.c",10,"2027-02-02T10:00:00+13:00")
for k in range(17):
    t = datetime(2026,10,5,6,0,tzinfo=timezone.utc) + timedelta(days=7*k)
    rows.append(("bot","GHA",t.isoformat(),t.isoformat(),"BUILDNUM",k+1,"chore: bump build number"))
def inst(r): return datetime.fromisoformat(r[3] if r[0] == "c" else r[2])
for i, r in enumerate(sorted(rows, key=lambda r: (inst(r), rows.index(r)))):
    print("|".join(str(x) for x in r))
PY
ROWS=.git/t4rows
seq=0
while IFS='|' read -r kind who ad cd file n msg; do
  case "$who" in
    JACK) A=("${JACK[@]}");; TAMA) A=("${TAMA[@]}");; TAMA2) A=("${TAMA2[@]}");; MEI) A=("${MEI[@]}");; GHA) A=("${GHA[@]}");;
  esac
  seq=$((seq+1))
  case "$kind" in
    c)   put "$file" "$n" "t$seq"; ci "${A[@]}" "$ad" "$msg" "$cd";;
    b:*) git checkout -q -b "${kind#b:}" main; put "$file" "$n" "t$seq"; ci "${A[@]}" "$ad" "$msg" "$cd"; git checkout -q main;;
    m:*) mg "${kind#m:}" "${A[@]}" "$ad" "$msg"; git branch -q -D "${kind#m:}";;
    bot) echo "build $n" > BUILDNUM; ci "${A[@]}" "$ad" "$msg" "$cd";;
  esac
done < "$ROWS"
rm -f "$ROWS"

git reflog expire --expire=now --all
git gc -q --prune=now
git rev-parse HEAD
