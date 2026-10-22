I wrote `promotion-evidence.md` in this folder. It covers four features, about 380 lines of code and tests in total. The line counts show scale, not impact or difficulty.

- **Table-of-contents plugin (Jan):** about 90 lines with tests, plus a 4-line bug fix in Feb.
- **LaTeX footnote support (Mar):** about 120 lines.
- **Math plugin v2 with block-level formulas (Apr):** 111 lines with tests. It went from first commit to merge in two days.
- **Abbreviation plugin (added to main in May):** about 54 lines.

I left some things out on purpose, and the file says why:
- **Vendored python-slugify:** about 6,000 lines of third-party code that Dana didn't write.
- **Formatter header:** a one-line change in each of 37 files.
- **"30% faster" parser change:** it was reverted two days later and the history has no benchmark. Please don't cite it as a delivered result.

I need two answers from you:
1. **Personal-email commit:** the Feb 3 table-of-contents fix was committed from `dana.reyes@gmail.example`, not your work email. I counted it as yours because it fixes your own plugin. If it isn't yours, remove it and subtract 4 lines.
2. **Abbreviation plugin date:** it was written in Nov 2024 but only added to main in May 2025. I included it because it landed in the window. Without it, the total drops to about 326 lines.

Git also can't show who used these features. A sentence or two on that for each one would strengthen the case.

I used the skill only loosely. It is built for tailoring resumes, so I skipped its resume folders and Learning Hub steps and wrote only the one file you asked for.