# Claude Code Usage & Impact Report

**Period:** 24 Sep – 21 Oct 2026 (28 calendar days with activity)
**Source:** local Claude Code session logs (40 sessions)

## Summary

Over the past month I ran 40 sessions and sent 64 prompts. 19 of the sessions were engineering work across four repos, 4 were drafting two planning documents, and 17 were API research. The sessions opened 7 pull requests and ran the test suite 19 times.

## Usage

| Metric | Value |
|---|---|
| Sessions | 40 |
| User prompts | 64 |
| Assistant turns | 417 |
| Output tokens | ~131K |
| Fresh input tokens | ~375K |
| Cache reads / writes | ~12.5M / ~1.7M |

## Where the time went

| Area | Sessions | Prompts | What happened |
|---|---|---|---|
| acme-api | 9 | 12 | 45 edits, 18 new files written, 5 files touched (orders, refunds, auth, schema, orders tests); 3 PRs opened |
| acme-web | 5 | 7 | 15 edits, 5 file writes, 3 files touched (state, PriceTag, page); 2 PRs opened |
| billing-service | 3 | 4 | 6 edits, 3 writes, 2 files (invoice render, rates); 1 PR opened |
| infra-terraform | 2 | 3 | 4 edits, 2 files (main.tf, variables.tf); 1 PR opened |
| notes / docs | 4 | 4 | Drafted a migration plan and an on-call runbook |
| API research | 17 | 34 | 119 web fetches and 102 web searches, on pricing API changes and rate limits |

## Output

- **Code:** 14 distinct files changed across 4 repos, through 70 edits and 30 file writes. That is roughly +3,000 / −630 lines. The count comes from the edit payloads in the logs, so treat it as approximate.
- **Delivery:** 7 PRs opened (`gh pr create`), 19 test runs (`npm test`).
- **Documents:** 2 written, a migration plan and an on-call runbook.
- **Research:** 17 research sessions on the pricing API and rate limits.

## Caveats

- The logs record what was done, not what it led to. They don't show whether the tests passed, whether the PRs were merged, or how long the work would have taken by hand. I haven't claimed any of those. To show outcomes, add PR links and merge status from GitHub.
- Dollar cost isn't included. The logs have no model or pricing data, so any figure would be a guess.
- The research sessions all used the same two prompts ("what changed in the pricing API?" and "and the rate limits?") 17 times each. They look like a repeated or scripted check. That could be a recurring job, or it could be duplicated effort.
