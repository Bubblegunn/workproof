# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows that all four invoiced pieces of work exist in some form. It cannot confirm the hours, and it supports the items to different degrees. Hreflang is not finished or merged. The history is evidence of *what was produced*, not of *how long it took*.

## What was checked
The commit history (dates, authors, size of changes) on the main branch and on one unmerged branch, `feature/hreflang`. Nobody ran the code or judged its quality beyond reading the commits.

## Line by line

| Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|
| Sitemap exclusion flag | 20 | 9 Sep 2025: three commits by Luka within about 2 hours (flag code, 32 lines; tests, 20 lines; README note, 6 lines). Merged to main. | **Delivered**, but the visible work is small. 20 h is high compared with ~2 h of commit timestamps. Ask for an explanation (research, design, review time not visible in the history). |
| Multi-language (hreflang) | 24 | Three commits by Luka (17, 18 and 26 Sep) on `feature/hreflang`, **not merged to main**. The last is labelled "WIP" and is 2 lines. | **Partly supported.** Real work exists, but it is unfinished and not in the product. Ask whether it is billable in full as work in progress, and when it will be completed and merged. |
| Cache generated sitemap | 12 | One commit on 22 Sep, **authored by Nora Fisher, not Luka** (same company email domain, lp-dev.example). 40 lines, merged. | **Delivered, but by someone else.** Confirm that Nora is covered by the contract and that her time is billable at Luka's rate. Also, the file's contents look like placeholder code (numbered `cache_1`, `cache_2` ... functions), so it's worth asking a developer whether it does any real caching. |
| Fix CI on Ruby 3.3 | 6 | One commit by Luka on 3 Oct 2025 (**after** the September billing period). It replaces the whole CI configuration (about 50 lines removed, 8 added) with a much shorter one. | **Delivered, but dated outside the invoice period**, and the change removed earlier test coverage (older Ruby versions, the gem build check). Ask why it was billed in September and whether removing those checks was intended. |

## Other observations
- **"Update dependencies" (15 Sep, Luka)** is a 306-line file that appears to be auto-generated, and it is not an invoice line. It does not add support for any billed item.
- Several of the code files read as filler (numbered, repetitive functions) rather than real logic. A developer should review whether they do what the invoice says before payment.
- Commit timestamps only show when work was saved, not hours spent. Two hours of commits could sit within 20 hours of work, or not. Only a timesheet can show that.

## Suggested next steps
1. Ask Luka for a timesheet or breakdown behind each line, particularly the 20 h exclusion flag.
2. Ask about the hreflang status and whether it is billable before completion.
3. Confirm Nora Fisher's involvement and rates.
4. Ask why the CI fix dated 3 Oct was billed under September.
5. Have a developer review whether the code does what is claimed.

Until these are answered, the history clearly supports **some** of the 62 hours but it cannot confirm all of them. Items 3 and 4 and part of item 2 are the clearest concerns.
