# Promotion evidence: Priya Raman, 1 January to 30 June 2026

Source: git history of this repository only (no code is quoted). Window is by **author date**. Line counts come from `git log --numstat` and measure volume, not quality or impact. The history holds no data on users, performance, incidents, or review activity, so none is claimed.

## Summary

- 11 commits under the identity `Priya Raman <priya.raman@acme-corp.example>` in the window.
- About 150 lines of new library code (JSON export, export options, a CLI export flag), 90 lines of new tests for JSON export, and a 40-line pagination doc.
- One feature (paginate cache, 120 lines) was reverted the next day and contributes nothing net.
- Two large commits (a 30,002-line dataset and an 1,800-line lock file) are data and generated output. They are not engineering effort and are excluded from the totals.

## What was delivered

| Date | Item | Size | Status |
|---|---|---|---|
| 12 Jan | JSON export for tables (`jsonexport.py`) | +60 lines | Delivered, in main |
| 10 and 12 Mar | Export options (`exportopts.py`), two commits | +47 lines | Delivered, merged through PR #41 (merge commit by Tomasz Varga, 18 Mar) |
| 14 Mar | Tests for JSON export | +90 lines | Delivered |
| 15 Apr | Docs explaining pagination | +40 lines | Delivered |
| 2 Jun | Rewrite of the stable-sorting tests | +55 / −119 lines | Delivered; see caveats |
| 28 Jun (committed 3 Jul) | CLI flag for JSON export (`cli_export.py`) | +45 lines | Delivered, no tests in the same commit |
| 5 Mar | Paginate cache | +120 lines | **Reverted 6 Mar**, net 0 |
| 10 and 11 Feb | Benchmark sample dataset; pinned dependencies | +30,002 / +1,800 lines | Data and generated file, not counted |

Rough totals of hand-written work, excluding the reverted feature and non-code files:
- Library code: about 152 lines added.
- Tests: +90 for JSON export; the sorting rewrite shrank that file by a net 64 lines.
- Docs: 40 lines.

## How far the numbers can be trusted

**Reasonably solid**
- Commit dates, authorship under the `Priya Raman` identity, and line counts are read directly from history.
- The revert is visible in the history; the figures above treat it as zero.

**Weaker, needs context**
- **Lines of code are a poor proxy for seniority.** They show activity, not difficulty, correctness, or value. Do not present them as impact.
- **The sorting test commit is a rewrite, not new coverage.** It replaced a 119-line file with 55 lines. The history cannot show whether coverage improved. The feature under test (`sorting.py`) was written by Lena Fischer, not Priya.
- **The CLI flag was authored 28 June but committed 3 July.** It is in the window by author date only. It has no tests in its commit.
- **Export options came through a PR whose merge was done by someone else.** Authorship of the two commits is hers; the history shows nothing about review effort or follow-up.
- **No outcome data.** Nothing here shows adoption, bugs avoided, or performance changes. Add these from other sources (issue tracker, release notes, usage data) if they exist.

**Commits that may be Priya's, but are not counted**
- Three commits use the identity `priya <priya@priya-laptop.invalid>`, a local laptop config. Confirm they are hers before including them:
  - 20 Jan: fix for None cells in JSON export (+5 lines). Looks like a follow-up to her JSON export, so it is likely hers.
  - 29 and 30 Dec 2025 (committed 8 and 9 Jan 2026): two unit helper fixes (+40 and +10 lines). Authored before the window and committed inside it, so they fall outside by author date. Include or exclude by whichever date rule the committee uses, and apply it consistently.

**Not hers, and excluded**
- Stable sorting feature (Lena Fischer, 3 Feb), CSV dialect option (Tomasz Varga, 4 May), a one-line side experiment and a README typo fix (Tomasz Varga). The CSV commit message thanks Priya for a review; the history holds no review record, so the thanks is the only evidence of that contribution.
- `docs: later note` (14 Jul) is after the window.

## Gaps to fill before submission

1. Confirm the `priya` laptop-identity commits.
2. Evidence of review and mentoring (PR comments, the CSV dialect review) is not in git; collect it from the code host.
3. Evidence of impact (who used the JSON export, what the revert was about) is not in git; the revert commit has no explanation.
4. Check whether work in other repositories belongs in this period; this covers only this one.
