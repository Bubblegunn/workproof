# Claude Code usage and impact, 25 Sep – 22 Oct 2026

Source: local Claude Code session logs (40 sessions, 417 assistant turns, 64 prompts). Counts are exact. Impact statements are limited to what the logs and git history show.

## Usage at a glance

| Metric | Value |
|---|---|
| Sessions | 40 over 28 days |
| Prompts I sent | 64 |
| Model turns | 417 |
| Tokens | ~199k fresh input, ~68k output, ~6.6M cache reads, ~0.9M cache writes |
| Tool calls | 417 (Read 70, Edit 70, Write 30, Bash 26, WebFetch 119, WebSearch 102) |

## Where the time went

| Area | Sessions | Turns | What was done |
|---|---|---|---|
| acme-api | 9 | 120 | Partial-refund handling in `orders.ts` and `refunds.ts`; `refund_reason` schema change; signing-key rotation in `auth.ts`; `orders.test.ts` updated. 5 files edited. |
| acme-web | 5 | 42 | Cart state fix for stale totals; checkout page and `PriceTag` component. 3 files edited. |
| billing-service | 3 | 19 | Invoice rendering and tax-rate changes (`render.go`, `rates.go`). 2 files edited. |
| infra-terraform | 2 | 11 | Production RDS config (`envs/prod/main.tf`, `rds/variables.tf`). 2 files edited. |
| notes / docs | 4 | 4 | Migration plan and on-call runbook. |
| Research (outside any repo) | 17 | 221 | Web research on API changes (pricing API, rate limits). About half of all turns. |

## Delivered

- **Engineering changes across 4 services plus infrastructure.** Sessions edited 12 code and config files in total.
- **Tests were run alongside changes.** `npm test` ran 19 times.
- **PRs.** 7 `gh pr create` invocations were logged. The logs can't show whether they were merged.
- **Matching commits in git** (indicative only):
  - acme-api: partial refunds, `refund_reason` schema, signing-key rotation, refund tests.
  - acme-web: stale cart totals fix, inline tax breakdown.
  - billing-service: round invoices to minor units.
  - infra-terraform: bump production RDS instance class.
- **Documentation.** Migration plan and on-call runbook written or updated.
- **Research.** About 220 searches and fetches fed the pricing/rate-limit work.

## Caveats

- The logs record activity, not outcomes. They don't show PR merges, bugs prevented or hours saved. If she wants those, add PR links and review status from GitHub.
- No cost is shown because the logs don't record the model used. Token totals are above if she wants them.
- Commit timestamps in the repos are out of order (the "initial" commits are dated 23 Oct, after the later work). Treat commit dates as unreliable.
- Prompts were short (for example "add the thing", "open the PR"), so the logs don't capture the original tickets or goals. A line or two of business context from you would strengthen this report.
