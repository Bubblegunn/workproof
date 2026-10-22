# Claude Code Usage & Impact Report
**Period:** 24 Sep – 21 Oct 2026 (all logged activity on this machine)
**Source:** local Claude Code session logs (40 sessions, 417 model calls)

## Summary
Roughly two-thirds of sessions were code changes across four repos, ending in **7 pull requests opened**. The rest was research on the pricing API and migration-plan drafting.

## Usage
| Area | Sessions | Model calls | Output tokens |
|---|---|---|---|
| acme-api | 9 | 120 | 38K |
| acme-web | 5 | 42 | 13K |
| billing-service | 3 | 19 | 6K |
| infra-terraform | 2 | 11 | 3K |
| Research (pricing API / rate limits) | 17 | 221 | 68K |
| Notes (migration plan, runbook) | 4 | 4 | 4K |
| **Total** | **40** | **417** | **~130K** |

Other totals: ~375K fresh input tokens, ~12.5M cache-read tokens (heavy context reuse).

## Delivered (from logged actions)
- **7 PRs opened** via `gh pr create`: acme-api 3, acme-web 2, billing-service 1, infra-terraform 1.
- **Code edits:** 70 edits across 12 files, about 980 lines added and 630 removed. Plus 6 new or rewritten files (~2,000 lines written), including:
  - `acme-api`: `routes/refunds.ts` and `db/schema.sql`
  - `acme-web`: `app/cart/state.ts`
  - `billing-service`: `internal/tax/rates.go`
- **Test runs:** `npm test` was run 19 times as part of those changes.
- **Docs:** `migration-plan.md` and `oncall-runbook.md` drafted (4 sessions).
- **Research:** 17 sessions, 119 page fetches and 102 searches on pricing-API changes and rate limits.

## Caveats
- The logs record actions, not outcomes. They don't show whether tests passed, PRs were merged, or the research was acted on. Add merge status and any time or cost figures from GitHub before sending.
- Line counts come from edit sizes in the logs and are approximate.
- Sessions with generic prompts ("add the thing") don't say what each change was for beyond the file paths. Add one line of business context per PR if you can.
