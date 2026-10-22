# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows real work for each of the four invoice lines. It supports some of them better than others, and it can't confirm the hours on any of them. Commits show what was delivered and when, not how long it took.

## Line by line

| # | Invoice line | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep: the feature (32 lines), tests (20 lines) and a README note (6 lines). All fall within about 2 hours of each other. | **Work is real, but small.** 20 h looks high for roughly 58 lines of code, tests and docs. This may include design, research or review that never shows up in commits. Ask Luka. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka, 17–26 Sep, but only on a side branch (`feature/hreflang`). They have not been merged into the main code. The last one is labelled "WIP" and adds only 2 lines. | **Partly supported, unfinished.** There is a start (60 lines) and tests (40 lines), but nothing delivered. Billing 24 h for a feature that isn't in the product needs an explanation. |
| 3 | Performance work: cache generated sitemap | 12 | One commit, 22 Sep (40 lines). The author is **Nora Fisher**, not Luka. Her email is on the same lp-dev.example domain as Luka's. | **Work is real, but not by Luka.** Nora appears to be a colleague at LP Dev. Confirm that the contract allows subcontracting or other staff, and that these hours are meant to be on Luka's invoice. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**, which is after the invoice period ends (30 Sep). It replaced the 56-line CI configuration with a 12-line one. | **Outside the billing period.** It belongs on October's invoice, or Luka should explain the date. Separately, the change removed a lot of existing test coverage (older Ruby versions and branch rules), so it is worth a technical check that this was intended. |

## What I'd say the history supports

- Luka authored work on lines 1 and 2 in September.
- Line 3's work happened in September but was done by someone else.
- Line 4's work happened in October.
- The only line that is clearly Luka's own, finished and inside the period is line 1 (20 h). Even that is a high number for the amount of code.
- Another commit, "Update dependencies" (15 Sep, Luka), isn't on the invoice at all. It's not a problem, just a sign the invoice doesn't map exactly to the history.

## What the history cannot tell us

- **Hours.** Git records when a change was saved, not how long it took. Research, meetings, debugging and unmerged experiments leave no trace. Luka's 62 h could be honest, but the repo can't prove it.
- Work done outside this repository (other tools, calls, other branches not shared with us).
- Dates are set by the person committing and can be edited, so they are good evidence but not proof.

## Suggested next steps

1. Ask Luka for a short breakdown of the 20 h on line 1 and the 24 h on line 2, and whether the hreflang work will be finished and merged.
2. Ask who Nora Fisher is and whether line 3 should be on this invoice.
3. Ask whether line 4 (6 h) should move to October.
4. Until those are answered, consider paying only what is clearly supported and holding the rest. That is a finance and contract decision for you.

*Basis: the full commit history of this repository, including the unmerged `feature/hreflang` branch, compared with docs/billing/INV-0042.txt.*
