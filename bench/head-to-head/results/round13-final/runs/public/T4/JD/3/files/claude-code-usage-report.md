# Claude Code usage and impact report
**Period:** 25 Sep – 22 Oct 2026 (28 days with log data). **Source:** local Claude Code session logs on this machine.

## Usage at a glance
| | |
|---|---|
| Sessions | 40 |
| Prompts I wrote | 64 |
| Claude responses (API calls) | 417 |
| Active days | 28 (every day in the window had some activity) |
| Tokens: fresh input / output | 375K / 131K |
| Tokens: cache writes / cache reads | 1.67M / 12.5M |

Tool actions: 119 web fetches, 102 web searches, 70 file reads, 70 edits, 30 file writes, 19 test runs (`npm test`), 7 PRs opened (`gh pr create`).

## By area
| Area | Sessions | Prompts | Share of responses | Files changed | PRs opened |
|---|---|---|---|---|---|
| acme-api (backend) | 9 | 12 | 29% | 5 | 3 |
| acme-web (frontend) | 5 | 7 | 10% | 3 | 2 |
| billing-service | 3 | 4 | 5% | 2 | 1 |
| infra-terraform | 2 | 3 | 3% | 2 | 1 |
| Notes / planning docs | 4 | 4 | 1% | 2 | 0 |
| Research (pricing API, rate limits) | 17 | 34 | 53% | none | 0 |

## What it touched
- **acme-api:** order and refund routes, auth, DB schema, and order tests.
- **acme-web:** cart state, the checkout page, and a price component.
- **billing-service:** invoice rendering and tax rates.
- **infra-terraform:** prod environment config and the RDS module.
- **Docs:** the migration plan and on-call runbook.

Commits in these repos in the same window include "orders: handle partial refunds", "schema: add refund_reason", "auth: rotate signing keys", "cart: fix stale totals", "checkout: inline tax breakdown", "invoice: round to minor units" and "prod: bump rds instance class". The file areas line up with the sessions.

## Caveats
- **I can't prove these commits came from Claude.** The logs and git history don't link them, so I'm calling the overlap "consistent with" the sessions, not a measured result. The logs also don't show whether the 7 PRs were merged.
- **No time-saved or cost figure.** The logs have no model name and no timings, so any dollar or hours estimate would be a guess. Token counts are exact.
- **Roughly half of the activity was research** (17 sessions, 53% of responses). Every one of those sessions asked the same two questions ("what changed in the pricing API?" and "and the rate limits?"). That looks like repeated lookups. Saving the answer once would have avoided most of that usage.
- **Rework signal:** 4 notes sessions all used the same "draft the migration plan" prompt, which may mean redrafting. I can't tell from the logs.

## Suggested one-line summary for your manager
Over four weeks, 40 Claude Code sessions supported work across four repos (refunds and auth in the API, checkout and cart in the web app, invoice rounding in billing, an RDS change in infra), produced 7 PRs and planning docs, and about half of the usage went to repeated API-docs research.
