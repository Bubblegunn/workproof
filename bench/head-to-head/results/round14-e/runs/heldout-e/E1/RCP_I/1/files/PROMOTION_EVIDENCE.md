# Promotion evidence: Priya Raman, 1 Jan – 30 Jun 2026

Source: `git log` of this repository only (a fork of the `prettytable` library). No code is quoted. Dates are author dates. Commit subjects are paraphrased where it helps. Everything below can be re-checked against the history by anyone with repo access.

## Summary

In six months I authored **7 substantive commits** (8 if the second-identity commit below is mine). They added roughly **340 lines** of hand-written source, tests and docs. The work is on three features:

- JSON export, with its options and tests
- a CLI flag for JSON export
- documentation for pagination

I also added tests for sorting that another engineer wrote. The raw git totals look about 100x bigger than this (~32,000 lines added). Almost all of that is a data file and a lockfile, so I don't use those totals.

## What I delivered

| Date | Commit | What | Lines added (removed) |
|---|---|---|---|
| 12 Jan | 2449bc2 | JSON export for tables (new module) | 60 |
| 10 Mar | 80c7dba | Export options (new module) | 35 |
| 12 Mar | bf435d7 | More export options | 12 |
| 14 Mar | 2aa6909 | Tests for JSON export | 90 |
| 15 Apr | 3462950 | Docs explaining pagination | 40 |
| 2 Jun | 16de668 | Tests covering stable sorting (rewrote an existing test file) | 55 (119) |
| 28 Jun | 2468e12 | CLI flag for JSON export | 45 |

- **Total added:** about 337 lines.
  - Source: ~152.
  - Tests: ~145.
  - Docs: 40.
- **Export feature:** the export commits were merged via PR #41 on 18 Mar. The merge was done by a colleague, Tomasz Varga.
- **Test rewrite:** the 2 Jun commit removed more lines than it added (net −64), so it shouldn't be read as growth.

### Counted but with a caveat

- **`0b92a08` (20 Jan, +5 lines)** fixes None cells in JSON export. It is authored as `priya <priya@priya-laptop.invalid>`, not "Priya Raman". The fix touches my own feature, so it is probably mine, but git can't prove it. *I should confirm this before submitting.*

## What I'm deliberately not claiming

- **Sample dataset (10 Feb, +30,002 lines) and pip-compile lockfile (11 Feb, +1,800 lines).** I committed both, but one is data and the other is generated. They are not authored code, and including them would inflate my output about 100x.
- **Paginate cache (5 Mar, +120) and its revert (6 Mar, −120).** Net zero. This is shipped nothing, and I'm not counting it as output.
- **Two "unit helper" commits (+50 lines).** The author dates are 29–30 Dec 2025, which is outside the period. They were committed on 8–9 Jan 2026, which looks like a rebase or cherry-pick. They are also under the second identity. Excluded.
- **Merge commit (11 May).** Mechanical, not authored work.
- **Stable sorting feature (3 Feb, +50 lines).** Written by Lena Fischer. My part is only the June tests.
- **CSV dialect option (4 May).** Written by Tomasz Varga. His commit message thanks me for a review, but the repo holds no review record. If I want to claim it, I need a link to the PR comments.
- **Docs note (14 Jul).** After 30 Jun.

## How far the numbers can be trusted

- **Commit counts and dates:** reliable. They come straight from git. The only ambiguity is the second author identity.
- **Line counts:** approximate and only an indicator of size, not of value. Added lines don't measure difficulty or impact. The test rewrite and the revert show that lines go both up and down.
- **Attribution:** by author name and email in git. Pair work, squashed commits and work done outside this repo would not show up. The count could therefore understate my contribution but is unlikely to overstate it.
- **Scope:** a single repository. Nothing here covers design discussions, reviews, on-call work or mentoring. Those need separate evidence.
- **Impact:** not measured. The repo shows what was built, not whether anyone used it or what it saved. Adoption numbers, user feedback or a manager's statement would turn "delivered" into "mattered".

## Suggested additions by hand

Before this goes to the committee, add:

1. Links to PR #41 and any review threads, especially the CSV dialect review.
2. One or two concrete outcomes. For example, who uses JSON export and what it replaced.
3. A line on why the paginate cache was reverted, if the reason was a good engineering call. A deliberate revert can count in my favour.
