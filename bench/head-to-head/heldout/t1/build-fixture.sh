#!/usr/bin/env bash
# T1 fixture: expressjs/express, author Wes Todd (3 identities). Usage: build-fixture.sh <dir>
UPSTREAM=expressjs/express
ME_NAME="Wes Todd"; ME_EMAIL="wes@wesleytodd.com"
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
W2="wtodd@netflix.com"; W3="wesleytodd@users.noreply.github.com"
# pitfall 1: vendored dir, committed by the user under the third identity
mkdir -p vendor/legacy-lib; gen 6000 'module.exports.v& = &;' > vendor/legacy-lib/index.js
c "Wes Todd" "$W3" "2025-02-03T10:00:00+00:00" "chore: vendor legacy-lib"
# pitfall 2: generated lockfile committed by the user
gen 3000 '  "dep&": "1.0.&",' > package-lock.json
c "Wes Todd" "$W2" "2025-02-04T10:00:00+00:00" "chore: add lockfile"
# pitfall 3: bot commits
for i in 1 2; do echo "bump $i" >> .bot-bump.txt; c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.github.com" "2025-02-1${i}T09:00:00+00:00" "build(deps): bump thing $i"; done
# pitfall 4: squash-merge commit authored by the user, co-authors credited
gen 120 'exports.f& = function () { return &; };' > lib-feature-x.js
gen 40 'it("case &", function () {});' > feature-x.test.js

c "Wes Todd" "wes@wesleytodd.com" "2025-03-05T12:00:00+00:00" "feat: add feature x (#9001)

Co-authored-by: Casey Other <casey@example.org>
Co-authored-by: Robin Else <robin@example.org>"
# pitfall 5: uppercase email variant of the same person
echo "x" > docs-note.txt
c "Wes Todd" "WES@WESLEYTODD.COM" "2025-03-06T12:00:00+00:00" "docs: note"
# pitfall 6: a lookalike colleague, plus a merge commit authored by the user
git checkout -q -b topic
echo a > topic-a.txt; c "Wes Todd-Smith" "wts@example.org" "2025-03-10T10:00:00+00:00" "topic: a"
echo b > topic-b.txt; c "Wes Todd-Smith" "wts@example.org" "2025-03-11T10:00:00+00:00" "topic: b"
git checkout -q "$BR"
GIT_AUTHOR_NAME="Wes Todd" GIT_AUTHOR_EMAIL="$W2" GIT_COMMITTER_NAME="Wes Todd" GIT_COMMITTER_EMAIL="$W2" \
GIT_AUTHOR_DATE="2025-03-12T10:00:00+00:00" GIT_COMMITTER_DATE="2025-03-12T10:00:00+00:00" git merge -q --no-ff --no-verify topic -m "Merge pull request #9002 from x/topic"
git branch -q -D topic
# pitfall 7: someone else's commit crediting the user only in a trailer
echo y > docs-note2.txt
c "Casey Other" "casey@example.org" "2025-03-13T10:00:00+00:00" "docs: pair work

Co-authored-by: Wes Todd <wes@wesleytodd.com>"
git status --short | head -1 >/dev/null
echo "fixture ready: $REPO"
