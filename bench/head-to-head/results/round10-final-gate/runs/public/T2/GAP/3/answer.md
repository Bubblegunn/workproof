I saved four bullets to `cv-bullets.md`. This is the `co` repo (`tj/co`), where you have 72 of 299 commits, from Nov 2013 to Jul 2015.

- Co-maintained `co`, a widely used open-source JavaScript library for generator-based async control flow, contributing 70+ commits (2013–2015) and cutting releases from v3.1 through v4.6.
- Led the v4.0 rewrite onto a native Promise-based core, replacing the callback/thunk implementation and cutting `index.js` to about 240 lines. I rewrote the test suite to match and added coverage reporting through Istanbul and Travis CI.
- Extended the API across the 4.x releases: `co.wrap()`, regular functions that return promises or throw, forwarding extra arguments into generators, and ES5-transpiler-friendly generator detection. I kept the changes backward compatible and documented each in the changelog.
- Maintained the project: reviewed and merged community pull requests, trimmed dependencies (swapped Q for Bluebird, then dropped it), removed outdated benchmarks and examples, and set up CI across Node.js and io.js.

I built these from the git log, `History.md` and the commit diffs, so please check a few points before you paste them:
- "Widely used" is my wording. The repo doesn't contain download or star counts, so add real numbers if you have them.
- I'm not certain "co-maintained" matches your role. The history shows TJ Holowaychuk as the main author, and your commits are mostly releases and the v4 work. Change it to "maintainer" or "core contributor" if that fits better.
- I treated the Promise rewrite and the later 4.x features as yours, since the commits are under your name. I didn't check how much of that was your own design versus others' ideas.
- The commit messages say "update deps, use bluebird instead of q" and "remove unnused request dependency". I took "then dropped it" for Bluebird from the v4 move to native Promises, and I didn't check that commit.