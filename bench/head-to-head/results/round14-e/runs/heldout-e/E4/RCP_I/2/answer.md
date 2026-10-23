I wrote `Q1-effort-report.md` in the repo root. It reports **5 commits** and **about 5.8 active hours** (5 h 50 min) for Q1 2026 in Istanbul time. The report has only those two figures, a short method note and caveats, with no code, prompts or project names.

- **Commits:** the five are `d5aa227`, `1ce7cd9`, `a0db32d`, `c7880a7` and `3953977`.
  - **`65cdcc2`:** "feat: priority queue" is dated 01:30 on 1 April Istanbul time, so I counted it as Q2 even though it is still 31 March in UTC.
  - **Bots:** I left out the two renovate bot commits.
- **Hours:** I counted gaps of more than 30 minutes as breaks.
  - **Duplicate export:** `session-A (1).jsonl` repeats `session-A.jsonl`, so I counted it once.
  - **Overlap:** `session-B` runs during `session-A`, so I merged the overlap and counted that time once.
  - **Other project:** `session-D-client` is in a different project (`client-site`), so I excluded it.
  - **Outside Q1:** `session-F` is from April, so I excluded it.
  - **Quarter boundary:** `session-E` runs past midnight on 31 March, so I clipped it at the end of Q1.
- **Hours are a lower bound:** they come from Claude session timestamps, so any p-limit work you did outside those sessions isn't counted. The report says this.

I didn't use the /receipts script's usual report. It doesn't compute hours, it counts commits differently, and its report names projects and spend. Instead I computed both figures directly from `git log` and the session timestamps.

One of the sessions has a pasted API key and a personal email in a prompt. None of that is in the report, but you may want to scrub it before sharing the raw session files with anyone.