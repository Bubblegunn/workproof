#!/usr/bin/env bash
# T2 fixture: pallets/click, author Kevin Deldycke (2 real identities + 1 case variant). Usage: build-fixture.sh <dir>
UPSTREAM=pallets/click
ME_NAME="Kevin Deldycke"; ME_EMAIL="kevin@deldycke.com"
set -euo pipefail
OUT="${1:?usage: build-fixture.sh <output-dir>}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"; REPO="$OUT/repo"
rm -rf "$REPO"
git clone -q "https://github.com/$UPSTREAM.git" "$REPO"
cd "$REPO"
git remote remove origin
git config user.name "$ME_NAME"; git config user.email "$ME_EMAIL"
git config commit.gpgsign false; git config core.hooksPath /dev/null
BR="$(git symbolic-ref --short HEAD)"
# c NAME EMAIL DATE MSG : commit everything staged/unstaged as that identity
c() {
  git add -A -f
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" \
  GIT_AUTHOR_DATE="$3" GIT_COMMITTER_DATE="$3" git commit -q --no-verify -m "$4"
}
gen() { seq 1 "$1" | sed "s/.*/$2/"; }   # gen N 'template with &'
K2="kdeldycke@users.noreply.github.com"
# pitfall 1: vendored library committed by the user
mkdir -p src/click/_vendor; gen 5000 'VALUE_& = &' > src/click/_vendor/colors.py
c "Kevin Deldycke" "$K2" "2025-04-01T10:00:00+00:00" "build: vendor colour tables"
# pitfall 2: generated docs and lockfile committed by the user
mkdir -p docs/generated; gen 4000 '.. option:: --flag-&' > docs/generated/api.rst
gen 2500 'package-&=1.0.&' > uv.lock
c "Kevin Deldycke" "kevin@deldycke.com" "2025-04-02T10:00:00+00:00" "docs: regenerate API reference and lock"
# pitfall 3: a feature and its revert, both by the user (net zero)
gen 300 'def helper_&(): return &' > src/click/_helpers_tmp.py
c "Kevin Deldycke" "kevin@deldycke.com" "2025-04-03T10:00:00+00:00" "feat: add helpers"
git rm -q src/click/_helpers_tmp.py
c "Kevin Deldycke" "kevin@deldycke.com" "2025-04-04T10:00:00+00:00" "Revert \"feat: add helpers\""
# pitfall 4: bot commit
echo fix > .pre-commit-fix.txt
c "pre-commit-ci[bot]" "66853113+pre-commit-ci[bot]@users.noreply.github.com" "2025-04-05T10:00:00+00:00" "[pre-commit.ci] auto fixes"
# pitfall 5: squash merge authored by the user with co-authors
gen 150 'def squashed_&(): return &' > src/click/_squashed.py
c "Kevin Deldycke" "$K2" "2025-04-06T10:00:00+00:00" "Add squashed feature (#9101)

Co-authored-by: Pat Example <pat@example.org>
Co-authored-by: Sam Sample <sam@example.org>"
# pitfall 6: uppercase email variant
echo z > notes-z.txt
c "Kevin Deldycke" "Kevin@Deldycke.COM" "2025-04-07T10:00:00+00:00" "docs: note"
# pitfall 7: lookalike colleague and a merge commit authored by the user
git checkout -q -b topic
echo a > topic-a.txt; c "Kevin Deldycke-Martin" "kevin.dm@example.org" "2025-04-08T10:00:00+00:00" "topic: a"
echo b > topic-b.txt; c "Kevin Deldycke-Martin" "kevin.dm@example.org" "2025-04-09T10:00:00+00:00" "topic: b"
git checkout -q "$BR"
GIT_AUTHOR_NAME="Kevin Deldycke" GIT_AUTHOR_EMAIL="$K2" GIT_COMMITTER_NAME="Kevin Deldycke" GIT_COMMITTER_EMAIL="$K2" \
GIT_AUTHOR_DATE="2025-04-10T10:00:00+00:00" GIT_COMMITTER_DATE="2025-04-10T10:00:00+00:00" git merge -q --no-ff --no-verify topic -m "Merge pull request #9102 from x/topic"
git branch -q -D topic
echo "fixture ready: $REPO"
