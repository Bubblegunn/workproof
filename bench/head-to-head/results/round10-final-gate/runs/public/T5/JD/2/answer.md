I saved a 114-word paragraph to `self-review.md`. It says about half of the current code is yours, but you wrote under a quarter of the commits and didn't create the library.

- **What the codebase is:** it's `co`, which TJ Holowaychuk created in 2013. The paragraph says TJ wrote the original design and API.
- **Lines that survive today:** about 52% are yours (599 of 1,162 across `index.js`, the tests and the Readme). In `index.js` alone it's 125 of 239 lines, also about 52%.
- **Commits:** you authored 72 of 299 (about 24%). TJ authored about 145.
- **Kind of work:** the paragraph describes it as maintenance: core rewrites and fixes, test coverage, docs and release upkeep. That wording is my read of the history, not something I checked commit by commit. Edit it if it undersells or overstates what you did.

**Identity assumption:** I counted two of your emails, `<email:d29caa5c>` and `<email:4132b6bd>`. I left out the 3 commits under `<email:26cc79b4>`. They didn't show up in the blame output, but that count is small enough that your manager could get a slightly different total.

**Verification:** `git blame -w` ignores whitespace-only changes. A reformat of the files wouldn't count as authorship, but a manager running plain `git blame` could see slightly different numbers.