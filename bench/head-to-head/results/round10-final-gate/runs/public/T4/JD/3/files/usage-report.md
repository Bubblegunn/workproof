# Claude Code usage and impact report, 24 Sep to 21 Oct 2026

Source: local session logs on this machine (40 sessions, 64 prompts). The logs show what was done. They don't show whether it shipped or what it was worth. See "What this can't show" below.

## Usage at a glance
| Metric | Value |
|---|---|
| Active days | 28 of 28 (every day in the window) |
| Sessions / prompts | 40 / 64 |
| Model requests | 417 |
| Output tokens | about 131k |
| Fresh input tokens | about 375k |
| Cache writes / cache reads | about 1.67M / 12.5M |
| Tool calls | 447 |

## Where the time went
| Area | Sessions | Prompts | Work done |
|---|---|---|---|
| acme-api | 9 | 12 | 45 file edits, 18 new files, 12 shell commands |
| Research (home dir, not in a repo) | 17 | 34 | 119 page fetches, 102 web searches |
| acme-web | 5 | 7 | 15 edits, 5 new files, 7 shell commands |
| notes | 4 | 4 | 4 documents written |
| billing-service | 3 | 4 | 6 edits, 3 new files, 4 shell commands |
| infra-terraform | 2 | 3 | 4 edits, 3 shell commands |

## What it delivered
- **Code changes:** 70 edits across 4 repos, plus 30 files written. That is roughly 980 lines added and 630 removed. This is estimated from the edit text, so treat it as approximate. About 70% of the edits were in acme-api, with acme-web next.
- **Research:** about half the sessions were research. They covered 221 lookups, including a pricing API change review. This replaces manual doc reading.
- **Writing:** 4 notes documents.
- **Billing and infra:** small, targeted changes (6 and 4 edits).
- **Working pattern:** every edit was preceded by a read of the file, and there were few shell commands overall (26).

## What this can't show
- **Outcomes:** whether changes were merged, deployed or bug-free. The logs only record the edits. Add PR links or merged commits for the highlights.
- **Time saved:** this isn't recorded. Any estimate would be a guess, so add your own if you want one.
- **Cost:** token counts are above, but no dollar figure, because I don't have your plan or pricing details.

## Suggested next step
Before sending, add 2 or 3 concrete outcomes per project, such as features shipped or issues closed. They will make the report more persuasive than the activity numbers.
