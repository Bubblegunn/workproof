# Verdict: do not trust the report's headline numbers

The report (`received/workproof-report.{md,json}`, "workproof 0.7.0") describes a real repository. The repo's HEAD, tenure dates, 131-commit total and 1,417-line total all match this clone. Its two headline figures are inflated, though, and the multiple-email explanation does not account for the gap.

## What I checked (recomputed from this clone with git)

| Claim in report | What the clone shows |
|---|---|
| HEAD `249bbdc72da2` | Matches. |
| 131 non-merge commits in the tenure window (2013-11-07 to 2015-08-22) | Matches (131). |
| **103 of 131 commits are the subject's (78.6%)** | **63 of 131 (48%)**, counting every address that could plausibly be them: "Jonathan Ong" on two addresses plus "jongleberry" on two addresses. 60 are "Jonathan Ong" and 3 are "jongleberry". Whole history: 63 to 65 of 230 non-merge commits, depending on whether the unrelated "Yazhong Liu" and "AutoSponge" commits that match my loose grep are counted. |
| **1,197 of 1,417 surviving lines are theirs (84.5%)** | The total of 1,417 matches. Full `git blame -w -M` gives **696 lines (49%)** to "Jonathan Ong". TJ Holowaychuk has 551. |
| Survival by cohort: 104 + 550 + 43 lines | Sums to 697, which matches my 696. It contradicts the report's own 1,197 headline. |
| 19 files at HEAD | Matches. |
| 42 authors, rank 1 | Rank 1 by surviving lines is plausible (696 vs 551). The author count is off: the clone has about 59 distinct author names and 60 emails. |
| Merged identities (3 extra addresses) | Consistent with the history. The extra addresses are real and add only a handful of commits (4 + 3). Merging them cannot turn about 63 commits into 103. |

## Findings

1. **Commit count is overstated by about 40 commits (103 claimed, 63 found).** Even with every plausible alias included, 103 is out of reach.
2. **Surviving lines are overstated by about 500 (1,197 claimed, 696 found).** The report's own cohort table (697 lines) contradicts its headline, so the file was edited or generated inconsistently. A real tool run would not produce that mismatch.
3. **The integrity hash does not protect you.** The hash is a plain sha256 over the report's own contents. Anyone who edits the numbers can recompute it. The "fingerprint" is keyed with a secret only the sender holds. The report's claim that it "will not match if a number was edited" holds only if you run the verifier on a trusted clone, and the figures fail that comparison.
4. **The report does not name the applicant.** It lists identities "Jonathan Ong, jongleberry" with emails hidden (`emails: false`). Those are the names of the repo's real maintainer, and also the git user name on this machine. Ask the applicant which emails are theirs. Don't assume the report refers to them.
5. **The multiple-email explanation does not hold.** The extra addresses add very little. Most of the "Jonathan Ong" work sits on one address, `<email:d29caa5c>` (56 commits).

## Not done

- I did not run `npx workproof verify`. The package isn't installed, and I chose not to download and run unvetted code from the network for this. You can run it yourself in a sandbox if you want the tool's own verdict. My manual recomputation already shows the mismatch.
- I did not check whether the applicant controls any of these addresses. That needs the applicant to name their emails, or proof such as a signed commit or GitHub account.

## Recommendation

Treat both files as unreliable. At most the real figures support this: a legitimate contributor under that name has about 63 commits and about 49% of surviving lines. That is only relevant if the applicant is that person. Ask them for their exact commit emails or GitHub username, then check those against `git shortlog -sne`.
