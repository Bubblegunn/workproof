I saved four bullets to `cv-bullets.md`. I based them on the git history, where you have 72 commits on `co` from Nov 2013 to Jul 2015.

- Co-maintained **co**, a generator-based control-flow library for Node.js and the browser (72 commits, Nov 2013 – Jul 2015), working alongside the original author on a widely used open-source package.
- Led the **v4.0 rewrite** from a callback/thunk model to a Promise-based core. `co()` now returns a promise, a stepping stone toward `async/await`. I also added test coverage, CI badges and updated docs, and removed outdated examples, benchmarks and build files.
- Added **yieldable object support** and preserved key ordering. I improved the error message when a non-yieldable value is yielded, and made regular functions that throw behave correctly.
- Fixed hard concurrency and error-handling bugs, including "Generator is already running" errors and callback/context passing. I also cut dependencies (replaced Q with Bluebird, then removed unused ones). I shipped 20+ tagged releases (3.0.x → 4.6.0) and extended CI to cover io.js and newer Node versions.

- **Check "widely used":** I couldn't confirm it from the repo, so swap in a download or star count if you have one.
- **Check "co-maintained":** the history shows you with 72 commits against 145 from TJ Holowaychuk, who started the library. Change the wording if that doesn't match your role.
- **Check "20+ releases":** I estimated it from the version-bump commits and didn't count them exactly.