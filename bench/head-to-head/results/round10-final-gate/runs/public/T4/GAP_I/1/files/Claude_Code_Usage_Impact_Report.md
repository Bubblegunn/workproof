# Claude Code Usage and Impact Report

Period: 24 Sep 2026 to 21 Oct 2026 (activity logged on 28 days)
Source: local Claude Code session logs (40 sessions, 417 assistant turns, 64 prompts)

## Summary

Over the past month, Claude Code was used for four things: feature work across four code repositories, a migration plan, and a large amount of API and documentation research. It produced **7 pull requests** and about **3,000 lines of new or changed code** in four repos. It also produced 4 planning documents and answered about 17 research questions.

## Work delivered, by area

| Area | Sessions | What was done | Output |
|---|---|---|---|
| acme-api | 9 | Feature work in the API (routes and tests) | 3 PRs opened, ~1,890 lines added, 18 new files |
| acme-web | 5 | Front-end feature work | 2 PRs opened, ~560 lines added, 5 new files |
| billing-service | 3 | Billing changes | 1 PR opened, ~294 lines added, 3 new files |
| infra-terraform | 2 | Infrastructure changes | 1 PR opened, ~56 lines added |
| notes | 4 | Migration plan drafting | 4 documents written (~220 lines) |
| Research (outside any repo) | 17 | Pricing API changes and rate limits, by web search and fetch | 221 turns of web research |

Code work in total: 19 sessions, 45+15+6+4 = 70 file edits, 26 new files, 21 test runs (`npm test`) and 7 PRs.

## Usage

- Sessions: 40, across 28 days. That is roughly daily use.
- Prompts: 64. Claude took about 6.5 turns of work per prompt, so most prompts were short instructions that Claude carried out on its own (for example "add the thing", "open the PR").
- Tokens: about 131K output, 375K fresh input, and 12.5M cache-read tokens. Cache reads are most of the volume, which means long sessions reused context efficiently.
- Research was the biggest share of usage: about half of all tokens (68K of 131K output) went to web search and fetch, not code.

## Impact and caveats

- Every code session that opened a PR also ran the tests first, so the pattern is edit, test, PR.
- The logs record what Claude did. They do not record outcomes. I can't tell from them whether the PRs were merged, whether the tests passed, or how much time was saved. Add merge status from GitHub before sending this if you want to claim delivery.
- Line counts come from the edit and write calls in the logs, not from final git diffs, so treat them as approximate.
- No dollar cost is included because the logs don't record the model or price paid.

## Suggested next step

Pull the merged/closed status of the 7 PRs from GitHub and add a line like "X of 7 merged" to the summary.
