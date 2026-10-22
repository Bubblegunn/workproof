# Verdict: do not trust the workproof report

The two files in `./received` do not match this repository. The headline numbers are inflated, and merging several email addresses does not explain the gap.

## What I checked

I recomputed the figures with plain `git` on the local clone (HEAD `249bbdc72da2`, the same HEAD the report names). I did not run `npx workproof verify`. That would run code downloaded from the internet on the strength of a file from an applicant.

| Claim in report | What the clone shows | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Same | Matches |
| 131 non-merge commits in the tenure window | 131 | Matches |
| 23 release tags in the window | 23 | Matches |
| 19 files alive at HEAD, ~1,417 lines | 19 files, ~1,416 lines | Matches |
| Tenure starts 2013-11-07 | First commit 2013-11-07 | Matches |
| **Tenure ends 2015-08-22** | Last commit by this person is **2015-07-09**. No commits at all from 2015-08-20 to 2015-08-24. | **Wrong** |
| **103 of 131 commits (79%)** | All their addresses together give **63 of 131 (48%)**. That is 56 from `<email:d29caa5c>`, 5 from `<email:4132b6bd>`, and 2 from the GitHub noreply address. | **Inflated by about 40 commits** |
| **1,197 of 1,417 surviving lines (84%)** | `git blame -w -M` gives **696 of ~1,416 (about 49%)**. TJ Holowaychuk has 551. | **Inflated by about 500 lines** |
| 17 of 23 tags are theirs | Not rechecked | Unchecked |
| 42 authors in the project | 60 distinct author emails over the full history | Not reconciled |
| Report hash `d54f08…` | My quick canonical-JSON hash did not reproduce it. My hash was not a strict RFC 8785 implementation, so this is inconclusive. | Inconclusive |

## Reading

- The denominators (131 commits, 1,417 lines, 19 files, 23 tags) are real. Only the applicant's share of them is overstated.
- The identity-merge explanation does not hold up. The three merged addresses account for 63 commits, not 103. The surplus of about 40 commits is close to TJ Holowaychuk's 90 commits and the others' counts, so other people's work may have been merged into this identity. The rules the report names (same name, GitHub login match, address name matches login) are not enough to explain it, and the report hides the actual email list (`"emails": []`).
- The wrong end date (2015-08-22) is a second figure that does not match the history.
- The report says it was generated on 2026-10-21 and carries an integrity hash. The hash only proves the file was not edited after generation. It does not prove the generator ran on this repo with honest inputs.
- The report names "Jonathan Ong" and `jongleberry`. In this clone those are commit authors who are mostly active in 2013 to 2015. The report alone does not tie the applicant to that identity. Ask them which commit emails are theirs, and compare that with the commit list above.

## What is supported

If the applicant really is this author, the history supports the following. They were the second-largest contributor by commits (63 of 230 non-merge commits overall) and by surviving lines (about 49%, behind no one on lines but ahead of everyone else on commits except TJ). Their work ran from Nov 2013 to Jul 2015. That is real, but well below what the report claims.

## Suggested next steps

1. Ask the applicant for the exact list of emails they say are theirs, and compare it with `git shortlog -sne`.
2. Ask them to explain the 103 commit count and the 2015-08-22 end date.
3. Judge them on the verified figures above, not the report's.

Caveat: I used a quick recomputation with `git log` and `git blame`. I did not reproduce workproof's exact methodology. Small differences are expected, but not a gap of 40 commits and 500 lines.
