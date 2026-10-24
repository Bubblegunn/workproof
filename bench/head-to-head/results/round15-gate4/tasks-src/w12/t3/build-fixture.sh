#!/usr/bin/env bash
# Deterministic fixture builder.  Usage: build-fixture.sh <dest>
set -euo pipefail
REPO_URL=https://github.com/sindresorhus/p-limit.git; PIN=25655a000c5179f6d3732243b2d069d8073eaf71
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
rv() { # rv <sha> <author> <email> <date>
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  git revert --no-edit "$1" >/dev/null
}
# gen <n-lines> <tag> : n javascript-ish lines
gen() { awk -v n="$1" -v t="$2" 'BEGIN{for(i=0;i<n;i++){k=1+int(i/3); r=i%3; if(r==0) printf "export function %s%d(x) {\n", t, k; else if(r==1) printf "  return x + %d;\n", k; else printf "}\n"}}'; }
put() { mkdir -p "$(dirname "$1")"; gen "$2" "$3" >> "$1"; }   # put <file> <n> <tag>

SOFIA=("Sofia Marin" sofia.marin@students.example.ac.uk)
NOAH=("Noah Brandt" noah.brandt@students.example.ac.uk)
NOAH2=("Noah Brandt" noah.brandt@mail.example.net)
VIK=("Viktor Pavlenko" v.pavlenko@students.example.ac.uk)
VIK2=("Viktor Pavlenko" viktor.p@home.example.net)
LENA=("Lena Fischer" lena.fischer@students.example.ac.uk)
OKOYE=("Ms Okoye" okoye@cs.example.ac.uk)
RENOV=("renovate[bot]" 29139614+renovate[bot]@users.noreply.example.org)

# triv <dir> <start-epoch> <count> : padding commits that touch only whitespace, blank lines or comments
triv() {
  local d="$1" e="$2" n="$3" i f="$1/retry.js" msg
  for ((i=0;i<n;i++)); do
    case $((i%3)) in
      0) if sed -n 3p "$f" | grep -q ' $'; then awk 'NR==3{sub(/ +$/,"")}1' "$f" > "$f.t"; else awk 'NR==3{$0=$0 " "}1' "$f" > "$f.t"; fi
         mv "$f.t" "$f"; msg="tidy whitespace";;
      1) echo "// note $((i+1))" >> "$f"; msg="add comment";;
      2) echo "" >> "$f"; msg="spacing";;
    esac
    if ((i%2)); then ci "${VIK2[@]}" "$((e+i*86400*2)) +0000" "$msg"; else ci "${VIK[@]}" "$((e+i*86400*2)) +0000" "$msg"; fi
  done
}

# --- instructor setup (before the term) ---
mkdir -p src
cat > PROJECT.md <<'T'
# Team 7: concurrency toolkit

Students: Sofia Marin, Noah Brandt, Viktor Pavlenko, Lena Fischer.
Instructor: Ms Okoye (not part of the team).
Our code goes in src/ (tests in test/). The repository started as a copy of the open-source p-limit package.
T
printf 'export * from "./scheduler.js";\n' > src/index.js
printf '20\n' > .node-version
ci "${OKOYE[@]}" 2026-10-01T09:00:00+01:00 "Add project notes and src stub"

put src/scheduler.js 120 sched1
ci "${SOFIA[@]}" 2026-10-07T10:00:00+01:00 "Add scheduler"
put src/retry.js 80 retry1
ci "${NOAH[@]}" 2026-10-09T14:00:00+01:00 "Add retry helper"
put src/metrics.js 70 metr1; put test/metrics.test.js 40 tmetr1
ci "${LENA[@]}" 2026-10-12T16:00:00+01:00 "Add metrics and tests"
put src/cache.js 60 cache1
ci "${VIK[@]}" 2026-10-14T11:00:00+01:00 "Add cache"
triv src 1792152000 20

