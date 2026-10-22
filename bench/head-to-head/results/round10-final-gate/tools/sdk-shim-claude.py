#!/Users/user/claude-kredi-runs/sdk-venv/bin/python -I
"""Drop-in `claude -p` replacement that runs through the Claude Agent SDK.

Put this directory first on PATH. Every `claude -p ...` call then goes through
claude_agent_sdk.query() with the same installed CLI binary, and the raw
stream-json messages the CLI emits are written to stdout unchanged, so runners
and graders see the same format as before.

Defaults match the plain CLI, not the SDK: Claude Code's own system prompt
(preset), setting sources user,project,local. Calls without -p/--print are
passed to the real CLI unchanged (version checks, plugin validate, etc.).
"""
import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REAL = open(os.path.join(HERE, "REAL_CLAUDE")).read().strip()

argv = sys.argv[1:]
if not any(a in ("-p", "--print") for a in argv):
    os.execv(REAL, [REAL] + argv)

from claude_agent_sdk import ClaudeAgentOptions, query  # noqa: E402
import claude_agent_sdk._internal.client as _client  # noqa: E402

# Credit guard: every finished call adds its total_cost_usd to LEDGER; once the
# sum reaches the number in LIMIT, new calls are refused, so usage never runs
# past the promotional credit into an unpaid balance.
LEDGER = os.path.join(HERE, "ledger.tsv")
LIMIT_FILE = os.path.join(HERE, "LIMIT")

# ACTIVE_KEY names the key file new calls use (read on every call, so the key can
# be switched while long runs continue). Each key file gets its own ledger and
# limit, because each organization has its own promotional credit.
_active = os.path.join(HERE, "ACTIVE_KEY")
if os.path.exists(_active):
    _key_path = os.path.expanduser(open(_active).read().strip())
    os.environ["ANTHROPIC_API_KEY"] = open(_key_path).read().strip()
    _name = os.path.basename(_key_path).lstrip(".")
    if _name != "anthropic_test_key":
        LEDGER = os.path.join(HERE, f"ledger-{_name}.tsv")
        LIMIT_FILE = os.path.join(HERE, f"LIMIT-{_name}")


def _ledger_total():
    try:
        return sum(float(l.split("\t")[2]) for l in open(LEDGER) if l.count("\t") >= 2)
    except FileNotFoundError:
        return 0.0


if os.path.exists(LIMIT_FILE):
    _limit = float(open(LIMIT_FILE).read().strip())
    _spent = _ledger_total()
    if _spent >= _limit:
        print(f"claude-sdk-shim: credit guard: ledger ${_spent:.2f} >= limit ${_limit:.2f}; call refused",
              file=sys.stderr)
        sys.exit(3)

# Controllers start with KREDI_NO_WEBSEARCH=1: web search is billed outside the
# promo credit. The flag is removed here so benchmark cells the controller
# launches keep the same tool set as before.
if os.environ.pop("KREDI_NO_WEBSEARCH", None) == "1":
    argv = argv + ["--disallowedTools", "WebSearch"]

# Flags that never take a value.
BOOL = {
    "p", "print", "verbose", "dangerously-skip-permissions", "strict-mcp-config",
    "include-partial-messages", "continue", "c", "fork-session", "debug",
    "no-session-persistence", "replay-user-messages", "bare",
}

opts = dict(
    system_prompt={"type": "preset", "preset": "claude_code"},
    setting_sources=["user", "project", "local"],
    cli_path=REAL,
    cwd=os.getcwd(),
    stderr=lambda line: print(line, file=sys.stderr, flush=True),
)
extra = {}
plugins, add_dirs = [], []
output_format = "text"
prompt = None
append_sp = None

i = 0
while i < len(argv):
    a = argv[i]
    if a == "--":
        rest = argv[i + 1:]
        prompt = " ".join(rest) if rest else prompt
        break
    if not a.startswith("-") or a == "-":
        if prompt is None:
            prompt = a
        i += 1
        continue
    name, eq, val = a.lstrip("-").partition("=")
    if not eq:
        if name in BOOL:
            val = None
        elif i + 1 < len(argv):
            i += 1
            val = argv[i]
        else:
            val = None
    i += 1

    if name in ("p", "print", "verbose", "input-format"):
        continue
    if name == "output-format":
        output_format = val
    elif name == "model":
        opts["model"] = val
    elif name == "fallback-model":
        opts["fallback_model"] = val
    elif name == "setting-sources":
        opts["setting_sources"] = [s for s in val.split(",") if s]
    elif name == "plugin-dir":
        plugins.append({"type": "local", "path": val})
    elif name == "add-dir":
        add_dirs.append(val)
    elif name in ("resume", "r"):
        opts["resume"] = val
    elif name == "tools":
        opts["tools"] = [] if val == "" else [t for t in val.replace(" ", ",").split(",") if t]
    elif name in ("allowedTools", "allowed-tools"):
        opts["allowed_tools"] = [t for t in val.replace(" ", ",").split(",") if t]
    elif name in ("disallowedTools", "disallowed-tools"):
        opts["disallowed_tools"] = [t for t in val.replace(" ", ",").split(",") if t]
    elif name == "system-prompt":
        opts["system_prompt"] = val
    elif name == "append-system-prompt":
        append_sp = val
    elif name == "permission-mode":
        opts["permission_mode"] = val
    elif name == "dangerously-skip-permissions":
        opts["permission_mode"] = "bypassPermissions"
    elif name == "strict-mcp-config":
        opts["strict_mcp_config"] = True
    elif name == "max-budget-usd":
        opts["max_budget_usd"] = float(val)
    elif name == "max-turns":
        opts["max_turns"] = int(val)
    elif name == "settings":
        opts["settings"] = val
    elif name == "effort":
        opts["effort"] = val
    elif name == "include-partial-messages":
        opts["include_partial_messages"] = True
    else:
        extra[name] = val

if append_sp is not None and isinstance(opts["system_prompt"], dict):
    opts["system_prompt"] = {"type": "preset", "preset": "claude_code", "append": append_sp}
if plugins:
    opts["plugins"] = plugins
if add_dirs:
    opts["add_dirs"] = add_dirs
if extra:
    opts["extra_args"] = extra
if prompt is None:
    prompt = sys.stdin.read()

last_result = {}
_parse = _client.parse_message


def _tee(data):
    global last_result
    if data.get("type") == "result":
        last_result = data
    if output_format == "stream-json":
        sys.stdout.write(json.dumps(data, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    return _parse(data)


_client.parse_message = _tee


async def main():
    async for _ in query(prompt=prompt, options=ClaudeAgentOptions(**opts)):
        pass


try:
    asyncio.run(main())
except Exception as e:  # keep the CLI's contract: message on stderr, exit 1
    print(f"claude-sdk-shim: {type(e).__name__}: {e}", file=sys.stderr)
    if not last_result:
        sys.exit(1)

if last_result:
    import time
    with open(LEDGER, "a") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%S')}\t{os.getcwd()}\t{last_result.get('total_cost_usd', 0) or 0}\n")

if output_format == "json":
    print(json.dumps(last_result, ensure_ascii=False))
elif output_format == "text":
    print(last_result.get("result", ""))
sys.exit(1 if last_result.get("is_error") else 0)
