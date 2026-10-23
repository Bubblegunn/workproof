# Claude Code usage and impact, 25 Sep – 22 Oct 2026

Source: local Claude Code session logs (40 sessions, 64 prompts, 417 assistant tool-call turns). Every log falls inside the last month.

## Usage

| Area | Sessions | Assistant tool calls |
|---|---|---|
| Research (web lookups, run from home dir) | 17 | 221 (WebFetch 119, WebSearch 102) |
| acme-api | 9 | 120 |
| acme-web | 5 | 42 |
| billing-service | 3 | 19 |
| infra-terraform | 2 | 11 |
| notes / docs | 4 | 4 |

- Non-web tool calls: Read 70, Edit 70, Write 30, Bash 26. Bash was `npm test` (19) and `gh pr create --fill` (7).
- Active on 28 distinct days.
- Tokens: about 131K output, 375K fresh input, 1.67M cache-written, 12.5M cache-read. The logs record no model name, so I haven't estimated cost.

## What it touched

- **acme-api** (9 sessions): refunds and orders work. Edited `routes/orders.ts`, `routes/refunds.ts`, `lib/auth.ts`, `db/schema.sql` and `tests/orders.test.ts`. The git history has matching commits: partial refunds, `refund_reason` column, signing-key rotation, partial-refund tests.
- **acme-web** (5): cart state, checkout page and `PriceTag`. Git has "fix stale totals" and "inline tax breakdown".
- **billing-service** (3): invoice rendering and tax rates. Git has "round to minor units".
- **infra-terraform** (2): prod RDS config. Git has "bump rds instance class".
- **Docs** (4): drafted `notes/migration-plan.md` and `notes/oncall-runbook.md`.
- **Research** (17): repeated questions on pricing-API changes and rate limits.

## Caveats

- **Commit attribution is inferred.** The commits touch the same areas as the sessions, but nothing in the logs links a commit to a session. Each commit is a one-line change, and the repo dates are inconsistent (the "initial" commits are dated 23 Oct). Treat the link as "consistent with", not proof.
- **Outcomes are not in the logs.** I can't tell whether the 7 PR attempts succeeded, whether tests passed, or whether anything shipped.
- **Roughly half of all tool calls were research.** The same two questions recur across the 17 research sessions, which may mean repeated work rather than new findings.
- **No time-saved figure.** The logs don't support one, and I haven't invented one.

## Suggested additions before sending

PR links or merged-PR counts from GitHub, plus any concrete outcomes such as the refund feature shipping or the RDS bump being applied.
