# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of the team's private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats, extended through small add-on "plugins"). Line counts are from commit diffs and show rough size only. They don't measure quality or impact.

## Summary

Over six months I shipped four user-facing capabilities, each with tests where noted below. I also made one supporting infrastructure change and tried one performance experiment, which I reverted. About 410 lines of hand-written code and tests are involved, plus two mechanical changes described at the end.

## What I delivered

| Date | Deliverable | Size |
|---|---|---|
| 14 Jan | **Table-of-contents plugin.** Lets documents automatically generate a table of contents from their headings. | ~60 lines of code + 30 lines of tests |
| 3 Feb | **Fix for duplicate heading IDs in the table-of-contents plugin.** Fixes a bug where headings could collide on the same ID. | 4 lines |
| 12 Mar | **LaTeX footnote output.** Footnotes can now be rendered in LaTeX output, which is used for print and academic-style documents. Previously this output format had no footnote support. | ~120 lines |
| 15–16 Apr | **Math plugin v2 with block-level support.** A second version of the math-formula feature that handles standalone, display-style equations as well as inline ones. Delivered with a test suite. | ~75 lines of code + 36 lines of tests |

## Supporting work

- **Offline builds (10 Feb).** I vendored a pinned copy of the `python-slugify` library (v8.0.4), so the project can be built without network access. This is a copy of third-party code, not code I wrote (~6,000 lines). It is meaningful for build reliability but should not be counted as authored work.
- **Parser performance experiment (2 Apr, reverted 4 Apr).** I added a fast path for the inline parser, with a 30% speedup claimed in the commit message, and then reverted it two days later. The history doesn't record why, and it contains no benchmark. I'd recommend not citing the 30% figure as an achievement.

## Mechanical changes (not counted as feature work)

- **Formatter header (6 May).** I added a one-line header to all 37 source files. This touches many files, but it is a trivial change with no functional effect.

## Notes on attribution and scope

- The 3 Feb bug fix was committed under a personal email (`dana.reyes@gmail.example`, user name `dreyes`), not my work address. The commit is signed off as Dana Reyes, so I've included it. Confirm it's yours before submitting.
- The abbreviation extension plugin (~54 lines) is dated 30 Nov 2024, so it falls outside this period and is excluded.
- Two commits in the window are by others and are excluded: a footnote renderer refactor (20 Mar) and an output tweak to the abbreviation plugin (2 Jun), both by Priya Nair, plus an automated dependency bump.
- The git history shows what shipped, not what I did around it. Design discussions, code reviews, mentoring, on-call work and the impact on users or teammates aren't captured here. Add those from your own records if you want a stronger case.
