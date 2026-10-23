I've saved the four bullets to `cv-bullets.md`. The one number in them (56 commits) matches the figures tool.

Your email in this session (<email:38e0984e>) matches no commit author in this repo. I used the repo's git identity, Jonathan Ong <<email:d29caa5c>>, so please confirm that's you. If it isn't, none of this is your work.

I also found two other addresses that look like the same person, but I did not merge them. Please confirm whether they're yours:
- `<email:4132b6bd>`: same name, 5 commits.
- `<email:266aea16>`: matching GitHub login, 2 commits.

If they are, the commit count would be 63, not 56.

The repo is the `co` generator-flow library, and the commits run from Nov 2013 to Jul 2015. I counted authored commits using author dates and left out 12 merge commits. One revert (`5e443cf`, which undid `2a94e82`) is excluded from the bullets, and release version-bump commits aren't counted as work. The bullets name no files or tools, so they should read fine to a non-technical reader.

Source tags (also in `evidence/cv-bullets-sources.md`):
1. **Promise-based core (4.0.0, Nov 2014):** `4d2a63c`, `5007a81`, `e0eebaf`, `b7edf32`.
2. **Reliability fixes:** `cf27103`, `b0d40fe`, `2cf5fe0` ("Generator is already running"), `9d996f2` (functions that throw).
3. **Object support, ordering and error messages:** `f3744c5`, `8446e81`, `2f22986`.
4. **End-to-end maintenance:** the "authored non-merge commits: 56" line in `evidence/figures-primary.txt`.

To re-check the count, run `npx workproof figures --author <email:d29caa5c>`.