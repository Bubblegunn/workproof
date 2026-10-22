I wrote the verdict to `verdict.md`: don't trust the report. Several headline numbers don't match the repo, and every error flatters the subject.

I ran git against your clone. HEAD (`249bbdc`), the 19 tracked files, the 1,417 total lines and the 131 commits in the window all match the report. The subject's own numbers don't:

- **Commits:** The report says 103 of 131 (79%). Merging every address it names (Jonathan Ong and jongleberry, 4 addresses in all) gives **63** commits, about 48%.
- **Surviving lines:** The report says 1,197 of 1,417 (84%). `git blame` gives **697** (49%). The report's own cohort table (104 + 550 + 43) also sums to 697, so it contradicts itself.
- **Last commit:** The report says 2015-08-22. The subject's last commit is 2015-07-09.
- **Author count:** The report says 42 authors. I count 60 distinct author emails.
- **Email explanation:** It doesn't cover the gap. Only four addresses or names in the history could be this person's, and they total 63 commits.

The "integrity" hash is just a SHA-256 of the report's own contents, so anyone who edits the numbers can recompute it. It proves nothing. I didn't run `npx workproof verify`, because it would execute downloaded code.

I did not check every figure. The cadence, files-authored and test-share figures rest on the same identity matching, so I wouldn't trust them either.

The report never names the applicant. The identities it counts are Jonathan Ong and jongleberry, which is also your configured git user. Please check whether that is the person who applied.

Next step: ask the applicant which names and emails they say are theirs. Then check those against `git shortlog -sne`.