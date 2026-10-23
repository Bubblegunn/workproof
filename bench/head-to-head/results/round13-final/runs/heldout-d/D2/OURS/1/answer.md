Here are the figures from the repo history, counting your commits by the date you wrote them. They cover the 15 commits under jun.park@helios.example dated 2025.

| | |
|---|---|
| First commit in 2025 | 2025-01-06 ("Add NO_COLOR docs helper") |
| Last commit in 2025 | 2025-12-01 ("Add accessibility notes") |
| Months of 2025 with activity | 12 of 12 (Jan–Dec each have at least one commit) |
| Gaps longer than 30 days | 3 |

**The three gaps over 30 days:**
- 2025-04-09 to 2025-05-14: 35 days
- 2025-05-14 to 2025-06-23: 40 days
- 2025-08-11 to 2025-09-22: 42 days

Every other gap is 29 days or shorter. The longest of those is 29 days, from 2025-10-06 to 2025-11-04.

**Things to check before this goes to your lawyer:**
- **"Continuously" is stronger than the history shows.** Commits show activity in every month, but they don't show hours worked. I'd suggest wording like "made contributions in each month of 2025, with commits on 15 dates between January 6 and December 1." That wording is accurate, and an officer can check it.
- **One commit has two dates.** "Add 256-color helper" has an author date of 2025-05-14 but was committed on 2025-09-20, which looks like a rebase or replay. I used the author date. If an officer counted by commit date instead, the May 14 entry would move to September. The gaps would then be 2025-04-09 to 2025-06-23 (75 days) and 2025-06-23 to 2025-07-15 (22 days). The Aug–Sep gap would shrink to 29 days, and the months with activity would drop to 11, because May would have no commit. This is the main weak spot in the claim.
- **A future-dated commit is excluded.** The latest commit, e0242e4 ("Fix typo in README example"), has an author and committer date of 2027-03-15. That is after today (2026-10-23), so it isn't a 2025 commit and I left it out. If the date is a clock error, you may want to fix it or tell your lawyer.
- **Scope.** This covers only the commits under your stated git identity, with 0 merge commits, reverts or whitespace-only commits among them. Dana Whitfield also has commits at helios.example. I treated them as a different person and did not count them.

If you want, I can write the short statement itself in plain language for the lawyer. I can also produce a verifiable report with `workproof`.