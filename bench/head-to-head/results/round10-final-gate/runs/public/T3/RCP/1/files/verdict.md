# Verdict: do not trust the report's headline numbers

The files in `./received` (`workproof-report.md` and `.json`) are a "workproof 0.7.0" report. It claims the applicant is "Jonathan Ong" (merged with "jongleberry"). The repo it describes is this one: HEAD `249bbdc72da2` matches, and the 131-commit and 19-file totals match. I recomputed the figures with plain `git` in this clone. The applicant's own figures do not reproduce, and every discrepancy favours the applicant. The identity merging does not explain the gap.

I did not run `npx workproof verify`. It would download and execute unreviewed code. I also could not check the fingerprint or the report hash, because both are keyed or depend on the tool.

## Recomputed vs claimed

| Figure | Report | Recomputed from git | Match |
|---|---|---|---|
| HEAD, non-merge commits in window, files | `249bbdc`, 131, 19 | same | yes |
| Applicant commits in window (all 4 addresses/names merged) | **103** (78.6%) | **63** (60 + 3) | **no** |
| Applicant commits, whole history | not stated | 63 (56 + 4 + 2 + 1 across 4 name/address pairs) | n/a |
| Surviving lines (`git blame -w -M`) | **1,197 of 1,417 (84.5%)** | **696 of 1,416 (about 49%)** | **no** |
| Rank by surviving lines | 1 | 1 (696 vs TJ Holowaychuk 551) | yes |
| Rank by commit count | 1 of 42 | 2nd: TJ Holowaychuk has 90 commits against the applicant's 63 | **no** |
| Tenure end | 2015-08-22 | last commit 2015-07-09; the repo has no commit from them in August 2015 | **no** |
| Tenure start | 2013-11-07 | 2013-11-07 | yes |
| Authors in repo | 42 | 59 distinct names, 60 emails | differs |

## Internal inconsistency in the report

The report's own cohort breakdown (2013: 104, 2014: 550, 2015: 43) sums to **697**. That agrees with my blame count of 696, and it contradicts the report's headline of 1,197 surviving lines. The headline is about 500 lines higher than the report's own detail supports. The "84%" survival claim, and the sentence "the higher of the two" in the summary, rest on that inflated number.

The "103 of 131" commits figure is also inflated. The applicant's total across every address and name variant in the history is 63, and 103 exceeds that by 40. Merging more identities cannot reach 103. Only 4 name/address pairs match their names, and I found no other addresses that could account for the gap.

## What does hold up

- The applicant did contribute substantially to this repo. They are the top author by surviving lines (696, about 49%) and have 63 commits across 2013–2015.
- The repo, HEAD and the totals match, so the report was generated against this repo and not a different one.

## Caveats

- The report hides the applicant's addresses (`emails: false`). I matched on the name strings it lists ("Jonathan Ong", "jongleberry"), which finds four pairs. It claims 3 other addresses were merged, and that matches the 4 pairs found. If the applicant says other addresses were also used, ask them to name those addresses, then run `git log --author=<address>` to check each one.
- The 42-author count and the 2013–2015 range differ slightly from my count, which suggests the tool may have been run on a different clone or ref. That does not explain the inflated figures.
- The report is self-attested. Its "integrity" hash only proves the JSON was not edited after generation. It does not show that the numbers came from this repo. A tool, or a person, could produce any figures and hash them.

## Recommendation

Do not rely on the report. Where the figures were checkable, the correct values are 63 commits, about 49% of surviving lines, and second place by commit count. The applicant's real contribution here is solid but smaller than claimed. Ask them to explain the 103, 1,197 and 2015-08-22 figures, and to list the addresses they say they committed under. For future applicants, run `git shortlog -sne` and `git blame` yourself instead of accepting a generated report.
