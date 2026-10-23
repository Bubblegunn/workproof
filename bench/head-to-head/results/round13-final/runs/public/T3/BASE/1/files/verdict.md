# Verdict: do not trust the report's numbers

The two files in `./received` (`workproof-report.md` and `.json`) don't match this clone. The inflation is much larger than merging a few email addresses can explain.

## What I checked

I recomputed the figures with plain `git` in this clone. I did not run `npx workproof verify`, because that would execute code supplied with the untrusted files. The clone is at HEAD `249bbdc72da2`, the same HEAD the report names.

| Claim | Report | Recomputed from this clone |
|---|---|---|
| HEAD | `249bbdc` | `249bbdc` (match) |
| Total non-merge commits in tenure | 131 | 131 (match) |
| Applicant's commits | 103 (78.6%) | **62 in the window (47%)**. All-time non-merge commits under every matching address or name are 63. |
| Addresses merged | 3 extra, 4 identities | Only 3 addresses and 2 names exist: `<email:d29caa5c>` (56 in window), `<email:4132b6bd>` (4+1), `<email:266aea16>` (2). Merging all of them gives 62–63, not 103. |
| Surviving lines | 1,197 of 1,417 (84%) | The 1,417 total matches. `git blame -w -M` gives **696 lines (49%)** for "Jonathan Ong", and 585 by that address alone. TJ Holowaychuk has 551. |
| Rank by surviving lines | 1 | 1 (this holds, but the lead over TJ is narrow, not dominant) |
| Last commit | 2015-08-22 | The last authored non-merge commit is 2015-07-09 (4.6.0). 2015-08-22 is a merge commit by `jongleberry` of someone else's PR. |
| Files started | 10 of 19 (53%) | 8 of 19 by "Jonathan Ong" (about 42%). TJ started 9. |
| Authors | 42 | 44 distinct emails in the window, 59 names overall. The mismatch is small and I did not chase it. |
| Tags | 23 in tenure, 17 by the applicant | There are 36 tags in total. I did not break them down further. |

The report's own `identity.merged.reasons` include "address name matches your GitHub login". That means it merged identities by heuristic rules rather than from a list of addresses the applicant supplied.

## Conclusion

- The commit count (103 against about 62) and the surviving-line count (1,197 against 696) are both overstated by roughly 65–70%. Merging every address the applicant could plausibly own cannot reach those figures.
- The report still attributes the real work in this repo. The applicant (or whoever uses these identities) is the top author by surviving lines and wrote about half of them. That is a real contribution, but it is not 84%.
- Some details are padded in the applicant's favour. The tenure end date comes from a merge commit, not authored work, and the file-ownership share is too high.
- The report says it is self-verifying through a hash. That only shows the file wasn't edited after it was produced. It says nothing about whether the numbers are right.

## Caveats and open questions

- I can't tell whether the numbers were edited by hand or the tool was run with settings that over-count. The tool settings are visible in the JSON (`params`, with `emails: false`). Either way the output doesn't match the repo.
- The identity in the report ("Jonathan Ong", "jongleberry") is also the git user configured in this clone. If the report was generated against a different clone or fork of the repo, the data could differ. HEAD matches, though, so I'd expect the same history.
- Ask the applicant to list the exact email addresses they used. Then compare `git log --author=<each>` yourself. If they claim more than 63 commits under those addresses, the claim fails.
- Check the claim that they authored this work. These commits are from 2013–2015 under the name Jonathan Ong. Confirm that is the applicant, for example through a GitHub profile, an interview, or technical questions about the code.
