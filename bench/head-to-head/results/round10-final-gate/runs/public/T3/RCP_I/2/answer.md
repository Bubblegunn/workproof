I wrote the verdict to `verdict.md`. Don't trust the report's headline numbers. Merging email addresses doesn't explain them.

The `/receipts` skill builds a usage report from my own session transcripts, so it couldn't check someone else's files. I skipped its transcript-mining steps and checked the report against this clone's git history instead.

- **Commits:** the report claims 103. Merging all of Jonathan Ong's addresses gives 63 non-merge commits, or 76 if merge commits count. The main address alone has 56. Author, committer and merge-inclusive counts never reach 103, and I couldn't reproduce that number any way I tried.
- **Surviving lines:** the report claims 1,197 of 1,417 (84%). `git blame` gives about 697 (about 49%). Jonathan Ong is still the top surviving author, but the lead is much smaller than claimed.
- **Share of commits:** the report says 79%, and I get 63 of 131, about 48%.
- **Tenure end date:** 2015-08-22 is a merge commit. The last non-merge authored commit is 2015-07-09.
- **Figures that match:** the 131 commits in the window, 1,417 total lines, 34 files touched, 31 test-file changes, about 1,274 lines added, 42 authors and 19 files.

Because those figures match, the file looks like it came from a real run of the tool on this repo. The two headline numbers were then either altered or computed on a different history. The report's own integrity hash only shows the file wasn't edited after it was generated, not that the figures are right.

I didn't run `npx workproof verify`, since that would execute downloaded code from the applicant. The subject has the same name as the git user configured in your clone, so check that the applicant really is that identity.

I suggest asking the applicant for the exact command, flags and email addresses they used. A genuine explanation would have to reproduce about 63 commits and about 697 surviving lines.