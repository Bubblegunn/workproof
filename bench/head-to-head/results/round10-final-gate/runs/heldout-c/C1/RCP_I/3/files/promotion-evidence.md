# Promotion Evidence: Dana Reyes, January – June 2025

Source: git history of the team's Markdown-parsing library (a private Acme repo). This summary describes the work in plain terms and shares no code. Sizes are lines added, from the commit records. Counts use commits authored under dana.reyes@acme-corp.example between 2025-01-01 and 2025-06-30.

## Summary

Four features delivered, plus one bug fix, a build-reliability change and a codebase-wide formatting rollout. About 320 lines of new feature and test code, spread over 4 new modules and 2 test files. Each feature has automated tests or sits alongside them.

## What I delivered

| Date | Deliverable | What it does and why it matters | Size |
|---|---|---|---|
| Jan 14 | **Table-of-contents extension** | Lets documents automatically generate a table of contents from their headings. Shipped with its own tests. | ~90 lines (60 feature, 30 tests), 2 files |
| Feb 3 | **Fix for duplicate heading IDs** | Fixed a bug in the table-of-contents feature where two headings with the same text got the same link target. | 4 lines, 1 file |
| Feb 10 | **Offline-build support** | Bundled a third-party text-slug library into the repo so builds no longer depend on downloading it. This makes builds reproducible and usable without network access. | Large by line count (~6,000), but it is third-party code copied in, not code I wrote. Please don't count it as output. |
| Mar 12 | **Footnote output for LaTeX** | Added support for rendering footnotes when documents are converted to LaTeX, which is used for print and academic output. | ~120 lines, 1 new module |
| Apr 15–17 | **Math plugin v2** | A rewrite of math-formula support that adds block-level formulas (display equations), not only inline ones. Built on a feature branch, tested (36 lines), and merged. | ~110 lines (75 feature, 36 tests), 2 files |
| May 6 | **Standard formatter header across all source files** | A mechanical, repo-wide change that applied the team's formatting header to every source file, so tooling treats the whole codebase consistently. | 37 files, 1 line each |

## Things to know before presenting this

- **Parser speed-up, reverted.** On Apr 2 I shipped a change described as making the inline parser 30% faster. I reverted it on Apr 4. The history doesn't say why, so I've left it out of the deliverables. If it was reverted for a good reason, such as catching a correctness problem before release, you could mention that yourself. The history doesn't show the reason.
- **Abbreviation extension plugin.** The commit is dated Nov 30, 2024 and only landed in this branch's history in May 2025. I treated it as outside January–June and excluded it. If it was released to users in that window, tell me and I'll add it. About 54 lines.
- **One commit under a personal email.** The Feb 3 heading-ID fix is authored as `dreyes <dana.reyes@gmail.example>`. I assumed it's yours and included it. Remove it if it isn't.
- **Collaboration.** Priya Nair made follow-up changes on my footnote renderer (Mar 20, 5 lines) and on the abbreviation plugin (Jun 2, 4 lines). This is evidence of work others built on, but not my work.
- **Not counted:** a dependency-bot version bump (Mar 5).

## What this can't show

Git history shows what was built and when. It doesn't show adoption, bugs prevented, how hard the problems were or review effort. For the committee, add a sentence or two on who uses these features (or why they were needed) and any requests, issues or customer asks they resolved.
