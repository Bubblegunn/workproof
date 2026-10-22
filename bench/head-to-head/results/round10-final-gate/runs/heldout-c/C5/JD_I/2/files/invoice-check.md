# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history confirms that work happened on some of the invoiced items. It does not confirm any of the hours, and two line items have problems that need an answer from Luka before payment.

The history records *what* changed and *when*. It does not record time spent, so no line can be verified in hours.

| # | Invoice line | Hours | What the history shows | Status |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep 2025: the feature (32 lines), its tests (20 lines) and a README note (6 lines). All on the main branch. | Work is real. About 58 lines in total, all committed within about 2 hours on one day. 20 h looks high; ask what else the time covered. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep) on a side branch, `feature/hreflang`. It was never merged into main. The last commit is labelled "WIP" and changes 2 lines. | Partly supported. Work exists but is unfinished and is not in the delivered product. Ask whether it is meant to be billed as complete. |
| 3 | Performance: cache generated sitemap | 12 | The commit exists (22 Sep, `382dbdb`), but its author is **Nora Fisher** (nora@lp-dev.example), not Luka. | Not attributable to Luka. The email domain matches Luka's company, so it may be a colleague. Ask who did the work and whether Nora's time is meant to be on this invoice. |
| 4 | Fix CI on Ruby 3.3 | 6 | Luka's commit is dated **3 Oct 2025**, which is after the invoice period (1–30 Sep). | Outside the billing period. It belongs on October's invoice, or needs an explanation. The change also rewrites the CI settings heavily (8 lines added, 52 removed), and it drops the older Ruby versions the project was tested against. Worth a technical look. |

**Other things in the history**
- Luka also has an "Update dependencies" commit on 15 Sep. It adds a 306-line lock file and is not on the invoice. It does not offset any of the hours above.
- Luka has 5 commits on main, and the 3 in September are all on 9 Sep. Their other September work is on the unmerged branch.

**Summary**
- Fully supported by history: none.
- Supported in part: line 1 (work is real, hours unproven) and line 2 (unfinished, not merged).
- Not supported as billed: line 3 (another author) and line 4 (outside the period). Together they are 18 h.
- The hours on all four lines are Luka's own estimates.

**Suggested next steps**
1. Ask Luka for time logs or a breakdown by day for the 62 h.
2. Ask who Nora Fisher is and whether line 3 is subcontracted work.
3. Move line 4 to October, or ask Luka to explain it.
4. Decide whether to pay for unmerged "WIP" work on line 2.
5. Consider holding payment on lines 3 and 4 (18 h) until these are answered.

*Basis: git history in this repository, including the `feature/hreflang` branch. Commit dates come from the commit records, which the committer can set, so they are a good guide but not proof.*
