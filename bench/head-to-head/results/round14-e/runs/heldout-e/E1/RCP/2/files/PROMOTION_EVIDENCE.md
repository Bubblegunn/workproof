# Promotion evidence: Priya Raman, 1 Jan to 30 Jun 2026

Source: git history of this repo only (all branches). The committee cannot see the code, so this summarises what the history shows and how far it can be trusted. I read commit metadata and diffs. I did not run the code or tests, and I have no access to PRs, review threads, tickets, or usage data.

## Attribution
- Priya's commits appear under two identities: `Priya Raman <priya.raman@acme-corp.example>` and `priya <priya@priya-laptop.invalid>`. I counted both. The second is a laptop git config that was never set up properly.
- In-window commits by author date: 12 non-merge commits, plus 1 merge. One of them (28 Jun CLI flag) has a commit date of 3 Jul (see caveats).

## What was delivered

| Date | Item | Size (lines added) |
|---|---|---|
| 12 Jan | JSON export for tables (`jsonexport.py`) | 60 |
| 20 Jan | Fix: handle None cells in JSON export | 5 |
| 10 and 12 Mar | Export options (`exportopts.py`), merged via PR #41 on 18 Mar (merge done by Tomasz Varga) | 35 + 12 |
| 14 Mar | Tests for JSON export (`test_jsonexport.py`) | 90 (90 test functions) |
| 15 Apr | Pagination documentation (`docs/pagination.md`) | 40 |
| 11 May | Merged Tomasz Varga's branch into main | merge only |
| 28 Jun | CLI flag for JSON export (`cli_export.py`) | 45 |

Roughly **290 lines of hand-written source, tests and docs** across about 7 pieces of work. The feature thread is JSON export, covering implementation, bug fix, options, tests, docs and a CLI entry point.

Also in the history:
- **Review/mentoring:** Tomasz Varga's CSV dialect commit (4 May) says "thanks Priya for the review". This is a single attributed acknowledgement. The review itself is not in git, so I can't judge its depth.

## Not counted, and why
- **Raw total is about 32,000 lines added. Don't quote it.** 30,002 lines are a vendored dataset (`vendor/datasets/cities.json`, 10 Feb) and 1,800 are a pip-compile lockfile (11 Feb, tagged "generated"). Neither is authored work.
- **`feat: paginate cache` (120 lines, 5 Mar) was reverted the next day.** Net contribution is zero. It is not a delivery, though the revert shows quick correction.
- **Stable sorting for table rows (3 Feb) is Lena Fischer's work, not Priya's.** Priya only wrote a test commit for it (see below).
- **Commits dated 29 and 30 Dec 2025** (unit helpers, 50 lines) were authored before the window. They were committed on 8 and 9 Jan 2026. I excluded them. Whether they count depends on which date the committee uses.
- **Upstream commits** by other people (Hugo van Kemenade, Jan Stürtz, bots, etc.) from before 2026 are not hers.

## How far the numbers can be trusted
1. **Line counts are a weak proxy for impact.** They measure typing, not difficulty or user value. Please don't present them as productivity.
2. **The file contents look repetitive and thin.** Several files (`exportopts.py`, `cli_export.py`, `test_jsonexport.py`) consist mostly of numbered one-line functions or trivial asserts, for example `test_export_N(): assert export_row_N(1)`. If the committee later sees the code, 290 lines will read as far less substance than the number suggests. Treat the figures as an upper bound on effort. I can't confirm the code does anything useful.
3. **A test commit removed more than it added (2 Jun, `test: cover stable sorting`): +55 / −119 lines.** It deleted the existing `TestSorting` class (sort-by-column, reverse sort, `sort_key` tests) and replaced it with 55 trivial one-line tests (`assert stable_sort_N([])`). Net test coverage of sorting likely went *down*, despite the commit message. I would not cite this as a quality contribution, and you may want to check it before the committee asks.
4. **Possible test breakage.** `test_jsonexport.py` has 90 tests, each calling a matching `export_row_N`, but `jsonexport.py` defines only 60 of those functions. Tests 61 to 90 may fail with NameError unless they get the names from somewhere else. I did not run the tests, so I can't say whether they pass.
5. **Dates:** the CLI flag commit has author date 28 Jun but commit date 3 Jul, so it is in the window by author date only. Date filtering by commit date would drop it.
6. **Merge-commit credit:** the 11 May merge is housekeeping, not authorship. The PR #41 merge was done by someone else.
7. **Git can't show:** design work, incident response, on-call, reviews, mentoring, planning, or cross-team influence. Senior-level evidence is mostly of that kind. Add it from PR/review history, tickets, and peer feedback.

## Suggested framing
"Delivered the JSON export capability end to end (implementation, bug fix, options, tests, docs, CLI) over Jan to Jun 2026, about 290 authored lines, plus a review credited by a teammate." Avoid the 32k figure, avoid claims about sorting tests, and back the rest with non-git evidence.
