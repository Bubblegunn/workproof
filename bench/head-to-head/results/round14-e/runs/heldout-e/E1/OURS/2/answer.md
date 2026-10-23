I wrote `PROMOTION_EVIDENCE.md` in this folder. It covers 1 January to 30 June 2026 by the date each change was written. It has no code, file names or commands in it. The tool output is in `evidence/figures.txt`.

**What it says**
- You wrote 12 changes in the window. Five are distinct deliverables:
  - JSON export, including tests and a fix for empty cells.
  - Extra export options.
  - Pagination docs.
  - Tests for stable sorting.
  - A command-line option for JSON export.
- That is about 342 lines delivered, or about 462 counting a pagination cache you reverted the day after writing it.
- The tool's raw total of 32,264 lines added is mostly a 30,002-line sample dataset and an 1,800-line generated dependency list. I excluded both and listed them under "Not counted", so don't quote the raw number.
- The 342 and 462 figures, and the per-item line counts, are my own arithmetic from the git line tallies. The tool doesn't produce them. The document says so, and the tool's doc check flagged them as unmatched for that reason.

**How far the numbers can be trusted**
- The document says the history shows who wrote what and when. It does not show time spent, quality or impact.
- The stable-sorting tests change removed more lines (119) than it added (55). I wrote that the history can't show whether coverage improved. The feature itself was Lena Fischer's.
- Reviews, mentoring and design work leave no trace in the history. I suggested backing the figures with testimony from reviewers.

**Left out of the count**
- Two helper changes written on 29 and 30 December 2025 (about 50 lines). They were only filed in January, so I used the written date.
- A 14 July docs note, which is after the window.
- Tomasz Varga's CSV option and Lena's sorting feature. Tomasz's commit message thanks you for a review, and I noted that.
- The June command-line change was written on 28 June but filed on 3 July. I counted it because it was written inside the window.

**Please confirm:** one January fix was recorded under a different name and address (`priya@priya-laptop.invalid`). I included it as yours because the name and the laptop match. Tell me if it isn't yours and I'll take it out.