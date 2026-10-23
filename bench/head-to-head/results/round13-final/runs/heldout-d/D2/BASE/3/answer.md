Jun Park's commits in this repo (author date) show activity in all 12 months of 2025, but there are three gaps longer than 30 days. Two things in the history need your attention before the statement goes to a USCIS officer.

**Dates (author date, `jun.park@helios.example`, 15 commits in 2025)**
- **First commit in 2025:** 2025-01-06, "Add NO_COLOR docs helper".
- **Last commit in 2025:** 2025-12-31, "Year-end cleanup of examples".
- **Months with activity:** 12 of 12.

**Gaps longer than 30 days within 2025**
- 2025-04-09 to 2025-05-14: 35 days.
- 2025-05-14 to 2025-06-23: 40 days.
- 2025-08-11 to 2025-09-22: 42 days.

Every other interval is 30 days or shorter, so the history shows roughly one commit every 2–6 weeks. That is regular, but it is not daily work. "Continuously working" is only supportable as "regular contributions throughout 2025."

**Problems to resolve first**
1. **One commit has two different dates.** `a45ede1` "Add 256-color helper" has an author date of 2025-05-14 but a commit date of 2025-09-20. That pattern usually means it was rebased or amended months after it was written. If a reviewer goes by commit date, the April–June gap becomes 75 days (Apr 9 to Jun 23). Author dates are easy to set by hand, so I'd have this commit ready to explain.
2. **The newest commit is dated in the future.** `e0242e4` "Fix typo in README example" is dated 2027-03-15, but today is 2026-10-23. It's outside 2025, so it doesn't change the numbers above. A future-dated commit can look like tampered history to a reviewer, so check why it has that date.

Git dates are self-reported metadata, not independent proof. Your lawyer may want to back the statement with something external, such as GitHub's push or PR timestamps.

The repo has one branch (`main`), it isn't a shallow clone, and I searched all refs. Dana Whitfield also has two 2025 commits, and I left them out because they aren't yours.