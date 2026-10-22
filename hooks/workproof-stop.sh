#!/bin/sh
# workproof Stop hook. Pipes the hook input JSON to `workproof stop-check`, which prints one
# {"decision":"block",...} line only when the final answer shows an email address or leaves out the Gaps.
# Read-only, no network, exit 0 always; any failure prints nothing; the hook timeout in hooks.json bounds the run.
dir=$(dirname "$0")
cli="$dir/../dist/src/cli.js"
input=$(cat)
[ -f "$cli" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
out=$(printf '%s' "$input" | node "$cli" stop-check 2>/dev/null)
case $out in
  '{"decision":"block"'*) printf '%s\n' "$out" ;;
esac
exit 0
