# Promotion evidence: Dana Reyes, January – June 2025

Source: the git history of the project repository (private, so no code is shown). Commits were selected by author email `dana.reyes@acme-corp.example` and dated 2025-01-01 to 2025-06-30. Sizes are lines added or removed in those commits. They show scale, not quality or difficulty.

The project is a Python library that converts Markdown text into other formats such as HTML and LaTeX. It has a plugin system for adding syntax.

## Summary

In this period I delivered three new capabilities for the library, each with automated tests or in a form others could build on:

| # | What was delivered | Date | Size |
|---|---|---|---|
| 1 | **Table-of-contents plugin.** It builds a table of contents from a document's headings. It shipped with its own test file. | 14 Jan | ~90 lines in 2 files (~60 feature, ~30 tests) |
| 2 | **LaTeX footnote output.** Documents with footnotes can now be exported to LaTeX, which the library could not do before. | 12 Mar | ~120 lines, 1 new file |
| 3 | **Math plugin v2 with block-level support.** This is a second version of the math-formula plugin that handles display equations as well as inline ones. A separate commit added tests for it. | 15–16 Apr | ~110 lines in 2 files (~75 feature, ~36 tests) |

Together this is about 320 lines across 5 files, in 4 feature commits. Two of the three features have a dedicated test file. The LaTeX footnote commit has none in the history.

A teammate later made small follow-up commits on the LaTeX footnote renderer (20 Mar, a 5-line refactor). That suggests the code was being used and built on by others.

## Smaller items

- **Heading ID collision fix in the table-of-contents plugin (3 Feb, ~4 lines).** This commit was made under a different, personal email (`dana.reyes@gmail.example`, signed off as Dana Reyes). It is not in the counts above because it doesn't match the work email. **Dana: please confirm it is yours.** If so, it adds one small bug fix to item 1.
- **Offline-build support (10 Feb).** I vendored a third-party package (python-slugify 8.0.4) so the project could build without network access. It added about 6,000 lines, but they are copied from the upstream package and not written by me. The size shows nothing about effort. The value is a reproducible build in restricted environments.
- **Repo-wide header standardisation (6 May).** This added a formatter header to 37 files. It was a mechanical, one-line-per-file change, so it was a consistency cleanup and not a feature.

## Deliberately left out

- **"Speed up inline parser (30% faster)" (2 Apr).** I reverted it two days later (4 Apr). Nothing in the repo supports the 30% figure, and the change no longer exists in the code. I did not count it as a delivery. A committee member who checks the history would find the revert, so it is better to raise it yourself. If the benchmarks were real and the revert had a good reason, such as a correctness problem you caught, that is a story worth telling in your own words.
- **Abbreviation plugin (30 Nov 2024).** It is outside the period. It does not appear in this document's totals.
- **Commits by other people.** Priya Nair's follow-ups and an automated dependency update are not mine.

## Caveats for the committee

- Line counts show the scale of changes and not their difficulty or impact.
- Git history shows what landed. It doesn't show design work, reviews, mentoring, incident response, or anything that never produced a commit. Add those from your own records.
- The history has no usage numbers, performance data or user feedback. Add any you have, such as who uses the plugins or whether a customer or team asked for them. That evidence would carry more weight than line counts.
