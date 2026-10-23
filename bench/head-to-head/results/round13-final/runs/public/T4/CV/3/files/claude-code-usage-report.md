# Claude Code usage and impact, 25 Sep – 22 Oct 2026

Source: local Claude Code session logs (40 sessions, 64 prompts, 28 active days).

## Summary

I used Claude Code for 40 sessions over four weeks. About half the sessions (19 of 40) were engineering work across four repos, and that work produced 7 pull requests. The rest was API and pricing research and two planning documents.

## Engineering work: 19 sessions, 7 PRs opened

| Repo | Sessions | Prompts | Files changed | PRs opened |
|---|---|---|---|---|
| acme-api | 9 | 12 | orders and refunds routes, auth lib, DB schema, orders tests (5 files) | 3 |
| acme-web | 5 | 7 | cart state, checkout page, PriceTag component (3 files) | 2 |
| billing-service | 3 | 4 | invoice rendering, tax rates (2 files) | 1 |
| infra-terraform | 2 | 3 | prod environment config, RDS module variables (2 files) | 1 |

- Each of these sessions was a cycle of reading code, editing, running `npm test` (19 runs) and opening a PR with `gh pr create`.
- Across the repos that is 70 file reads, 70 edits and 26 new files written.
- The acme-api work covered partial refunds, a refund-reason schema change and signing-key rotation.

## Research: 17 sessions

- These were pricing-API and rate-limit lookups, with 119 web fetches and 102 web searches.
- They ran outside any repo, so they left no files behind. The output was answers, not artifacts.

## Planning documents: 4 sessions

- Two documents were written: `notes/migration-plan.md` and `notes/oncall-runbook.md`.

## Token usage

| | Tokens |
|---|---|
| Fresh input | ~375K |
| Output | ~131K |
| Cache writes | ~1.67M |
| Cache reads | ~12.5M |

Research sessions account for about half of all input and output tokens, and the engineering repos together for about 45%.

## What these logs can't show

- **Outcomes.** The logs record that PRs were opened and tests were run. They don't show whether the PRs were merged, whether the tests passed, or whether anything shipped. Merge status and review turnaround would need to be added from GitHub.
- **Time saved.** The logs have no baseline for how long this work would have taken otherwise, so I haven't put a number on it.
- **Cost.** The logs don't record which model was used, so I haven't estimated dollars.
