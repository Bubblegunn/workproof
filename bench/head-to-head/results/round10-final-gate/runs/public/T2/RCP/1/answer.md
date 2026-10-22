I saved four bullets to `cv-bullets.md`. They're based on your 72 commits (of about 299) in this repo, the `co` generator control-flow library, from 2013 to 2015.

They cover:
- Maintaining the library through 20+ releases.
- The v4 move to a Promise-based API.
- The expanded yieldable types and `co.wrap()`.
- Bug fixes, test coverage and merging community pull requests.

I didn't measure everything in the bullets:
- **Release count:** "20+ tagged releases" is my estimate from the version-bump commits and `History.md`. Check it against `git tag`.
- **Library description:** "~240-line core" and "11 test files" come from `index.js` and `test/`.
- **Authorship:** I matched commits by your git name, so if you also committed under another name or email, some work may be missing.
- **Scope:** I called you the maintainer and the lead on v4 because your commits include the version bumps and the promise rewrite. If the project was shared with others, adjust the wording to match.