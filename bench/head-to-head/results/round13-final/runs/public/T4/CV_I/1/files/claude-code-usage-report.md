# Claude Code usage and impact report

**Period:** 25 Sep – 22 Oct 2026 (first to last logged activity)
**Source:** local Claude Code session logs (40 sessions) plus the git history of the four repos worked in.

## Summary

Over the month I ran 40 Claude Code sessions and 417 model requests. About 45% of the sessions were hands-on engineering across four repos (`acme-api`, `acme-web`, `billing-service`, `infra-terraform`). Another 10% was drafting internal docs. The remaining 42% was API and pricing research. The engineering sessions made 100 file edits or writes across 14 files and ran the test suite 19 times. Seven of them ended with a PR-creation command.

## Usage

| Area | Sessions | Requests | Output tokens | Main activity |
|---|---:|---:|---:|---|
| acme-api | 9 | 120 | 38,250 | 45 edits, 18 writes, 9 test runs, 3 PR opens |
| acme-web | 5 | 42 | 12,600 | 15 edits, 5 writes, 5 test runs, 2 PR opens |
| billing-service | 3 | 19 | 5,970 | 6 edits, 3 writes, 3 test runs, 1 PR open |
| infra-terraform | 2 | 11 | 2,630 | 4 edits, 2 test runs, 1 PR open |
| Docs (`notes/`) | 4 | 4 | 3,600 | Drafted the migration plan and on-call runbook |
| Research (pricing API, rate limits) | 17 | 221 | 68,000 | 119 web fetches, 102 web searches |
| **Total** | **40** | **417** | **131,050** | |

Total input tokens were 375,300, plus 1.67M tokens written to cache and 12.5M read from cache. Most of the volume is cache reads of the same context.

## What it delivered

Work in the repos, with git commits in the same window:

- **acme-api:** partial-refund handling in orders and refunds, signing-key rotation in auth, a `refund_reason` schema column, and tests covering partial refunds. Four commits.
- **acme-web:** a fix for stale cart totals and an inline tax breakdown at checkout. Two commits.
- **billing-service:** invoice rounding to minor units, plus tax-rate changes. One commit.
- **infra-terraform:** an RDS instance-class bump in prod. One commit.
- **Docs:** a first draft of the migration plan and the on-call runbook.
- **Research:** 17 sessions on pricing-API and rate-limit changes, probably feeding the pricing-related work above.

## Caveats

- **Commits are not attributed to Claude.** The git history shows six feature commits in the window. They line up by date with the sessions, but the logs don't record that Claude made them.
- **PR outcomes are unknown.** The logs show `gh pr create` being run seven times, but not whether each PR was opened, reviewed or merged.
- **Test results are unknown.** The logs record that tests were run, not whether they passed.
- **No cost figure.** The logs don't record which model was used, so I haven't estimated dollar spend. Billing data would give the real figure.
- **Time saved isn't measured.** I haven't claimed hours saved. If you want that, a rough before-and-after estimate for a few tasks would be more credible than anything derived from the logs.
- **Research has the least visible output.** It's over half of all requests and output tokens, but it produced no files. Adding a line on what those findings led to would strengthen the report.
