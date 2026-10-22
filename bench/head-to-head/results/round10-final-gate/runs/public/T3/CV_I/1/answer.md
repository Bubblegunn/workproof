No, you can't trust the headline numbers in the report. The multiple-email explanation covers only a small part of the gap. I wrote the full verdict to `verdict.md`.

I recomputed everything from your clone with plain `git`. I did not run `npx workproof verify`, because it would download and run third-party code. The report's HEAD (`249bbdc`) matches your clone, and the identities (Jonathan Ong, jongleberry) are real across three addresses.

| Claim | Recomputed |
|---|---|
| 103 of 131 commits (79%) | **63 of 131 (48%)** |
| 1,197 of 1,417 surviving lines (84%) | **697 of 1,417 (49%)** |

- **Merging addresses:** it only adds 7 commits and 1 line (56 commits on the primary address, 63 with all of them). The extra 40 commits and 500 lines in the report can't come from the email merging.
- **Self-contradictions:** the report's own cohort breakdown (104 + 550 + 43) sums to 697, not 1,197. Its cadence (24 active weeks at 2.6 commits each) implies about 62 commits, not 103. This looks like the headline numbers were edited.
- **Integrity hash:** it's an unkeyed SHA-256 of the contents, so anyone who edits the numbers can recompute it. It proves nothing.
- **Smaller stretches:** the tenure end date is a merge commit rather than the last real commit (2015-07-09), and "files authored" is generous (8 of 19 by first add, 10 claimed).
- **Figures that hold up:** test-file changes (31 of 43), tags, active weeks and the rank 1 by surviving lines. That rank is real, though with a much smaller margin than the report states.

**Identity question:** the credited identity is the repo's long-time maintainer, which is also your local git `user.name`. The report hides the emails. Ask the applicant to name their exact addresses and prove control of one, for example by pushing a commit from that account.

I only checked what git history shows, which says nothing about the quality of the work. I didn't use the cv-builder skills, since there was no resume to tailor or review.