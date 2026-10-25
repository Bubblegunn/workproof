#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/p-limit; PIN=7d14b3f04aa990f621a853e24e2a4b796baf1ec9
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <dest-dir>" >&2; exit 2; }
DEST="$1"; case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
export TZ=UTC LC_ALL=C
rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
git clone -q "$REPO_URL" "$DEST"
G() { git -C "$DEST" "$@"; }
G checkout -q -B fixture "$PIN"
for b in $(G for-each-ref --format='%(refname:short)' refs/heads); do [ "$b" = fixture ] || G branch -q -D "$b"; done
for r in $(G remote); do G remote remove "$r"; done
for t in $(G tag -l); do G tag -d "$t" >/dev/null; done
# c <author-name> <author-email> <author-date> <message> [committer-name committer-email committer-date]
c() {
  G add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q --allow-empty -m "$4"
}
finish() {
  G branch -q -m fixture main
  G reflog expire --expire=now --all
  G gc -q --prune=now
  echo "HEAD $(G rev-parse HEAD)"
}
w() { mkdir -p "$(dirname "$DEST/$1")"; cat > "$DEST/$1"; }

ap() { mkdir -p "$(dirname "$DEST/$1")"; cat >> "$DEST/$1"; }
rv() {
  local t; t=$(G log -1 --format=%H --fixed-strings --grep="$4" fixture)
  G revert --no-commit "$t" >/dev/null
  c "$1" "$2" "$3" "Revert \"$4\"

This reverts commit $t." "${@:5}"
}
MARA=("Mara Linden" mara@example.com)
NILS=("Nils Norell" nils@example.com)

w MAINTAINERS.md <<'MD'
# Maintainers

- Mara Linden <mara@example.com>
- Nils Norell <nils@example.com>

Everyone else who sends a patch is a contributor.
MD
w .mailmap <<'MM'
Zoe Park <zoe@example.com> zpark <zpark@users.noreply.example>
Nils Norell <nils@example.com> Nils N. <nils.norell@private.example>
MM
c "${MARA[@]}" "2025-03-01T09:00:00+00:00" "docs: list maintainers and add mailmap"

sed -i.bak 's/"version": "6.2.0"/"version": "6.3.0"/' "$DEST/package.json"; rm "$DEST/package.json.bak"
c "${MARA[@]}" "2025-03-03T09:00:00+00:00" "6.3.0"

ap index.js <<'JS'

export function queueSize(limit) {
	return limit.pendingCount + limit.activeCount;
}
JS
c "Zoe Park" zoe@example.com "2025-03-05T10:00:00+00:00" "Add queueSize helper"

ap readme.md <<'MD'

## Tips

Use `limit.clearQueue()` to drop work that has not started yet.
MD
c "zpark" zpark@users.noreply.example "2025-03-06T10:00:00+00:00" "Docs: mention clearQueue in readme"

ap test.js <<'JS'

test('queueSize counts pending and active', t => {
	t.is(queueSize(pLimit(1)), 0);
});
JS
c "Zoe Park" zoe.park@work.example.org "2025-03-07T10:00:00+00:00" "Test queueSize"

ap index.d.ts <<'TS'

export function rejectOnClear(limit: unknown): void;
TS
c "José Álvarez" jose@example.com "2025-03-08T10:00:00+00:00" "Add rejectOnClear typing"

ap index.d.ts <<'TS'

export type LimitFunction = unknown;
TS
c "Jose Alvarez" jose@example.com "2025-03-09T10:00:00+00:00" "Export LimitFunction type"

ap package.json <<'EOF2'
EOF2
sed -i.bak 's/"ava": "[^"]*"/"ava": "^6.3.0"/' "$DEST/package.json"; rm "$DEST/package.json.bak"
c "dependabot[bot]" "49699333+dependabot[bot]@users.noreply.example" "2025-03-10T04:00:00+00:00" "Bump ava from 6.2.0 to 6.3.0"

ap recipes.md <<'MD'
# Recipes

Retry a failing task with exponential backoff.
MD
c "Sam Teller" sam@example.com "2025-03-12T10:00:00+00:00" "Add retry recipe"

# cherry-picked: author is the contributor, committer is the maintainer
ap index.js <<'JS'

export function isLimit(fn) {
	return typeof fn === 'function' && 'concurrency' in fn;
}
JS
c "Rafael Sousa" rafael@example.com "2025-03-11T10:00:00+00:00" "Add isLimit type guard

(cherry picked from commit 5d1f0c2a9b7e4c3d8a6f1e2b0c9d8e7f6a5b4c3d)" "${NILS[@]}" "2025-03-14T11:00:00+00:00"

rv "${MARA[@]}" "2025-03-15T09:00:00+00:00" "Add retry recipe"

# squash merge: author Priya, two co-authors, one already counted via another identity
ap index.js <<'JS'

export function drain(limit) {
	return limit.clearQueue();
}
JS
c "Priya Nair" priya@example.com "2025-03-16T10:00:00+00:00" "Add drain() to wait for the queue (#98)

* wip
* review fixes

Co-authored-by: Quinn Okafor <quinn@example.com>
Co-authored-by: Wen Zhao <wen@example.com>
Co-authored-by: Zoe Park <zoe@example.com>" "${NILS[@]}" "2025-03-17T09:00:00+00:00"

ap readme.md <<'MD'

## Credits

Thanks to everyone who reported bugs.
MD
c "Tess Ibarra" tess@example.com "2025-03-18T10:00:00+00:00" "Docs: add credits paragraph"

# merged topic branch, maintainer's second e-mail
ap index.js <<'JS'

export const defaultConcurrency = 1;
JS
c "Nils N." nils.norell@private.example "2025-03-19T10:00:00+00:00" "Export defaultConcurrency"

BASE=$(G rev-parse HEAD)
G checkout -q -b topic "$BASE"
ap benchmark.js <<'JS'

// added: measure queueSize overhead
JS
c "Uma Vogel" uma@example.com "2025-03-20T10:00:00+00:00" "Benchmark queueSize overhead"
G checkout -q fixture
GIT_AUTHOR_NAME="${NILS[0]}" GIT_AUTHOR_EMAIL="${NILS[1]}" GIT_AUTHOR_DATE="2025-03-21T09:00:00+00:00" \
GIT_COMMITTER_NAME="${NILS[0]}" GIT_COMMITTER_EMAIL="${NILS[1]}" GIT_COMMITTER_DATE="2025-03-21T09:00:00+00:00" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff topic -m "Merge pull request #101 from uma/bench"
G branch -q -D topic

c "github-actions[bot]" "41898282+github-actions[bot]@users.noreply.example" "2025-03-22T03:00:00+00:00" "Update size snapshot"

finish
