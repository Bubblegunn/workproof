# Claude Code usage and impact, 25 Sep – 22 Oct 2026

## Summary
- **40 sessions, 64 prompts, 417 assistant turns** across 28 active days (about 5 of 6 days).
- Work split: **~43% coding in 4 repos**, **~43% research (17 sessions)**, **10% writing (4 sessions)**. By session count: acme-api 9, acme-web 5, billing-service 3, infra-terraform 2, notes 4, research 17.
- Code edits: **12 files touched, roughly +3,000 / −630 lines**, with 52 shell commands run.
- Tokens: ~131K output. The prompt side is mostly cache reads (~12M), which are cheap.

## What it was used for
| Area | Sessions | Output |
|---|---|---|
| acme-api | 9 | Edits to `orders.ts`, `refunds.ts`, `auth.ts`, `schema.sql` and `orders.test.ts` (about +1,890 / −405 lines). Ties to the partial-refund, `refund_reason` schema and signing-key work in git. |
| acme-web | 5 | Cart state, checkout page and `PriceTag` component (about +560 / −135). |
| billing-service | 3 | Invoice rendering and tax rates (about +294 / −54). |
| infra-terraform | 2 | Prod `main.tf` and the RDS module variables (small: about +56 / −36). |
| Notes / docs | 4 | Drafted `migration-plan.md` and `oncall-runbook.md` (about 220 lines). |
| Research | 17 | 119 web fetches and 102 searches, e.g. pricing API changes and rate limits. No files produced; the output was answers. |

## Caveats (please read before sending)
- **The logs show activity, not outcomes.** They can't show whether changes were merged, shipped or caught bugs. Some sessions had an "open the PR" prompt, but I found no record of a PR. Add PR links or ticket numbers to back up the impact claims.
- **Line counts are approximate.** I counted newlines in the edit and write payloads, not in git diffs. They include rewrites and retries.
- **No cost figure.** The logs don't record which model was used, so I didn't estimate spend. The Anthropic console or your admin dashboard has the real number.
- **Time saved is not measured.** I didn't invent an hours-saved figure. If you want one, an estimate from you would be more credible.
- **The git history here doesn't line up with the sessions.** The repo in this folder has 5 commits, and the "initial" commit is dated after the others. I only used it as loose context for the acme-api bullet.
