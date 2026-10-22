I wrote `promotion-evidence.md` in this folder. It covers January to June 2025 in plain terms and doesn't assume the committee has seen the code.

**Delivered features:**
- **Table-of-contents plugin:** about 60 lines of code plus about 30 of tests, in January.
- **LaTeX footnote renderer:** about 120 lines, in March. It's the largest feature of the period.
- **Math plugin v2 with block-level equations:** about 75 lines plus about 36 of tests, merged in April.

**Supporting work:**
- A heading-ID collision fix in the table-of-contents plugin.
- Vendoring `python-slugify` for offline builds.
- Applying a formatter header across 37 files.

**Choices I made that you should check:**
- **Vendored library:** the vendored `python-slugify` is about 6,000 lines of third-party code. I described it as integration work, not code you wrote, so it doesn't inflate your numbers.
- **Reverted speedup:** the "30% faster" inline-parser change was reverted two days later, and the repo has no benchmark behind the claim. I listed it as an experiment that didn't ship, not as a result.
- **Personal-email commit:** the heading-collision fix is under `dreyes <dana.reyes@gmail.example>`, not your work email. I included it as supporting work, but please confirm it's yours.
- **Excluded commits:** the abbreviation plugin is dated November 2024, so it's outside the window. Priya Nair's two commits and the Dependabot bump aren't yours.

Git shows how much code you wrote, not how much it mattered. Adoption numbers, user requests or reviewer feedback would strengthen the case.