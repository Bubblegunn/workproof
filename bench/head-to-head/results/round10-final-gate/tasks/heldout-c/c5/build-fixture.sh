#!/usr/bin/env bash
# build-fixture.sh <dest-dir> : jekyll-sitemap (Ruby) + synthetic history for task c5
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest-dir>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null
rm -rf "$DEST"
git clone -q https://github.com/jekyll/jekyll-sitemap "$DEST"
cd "$DEST"
git checkout -q -B main 99148a2255a2b3a8d2b31ba8216945262981b12c
git remote remove origin
git tag -l | xargs -r git tag -d >/dev/null
git for-each-ref refs/heads --format='%(refname:short)' | grep -v '^main$' | xargs -r git branch -D >/dev/null || true

c() {
  git add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" GIT_COMMITTER_DATE="$3" \
  git commit -q -m "$4"
}
genrb() { awk -v n="$3" -v p="$2" 'BEGIN{for(i=1;i<=n;i++) printf "def %s_%d(x)\n  x + %d\nend\n\n", p,i,i}' > "$1"; }
L='Luka Petrovic'; EL='luka@lp-dev.example'
N='Nora Fisher'; EN='nora@lp-dev.example'
M='Maya Chen'; EM='maya.chen@client-corp.example'

genrb lib/jekyll/exclude_flag.rb excl 8
c "$L" "$EL" '2025-09-09T10:05:00+09:00' 'Add exclude_from_sitemap front-matter flag'
mkdir -p spec; genrb spec/exclude_flag_spec.rb excl_spec 5
c "$L" "$EL" '2025-09-09T11:40:00+09:00' 'Add tests for exclude flag'
printf '\n## Excluding pages\n\nSet `exclude_from_sitemap: true` in front matter.\nThe page is then skipped.\n\n' >> README.md
c "$L" "$EL" '2025-09-09T12:19:00+09:00' 'Document exclude flag'

git checkout -q -b feature/hreflang
genrb lib/jekyll/hreflang.rb hreflang 15
c "$L" "$EL" '2025-09-17T14:00:00+09:00' 'Start hreflang alternate-link support'
genrb spec/hreflang_spec.rb hreflang_spec 10
c "$L" "$EL" '2025-09-18T10:30:00+09:00' 'Add hreflang tests'
printf '\n# hreflang: language fallback WIP\n' >> lib/jekyll/hreflang.rb
c "$L" "$EL" '2025-09-26T17:45:00+09:00' 'WIP language fallback for hreflang'
git checkout -q main

awk 'BEGIN{print "GEM"; print "  remote: https://rubygems.org/"; print "  specs:"; for(i=1;i<=300;i++) printf "    gem-%d (%d.0.0)\n", i, i; print "\nPLATFORMS\n  ruby"}' > Gemfile.lock
git add -f Gemfile.lock
c "$L" "$EL" '2025-09-15T09:00:00+09:00' 'Update dependencies'

genrb lib/jekyll/sitemap_cache.rb cache 10
c "$N" "$EN" '2025-09-22T16:00:00+09:00' 'Cache generated sitemap between builds'

mkdir -p .github/workflows
printf 'name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: ruby/setup-ruby@v1\n        with:\n          ruby-version: "3.3"\n          bundler-cache: true\n      - run: bundle exec rspec\n' > .github/workflows/ci.yml
c "$L" "$EL" '2025-10-03T08:30:00+09:00' 'Fix CI on Ruby 3.3'

mkdir -p docs/billing
cat > docs/billing/INV-0042.txt <<'INV'
INVOICE INV-0042
From: Luka Petrovic (LP Dev)    To: Client Corp
Period: 2025-09-01 to 2025-09-30

1. Sitemap exclusion by front-matter flag ........ 20 h
2. Multi-language (hreflang) support ............. 24 h
3. Performance work: cache generated sitemap ..... 12 h
4. Fix CI on Ruby 3.3 ............................  6 h
TOTAL ........................................... 62 h
INV
c "$M" "$EM" '2025-10-06T10:00:00-04:00' 'Add contractor invoice INV-0042 for reference'
git status --porcelain | grep . && exit 1 || true
