# Best-rival analysis, round 13 (research, plan, development-gate proposal)

Scope (owner brief 2026-10-23): research and development only. No benchmark run, no grading call, no `claude -p`. Held-out sets are sealed: nothing under `bench/head-to-head/results/round11-final-gate/`, no `heldout*` branch or folder and no `/private/tmp/h2h-wp-r11m-hod-runs` was opened. Set c and the public set are seen and serve for diagnosis only. This file extends `BEST-RIVAL-r12.md` (committed `dd769bb`); it does not repeat its loss table or technique maps. Criteria, tasks, checks and grader prompts are unchanged.

Launch claim to reach (spec 2b, claim I1): in each benchmark set the 95 percent bootstrap interval of (ours minus the best other arm's total) lies above zero. Position at the start of this round: public set first (r10 34.67 of 35), held-out set c 10th of 11 (18.33 of 25; RCP plain 22.33).

## 1. Why the strong rivals win on held-out-style tasks (what is known, what is not)

Known from `BEST-RIVAL-r12.md` section 1 and 4 (not re-measured):
1. The best rival cells are plain-model cells. RCP, JD, SR and BASE loaded no skill on set c. Their score is the model's default behaviour on a task that is written in plain user language.
2. Our losses on set c are numbers and omissions written by hand (4 for 3 commits, a raw file count used as a session count, a hand figure replacing the tool figure) and a rule that contradicted the request.
3. Our skill reached the model through the hint and always-loaded rules, not through a skill call.

New in this round (research, section 2): four outside sources agree with the r12 design and add three gaps that r12 recorded as "not this round" or did not see.

## 2. Outside research

Method: WebSearch and WebFetch, 2026-10-23. Only what the fetched page states is written as fact; everything else is marked as not verified.

| # | Source | Licence | What it says | What users get from it | Adopt? |
|---|---|---|---|---|---|
| R1 | Proof-Carrying Numbers, arXiv 2509.06902 (https://arxiv.org/abs/2509.06902) | paper | Numbers are emitted as claim-bound tokens; a verifier checks each against a declared policy (exact match, rounding, aliases, tolerance with qualifiers) in the renderer, not the model; unmarked numbers default to unverified (fail closed). The page reports proofs, no experiments. | A reader can tell a checked number from a typed one. | Already adopted in spirit by r12 F2 (`figures --doc`). Extension for round 13: the read-back must say, per number, "equals <label>" or "equals no computed figure", and the rules must say a number with no label is unverified. No new code beyond F2 except the session rows below. |
| R2 | git-hours (https://github.com/kimmobrunfeldt/git-hours) | MIT | Estimates hours by grouping commit timestamps into sessions (gap threshold 120 minutes, 120 minutes added for the first commit). The README itself says the result is not accurate enough for billing. | Rough effort estimate. | Rejected. History shows what, who and when, not time spent; our rule 7 says so. An hours figure would be the kind of invented number the judges punish. Recorded so it is not proposed again. |
| R3 | Scholtes et al. and the reply "Aristotle vs. Ringelmann", arXiv 1608.03608 (https://arxiv.org/pdf/1608.03608) | paper | Academic dispute on whether commit counts are a valid output measure; the reply models commit counts as a power-law across contributors. Page-level reading only; the original paper was not fetched. | Support for the stated limit "a commit count is activity, not output". | Citation only, no code. The limit is already in the skill; no new text (text added must be paid for by text removed). |
| R4 | Julia Evans, brag documents (https://jvns.ca/blog/brag-documents/) | not stated | Structure: goals, projects (contribution and impact), collaboration, documentation, what you learned. Advice: state your specific contribution, add impact with numbers where they exist, and describe the work "exactly as good as it is". | The shape people expect from a promotion file. | Idea only. Our rules already say contribution is not leadership and estimates are labelled; a fixed template would repeat the JD nine-section mistake (r12 section 6, rejected). |
| R5 | Open-source git analytics already surveyed in r12 section 5 (git-fame MPL-2.0 idea only; git-who MIT; git-quick-stats MIT; gitinspector GPL idea only) | as listed | Label each figure by method; one identity key; state merge, whitespace, move and bot policy. | Figures a reader can reproduce. | Adopted in r12 F1. No change. |

Searched and not found: a public benchmark of report-level numeric fidelity for documents written from git history (WebSearch returned claim-level datasets only: QuanTemp, NumPert, HallucinoType). Recorded as a limit: there is no external yardstick for our category beyond our own head-to-head.

## 3. Remaining gaps after the round 12 implementation

G6 (carried over from r12, now planned). The session count is the one number class that `figures` does not cover. `workproof sessions --dir <folder>` prints one total over the whole folder. A task that asks for a window ("sessions in the quarter on the named work") gets the folder total, and the model then picks a number by hand (C4: a raw file count, or a personal session included). Fix, general and deterministic: `sessions --dir` accepts `--since` and `--until` (calendar dates) and prints, next to the totals, one compact row per session (an opaque short id, first and last timestamp, assistant responses, tool calls, and the last path segment of the working directory when the log carries one), plus the number of exported files, the number of unique sessions and the number of files that repeat a session. Paths, prompt text and message text stay out of the output (existing rule of `export-usage.mjs`). The model decides which rows belong to the named work; the count it then writes is the number of rows it kept, which it can show.

G7 (new). The rules say "after writing run `figures --doc`", but the hint and the session pointer are the only always-loaded places. A document written by a sub-agent or after context compaction may skip it. Mitigation inside the existing text: none that is deterministic. Recorded, not planned: any hook that checks the finished file is a Stop-hook change, which r12 F6 excludes.

G8 (new, small). `figures --doc` lists numbers next to counting nouns only. A table cell with a bare number under a header such as "Commits" is not read. Fix: treat a Markdown table column whose header contains a counting noun as that noun for its numeric cells. General, deterministic, same file.

Not adopted: hours estimates (R2), fixed document templates (R4), a PII validator (r12 F6, still later), embeddings or NER for résumé matching (r12 section 5).

## 4. Plan

| Task | Closes | Files | Tests | Mutation check |
|---|---|---|---|---|
| T0 | commit the r12 implementation after review | existing working tree | `npm test`, `npm run lint` | reviewer names vacuous tests |
| T1 | G8 table-column nouns in `figures --doc` | `src/figures.ts`, `test/figures-command.test.ts` | a document with a "Commits" column table: the cell number is read; a table with an unrelated header is not | remove the header rule: the new test fails |
| T2 | G6 window and per-session rows in `sessions --dir` | `src/sessions/export-usage.mjs`, `src/sessions/mine-sessions.mjs` (option gate), `src/cli.ts` help, `test/sessions-miner.test.mjs` | synthetic export: two files that repeat one session, one session outside the window, one with no timestamp; the counts and rows are exact; no path or prompt text in output | change the window comparison to `<`: the boundary test fails |
| T3 | wire G6 into the rules in the same length | `skills/workproof/SKILL.md` step 0, `references/core-rules.md` rule 5 (must stay under 3,000 bytes) | `plugin-skill`, `plugin-trigger` tests | n/a (text) |

Ruling log:
- D1: no change to the Verdict wording, Stop hook, hint patterns, tasks, criteria (frozen by r12 F6 and the brief).
- D2: no hours estimate (R2), recorded above.
- D3: the session rows carry no prompt text because `export-usage.mjs` promises none; topic relevance stays a model decision shown as kept rows.
- D4: text added must be paid for by text removed; T3 replaces the SKILL.md step-0 sentence on session counts rather than appending.
- D5: Haiku implementers, Sonnet reviewers, one implementer at a time; commit and push after each reviewed task; no `claude -p`.

## 5. Limits

- No measurement in this round. Every score quoted is from rounds 10 and 11.
- R1 to R4 were read at page level through a summarising fetch; claims about internals that the pages do not state are not made.
- The sealed folders were not read, so nothing here depends on held-out set d.
