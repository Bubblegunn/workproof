# Protocol for round 10 (frozen before any scored run)

The protocol is committed in `docs/HEAD-TO-HEAD.md` of branch `plugin-leadership`, sections "Rulings, round 10" and "Round 10 measurement protocol".

| Commit | Time (+03:00) | What |
|---|---|---|
| `f9f4d00` | 2026-10-22 22:32:50 | rulings, before any code change |
| `effaed4` | 2026-10-22 22:57:45 | harness change for set c (files changed vs the pristine fixture) |
| `523ddc4` | 2026-10-22 22:57:45 | product code under test |
| `5468312` | 2026-10-22 23:01:29 | measurement protocol |

The text below is an unedited copy of the two sections as of commit `5468312` (`git show 5468312:docs/HEAD-TO-HEAD.md`).

Which form of rule A the gate uses. The frozen win rule (`docs/HEAD-TO-HEAD.md`, "Win rule") reads: "our total is at least 20 percent above the best other arm's total". `score.py` prints that form (ours >= 1.2 x best total) and a lost-points form (ours lost <= 80 percent of the best other arm's lost points). Its `gate:` line uses the lost-points form; the `gate with the 1.2x form` line uses the frozen text. Both forms give the same verdict in both sets of this round.

---

## Rulings, round 10 (frozen 2026-10-22, owner decision, before any round 10 code change)

Source: the read-only diagnosis of the deep-round transcripts (side by side with the winning rival arms JD_I and CV_I and their code). Held-out set b and the public tasks are seen: they served only for this diagnosis. Criteria, checks, tasks, labels, grader prompt and the gate rules (Rule A, Rule B with the ceiling ruling, outcome criteria only, better of plain and invoked arm per competitor) do not change. Nothing in this section is changed after a result is seen. Every change below is general and names no file, person, address or repository of a seen task.

Diagnosis corrections to the deep-round report (they change what the fix must be): the H3 hint hook did match the H3 prompt (the phrase "my claude code sessions"); the weak H3 run is the run in which the skill WAS called and routed to a usage command that tells the model not to read raw session files. The missed H2 criterion was a per-row line count in an attached data file, not the SHA mismatch (that was found, by hand).

Loss classes, root causes (general) and rulings:

1. Answer completeness (H1). Root cause: a privacy or provenance rule written as an absolute ("quote only the tool report", "describe exclusions by rule") overrides the user's explicit request for figures and for the names of excluded items, and the tool report has no figure of the class the user asked for (windowed added and deleted totals); the skill forbids the only other source. Ruling: (a) the numbers and lists the user asked for are always given, each with its value, before any status note, for the user's own repository; privacy defaults protect only personal data the user did not ask for (a user who asks which identities or addresses were counted gets them); (b) the tool reports windowed lines added and deleted after exclusions, and an excluded-items block (merge commit ids, bot commit count, excluded paths with line counts, commits just outside the window with count and id); (c) the skill may run a read-only `git log --numstat` cross-check to fill a figure the report lacks, and shows the command; (d) the Stop-hook email block does not fire when the user's prompt asks for addresses or identities.
2. Trigger and route (H3). Root cause: a trigger on a topic phrase routes a task whose data source and fields differ from what the routed tool can produce (a user-supplied export folder, token totals, per-model counts, tool counts), and the routed command forbids the direct path. Ruling: (a) the hint hook and the skill description also name session, usage and export phrasings (session export or logs, token totals, per-model counts, tool counts, co-authored commits), and the hint states the capability limit: when the user names a folder of exported sessions, read that folder; do not answer from the default local logs; (b) `workproof sessions --dir <folder>` reads a user-named folder and adds unique assistant responses (dedup by message id, synthetic zero-usage excluded), token totals by type and per model, tool-call counts (dedup by tool-use id), with secret-looking strings and addresses redacted; (c) the usage command and skill drop "do not read raw session files" for a user-supplied export (kept for the default local logs); (d) if the tool reports 0 or 1 session while the prompt names a folder, the skill says to read that folder.
3. Received-evidence check (H2). Root cause: verification of a received bundle is left to model judgement below the headline totals (attachments, checksums, per-row claims), the tool compares only headline figures, and the fallback steps live in a reference file the model cannot find. Ruling: (a) `verdict` computes the SHA-256 of an attached data file and compares it with any hash string in the report; (b) for each row of an attached data file with a commit id and an added or deleted column it compares existence, author, date and line counts with `git show --numstat`, and lists commit ids not in the repository; (c) the parser ignores digits that belong to "SHA-256" when reading commit counts; (d) the received-report steps are inline in SKILL.md.
4. Output size (public T8). Root cause: a hard output constraint lives only in a secondary reference file the model may not open, no deterministic check enforces it, and the required add-ons (tags, tables, gaps) add words. Ruling: (a) the length cap is stated in the always-loaded SKILL.md ("the saved resume is under 450 words including tags and tables; edit the generator output, do not rebuild from the source"); (b) `bullets --out` counts words deterministically, has `--max-words` (default 450), and trims lowest-ranked bullets and coverage rows when over, saying so; (c) the Stop hook blocks once when a resume file written by `bullets` in the turn exceeds the cap.
5. Reference files (cross-cutting, seen in 4 runs). Root cause: plugin reference files are not found, so the model scans the whole disk. Ruling: the hint hook publishes the plugin root path in its context, the key steps are inline in SKILL.md, and the command bodies under `commands/` are thin and point to SKILL.md as the single source.

Rules for every change: general; code only from MIT, Apache-2.0, BSD or CC0 sources with attribution in `THIRD-PARTY-NOTICES.md`; every change has a test; `npm test` and `claude plugin validate .` pass; a Sonnet reviewer reads the diff. After the new held-out set (c) is opened the product does not change.

---

## Round 10 measurement protocol (frozen 2026-10-22, owner decision, before any round 10 run)

Written and committed before any scored round 10 run. Not changed after a result is seen. The only runs made before this commit are three diagnosis runs of the new code on seen held-out tasks (H1, H2, H3 of set b, 1 run each, not scored, 0.34 USD).

Code under test: product commit `523ddc4` (harness commit `effaed4`, rulings `f9f4d00`), from an immutable `git archive` copy built with `npm ci && npm run build`; `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `stop-check`. Sonnet (`claude-sonnet-5-5`), parallelism 3, temporary HOME per run, `guard.sh` around every run, no checkout/restore/stash/reset/clean in the working tree, rival code only from `git archive` copies, Vaara never run. Billing: `apiKeySource` of the first run is `ANTHROPIC_API_KEY` (checked, shim path).

Run path. Every `claude -p` call (runs, grading, writer, implementer, reviewer) goes through the Agent SDK shim (`claude_agent_sdk.query()`, same installed CLI 2.1.308, same stream-json output). The only measured difference from the older plain-CLI path is that the desktop app's `Artifact` tool and `artifact-diagramming` skill are absent on the SDK path; the benchmark tasks do not use them. Cells of older rounds (CLI path) are not used anywhere in the scored tables. Public competitor cells of this round come from the deep round (SDK path, same day, same pinned arms, same tasks, 3 runs each) and are marked "deep round transcripts" in the table; no cell of any other earlier round is reused.

Held-out set c: 5 tasks (C1 to C5), written by a fresh Sonnet agent that was given only the README's user-problem sentence and the task-template format (prompt, fixture build script, truth script, 5 outcome criteria); it was not shown the product code, `docs/HEAD-TO-HEAD.md`, the research report or any earlier held-out set, and it worked in an empty folder. Local branch `heldout-2026-10-c` (not pushed); the set is published only in the results folder after the gate. The controller read the set's README (hazard summary) after the writer finished; nothing from it was given to the implementer or the reviewer, and no product change was derived from it. All 25 criteria are outcome criteria. Fixtures are built by the writer's scripts (truth files reproduced exactly).

Runs.
1. HELD-OUT c: all arms x 3 new runs: OURS, BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I (165 runs). Order: by task C1..C5, all arms within a task.
2. PUBLIC (8 tasks T1..T8): OURS x 3 new runs (24 runs). Rival cells (BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I on all eight tasks; SR_I on T4) are the deep-round SDK-path transcripts, unchanged.

Grading. One common grading round in this session: for each task of each set one blind packet with ALL arms of that task together (public: the new OURS cells and the deep-round rival cells), arms in a shuffled letter order (seed recorded), all runs of an arm under its letter, one grader call per task (Sonnet, no tools, the grader prompt template of `assemble.py` unchanged; for set c the file listing uses `assemble.py` as committed in `effaed4` plus the exclusion of the harness file `portfolio-bank.md`, which only the JD_I arm receives). The deep-round scores are not used; every score in the tables comes from this round's grading. A malformed grader output is re-asked once, both outputs are kept, the second is scored. Outcome criteria only.

Gate. Rule A and Rule B (with the ceiling ruling) on the public set and on held-out set c, each separately; both must pass. Competitor = the better of its plain and invoked arm. An incomplete cell (error, rate limit) is re-run, never graded as a failure of the product.

Budget (owner): at most 34 USD for this session (runs, grading, writer, implementer, reviewer, sub-agents) in `workproof-r10-cost.tsv`; controller limit 6 USD. The run queue starts no new run when the session total reaches 26.5 USD (so grading fits); nothing new starts at 30 USD, the result and evidence folder are then written from the data collected and the steps not run are listed. Order of priority: set c all arms, public OURS, common grading, then F9 and F6.

F9 and F6 run only if both gates pass and budget remains below 30 USD. F9: Haiku and Opus, 1 run per task: OURS, the best rival arm of that task, BASE; public and set c. F6: 10 percent of cells re-run by an agent that has not read the code, graded independently, agreement rate reported. A partial final gate is not reported as a pass.

Evidence: `bench/head-to-head/results/round10-final-gate/` per `EVIDENCE-SPEC.md` (SUMMARY, PROTOCOL, arms.json, env.json, tasks/, runs/ redacted by a tested script, grades/, score.py that recomputes SUMMARY's tables, REPRODUCE.md, VERIFY.md, SHA256SUMS).
