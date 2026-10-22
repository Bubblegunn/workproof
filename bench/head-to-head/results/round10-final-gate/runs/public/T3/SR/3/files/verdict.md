# Verdict: do not trust the report's headline numbers

The files in `./received` (`workproof-report.md` and `.json`) claim 103 of 131 commits and 1,197 of 1,417 surviving lines for "Jonathan Ong, jongleberry". The repository does not support those two figures. The identity-merging explanation does not account for the gap either.

## What I checked
I recomputed figures with plain `git` in the clone at HEAD `249bbdc`. I did not run `npx workproof verify`, because it would execute third-party code driven by the received files. I also did not try the hash or fingerprint. The fingerprint is keyed, and I don't have the key.

| Claim in report | Recomputed from the repo | Result |
|---|---|---|
| HEAD `249bbdc72da2` | HEAD is `249bbdc72da24ae44076afd716349d2089b31c4c` | matches |
| 131 non-merge commits in the window 2013-11-07 to 2015-08-22 | 131 | matches |
| Tenure starts 2013-11-07 | The earliest commit by that author is 2013-11-07 | matches |
| Tenure ends 2015-08-22 | The author's latest commit is 2015-07-09. The window end appears to come from some other commit date. | not confirmed |
| 19 files, 1,417 attributed lines | 19 tracked files, 1,417 blamed lines | matches |
| **103 of 131 commits (79%)** | **63 of 131 (48%)** | **false** |
| **1,197 of 1,417 surviving lines (84.5%)** | **696 of 1,417 (49.1%)** (`git blame -w -M`, all files) | **false** |
| By-year lines: 104 + 550 + 43 | Sum is 697, which matches my blame count of 696 (±1) | contradicts the report's own 1,197 |

## Why the identity merging can't explain it
The report says it merged 3 other addresses, 4 identities in total. I counted every commit whose author name or email matches Jonathan Ong, jongleberry or jonathanong. The counts are:
- `<email:d29caa5c>`: 56
- `<email:4132b6bd>`, as "Jonathan Ong": 4
- `<email:266aea16>`, as "jongleberry": 2
- `<email:4132b6bd>`, as "jongleberry": 1

That is 63 commits in total. The count is the same inside the window and over the full history. No grouping of these addresses gets to 103.

For lines, the report's own by-year breakdown sums to about 697. The headline of 1,197 is 500 higher than that, and 500 is a suspiciously round amount. The report contradicts itself, which points to an edited number rather than a different counting method. The report says a changed number would fail verification, but the breakdown and the headline disagree inside the file.

Other points:
- "Ranks 1 of 42 authors by commit count" holds only inside the window. Over the full history TJ Holowaychuk has 90 non-merge commits against about 63 for this identity. I counted 59 distinct author names, not 42.
- The 31 of 43 test-file changes, 34 files touched and cadence figures were not checked individually. They are likely derived from the same inflated 103-commit count.

## Bigger question: whose work is this?
The identities in the report ("Jonathan Ong", "jongleberry") are the repository's own maintainer, whose name is also your configured git user. Those commits are not the applicant's unless the applicant is that person. The applicant said they committed under several email addresses. None of the addresses I found belong to anyone other than the maintainer. I found no other contributor name that the merge could plausibly be hiding.

## Conclusion
- The scaffolding is accurate: HEAD, total commits, file count and total lines all match.
- The two numbers that make the case, commit share (79%) and surviving-line share (84%), are overstated. The real values are 48% and 49%.
- Treat the report as not credible as evidence.
- Ask the applicant which identities they actually used, and ask them to name specific commits or PRs. You can check those by hash in this repo.
