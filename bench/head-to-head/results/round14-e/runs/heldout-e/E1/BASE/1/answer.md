I've written `PROMOTION_EVIDENCE.md` in the repo folder. It supports a modest case: about 300 lines of real work across roughly 7 commits. It does not show senior-level scope or impact by itself. I only read the git history and a few file headers. I didn't run the code or the tests.

**What the history credits to you, 1 Jan – 30 Jun 2026:**
- **JSON export:** a 60-line implementation (12 Jan), a 5-line None-cell fix (20 Jan) and a 90-line test file (14 Mar).
- **Docs and tests:** a 40-line pagination doc (15 Apr) and a rewrite of the stable-sorting tests (2 Jun, +55/−119 lines).
- **CLI flag:** a 45-line JSON export flag, authored 28 Jun but committed 3 Jul. Say "authored by 28 Jun", not "merged in H1".

**Where the raw numbers mislead:**
- **Generated files:** about 31,800 of the roughly 32,300 lines added are a benchmark dataset and a `pip-compile` lock file.
- **Placeholder code:** much of the code is repetitive one-line stubs. The 47 "export options" functions do nothing, and the test files are mostly `assert fn_N(1)` lines. Counting those tests or calling export options a feature would be a stretch.
- **Reverted work:** the pagination cache was added and reverted a day later, so it nets to zero. The history has no measurements showing it was slower.

**Not yours to claim:**
- The stable-sorting feature itself is Lena Fischer's. You only rewrote its tests.
- The CSV dialect option and the `side` branch are Tomasz Varga's.
- The two unit-helper commits were authored in December 2025 and only committed in January.

**Caveats:**
- **Git identity:** three commits use `priya@priya-laptop.invalid`, one of them in the window. Please confirm that identity is yours.
- **Impact:** the repo has no data on impact, adoption, reviews or design work. That evidence would have to come from elsewhere, such as PR threads, design docs and colleague statements.
- **Review evidence:** the only trace of you reviewing someone's work is a thank-you in Tomasz's commit message.

The file ends with a short paragraph the history supports. Keep its last sentence, about reverting the cache, only if you have the measurements to back it.