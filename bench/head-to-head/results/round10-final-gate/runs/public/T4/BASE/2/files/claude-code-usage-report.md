# Claude Code Usage & Impact Report
**Period:** 24 Sep – 21 Oct 2026 (28 days, from local session logs)

## Summary
Across 40 sessions and 64 prompts, Claude Code made 417 model calls. 19 of the 40 sessions were engineering work on four repos, which produced 7 pull requests. Most of the rest was web research on pricing-API and rate-limit changes. I also used it for 4 migration-plan drafts.

## Activity by area
| Area | Sessions | Prompts | Edits | Lines added / removed (approx.) | Files written | PRs opened |
|---|---|---|---|---|---|---|
| acme-api | 9 | 12 | 45 | +630 / −405 | 18 | 3 |
| acme-web | 5 | 7 | 15 | +210 / −135 | 5 | 2 |
| billing-service | 3 | 4 | 6 | +84 / −54 | 3 | 1 |
| infra-terraform | 2 | 3 | 4 | +56 / −36 | 0 | 1 |
| **Engineering subtotal** | **19** | **26** | **70** | **+980 / −630** | **26** | **7** |
| Research (web) | 17 | 34 | n/a | n/a | n/a | n/a |
| Planning notes | 4 | 4 | n/a | n/a | 4 | n/a |

- **Test runs:** `npm test` was run 19 times during the engineering sessions.
- **Research:** 221 web fetch/search calls (119 fetches, 102 searches) over 17 sessions, about 13 calls per session.
- **Planning:** 4 "migration plan" drafts, each written to a file.

## Token usage
| | Tokens |
|---|---|
| Input | 375,300 |
| Output | 131,050 |
| Cache writes | 1,668,000 |
| Cache reads | 12,510,000 |

Cache reads are about 88% of all tokens processed. That means sessions mostly reused context rather than re-sending it.

## What it delivered
- 7 PRs opened across acme-api, acme-web, billing-service and infra-terraform.
- Roughly 1,000 lines of net-new/changed code across 70 edits.
- Recurring research on pricing API and rate-limit changes, and 4 migration-plan drafts.

## Caveats
- The logs record activity, not outcomes. They don't show whether the PRs were merged, reviewed, or caught bugs, and I haven't included any time-saved estimate because nothing here supports one. If you want outcomes, add merge status from GitHub.
- Line counts are estimated from the edit diffs in the logs, so they're approximate. Newly written files aren't counted in them.
- All 17 research sessions asked the same two questions ("what changed in the pricing API?", "and the rate limits?"). That looks like repeated work. A saved summary or note would cut it.
- Dollar cost isn't included because the logs don't contain billing data.
