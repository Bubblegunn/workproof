I've written the verdict to `verdict.md`. The Write call said it updated that file, which means one may have been there already. I didn't look at it first, so I may have overwritten something.

**Don't trust the figures as written.** The report matches this repo in several places. It has the same HEAD, 131 commits in the window, and 1,417 total surviving lines. The applicant's own numbers are inflated, though, and merging email addresses doesn't explain it. I counted every address I found for them: `<email:d29caa5c>`, `<email:4132b6bd>` and the GitHub noreply address.

| Figure | Report says | I recomputed |
|---|---|---|
| Commits | 103 of 131 (79%) | 63 of 131 (48%) |
| Surviving lines | 1,197 of 1,417 (84%) | 697 of 1,417 (49%) |
| Tenure end | 22 Aug 2015 | Last authored commit is 9 Jul 2015. The 22 Aug commit is a merge of someone else's PR. |

- **Other differences:** The report counts 42 authors, but I found 60 distinct author emails. It lists 4 identities, but I found only 3 addresses.
- **What holds up:** The applicant is still the top author by surviving lines, at about 49% of the code. That claim is real, but the report overshoots it.
- **Not recomputed:** I did not recompute the tag counts, files authored, test share, language mix or commit size. I only spot-checked active weeks.
- **Verify tool:** I didn't run `npx workproof verify`, because it downloads and executes third-party code, and the file came from the applicant. The report's hash only shows the file is self-consistent.
- **Branches:** My clone only has `master`. If the applicant worked on a fork or other branches, that could change the counts. Ask them which addresses and refs they used.

The gaptogrowth skill is for tailoring resumes, so I didn't use its workflow here. The one rule I applied was working only inside this folder.