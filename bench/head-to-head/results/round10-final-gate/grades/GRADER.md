# Grader

- Grader model(s) seen in the stored grader output (`modelUsage` of `<task>-grade.raw`): claude-sonnet-5-5.
- Invocation (from the round's `grade2.sh`): `claude -p --model sonnet --setting-sources project --strict-mcp-config --tools "" --output-format json < <task>-prompt.txt`.
  One call per task, no tools, the whole prompt on stdin.
- Prompt template source: `assemble.py` in this folder (copy of `bench/head-to-head/assemble.py`). It builds `<task>-prompt.txt` and
  `<task>-packet.txt`, shuffles the arms with `random.Random(f"{seed}-{task}")` and labels them A, B, C, ... The grader never sees arm names.
- `<task>-labels.json` is the shuffled order shown to the grader (letter -> arm). `<task>-packet.txt` is the packet; `<task>-prompt.txt` is the full prompt.
- Votes: one grader call per task, so one vote per task. Its parsed text is `<task>-grade.json` (per letter, per run number, per criterion: `[true|false, reason]`);
  the raw tool output (cost, usage, model) is `<task>-grade.raw`. `score.py` parses the first JSON object in `<task>-grade.json`.
- Earlier attempts (parse failures, re-asks) are stored beside the scored one as `<task>-grade-attempt1.*` and `<task>-prompt-attempt1.txt`; only the unsuffixed files are scored.
- `cost.txt`: grader cost per task in USD.
- Every file here is the redacted copy (see the redaction note in the folder README/SUMMARY). The prompt that was actually sent differs only where a
  placeholder `<email:xxxxxxxx>`, `<redacted:secret>`, `/Users/user`, `/home/user` or `claude-uid` replaced personal data.
