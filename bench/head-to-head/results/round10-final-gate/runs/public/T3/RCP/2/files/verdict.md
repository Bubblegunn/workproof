# Verdict: do not trust the received report

The two files are a `workproof` 0.7.0 report (`.md` and `.json`) for this repo (HEAD `249bbdc`, which matches your clone). Two headline figures don't match the git history. Both are overstated, and both errors point the same way. The report's own `hash` field can't prove otherwise, because anyone can recompute it after editing the numbers.

## Where the report is wrong

| Claim in report | What the clone shows |
|---|---|
| 103 of 131 commits in tenure (78.6%) | **63 of 131 (48%)**. The identities the report says it merged are `Jonathan Ong` (60 commits in the window) and `jongleberry` (3), which gives 63. |
| 1,197 of 1,417 surviving lines (84.5%) | **696 of 1,417 (49%)**, from `git blame -w -M` over all 19 files at HEAD. |
| Cohort lines 104 + 550 + 43 | These sum to **697**, which matches the real blame count. They contradict the report's own 1,197. The surviving-lines figure is about 500 higher than the figure's own cohort breakdown. |
| "Higher of the two: their work survived better than the count of changes suggests" | This conclusion rests entirely on the inflated numbers. With the real ones, 48% of commits and 49% of lines are about equal. |

The 131 total commits and the 1,417 total lines are correct. So the denominators are real and only the applicant's numerators are inflated.

## What I checked

- HEAD and the tenure window. HEAD is `249bbdc72da2`, as the report says. The first and last commits under the merged names are 2013-11-07 and 2015-08-22, as the report says.
- Commit counts. I counted `git log --no-merges` by name and email, in the window and overall. The identity merge is plausible: the repo has `Jonathan Ong` under two addresses and `jongleberry` under two. Even counting every one of these identities, I get 63 in the window. The report's 103 would need about 40 more commits than exist.
- Surviving lines. I ran `git blame --line-porcelain -w -M` over all tracked files. Total lines are 1,417, as reported. Lines attributed to `Jonathan Ong` are 696.
- Sampling and exclusions. The report says it sampled 19 of 19 files and excluded 0 files. The clone has 19 tracked files, so this is consistent.
- Plausibility checks. The author count is close: 44 distinct emails in the window against the reported 42. Jonathan Ong is top by commits within the window, as claimed. The claim that the report's merge "explains" higher numbers is true only for the 63. It doesn't explain 103.
- The report hash. I tried to recompute `d54f0828…` from the JSON with plain canonical JSON and didn't get a match. I don't know the tool's exact RFC 8785 canonicalization, so I can't say whether the hash is valid. Either way it only detects edits made without recomputing it. It doesn't show that the numbers are true.

I did not run `npx workproof verify`, because that would execute code downloaded from the applicant's chosen tool. If you want to run it, do it in a sandbox. The git commands above are enough to show the mismatch.

## Other things to know

- The subject of the report is "Jonathan Ong", who is also this repo's well-known maintainer and the git user in your clone. I can't tell from the files whether the applicant is that person or is claiming that person's history as their own. Ask them which commits and email addresses are theirs, and compare those with the `git log` output.
- The report hides the email addresses (`emails: []`). That makes independent checking harder. You can't tell which addresses the applicant says are theirs.
- The report is internally inconsistent, and the tool's own text says the numbers can't be edited without detection. That suggests the numbers were changed after generation, or that the report was generated from a different or modified repository.

## Recommendation

Treat the received files as unreliable. Ask the applicant for the list of email addresses they claim, then run `git log --author=<email>` for each in your own clone and use those counts. On the evidence in the clone, the contribution is real but about half of what the report claims.
