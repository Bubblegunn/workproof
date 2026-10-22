You can't trust the headline numbers in those files. I wrote the verdict to `verdict.md`.

I recounted from your clone using plain git, counting all four of the applicant's identities (three addresses plus the "jongleberry" name):

| Figure | Report says | Clone says |
|---|---|---|
| Commits in the period | 103 of 131 (79%) | 63 of 131 (48%) |
| Surviving lines at HEAD | 1,197 of 1,417 (84%) | 696 of 1,417 (49%) |
| Test-file changes | 31 of 43 | 31 of 43 (matches) |
| Tenure end date | 2015-08-22 | last commit is 2015-07-09 |

- **What matches:** The repo totals match (131 commits in the period, 1,417 lines, 19 files). They do rank first by surviving lines, and they did make 63 commits, so they contributed.
- **Why the multiple-email explanation fails:** Merging all their addresses gives 63 commits, not 103. Blame already credits the name "Jonathan Ong" across all addresses, so merging can't move 696 lines to 1,197. Your `portfolio-bank.md` agrees with my recount (63 commits, 697 lines).
- **What I couldn't check:** The report doesn't list the merged addresses, so I can't audit which ones it used. Its integrity hash only shows the file wasn't changed after it was generated, not that the numbers are true. I didn't run `npx workproof verify`, because that would mean running unvetted code from an applicant.

The jd-resume-tailor skill only tailors resumes, so I didn't use its format. I did the check directly instead.