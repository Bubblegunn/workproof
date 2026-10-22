#!/usr/bin/env python3
"""usage: failed-cells.py <runs-dir> [--expect N]
Prints one `<task> <arm> <n>` line for every run that must be repeated before grading: no DONE marker, no result event,
a result with is_error or a non-success subtype, or a rate-limit / overload / API-error message in the result or the final events.
A round is never graded while this prints anything."""
import json, os, re, sys
runs = sys.argv[1]
bad = []
BAD_TEXT = re.compile(r"rate[_ -]?limit|overloaded|\b429\b|\b529\b|usage limit|api_error|quota", re.I)
for name in sorted(os.listdir(runs)):
    d = os.path.join(runs, name)
    m = re.fullmatch(r"([TH]\d+)-(.+)-(\d+)", name)
    if not m or not os.path.isdir(d): continue
    if not os.path.exists(os.path.join(d, "DONE")): bad.append(name); continue
    result = None; tail = []
    try:
        for line in open(os.path.join(d, "out.jsonl")):
            tail = (tail + [line])[-6:]
            try: o = json.loads(line)
            except ValueError: continue
            if o.get("type") == "result": result = o
    except OSError:
        bad.append(name); continue
    if result is None or result.get("is_error") or result.get("subtype") != "success": bad.append(name); continue
    text = str(result.get("result", ""))[:600]
    if len(text) < 400 and BAD_TEXT.search(text): bad.append(name); continue
    if any(BAD_TEXT.search(l) and '"type":"system"' in l and "api_retry" in l for l in tail): bad.append(name)
for n in bad:
    t, a, i = re.fullmatch(r"([TH]\d+)-(.+)-(\d+)", n).groups()
    print(t, a, i)
