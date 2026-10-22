# Claude Code usage and impact report
Period: 24 Sep – 21 Oct 2026 (source: local session logs; 40 sessions on 28 active days)

## Usage at a glance
| Metric | Value |
|---|---|
| Sessions | 40 (19 coding, 4 planning notes, 17 research) |
| Prompts sent | 64 |
| Model responses | 417 |
| Output tokens | ~131,000 |
| Fresh input tokens | ~375,000 |
| Cached context (read / written) | ~12.5M / ~1.7M |
| Tool calls | 366 (WebFetch 119, WebSearch 102, Read 70, Edit 70, Write 30, Bash 26) |

## Where the time went
| Area | Sessions | Files edited / created | Approx. lines added (net of Edit churn) | Test runs | PRs opened |
|---|---|---|---|---|---|
| acme-api | 9 | 45 edits, 18 new | ~630 edited + ~1,260 new | 12 | 3 |
| acme-web | 5 | 15 edits, 5 new | ~210 + ~350 new | 7 | 2 |
| billing-service | 3 | 6 edits, 3 new | ~84 + ~210 new | 4 | 1 |
| infra-terraform | 2 | 4 edits | ~56 | 3 | 1 |
| Migration planning notes | 4 | 4 docs | ~220 | – | – |
| Pricing-API research | 17 | – | – | – | – |

Totals: 70 edits and 30 new files across 4 repos; 19 `npm test` runs; 7 PRs opened via `gh pr create`.

## What it delivered
Commits in the four repos during the period (the logs don't link commits to sessions, so this is context, not proof of attribution):
- **acme-api**: partial-refund handling, `refund_reason` schema, signing-key rotation, tests for partial refunds
- **acme-web**: stale cart totals fix, inline tax breakdown at checkout
- **billing-service**: invoice rounding to minor units
- **infra-terraform**: RDS instance class bump (prod)
- **Notes**: a migration plan drafted (4 sessions)
- **Research**: pricing API changes and rate limits, investigated across 17 sessions

## Caveats
- Logs record activity, not outcomes. They don't show whether the 7 PRs merged, tests passed, or the work shipped. Check GitHub for merge status before quoting it.
- Line counts are estimated from edit payloads, so treat them as rough.
- The research work is the same two questions repeated in all 17 sessions (221 web calls, about half of all tool calls and half of all tokens). That looks like re-asking rather than 17 pieces of research. It's worth consolidating the answer in a note.
- Logs don't record model or price, so there's no dollar figure. Pull cost from your billing/usage dashboard if she wants one.
