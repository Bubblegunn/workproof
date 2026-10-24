# usage: run.sh <workdir> <plugin-dir> <model> <out> <prompt>
# Runs Claude Code with a temporary HOME so that no plugin, hook or MCP server of the real configuration is loaded and nothing
# a plugin writes lands in it. The temporary HOME gets the account fields of ~/.claude.json (no servers, no hooks) and a link to the
# keychain folder so that the login works. H2H_HOME_ROOT is where the temporary homes are made.
REAL=${HOME_REAL:-$HOME}
ROOT=${H2H_HOME_ROOT:-${TMPDIR:-/tmp}/h2h-homes}
TH=$ROOT/$(basename "$(dirname "$1")")
mkdir -p "$TH/Library"
ln -sfn "$REAL/Library/Keychains" "$TH/Library/Keychains"
python3 - "$REAL/.claude.json" "$TH/.claude.json" <<'PY'
import json, sys
c = json.load(open(sys.argv[1]))
keep = {k: c[k] for k in ("oauthAccount", "userID", "installMethod") if k in c}
keep["hasCompletedOnboarding"] = True
json.dump(keep, open(sys.argv[2], "w"))
PY
cd "$1" && HOME="$TH" claude -p "$5" --setting-sources project --plugin-dir "$2" --model "$3" --dangerously-skip-permissions --strict-mcp-config --output-format stream-json --verbose ${H2H_HOOK_EVENTS:+--include-hook-events} < /dev/null > "$4" 2>&1
