I saved four bullets to `cv-bullets.md`. I wrote them from the git log only, and I didn't read the diffs. Please check each claim against what you remember before you paste them in.

The repo is `co`, the generator-based async control-flow library. The log has 72 commits under the name "Jonathan Ong", from Nov 2013 to Jul 2015. They cover releases 3.0.1 through 4.6.0.

- **Metrics:** I used no performance or adoption numbers because the repo doesn't contain any. The only figures are the commit count and the date range.
- **Dependencies:** The Q → Bluebird → native promises claim comes from the commit messages "use bluebird instead of q" and "switch to a promise implementation". The "removed unused dependencies" claim comes from "remove unnused request dependency".
- **Ownership:** The last bullet says "maintained", which I took from your release commits and the merged pull requests. If you were a contributor and not a maintainer, change that wording.

If you can give me numbers, I can strengthen the bullets. Useful ones are weekly npm downloads, how many projects depend on `co`, and the performance difference after the promise rewrite.