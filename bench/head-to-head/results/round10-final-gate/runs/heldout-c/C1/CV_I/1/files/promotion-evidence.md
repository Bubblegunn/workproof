# Promotion evidence: Dana Reyes, January to June 2025

Source: git history of the Acme Markdown library repository (private), commits authored by Dana Reyes, 1 Jan to 30 Jun 2025. The library converts Markdown text into other formats such as HTML and LaTeX, and is extended through small plugins.

## Summary

In six months Dana delivered four features, one bug fix and two test suites: a table-of-contents plugin, a LaTeX footnote renderer, a second-generation math plugin that handles standalone math blocks, and a fix for duplicate heading links. That is roughly 260 lines of new production code and 65 lines of tests across 11 commits. Dana also tried a parser performance change, found a problem with it and reverted it within two days.

Line counts measure size only. They say nothing about quality or business impact, so they are given as scale, not as results.

## What was delivered

| Date | Work | Size | What it means in plain terms |
|---|---|---|---|
| 14 Jan | Table-of-contents plugin (`toc_ext`) | 60 lines + 30 lines of tests | Lets documents generate a clickable contents list from their headings. |
| 3 Feb | Fix for heading id collisions in `toc_ext` | 4 lines | Fixes the case where two headings produce the same link target, so links could point to the wrong section. |
| 12 Mar | Footnote renderer for LaTeX output | 120 lines | Lets documents with footnotes be converted to LaTeX, the format used for print-quality and academic output. The largest single feature of the period. |
| 15 to 17 Apr | Math plugin v2 with block-level support, plus tests, merged to main | 75 lines + 36 lines of tests | New version of the math plugin that supports standalone math blocks, not only formulas inside a sentence. Developed on a feature branch and merged after tests were added. |

## Judgment and ownership

- **Performance experiment, reverted.** On 2 Apr Dana committed an inline parser speed-up titled "30% faster" (42 lines). On 4 Apr Dana reverted it. The history contains no benchmark and no stated reason for the revert, so the 30% figure is not used as an achievement here. If the revert was a deliberate decision to protect correctness or stability, that is worth stating in Dana's own words.
- **Collaboration.** Priya Nair refactored the footnote renderer on 20 Mar and credited Dana as co-author. Priya also made a later change to the abbreviation plugin (June).
- **Testing.** Both the table-of-contents plugin and math v2 shipped with dedicated test files.

## Deliberately excluded

- **Vendored python-slugify (10 Feb, 6,000 lines).** Third-party code copied in for offline builds. It is the largest commit by line count but is not Dana's authored work, so it would overstate output. The decision to vendor it (offline build support) is a legitimate infrastructure item if Dana wants to describe it separately, without the line count.
- **Formatter header on all source files (6 May, 37 files).** One mechanical line per file.
- **Dependency bump (5 Mar).** Automated, by dependabot.

## Items for Dana to confirm

1. **Abbreviation plugin (54 lines).** Its author date is 30 Nov 2024, but it was committed to main on 9 May 2025, probably through a rebase or cherry-pick. The work predates the window, so it is not counted above. Say if it was finished in 2025 and should be included.
2. **Fix on 3 Feb.** It was committed under the name `dreyes` and a personal address (dana.reyes@gmail.example), not the work address. The commit is signed off by Dana Reyes, so it is included. Confirm it is yours.
3. **What the code did.** Feature descriptions come from commit messages and file names. The code in these files is very repetitive and looks like placeholder content, so I could not verify behavior from the code itself. Check each description against what you actually built before the committee sees it.
4. **Impact that git cannot show.** Adoption, users or teams who rely on these features, bugs avoided, time saved, requests from customers or other teams, and review or mentoring work. Any one of these, with a real number, would strengthen the case more than line counts. Add them only if you can back them up.
