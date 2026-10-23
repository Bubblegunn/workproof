# Verdict: do not trust the headline numbers

The two files in `received/` are the same report in two formats. They claim to come from workproof 0.7.0 and name Jonathan Ong. The report was generated against this repository: the HEAD commit matches (`249bbdc`) and the 1,417 total surviving lines match.

Several of its main figures do not match the history in this clone, and they all overstate the applicant's work. The explanation offered, "committed under several email addresses", does not account for the gap.

## What I checked

I used read-only git on this clone. I did not run the report's own `verify` command. Its hash only proves the file was not edited after it was made, not that the numbers are right.

**Addresses.** In this repository the same person appears under three addresses: `<email:d29caa5c>`, `<email:4132b6bd>` and a `<email:266aea16>` address. They are counted here because the names and logins match (rule only, please confirm). Together they have 63 non-merge commits: 56, 4 and 3 respectively.

| Claim in report | What the history shows | Result |
|---|---|---|
| 103 commits by the applicant | 63 commits across all three addresses | **Overstated by 40** |
| 103 of 131 commits in the period (78.6%) | 63 of 131 (48.1%). The 131 total is correct. | **Overstated** |
| 1,197 of 1,417 surviving lines (84.5%) | 697 of 1,417 (49.2%). Line blame for the same three addresses. | **Overstated by 500** |
| Period ends 22 Aug 2015, 654 days | Their last commit is 9 Jul 2015, about 609 days. No commit by anyone falls on 22 Aug 2015. | **Wrong end date** |
| Start 7 Nov 2013 | Matches. | Holds |
| 24 active weeks | 24 | Holds |
| 23 release tags in period | 23 | Holds |
| 31 of 43 test-file changes | 31 of 43 | Holds |
| 34 files touched, median commit size 11 lines, 90th percentile 96 | Matches my recount. | Holds |
| 0 documents created | 0 | Holds |
| 10 of 19 files authored | I could not reproduce it. The applicant added 8 of the 19 files by my rough count. The report's method is a weighted score, so this is not a clear contradiction. | Unconfirmed |

## Why this is not the multiple-email effect

- The applicant says they committed under several addresses, so the real count should be higher than a plain count. I included every address I could link to them and still get 63, not 103.
- The report contradicts itself. Its own "survival by cohort" table adds up to 104 + 550 + 43 = 697 lines. That matches my count exactly, but the headline says 1,197. A genuine report would not disagree with itself by exactly 500 lines.
- The extra 40 commits and 500 lines cannot come from any address in this history that belongs to the applicant. The other large contributors are different people: TJ Holowaychuk has 19 commits in the period and is the second-largest line owner at 551, and Jorge Bucaran has 3.
- The report hides the addresses it merged ("emails": false), so there is no way to see which extra identities it counted. It says it merged "3 other addresses" for four identities. I can only find three addresses in total.
- The report cannot be taken as raw tool output. The wrong end date and the unmatched totals suggest the figures were edited, or produced from a different history.

## What is supported

- They did real work here: 63 commits and about 697 surviving lines (49%) between 7 Nov 2013 and 9 Jul 2015. They are the largest single contributor in the period, with 63 of 131 commits against 19 for the next person.
- Their share of tests is real: 31 of 43 test-file changes in the period.

## Limits

- Commit history shows what was committed, by whom and when. It does not show time spent or quality.
- If the applicant really used other addresses, I can't see them in this repository. They should name them. Any address that is missing from this history can be checked, but one that points to someone else's commits cannot count as theirs.

## Suggested next step

Ask the applicant for the exact email addresses they say they used. Ask them to regenerate the report themselves, with the address list shown, from a fresh clone of this repository. Until the 103 commits, the 1,197 lines and the 22 Aug end date are explained, I would treat the report as unreliable. Use the figures above instead.
