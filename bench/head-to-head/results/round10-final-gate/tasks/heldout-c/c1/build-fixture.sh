#!/usr/bin/env bash
# build-fixture.sh <dest-dir> : mistune (Python) + synthetic history for task c1
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"
git clone -q https://github.com/lepture/mistune "$DEST"
cd "$DEST"
git checkout -q -B main 177a0ceefd23a8ebc7f7efb5c89c0be8023ae3bf
git remote remove origin
git tag -l | xargs -r git tag -d >/dev/null
git for-each-ref refs/heads --format='%(refname:short)' | grep -v '^main$' | xargs -r git branch -D >/dev/null || true

# c NAME EMAIL DATE MSG [COMMITTER_DATE]
c() {
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" GIT_COMMITTER_DATE="${5:-$3}" \
  git commit -q -m "$4"
}
gen() { awk -v n="$3" -v p="$2" 'BEGIN{for(i=1;i<=n;i++) printf "def %s_%d(x):\n    return x + %d\n\n", p,i,i}' > "$1"; }
D1='Dana Reyes'; E1='dana.reyes@acme-corp.example'
D2='dreyes';     E2='dana.reyes@gmail.example'
P='Priya Nair';  EP='priya.nair@acme-corp.example'

gen src/mistune/plugins/toc_ext.py toc 20; gen tests/test_toc_ext.py test_toc 10
c "$D1" "$E1" '2025-01-14T10:12:00+00:00' 'Add table-of-contents extension plugin'

printf '\n\ndef fix_collision(ids):\n    return sorted(set(ids))\n' >> src/mistune/plugins/toc_ext.py
c "$D2" "$E2" '2025-02-03T15:40:00+00:00' 'Fix heading id collision in toc_ext

Signed-off-by: Dana Reyes <dana.reyes@gmail.example>'

mkdir -p vendor/slugify; gen vendor/slugify/slugify.py slug 1300; gen vendor/slugify/special.py special 700
c "$D1" "$E1" '2025-02-10T09:00:00+00:00' 'Vendor python-slugify 8.0.4 for offline builds'

printf 'text-unidecode==1.3\n' >> MANIFEST.in
c 'dependabot[bot]' '49699333+dependabot[bot]@users.noreply.github.example' '2025-03-05T04:00:00+00:00' 'Bump text-unidecode from 1.2 to 1.3'

gen src/mistune/renderers/latex_footnotes.py latexfn 40
c "$D1" "$E1" '2025-03-12T14:25:00+00:00' 'Add footnote renderer for LaTeX output'

sed -i.bak 's/return x + 1$/return x + 100/' src/mistune/renderers/latex_footnotes.py && rm src/mistune/renderers/latex_footnotes.py.bak
printf '\n\ndef render_all(notes):\n    return "".join(notes)\n' >> src/mistune/renderers/latex_footnotes.py
c "$P" "$EP" '2025-03-20T11:05:00+00:00' 'Refactor footnote renderer

Co-authored-by: Dana Reyes <dana.reyes@acme-corp.example>'

gen src/mistune/fastpath.py fast 14
c "$D1" "$E1" '2025-04-02T16:30:00+00:00' 'Speed up inline parser (30% faster)'
GIT_AUTHOR_NAME="$D1" GIT_AUTHOR_EMAIL="$E1" GIT_AUTHOR_DATE='2025-04-04T09:15:00+00:00' \
GIT_COMMITTER_NAME="$D1" GIT_COMMITTER_EMAIL="$E1" GIT_COMMITTER_DATE='2025-04-04T09:15:00+00:00' \
  git revert --no-edit HEAD >/dev/null

git checkout -q -b feature/math-v2
gen src/mistune/plugins/math_v2.py mathv2 25
c "$D1" "$E1" '2025-04-15T13:00:00+00:00' 'Add math plugin v2 with block-level support'
gen tests/test_math_v2.py test_mathv2 12
c "$D1" "$E1" '2025-04-16T10:30:00+00:00' 'Add tests for math plugin v2'
git checkout -q main
GIT_AUTHOR_NAME="$D1" GIT_AUTHOR_EMAIL="$E1" GIT_AUTHOR_DATE='2025-04-17T08:00:00+00:00' \
GIT_COMMITTER_NAME="$D1" GIT_COMMITTER_EMAIL="$E1" GIT_COMMITTER_DATE='2025-04-17T08:00:00+00:00' \
  git merge -q --no-ff -m 'Merge branch feature/math-v2' feature/math-v2 >/dev/null
git branch -q -d feature/math-v2

# mechanical header on every source file
for f in $(git ls-files 'src/*.py'); do sed -i.bak '1i\
# fmt: formatted' "$f"; rm "$f.bak"; done
c "$D1" "$E1" '2025-05-06T12:00:00+00:00' 'Apply formatter header to all source files'

# rebased commit: authored before the review period, committed (rebased) during it
gen src/mistune/plugins/abbr_ext.py abbrext 18
c "$D1" "$E1" '2024-11-30T17:20:00+00:00' 'Add abbreviation extension plugin' '2025-05-09T10:00:00+00:00'

printf '\n\ndef strike(x):\n    return "~~" + x + "~~"\n' >> src/mistune/plugins/abbr_ext.py
c "$P" "$EP" '2025-06-02T09:30:00+00:00' 'Tweak abbr_ext output'
git status --porcelain | grep . && exit 1 || true
