# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.json` and `.md`) are a `workproof` 0.7.0 report for HEAD `249bbdc`. That matches this clone's HEAD. The applicant's own contribution figures do not reproduce, though. They are inflated well beyond what a multi-email merge explains.

## What I checked
I used plain `git` against this clone. I did not run `npx workproof verify`, because that would download and execute third-party code.

| Claim in report | What the clone shows |
|---|---|
| HEAD `249bbdc72da2` | Matches. |
| 131 non-merge commits in the tenure window | Matches (131). |
| **103 of 131 commits are the applicant's (79%)** | **Not reproduced.** Every address that plausibly belongs to the applicant gives 63: `<email:d29caa5c>` 56, `<email:4132b6bd>` 4 (as "Jonathan Ong") plus 1 (as "jongleberry"), and `<email:266aea16>` 2. Merging extra addresses cannot reach 103. The window's other authors are TJ Holowaychuk (19, a different person), pana (3) and others. |
| Tenure ends 2015-08-22 (654 days) | **Not reproduced.** The applicant's last commit is 2015-07-09. The only commit in Aug 2015 is by Takayuki Sakai (2015-08-02). The start date, 2013-11-07, matches. |
| **1,197 of 1,417 surviving lines are theirs (84%), rank 1** | **Not reproduced.** The 1,417 total matches `git blame -w -M` at HEAD. The split does not: "Jonathan Ong" has 696 lines and "jongleberry" has 1, about 49%. TJ Holowaychuk has 551 (39%). The report's 1,197 is roughly 500 lines too high. |
| 42 contributors | Not checked. `git log` shows 60 distinct author emails over all history. The report may count a different window. |

## Why the identity merge doesn't explain it
- The report hides the email addresses (`emails: false`), so it can't be checked against specific addresses. It says it merged 3 other addresses by name match and GitHub-login match.
- The addresses I can find that match "Jonathan Ong" or "jongleberry" account for 63 commits and about 697 surviving lines. The report's 103 and 1,197 are far above that.
- A fourth identity is reported (`count: 4`). If it isn't the applicant's, it would explain the inflation. For example, TJ Holowaychuk's 19 window commits plus the 63 gives 82, which still isn't 103. I can't tell which address was merged in, so I can't say how it happened.

## What does hold up
- The commit and line totals (131 and 1,417), the HEAD hash, and the tenure start date are real.
- The applicant is a genuine and substantial contributor. I count about 63 commits and about half the surviving lines, and they are the top author by surviving lines.
- Authorship by name in this repo does not look fabricated. The report's totals are just attributed too generously.

## Other cautions
- The report's integrity hash only proves the file wasn't edited after generation. It doesn't prove the inputs were honest. The applicant controlled the merge settings and the run, and the JSON can be regenerated with any numbers.
- Commit dates and names are self-declared in git and can be forged. They are also not what's in dispute here.

## Suggested next step
Ask the applicant for the exact email addresses they merged. Then run `git log --author=<each>` yourself. Accept only addresses that are actually theirs, such as ones they can show are on their GitHub account. By my count the defensible figures are about 63 commits, tenure ending July 2015, and roughly 49% of surviving lines.
