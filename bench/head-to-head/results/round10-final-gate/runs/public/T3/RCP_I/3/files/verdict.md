# Verdict: do not trust the headline numbers in `received/`

**The files were not made by anyone whose work we can see here, and the key figures don't reproduce.**
They are a `workproof 0.7.0` report (`.md` plus `.json`) for this repo at HEAD `249bbdc`. HEAD, the file count (19) and total surviving lines (1,417) match the clone. The two figures that make the case for the applicant do not match. The multi-email explanation is not supported.

## What I checked (recomputed with git in this clone)

| Claim in report | Report | Recomputed | Result |
|---|---|---|---|
| HEAD / files alive / total blamed lines | 249bbdc / 19 / 1,417 | same | match |
| Non-merge commits in tenure window (2013-11-07 to 2015-08-22) | 131 | 131 | match |
| **Subject's commits in window** | **103 (78.6%)** | **63 (48.1%)** with every "Jonathan Ong" and "jongleberry" address (56 + 4 + 2 + 1) | **does not match** |
| **Surviving lines (`git blame -w -M`)** | **1,197 of 1,417 (84.5%)** | **~697 of 1,417 (~49%)** for the same names | **does not match** |
| Tenure end | 2015-08-22 | The subject's last commit is 2015-07-09. No commit by anyone is dated 2015-08-22. | does not match |
| Rank by surviving lines | 1 | The subject is #1 at ~697, then TJ Holowaychuk at 551 | plausible but overstated |
| Files touched / active weeks / tags in window | 34 / 24 / 23 | 34 / 24 / 23 | match |

The gaps are about 40 commits and exactly 500 lines. They are too large to be rounding or tool-version noise.

## The "several email addresses" explanation

- The report hides the addresses (`"emails": []`), so a reader can't see which were merged.
- It says three extra identities were merged by loose rules: "same name on another address", "GitHub login matches", "address name matches your GitHub login".
- Counting every address in the clone under the names Jonathan Ong and jongleberry gives only 63 commits and ~697 lines. Merging addresses does not reach 103 or 1,197. The extra ~40 commits and ~500 lines must come from other people's work, or the report was edited.
- Merging aliases is legitimate, but the merge here is unverifiable and gives numbers far above the real ones.

## Another problem

The identities in the report, "Jonathan Ong, jongleberry", are your own name and the repo's real author. Nothing in the files says who the applicant is. These commits are authored by whoever owns that git identity. Ask the applicant which addresses are theirs and check them against `git log --format='%aN <%aE>'`. If the report was generated against someone else's identity, it is not their work.

## Integrity hash

The report says `npx workproof verify` recomputes the numbers. I did not run it, because it would fetch and execute code from the network. The embedded hash only proves the file is internally consistent, not that the tool was run honestly. Hand-editing figures would be caught only if the hash were rechecked, so I recomputed from git instead.

## What I could not determine

- Whether the applicant edited the files or the tool was run with different inputs (a different repo state, extra identities, or `--no-merge-identities` off).
- Which exact identities produced 103 and 1,197.

## Recommendation

Ignore the 103 commits (79%), the 1,197 lines (84%) and the "2015-08-22" tenure end. Ask the applicant for the exact email addresses they claim, then check each one against `git log`. The defensible numbers for these identities are about 63 commits (48%) and ~49% of surviving lines.
