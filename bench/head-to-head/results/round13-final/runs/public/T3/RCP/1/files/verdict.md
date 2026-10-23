# Verdict on received/workproof-report.{md,json}

**Do not trust the headline numbers. The report matches this repo (`co`, HEAD 249bbdc) on the facts that don't favour the applicant and overstates the ones that do. The "multiple email addresses" explanation doesn't account for the gap.**

## What I checked
I recomputed each figure with plain `git` in your clone. I did not run `npx workproof verify`, because that would execute a package supplied by the applicant's tooling.

| Claim | Report | Recomputed | Result |
|---|---|---|---|
| HEAD | 249bbdc72da2 | 249bbdc72da2 | matches |
| Non-merge commits in tenure window (2013-11-07 to 2015-08-22) | 131 | 131 | matches |
| Applicant's tenure dates | 2013-11-07 to 2015-08-22 | first and last commits are on those dates | matches |
| Files alive at HEAD | 19 | 19 | matches |
| Lines attributed by blame | 1,417 | 1,417 | matches |
| **Applicant's commits** | **103 (78.6%)** | **63 (48%)** | **overstated by 40** |
| **Applicant's surviving lines** | **1,197 (84.5%)** | **697 (49%)** | **overstated by 500** |
| "Rank 1 of 42 authors" | 42 authors | 59–60 distinct authors by name or email | doesn't match; rank 1 by commits is wrong (see below) |

Method for the applicant's side: I merged every address that carries their identity. Those are `<email:d29caa5c>` (56 commits), `<email:4132b6bd>` (5) and `<email:266aea16>` (2). That gives 63 non-merge commits, and every one of them falls inside the window. For lines I ran `git blame --line-porcelain -w -M HEAD` on all 19 files and counted lines by author address (`-w -M` are the flags the report says it used). Those three addresses own 697 of the 1,417 lines.

## Why the gap isn't explained by the email story
- I merged all of the applicant's addresses and the totals are still 63 commits and 697 lines. The report's 103 and 1,197 are well above that.
- The report's own cohort table undermines it. Its "Survival by cohort" lists 104 + 550 + 43 = **697** lines, which is my number. The same report headlines 1,197 as the applicant's surviving lines. That internal contradiction suggests the headline was edited or inflated after the figures were computed. The 697 matches git. The 1,197 doesn't.
- 103 of 131 is not reproducible from authorship under any address grouping I tried. The closest figure is committer, not author: 82 commits in the window have "Jonathan Ong" or "jongleberry" as the committer. Those are mostly other people's PRs that the applicant merged, so that isn't authorship either.
- TJ Holowaychuk (the original author, 90 commits all-time, 19 in the window, and 551 surviving lines) is the top committer overall. The report says the applicant "ranks 1" on surviving lines. That may be true on lines (697 vs 551), but the 42-author figure doesn't match the 59–60 I count.
- The report's `emails` field is empty and the tool was run with `--no-paths`. That limits what you can check from the file alone, and it means the identity grouping can't be audited from the report.

## What is true
Even at the real numbers, the applicant is a major contributor to this repo. They have about 63 commits, about 697 surviving lines (the most of any one person), and several years of activity. The honest claim is roughly half the commits and half the surviving lines in their tenure window, not about 80%.

## Other caveats
- The `hash` and "fingerprint" are self-computed over the same figures. They prove the file wasn't altered after generation, not that the figures are right. The report is also not signed.
- `workproof` is third-party tooling run by the applicant. Treat its "verify" instruction as a convenience, not as independent assurance.
- The repo is a public library with a famous original author. Surviving lines and commit counts are weak evidence of individual skill, whichever way they land.

## Suggested next step
Ask the applicant which commits make up their 103, for example with `git log --author=...` output and the addresses used. If they can't produce a list that checks out against `git log`, treat the report as unreliable.
