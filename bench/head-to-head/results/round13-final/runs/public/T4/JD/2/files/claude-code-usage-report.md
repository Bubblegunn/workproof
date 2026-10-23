# Claude Code usage and impact, 25 Sep – 22 Oct 2026

## Summary
Over four weeks I ran 40 Claude Code sessions (417 model requests). About 45% of sessions were code changes across four repos. The rest was API research and drafting. Eight commits in those repos line up by date with coding sessions.

## Usage
| Area | Sessions | Prompts | Model requests |
|---|---|---|---|
| acme-api | 9 | 12 | 120 |
| acme-web | 5 | 7 | 42 |
| billing-service | 3 | 4 | 19 |
| infra-terraform | 2 | 3 | 11 |
| Migration-plan notes | 4 | 4 | 4 |
| Research (web search/fetch, outside any repo) | 17 | 34 | 221 |
| **Total** | **40** | **64** | **417** |

- Tokens: ~375K input, ~131K output. Cache reads were ~12.5M and cache writes ~1.7M.
- Tool use: 221 web searches/fetches, 70 file reads, 70 edits, 30 file writes, 26 shell commands.

## What it delivered
Commits below match coding sessions on the same date. The match is inferred from dates, not recorded by the tool, and I haven't verified it commit by commit.

- **acme-api (4 commits):** partial-refund handling (21 Oct), signing-key rotation (18 Oct), `refund_reason` schema addition (14 Oct), and tests for partial refunds (7 Oct).
- **acme-web (2 commits):** inline tax breakdown at checkout (19 Oct) and a fix for stale cart totals (12 Oct).
- **billing-service (1 commit):** invoice rounding to minor units (15 Oct).
- **infra-terraform (1 commit):** prod RDS instance class bump (10 Oct).
- **Migration plan:** drafted over 4 sessions, saved in `notes/`.
- **Research:** 17 sessions on pricing-API changes and rate limits.

In 7 coding sessions I also asked Claude to open the PR.

## Caveats
- The logs have token counts and tool calls only. They don't have time saved, review outcomes or whether PRs merged, so I can't give a time-saved number.
- The commits don't carry a Claude co-author tag. Linking them to Claude is by date only.
- Most sessions were short (about 1–2 prompts), so the volume is modest.
- The research sessions ask the same two questions repeatedly (17 times each). I should probably save that answer somewhere reusable.
