I wrote `promotion-evidence.md` in the repo folder.

- **Delivered:** four items.
  - A table-of-contents extension, 90 lines including tests (14 Jan).
  - A LaTeX footnote renderer, 120 lines (12 Mar).
  - Math plugin v2 with block-level support, 75 lines plus 36 lines of tests (15–17 Apr).
  - The formatter header applied across 37 files (6 May). That one is mechanical, and the file labels it that way.
- **Offline builds:** the vendored slugify library (10 Feb) is described as a build-reliability change. About 6,000 of its lines are third-party code, so I didn't count it as code you wrote.
- **Left out of the totals, with the reasons in the file:**
  - **Speed-up commit:** the "30% faster" inline-parser commit has no benchmark in the history, and you reverted it two days later. I listed it as an experiment and didn't claim the figure.
  - **Abbreviation plugin:** it was authored on 30 Nov 2024 and only landed on 9 May 2025, so the work predates your window. Say so if you want it included.
  - **Priya Nair's commits:** her two commits are noted as hers.

**Decision for you:** the 3 Feb heading-collision fix (4 lines) was committed from `dana.reyes@gmail.example`, not your work email. It has a Signed-off-by line in your name, so it's probably yours. I left it out of the counts because you gave me only your work email. If it's yours, add it.

The numbers are small, and the file says lines of code are only a rough proxy for size. The history can't show design, review or mentoring work, so add that from your own records.