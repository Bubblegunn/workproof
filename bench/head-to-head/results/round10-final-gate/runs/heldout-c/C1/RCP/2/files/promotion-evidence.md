# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of a private Markdown-processing library (a Python library that converts Markdown text into HTML and LaTeX, with an extension system). Figures are from commits authored under dana.reyes@acme-corp.example. Line counts are approximate and measure size, not value.

## Summary

In six months I shipped four new features for the library, each with a distinct user-facing capability, plus supporting test coverage and a repo-wide consistency change. About 400 lines of hand-written code and tests were added across these features.

## Delivered work

### 1. Table-of-contents extension (January 2025)
- **What it does:** Lets documents automatically generate a table of contents from their headings.
- **Size:** New module of about 60 lines plus a 30-line test file (about 90 lines total).
- **Follow-up:** A later fix (Feb 2025) resolved a bug where two headings with the same text produced colliding link IDs. See the note on attribution below.

### 2. Offline-build support for a third-party dependency (February 2025)
- **What it does:** Bundled a pinned copy (python-slugify 8.0.4) into the repo so the project can be built without network access.
- **Size:** About 6,000 lines added, but this is third-party code copied in, not code I wrote. It is listed for completeness and should not count toward output volume.

### 3. LaTeX footnote rendering (March 2025)
- **What it does:** Adds support for footnotes when documents are exported to LaTeX, which is the format used for print and academic output.
- **Size:** A single new 120-line module. This was the largest piece of original code in the period.

### 4. Math plugin v2 with block-level support (April 2025)
- **What it does:** Rewrites the math-formula plugin so it handles standalone equation blocks as well as inline formulas.
- **Size:** 75 lines of implementation plus a 36-line test file, developed on a feature branch and merged on 2025-04-17.
- **Process:** Tests were written and reviewed before merge.

### 5. Repo-wide formatting header (May 2025)
- **What it does:** Applied a standard header to every source file (37 files) for consistency.
- **Size:** 37 files, one line each. Broad in reach but mechanical.

## Other activity

- **Performance experiment (April 2025):** I implemented an inline-parser optimization measured at about 30% faster, then reverted it two days later. The history doesn't record why. It shouldn't be counted as a shipped result. If the reason was a correctness or compatibility problem I caught myself, that would be worth adding here.

## Needs your input before submitting

1. **Abbreviation extension plugin:** This 54-line commit has an author date of 2024-11-30 but a commit date of 2025-05-09, so it was probably rebased or re-applied. I left it out of the totals because the work looks like it predates the review window. If you finished or landed it in 2025, add it as a sixth item. A teammate made a small tweak to its output in June.
2. **Table-of-contents bug fix (Feb 2025):** This commit is under the name "dreyes" with a different email (dana.reyes@gmail.example). I attributed it to you but couldn't confirm it's you. Delete that line if it isn't.
3. **Business context:** Git can't show who used these features, how many users they reached, or what requests drove them. Adding a sentence per item on why it was needed, such as a customer request, a blocked team or a ticket, would make this stronger than line counts alone.
