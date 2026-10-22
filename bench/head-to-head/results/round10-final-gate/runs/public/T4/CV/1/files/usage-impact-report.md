# Claude Code Usage & Impact Report
**Period:** 24 Sep – 21 Oct 2026 (session logs on this machine) · **Prepared:** 22 Oct 2026

## Summary
- **40 sessions on 28 active days**, about 417 model responses.
- **19 sessions were coding work** in 4 repos (acme-api, acme-web, billing-service, infra-terraform). They produced **7 pull requests** opened with `gh pr create`, and `npm test` was run 19 times.
- **17 sessions were web research** (pricing API changes and rate limits), and **4 were planning docs** (migration-plan drafts saved to notes).

## Work by area
| Area | Sessions | PRs opened | Files touched | Approx. lines changed* |
|---|---|---|---|---|
| acme-api | 9 | 3 | 5 | ~630 added / ~405 removed edits, plus ~1,260 lines in new files |
| acme-web | 5 | 2 | 3 | ~210 added / ~135 removed, plus ~350 new |
| billing-service | 3 | 1 | 2 | ~84 added / ~54 removed, plus ~210 new |
| infra-terraform | 2 | 1 | 2 | ~56 added / ~36 removed |
| Research (web search and fetch) | 17 | n/a | n/a | 17 sessions, 221 searches and page fetches |
| Notes / planning | 4 | n/a | 2 files | ~220 lines of migration-plan drafts |

*Estimated from the edit and write calls in the logs, not from git diffs. Treat these as rough magnitudes. File counts are distinct paths per repo.

## Token usage (approximate totals)
- Fresh input: ~375k. Output: ~131k.
- Cache writes: ~1.67M. Cache reads: ~12.5M.
- Research sessions used about half of all responses (221 of 417). Coding in acme-api used about 29%.

## What this does and doesn't show
- The logs show **activity**: sessions, edits, tests run, PRs opened.
- They do **not** show outcomes. I can't tell from them whether the PRs were merged, whether tests passed, or how much time was saved. The prompts were terse ("add the thing"), so the logs don't describe the features either.
- To turn this into impact, add the following from GitHub and your own knowledge:
  1. Which of the 7 PRs merged, and what each delivered (for example, partial refunds and the `refund_reason` schema change).
  2. Estimated hours saved, or work you wouldn't otherwise have had time for.
  3. Any incidents or bugs the research or tests caught.

## Suggested short note to send
> Over the last month I used Claude Code in 40 sessions across 4 repos (acme-api, acme-web, billing-service, infra-terraform). It produced 7 pull requests, with tests run before each, plus research on pricing API and rate-limit changes and drafts of the migration plan. [Add: which PRs merged, and the time or outcome benefit.]
