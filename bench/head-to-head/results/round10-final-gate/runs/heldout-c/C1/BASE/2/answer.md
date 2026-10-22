I wrote `promotion-evidence.md` in the repo folder. It's built from the commits under your work email.

**What it covers for January–June 2025:**
- **Table-of-contents plugin (Jan):** about 90 lines, with tests.
- **LaTeX footnote renderer (Mar):** about 120 lines.
- **Math plugin v2 with block-level equations (Apr):** about 110 lines, with tests, developed on a branch and merged.
- **Abbreviation plugin:** about 54 lines.
- **Supporting work:** bundling a dependency for offline builds, and a 37-file formatting header.

In total that's about 375 lines of new feature and test code.

**Judgment calls to check:**
- **Vendored library:** the 6,000 lines of python-slugify you vendored are third-party code. I described it as a build-reliability change and left it out of your size numbers.
- **Reverted speed-up:** I didn't claim the "30% faster" parser change, because you reverted it two days later.
- **Abbreviation plugin date:** it was authored in November 2024 but committed in May 2025. It's included by commit date, so confirm that's right or drop it.
- **Heading-ID fix:** a small fix to your table-of-contents plugin is committed as "dreyes" under a Gmail address. I left it out because I couldn't confirm it's yours. If it is, add it.
- **Priya Nair's edits:** her follow-up edits to your code aren't counted as yours.

Git only shows volume and scope. The committee will also want impact, such as who uses these features, what problems they solved, and any review or mentoring you did. I left those for you to add because the history doesn't show them.