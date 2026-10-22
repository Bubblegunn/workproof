I wrote `promotion-evidence.md` in the repo folder. It covers what you delivered from January to June 2025, using only commits under your work email.

**What it says:** you shipped four features:
- a table-of-contents plugin, about 60 lines plus tests;
- a LaTeX footnote renderer, about 120 lines;
- math plugin v2 with block-level support, about 75 lines plus tests;
- an abbreviation plugin, about 54 lines.

That's roughly 375 lines of feature code and 65 lines of tests. The file explains each feature in plain terms for readers who haven't seen the code.

**Judgment calls for you to check:**
- **Vendored library:** I excluded the 6,000-line python-slugify commit from your output. It's third-party code, and I framed it as an offline-build improvement.
- **Formatter header:** the 37-file commit is described as mechanical housekeeping, not as a big contribution.
- **Abbreviation plugin:** it was authored in Nov 2024 but landed in May 2025. It's included with a note about the date.
- **Reverted speedup:** the "30% faster" parser commit was reverted two days later. The history doesn't say why, so the file has a placeholder where you should add the real reason.
- **Personal-email commit:** one 4-line bug fix is under `dreyes` / a gmail address. I left it out of the totals but flagged it. If it's yours, it's worth adding.

The history only shows code volume. You'll need to add impact numbers, such as adoption, and any reviews or mentoring from other sources.