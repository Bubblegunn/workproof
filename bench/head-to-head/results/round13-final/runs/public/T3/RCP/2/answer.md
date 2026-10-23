You can't trust the headline numbers in those files. I wrote the verdict to `verdict.md`.

I checked the report against your clone using git only. I did not run `npx workproof verify`, because that would download and run someone else's code.

**What matches:**
- The HEAD commit `249bbdc` matches.
- The window has 131 non-merge commits, as the report says.
- There are 19 files alive at HEAD, as the report says.
- The applicant really is the top contributor.

**What doesn't match:**
- **Commits:** the report says 103 of 131 (79%). The clone shows 62 (about 47%) across all four of Jonathan Ong's name and email variants. Merging addresses explains why 56 became 62, not 103.
- **Surviving lines:** the report says 1,197 of 1,417 (84%). `git blame` gives 696 of about 1,416 (about 49%).
- **The report contradicts itself:** its own cohort breakdown (104 + 550 + 43) adds up to 697, which matches my blame count. The 1,197 headline is about 500 lines higher than the report's own data.
- **Author count:** the report says 42 authors. The clone shows 44 in the window and 59 overall.

**What I didn't check:**
- Files authored, test changes, cadence and footprint. I only recomputed the commit, blame and HEAD figures.
- Whether the applicant is actually the person named in the report. The report only says "Jonathan Ong, jongleberry". Ask the applicant which identities are theirs.

The real numbers (about 62 commits, 696 surviving lines) are still the top contribution to the repo. They just don't support the claim as stated, so I'd ask the applicant to explain the gap.