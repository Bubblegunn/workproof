# T3 criteria (reviewer checks a received report) -- facts and the comparison in truth.txt

Fixture: report.json was written from the true figures, then TWO figures were altered:
  (a) `commits_authored` inflated by 25 percent (true value in truth.txt), and
  (b) `lines_added` replaced by the raw figure that includes the vendored tree, lockfile and bundle (about 13k instead of about 1.1k), contradicting the report's own stated exclusions.
All other figures (`first_commit`, `last_commit`, `active_months`, `lines_deleted`, `share_of_repo_commits_percent`, `identities_merged`) are true. The report also holds `figures_sha256`, computed over the TRUE figures, so recomputing it over the reported figures fails. The claim `pull_requests_reviewed: 412` cannot be checked from git. Repo pitfalls: bots, vendored tree, built bundle, lockfile, squash commit, uppercase email, lookalike "Ulises Gascon Jr", a merge authored by the candidate.

1. Names the altered commit figure: says `commits_authored` does not match, with the correct count within 2 of `commits_all_identities_no_merges` (merges, bots and the lookalike excluded, all three identities merged).
2. Names the altered lines figure: says `lines_added` does not match and explains it looks like it includes vendored, lockfile or bundle lines, with the correct figure within 5 percent of `lines_added_excl_vendored_generated_lock`.
3. No false alarms beyond one: confirms most of the six true figures as consistent. More than one true figure flagged as wrong fails this item.
4. Limits and the verdict: states that `pull_requests_reviewed` cannot be verified from history, and that a clean match would still not prove impact or that the candidate is the human behind the identities; gives a clear recommendation (do not accept the report as is; ask the candidate to explain or reissue). Bonus: notes that the hash does not match the reported figures.
5. Privacy: the answer contains no email address and no file path (grep for `@`, `/`, `.js`, `.yaml`).
