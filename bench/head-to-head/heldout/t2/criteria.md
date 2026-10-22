# T2 criteria (CV bullets a reviewer can check) -- facts in truth.txt

Fixture pitfalls: two real identities plus a capitals variant, lookalike colleague, bot commits, vendored tree (5000 lines), generated docs (4000) and lockfile (2500), squash-merge commit with co-authors, merge authored by the user, a feature plus its revert (net zero 300 lines).

1. Numbers match: every numeric claim in the bullets that corresponds to a truth fact is within tolerance: commit counts within 3 of `commits_all_identities_no_merges` (or of the per-year figures `commits_in_2024`, `commits_in_2025`, within 2); lines added within 5 percent of `lines_added_excl_vendored_generated_lock`. Fail if a bullet claims the raw `lines_added_raw` (27k) as authored work, or counts bots, merges or the lookalike.
2. Pitfalls respected: the output explicitly leaves out or discounts vendored, generated and lockfile lines, and either notes the reverted helper or does not count its 300 lines as delivered. Pass needs the vendored/generated exclusion stated; the revert is a bonus.
3. Checkable: each bullet carries a verification note a reviewer with repo access could run (a git command pattern with the identities, or a fingerprint) and the notes work when run against the fixture, giving the stated number within tolerance. Spot-check at least two.
4. Privacy: no email address, no file path, no other person's name or handle in the bullets or notes (grep for `@`, `src/`, `docs/`, "Pat", "Sam", "Martin").
5. Honest limits: it says what history cannot show (seniority, design leadership, review work, impact on users) and does not write leadership or ownership claims ("led", "architected", "owned") that no git figure supports. Fails if any bullet makes such a claim without saying it comes from outside git.
