I wrote `promotion-evidence.md`. It covers January to June 2025, using only commits under your work email. I didn't run the cv-builder skills, because they are built for resumes and job postings rather than a promotion write-up.

**Delivered**
- **Table-of-contents extension (14 Jan):** 60 lines of code plus 30 lines of tests, with 10 test cases.
- **LaTeX footnote renderer (12 Mar):** 120 lines.
- **Math plugin v2 with block-level support (15 Apr):** 75 lines, plus 36 lines of tests with 12 test cases (16 Apr).

That adds up to about 320 lines across 5 commits.

**Left out on purpose**
- **Vendored slugify library (10 Feb):** This is about 6,000 lines of someone else's code, so I listed it as build-reliability work and didn't count it as volume.
- **Formatter header (6 May):** One line added to each of 37 files. I listed it as mechanical.
- **"30% faster" parser change:** You reverted it two days later, and the repo has no benchmark for the figure, so I didn't claim it.
- **Abbreviation plugin:** It was committed on 30 Nov 2024, which is outside the period.
- **Priya Nair's commits:** Her edits to the footnote renderer and the abbreviation plugin are hers.

Two things need you:
1. **A fourth commit that may be yours.** "Fix heading id collision in toc_ext" (3 Feb, 4 lines) was authored as `dreyes <dana.reyes@gmail.example>`. It looks like yours, but I left it out because you gave only the work address. Tell me if it's yours and I'll add it.
2. **Outcomes.** Git shows what you built and how much code it took, not who used it or what it changed. I added a short section listing what to fill in: who requested each feature, adoption, review feedback and time saved. The committee will likely care about those most.

I also couldn't describe what the features do beyond their commit messages and file names. The code in this repo is mostly placeholder functions, so check the plain-language descriptions against what you actually shipped.