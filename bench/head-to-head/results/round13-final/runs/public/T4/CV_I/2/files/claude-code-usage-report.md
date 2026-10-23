# Claude Code usage and impact, 25 Sep – 22 Oct 2026

Source: local session logs (40 sessions, 417 model requests). Commit data comes from the four local repos. Token counts are exact. The links between sessions and commits are inferred from dates (see "Caveats").

## Usage at a glance

| Area | Sessions | Requests | Output tokens | Main work |
|---|---|---|---|---|
| acme-api | 9 | 120 | 38k | Partial refunds, `refund_reason` schema, signing-key rotation, tests |
| acme-web | 5 | 42 | 13k | Cart totals fix, checkout tax breakdown |
| billing-service | 3 | 19 | 6k | Invoice rounding to minor units, tax rates |
| infra-terraform | 2 | 11 | 3k | Prod RDS instance class bump |
| Migration-plan / runbook notes | 4 | 4 | 4k | Drafting `migration-plan.md` and `oncall-runbook.md` |
| Research (pricing API, rate limits) | 17 | 221 | 68k | Web search and fetch (221 search/fetch calls) |
| **Total** | **40** | **417** | **131k** | |

Other token totals: 375k fresh input, 1.67M cache writes, 12.5M cache reads. Most input was served from cache.

Tool calls: 221 web search/fetch, 70 reads, 70 edits, 30 writes, 26 shell commands.

## What it delivered

Eight commits landed in the four repos during the window. Each falls on the same day as a coding session in that repo:

- **acme-api:** partial-refund handling (21 Oct), signing-key rotation (18 Oct), `refund_reason` schema column (14 Oct), partial-refund test coverage (7 Oct)
- **acme-web:** inline tax breakdown at checkout (19 Oct), fix for stale cart totals (12 Oct)
- **billing-service:** invoice rounding to minor units (15 Oct)
- **infra-terraform:** prod RDS instance class bump (10 Oct)

Seven of the 19 coding sessions ended with an "open the PR" request. They were three in acme-api, two in acme-web, one in billing-service and one in infra-terraform.

Two planning documents were also drafted: the migration plan and the on-call runbook, across four sessions.

The research sessions (17, plus the notes sessions) fed the pricing-API and rate-limit work. The logs don't show what decisions came out of them.

## Caveats

- **Attribution is by date.** The logs don't link a session to a commit hash. I matched them by same-day timing in the same repo, and all 8 commits matched. Check this if the numbers need to be defensible.
- **No outcome data.** The logs don't record PR merges, review results, incidents avoided or hours saved, so this report doesn't claim any. Add those from GitHub or Jira if you have them.
- **Research is the biggest share of usage.** It is 53% of requests and 52% of output tokens, but it produced no commits of its own.
- **No dollar figure.** The logs hold token counts but no pricing. Add a cost line from the billing console if your manager wants one.
