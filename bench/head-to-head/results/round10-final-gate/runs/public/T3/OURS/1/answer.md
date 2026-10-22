I ran the workproof verdict check against my clone and it has already written `verdict.md`. **Don't trust these files as sent.** The inflated numbers are the ones that matter most.

**What I checked**
- I recomputed the report's figures from this clone's git history, using `workproof verdict` rather than recounting by hand.
- I re-derived the claim about merged email addresses.
- I recomputed the report's hash offline.

**What differs**

| Figure | Report says | Repository says |
|---|---|---|
| Commits in the tenure window | 103 of 131 (78.6%) | 63 of 131 (48.1%) |
| Surviving lines at HEAD | 1,197 of 1,417 (84.5%) | 697 of 1,417 (49.2%) |

- **Merged addresses:** the report says 3 other addresses were merged in, so 4 in total. The repository has only 3 addresses under the names the report gives, and together they come to 63 commits.
- **Matches in the report:** the 131 total, the 1,417 lines and the per-year line breakdown all match the repository. Only the applicant's share is inflated. The weekly cadence figures were not among the figures the verdict tool compared, so they are unchecked.
- **Hash:** the offline check passes. That only shows the file wasn't edited after it was generated. Someone who changes a figure can recompute the hash, so it doesn't make the figures true.

**Limits**
- History can be rewritten before a report is made.
- These figures show activity and what survived, not quality, review, design or mentoring.
- The report's identity is "Jonathan Ong", the same name as the configured git user in your clone. The tool can't tell you whether the applicant is actually that person.

**Recommendation**
Ask the applicant for a fresh report from the original repository, plus references from people who worked with them. Ask which specific addresses they claim, and why the report counts one more than the repository contains.