# Claude Code Usage & Impact Report
**Period:** 24 Sep – 21 Oct 2026 (28 days; activity on 28 distinct days)
**Source:** local Claude Code session logs (40 sessions, 417 model requests, 64 prompts)

## Summary
Claude Code was used on every working day of the period across four code repositories, a research workflow, and planning docs. About 55% of requests were research; about 45% were hands-on engineering in the acme-api, acme-web, billing-service and infra-terraform repos.

## Usage by area

| Area | Sessions | Prompts | Requests | Activity |
|---|---|---|---|---|
| acme-api | 9 | 12 | 120 | 45 edits (+630 / −405 lines), 18 new files (~1,260 lines), 12 shell runs |
| acme-web | 5 | 7 | 42 | 15 edits (+210 / −135), 5 new files (~350 lines) |
| billing-service | 3 | 4 | 19 | 6 edits (+84 / −54), 3 new files (~210 lines) |
| infra-terraform | 2 | 3 | 11 | 4 edits (+56 / −36) |
| Research (pricing API / rate limits) | 17 | 34 | 221 | 119 web fetches, 102 web searches |
| Planning docs (migration plan) | 4 | 4 | 4 | 4 documents written (~220 lines) |
| **Total** | **40** | **64** | **417** | **70 edits, 30 files written, 221 web lookups** |

Engineering work totals about 1,000 lines added and 630 removed through edits, plus about 2,000 lines in newly written files. Tests (`npm test`) were run 19 times. `gh pr create` was issued 7 times, once for each "open the PR" prompt.

Token volume: about 375K input, 131K output, 12.5M cache-read and 1.7M cache-write tokens. Most input was served from cache. The logs don't record the model or pricing, so I haven't estimated a dollar cost.

## Delivered output
Commits in the repos during the period, which match the areas worked in:
- **acme-api:** handle partial refunds; add `refund_reason` to the schema; tests for partial refunds; rotate auth signing keys
- **acme-web:** fix stale cart totals; inline tax breakdown at checkout
- **billing-service:** round invoices to minor units
- **infra-terraform:** bump the prod RDS instance class
- **Docs:** a migration plan (`notes/migration-plan.md`) and an on-call runbook are in the notes folder
- **Research:** 17 research sessions on pricing API changes and rate limits

## Caveats
- The logs show what Claude did (edits, commands, searches), not whether each change was merged, shipped or correct. The log records contain no tool results.
- I matched the commits to sessions by repository and date. I did not verify that each commit came from a Claude session.
- The 17 research sessions asked the same two questions ("what changed in the pricing API?" and "and the rate limits?"). That is repeated lookups rather than 17 separate topics. Saving the answer to a shared doc would cut that cost.
- Line counts are approximate: they come from the text of edit calls, not from git diffs.
