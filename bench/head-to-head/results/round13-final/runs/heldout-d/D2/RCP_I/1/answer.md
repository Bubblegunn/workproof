I read the dates from `git log` instead of generating a receipts report, which only measures Claude Code sessions. I counted commits authored by Jun Park (jun.park@helios.example), using author dates in the commit's own timezone.

- **First 2025 commit:** 2025-01-06 (`d5e0201`, "Add NO_COLOR docs helper").
- **Last 2025 commit:** 2025-12-31 (`6fa6eb6`, "Year-end cleanup of examples"). It was made at 21:00 -0800, which is already 2026-01-01 in UTC. A UTC-based tool would put it in 2026, so state the timezone convention.
- **Commit count:** 15 commits on 15 distinct days.
- **Months with activity:** all 12 months of 2025 have at least one commit, with one caveat. May's only commit has an author date of May 14 but a committer date of Sep 20. I explain this below.
- **Gaps longer than 30 days:** there are three, using author dates.
  - Apr 9 to May 14: 35 days.
  - May 14 to Jun 23: 40 days.
  - Aug 11 to Sep 22: 42 days.
  - Dec 1 to Dec 31 is exactly 30 days, so it doesn't count.

**Things to know before this goes to USCIS**
1. **The May commit was rewritten.** `a45ede1` ("Add 256-color helper") was authored 2025-05-14 but committed 2025-09-20, probably by a rebase or amend. An officer who runs `git log --format=fuller` will see both dates. If they go by the committer date, May has no commit by you. The gaps then become Apr 9 to Jun 23 (75 days) and Aug 11 to Sep 20 (40 days). Tell your lawyer about this so the statement doesn't look like it overlooked it.
2. **The history doesn't show continuous work.** It shows a commit every 2–6 weeks. A truthful statement is "made 15 commits across all 12 months of 2025". Don't say "continuous" or "daily". The git history can't support that, and you can't use it to prove the work was your primary activity.
3. **Other people committed here too.** Dana Whitfield made 2 commits in 2025 (May 2 and Aug 25). I excluded them, and they are in the gaps above.
4. **One commit is dated in the future.** `e0242e4` ("Fix typo in README example") is dated 2027-03-15, which is after today (2026-10-23). It is outside 2025, so it doesn't affect these numbers. Check the commit date and your clock settings, because an officer could read it as tampering.
5. **This is a fork of `fatih/color`.** Its history goes back to 2014 under other authors. The statement should say these are your own commits to the repo, not that you created it.

I didn't write the receipts `.md` or `.html` files, since they would contain Claude Code usage stats you didn't ask for. I can run the full receipts report if you want it.