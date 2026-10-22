# Claude Code usage and impact report

**Period:** 24 Sep – 21 Oct 2026 (the last month of session logs on this machine)
**Source:** local Claude Code session logs, 40 sessions. The git history of the four repos was used as a cross-check.

## Summary

Over the month I ran 40 Claude Code sessions. 23 were engineering work across four repos, 4 were planning docs, and 13 were API research. The engineering sessions made about 70 file edits and 30 file writes, ran `npm test` in every session, and attempted 7 pull requests. The most visible results in git are partial-refund handling, a `refund_reason` schema field, a signing-key rotation, two checkout fixes, an invoice rounding fix and a production RDS bump.

## Usage

| Area | Sessions | Model turns | Output tokens | What happened |
|---|---|---|---|---|
| acme-api | 9 | 120 | 38k | 45 edits, 18 new files, 9 test runs, 3 PRs |
| acme-web | 5 | 42 | 13k | 15 edits, 5 new files, 5 test runs, 2 PRs |
| billing-service | 3 | 19 | 6k | 6 edits, 3 new files, 3 test runs, 1 PR |
| infra-terraform | 2 | 11 | 3k | 4 edits, 2 test runs, 1 PR |
| notes (migration plan) | 4 | 4 | 4k | 4 documents written (~220 lines) |
| API research (pricing, rate limits) | 17 | 221 | 68k | 102 web searches, 119 page fetches |
| **Total** | **40** | **417** | **131k** | |

- Input was about 375k fresh tokens, 1.7M cache-write tokens and 12.5M cache-read tokens.
- Code changes were roughly 980 lines added and 630 removed through edits, plus about 2,000 lines in new files. These counts come from the edit and write calls, so they overstate the net diff.
- Tool calls: 70 Read, 70 Edit, 30 Write, 26 Bash, 102 WebSearch, 119 WebFetch.

## Impact

Commits attributable to this period (git history, author Morgan Lunt):

- **acme-api:**
  - orders: handle partial refunds
  - auth: rotate signing keys
  - schema: add refund_reason
  - tests: cover partial refunds
- **acme-web:**
  - checkout: inline tax breakdown
  - cart: fix stale totals
- **billing-service:** invoice: round to minor units
- **infra-terraform:** prod: bump rds instance class

Other outputs:

- 4 migration-plan drafts in the notes folder.
- 17 research sessions on pricing API changes and rate limits.

## Caveats

- **The logs record activity, not outcomes.** They don't contain tool results. I can't confirm that tests passed or that the 7 `gh pr create` calls succeeded or were merged. Check the PR list on GitHub before quoting a PR count.
- **Commits aren't linked to sessions.** The commit dates in the local repos don't line up cleanly with the session dates, so the mapping above is by topic and repo, not proven.
- **Research is the largest line item and has the weakest paper trail.** It used about half of all output tokens, but it left no file or commit. If you want to credit it, name the decision or document it fed.
- **No cost figure.** The logs don't record the model, so I haven't put a dollar amount on usage. Billing or the Anthropic console would have the real number.
- **Time saved is not measured.** Any hours-saved claim would be an estimate on top of this data.
