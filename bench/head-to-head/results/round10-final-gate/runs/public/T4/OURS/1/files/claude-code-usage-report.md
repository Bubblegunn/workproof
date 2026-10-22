# Claude Code usage report

**Period:** 2026-09-23 to 2026-10-22 (30 days)
**Source:** Claude Code session logs on this machine, read with `npx workproof sessions --days 30` (40 log files scanned).

## Totals

- 40 sessions and 64 prompts.
- Claude Code was used on 28 of the 30 calendar days.
- 14 files were edited, touching 3,120 lines.
- 7 pull-request create commands were run.
- 12 commits include files that Claude Code edited. This counts commits that touch those files, not all commits.
- Git commits and Claude Code sessions fell on the same day on 8 days.

## By project

| Project | Sessions | Prompts | Active days | Files touched | Lines touched | PR create cmds | Commits with Claude-edited files | Share of usage |
|---|---|---|---|---|---|---|---|---|
| Research & investigation (no project) | 17 | 34 | 17 | 0 | 0 | 0 | n/a | 52.8% |
| acme-api | 9 | 12 | 9 | 5 | 1,953 | 3 | 5 | 28.8% |
| acme-web | 5 | 7 | 5 | 3 | 580 | 2 | 3 | 10.0% |
| billing-service | 3 | 4 | 3 | 2 | 303 | 1 | 2 | 4.6% |
| infra-terraform | 2 | 3 | 2 | 2 | 60 | 1 | 2 | 2.5% |
| (directory outside a repository) | 4 | 4 | 4 | 2 | 224 | 0 | n/a | 1.2% |

Project names are repository folder names taken from the logs.

## Summary

Over the last 30 days I used Claude Code in 40 sessions across 28 active days. About half of that usage (17 sessions) was research and investigation with no code changes. The rest was hands-on work in four repositories, mostly acme-api (9 sessions, 1,953 lines touched across 5 files), then acme-web, billing-service and infra-terraform. That work involved 14 files and 3,120 lines in total, led to 7 pull-request create commands, and appears in 12 commits that include files Claude Code edited.

## What this does not show

- These figures count activity with Claude Code on this machine. They are self-reported from local logs. There is no hash, so a reader cannot recompute them.
- There are no dollar figures and no estimate of hours saved.
- There is no claim about code quality, review outcome or business impact. "Lines touched" measures edits, not lines that shipped or lasted.
- "Share of usage" is each project's portion of recorded usage, not of working time.
- A pull-request create command shows an attempt to open a PR, not that it was merged.
