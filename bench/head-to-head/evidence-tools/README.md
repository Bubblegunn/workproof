# evidence-tools

Python 3 standard library only, no network, safe with `python3 -I`. Output goes to `bench/head-to-head/results/<round-id>/` (see EVIDENCE-SPEC.md).

| File | Use |
|---|---|
| `redact.py` | `redact(text, keep_emails=set())` and CLI (`redact.py [--keep ADDR] [FILE]`). E-mail -> `<email:sha8>`, secrets -> `<redacted:secret>`, `/Users/<n>` -> `/Users/user`, `claude-501` -> `claude-uid`. Idempotent, SHAs untouched. Also removes the value of `ANTHROPIC_API_KEY` if set. |
| `test_redact.py` | `python3 -I test_redact.py` (unittest, 12 tests). |
| `build_evidence.py` | `python3 -I build_evidence.py config.json OUT` writes `tasks/`, `runs/`, `grades/` (+ `grades/GRADER.md`, `grades/assemble.py`). Config format in the script docstring. Duplicate cells across sources abort. |
| `make_sums.py` | `make_sums.py OUT` writes `SHA256SUMS`; `make_sums.py --check OUT` verifies it. Run last. |
| `score.py` | Copy into the folder root. `python3 score.py > out.md`; `python3 score.py --check SUMMARY.md` compares the block between `<!-- score.py:begin -->` and `<!-- score.py:end -->` and exits 1 on any difference. Sets are printed sorted by name. |

Order: `build_evidence.py` -> `cp score.py OUT/` -> write SUMMARY/PROTOCOL/arms/env/REPRODUCE/VERIFY -> `score.py --check` -> `make_sums.py`.

Notes
- Rule A is printed in two forms: lost points (ours lost <= 80 percent of the best other arm's lost points) and the 1.2x total form that `bench/head-to-head/score.py` and the deep-round docs used. `gate:` uses the first; the second has its own gate line. Choose one in PROTOCOL.md.
- Kept e-mail addresses: those in the task truth/criteria text and in the writer-folder files truth.txt, truth.py, criteria.md, build-fixture.sh, prompt.txt (synthetic identities), plus `.example/.invalid/.test`, `@example.com/.org/.net`.
- `trace.jsonl`: line 1 is the init event (apiKeySource, model, tool names); then one line per tool call with `input`/`result` cut to 1500 chars.
- `†` in a score cell: at least one run of that cell has `reused: true` in its cost.json.
