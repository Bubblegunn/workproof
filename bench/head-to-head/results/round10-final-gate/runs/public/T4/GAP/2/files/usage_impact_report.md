# Claude Code usage and impact, 24 Sep – 21 Oct 2026

Source: the 40 local session logs on this machine. Every figure below comes from those logs.

## Usage

| | |
|---|---|
| Sessions | 40 |
| Prompts sent | 64 |
| Model requests | 417 |
| Tool calls | 417 |
| Output tokens | about 131K |
| Fresh input tokens | about 375K |
| Cached context | about 1.7M tokens written, 12.5M read |

## Where the time went

| Area | Sessions | What it was |
|---|---|---|
| Research (not in a repo) | 17 | Questions such as "what changed in the pricing API?" and "and the rate limits?". 221 web searches and fetches. |
| acme-api | 9 | Feature work: 45 edits, 3 PRs opened |
| acme-web | 5 | Feature work: 15 edits, 2 PRs opened |
| billing-service | 3 | 6 edits, 1 PR opened |
| infra-terraform | 2 | 4 edits, 1 PR opened |
| notes | 4 | Drafting a migration plan, once a week |

## Output

- **Code:** 70 edits across 4 repos, roughly +980 / −630 lines. It also created 30 files.
- **Verification:** `npm test` ran 19 times, so most code changes were tested.
- **Pull requests:** 7 `gh pr create` calls across 4 repos.
- **Research:** 17 sessions on pricing API and rate-limit changes, plus 4 drafts of a migration plan.

## Caveats

- The logs record activity, not outcomes. I can't tell from them whether the 7 PRs were merged, whether the tests passed, or whether the research changed a decision. Add those from your PR history before sending.
- Line counts are estimated from the size of each edit, so treat them as approximate.
- The logs don't show time saved. I haven't put a time or cost figure on this because I'd be guessing.
