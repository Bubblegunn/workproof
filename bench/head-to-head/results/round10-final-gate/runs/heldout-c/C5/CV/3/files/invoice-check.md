# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that work happened for all four invoice items, but it cannot confirm the hours. Two items have questions worth asking before payment: item 2 (hreflang) is unmerged and looks unfinished, and item 3 (sitemap cache) was committed by someone else.

Commit history records *what* changed and *when*. It does not record time spent, so no line below confirms or refutes a number of hours.

## Item by item

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | 3 commits by Luka on 9 Sep 2025: the feature (32 lines), tests (20 lines), README note (6 lines). | Work is present and merged into main. It is small and all done within about 2 hours of commit timestamps. 20 h is not contradicted, but it is not shown either. |
| 2 | Multi-language (hreflang) support | 24 | 3 commits by Luka (17, 18 and 26 Sep) on a separate branch `feature/hreflang`, **not merged into main**. The last commit is labelled "WIP" and changes 2 lines. | Work exists but is unfinished and not delivered to the main code. About 100 lines in total. Ask whether it is complete and working. |
| 3 | Performance work: cache generated sitemap | 12 | The commit "Cache generated sitemap between builds" (22 Sep, 40 lines) is authored by **Nora Fisher**, not Luka. Her email is at the same domain as Luka's (lp-dev.example). | The work exists, but Luka did not author it. Ask whether Nora is part of LP Dev, and whether her time is meant to be billed under this invoice. |
| 4 | Fix CI on Ruby 3.3 | 6 | Commit by Luka dated **3 Oct 2025**, which is after the September billing period. It edits one CI file (8 lines added, 52 removed). | The work is real, but the date is outside the invoice period. It should be billed in October, or Luka should explain the date. |

There was also an "Update dependencies" commit by Luka on 15 Sep (one generated file). It is not an invoice line.

## Overall

- **Supported by history:** item 1 (delivered). Items 2 to 4 have activity, with the caveats above.
- **Not supported or unclear:** all hour counts; delivery of item 2; authorship of item 3; the period of item 4 (6 h).
- Luka's own commits total 8 across the whole period, on 5 working days. Amounts of code are small relative to 62 h. That is not proof of over-billing, since time may go on design, meetings, debugging and review that leave no commits.

## Suggested questions for Luka

1. Can you provide time logs or a timesheet behind the 62 h?
2. Is the hreflang feature finished? Why was it not merged?
3. Who is Nora Fisher, and is her work on the sitemap cache included in your hours?
4. The CI fix is dated 3 October. Should it be on the October invoice?

## Limits of this check

This is based only on the repository's commit log (authors, dates, files changed). I did not run the code or judge its quality. Commit dates and author names are set by whoever commits and can be edited, so they are a good indicator, not proof.
