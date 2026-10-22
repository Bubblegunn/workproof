# Q3 2025 Summary (July to September)

Ines Kowalski

## Highlights

- Added support for hex color strings with an alpha channel (for example `#ff000080`), prompted by a customer report of washed-out colors. Documented the new syntax in the readme.
- Added Node 22 to the CI test matrix.

## What got done

**Alpha channel support for hex colors (Jul, Sep).** A customer reported washed-out colors, which traced back to hex strings with transparency not being handled. I built the parsing for 8-digit hex values as a new module and wired it into the library. The test suite passed in full before commit. In late September I added a readme section so users can find and use the syntax.

**CI coverage for Node 22 (Aug).** Added a workflow so the library is tested against Node 22 alongside the existing versions, which keeps us ahead of runtime upgrades for downstream users.

## Explored but not shipped

- **TypeScript types for level detection (Sep).** Wrote and merged type definitions, then reverted them a few days later. Not part of the shipped Q3 work.
- **Chained style lookup performance (Aug).** Investigated speeding up chained lookups. An early benchmark showed roughly 2x, but I did not trust the numbers and held the change back rather than merge it. No performance claim is made here.

## Notes for the reviewer

- Everything above is in the git history or my session logs for the quarter. No further results or metrics are claimed.
- The v6 migration guide draft was started in early October, so it belongs to Q4.
