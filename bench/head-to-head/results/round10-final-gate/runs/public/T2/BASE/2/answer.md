I saved four bullets to `cv-bullets.md`. I based them on the 73 commits under your name (Jonathan Ong) in this repo, `co`, a generator-based control-flow library. Those commits run from Nov 2013 to Jul 2015.

1. **Maintainer:** co-maintained a widely used library, with 70+ commits and releases through v4.6.0.
2. **v4.0.0 rewrite:** moved the library from thunks and callbacks to a promise-based core. The change touched 15 files, adding about 390 lines and removing about 630.
3. **Reliability and developer experience:** plain functions that throw now reject as promises, key order is preserved when yielding objects, results are always wrapped in `Promise.resolve()`, and yielding a non-yieldable value gives a clear error.
4. **Tooling and releases:** added coverage reporting, Travis CI (including io.js) and README badges. Also removed stale benchmarks, examples and dependencies, and shipped the 4.x releases.

I haven't verified two details, so please check them before you paste the bullets in. The "widely used" claim in bullet 1 comes from the project's public profile, not from anything in the repo. And bullet 2 describes the effect of the rewrite as a simpler API and a path toward `async/await`, based on the README's own wording.

I can also adjust the tone, shorten the bullets, or add numbers such as npm downloads if you have them.