# Claude Code usage and impact: 25 Sep – 22 Oct 2026

Source: local Claude Code session logs (41 sessions, 28 distinct active days).

## Usage at a glance
| Metric | Value |
|---|---|
| Sessions | 41 (24 coding/writing, 17 research) |
| Prompts | 64 |
| Output tokens | ~131k |
| Fresh input tokens | ~375k |
| Cache reads | ~12.5M (heavy context reuse) |
| Tool calls | 417 |

## Where the time went
| Area | Sessions | What it did |
|---|---|---|
| acme-api | 9 | Orders and refunds routes, DB schema. The largest share of work: 45 edits, about 405 lines replaced with 630 |
| acme-web | 5 | Cart state and checkout. 15 edits, about 135 lines replaced with 210 |
| billing-service | 3 | Tax rates and invoice rendering. 6 edits |
| infra-terraform | 2 | 4 edits, plus the Terraform changes |
| Docs (notes) | 4 | Migration plan and on-call runbook drafts |
| Research | 17 | Questions on pricing API changes and rate limits (102 web searches, 119 page fetches) |

Across the coding work there were 70 file edits and 30 file writes. The agent ran the test suite (`npm test`) 19 times. It ran `gh pr create` 7 times, spread over the 4 code repos.

## Concrete outcomes
- **Code work:** Partial-refund handling, a `refund_reason` schema change, refund tests and signing-key rotation in acme-api. Cart total and checkout tax fixes in acme-web. Invoice rounding to minor units in billing-service. An RDS instance-class bump in infra-terraform. These match commits in the local repos, but the logs don't link specific sessions to specific commits.
- **PRs:** Seven pull-request creations were attempted. The logs don't show whether they were merged, so please confirm the merged count from GitHub before quoting a figure.
- **Docs:** The migration plan and on-call runbook were drafted. Each was written to disk 2 times.
- **Research:** 17 short research sessions on API pricing and rate limits. These support decisions, but they produced no artifact I can point to.

## Caveats
- Token counts come from the logs. The logs don't record which model was used, so I haven't estimated a dollar cost.
- Line counts come from the edit diffs. They are approximate, and they measure activity rather than value.
- Quality, review time saved and business impact aren't in the logs. If you add a line on those (for example hours saved on refunds or the migration plan), the report will land better.
