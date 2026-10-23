# Promotion evidence: Priya Raman, 1 January to 30 June 2026

Prepared from the team's change history only. No code is included. Dates are the date each change was written (author date), not the date it was filed into the shared record.

## Summary

In the window Priya wrote 12 changes (authored non-merge commits). Five are distinct delivered pieces of work; the rest are one reverted experiment, two bulk data/generated files, and the revert itself (see "Not counted"). Roughly 340 lines of delivered work, about 460 including the reverted experiment. Those line counts are a rough size signal, not a measure of effort or value.

## What was delivered

(Per-item line counts below are hand-computed from the per-change line tallies in the history, using the same window and identities as the tool figures. The tool reports only totals, so these do not appear in its output.)

1. **Export of tables to JSON** (January, with a small fix later in January for empty cells; tests added in March). About 155 lines including about 90 lines of tests.
2. **Extra export options** (March, two changes). About 47 lines. Reviewed and merged through the team's review process on 18 March (merged by someone else).
3. **Documentation explaining pagination** (April). About 40 lines. A further small note dated 14 July falls outside the window and is excluded.
4. **Test coverage for stable sorting** (June). The sorting feature itself was built by a colleague (Lena Fischer, February); Priya's contribution is the test file only. This change added about 55 lines and removed about 119, so the test file got *smaller*; it was a rewrite, and the history cannot show whether coverage improved.
5. **Command-line option for JSON export** (written 28 June, filed 3 July). About 45 lines. Counted because it was written inside the window.

## Tried and reverted

A caching layer for paginated tables (about 120 lines, written 5 March) was withdrawn the next day because it slowed small tables down. It is included in the "about 460" figure but not in the "about 340 delivered" figure. Catching and backing out a performance regression is itself useful evidence, but the history shows only the revert note, not how it was discovered.

## Figures

| Figure | Value | Basis |
|---|---|---|
| Authored non-merge commits | 12 | Priya's two identities, author date 1 Jan to 30 Jun 2026 (tool figure) |
| Lines added, raw | 32,264 | Same filter (tool figure). Inflated by two bulk files below; do not quote it |
| Lines deleted, raw | 239 | Same filter (tool figure) |
| Lines written (hand-computed) | about 462 added | Raw figure minus the 30,002-line sample dataset and 1,800-line generated dependency list. Includes the reverted experiment. The tool figure does not apply this exclusion, hence the large gap |
| Lines delivered, excluding the reverted experiment (hand-computed) | about 342 added | As above minus 120 reverted lines |
| Whitespace-only changes | 0 | Tool figure; counts are unchanged ignoring whitespace |

## Not counted

- Sample dataset (30,002 lines, February): bulk data, not authored logic.
- Generated dependency list (1,800 lines, February): produced by a tool.
- The revert of the caching experiment: housekeeping.
- One merge (11 May) bringing in a colleague's side experiment: merge only.
- Two small helper changes written 29 and 30 December 2025 (about 50 lines): written before the window; they were filed on 8 and 9 January, but author date is used.
- The 14 July documentation note: after the window.
- Colleagues' work visible in the same history, including the CSV option (Tomasz Varga, May; the commit message thanks Priya for a review) and stable sorting (Lena Fischer). Priya's review contribution is acknowledged in writing but leaves no measurable trace in the history.

## How far to trust this

- **Reliable:** who wrote what and when, and that the listed pieces exist in the record. No dates are in the future and no author/filing date mismatches inside the window other than the June CLI change.
- **Not reliable as evidence of:** time spent, difficulty, quality, or impact. Line counts reward verbosity; the test rewrite shows how misleading that can be.
- **Identity:** one January fix was recorded under a second, laptop-based identity. It is included on the basis that it is Priya's own machine and name; please confirm.
- **Missing:** design work, reviews, mentoring, incident work and anything not recorded as a change. Pair these figures with testimony from reviewers or the people who used the features.
- Large-file origin check: the one large file that could not be inspected automatically was the 30,002-line dataset, already excluded.
