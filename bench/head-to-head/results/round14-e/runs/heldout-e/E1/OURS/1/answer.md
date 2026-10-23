I've written `PROMOTION_EVIDENCE.md`. The final number check still flags 8 per-item figures, which I'll explain below.

**What the document covers (1 Jan to 30 Jun 2026, by the date each change was written):**
- **Delivered:**
  - JSON export for tables, with its tests.
  - Export options.
  - A command-line switch for JSON export. It was written 28 June but landed 3 July, and the document says so.
  - Tighter tests for stable sorting. The sorting feature is Lena's, with you credited as co-author, so I mentioned that credit but didn't count it as your commit.
  - Pagination documentation.
- **Tried and reverted:** a caching layer for paginated tables, withdrawn a day later because it slowed small tables down. It's listed openly and not counted as a delivery.
- **Size:** the tool reports 11 commits and 32,259 raw lines added. Of those, 30,002 are a sample data file and 1,800 are an auto-generated dependency list, so I excluded both. That leaves about 457 hand-written lines, or 337 if you leave out the reverted caching work. The 457 and 337 are my own subtraction, not figures the tool prints, and the document says so.
- **Not counted:** the merge, the revert, the generated and sample files, a July note, two helper changes written in December 2025, and Tomasz's work. Tomasz's commit thanks you for a review, but the history can't show how much review you did.
- **Trust:** the commit counts, dates and hand-written versus generated split are solid. Line counts are rough, and the history can't show hours, quality or impact. You'd need outside evidence such as tickets or reviewer comments for those.

**The 8 flagged numbers:** they are the per-item line counts (60, 5, 90, 47, 45, 55, 40, 120). I read them from each change's size and the document labels them as hand figures. They add up to the 457 total.

**Please confirm:** a 20 January fix to how empty cells export is saved under a laptop login ("priya", an address ending `.invalid`), not your work address. I included it because it's the same first name and sits next to your other JSON export work. If it's yours, the totals become 12 commits and 462 lines (342 still standing). I didn't fold it into the table. Two December helper changes use the same login but were written before the window, so they're out either way.

Source tags and the verify command are in `evidence/PROMOTION_EVIDENCE.sources.md`, kept out of the document the committee reads.