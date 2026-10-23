# Claude Code usage and impact report

**Period:** 25 Sep – 22 Oct 2026 (28 days, with activity logged on every day)
**Source:** local Claude Code session logs (40 sessions)

## Usage at a glance

| Metric | Value |
|---|---|
| Sessions | 40 |
| Prompts I wrote | 64 |
| Assistant turns | 417 |
| Output tokens | ~131K |
| Fresh input tokens | ~375K |
| Cache writes / cache reads | ~1.7M / ~12.5M |
| File edits and writes | 100 (70 edits, 30 new or rewritten files) |
| File reads | 70 |
| Web fetches and searches | 221 (119 fetches, 102 searches) |
| Shell commands | 26 (19 test runs, 7 `gh pr create`) |

## Where the time went

| Area | Sessions | Prompts | What it was |
|---|---|---|---|
| Research (API pricing, rate limits) | 17 | 34 | Web research only; 221 fetches and searches, no code touched |
| acme-api | 9 | 12 | Refunds, orders, auth and schema code, plus tests. 45 edits and 18 writes, in `refunds.ts`, `schema.sql`, `orders.ts`, `auth.ts` and `orders.test.ts` |
| acme-web | 5 | 7 | Cart state, checkout page and `PriceTag` component |
| billing-service | 3 | 4 | Invoice rendering and rates (`render.go`, `rates.go`) |
| infra-terraform | 2 | 3 | `main.tf` and `variables.tf` |
| Notes and docs | 4 | 4 | Drafted the migration plan and the on-call runbook |

About 43% of sessions were research. The rest was engineering work across four repos, and 60% of that was in acme-api.

## What it delivered

The logs record what Claude did, not what shipped. The items below are work Claude touched that lines up with commits in the repos. I couldn't tie any commit to a specific session.

- **acme-api:** partial-refund handling, a `refund_reason` schema column, signing-key rotation, and test coverage for partial refunds.
- **acme-web:** a fix for stale cart totals and an inline tax breakdown at checkout.
- **billing-service:** invoice rounding to minor units.
- **infra-terraform:** a prod RDS instance class bump.
- **Docs:** a migration plan and an on-call runbook.
- **Pull requests:** Claude ran `gh pr create` 7 times, across all four repos.

## Caveats

- Session logs don't store tool output, so I can't confirm that tests passed or that the PRs were created and merged. Check GitHub for the PR count.
- The logs have no model name or pricing, so I can't give a cost. Token counts are in the table above.
- Commit dates in the repos are inconsistent. The "initial" commits are dated 23 Oct, after the later work, so I haven't used them for timing.
- Not measured: time saved. The logs show activity, not how long the work would have taken by hand.
- I haven't added a number for that, since any figure would be a guess. If you want one, add your own estimate, for example hours saved per PR.
