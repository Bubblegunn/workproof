#!/bin/bash
# usage: seal-e.sh <stage-dir>
# Seals the staged set e on the LOCAL branch heldout-2026-10-wp-e with git plumbing: no checkout, no change to the working tree
# or the index of the current branch, nothing pushed. The commit holds HEAD's tree plus bench/head-to-head/heldout-e/.
set -euo pipefail
STAGE=$1; REPO=$(cd "$(dirname "$0")/../../.." && pwd)
TMP=$(mktemp -d); mkdir -p "$TMP/bench/head-to-head"; cp -R "$STAGE" "$TMP/bench/head-to-head/heldout-e"; rm -rf "$TMP/bench/head-to-head/heldout-e/.git"
export GIT_DIR="$REPO/.git" GIT_WORK_TREE="$TMP" GIT_INDEX_FILE="$TMP/.index"
git read-tree HEAD
git add -f bench/head-to-head/heldout-e
TREE=$(git write-tree)
COMMIT=$(git commit-tree "$TREE" -p HEAD -m "heldout set e (workproof round 14), sealed locally, not pushed")
git update-ref refs/heads/heldout-2026-10-wp-e "$COMMIT"
echo "sealed $COMMIT"
rm -rf "$TMP"
