# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of a private Acme repository, filtered to commits authored with dana.reyes@acme-corp.example between 2025-01-01 and 2025-06-30. The repository is a Markdown-to-HTML/LaTeX conversion library. It takes documents written in plain Markdown text and turns them into formatted output. Features are added as optional "plugins" or "renderers".

Sizes are lines of code added. They show relative scale only, not quality or business value.

## Summary

In six months I shipped three new user-facing features, each with automated tests where noted below. I also did two pieces of supporting work (offline build support and a repo-wide formatting pass). I started one performance project and reversed it. The new feature code is roughly 320 lines, across about 5 feature deliveries.

## Delivered features

### 1. Table-of-contents plugin (Jan 2025)
- **What it does:** Automatically builds a clickable table of contents from a document's headings.
- **Size:** about 60 lines of feature code plus 30 lines of automated tests (small).
- **Why it matters:** Long documents become navigable without authors building a contents list by hand.

### 2. LaTeX footnote renderer (Mar 2025)
- **What it does:** Lets footnotes in a document come out correctly in LaTeX, the format used for print and academic-style documents. Before this, footnotes had no LaTeX output.
- **Size:** about 120 lines, the largest single feature of the half (medium).
- **Note:** A teammate (Priya Nair) later made a 5-line refactor. I'm not claiming that.

### 3. Math plugin v2 with block-level support (Apr 2025)
- **What it does:** A second version of the equation-support plugin. It adds block-level math, meaning standalone displayed equations as well as inline ones.
- **Size:** about 75 lines of feature code plus 36 lines of tests (medium). It was developed on a feature branch (`feature/math-v2`) and merged to main on 2025-04-17, with tests added before the merge.

## Supporting and infrastructure work

- **Offline build support (Feb 2025):** I bundled a pinned copy of a third-party text-slug library (python-slugify 8.0.4) into the repo so builds work without network access. The commit is about 6,000 lines, but all of it is third-party code, not code I wrote. This is a build-reliability change, not a feature.
- **Formatter header across the codebase (May 2025):** I applied a one-line standard header to all 37 source files. It is mechanical and low-effort, but it touched every source file and the new standard now applies codebase-wide.

## Attempted and reverted

- **Inline parser speed-up (Apr 2025):** I committed an optimization labeled "30% faster", then reverted it two days later. I can't verify the 30% figure from the history, and the work is not in the product. I'd leave it out of the case. If I mention it at all, it should be as a lesson about catching a problem and rolling back quickly, and only if I can say what the problem was.

## Not counted, pending confirmation

- **Heading-ID collision fix in the table-of-contents plugin (Feb 2025, 4 lines):** This commit is signed "Dana Reyes" but uses a personal email address (dana.reyes@gmail.example), not my work address. It is probably mine, but I haven't claimed it until I confirm.
- **Abbreviation plugin (54 lines):** The commit is dated 2024-11-30, before this period, though it landed on main on 2025-05-09. If the committee counts by landing date, it belongs in this half. I need to decide which date applies. A teammate (Priya Nair) added a 4-line tweak in June, which isn't mine.

## What git can't show (to fill in before submitting)

- Who used these features, and what they changed for them or for customers.
- Design decisions, reviews I did for others, mentoring, on-call or incident work, and anything not committed.
- Any evidence for the 30% speed-up goal, such as benchmarks or the reason for the revert.
