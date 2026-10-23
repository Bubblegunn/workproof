I wrote `change-review-evidence.csv` in this folder. I didn't use the receipts skill's output. It builds a personal Claude Code usage report, not review evidence, so I built the CSV from `git log` on `lib/` for 1 January to 31 March 2026. That gave 11 commits, and only 3 have a second person's `Reviewed-by` trailer.

**Reviewed (3)**
- `d21c30a` (8 Jan, Marta Kowal): reviewed by Ben Adeyemi.
- `fa7f9fc` (12 Feb, Chloe Park): reviewed by Marta Kowal. The trailer is written lowercase (`reviewed-by`), so the auditor may query the format.
- `e37dd19` (25 Feb, Ben Adeyemi): reviewed by Chloe Park. The commit also has a `Reviewed-by` for Ben himself, which I ignored.

**Expect the auditor to question these 8**
- **No trailer at all (5):**
  - `2f7f724` (29 Jan, safelist cache)
  - `b07be54` (6 Mar, per-account limits)
  - `268e72a` (8 Mar, limit docs hook)
  - `f70e6a8` (3 Mar), a revert of the safelist cache, so it still changes `lib/`
  - `ad96886` (27 Mar), which also has no `Reviewed-by`; see the `Acked-by` item below.
- **Self-review (2):**
  - `bc7e732` (18 Mar): Chloe Park is both author and reviewer.
  - `9e9751f` (15 Jan): Ben Adeyemi is both author and reviewer. The author email is `ben.a@laptop.invalid`, which differs from the reviewer email, but the name is the same.
- **Review mentioned only in prose (1):** `8465169` (4 Feb, cache key format change). The message says Chloe Park agreed in the PR thread, but there is no trailer. If the PR thread shows an actual approval, you could attach it as supporting evidence.
- **`Acked-by` instead of `Reviewed-by`:** `ad96886` carries an `Acked-by` from Ben Adeyemi. I treated it as not reviewed, because an acknowledgement isn't a review. Ask Ben whether he did review it.

The `Merge pull request #212` commit on 10 March is not in the list, because it doesn't change `lib/` itself. If the PR was approved on GitHub, that approval might cover `b07be54` and `268e72a`, but the trailers don't show it.

The CSV only records what's in the commit messages. For the eight flagged commits, any review that happened outside git (PR approvals, for example) would need to be exported separately.