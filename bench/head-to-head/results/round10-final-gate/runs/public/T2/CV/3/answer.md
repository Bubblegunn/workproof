I'm wrapping up. I just corrected a release count in the bullets, and I'm about to give you the summary.

I saved four bullets to `cv-bullets.md`. They're based on the `co` repo's git history, `History.md` and the code:

1. **Creator and maintainer of `co`.** It's an open-source generator-based async control-flow library, with 70+ commits and 30+ releases since 2013.
2. **v4.0 redesign.** I describe it as making the API Promise-based, so `co()` returns a Promise instead of a thunk.
3. **Feature work through v4.6.** This covers `co.wrap()`, support for plain functions that return promises or throw, argument passing into generators, and detection that works with ES5 transpilers.
4. **Maintenance.** This covers the memory leak fix (#180), Travis CI and coverage setup, cleanup of old examples and dependencies, and merging community PRs.

My first draft said "100+ releases". I checked and found 36 tags and 30 changelog entries, so I changed it to "30+".

Check two things before you paste:
- **Authorship.** `git shortlog` printed nothing, so I couldn't confirm who wrote what. Your name is on the version-bump and API commits. I didn't check whether you wrote the individual features, so bullet 3 may overclaim.
- **Numbers.** I left out download counts and stars because I can't verify them from the repo. If you have them, adding them would make the bullets stronger.