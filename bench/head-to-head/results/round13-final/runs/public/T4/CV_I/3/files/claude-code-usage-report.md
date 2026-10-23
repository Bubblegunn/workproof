# Claude Code usage and impact: 25 Sep – 22 Oct 2026

Source: 40 local session logs, 417 assistant requests, active on 27 of 28 days.

## Usage

| Area | Sessions | Requests | What it did |
|---|---|---|---|
| Research (pricing API / rate limits) | 17 | 221 | 102 web searches and 119 page fetches |
| acme-api | 9 | 120 | Edits to orders, refunds, auth and the DB schema |
| acme-web | 5 | 42 | Edits to checkout, cart state and PriceTag |
| billing-service | 3 | 19 | Edits to invoice rendering and tax rates |
| infra-terraform | 2 | 11 | Edits to the prod and RDS Terraform |
| Planning notes | 4 | 4 | Drafted the migration plan and on-call runbook |
| **Total** | **40** | **417** | |

- **Actions:** 70 file reads, 70 edits, 30 file writes, 19 `npm test` runs, and 7 `gh pr create` calls.
- **Tokens:** about 375K input, 131K output, 1.67M cache writes and 12.5M cache reads.
- **Cost:** not estimated. The logs don't record which model was used, so I can't price it accurately.

## Impact

- **Refunds (acme-api):** partial-refund handling across `orders.ts`, `refunds.ts` and `schema.sql`, with tests. Commits: "orders: handle partial refunds", "schema: add refund_reason", "tests: cover partial refunds".
- **Auth:** signing-key rotation in `auth.ts` (commit "auth: rotate signing keys").
- **Checkout (acme-web):** an inline tax breakdown and a fix for stale cart totals.
- **Billing:** invoice amounts now round to minor units.
- **Infrastructure:** a bump of the production RDS instance class.
- **Docs and research:** a migration plan and an on-call runbook draft, plus a repeated review of pricing API and rate-limit changes.

## Caveats

- The logs record what Claude did, not what happened afterwards. Test pass/fail results, PR merges and time saved aren't in them.
- Matching commits to sessions is by topic and file, so it is approximate. I couldn't confirm which commits came from Claude sessions.
- Commit dates in the repos are unreliable. The "initial" commits are dated after the feature commits, so I haven't quoted dates.
- Before sending, add a measure the logs can't give: merged PRs, tickets closed, or estimated hours saved.
