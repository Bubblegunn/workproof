# Claude Code usage and impact, 25 Sep – 22 Oct 2026

Prepared from local session logs and git history on this machine.

## Usage

| | |
|---|---|
| Sessions | 40 |
| Prompts sent | 64 |
| Model requests | 417 |
| Output tokens | about 131k |
| Fresh input tokens | about 375k |
| Cache read / cache write tokens | about 12.5M / 1.7M |

Tool calls: 119 web fetches, 102 web searches, 70 file reads, 70 edits, 30 file writes and 26 shell commands.

| Area | Sessions | Share of requests |
|---|---|---|
| Research / Q&A (outside any repo) | 17 | 53% |
| acme-api | 9 | 29% |
| acme-web | 5 | 10% |
| billing-service | 3 | 5% |
| infra-terraform | 2 | 3% |
| Migration-plan drafting (notes) | 4 | 1% |

## What it delivered

Seven small commits landed in the period. Each one changes a single line.

- **acme-api**
  - Handle partial refunds (21 Oct).
  - Rotate signing keys (18 Oct).
  - Add a `refund_reason` schema field (14 Oct).
  - Add partial-refund tests (7 Oct).
- **acme-web**
  - Fix stale cart totals (12 Oct).
  - Inline the tax breakdown at checkout (19 Oct).
- **billing-service**
  - Round invoices to minor units (15 Oct).
- **infra-terraform**
  - Bump the prod RDS instance class (10 Oct).
- **Notes**
  - Four sessions drafted the migration plan (`notes/migration-plan.md`).
- **Research**
  - Seventeen sessions looked into pricing API changes and rate limits. They produced answers, not files.

## Caveats

- **Commit-to-session matching is by date and repo only.** The logs have no link between a session and a commit. Several sessions may have fed one commit, and some sessions may not have produced one.
- **The commits are small.** The seven commits total seven changed lines, so the value is mostly in the investigation and the migration plan rather than in code volume.
- **Research value isn't measured.** Those sessions are about half the usage, and there's no record of what decisions they informed. Add that yourself if you can.
- **No cost figure.** The logs don't record the model or the price. I'm reporting tokens only. Most of the volume is cheap cache reads.
- **The "initial" commits are excluded.** They are all dated 23 Oct, after the period, and look like repo setup.
