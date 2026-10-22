# Claude Code Usage and Impact Report

**Period:** 24 Sep 2026 – 21 Oct 2026 (the full span of the session logs on this machine)
**Source:** local Claude Code session logs (40 sessions, 481 logged events)

## Summary

I used Claude Code on all 28 days of the period, across 40 sessions. 19 sessions were feature work in four engineering repos, and 7 pull requests were opened from them. Another 17 sessions were API and pricing research. 4 sessions were migration-plan drafting.

## Usage

| Area | Sessions | What it was |
|---|---|---|
| acme-api | 9 | Feature work: reads, edits and new files, tests run, PRs opened |
| acme-web | 5 | Feature work, PRs opened |
| billing-service | 3 | Feature work, PR opened |
| infra-terraform | 2 | Infrastructure changes, PR opened |
| notes | 4 | Drafting the migration plan |
| Research (outside any repo) | 17 | Pricing API changes and rate limits: 119 page fetches, 102 web searches |
| **Total** | **40** | |

Model requests: 417. Tokens (new requests, de-duplicated):
- Input: about 375K
- Output: about 131K
- Cache writes: about 1.67M
- Cache reads: about 12.5M

## Output (what the logs show)

- 70 file edits: about 980 lines added and 630 removed
- 30 new files written, about 2,040 lines. This includes the migration-plan notes.
- 19 `npm test` runs
- 7 `gh pr create` commands: 3 in acme-api, 2 in acme-web, 1 in billing-service, 1 in infra-terraform

## Impact

- **Engineering delivery:** the code changes above are spread across the API, web, billing and infrastructure repos, which means Claude Code was used across the stack.
- **Planning:** 4 sessions went into drafting the migration plan.
- **Research:** 17 of 40 sessions were quick investigations of pricing API changes and rate limits. These were done with search and fetch tools.

## Limits of this data

- The logs record activity, not outcomes. They don't show whether the PRs were merged, whether tests passed, or how long the work would have taken without Claude Code. Merge status and review turnaround are in GitHub, and those figures would back up the impact claims.
- The logs don't record the model used, so I haven't estimated cost.
- Line counts are taken from edit and write calls. They are an approximation of code volume, not a measure of quality.
