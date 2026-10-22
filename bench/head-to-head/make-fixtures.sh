#!/bin/bash
# usage: make-fixtures.sh <workdir> [local-clone-of-tj/co]
# Builds F1 (author repo), F3 (F1 plus a tampered report in ./received) and F4 (invented Claude Code home).
# Needs: git, node 22 or newer, a built workproof (npm run build) for F3, and the receipts plugin for F4.
set -euo pipefail
mkdir -p "$1"; W=$(cd "$1" && pwd)
SRC=${2:-https://github.com/tj/co.git}
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../.." && pwd)
# F1: a full clone, not shallow and not blobless. The origin is removed so that nothing says the repo is public.
rm -rf "$W/F1"; git clone --quiet "$SRC" "$W/F1"
cd "$W/F1"
EMAIL=$(git log --format=%ae --author='Jonathan Ong' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')
git config user.name "Jonathan Ong"; git config user.email "$EMAIL"
git remote remove origin
echo "F1 ready: $(git rev-list --count --no-merges HEAD) non-merge commits in total"
# F3: F1 plus the frozen forged report of round 3 (fixtures/F3-round3, made by forge3.mjs: figures raised, a false identity.merged claim, hash recomputed so `check` passes).
# fixtures/F3-round1 holds the round 1 report (hash left stale) and fixtures/F3-round2 the round 2 report (hash recomputed, no merged claim). Both are committed, so the fixture does not depend on the build under test.
rm -rf "$W/F3"; cp -R "$W/F1" "$W/F3"; mkdir "$W/F3/received"; cp "$HERE"/fixtures/F3-round3/workproof-report.* "$W/F3/received/"
echo "F3 ready"
# F4: invented home (receipts' own sample generator). Set RECEIPTS_PLUGIN to the receipts plugin directory.
if [ -n "${RECEIPTS_PLUGIN:-}" ]; then
  rm -rf "$W/F4"; mkdir -p "$W/F4"; node "$RECEIPTS_PLUGIN/assets/make-sample.mjs" "$W/F4" >/dev/null
  echo "F4 ready: set RECEIPTS_HOME=$W/F4/home and use $W/F4/home/code/acme-api as the working directory"
fi

# F7 and F8: the home-ground examples of JD Resume Tailor and GapToGrowth (set JD_PLUGIN and GAP_REPO to their clones).
if [ -n "${JD_PLUGIN:-}" ]; then
  rm -rf "$W/F7"; mkdir -p "$W/F7"; cp "$JD_PLUGIN/skills/jd-resume-tailor/references/portfolio-bank.sample.md" "$W/F7/portfolio-bank.md"
  echo "F7 ready"
fi
if [ -n "${GAP_REPO:-}" ]; then
  rm -rf "$W/F8"; mkdir -p "$W/F8/resumes"; cp "$GAP_REPO/examples/reference-resumes/Reference_Experienced_OnePage.md" "$W/F8/resumes/past-resume.md"
  echo "F8 ready"
fi
