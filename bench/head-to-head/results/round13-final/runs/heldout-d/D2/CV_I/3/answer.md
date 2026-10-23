Here are the figures for your commits only (author Jun Park, jun.park@helios.example). They come from author dates in `git log`.

**2025 summary**
- **First commit:** January 6, 2025, "Add NO_COLOR docs helper" (`d5e0201`).
- **Last commit:** December 31, 2025, "Year-end cleanup of examples" (`6fa6eb6`).
- **Total:** 15 commits.
- **Months with activity:** 12 of 12. Every month has at least one commit by you.

**Gaps longer than 30 days between your commits**
| From | To | Gap |
|---|---|---|
| Apr 9 | May 14 | 35 days |
| May 14 | Jun 23 | 40 days |
| Aug 11 | Sep 22 | 42 days |

Dec 1 to Dec 31 is exactly 30 days, so it doesn't count as longer than 30. Oct 6 to Nov 4 is 29 days.

Two commits by a colleague, Dana Whitfield (May 2 and Aug 25), fall inside those gaps. I excluded them because they aren't your work. If the statement were about repo activity overall, the Apr 9 to May 14 and Aug 11 to Sep 22 gaps would disappear, and only May 14 to Jun 23 (40 days) would remain.

**Things to flag for your lawyer**
- **Time zones:** The commits carry mixed offsets (+09:00, -08:00, -07:00). Two sit on a boundary. The Dec 31 commit, at 21:00 -08:00, is Jan 1, 2026 in UTC. The Mar 31 commit, at 23:30 -08:00, is Apr 1 in UTC. The month count is 12 either way, but the "last commit" date would read Jan 1, 2026 if converted to UTC. State which convention the statement uses.
- **How strong the evidence is:** Commit timestamps are set by the committer's machine and can be edited. A USCIS officer may give them limited weight unless they are backed by something else, such as a hosted-platform history (for example, GitHub's own record of the pushes) or merged PRs.
- **"Continuously working":** The commit history shows regular contributions, with gaps of up to about six weeks. It doesn't show continuous work, so I'd phrase the claim as "made contributions in every month of 2025." Commits also don't capture work done outside this repo.