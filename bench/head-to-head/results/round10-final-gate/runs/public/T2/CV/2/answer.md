I saved four bullets to `cv-bullets.md`. I based them on your 72 commits in this repo's git history (2013–2015), plus the History file.

- Co-authored and maintained **co**, a widely used open-source generator-based control-flow library for Node.js and the browser, contributing 72 commits across 2013–2015 and shipping releases from v3.0 through v4.6.
- Led the v4 redesign from thunk/callback-based to promise-based, so `co()` returns a native Promise. This was a breaking API change that served as a stepping stone toward async/await, and I wrote the migration docs.
- Extended the library's core features: yielding objects, arrays and regular functions, preserving key ordering, passing context and arguments through, and clearer errors when a non-yieldable value is yielded.
- Fixed hard concurrency bugs, including "Generator is already running" errors and callback-handling edge cases. Added regression and recursion tests, and set up Travis CI, coverage reporting and `io.js` test runs. Also removed unused dependencies and stale benchmarks, and triaged and merged community pull requests.

- **Authorship:** Most commits in the repo are by TJ Holowaychuk (145 vs. your 72). I wrote "co-authored and maintained" rather than "created". Change it if your role was different.
- **Claims to check:** "Widely used" comes from the download badge in the Readme, not an actual figure. I didn't add one. If you have the real npm download count, putting it in would make the first bullet stronger.
- **Migration docs:** The Readme has a "Co v4" section explaining the change. The git log doesn't show who wrote it, so check that claim before you paste it.