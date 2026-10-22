# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repository history shows real work for every line item, but it can't confirm the hours. Git records *what* was saved and *when*. It doesn't record how long the work took. Some items also have caveats, listed below.

| # | Invoice item | Billed | What the history shows |
|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | **Work is present.** On 9 Sep, Luka made three commits: the feature, its tests, and the documentation. They were made between 10:05 and 12:19. The code is about 58 lines in total. 20 h looks high for this. The commits only span about 2 h 15 min, though that doesn't rule out work done off-record. |
| 2 | Multi-language (hreflang) | 24 h | **Partly supported, and unfinished.** None of this is on the main code line. It's on a separate branch, `feature/hreflang`. It has three commits by Luka (17, 18 and 26 Sep). The last is labelled "WIP" (work in progress). The branch holds about 100 lines of code and tests. It hasn't been merged, so the delivered product doesn't have this feature. |
| 3 | Cache generated sitemap | 12 h | **Work is present, but by a different person.** The only commit (22 Sep, 40 lines) was authored by **Nora Fisher**, not Luka. Her email is on the same company domain (lp-dev.example). She may be a colleague at LP Dev. Check whether the contract allows subcontracting or another person's work billed under Luka's name. |
| 4 | Fix CI on Ruby 3.3 | 6 h | **Work is present, but dated outside the period.** The commit is dated **3 Oct 2025**, after the invoice period (1–30 Sep). It mostly deletes configuration: 8 lines added, 52 removed. |

Another commit, "Update dependencies" (15 Sep), isn't on the invoice. It's an automatically generated file of about 300 lines, so it doesn't indicate much effort.

## What the history does not support
- **The hours themselves.** Nothing in git measures time. The commit timestamps cover only a few short windows and show no sign of 62 h of work. Luka may have spent time on research, design, testing or meetings that leave no commits, so this doesn't prove the hours are wrong. It means we can't verify them from this source.
- **A finished multi-language feature** (item 2).
- **Luka personally doing item 3**, and **item 4 falling in September**.

## Suggested next steps
1. Ask Luka for time logs or a short breakdown of hours per item. Ask for an explanation of the 20 h on the exclusion flag.
2. Ask who Nora Fisher is, and whether her work is covered by the agreement.
3. Ask about the status of the hreflang work. Decide whether to pay for it in full while it's unfinished and unmerged.
4. Decide whether the 3 Oct CI fix should be billed in October rather than September.

*Scope: this note is based on the commit history of this repository, including the `feature/hreflang` branch. I didn't see time-tracking records, contracts or messages. The commit dates and authors come from the commits themselves, and the person who made a commit can set them.*
