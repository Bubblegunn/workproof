# Claude Code usage and impact report

Period: 25 Sep – 22 Oct 2026 (the span of the session logs on this machine; activity on all 28 days)
Source: local Claude Code session logs (40 sessions) plus `git log` in the four repos under `~/code`.

## Usage at a glance

| Metric | Value |
|---|---|
| Sessions | 40 |
| Prompts sent | 64 |
| Assistant requests | 417 |
| Input / output tokens | 375,300 / 131,050 |
| Cache-read / cache-write tokens | 12.5M / 1.67M |

Dollar cost is not included. The logs don't record the model, so I can't price the tokens accurately.

## Where the time went

| Area | Sessions | Prompts | Requests | Output tokens | Main activity |
|---|---|---|---|---|---|
| acme-api | 9 | 12 | 120 | 38,250 | read/edit/write code, run commands |
| acme-web | 5 | 7 | 42 | 12,600 | code edits |
| billing-service | 3 | 4 | 19 | 5,970 | code edits |
| infra-terraform | 2 | 3 | 11 | 2,630 | config edits |
| notes (docs) | 4 | 4 | 4 | 3,600 | wrote 2 docs |
| Research (home dir) | 17 | 34 | 221 | 68,000 | 119 web fetches, 102 web searches |

- Engineering work: 23 sessions, 196 requests. That's 47% of requests and about 50% of output tokens.
- Research: 17 sessions. That's 53% of requests and about 52% of output tokens. It produced no files or code.

## What it delivered (engineering)

- **Code changes:** about 980 lines added and 630 removed through 70 Edit calls. 30 Write calls created new files (not counted in those totals). Files touched:
  - acme-api: `orders.ts`, `refunds.ts`, `auth.ts`, `schema.sql`, `orders.test.ts`
  - acme-web: `PriceTag.tsx`, `page.tsx`, `state.ts`
  - billing-service: `rates.go`, `render.go`
  - infra-terraform: `main.tf`, `variables.tf`
- **Commits in the period (8 feature commits):**
  - acme-api: partial refunds in orders, `refund_reason` schema column, signing-key rotation, tests for partial refunds
  - acme-web: fix for stale cart totals, inline tax breakdown at checkout
  - billing-service: invoice rounding to minor units
  - infra-terraform: larger production RDS instance class
- **Docs:** `migration-plan.md` and `oncall-runbook.md` in `~/notes`.
- Most acme-api sessions were short task prompts ("add the thing", "open the PR"), which suggests Claude was used for implementation and PR prep.

## Caveats

- The logs show activity, not outcomes. I matched the commits to the sessions by repo and date. The logs don't prove Claude wrote each commit, and they don't show whether the PRs merged or what the changes did in production.
- Line counts come from the Edit tool inputs, so they approximate the final diffs.
- The research sessions (about half of usage) have no output I can point to. If you want to credit them, add what decisions or documents they informed. Otherwise this report shouldn't claim an impact for them.
- Time saved can't be measured from these logs. If you want a number, add your own estimate per task.
