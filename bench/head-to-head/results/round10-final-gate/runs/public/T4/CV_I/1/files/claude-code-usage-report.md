# Claude Code Usage and Impact Report

**Period:** 24 Sep – 21 Oct 2026 (the last month of logged sessions)
**Source:** local Claude Code session logs (40 sessions, 481 log entries)

## Summary

Over the month I ran 40 Claude Code sessions. About half were engineering work across four repositories (acme-api, acme-web, billing-service, infra-terraform). The rest were documentation and planning (4 sessions) and API/pricing research (17 sessions). The sessions started 7 pull requests and ran the test suite 19 times.

## Usage

| Area | Sessions | Model requests | PRs opened |
|---|---|---|---|
| acme-api | 9 | 120 | 3 |
| acme-web | 5 | 42 | 2 |
| billing-service | 3 | 19 | 1 |
| infra-terraform | 2 | 11 | 1 |
| Notes / planning docs | 4 | 4 | – |
| Research (web search/fetch) | 17 | 221 | – |
| **Total** | **40** | **417** | **7** |

- **Code changes:** 19 edit-and-test sessions made 70 file edits and 26 file writes. The edits added about 980 lines and removed about 630. Each ran `npm test` at least once.
- **Docs:** 4 sessions produced a migration plan and an on-call runbook in my notes folder.
- **Research:** 17 sessions on the pricing API and its rate limits, with 102 web searches and 119 page fetches.
- **Tokens:** about 375K input, 131K output, 1.67M cache writes and 12.5M cache reads. Most of the volume is cached context being re-read, not new text.

## Impact

What the logs show was delivered:

- **Refund handling in acme-api.** Changes touched the refunds route and the database schema. This matches the recent repo commits for partial refunds, the `refund_reason` column and tests.
- **Changes across the other services.** These were cart state in acme-web, tax rates in billing-service and Terraform changes in infra-terraform.
- **7 PRs raised.** Each went through the test suite first and then `gh pr create`.
- **Written deliverables.** A migration plan and an on-call runbook.
- **Pricing and rate-limit research.** 17 research sessions, roughly four a week.

## Caveats

- The logs record activity, not outcomes. They don't show whether the 7 PRs were merged, whether tests passed, or how long the work would have taken by hand. Merge status and review turnaround would have to come from GitHub.
- Line counts come from the edit and write calls in the logs. They measure volume, not value.
- I haven't put a dollar cost in this report. The logs have token counts but no pricing.
