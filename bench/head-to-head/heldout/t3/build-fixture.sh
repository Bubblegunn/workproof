#!/usr/bin/env bash
# T3 fixture: expressjs/express, candidate Ulises Gascon (3 identities, name spelled two ways).
# Builds $1/repo (read-only clone the reviewer was given) and $1/report.json (the report to check, two figures altered).
UPSTREAM=expressjs/express
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ME_NAME="Reviewer Auditor"; ME_EMAIL="auditor@example.org"
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
U1="ulisesgascongonzalez@gmail.com"; U2="ulises.gascon@example-corp.test"; U3="ulisesgg@users.noreply.github.com"
# pitfall 1: vendored third-party tree and a built bundle, committed by the candidate under the second identity
mkdir -p third_party/parser dist; gen 7000 'var tp_& = &;' > third_party/parser/parser.js
gen 2000 'var b_&=&;' > dist/bundle.min.js
c "Ulises Gascon" "$U2" "2025-05-02T10:00:00+00:00" "chore: vendor parser and build bundle"
# pitfall 2: lockfile under the third identity
gen 3500 '  "pkg&": "2.0.&",' > pnpm-lock.yaml
c "Ulises Gascon" "$U3" "2025-05-03T10:00:00+00:00" "chore: lockfile"
# pitfall 3: bot commits
for i in 1 2 3; do echo "bump $i" >> .bot-bump.txt; c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.github.com" "2025-05-1${i}T09:00:00+00:00" "build(deps): bump x $i"; done
# pitfall 4: squash merge authored by the candidate with co-authors
gen 90 'exports.s& = function () { return &; };' > squashed-feature.js
c "Ulises Gascón" "$U1" "2025-05-20T12:00:00+00:00" "feat: squashed feature (#9201)

Co-authored-by: Lee Example <lee@example.org>"
# pitfall 5: uppercase email variant
echo q > note-q.txt
c "Ulises Gascón" "ULISESGASCONGONZALEZ@gmail.com" "2025-05-21T12:00:00+00:00" "docs: note"
# pitfall 6: lookalike and a merge authored by the candidate
git checkout -q -b topic
echo a > t-a.txt; c "Ulises Gascon Jr" "ugjr@example.net" "2025-05-22T10:00:00+00:00" "topic: a"
git checkout -q "$BR"
GIT_AUTHOR_NAME="Ulises Gascón" GIT_AUTHOR_EMAIL="$U1" GIT_COMMITTER_NAME="Ulises Gascón" GIT_COMMITTER_EMAIL="$U1" \
GIT_AUTHOR_DATE="2025-05-23T10:00:00+00:00" GIT_COMMITTER_DATE="2025-05-23T10:00:00+00:00" git merge -q --no-ff --no-verify topic -m "Merge pull request #9202 from x/topic"
git branch -q -D topic
# ---- the report the candidate sent, written by hand from the true figures with two altered ----
python3 -I "$HERE/truth.py" "$OUT" --json > "$OUT/.truth.json"
python3 -I - "$OUT" <<'PY'
import json, sys, hashlib
out = sys.argv[1]
t = json.load(open(out + "/.truth.json"))
import os; os.remove(out + "/.truth.json")
true_fig = {
  "commits_authored": t["commits_all_identities_no_merges"],
  "first_commit": t["first_commit_date"],
  "last_commit": t["last_commit_date"],
  "active_months": t["active_months"],
  "lines_added": t["lines_added_excl_vendored_generated_lock"],
  "lines_deleted": t["lines_deleted_excl_vendored_generated_lock"],
  "share_of_repo_commits_percent": t["share_of_repo_human_commits_percent"],
  "identities_merged": t["identities_seen"],
}
digest = hashlib.sha256(json.dumps(true_fig, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
fig = dict(true_fig)
fig["commits_authored"] = round(true_fig["commits_authored"] * 1.25)      # ALTERED 1
fig["lines_added"] = t["lines_added_raw"]                                  # ALTERED 2 (vendored and lock lines included)
report = {
  "subject": "Candidate A",
  "scope": "one private repository, default branch, all history",
  "excluded": ["merge commits", "bot accounts", "vendored directories", "lockfiles", "built bundles"],
  "figures": fig,
  "unverifiable_from_history": {"pull_requests_reviewed": 412},
  "figures_sha256": digest,
  "method": "git log per identity, identities merged, numstat summed after exclusions",
}
json.dump(report, open(out + "/report.json", "w"), indent=2)
PY
echo "fixture ready: $REPO and $OUT/report.json"
