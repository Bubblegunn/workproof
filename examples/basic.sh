#!/bin/sh
# Run workproof on this repository and verify the report it just wrote.
set -eu
out="${TMPDIR:-/tmp}/workproof-example"
node dist/src/cli.js --repo . --author "Efe Genc" --out "$out"
node dist/src/cli.js verify "$out.json" --repo .
