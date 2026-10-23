I've written `PROMOTION_EVIDENCE.md` in this folder. The window is 1 January to 30 June 2026, by the date each change was written.

**What it says**
- **Commits:** 12 non-merge commits, counting one under your second name, "priya" (see the question below).
- **Delivered work:** five pieces.
  - JSON export, with a fix and tests.
  - Export options.
  - A command-line switch for JSON export.
  - Pagination documentation.
  - Rewritten stable-sorting tests.
- **Withdrawn:** the pagination cache, which you reverted a day after building it. The document lists it as withdrawn and keeps it in the line count.
- **Lines:** 462 added by hand after exclusions, of which 342 are still in the product. The raw figure is 32,264 added and 239 removed.
- **Not counted:**
  - A 30,002-line placeholder benchmark dataset.
  - A 1,800-line generated dependency list.
  - A merge commit.
  - Two December 2025 fixes, written before the window.
  - A July note, written after the window.
- **Other people's work:** the document names Lena's stable-sorting feature and Tomasz's CSV option as not yours. It does not count your review of Tomasz's work, because the history doesn't record it.

**Things to know before you submit**
- **Hand-read line counts:** the 462 and 342 totals and the per-piece line counts come from the history by hand. Only the commit count and the raw 32,264 and 239 are tool-computed. The document says so.
- **Missed revert:** the counting tool didn't detect the revert, because its message isn't in the standard form. I found it by reading the history.
- **Sorting tests:** that change replaced a 119-line test file with a 55-line one. The history can't show whether coverage went up, so don't present it as improved coverage without checking.
- **Late merge:** the command-line switch was written 28 June but merged 3 July. I counted it by the date written, and the document says so.
- **Limits of this evidence:** git history shows what changed, who changed it and when. It doesn't show effort, review, mentoring, design or impact. For a senior case those are probably your strongest evidence, and they'll need other sources.

**Question for you:** the 20 January fix is under the name "priya" with a laptop-style address. I included it because the first name matches and the address looks like a personal machine. Is that you? If not, the commit count drops to 11 and the added lines drop by 5. Two other commits under that name were written in December, so they're outside the window either way.

The commit-level source tags and verify commands are in `evidence/PROMOTION_EVIDENCE.sources.md`, kept out of the document itself because the committee won't read code.