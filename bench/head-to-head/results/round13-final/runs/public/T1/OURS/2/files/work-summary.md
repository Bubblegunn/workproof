# Summary of software work: Jonathan Ong

**What this is.** A summary of the work recorded under Jonathan Ong's name in the version-control history of one private software project (a JavaScript library built during a client engagement). The source code is confidential and is not included. This summary was prepared from the project's change history, and every figure was computed by a tool and can be recomputed by anyone who is given access to the project.

**What it shows.** Who made which changes, and when. **What it does not show.** How many hours were worked, how good the work was, or the terms of the engagement. Those would need a letter from the client.

## Basis

- Dates are the dates each change was originally written (author date), not the date it was later merged.
- Work is counted under the identity set up in the project (Jonathan Ong, one email address): **56 changes**.
- Two further addresses appear to be the same person: one with the identical name "Jonathan Ong", and one under the username "jongleberry/jonathanong". They add 7 changes, giving **63 changes** in total. *Included: same name or same username on another address; please confirm.* All figures below use the 63.
- Period of the 63 changes: **7 November 2013 to 9 July 2015**. No change carries a future date.
- Changes by all contributors to the project over its whole history: **230** (60 distinct contributors). Jonathan Ong's 63 are therefore about 27% of the project's changes; most of the rest were written by others and are not claimed here.

## Figures

| Figure | Value |
|---|---|
| Changes written (63 as above, merges excluded) | 63 |
| Lines of code added, whitespace ignored | 1,200 |
| Lines of code removed, whitespace ignored | 1,686 |
| Lines added, raw (before ignoring spacing-only edits) | 1,276 |
| Lines removed, raw | 1,762 |
| Lines in the project today that were written by Jonathan Ong | 697 of 1,417 (49%) |
| Software versions released | 17 |

The gap between raw and whitespace-ignored (76 lines added and 76 removed, by subtraction) is indentation or spacing-only edits, which are left out of "lines written". No code written by third parties and no automatically generated code was found in these changes. The large figure for lines removed is mostly the deliberate deletion of out-of-date material (386 lines of old examples, counted by hand from one change) and the replacement of the core of the library.

## What was delivered

1. **New capability (November 2013).** Added support for handling groups of named items in one step, with performance measurements and a test for deeply nested use.
2. **Reliability fixes (November 2013 to March 2015).** Fixed a family of intermittent "already running" failures; fixed how settings and arguments are handed through; fixed a reported defect (March 2014); kept results in the order given; made error messages clearer when something unsupported is supplied; and made ordinary functions that fail report their errors correctly.
3. **Major rewrite (October to November 2014).** Replaced the library's internal approach to asynchronous operations with a newer standard one (389 lines added and 630 removed in one change, counted by hand), and published it as the new major version 4.0.0.
4. **Quality and automation (2013 to 2015).** Added automated tests, test-coverage reporting, and automatic test runs against new platform versions as they appeared.
5. **Documentation and clean-up (2013 to 2015).** Rewrote the project's introduction, removed obsolete examples, performance tests and build scripts, and removed an unused dependency.
6. **Releases.** Prepared and published 17 numbered versions, from 3.0.1 (December 2013) to 4.6.0 (July 2015).

## Not counted

- **13 merge records** made under these addresses: they join other people's contributions into the project and are not written work.
- **1 reversal** (12 November 2013) that undid an earlier small change of Jonathan Ong's own. The reversal itself is not counted as a deliverable; the original change stays in the totals as written work and is listed here as reverted.
- **19 changes** written by other people but recorded as saved by Jonathan Ong's address: not claimed.
- Nothing was excluded as spacing-only, automatically generated or third-party: the tool found none of these.

## Verification

The accompanying evidence folder contains a machine-readable report with a tamper-evident hash. Given read access to the project, an independent person can recompute every figure above and confirm it matches. This confirms the figures match the history; it does not prove the history itself is unedited.
