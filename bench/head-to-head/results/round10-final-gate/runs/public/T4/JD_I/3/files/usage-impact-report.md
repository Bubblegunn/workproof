# Claude Code usage and impact, 24 Sep to 21 Oct 2026

Source: the 40 session logs on this machine. All figures are counted directly from those logs.

## Usage at a glance

| Metric | Value |
|---|---|
| Sessions | 40 across 4 code repos, a notes folder and general research |
| Assistant turns | 417 |
| Output tokens | about 131k |
| Fresh input tokens | about 375k |
| Cache writes / reads | about 1.67M / 12.5M |
| Tool calls | 417 |

## Where the time went

| Area | Sessions | Turns | Output tokens | What the logs show |
|---|---|---|---|---|
| acme-api | 9 | 120 | 38.3k | 45 edits and 18 file writes touching 5 files, about +1,890 / -405 lines. 12 prompts. |
| acme-web | 5 | 42 | 12.6k | 15 edits and 5 writes touching 3 files, about +560 / -135 lines. |
| billing-service | 3 | 19 | 6.0k | 6 edits and 3 writes touching 2 files, about +294 / -54 lines. |
| infra-terraform | 2 | 11 | 2.6k | 4 edits touching 2 files, about +56 / -36 lines. |
| Research (web) | 17 | 221 | 68.0k | 119 page fetches and 102 searches. The prompts are about pricing API changes and rate limits. |
| Notes and docs | 4 | 4 | 3.6k | Drafted two documents: a migration plan and an on-call runbook (about 220 lines). |

Code work totals about 2,800 lines added and 630 removed. That is 70 edits and 26 file writes across 12 files in 4 repos. Roughly 45% of output tokens went to code, 52% to research and 3% to docs.

## Delivered work visible in the logs

- **Code changes:** acme-api was the main focus (about two thirds of the line changes). acme-web, billing-service and infra-terraform each got smaller changes.
- **Verification:** `npm test` was run 19 times during code sessions.
- **PRs:** `gh pr create --fill` was run 7 times, once in each of 7 sessions. By repo: acme-api 3, acme-web 2, billing-service 1, infra-terraform 1.
- **Research:** 17 research sessions on pricing API changes and rate limits.
- **Docs:** a migration plan and an on-call runbook.

## Caveats

- The logs record what Claude did, not what happened afterwards. They don't include test results, PR numbers, merge status or review outcomes. I can't say from them that the 7 PR commands succeeded or that the PRs merged. Fill that in from GitHub before sending.
- Line counts come from the edit and write text. They are approximate and aren't net diffs from git.
- Prompts are short and generic ("add the thing", "open the PR"), so the logs don't name specific features. Add feature names and ticket links if you want to show business impact.
- Time saved can't be measured from the logs, so I haven't estimated it.
