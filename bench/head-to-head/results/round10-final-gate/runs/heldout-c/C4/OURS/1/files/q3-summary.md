# Q3 2025 summary (July to September): Ines Kowalski

Project: fx (private repository). This summary says what was done and contains no code.

## What got done

- **Hex colour strings with an alpha channel (15 July).** Added support for hex colour strings that carry an alpha value. The Claude session from that day reports the test suite passing before the commit.
- **CI coverage (12 August).** Added Node 22 to the CI test matrix.
- **Alpha syntax documentation (30 September).** Documented the new alpha syntax in the readme, so the July feature is usable by others.
- **TypeScript types for level detection (19 to 24 September).** Added types for colour-level detection, then reverted them five days later. The history shows the add and the revert but not the reason, so add that yourself if you want to explain it.
- **Chained style lookup performance (4 August), investigated but not shipped.** An exploration of faster chained style lookups. In the session you chose not to merge the result because the numbers looked off, and no commit came from it. No speed-up is claimed here.

## Figures from git (1 July to 30 September 2025)

| Figure | Value |
|---|---|
| Commits in the window | 5 of 5 non-merge commits in the repository for that window |
| Lines added / deleted | 60 / 12, after excluding generated and lock files |
| Files touched | 4 |
| Active weeks | 5 of 14 |
| Median commit size | 12 lines (90th percentile 34) |
| Lines still in the project at HEAD | 50 of 1,711 (2.9%) |

Commit share measures activity. Surviving lines measure what lasted. The two are different things and should be read separately. The repository is small, and most of its surviving code predates this quarter.

One earlier commit (27 June) falls outside the window and is not counted.

## How to check this

The report hash starts with `6393b0e0`. Run `npx workproof check workproof-report.json` to confirm the file was not edited. Run `npx workproof verify workproof-report.json --repo .` in the repository to recompute every figure. Both were run for this summary: the hash is intact and all figures reproduce.

## What this does not show

- Git history can be rewritten before a report is made, and the figures say nothing about quality, review, design or mentoring.
- The Claude session exports contained no token or usage data, so they are used here only to describe the work and are not counted. Co-authored commits: none declare an AI tool in a trailer.
- No customer impact, speed-up or user numbers are claimed. Git cannot show them.
