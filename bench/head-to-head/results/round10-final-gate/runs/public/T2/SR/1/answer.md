I saved four bullets to `cv-bullets.md`. I wrote them from the git history, where you have 72 commits on `co` from 2013 to 2015, and from the README, `package.json` and test directory.

- Maintained and released **co**, a widely used generator-based async control-flow library for Node.js and the browser, shipping versions 3.x through 4.6.0 across ~72 commits from 2013 to 2015.
- Led the v4 redesign from a thunk/callback API to a promise-based one (`co()` returns a Promise), positioning the library as a stepping stone to native `async/await` and removing the legacy benchmarks and examples.
- Fixed concurrency and correctness bugs, including "Generator is already running" errors, callback handling in generators, and regular functions that throw. Added `yield` support for objects, arrays and promises, plus context and argument passthrough.
- Built the project's quality and compatibility tooling: a test suite covering arrays, objects, promises, thunks, recursion and wrapped functions, with Travis CI, test coverage reporting, and io.js support. Also reviewed and merged community pull requests.

I can't see download numbers from the repo. "Widely used" is my wording, so check it or replace it with a real figure. I also assumed you led the v4 redesign, since the history shows you making those commits. Adjust that bullet if it was a shared effort.