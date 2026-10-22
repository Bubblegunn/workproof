# Promotion Evidence: Dana Reyes, January – June 2025

**Source:** git history of a private Acme repository (a Python Markdown parsing and rendering library, `mistune`), filtered to commits authored by dana.reyes@acme-corp.example from 2025-01-01 to 2025-06-30. Sizes are lines of code added or removed, taken from the commit statistics. Line counts show scale only, not quality or impact.

## Summary

Over six months I shipped four new features for the library. Three were new plugins, each of which adds a Markdown capability users can switch on. The fourth was a renderer for LaTeX output. I also made one repo-wide consistency change and built and then withdrew one performance experiment. About 375 lines of new code and tests were written by hand, across 5 feature commits. The full breakdown is below.

## Delivered features

| Date | Deliverable | Size | What it means |
|---|---|---|---|
| 2025-01-14 | **Table-of-contents plugin** | 60 lines of code + 30 lines of tests | Lets documents generate a table of contents from their headings. Shipped with its own automated tests. |
| 2025-03-12 | **LaTeX footnote renderer** | 120 lines | Footnotes now render correctly when a document is converted to LaTeX, the format used for academic and print-quality output. |
| 2025-04-15 to 04-17 | **Math plugin v2 with block-level support** | 75 lines of code + 36 lines of tests | Second version of the math-formula plugin. It adds support for standalone (block-level) equations. Developed on a feature branch, with tests added the next day, and merged on 04-17. |
| Committed 2025-05-09 (authored 2024-11-30) | **Abbreviation plugin** | 54 lines | Adds support for abbreviations (for example, defining what "HTML" stands for). The work was written in late November 2024 and only landed on main in May 2025, so it counts here by landing date. A teammate (Priya Nair) later made a 4-line output adjustment on 2025-06-02. |

## Other contributions

- **Codebase-wide formatting standard (2025-05-06):** Applied the formatter marker to all 37 source files in one commit. The change is mechanical, with one line per file. It matters because it makes the whole codebase consistent for future contributors, not because of its size.
- **Offline-build support (2025-02-10):** Vendored the third-party `python-slugify` 8.0.4 library into the repo so builds work without network access. This added about 6,000 lines, but it is **third-party code that I imported, not code I wrote**. It shows a build-reliability improvement and shouldn't be counted as authored volume.

## Experiment that was reversed

- **Inline parser speed-up (2025-04-02, reverted 2025-04-04):** I added a 42-line fast path for the inline parser. The commit message claimed it was 30% faster. Two days later I reverted it. The history doesn't say why, and it contains no benchmark data. I've left it out of the headline accomplishments. If you want to cite it, add the reason for the revert and the measurements yourself.

## Totals (authored by me, excluding vendored code)

- 10 commits in the period: 5 delivered features or tests, 1 was the merge of the math branch, 1 was the repo-wide formatting change, 1 was the vendoring commit, and 2 were the speed-up experiment and its revert.
- Net new hand-written code: about 375 lines. That is 309 lines of source plus 66 lines of tests. The reverted experiment nets to zero.
- 4 features shipped, 2 of them with automated tests in this period (table of contents and math v2). Abbreviation and LaTeX footnotes have no test commit from me.

## Caveats to review before submitting

1. **Possible additional commit under a different identity.** There's a commit "Fix heading id collision in toc_ext" (2025-02-03, 4 lines) authored by `dreyes <dana.reyes@gmail.example>`. It looks like a bug fix to your table-of-contents plugin, but it isn't under your work email, so I left it out of the totals. If it's yours, add it as a bug fix to the table-of-contents row.
2. **Teammate follow-ups.** Priya Nair made a small refactor of your footnote renderer (2025-03-20, 5 lines added, 1 removed) and the abbreviation tweak above. They are not part of your counts.
3. **Git history can't show** design decisions, user adoption, review work, mentoring, or incident response. Add that context from your own records, since it's often what promotion committees weigh most.
