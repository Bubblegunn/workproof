# Claude Code usage and impact, 24 Sep – 21 Oct 2026

Source: local Claude Code session logs, 40 sessions across 6 working directories. Figures are computed directly from the logs.

## Summary
- **40 sessions, 417 assistant turns** over about 4 weeks, spread fairly evenly through the period.
- **7 pull requests opened** across 4 codebases (`gh pr create` run in 7 sessions).
- **About 3,000 lines added and 630 removed** across 14 files, through Claude's edit and write tools. The line counts are approximate.
- **17 research sessions** (pricing API changes and rate limits) used 221 web lookups.
- **4 migration-plan drafts** written in a notes project.

## Where the time went
| Area | Sessions | PRs opened | Approx. lines +/- | Files touched |
|---|---|---|---|---|
| acme-api | 9 | 3 | +1,890 / -405 | 5 |
| acme-web | 5 | 2 | +560 / -135 | 3 |
| billing-service | 3 | 1 | +294 / -54 | 2 |
| infra-terraform | 2 | 1 | +56 / -36 | 2 |
| notes (migration plan drafts) | 4 | – | +220 | 2 |
| Research (web lookups) | 17 | – | – | – |

Each coding session ran tests with `npm test` (19 runs in total).

## Usage volume
| Metric | Total |
|---|---|
| Input tokens | 375K |
| Output tokens | 131K |
| Cache writes | 1.67M |
| Cache reads | 12.5M |

The logs don't record the model, so I haven't estimated a dollar cost.

## Limits of this report
- The logs show what was done, not the outcome. I can't tell whether the PRs were merged, whether the tests passed, or how long the work would have taken by hand.
- "7 PRs opened" means the command was issued. The logs hold no tool results to confirm each one succeeded.
- Research and planning work leaves no code behind, so it appears only as session counts.
- For outcomes, add PR links, merge status and any review feedback before sending.
