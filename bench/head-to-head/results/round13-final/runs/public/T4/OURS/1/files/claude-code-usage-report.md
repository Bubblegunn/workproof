# Claude Code usage and impact, 24 Sep – 23 Oct 2026

Prepared for: my manager. Period: the last 30 days (sessions counted by the date they started).

## Usage
- **40 sessions** in the period, on **28 of 30 days**. Each session counted once.
- **64 prompts** I typed; Claude replied **417 times**, and each reply either read, searched, edited or ran something (417 actions in total).
- Where the time went: **17 sessions were research** with no project attached (about 221 of the 417 actions were web lookups and searches), **19 sessions were hands-on work** in four code projects, and **4 were notes and planning**.

## What it delivered
Eight changes to our code were recorded in the period under my name:
- **Orders:** support for partial refunds, with tests covering them.
- **Database:** a new field recording why a refund was made.
- **Security:** rotation of the signing keys used for sign-in.
- **Storefront:** fixed carts showing stale totals; checkout now shows the tax breakdown inline.
- **Billing:** invoice amounts now round correctly to the smallest currency unit.
- **Infrastructure:** moved the production database to a larger instance size.

The research sessions fed decisions and plans (migration plan, on-call runbook notes); they produced no code of their own.

## What this does not show
- The usage logs and the code history are separate records. **I cannot show which of the eight changes came from which session**, so I am not claiming Claude wrote them, only that they landed in the same projects during the same weeks.
- Seven pull-request creation commands were run in sessions. That shows they were attempted, not that they were opened or merged.
- Not counted as delivered: four "initial" baseline commits (one per project, dated 23 Oct) that set up each project's history rather than adding a feature. No reverted, merged or whitespace-only changes were found.
- Counts say nothing about quality or time saved. I have no measured time saving to report.

## Basis
Sessions from this machine's Claude Code logs, window 24 Sep – 23 Oct 2026 (first-message date). Changes counted by author date in the same window, for my address only: 12 authored in total across four projects, 4 baseline, 8 counted.
