# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.json` and `.md`) are the same report. It has the format of a `workproof` tool report. Its numbers for the applicant's work do not match this repo. I recomputed them with plain `git` in your clone. I did not run `npx workproof verify`, because that would run unreviewed code from npm.

The applicant's explanation is that they committed under several email addresses. That explains merging a few addresses. It does not explain the size of the gap.

## What matches

- HEAD is `249bbdc72da2...`, the same as your clone.
- The tenure start date, 2013-11-07, matches the first commit from the merged addresses.
- There are 131 non-merge commits by anyone in the claimed window. This matches.
- There are 19 files at HEAD, 1,417 lines are attributed by blame, and 23 tags fall in the tenure window. These all match.
- The merged addresses are plausible: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. They share the name "Jonathan Ong" or "jongleberry".

## What does not match

| Claim | Report | Recomputed from git |
|---|---|---|
| Applicant's commits in window | 103 of 131 (79%) | **63 of 131 (48%)**. This is the same 63 across all history, using all three addresses. |
| Surviving lines at HEAD | 1,197 of 1,417 (84%) | **697 of 1,417 (49%)**. By address: 585 gmail, 111 me@jongleberry, 1 noreply. |
| Tenure end | 2015-08-22 | The last commit from the merged addresses on a non-merge commit is 2015-07-09. The 2015-08-22 commit is a `<email:04f7e37e>` commit that also appears in the log. |

- **Commits:** the report's 103 is about 40 more than the 63 I found.
- **Surviving lines:** the report's 1,197 is about 500 more than the 697 I found. TJ Holowaychuk alone has 551 surviving lines (39%), and the report implies the applicant out-survives everyone. Of the 1,417 attributed lines, 1,197 for the applicant would leave only 220 for the 36 other blame authors. TJ alone has 551.
- **Author count and rank:** the report says 42 authors and that the applicant ranks 1st by surviving lines. I counted 60 distinct author emails over non-merge history and 37 in blame. On my recount the applicant is plausibly first, but with about 49% of the lines, not 84%.

Both inflated figures (103 and 1,197) are too large for the stated identity set. The report says it merged 3 other addresses ("same name on another address", "GitHub login matches", "address name matches your GitHub login"). Even with every plausible Jonathan address merged, I get 63 and 697. Reaching the report's figures would require crediting someone else's commits to the applicant. The tool's "same name on another address" rule may have swept in other people's addresses. The emails are hidden in the report (`"emails": false`), so you can't see which addresses were merged.

## Other points

- The report's integrity hash (`d54f0828...`) only shows the file was not edited after generation. It does not show that the figures are right. A tool run with a wrong or over-broad identity configuration would produce a self-consistent report.
- The report is anonymized. The repo is named `F1`, and paths and emails are hidden. This is the tool's default and is not suspicious by itself. But it means the claim can't be checked without the applicant telling you which addresses they used.
- The report's narrative says "their work survived everything written since better than the count of changes suggests". On my recount the surviving-line share (49%) is about the same as the commit share (48%), so that claim is not supported either.

## Caveats on my recount

- I counted non-merge commits by author email, using `git log --no-merges`.
- I counted surviving lines with `git blame --line-porcelain -w -M` per file at HEAD, the same options the report lists.
- I did not try to reproduce the other figures: DOA file authorship (10 of 19 files), directory ownership, test-change share, commit size and so on. They depend on the same inflated identity set, so I would not rely on them either.

## What I would do

1. Ask the applicant for the exact list of email addresses they claim, and for the command they ran (including any `--email` or identity-merge flags).
2. Compare that list with the addresses above. Only these three are plausibly theirs.
3. Treat the work as roughly 63 commits and about 700 surviving lines of the 1,417, not 103 commits and 1,197 lines. That is still a real contribution to this repo, but about half of what they presented.
4. Confirm with the applicant, or by running `workproof` yourself in a sandbox, that the name-matching merge did not credit other people's addresses to them.
