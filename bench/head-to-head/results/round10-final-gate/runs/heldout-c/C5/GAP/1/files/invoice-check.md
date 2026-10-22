# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows real work for item 1, only partial or questionable support for items 2 and 4, and nothing by Luka for item 3. It cannot confirm hours. Git records what was saved and when, not how long it took. I'd ask Luka a few questions before paying in full.

## Line by line

| # | Invoiced item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | Three commits by Luka on 9 Sep 2025 (10:05 to 12:19): the feature (32 lines), tests (20 lines), and a README note (6 lines). | **Work is there.** The commits span about 2 hours, and about 58 lines were added. 20 h looks high unless there was a lot of unrecorded work. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep): a 60-line file, a 40-line test file, and a 2-line "WIP" change. | **Partly supported, and it looks unfinished.** The 26 Sep commit is labelled work in progress and only adds a comment. The main hreflang file contains numbered placeholder functions (`hreflang_1`, `hreflang_2`, and so on, each just adding a number). It doesn't contain real language-link logic. The work is also on a separate branch (`feature/hreflang`), so it isn't in the main code. |
| 3 | Cache generated sitemap | 12 | One commit on 22 Sep (a 40-line file), authored by **Nora Fisher**, not Luka. Her email is on the same lp-dev.example domain. | **Work exists, but not under Luka's name.** If Nora is Luka's colleague or subcontractor, this may be fine. Finance should confirm that the 12 h is not Nora's time billed as Luka's, and that the contract allows it. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka dated **3 Oct 2025**. It replaces the old test setup with a much shorter one (8 lines added, 52 removed). | **Outside the billing period.** The commit is dated after 30 Sep. Either the work was done in October and billed early, or the commit was made late. The change also removes most of the existing test coverage (older Ruby versions, Jekyll 3.x, and the gem-build check), which was probably not intended. |

## Other observations

- **Dependency update (15 Sep):** Luka made a commit "Update dependencies" (a 306-line lock file). It isn't billed as its own line, so it may be included in another item. It is a generated file and says little about effort.
- **Activity pattern:** Luka's September commits fall on 9, 15, 17, 18 and 26 Sep (5 days). Nora's is on 22 Sep. That is thin evidence for 62 h, though much work, such as thinking, debugging and meetings, leaves no commits.
- **Commit dates are self-reported** by the committer's computer and can be edited. Treat them as a guide, not proof.

## What the history can and can't support

- **Supports:** The sitemap flag was built, tested and documented. Hreflang work was started and tested. A sitemap cache was added by someone at LP Dev.
- **Doesn't support:** The hour counts, a finished hreflang feature, Luka personally doing item 3, or item 4 falling in September.

## Suggested questions for Luka

1. Can you give a time log or breakdown behind the 20 h for item 1 and the 24 h for item 2?
2. Is hreflang finished? Where is the working code, and has it been merged?
3. Who is Nora Fisher, and is her work covered by your agreement?
4. When was the CI fix actually done, and should it be billed in October?
5. Did the CI change intentionally drop the older Ruby and Jekyll tests?

*Based on the git history in this repo as of 22 Oct 2026, including the `feature/hreflang` branch. I did not run the code or review its quality in detail.*
