# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of the team's Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Figures are lines of code from commit statistics. They are a rough proxy for size, not for value.

## Summary

In six months I shipped three new user-facing capabilities (a table-of-contents plugin, a LaTeX footnote renderer, and a second-generation math plugin), with tests for two of them. I also made a bug fix, an offline-build change, and a repo-wide code-style change. I tried a performance optimisation, measured it, and reverted it.

## Delivered

### 1. Table-of-contents plugin (14 Jan 2025)
- **What:** A plugin that automatically builds a table of contents from a document's headings.
- **Size:** about 90 lines: 60 of implementation and 30 of automated tests.
- **Follow-up (3 Feb 2025):** Fixed a bug where two headings with the same text produced clashing link anchors. This was a 4-line fix.

### 2. LaTeX footnote renderer (12 Mar 2025)
- **What:** Footnotes can now be output in LaTeX, the format used for academic and print-quality documents. Before this, footnotes were not supported in that output.
- **Size:** about 120 lines of new code, in a single new module.
- **Collaboration:** A teammate (Priya Nair) later refactored it, with me credited as co-author.

### 3. Math plugin v2 with block-level support (15–17 Apr 2025)
- **What:** A new version of the math-formula plugin. It adds block-level formulas, meaning standalone display equations as well as inline ones.
- **Size:** about 110 lines: 75 of implementation and 36 of tests. I developed it on a feature branch and merged it on 17 Apr.

### 4. Offline-build support (10 Feb 2025)
- **What:** Bundled a pinned copy (version 8.0.4) of a third-party text-slug library so the project can be built without network access.
- **Size:** about 6,000 lines, but all of it is third-party code copied in, not code I wrote. I would not count it as authored output. The value is in the build-reliability change.

### 5. Codebase-wide formatting standard (6 May 2025)
- **What:** Applied the team's standard formatter header to every source file.
- **Size:** 37 files touched, one line each. This was a mechanical change that kept the codebase consistent.

## Experiment that did not ship

- **Inline-parser speed-up (2–4 Apr 2025):** I implemented a fast path for the parser (about 42 lines) that was intended to make it 30% faster. I reverted it two days later. I can't tell from the history why it was reverted. The 30% figure is from the commit title, not from a benchmark I can see in the repo. Add context here if you want to mention it. I left it out of the totals.

## Totals (authored, excluding vendored code and the reverted experiment)

| Measure | Value |
|---|---|
| Features shipped | 3 (table of contents, LaTeX footnotes, math v2) |
| Bug fixes | 1 |
| New implementation code | about 260 lines |
| New test code | about 66 lines |
| Files touched by the style change | 37 |

## Notes for you before submitting

- **Commit identity:** Your work email accounts for 9 commits in this window, plus 1 co-author credit. One further commit (the 3 Feb heading-collision fix) was made under the name `dreyes` with `dana.reyes@gmail.example`. I counted it as yours because it fixes your own plugin, but you only gave me your work email, so please confirm. If it isn't yours, remove it.
- **Excluded:** The abbreviation plugin commit is dated 30 Nov 2024, outside the window. Priya Nair's 2 Jun "Tweak abbr_ext output" commit is hers, so I left it out. A Dependabot version bump is automated and not yours.
- **Missing context:** Git history doesn't show users, adoption, review feedback or business impact. Adding that kind of evidence, such as who uses these features or which requests they answered, would strengthen the case a lot.
- **Tests:** The LaTeX footnote renderer has no tests in this window.
