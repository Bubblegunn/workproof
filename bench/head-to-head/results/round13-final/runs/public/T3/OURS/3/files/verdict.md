# Verdict on the two received files

**Do not trust the headline numbers. The report overstates the applicant's work.**
The "several email addresses" explanation is real, but it does not account for the gap.

## What the files claim

The files are a generated report (a readable copy and a data copy) for Jonathan Ong. The main claims:

- 103 of the 131 changes in the period are theirs (79%).
- 1,197 of the 1,417 lines still in the project are theirs (84%).
- They worked from 7 November 2013 to 22 August 2015.

## What I found in the local clone

Same project version as the report (it names the same latest change), and the same totals. Those two things are real. The applicant's share is what does not hold up.

| Claim | Report | Recomputed from the clone | Result |
|---|---|---|---|
| Applicant's changes (non-merge) | 103 | **63**, counting every address that plausibly belongs to them | Overstated by 40 |
| Total changes in the period | 131 | 131 | Matches |
| Surviving lines that are theirs | 1,197 (84.5%) | **697 (about 49%)** | Overstated by 500 lines |
| Lines in the project today | 1,417 | 1,417 | Matches |
| Files in the project today | 19 | 19 | Matches |
| Releases (tags) in the period | 23 | 23 | Matches |
| End of tenure | 22 Aug 2015 | Their last real (non-merge) change is 9 Jul 2015; 22 Aug 2015 is a merge of someone else's contribution | Stretched, minor |
| People who wrote code | 42 | 59 distinct author names | Not reproduced |
| Test-file changes | 31 of 43 | 30 of 72 by my cruder filter | Not reproduced, my filter differs |

Findings that matter most:

1. **The change count is inflated by about 65%.** Counting all three address variants that match their name (see below), I get 63 changes, not 103. This is the figure the applicant's own explanation should cover, and it is the stated "several addresses" case. Even with every variant included, 103 is not reachable. The other author on the project (the original maintainer) has 90 changes, so the applicant would not rank as the top contributor by this measure.
2. **The report contradicts itself.** The year-by-year breakdown of surviving lines (104 + 550 + 43) adds up to 697. That equals my own count. The stated total of 1,197 is exactly 500 higher, which looks like a hand-edited number rather than a tool error.
3. **The tamper check could not be completed.** The report carries a fingerprint meant to catch edits. I tried several plausible ways of recomputing it and none matched the stored value. I do not know the tool's exact recipe, so this is inconclusive, not proof of editing. Running the tool's own checker is the proper test (see next steps).

Things that are accurate: project version, total change count, line total, file count, release count, and the cohort-by-year line counts. The forger (or a careless editor) left the true numbers in place and changed the headline ones.

## Who counts as "them"

Included, please confirm: three addresses that share the applicant's name or GitHub login (one personal address, one personal-domain address, and one GitHub no-reply address). These are matched by name rule, not proven to be one person. Including them is the most generous reading for the applicant, and the result is still 63, not 103. The addresses themselves are in the chat, not here.

## Limits of this check

- Git history shows who committed what and when. It does not show time spent, quality, or who really wrote a line if work was committed on someone's behalf.
- The 59 vs 42 authors and the test-file figures are cases where my method differs from the tool's, so treat them as unresolved, not as proven false.
- I did not examine the content of the commits for quality or originality.

## What the applicant's own numbers would support

On the clone: 63 changes over roughly 20 months (Nov 2013 to Jul 2015), about half of the code still in the project, and 22, 28 and 13 changes in 2013, 2014 and 2015. That is a real and substantial contribution, so the honest figures are still a good story. The problem is that they were not the ones reported.

## Next steps

1. Ask the applicant to explain the 103 and 1,197 figures and which addresses they used, then compare with the three above.
2. Run the report tool's own check on the received data file from a clean copy of the repository. It is read-only on the clone but it fetches the tool from the network, so run it somewhere safe.
3. Treat the applicant's other evidence with the same care until this is resolved.
