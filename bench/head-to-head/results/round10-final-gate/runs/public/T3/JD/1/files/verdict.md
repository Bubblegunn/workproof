# Verdict: do not trust the received report

The files are `received/workproof-report.md` and `received/workproof-report.json`. They describe this repo at HEAD `249bbdc`, which matches the clone. The commit-share and surviving-lines figures are inflated, and the report contradicts itself. The "several email addresses" explanation does not account for the gap.

## What I checked

I recomputed the figures with plain `git log` and `git blame` in the clone. I did not run `npx workproof verify`, because that would execute downloaded code from the network. I did not rely on the report's hash. I tried to recompute it, but I don't know the tool's exact canonicalisation. A mismatch from my attempt proves nothing, and a match would only show the file is internally consistent, not that it is true.

| Claim in report | What the clone shows |
|---|---|
| HEAD 249bbdc72da2 | Matches. |
| Identities: Jonathan Ong and jongleberry, 4 addresses merged | The addresses `<email:d29caa5c>` (56 commits), `<email:4132b6bd>` (5) and `<email:266aea16>` (2) exist. The author names "Jonathan Ong" and "jongleberry" account for 63 non-merge commits in the tenure window. |
| 103 of 131 commits in tenure (79%) | The 131 total for the window matches. The subject's count is **63 (about 48%)**, not 103. Merging every plausible address does not reach 103. |
| 1,197 of 1,417 surviving lines (84%) | `git blame -w -M` over all 19 files gives 1,416 lines, of which **696 are Jonathan Ong's (about 49%)**. TJ Holowaychuk holds 551. The total is close, but the subject's share is off by about 500 lines. |
| Tenure 2013-11-07 to 2015-08-22 (654 days) | The start date matches. The last commit under those identities is **2015-07-09** (about 609 days). |
| Ranks 1 of 42 authors | I count 59 distinct author names and 60 distinct emails. TJ has the most commits overall (90, against about 63 for the subject). The subject is first only inside the window. |
| 23 release tags in tenure, 17 by the author | The repo has 36 tags in total. I did not verify the in-window split. |

I did not verify these figures: files authored (10 of 19), test-file changes (31 of 43), active weeks, commit size, and the language split.

## The report contradicts itself

The report's own "Survival by cohort" figure lists 104 + 550 + 43 = **697 lines**. That matches the true blame count of 696. The headline figure says 1,197, which is exactly 500 more. The two figures come from the same blame pass, so they cannot both be right. The headline and the plain-language paragraph ("the higher of the two... survived better than the count of changes suggests") rest on the inflated number.

## Conclusion

- The "multiple email addresses" explanation is partly true. Merging the addresses does raise the count, from 56 to 63.
- It does not explain the reported numbers. The commit count is about 40 too high and the surviving lines about 500 too high, so the report's story that the surviving-lines share is the higher of the two is false.
- The real picture is still real work. They have about 63 commits, about half of the surviving lines, and rank first in the 2013–2015 window. It is just not the 79% and 84% claimed.
- The report looks edited after generation, or generated from something other than this repo history. I can't say which.
- The report never names the applicant. It names "Jonathan Ong" and "jongleberry", and the clone's configured git user is also "Jonathan Ong". Confirm that the applicant is the person behind those identities. The report is only evidence about whoever owns them.

## Suggested next step

Ask the applicant for the exact address list they used. Then compare it against `git shortlog -sne` in your clone and use your own recomputed numbers. Don't use the report's figures.
