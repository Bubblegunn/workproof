I wrote `Q1-effort-report.md` in the repo root. For Q1 2026 in Istanbul time it reports 5 commits and 5.8 active hours. It contains only the two numbers and a short method note, with no code or prompts.

I didn't run the skill's miner. It reports commits against Claude's file edits and has no date range or hours calculation. I counted from `git log` and the session timestamps instead.

**Commits (5):** these are your commits dated 21 Jan, 10 Feb, 24 Feb, 12 Mar and 31 Mar 23:10. I left out the two renovate bot commits. I also left out "feat: priority queue", which is dated 1 Apr 01:30 Istanbul time, so it falls in Q2.

**Hours (5.8):** I merged the timestamps from the p-limit sessions and counted only gaps of 30 minutes or less. Overlapping sessions are counted once. Two sessions overlapped on 10 Feb, which is why the total is below the 7.0 h you'd get by adding the sessions separately.

**What I left out:**
- `session-A (1).jsonl`, which is an identical copy of `session-A.jsonl`.
- `session-D-client.jsonl`, which is `client-site` work, not p-limit.
- `session-F`, which is dated 2 April.
- The part of `session-E` after midnight on 31 March, which falls in Q2.

`session-B` has a pasted Stripe test key and a personal email in one of its prompts. I used only its timestamps, and nothing from it is in the report. You may want to scrub that export before sharing the folder.

The hours count only time in Claude sessions, not work you did elsewhere. The report says so.