I'm wrapping up. I've written `verdict.md`, and this is the summary.

**Verdict: don't trust the headline numbers.** I recomputed them with plain `git` in your clone. I didn't run `npx workproof verify`, because that would download and run third-party code.

| Claim | What your clone shows |
|---|---|
| 103 of 131 commits (79%) | **63 of 131 (48%)**, after merging all four of Jonathan Ong's addresses |
| 1,197 of 1,417 surviving lines (84%) | **About 697 of 1,416 (49%)** |
| Tenure ends 2015-08-22 | Their last commit is **2015-07-09**, and nothing near 2015-08-22 exists |
| Rank 1 by commits | Over the whole history TJ Holowaychuk has 90 commits and they have 63. They lead only inside the tenure window. |
| 42 authors | 59 |

Active weeks (24), tags (23), files (19) and the window total (131) do match. The figures that make the person look dominant are the ones that are inflated.

Merging email addresses can't explain the gap. All their addresses together give 63 commits, not 103.

The report's integrity hash only shows the file wasn't edited after generation. It doesn't show the numbers are right.

The report's identity ("Jonathan Ong / jongleberry") is also the git identity in your clone and the repo's real maintainer. Check that it's actually your applicant. If it isn't, the report credits someone else's work.

I didn't recheck the files-authored, commit-size, test-share or language figures.

Next step: ask the applicant for the exact email addresses they used, then recompute with those. If those addresses can't produce 103 commits, treat the report as unreliable.

The GapToGrowth skill is for tailoring a job seeker's own resume, so most of its workflow didn't apply here and I skipped its onboarding steps.