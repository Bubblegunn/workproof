# Verdict on received/workproof-report.{json,md}

**Do not trust the headline numbers. Two of the report's figures are inflated and cannot be reproduced from this repository. The rest check out.**

## What I checked

1. **Integrity hash.** `npx workproof verify received/workproof-report.json` reports `schema ok` and `hash ok`. This only shows the JSON is internally consistent. It does not show the numbers are true, because anyone can edit a figure and recompute the hash. The `.md` file is a rendering of the JSON and says the same things.
2. **Same repository.** The report's HEAD is `249bbdc72da2`, which is the HEAD of this clone, so the comparison is fair. The repository fingerprint is keyed, so I could not compare it without the key.
3. **Recomputation.** `verify` re-ran every figure against this clone. Everything matched except two figures:

| Figure | Report says | This repo gives |
|---|---|---|
| Commits in tenure | 103 of 131 (78.6%) | **63 of 131 (48.1%)** |
| Surviving lines | 1,197 of 1,417 (84.5%) | **697 of 1,417 (49.2%)** |

   Tenure, cadence, footprint, commit size, files authored and the per-year survival split all matched. The per-year line split (104 + 550 + 43 = 697) is the same in both and sums to 697, not 1,197.
4. **Whether merging email addresses explains the gap.** The applicant says they committed under several addresses.
   - The author's own addresses in `git log` are `<email:d29caa5c>` (56 commits), `<email:4132b6bd>` (4) and a `jongleberry` GitHub noreply address (2). That gives about 63 commits and about 697 surviving lines (585 + 111 blamed lines), which matches what the tool recomputes.
   - To reach 103 commits and 1,197 lines, the report would need 40 more commits and about 500 more lines from other people's addresses. No set of other addresses gives that:
     - TJ Holowaychuk is the only other author with substantial surviving code (551 lines), but has 90 commits, which is more than 40.
     - Every other author combined has 77 commits and only about 169 surviving lines.
   - The report's own cadence figure (24 active weeks at 2.6 commits per week, about 62) agrees with 63 commits. It contradicts the 103 in the same report.
5. **Plain-language claims.** "Most lasting share is higher than commit share" and "ranks 1 of 42 by surviving lines" depend on the inflated 84% figure. With 697 lines (49%), the author is still top by surviving lines (585 + 111 against TJ's 551), but by a much smaller margin. By commits TJ Holowaychuk has 90, more than the author's 63, so "ranks 1 by commit count" is also doubtful.

## Conclusion

- Address merging is legitimate in principle, but here it does not explain the numbers. The report's claimed commit share and surviving-line share are not reproducible. The most likely explanation is that other people's commits and lines were attributed to the applicant, or the figures were edited and the hash recomputed.
- The report also names the repository's well-known maintainer identity, so ask the applicant for proof they control those addresses.
- Figures that do hold up, as recomputed from this clone: about 63 non-merge commits, about 697 surviving lines (49%), tenure 2013-11-07 to 2015-08-22, 24 active weeks.

## Suggested next step

Ask the applicant to list the exact email addresses they merged, then run `git log --author=<addr>` for each in your clone. You can also ask for their GitHub profile, to compare the commits it shows against this history.

## Limits

I could not compare the repository fingerprint, since that needs the report's key. I did not verify who owns which email address. Git author emails can be set to anything, so a match on an address does not prove who wrote the commit.
