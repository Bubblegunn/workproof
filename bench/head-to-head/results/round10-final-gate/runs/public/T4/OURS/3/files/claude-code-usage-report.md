# Claude Code usage and impact report

**Period:** 2026-09-23 to 2026-10-22 (30 days). Source: Claude Code session logs on this machine, summarised with `workproof sessions --days 30`.

## Totals

- 40 sessions and 64 prompts.
- Active on 28 of 30 calendar days.
- 14 files edited, about 3,120 lines touched.
- 7 pull-request creation commands run.
- 12 commits touch files that Claude Code edited. This counts commits that include edited files, not all commits.
- On 8 of the active days, a commit with Claude Code-edited files was also made.

## By project

| Project | Sessions | Prompts | Active days | Files edited | Lines touched | PR commands | Commits touching edited files | Share of usage |
|---|---|---|---|---|---|---|---|---|
| Research & investigation (no project) | 17 | 34 | 17 | 0 | 0 | 0 | n/a | 52.8% |
| acme-api | 9 | 12 | 9 | 5 | 1,953 | 3 | 5 | 28.8% |
| acme-web | 5 | 7 | 5 | 3 | 580 | 2 | 3 | 10.0% |
| billing-service | 3 | 4 | 3 | 2 | 303 | 1 | 2 | 4.6% |
| infra-terraform | 2 | 3 | 2 | 2 | 60 | 1 | 2 | 2.5% |
| (directory outside a repository) | 4 | 4 | 4 | 2 | 224 | 0 | n/a | 1.2% |

Project names are repository folder names. "n/a" means the row isn't a repository, so commits can't be counted. It does not mean zero.

## Summary

Over the last 30 days I used Claude Code in 40 sessions across 28 active days. About half of the usage (17 sessions) was research and investigation with no code changes. The rest went into four repositories, mainly acme-api (9 sessions, 1,953 lines touched, 5 commits) and acme-web (5 sessions, 3 commits). It also covered billing-service and infra-terraform. Across those repositories, Claude Code edited 14 files, 7 pull-request commands were run, and 12 commits include files it edited.

## What this does not show

- These figures count activity with Claude Code on this machine. They are self-reported from local logs. They have no hash, and a reader can't recompute them.
- "Lines touched" counts lines in edits, not net lines that remain in the code.
- The commit count covers commits that touch files Claude Code edited. It does not say how much of each commit Claude Code wrote.
- There are no dollar figures and no hours saved. Nothing here says anything about code quality or business impact.
- Sessions on other machines or in other accounts are not included.
