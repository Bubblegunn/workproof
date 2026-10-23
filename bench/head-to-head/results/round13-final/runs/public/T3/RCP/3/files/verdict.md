# Verdict: do not trust the headline numbers

The two files (`received/workproof-report.md` and `.json`) are a "workproof 0.7.0" report for this repo (HEAD `249bbdc`, which matches my clone). The report is internally inconsistent, and its key figures do not reproduce from git history. The multi-email explanation does not account for the gap.

## What I checked (against the clone, HEAD 249bbdc72da2)

| Claim in report | What the repo shows | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Same | OK |
| 19 files alive | 19 tracked files | OK |
| Identity = "Jonathan Ong" + "jongleberry" (4 addresses) | Matches: 2 `Jonathan Ong` emails plus `jongleberry` entries (incl. a GitHub noreply address) | OK |
| Tenure starts 2013-11-07 | First commit under these names is 2013-11-07 | OK |
| 131 commits in the tenure window | 131 | OK |
| **103 of 131 commits are theirs (79%)** | **63 of 131 (about 48%)** across all merged identities, and the same 63 in the window | **Inflated by 40** |
| **1,197 of 1,417 surviving lines (84%)** | `git blame -w -M` gives about **696 of 1,416 (about 49%)**: 585 under `<email:d29caa5c>` plus 111 under `<email:4132b6bd>`. TJ Holowaychuk has 551. | **Inflated by about 500 lines** |
| Rank 1 by surviving lines | Rank 1 is true, but only narrowly (696 against 551) | Technically true, misleading |
| 42 people wrote code | 60 distinct emails, 59 distinct names | Does not match (see notes) |
| 34 files touched, 31/43 test-file changes, etc. | Not reproduced (see "Not checked") | Unverified |

## The report contradicts itself

The report's own cohort table gives 2013: 104, 2014: 550, 2015: 43 lines. That sums to **697**, which matches my blame count of 696. The headline says **1,197**, exactly 500 more. The by-year breakdown is consistent with reality. The headline "1,197 / 84%" is not consistent with the by-year data in the same file.

## Why the multi-email explanation doesn't hold

The applicant said the numbers are higher than a plain count because they committed under several addresses. I merged every address and name variant (`Jonathan Ong` on both emails, `jongleberry`, the GitHub noreply address). That gives 63 commits and 696 lines. The report's 103 commits and 1,197 lines exceed that by a wide margin. Merging identities also cannot explain a headline that disagrees with the report's own year-by-year numbers.

## Other notes

- The report says the tool recomputes everything with `npx workproof verify`, and its hash is meant to catch edits. I did **not** run that tool. It would mean executing code from an untrusted source's recommendation. The `hash` and `fingerprint` are keyed and can't be checked without the key the tool prints, so they prove nothing here. I checked the claims directly against git instead.
- The "42 people" figure doesn't match anything I could count (60 emails or 59 names). The tool may group differently, so treat this one as unexplained, not as proof of falsification.
- The tenure end date (2015-08-22) is later than the last non-merge commit under these names (2015-07-09). I didn't resolve this. It may come from a merge commit or a different commit type.
- Possible innocent causes: a bug in the tool, a different clone or branch state, or manual edits to the files. I can't tell which from the files alone. The by-year/headline mismatch looks like a hand edit or a tool bug, not a rounding issue.
- The identity in the report is "Jonathan Ong", which is also the git user configured in your clone. Check that the applicant is actually the person behind those commits and not someone borrowing another person's history. The report names no applicant. Ask them to confirm which GitHub account and addresses are theirs, ideally by demonstrating control of one of them.

## Not checked

The footprint, test-file, cadence, tag-count and commit-size figures. They are less consequential than the headline numbers, which already fail.

## Recommendation

Don't rely on this report. The honest figures from the clone are roughly **63 commits and about 696 surviving lines (about 49%)**. That is still a substantial contribution, but it is about half of what the report claims. Ask the applicant to explain the 103 and 1,197 figures and to provide the email list they say they used. Then recompute from the clone.
