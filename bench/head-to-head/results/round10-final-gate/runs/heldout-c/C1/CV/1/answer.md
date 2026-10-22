I wrote `promotion-evidence.md` in the repo folder. It covers three features you delivered between January and June 2025:

- **Table-of-contents plugin (January):** about 60 lines plus 30 lines of tests.
- **LaTeX footnote output (March):** about 120 lines. That commit has no tests.
- **Math plugin v2 with block equations (April):** about 75 lines plus 36 lines of tests.

Together that is roughly 285 lines of new code and tests, plus a 4-line bug fix in February. The file explains each feature in plain language and says that line counts are only a rough measure of size.

I left some things out of the totals on purpose, and the file says so:
- **Vendored `python-slugify`:** about 6,000 lines, but it's third-party code you copied in. I listed it as offline-build support and did not count it as your output.
- **Inline-parser speedup:** the commit claims "30% faster", but you reverted it two days later and nothing in the history backs up the figure.
- **Formatter header:** one line added to each of 37 files, which is mechanical.
- **Abbreviation plugin:** committed in November 2024, so it falls outside your window.

Please check one thing before you submit. The heading-collision fix in February is authored as `dreyes` with a personal Gmail address, not your work email. I included it as yours. Confirm it is, or remove it.

Git history can't show impact, such as adoption, bugs closed or user feedback. Adding that would make the case much stronger.