# Claude Code usage and impact, 24 Sep to 21 Oct 2026

Source: local Claude Code session logs (40 sessions). Figures below are counted directly from those logs.

## Usage at a glance

| Measure | Value |
|---|---|
| Sessions | 40 across 28 active days |
| Prompts sent | 64 |
| Assistant turns | 417 |
| Tokens | 375,300 input, 131,050 output, 1.67M cache writes, 12.5M cache reads |
| File changes | 70 edits (980 lines added, 630 removed) and 30 new or rewritten files (about 2,040 lines) |
| Test runs (`npm test`) | 19 |
| Pull requests opened | 7 |
| Web research calls | 221 (119 page fetches, 102 searches) |

## Where the time went

| Area | Sessions | What the logs show |
|---|---|---|
| acme-api | 9 | Largest code effort. Changes to order routes, refunds, DB schema, auth and order tests; 3 PRs opened. |
| acme-web | 5 | Checkout page, cart state and PriceTag component; 2 PRs opened. |
| billing-service | 3 | Invoice rendering and tax rates (Go); 1 PR opened. |
| infra-terraform | 2 | Prod environment config and RDS module variables; 1 PR opened. |
| Research (outside repos) | 17 | One session per day, roughly 13 web calls each, on pricing API changes and rate limits. This is the largest share of tokens (about half of input and output). |
| Notes and docs | 4 | Drafted a migration plan and an on-call runbook. |

## Delivered

- Seven PRs across four repositories (API, web, billing, infrastructure).
- Refund handling work in acme-api: refund routes, schema change and tests.
- Edits to auth code in acme-api (`src/lib/auth.ts`). The logs don't say what the change was.
- Two written documents: a migration plan and an on-call runbook.
- Recurring research briefs on pricing API changes and rate limits.

## What the logs cannot show

The logs record activity, not results. They do not contain tool output, so I could not confirm any of the following. I left them out rather than guess:

- Whether tests passed, or whether the 7 PRs were reviewed or merged.
- Time saved, bugs prevented, incidents avoided or revenue effects.
- What the pricing research was used for.
- Dollar cost of the usage (this needs your plan or pricing).

To make this a stronger impact report, add the following before sending:
1. PR links and their merge status (`gh pr list --author @me --state all`).
2. One or two outcomes you can vouch for, such as a shipped refund feature or a faster review turnaround.
3. The decision the pricing research informed, if any.
