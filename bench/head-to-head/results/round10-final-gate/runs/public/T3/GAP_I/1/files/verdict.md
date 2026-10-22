# Verdict: do not rely on the received report as written

**Short answer:** The report matches this repository (same HEAD, same history window, same total line count), but its headline contribution figures are overstated. Merging email addresses does not explain the gap. I recomputed the numbers with plain `git` using all of the applicant's addresses, and they come out well below what the report claims.

The files are `received/workproof-report.json` and `received/workproof-report.md`. They describe the repo as "F1" at HEAD `249bbdc72da2`, subject "Jonathan Ong, jongleberry".

## What I checked

I recomputed each figure from this clone with `git log` and `git blame`. I matched the applicant by name across every address I found (`<email:d29caa5c>`, `<email:4132b6bd>`, `<email:266aea16>`), which is the most generous reading of "several email addresses".

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| HEAD `249bbdc72da2` | `249bbdc72da24ae44076afd716349d2089b31c4c` | Matches |
| 131 non-merge commits in the window (7 Nov 2013 to 22 Aug 2015) | 131 | Matches |
| **103 of 131 commits are the applicant's (79%)** | **63 of 131 (48%)**: 60 under the "Jonathan Ong" name plus 3 as "jongleberry", across all three addresses | **Overstated by about 40 commits** |
| Total surviving lines at HEAD: 1,417 across 19 files | 1,417 across 19 files | Matches |
| **1,197 surviving lines are the applicant's (84%)** | **697 (49%)**. The next largest are TJ Holowaychuk at about 551 and Will Conant at 36. | **Overstated by about 500 lines** |
| "Higher of the two", so survival beats commit share | Commit share is 48% and line share is 49%, so the two are about equal | Narrative does not hold |
| Tenure ends 22 Aug 2015 | The applicant's last non-merge commit is 9 Jul 2015. The 22 Aug 2015 commit is a merge of someone else's PR (#238), made under the noreply address. | Misleading. Merging a PR is not authoring work. |
| Rank 1 of 42 authors by surviving lines | Applicant is first by surviving lines, but there are 60 distinct author emails, not 42. | First place holds, the author count does not |
| 4 identities, 3 merged | Only 3 addresses exist in the history, so at most 2 are "other" addresses | Does not match this clone |
| 23 tags in tenure, 17 by the author | 36 tags in the whole repo. I did not recompute the in-window split. | Not verified |
| 24 active weeks of 94 | I got 24 weeks from a rough pass, and a date-parsing step was shaky | Plausible, not fully verified |
| Other figures (files authored, test-file share, language mix, commit size, 0 AI trailers) | Not recomputed. They depend on the same attribution and are suspect until the attribution is explained. | Not verified |

## What this means

- The report is real in shape. It was clearly produced by a tool run on this repo's history, and the repo-level facts line up.
- The applicant-specific numbers are inflated. The two figures that matter most, commit share and surviving lines, are both too high. The report's own "In plain language" paragraph repeats them.
- The identity merging cannot account for it. With all of the applicant's addresses combined I get 63 commits and 697 lines. The report's 103 and 1,197 cannot be reproduced.
- The real contribution is still substantial. The applicant is the top author by surviving lines, with about 49% of the code at HEAD (697 of 1,417 lines). That is a legitimate claim, and the report overshoots it.
- The report's integrity hash only shows the file is self-consistent. It does not show the numbers are right, and whoever holds the file could have changed figures and recomputed the hash.

## What I did not do

- I did not run `npx workproof verify`. It downloads and executes third-party code from the npm registry, and the report was supplied by the applicant. The hand recomputation above does the same job. If you want the tool's output, run it in a sandbox.
- I only had the `master` branch in this clone, with no other remotes. If the applicant's commits live in a fork or on branches you do not have, fetch them. That is the only way the report could be right, and the applicant would have to say which addresses and refs they used.

## Suggested next step

Ask the applicant for the exact `--author` identities or addresses they merged, and the command they ran. Then compare against the figures above (63 commits, 697 lines).

You can also quote the real numbers back to them, which are about 63 of 131 commits (48%) and about 49% of surviving lines.
