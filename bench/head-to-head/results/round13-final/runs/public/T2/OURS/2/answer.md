I saved four bullets to `cv-bullets.md`. Their source tags are in `cv-bullets.sources.md`, which is a separate file because the tags shouldn't go into your CV.

The bullets say you maintained an open-source JavaScript library for asynchronous code (the repo is `co`). They cover these four things:
1. **Contribution:** you made 63 commits between 2013 and 2015, alongside the original author and about 60 other contributors.
2. **Bug fixes:** you fixed the "generator is already running" failure and a bug with callbacks passed as arguments, and added tests for both.
3. **Features:** you added support for plain objects and for ordinary functions that may throw, and made results always come back as promises.
4. **Project upkeep:** you added test coverage and testing on newer runtimes, improved error messages, removed stale benchmarks, examples and dependencies, and prepared releases.

The 63 comes from `npx workproof figures` and counts non-merge commits by author date. That count includes your version-bump commits. The check of the file against the computed figures found the 63 matches. The "about 60" contributors is the tool's "distinct authors" figure of 60. I left out the 13 merge commits and the one revert.

Please confirm: I counted commits from three addresses as yours. Your configured address (`<email:d29caa5c>`) accounts for 56. The other 7 come from `<email:4132b6bd>` and the `jonathanong` GitHub noreply address, which I included because the name and login match yours. The email on your account (`<email:38e0984e>`) matches no commits in this repo. If those 7 aren't yours, the count drops to 56.

I wrote no numbers for lines of code, since the bullets don't use them.