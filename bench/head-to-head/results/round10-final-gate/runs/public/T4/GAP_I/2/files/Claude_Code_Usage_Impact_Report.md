# Claude Code Usage and Impact Report

Period: 24 Sep 2026 to 21 Oct 2026 (4 weeks)
Source: local Claude Code session logs on this machine (40 sessions, 481 log entries)

## Summary

Over the month I ran 40 Claude Code sessions. 23 were hands-on engineering work across four repos, and that work produced 7 pull requests. 17 were research sessions on pricing and API questions. The logs show what was done. They do not show whether the PRs were merged or what the research led to.

## Usage

| Area | Sessions | Prompts | Model turns |
|---|---|---|---|
| acme-api | 9 | 12 | 120 |
| acme-web | 5 | 7 | 42 |
| billing-service | 3 | 4 | 19 |
| infra-terraform | 2 | 3 | 11 |
| notes (planning docs) | 4 | 4 | 4 |
| Research (web search and fetch) | 17 | 34 | 221 |
| **Total** | **40** | **64** | **417** |

Tokens: about 375K input, 131K output, 1.67M cache writes and 12.5M cache reads. Cache reads are discounted context re-use, not new work.

## What it delivered

Engineering (23 sessions)
- 7 PRs opened with `gh pr create`: acme-api 3, acme-web 2, billing-service 1, infra-terraform 1.
- About 3,000 lines added and 630 removed across 14 distinct files. Counts come from edit and write calls, so they overstate net change where a file was edited more than once. About 63% of the added lines are in acme-api.
- 26 test runs (`npm test`) alongside the changes. Roughly one run per session, 3 to 4 in some.
- Every code session followed the same pattern: read, edit, run tests, open PR.

Planning (4 sessions)
- 4 "draft the migration plan" sessions, each producing a written document (about 220 lines in total across 2 files). These were weekly (29 Sep, 5 Oct, 12 Oct, 16 Oct).

Research (17 sessions)
- 17 sessions asking "what changed in the pricing API?" and "and the rate limits?". They used 119 web fetches and 102 web searches.
- They used about half of the month's output tokens (68K of 131K) and about half of total token volume, and produced no files or code.
- The questions repeat almost word for word across the month. Roughly every 2 to 3 days I re-asked the same thing.

## Caveats

- The logs record requests, not results. I can't confirm that tests passed, that the PRs were merged or what review feedback they got. Merge status is on GitHub.
- I can't see the content of the research answers, so I can't say what decisions they fed into.
- Line counts are an activity measure, not a measure of value.
- Sample here is this machine only. Sessions on other machines or in the web app are not included.

## Observations

- The research is the largest cost with the least visible output. If the pricing and rate-limit answers are needed regularly, saving them once in a notes file or a scheduled check would cut most of those 17 sessions.
- Shipping is steady, with a PR roughly every 4 days, concentrated in acme-api.

## To strengthen this before sending

Add outcomes the logs can't show: PRs merged (`gh pr list --author @me --state merged --search "created:>=2026-09-24"`), the decisions the pricing research informed, and whether the migration plan was adopted.
