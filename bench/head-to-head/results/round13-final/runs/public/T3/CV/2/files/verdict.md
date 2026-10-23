# Verdict: do not trust the headline numbers

The report (`received/workproof-report.{md,json}`, workproof 0.7.0) is accurate about the repository's overall facts. Its claims about the applicant are inflated. The three figures that matter most don't reproduce from this clone's git history.

## What I checked (against HEAD 249bbdc, 299 commits)

| Claim in report | What the clone shows | Result |
|---|---|---|
| HEAD `249bbdc72da2` | HEAD is `249bbdc72da24ae44076afd716349d2089b31c4c` | Matches |
| 131 non-merge commits in tenure window 2013-11-07 to 2015-08-22 | 131 | Matches |
| 19 files alive at HEAD | 19 | Matches |
| 1,417 surviving lines | 1,416 lines in tracked files | Matches (within 1) |
| 23 release tags in window | 23 | Matches |
| **103 of 131 commits are the applicant's (79%)** | **63** by author name or email: Jonathan Ong (both addresses) plus jongleberry (both) | **Does not match** |
| **1,197 of 1,417 surviving lines (84%)** | `git blame -w -M` gives **696** lines for Jonathan Ong, about 49%. TJ Holowaychuk has 551. | **Does not match** |
| Tenure ends 2015-08-22 | The applicant's last authored commit is 2015-07-09. The only commit after that in the window is 2015-08-02, by someone else. Nothing is dated 2015-08-22. | **Does not match** |
| 42 authors | 44 distinct author emails in the window (60 over all history) | Minor difference |

## Internal inconsistency in the report itself

- The "Survival by cohort" figure is 104 + 550 + 43 = **697** lines. That matches my blame count of 696 and contradicts the report's own headline of 1,197. The cohort breakdown looks genuine and the headline looks edited. The gap is about 500 lines, close to TJ Holowaychuk's 551.
- The report says the headline commit count is 103. The honest count with identity merging is 63. The gap of 40 is unexplained. Merging the committer field (82 commits committed by Jonathan Ong) still doesn't reach 103, and the report's stated method is `--author`.

## About the "several email addresses" explanation

Multiple addresses are real. The history has `<email:d29caa5c>` (56 commits), `<email:4132b6bd>` (4 plus 1 under the jongleberry name) and `<email:266aea16>` (2). That is consistent with the report's "3 other addresses". But I included all of them in my counts and still got 63 commits and 696 lines. Merging addresses can't account for 103 or 1,197.

Many other commits have a *committer* of Jonathan Ong but an author who is someone else (for example Ariel Mashraki, Jorge Bucaran, fengmk2, welefen). They were merged or applied by Jonathan Ong, not written by them. Counting those as the applicant's work would be wrong. Even counting them, the total is 82.

## Caveats

- I did not run `npx workproof verify`. That would download and execute third-party code from npm, and the tool would reuse the report's own methodology. The numbers above come from plain `git log` and `git blame`.
- The JSON `hash` is only an integrity checksum over the figures. It proves nothing if someone recomputed it after editing, and I did not check it.
- The applicant's identity isn't stated in the files beyond the names "Jonathan Ong" and "jongleberry". I assumed those are the people they claim to be. I haven't checked whether those accounts are theirs.

## Bottom line

The commit history does show real, substantial work by Jonathan Ong in this repo: about 63 commits and about 49% of surviving lines, the largest share of any author. The report overstates that to 103 commits (79%) and 84% of lines, and it gives a wrong end date. Treat the file as altered or unreliable. Ask the applicant to explain the differences, or ask them to regenerate the report in front of you from a fresh clone. For your own evaluation, use the numbers you can reproduce yourself: 63 commits and 696 lines.
