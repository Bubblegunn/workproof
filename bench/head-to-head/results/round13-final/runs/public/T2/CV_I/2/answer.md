I saved four bullets to `cv-bullets.md`. I wrote them from git history, so they describe what the commits show and nothing more.

This repo is `co`, the generator-based async control flow library. The git user, Jonathan Ong, has 73 commits in it, so I attributed commits under that name to you.

- **Maintainer:** 73 commits from 2013 to 2015, and releases 4.3.0 through 4.6.0.
- **Promises:** moved the library to a Promise-based implementation, swapped Q for Bluebird, and wrapped every result in `Promise.resolve()`.
- **Fixes:** fixed "Generator is already running" errors when no callback is passed, and added support for regular functions that throw.
- **Features:** added yielding of objects with preserved key ordering, and a clearer error when a non-yieldable value is yielded.

- **Left out:** I dropped the `co(gen, ...args)` feature from an earlier draft. Jorge Bucaran wrote it, and you only released it as 4.6.0.
- **Left out:** I also dropped a claim that tests covered the fixes, because I only confirmed a test for the "already running" bug.
- **No metrics:** the repo has no usage numbers. If you know the npm download counts, GitHub stars or dependent packages, I can add one. Otherwise the bullets stay as plain descriptions.
- **Your role:** the bullets say "Maintained", but TJ Holowaychuk wrote most of the code (145 commits). If you were a co-owner or lead maintainer, say so and I'll adjust the wording.