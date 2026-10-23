I wrote `Q1-effort-report.md`. For Q1 2026 (Istanbul time) it reports **5 commits** and **5 h 56 min** of active time. The report has no code and no prompts. It gives only the totals, the method and the exclusions.

**Commits:** The five are `d5aa227`, `1ce7cd9`, `a0db32d`, `c7880a7` and `3953977`. I left out the two Renovate bot commits and the upstream commits by other people. I also left out `65cdcc2` (priority queue). It is dated 1 April 01:30 Istanbul time, so it falls in Q2, even though it is still 31 March in UTC.

**Hours:**
- **Included:** I used sessions A, B, E and G. A and B overlap on 10 Feb, so I merged them to avoid counting that time twice.
- **Breaks:** I counted time between consecutive messages unless the gap was over 30 minutes. That dropped a 50-minute break in session A.
- **Cutoff:** Session E runs past midnight, so I cut it off at the end of 31 March.
- **Excluded:**
  - `session-A (1).jsonl` is a byte-identical copy of session A.
  - `session-D-client` is from the client-site project, not p-limit.
  - `session-F` is dated 2 April.

Session B contains what looks like an API key and a personal email in a prompt. Neither is in the report, but you may want to rotate that key.

The hours only cover time in Claude sessions, so any offline work isn't counted. The report says so.