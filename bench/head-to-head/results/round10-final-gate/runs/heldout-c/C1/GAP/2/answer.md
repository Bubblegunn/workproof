I wrote `promotion-evidence.md` in the repo folder. It describes the work in plain terms for someone who hasn't seen the code.

**What it covers for January–June 2025**
- **Table-of-contents plugin:** about 90 lines including tests, plus a 4-line fix for clashing heading anchors.
- **LaTeX footnote renderer:** about 120 lines.
- **Math plugin v2 with block-level equations:** about 110 lines including tests.
- **Offline-build support:** a bundled third-party library of about 6,000 lines. I labelled it as copied-in code, not code you wrote.
- **Formatter header:** applied across 37 files, one line each.
- **Parser speed-up:** reverted two days after you made it, so it's listed separately and left out of the totals. The history doesn't say why.
- **Totals:** 3 features, 1 bug fix, about 260 lines of implementation and about 66 lines of tests.

**Please check before you submit**
- **Fix commit identity:** The 3 Feb heading fix was committed as `dreyes` with `dana.reyes@gmail.example`, not your work email. I counted it as yours because it fixes your own plugin. If it isn't yours, remove it.
- **Excluded commits:** I left out the abbreviation plugin (dated Nov 2024, before the window), Priya's June tweak, and a Dependabot bump.
- **Add impact:** Git history can't show users, adoption or feedback, so adding that would make the case stronger.
- **Footnote tests:** The footnote renderer has no tests in this window. A committee member reading the file might ask about that.