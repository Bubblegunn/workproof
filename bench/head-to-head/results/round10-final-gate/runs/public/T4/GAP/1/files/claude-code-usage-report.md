# Claude Code Usage & Impact Report

**Period:** 24 Sep – 21 Oct 2026 (4 weeks) · **Source:** local Claude Code session logs (40 sessions, 417 assistant turns)

## Summary

Over the past month I ran 40 Claude Code sessions: 23 on code across four repos, 4 on planning/runbook docs, and 17 on API research. The work was mostly in `acme-api` (9 sessions). Claude made about 100 file edits or writes and ran the test command in every code session. I tried to open 7 pull requests with it.

## Usage

| Area | Sessions | What it was |
|---|---|---|
| acme-api | 9 | Orders and refunds routes, DB schema, auth, order tests |
| acme-web | 5 | Cart state, checkout page, price display |
| billing-service | 3 | Tax rates, invoice rendering |
| infra-terraform | 2 | Prod environment config, RDS module variables |
| notes | 4 | Migration plan, on-call runbook |
| Research | 17 | Pricing API changes and rate limits (web search/fetch) |

- **Tool actions:** 70 file reads, 70 edits, 30 file writes, 26 shell commands, and 221 web searches/fetches.
- **Code volume:** about 2,040 lines written in new or overwritten files, plus edits that added about 980 lines and removed about 630. These counts come from the edit payloads. They are not net diffs.
- **Tokens:** about 375K fresh input, 131K output, 1.7M cache writes, and 12.5M cache reads. The logs don't record model or price, so I have not estimated cost.

## Delivered

- **Pull requests:** `gh pr create` was run 7 times (acme-api ×3, acme-web ×2, billing-service ×1, infra-terraform ×1).
- **Testing:** `npm test` was run in all 23 code sessions.
- **Documents:** the migration plan and on-call runbook were drafted in `notes/`.
- **Research:** 17 research sessions on pricing API changes and rate limits, run about every 1–2 days.

## Limits of this data

- The logs record what was attempted, not the outcome. I can't see whether tests passed, whether the PRs were created or merged, or whether the research changed a decision. To show real impact, add the PR links and merge status from GitHub.
- The same files were edited in many sessions. For example, `refunds.ts`, `schema.sql`, `orders.ts` and `auth.ts` were touched in all 9 acme-api sessions. That may be iteration on one feature, or it may be rework. Either way, it makes the line counts overstate distinct output.
- Only 7 of the 23 code sessions got as far as a PR attempt.
- Lines of code and token counts show activity, not value.

## Suggested additions before sending

1. A list of the merged PRs and what each shipped (for example, the partial-refunds work in acme-api).
2. One or two concrete outcomes, such as time saved or a decision the research informed.
