# Claude Code usage and impact report
Period: 25 Sep – 22 Oct 2026 (source: local session logs, 40 sessions)

## Usage at a glance
| | |
|---|---|
| Sessions | 40 across 6 working directories, active on 28 distinct days |
| Prompts sent | 64 |
| Tool calls | 417 (221 web searches/fetches; 196 file and shell actions: 70 Read, 70 Edit, 30 Write, 26 Bash) |
| Tokens | 375k fresh input, 131k output, 1.67M cache writes, 12.5M cache reads |

## Where the time went
| Area | Sessions | Prompts | What the logs show |
|---|---|---|---|
| acme-api | 9 | 12 | Edited 5 files: `orders.ts`, `refunds.ts`, `auth.ts`, `schema.sql`, `orders.test.ts` (45 edits, 18 new-file writes, 12 shell runs) |
| acme-web | 5 | 7 | Edited 3 files: cart state, checkout page, `PriceTag` component |
| billing-service | 3 | 4 | Edited invoice rendering and tax rates (Go) |
| infra-terraform | 2 | 3 | Edited prod `main.tf` and the RDS module variables |
| notes / docs | 4 | 4 | Wrote a migration plan and an on-call runbook |
| Web research (home dir) | 17 | 34 | 221 searches and page fetches on pricing-API changes and rate limits; the largest share of tokens (about half) |

## What it delivered
- **Code changes across 4 repos**: 14 distinct files touched (12 code/config, 2 docs), with the most work (9 sessions) on the orders/refunds API. The most recent commits in the repo here (partial refunds, `refund_reason` schema, signing-key rotation, refund tests) match that work, but I haven't confirmed they came from these sessions.
- **Two documents**: a migration plan and an on-call runbook.
- **Research**: repeated vendor pricing and rate-limit lookups, run as a recurring task.

## Caveats
- The logs record activity, not outcomes. They don't show whether changes were merged, shipped, or passed review, or how much time was saved. The 7 "open the PR" prompts show PRs were requested, not that they were created.
- Tokens are summed from the logs without converting to cost.
- Before sending, it would strengthen the report to add PR links, merged-PR counts, or an estimate of hours saved for the refunds work.
