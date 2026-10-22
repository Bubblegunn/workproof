# Invoice INV-0042 (Luka Petrovic, September 2025, 62 h): history check

**Bottom line:** The repo history supports part of the invoice, not all of it. Git records *what* was changed and *when*. It does not record hours, so no line can be confirmed or disproved on hours alone. The history does show that two of the four lines have problems that need an answer from the contractor.

| # | Invoice line | Billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 h | Luka made 3 commits on 9 Sept (flag, tests, README note). About 70 lines of new content, all within roughly 2 hours of commit timestamps. | **Work is real and on main.** 20 h looks high for what is visible. Ask for a breakdown. |
| 2 | Multi-language (hreflang) support | 24 h | Luka made 3 commits (17, 18 and 26 Sept) on a separate branch, `feature/hreflang`. They are not merged into main. The last one is labelled "WIP". | **Partly supported.** Work exists but is unfinished and not delivered to main. Ask whether it is meant to be billed as complete. |
| 3 | Performance work: cache generated sitemap | 12 h | The only commit (22 Sept) was authored by **Nora Fisher** (nora@lp-dev.example), not Luka. | **Not Luka's work in the history.** Nora appears to be at the contractor's firm. Ask whether this is subcontracted work and whether it is correctly billed under Luka's invoice. |
| 4 | Fix CI on Ruby 3.3 | 6 h | The commit is dated **3 Oct 2025**, after the invoice period (1–30 Sept). | **Outside the period.** It likely belongs on an October invoice. |

There is also an unbilled item. Luka's "Update dependencies" commit (15 Sept) is not on the invoice. It's a single commit of generated lock-file content, so it was probably quick.

## Rough tally
- Clearly in period, by Luka, on main: line 1 (20 h).
- In period, by Luka, but unmerged and unfinished: line 2 (24 h).
- In period, but authored by someone else: line 3 (12 h).
- Dated outside the period: line 4 (6 h).

So only 20 of the 62 hours are straightforward. The other 42 h need clarification. That is not proof of overbilling. For example, work may have been done offline, or the commit dates may not match when the effort happened.

## Limits of this check
- Commit dates are set by the author's computer and can be edited. They are a good guide, not proof.
- Git doesn't show time spent on research, meetings, debugging or review that never produced a commit.
- I looked at commit dates, authors, sizes and branches. I did not review code quality in depth. The cache file looks like placeholder-style code, which may be worth a technical look.

## Suggested questions for Luka
1. Can you give an hour breakdown for line 1 (20 h)?
2. Is the hreflang work finished? Why is it on an unmerged branch marked "WIP"?
3. Did Nora Fisher do line 3? If so, is she a subcontractor, and is the rate the same?
4. Should the Ruby 3.3 CI fix (3 Oct) move to the October invoice?
