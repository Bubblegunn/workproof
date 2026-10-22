# workproof compared with other Claude Code plugins

This page compares workproof with other tools that turn a person's work into a document for a CV, a manager or a job application. Each cell was read from the tool's own repository on 2026-10-21 (the file names are in the measurement folder of the head-to-head run). Each cell says yes, no or partial with a few words. The measured runs are in [HEAD-TO-HEAD.md](HEAD-TO-HEAD.md).

Licences, read from each repository: workproof MIT; [receipts](https://github.com/anthropics/claude-plugins-official) Apache-2.0; [JD Resume Tailor](https://github.com/Day-Raval/jd-resume-tailor) MIT; [GapToGrowth](https://github.com/sidhartharivarasan/gaptogrowth) MIT; [Infinite Resume](https://github.com/sattyapatil/infinite-resume-claude-plugin) MIT.

| | workproof (MIT) | receipts (Apache-2.0) | JD Resume Tailor (MIT) | Infinite Resume (MIT) | GapToGrowth (MIT) |
|---|---|---|---|---|---|
| reads a git repo to measure your own work | yes | partial: only commits that carry files Claude Code touched | no | no | no |
| works on hand-written work without Claude Code history | yes | no: reads the Claude Code session logs only | not applicable | not applicable | not applicable |
| a hash a reader can recompute | yes | no | no | no | no |
| a reviewer can recompute the figures from the repo | yes (`verify`) | no | no | no | no |
| a second person can sign the figures | yes (`countersign`) | no | no | no | no |
| several identities in one repo | yes: merged by strong rules and listed, `--no-merge-identities` to opt out | partial: one git email | not applicable | not applicable | not applicable |
| no emails or paths by default | yes | partial: project names verbatim, tells you to check | not applicable | not applicable | not applicable |
| states what each figure cannot show | yes, under every figure | partial: footnotes about columns | partial: a "Gaps" section | partial | partial: a confidence score |
| CV bullets written for you | yes, from the report, with source tags | no | yes, from a bank you write | yes, interview-driven | yes, from past resumes |
| every bullet traces to a fact | yes: figure id and hash prefix | no | yes: source tags to the bank | partial: supported, ambiguous or unsupported | partial: a verified skills evidence bank |
| tailors to a job description | yes, from a report, bank or past resume, with source tags and a Gaps list (no Word or PDF output, no learning hub) | no | yes | yes | yes |
| usage report for a manager | yes, from the local session logs (miner adapted from receipts, no printable receipt) | yes | no | no | no |
| works headless, with no account | yes | yes | yes | partial: the skill yes, the preview handoff needs a sign-in | partial: wants a project folder and Cowork |

## Where the others are ahead

- receipts makes a printable Claude Code usage receipt: an HTML page that prints to PDF, with a CSV export, for a manager who asks what your usage delivered. workproof's usage report is a markdown file written from the same counts; it has no printable receipt and no CSV export.
- JD Resume Tailor, Infinite Resume and GapToGrowth were built to tailor a resume to a job description you paste. workproof's tailoring step is newer and narrower: it writes a markdown file from the facts you give it with source tags and a Gaps list, and it has no Word or PDF output, no ATS layout rules beyond one page and one column, and no learning hub.

## Measured

The six public tasks, the harness and the baseline table are in [HEAD-TO-HEAD.md](HEAD-TO-HEAD.md). The baseline numbers there were measured before round 1 of the plugin work, on workproof 0.7.0 on 2026-10-21. They describe that version only.

## Credit

`skills/workproof/references/bullets.md` and `skills/workproof/references/tailor.md` are adapted from JD Resume Tailor by Dayesh Raval, under the MIT licence (Copyright (c) 2026 Dayesh Raval): [github.com/Day-Raval/jd-resume-tailor](https://github.com/Day-Raval/jd-resume-tailor).

`src/sessions/mine-sessions.mjs` (run as `workproof sessions`) is adapted from `mine-transcripts.mjs` in the receipts plugin of [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official), under the Apache License 2.0 (the licence text is `src/sessions/LICENSE-APACHE-2.0`; the original carries no copyright line and the plugin ships no NOTICE file). The changes are listed in the header of the file.
