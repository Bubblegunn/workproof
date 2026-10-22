# Claude Code usage and impact, 24 Sep – 21 Oct 2026

Source: local session logs (40 sessions, 417 assistant requests, 64 prompts). Each repo's `git log` was used as a cross-check.

## Usage

| Area | Sessions | Requests | Output tokens |
|---|---|---|---|
| acme-api | 9 | 120 | 38,250 |
| acme-web | 5 | 42 | 12,600 |
| billing-service | 3 | 19 | 5,970 |
| infra-terraform | 2 | 11 | 2,630 |
| notes / docs | 4 | 4 | 3,600 |
| Research (run from home dir, no repo) | 17 | 221 | 68,000 |
| **Total** | **40** | **417** | **~131,000** |

- Active on 28 distinct days across the period.
- Tokens: ~375K fresh input, ~1.67M cache writes, ~12.5M cache reads. Most of the input was served from cache.
- Tool calls: 221 web search/fetch, 70 file reads, 70 edits, 30 file writes, 19 `npm test` runs, 7 `gh pr create`.

## What it was used for

1. **Engineering (23 sessions across 4 repos).**
   - Edits and new files in `acme-api` (`src/routes/refunds.ts`, `src/db/schema.sql`), `acme-web` (`app/cart/state.ts`) and `billing-service` (`internal/tax/rates.go`).
   - Tests were run in-session (19 runs).
   - 7 sessions ended by opening a pull request.
2. **Research (17 sessions).** Repeated lookups of pricing API changes and rate limits, using web search and fetch.
3. **Documentation (4 sessions).** Drafted `notes/migration-plan.md` and `notes/oncall-runbook.md`.

## Related commits in the repos (not confirmed as Claude's work)

These commits fall in the period and touch the same areas:
- acme-api: partial refunds, `refund_reason` schema column, partial-refund tests, signing-key rotation.
- acme-web: cart stale-totals fix, inline tax breakdown at checkout.
- billing-service: invoice rounding to minor units.
- infra-terraform: prod RDS instance class bump.

## Limits of this report

- **The logs record activity, not outcomes.** They contain no tool results, so I can't tell whether tests passed, PRs were merged, or the research was acted on. The 7 PRs are attempts to open one.
- **Commit attribution is unverified.** I couldn't tie the commits above to specific sessions. The commit dates and authors aren't in the logs, and I didn't match them to session dates.
- **No time-saved or cost figure.** Neither is in the logs, so I haven't estimated one.
- **Add before sending:** PR links and merge status, plus a sentence on what the research decided. That is the impact evidence a manager will want.
