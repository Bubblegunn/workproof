I wrote `promotion-evidence.md` in the repo folder. It covers what you delivered from January to June 2025 in plain terms, with rough sizes from the commits.

**What's in it:**
- **Features (about 400 lines of code and tests in total):**
  - Table-of-contents plugin, about 90 lines, 14 Jan.
  - LaTeX footnote renderer, about 120 lines, 12 Mar.
  - Math plugin v2 with tests, about 110 lines, 15–16 Apr.
  - Abbreviation plugin, about 54 lines.
- **Maintenance:**
  - A fix for heading IDs colliding in the table-of-contents plugin.
  - A pinned copy of the python-slugify library so the project builds offline.
  - A formatter header added across 37 files.
- **Collaboration:** a teammate refactored your footnote renderer and credited you as co-author. Another of their commits tweaked your abbreviation plugin.

**Choices I made:**
- **Vendored library:** the 6,000-line python-slugify copy is third-party code, so I listed it but didn't count it as your engineering volume.
- **Formatter header:** this is a one-line mechanical change per file, so I kept it out of the volume figure too.
- **Parser speed-up:** the "30% faster" commit was reverted two days later. I listed it as a rolled-back experiment and made no performance claim.

**Things to check:**
- **Bug-fix commit:** it's under the author name "dreyes" with a personal Gmail address. It carries a Dana Reyes sign-off, so I included it, but please confirm it's yours.
- **Abbreviation plugin dates:** the commit is authored 30 Nov 2024 but was committed 9 May 2025. I counted it in the window and noted the date mismatch, so decide how you want to present it.
- **Impact:** the file has no impact numbers, because git history doesn't contain adoption, time saved or user feedback. You'll want to add those yourself.