# Verdict: do not trust the workproof report as written

The report is a genuine-looking workproof 0.7.0 output for this repo (HEAD `249bbdc` matches). Several headline figures do not match the repo, and every error makes the applicant look better. The multi-email explanation does not account for them, because I included all of the applicant's addresses.

## What I checked
I recomputed the figures with plain `git log` and `git blame` in the local clone. The clone is complete (not shallow) and has no local changes apart from the untracked `received/` and `portfolio-bank.md`.
I did not run `npx workproof verify`. It would download and execute unreviewed code from the sender's tooling, and the report's embedded hash only shows the file wasn't edited after generation. It says nothing about whether the numbers are true.

Identities used: `Jonathan Ong <<email:d29caa5c>>` (56 commits), `Jonathan Ong <<email:4132b6bd>>` (4), `jongleberry <<email:266aea16>>` (2) and `jongleberry <<email:4132b6bd>>` (1). That is 63 non-merge commits across the three address groups the report says it merged. One more address that matched "jongleberry" did not count.

## Results

| Report claim | Actual (recomputed) | Result |
|---|---|---|
| HEAD `249bbdc72da2` | `249bbdc72da2…` | matches |
| 131 non-merge commits in the window | 131 | matches |
| **Applicant commits: 103 of 131 (79%)** | **63 of 131 (about 48%)** | **inflated by about 40** |
| **Last commit 2015-08-22 (tenure 654 days)** | **Last commit 2015-07-09 (about 609 days).** The repo's last commit in the window is 2015-08-02 and it isn't the applicant's. | **wrong** |
| First commit 2013-11-07 | 2013-11-07 | matches |
| **Surviving lines 1,197 of 1,417 (84.5%)** | **About 696 of about 1,416 (about 49%)** | **inflated by about 500** |
| Cohort lines 104 / 550 / 43 | 104 / 550 / 43 (sum 697) | matches blame. It contradicts the report's own 1,197 headline, since the cohorts add up to 697. |
| Rank 1 by surviving lines | Rank 1 (696 vs TJ Holowaychuk 551) | holds |
| **Rank 1 of 42 authors by commit count** | **Whole repo: 60 authors, and TJ Holowaychuk leads with 90 commits to the applicant's 63.** In the window the applicant leads, 60 to 19 (43 authors). | **partly wrong** |
| 24 active weeks | 24 | matches |
| 23 release tags in the window | 23 | matches |
| 19 files at HEAD | 19 | matches |
| 0 AI trailers, 0 co-authored | not checked in depth; the 63 commits show no such trailers in the fields I read | not contradicted |

I did not recompute these figures: files authored (10 of 19), test-file changes (31 of 43), languages by lines added, commit size, and the 34-files-touched count. Treat them as unverified. The ones derived from the same inflated commit count are suspect.

## Interpretation
- The applicant's real contribution is still substantial. They are the top surviving-line author at HEAD with about 49% of lines, and the top committer in the window. The report overstates it.
- The 103-versus-63 gap and the 1,197-versus-696 gap are not explained by merged email addresses. They are the report's own inconsistencies: the cohort breakdown (697) contradicts the 1,197 headline, and the "654 days" end date is not the applicant's last commit.
- Two explanations fit: the file was edited, or it was produced by a modified tool. The hash can't distinguish them, because anyone editing the JSON could recompute it. I can't tell which from the files alone.

## Recommendation
Don't rely on the report's numbers. Ask the applicant to explain the 103 commits and the 1,197 lines, and to name the extra addresses they say they used. Ask them for the exact command and tool version they ran. The honest figures are about 63 commits and about 696 surviving lines (about 49%), and they are enough to discuss.
