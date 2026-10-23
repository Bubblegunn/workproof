I wrote `Q1-effort-report.md` in the repo root. It reports 5 commits and about 5.9 active hours (356 minutes) for Q1 2026.

I didn't run the receipts miner or produce its HTML receipt. It reads `~/.claude/projects`, not the exports in `agent-sessions/`, and it doesn't give the p-limit-only counts you asked for. I took the timestamps and working directories from the exports directly and left out the message text.

**Commits (5):**
- **Counted:** your commits dated 21 Jan, 10 Feb, 24 Feb, 12 Mar and 31 Mar (23:10 Istanbul).
- **Excluded:** the two renovate bot commits, and "feat: priority queue", which is dated 1 April at 01:30 Istanbul.

**Active time (356 minutes):**
- **20 Jan:** 120 minutes.
- **10 Feb:** 176 minutes. Two sessions overlapped and are counted once. A 50-minute gap, over your 30-minute limit, is excluded.
- **31 Mar:** 60 minutes. The session ran past midnight Istanbul time into April, so I cut it at the end of the quarter.

**Left out:**
- `session-D-client` (the `client-site` project, not p-limit).
- `session-F` (2 April).
- `session-A (1).jsonl`, which is a byte-identical copy of `session-A.jsonl`.

The report states the method and notes that it only covers time in Claude Code sessions, so it understates your total effort. It contains only counts, with no code, prompts or project paths.