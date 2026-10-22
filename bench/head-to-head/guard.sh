#!/bin/bash
# usage: guard.sh init <dir>   - record the hooks object of ~/.claude/settings.json and the mcpServers object of ~/.claude.json
#        guard.sh check <dir>  - compare with the record; on any difference write <dir>/STOP and exit 1
# Competitor plugins run with a temporary HOME (run.sh), so they should never touch the real configuration. This is the tripwire
# that proves it: run-one.sh calls `check` before and after every run and refuses to start while <dir>/STOP exists.
set -uo pipefail
MODE=$1; DIR=$2; mkdir -p "$DIR"
snap() {
  python3 - "$1" "$2" <<'PY'
import json, sys
s = json.load(open(sys.argv[1]))
c = json.load(open(sys.argv[2]))
print(json.dumps({"hooks": s.get("hooks"), "mcpServers": c.get("mcpServers")}, sort_keys=True))
PY
}
NOW=$(snap "$HOME_REAL/.claude/settings.json" "$HOME_REAL/.claude.json" 2>/dev/null || echo "unreadable")
if [ "$MODE" = init ]; then echo "$NOW" > "$DIR/config.base"; exit 0; fi
if [ ! -f "$DIR/config.base" ]; then echo "guard: no baseline in $DIR" >&2; exit 1; fi
if [ "$NOW" != "$(cat "$DIR/config.base")" ]; then date > "$DIR/STOP"; echo "guard: hooks or mcpServers of the real configuration changed" >&2; exit 1; fi
[ -f "$DIR/STOP" ] && { echo "guard: STOP file present" >&2; exit 1; }
exit 0
