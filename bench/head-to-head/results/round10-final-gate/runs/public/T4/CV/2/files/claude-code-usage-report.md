# Claude Code usage and impact report

**Period:** 24 Sep – 21 Oct 2026 (28 days, activity on every day)
**Source:** local Claude Code session logs (40 sessions, 64 prompts, 417 assistant turns)

## Summary

Claude Code was used for two kinds of work: hands-on changes across four code repositories, and a steady stream of API/pricing research. It produced code edits in 9 files across those repos, 7 pull-request attempts, and two planning documents.

## Where the time went

| Area | Sessions | What the logs show |
|---|---|---|
| acme-api | 9 | Edits to orders and refunds routes, auth, DB schema and orders tests. 3 PRs opened. |
| acme-web | 5 | Cart state, checkout page and PriceTag component. 2 PRs opened. |
| billing-service | 3 | Invoice rendering and tax rates. 1 PR opened. |
| infra-terraform | 2 | Prod environment config and the RDS module variables. 1 PR opened. |
| notes | 4 | Wrote `migration-plan.md` and `oncall-runbook.md`. |
| Research (outside any repo) | 17 | 102 web searches and 119 page fetches, mostly on pricing API changes and rate limits. |

## Activity totals

- **Code changes:** 70 edits and 30 file writes across 9 source files and 2 notes files. Roughly 980 lines added and 630 removed through edits, plus about 2,040 lines written as new or replaced file content.
- **Verification:** `npm test` was run 19 times across the four repos, usually before a PR was opened.
- **PRs:** `gh pr create` was run 7 times (acme-api 3, acme-web 2, billing-service 1, infra-terraform 1).
- **Research:** 221 web lookups over 17 sessions.
- **Token volume:** about 375K input, 131K output, 1.7M cache-write and 12.5M cache-read tokens.

## What the logs can't show

- **Outcomes.** The logs record what Claude did, not what happened afterwards. I can't tell whether the tests passed, whether the PRs were created, or whether they were reviewed and merged. Check GitHub for PR status before sending, and add merged PRs and links to the table above.
- **Cost.** The logs don't record which model was used, so there is no dollar figure here. Token counts are given instead. Most of the volume is cache reads, which are cheap.
- **Time saved.** Nothing in the logs measures this, so I haven't estimated it.
- **Line counts.** These are approximate. They count line breaks in the text of each edit, not a git diff.

## Suggested additions before sending

1. PR links and merge status for the 7 PRs.
2. One sentence on what the research fed into (for example a decision about the pricing API change).
3. A line on where the migration plan and on-call runbook ended up being used.
