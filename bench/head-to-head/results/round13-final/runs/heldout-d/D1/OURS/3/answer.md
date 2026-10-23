I wrote `promo-evidence.md` in this folder. It has no code, file names or email addresses. A sources file for you is at `evidence/promo-evidence-sources.md`. I wouldn't hand that one to the committee.

**Headline figures** (1 July to 31 December 2025, by the date each change was authored):
- **Commits:** 9 non-merge commits. 8 are under your work email. 1 is under a second account with your name, which I included (see the question below).
- **Lines written, net:** 283 (383 added, 100 deleted). With only your work email it's 243 net (343 added, 100 deleted).
- **Raw total:** 12,243 net for your work email. I didn't use it because 12,000 of those lines are one machine-generated data file for the docs site. The document mentions the raw figure and says why it's left out.

**Themes in the document:**
- Key rotation, with tests.
- Security hardening of signature comparison.
- Token-expiry metrics and an audit log for signing failures.
- Docs snapshot and release notes.
- A reverted September experiment with a more compact data format.

**Not counted:**
- The November merge commit.
- Maya Chen's two commits.
- The docs typo fix by "Alex Rivero" (different surname).
- The 30 June planning notes, which fall before the window.
- The 5 January 2026 planning commit, which falls after it.

The generated import is still counted as a commit, but its lines are excluded. The experiment's 100 lines are counted as written, and its revert accounts for the 100 deleted.

**Please confirm:**
- **Second account:** I included one commit made under `alex.rivera@users.noreply.github.example` ("Harden signature comparison"). I matched it on the same name only. If it's yours, nothing changes. If not, drop it and use 8 commits and 243 net.
- **"Alex Rivero":** I treated that commit as someone else's. If it's a misspelling of your name, tell me and I'll add it.

The theme counts and the 12,000-line figure are my own tallies from the commit list. The tool has no per-theme or per-commit figures.

To re-check the totals, run `npx workproof figures --author alex.rivera@northwind.example --since 2025-07-01 --until 2025-12-31`.