put src/pipeline.js 200 pipe1
ci "${NOAH[@]}" 2026-10-20T15:00:00+01:00 "feat: pipeline"
rv "$(git rev-parse HEAD)" "${SOFIA[@]}" 2026-10-22T09:30:00+01:00
put src/pipeline.js 210 pipe2
ci "${NOAH2[@]}" 2026-11-02T20:00:00+00:00 "feat: pipeline (reapplied with fixes)"
put src/metrics.js 25 metr2
ci "${LENA[@]}" 1970-01-01T00:00:00+00:00 "fix: rounding" 2026-11-04T10:00:00+00:00
git mv src lib
ci "${SOFIA[@]}" 2026-11-10T11:00:00+00:00 "refactor: rename src to lib"
triv lib 1794484800 20

git checkout -q -b feature/docs
put docs/guide.md 60 guide
sed -i.bak 's/^export function \(.*\)(x) {$/Step \1 explains how the toolkit handles one situation./; s/^  return x + \(.*\);$/It returns a value that grows by \1 each time./; s/^}$/See the examples folder for more./' docs/guide.md && rm docs/guide.md.bak
ci "${LENA[@]}" 2026-11-14T13:00:00+00:00 "docs: user guide"
put docs/api.md 40 api
sed -i.bak 's/^export function \(.*\)(x) {$/Call \1 with one number./; s/^  return x + \(.*\);$/The result is the input plus \1./; s/^}$/Errors are thrown as usual./' docs/api.md && rm docs/api.md.bak
ci "${LENA[@]}" 2026-11-16T13:00:00+00:00 "docs: api reference"
git checkout -q main
mg feature/docs "${SOFIA[@]}" 2026-11-18T09:00:00+00:00 "Merge branch 'feature/docs'"
git branch -q -D feature/docs

mkdir -p dist; awk 'BEGIN{for(i=1;i<=300;i++) printf "var a%d=function(b){return b+%d},", i, i; print ""}' > dist/bundle.min.js
ci "${NOAH[@]}" 2026-11-20T12:00:00+00:00 "build: add dist bundle"
printf '22\n' > .node-version
ci "${RENOV[@]}" 2026-11-22T03:00:00+00:00 "Update node.js to v22"
{ printf '{\n  "lockfileVersion": 3,\n  "packages": {\n'; awk 'BEGIN{for(i=1;i<=600;i++) printf "    \"node_modules/pkg%d\": { \"version\": \"1.0.%d\" },\n", i, i}'; printf '  }\n}\n'; } > package-lock.json
ci "${LENA[@]}" 2026-11-25T16:00:00+00:00 "chore: add package-lock"
put test/cache.test.js 35 tcache1
ci "${VIK2[@]}" 2026-12-02T18:00:00+00:00 "Add cache tests"
put lib/scheduler.js 60 sched2
ci "${SOFIA[@]}" 2026-12-05T10:00:00+00:00 "scheduler: priorities"
put lib/retry.js 45 retry2
ci "${NOAH[@]}" 2026-12-10T14:00:00+00:00 "retry: backoff"
put lib/cache.js 40 cache2
ci "${VIK[@]}" 2026-12-15T17:00:00+00:00 "cache: expiry"
put test/scheduler.test.js 70 tsched1
ci "${SOFIA[@]}" 2026-12-20T11:00:00+00:00 "Add scheduler tests"
put lib/metrics.js 35 metr3
ci "${LENA[@]}" 2027-01-08T15:00:00+00:00 "metrics: histograms"
put lib/retry.js 20 retry3
ci "${NOAH[@]}" 2027-01-22T23:45:00+00:00 "retry: jitter"
put lib/retry.js 15 retry4
ci "${NOAH2[@]}" 2027-01-23T08:30:00+09:00 "retry: cap delays"
put lib/metrics.js 25 metr4
ci "${LENA[@]}" 2027-01-23T00:20:00+00:00 "metrics: last additions"
put lib/scheduler.js 30 sched3
ci "${SOFIA[@]}" 2027-01-20T15:00:00+00:00 "scheduler: fairness" 2027-02-03T10:00:00+00:00

git reflog expire --expire=now --all
git gc -q --prune=now
git rev-parse HEAD
