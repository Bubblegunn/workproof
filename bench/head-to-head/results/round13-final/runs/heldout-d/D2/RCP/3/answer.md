Here are the figures from `git log`, counting only your commits (Jun Park, jun.park@helios.example), plus two things in the history you should know about before this goes to USCIS.

**Using author dates (the usual git date)**
- **First 2025 commit:** 2025-01-06, "Add NO_COLOR docs helper".
- **Last 2025 commit:** 2025-12-31, "Year-end cleanup of examples".
- **Commits in 2025:** 15 of yours. Dana Whitfield made 2 more, which I excluded.
- **Months with activity:** all 12 months, with at least one commit in each.
- **Gaps longer than 30 days:**
  - 2025-04-09 to 2025-05-14 (35 days)
  - 2025-05-14 to 2025-06-23 (40 days)
  - 2025-08-11 to 2025-09-22 (42 days)
- The longest gap besides those is exactly 30 days (12-01 to 12-31), so it doesn't count. The other gaps are 9 to 29 days.

**Caveats**
1. **One commit has two different dates.** `a45ede1` ("Add 256-color helper") has an author date of 2025-05-14 but a committer date of 2025-09-20. That usually means it was rebased or amended later. If an officer or opposing reviewer went by the committer date, May would have no commits from you, so only 11 months would show activity. The April-to-June gap would also grow to about 75 days. I'd tell your lawyer about this instead of leaving it out. Be ready to explain it, for example "authored in May, rebased in September".
2. **The latest commit has a future date.** `e0242e4` ("Fix typo in README example", your name) is dated 2027-03-15, but today is 2026-10-23. It falls outside 2025, so it doesn't change the numbers above. A future-dated commit does make the timestamps look less reliable, though. You should find out whether it came from a clock error, and fix it if so.
3. **Git dates can be edited.** Anyone can change them, so they're weak evidence on their own. Hosting-platform records (such as GitHub's push and PR timestamps), CI logs, or issue activity would back them up better.

I'd phrase the statement as "commits were made in every calendar month of 2025, with the first on January 6 and the last on December 31". Don't call it "continuous" without qualification, since the gaps above are real. I can draft that wording if you want.