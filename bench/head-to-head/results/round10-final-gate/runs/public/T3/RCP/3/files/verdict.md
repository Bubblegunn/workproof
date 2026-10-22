# Verdict: do not trust the received reports

`received/workproof-report.md` and `.json` are not an accurate account of this repo. The headline figures are inflated well beyond what merging email addresses can explain. Several of them also contradict the report's own other numbers.

## What I checked

I read both files, then recomputed the figures from the local clone. HEAD is `249bbdc72da2`, which matches the report's HEAD. I used the report's own merge rule: "Jonathan Ong" plus "jongleberry", across all their addresses.

| Claim in report | What the clone shows |
|---|---|
| 103 of 131 non-merge commits in tenure (79%) | The window contains 131 commits, which matches. Merged identities account for **63** of them: 60 as "Jonathan Ong" and 3 as "jongleberry". That is **48%**, not 79%. Across all history the merged identity has 63 commits (56 + 4 + 2 + 1), against TJ Holowaychuk's 90. |
| Surviving lines 1,197 of 1,417 (84%) | `git blame -w -M` over all 19 files gives **696 of 1,416 (49%)** for Jonathan Ong. TJ Holowaychuk has 551. The total is almost the same, but the author's share is about 500 lines lower. |
| Internal consistency | The report's own cohort figures (104 + 550 + 43) add up to **697**. That matches the real count and contradicts the report's 1,197. The 1,197 figure was changed without updating the cohort breakdown. |
| Tenure 2013-11-07 to 2015-08-22 (654 days) | The first commit date matches. The author's last commit is **2015-07-09**, not 2015-08-22. |
| 42 people wrote code; author ranks 1 | I count **59** distinct author names. By commit count TJ Holowaychuk (90) outranks Jonathan Ong, so rank 1 holds only after merging. |
| Report hash `d54f08…` | I did not recompute it. The hash covers only the report's contents. It does not show the contents match the repo, and anyone who edits the figures can recompute it. |

## Other observations

- The identities in the report ("Jonathan Ong", "jongleberry") are the repo's long-time maintainer. They are also the name in your local git config. A genuine applicant would normally appear under a different name, so the report may be claiming someone else's work.
- The report says the emails are hidden (`emails: false`), so I could not check which addresses the applicant says are theirs. Ask them for those addresses. Then check them with `git log --author=<email>`.
- The "merged by rule" step is heuristic. It matches on names and GitHub logins. It does not prove the applicant owns those addresses.
- The format and method text look like genuine workproof output. The numbers do not match what git reports for this repo.

## Conclusion

Merging identities does not explain the gap. With every address merged, the author has about 48% of commits in the window and about 49% of surviving lines. The report claims 79% and 84%. One of the report's own figures contradicts the others, which points to hand editing. Treat the files as unreliable. If you want to continue, ask the applicant for their specific email addresses or GitHub handle and for the exact `workproof` command. Then rerun it yourself in your clone, and compare the result against the figures above.
