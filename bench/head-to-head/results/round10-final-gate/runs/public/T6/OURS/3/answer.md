Across all three addresses you have **63 commits** and **697 surviving lines**. The surviving lines are 49.2% of the 1,417 lines at HEAD, counted with `git blame -w -M`. Your commits run from 2013-11-07 to 2015-08-22, and everyone else made 131 non-merge commits in that window. I saved this to `mine.md`.

**Addresses counted:**
- `<email:d29caa5c>` is the one in git config.
- `<email:4132b6bd>` was merged because its commits carry the same name, "Jonathan Ong".
- `<email:266aea16>` was merged by a rule that matches GitHub noreply addresses whose login matches your name or config address. The rule can be wrong, but the result is plausible here.

**Checks:** `npx workproof check` passed on schema and hash. `npx workproof verify` recomputed every figure from this repository and they all matched. It did not compare the fingerprint, since I didn't pass a fingerprint key. The report hash is `176163d4…88d9da`.

**Public repo:** this repository looks public, but that doesn't change the counts. They include only the three addresses above.

The `mine` command writes Markdown, while `check` and `verify` need the JSON report. I generated the JSON separately. It is at `/tmp/wp.json.json`, with a Markdown copy at `/tmp/wp.json.md`, and I left both outside the repo. I wrote `mine.md` by hand from the verified figures, and it's in the repo directory.