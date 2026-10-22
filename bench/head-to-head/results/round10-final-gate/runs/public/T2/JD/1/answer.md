I saved four bullets to `cv-bullets.md`. They're built from the git history: 72 commits under your name from 2013 to 2015, plus `History.md` and the diffs for the v4.0 rewrite.

- Co-maintained `co`, a widely used open-source generator-based control-flow library for Node.js and the browser, with 72 commits from 2013 to 2015.
- Led the v4.0 rewrite from a thunk/callback API to a promise-based one. The change touched 15 files (about 390 lines added, 630 removed). It moved the library toward the async/await model that later became standard JavaScript.
- Shipped the 4.x feature releases. These added support for plain functions that return promises or throw, forwarding extra arguments into generators, `co.wrap()` exposing the underlying generator function, and detection of generator functions that works with ES5 transpilers.
- Fixed a memory leak (#180), dropped support for Node versions before 0.12, and added test coverage, CI badges and iojs testing. I also reviewed and merged community pull requests.

Two things to check before you paste them in:
- **Impact claim:** "Widely used" is my characterisation. The repo doesn't hold download or star numbers, so swap in a real figure if you have one.
- **Release attribution:** I couldn't tell which `History.md` releases you wrote yourself and which you only merged. Change "Shipped" to "Contributed to" if some weren't yours.