# Claude Code usage and impact, 24 Sep to 21 Oct 2026

Source: local session logs (40 sessions, 64 prompts, 417 assistant turns). Figures are counted from the logs.

## Usage at a glance
| Area | Sessions | Prompts | Edits | Files written | Lines changed (approx.) |
|---|---|---|---|---|---|
| acme-api | 9 | 12 | 45 | 18 | +630 / -405 edited, 1,260 written |
| acme-web | 5 | 7 | 15 | 5 | +210 / -135 edited, 350 written |
| billing-service | 3 | 4 | 6 | 3 | +84 / -54 edited, 210 written |
| infra-terraform | 2 | 3 | 4 | 0 | +56 / -36 edited |
| notes (planning docs) | 4 | 4 | 0 | 4 | 220 written |
| Research (home dir) | 17 | 34 | 0 | 0 | 119 web fetches, 102 web searches |
| **Total** | **40** | **64** | **70** | **30** | **+980 / -630 edited, 2,040 written** |

- Activity was steady: 7, 13, 16, 19 and 9 prompts per week across the five weeks. The last week is partial.
- Tool calls: 347 in total (Read 70, Edit 70, Write 30, Bash 26, WebFetch 119, WebSearch 102).
- Token volume: about 131K output and 375K uncached input. Cache reads were about 12.5M, so most context was reused rather than re-sent.

## What it delivered
- **Code, about 19 sessions across 4 repos.** Most of the work was in acme-api (9 sessions). It touched order routes among other files. There was smaller work on the acme-web front end, billing-service and infra-terraform.
- **Planning docs.** 4 sessions in notes, such as a migration plan.
- **Research.** 17 sessions on questions like "what changed in the pricing API?" and "and the rate limits?". Each was answered from web fetches and searches.

## Limits of this data
- The logs record activity, not outcomes. They don't show whether changes were merged, tests passed or bugs were avoided. Line counts come from edit and write payloads, so treat them as approximate.
- I haven't included time saved or cost. Neither is in the logs, and an estimate would be a guess.
- To strengthen the impact side, add merged PRs or tickets per repo from git or your tracker. Those are the best evidence of delivery.
