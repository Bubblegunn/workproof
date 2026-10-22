# Deep research, 2026-10-22

Method: four Sonnet research agents (`claude -p`, API-key billing, cost in the session report) read the transcripts and the full source of the competitors and surveyed open-source tools. Competitor code was read, never run. Clones were `git clone --depth 1` under `/tmp/deep-comp/`. Claims carry `file:line` of the competitor clone at the pinned sha. Items marked "unverified" were not confirmed by the agent. The unseen held-out set was not opened.

## Summary

Loss classes (Phase 1): trigger gap; tool-only dependency with no fallback; refusal instead of deliver-with-note; final chat answer lacks what only the file holds; privacy applies to files only; model rewrites deterministic output; parser strictness on unseen formats; skill adds variance where the bare model is at the ceiling.

Five techniques with the largest expected effect, and the source and licence of each:

1. A fixed, mandatory closing statement per task type, as JD Resume Tailor prints fixed `## Gaps` and `## Coverage score` sections (`jd SKILL.md:47,78-87`, MIT). Closes: final answer incomplete (T7, T8). Idea, rewritten.
2. A deterministic filter for the final chat answer: email regex plus an exact deny list built from the repository authors, with Unicode normalisation (no dependency, own code). Receipts ideas: path cut to two segments, read project names back, never send email (`receipts SKILL.md:277-283`, `mine-transcripts.mjs:365-371`, Apache-2.0, idea). Closes: privacy in chat (H2).
3. Foreign-report fallback by schema-tolerant field matching and plain `git` counting with `-w -M -C` and `.mailmap` (git manuals; git-who and git-quick-stats MIT ideas for per-author cross-checks; git-fame MPL-2.0 and gitinspector GPL-3.0 are idea-only or rejected). Closes: H3 class. Idea.
4. Knockout versus nice-to-have flag per JD requirement, hard-requirement lines reported as gap lines without blocking (`cv tailor-resume/SKILL.md:32-36,63-67`, MIT, prose may be copied with notice) and the ownership-preservation examples (`cv references/writing-quality.md:55-56,145,160-165`, MIT). Closes: gap quality and scope inflation.
5. Session-report parsing details: 5-minute idle cutoff for active time, skip auto-continuation messages when counting prompts, state the window and root read (`sr analyze-sessions.mjs:50,238-241,442-450`, Apache-2.0, code reusable with attribution). Closes: usage-report class; low priority because SR does not threaten T4.

Rejected for licence or weight: gitinspector (GPL-3.0), pyresparser (GPL-3.0), OpenResume (AGPL-3.0), KeyBERT (PyTorch), jobbert and the LinkedIn skills NER (no licence stated), Presidio and scrubadub code (Python, models). Details and the ranked list are in Phase 2c.

## Phase 1: loss analysis

Scope: workproof (OURS) against the seven competitor arms (BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I) on public tasks T1-T8, rounds 1-8, and held-out tasks H1-H3 (final gate). No model was run and nothing was measured for this file.

Notes on method and limits:
- `deep/common.md` describes a different repository (ai-slop-linter). I applied only its general rules: no competitor code executed, no edits outside the output file, literal prose, evidence as `path:line`, "unverified" where I did not check.
- Sources read: `docs/HEAD-TO-HEAD.md` (Results rounds 1-8, final gate), `bench/head-to-head/results/final-gate-T6.md`, `final-gate-heldout.md`, `round8.md`, run transcripts under `/tmp/h2h-wp-r2-runs`, `r3-runs`, `r4-runs`, `r5-runs`, `r7-runs`, and one grader file `/tmp/h2h-wp-r5-grade/T7-grade.json`.
- I did NOT re-read `workproof-report.md` or `workproof-scan.md`. Unverified.
- Held-out H1-H3 transcripts of the final gate are not on disk (`docs/HEAD-TO-HEAD.md` final gate: "Raw transcripts are not committed"; no `/tmp/h2h-wp-final*` runs directory exists). For H1-H3 the winner's behaviour is taken from the document's own "Why the held-out tasks fail" section, which cites transcripts I could not open. Marked "doc only".
- Rounds 6 and 7 transcripts of competitor winners were sampled, not all read. Per-cell transcripts read: R2 T4-RCP-1, R2 T6-RCP-1, R3 T3-JD-1, R3 T3-OURS-1, R4 T7-OURS-2, R5 T7-JD-1, R5 T7-OURS-1, R7 T8-BASE-1.
- Ours won or reached the ceiling on T1, T2, T5 in every round, so those are not in the table except where one run lost a point.

### Loss table

"Loss" means ours was below a competitor, or tied a competitor below the ceiling, or tied at the ceiling when the rule required reaching the maximum and ours did not. Scores are outcome means (rounds 2-8: outcome criteria only; round 1: 5-criteria total).

| Task | Round | Winner arm(s) and score | What the winner did | What ours did | Root cause | Already fixed? |
|---|---|---|---|---|---|---|
| T4 usage report | 1 | RCP 5.00 vs ours 4.00 (skill 0 of 3 runs) | Receipts plugin built the usage report from session logs (`docs/HEAD-TO-HEAD.md` round 1 table). | Skill did not fire; the runs wrote a git-based report. | Trigger: the skill description did not match "usage report"; task is receipts' home ground. | Partly. Later rounds route it to `workproof sessions` (R4 "T3 and T4 now reach the maximum"). Commit not looked up. |
| T4 | 2 | RCP, RCP_I 4.00 vs ours 2.00 | `/tmp/h2h-wp-r2-runs/T4-RCP-1/out.jsonl`: Skill call, 2 Bash calls, wrote markdown and HTML report from session logs: "28 of 30 days, 40 sessions, 64 prompts", "no dollar or hours-saved figures, because local logs can't support them", placeholder for manager wins. | Skill fired in 3 of 3, but in 2 runs it chose the git route because cwd is a repository, wrote a git report (outcome 1 of 4). | Routing: the "Start here" usage line lost to the repository in cwd. | Yes, by round 4 (miner as `workproof sessions`); `skills/workproof/SKILL.md:14` now says usage requests go to the usage report "even when" a repository is the cwd. |
| T4 | 3 | RCP, RCP_I, GAP 4.00 vs ours 1.33 | Same as above (receipts' miner reads logs directly). | Skill loaded but `${CLAUDE_PLUGIN_ROOT}` did not resolve in Bash; ours searched the disk, did not find the miner, asked the user a question (R3 "Why it fails"). | Infrastructure: miner path depended on an environment variable the tool call did not have; no fallback. | Yes: round 4 shipped `workproof sessions` as a CLI subcommand (R4 "What changed": T3 and T4 at maximum). Commit not looked up. |
| T4 | 4-8 | RCP and others tie ours at 4.00 | n/a | Ceiling reached. | n/a | Resolved (ceiling rule passes). |
| T6 three addresses | 1 | All arms 3.33 (GAP 3.00) vs ours 3.33 | Bare model counted 76 commits (merges, second ref), no stated basis. | Skill did not fire (0 of 3): description named "several email addresses", prompt said "three different email addresses". | Trigger wording mismatch. | Partly (round 2 description change; hook later). |
| T6 | 2 | RCP 2.67, ties/beats ours 2.00 | `/tmp/h2h-wp-r2-runs/T6-RCP-1/out.jsonl`: 4 Bash calls, no skill; counted per address 68+5+3=76 commits, 697 lines with `git blame -w -M -C`, wrote `mine.md`, said non-merge total is 63. | Skill fired in 0 of 3; bare model, 76 or 77 commits, no basis. | Trigger: skill never loaded on this phrasing. | Partly: hook `hooks/workproof-hint.sh` (round 4) adds a computed line to the prompt. |
| T6 | 3 | All arms 2.00, ours 2.00 (tie) | Bare model. | Skill 0 of 3 again; gate rule requires a Skill call. | Trigger. | Partly: hook added in round 4. |
| T6 | 4 | BASE and others 2.00 vs ours 2.67 | n/a (ours higher on outcome) | One run made no Skill call and gave 76 commits with 63 as a sub-count, no basis (C5). Gate fails on the Skill-call rule. | Process rule plus basis missing from file. | Partly: `workproof mine` (round 5). |
| T6 | 5 | none beat ours (3.67) | n/a | One of 3 kept the basis in chat, not in `mine.md` (C5). | Output shape: basis not forced into the file. | Yes: `workproof mine --out` (R6 plan), `skills/workproof/SKILL.md:15`. |
| T6 | 6 | none beat ours (2.67 vs 2.00) | n/a | Run without a Skill call: "bare model" per gate rule. | Skill not loaded. | Yes: hook prints the paste-ready basis sentence (commit `bf54483`, product of `4564186`). |
| T6 | 7 | JD_I 2.33 below ours 3.67; gate FAIL only by the Skill-call rule | n/a | One run (run 1) had no Skill call and no basis sentence in the file. | Hook put the count in context, model wrote the file without the basis. | Yes: basis sentence in hook (`bf54483`). |
| T6 | final gate | RCP_I 2.33 below ours 3.67 (PASS) | n/a | Run 2 rewrote CLI output into an address table without the basis (C5). | Model rewrote a deterministic output. | Open: 1 of 3 runs still loses C5. |
| T3 forged report | 2 | BASE, RCP, RCP_I, JD, GAP 4.00 tie ours 4.00 | Plain model recomputed the figures with git. | Same score. | Task saturated; no loss. | n/a |
| T3 | 3 | JD 4.00, GAP 4.00 vs ours 3.33 | `/tmp/h2h-wp-r3-runs/T3-JD-1/out.jsonl`: 4 Bash, 2 Read, 1 Write; compared with plain git (`git log --no-merges ... --author=...`), wrote `verdict.md`, found 63 vs 103 commits, matched HEAD hash, refused to run the report's own `npx workproof verify` "because that would execute unvetted downloaded code". | `/tmp/h2h-wp-r3-runs/T3-OURS-1/out.jsonl`: 1 Skill, 6 Bash, 4 Read; first spent 3 Bash calls searching the disk for `received-report.md`, then ran `npx workproof check/verify`; the final answer began with "That was the leftover background search for the workproof directory". One run did not discuss the hash or say what a passing check would not prove. | Skill fired in 2 of 3; reference-file path unresolved; verdict template depended on the model. | Yes: `workproof verdict` (round 4, R4 "verdict ... no longer depend on the model"). |
| T3 | 7, 8 | RCP_I 4.00 ties ours 4.00 | n/a | Ceiling reached. | n/a | Resolved. |
| T7 JD example | 1-2 | JD 4.00 ties ours 4.00 (R2); skill not fired | Bare or JD tailor. | Skill did not fire in R2 (bare model). | Out-of-domain at that time (no tailor step). | Yes: tailor step and `workproof bullets` (rounds 3-5). |
| T7 | 3 | BASE, RCP, RCP_I, JD, JD_I 4.00 tie ours 4.00 | n/a | Tailoring fired in 3 of 3, one run max; two runs lost a point: in-progress project listed before the complete one; no Summary section; gap not told to user. | Ordering and missing-section rules not enforced by tool. | Yes: `workproof bullets` prints Summary, ordering check (R4). |
| T7 | 4 | JD, JD_I 5.00 vs ours 4.67 | JD tailor on its own example scores max in all runs. | One run had no `## Summary` in the file: "The command prints no summary, and the skill told the agent to write one; the agent did not". | Shape depended on the model. | Yes: `bullets --resume` (R5/R6). |
| T7 | 5 | JD, JD_I 5.00 vs ours 4.33 | `/tmp/h2h-wp-r5-runs/T7-JD-1/out.jsonl`: 1 Skill, 1 Bash, 1 Write; one pass; final chat answer: "5 of 8 must-haves covered", **Gaps: Python, PyTorch and Docker ... I left them off rather than claim them**, "ScanSense is in progress, so it goes last", "skipped ScanSense's second fact because it's still marked TODO". Grader (`/tmp/h2h-wp-r5-grade/T7-grade.json`) marked all five criteria true in 3 of 3 runs of arm A. | `/tmp/h2h-wp-r5-runs/T7-OURS-1/out.jsonl`: 1 Skill, 3 Read, 5 Bash, 2 Write. First `npx workproof bullets` returned nothing because the agent wrote the JD as single lines instead of the bullet format; it then rewrote `jd.txt` and reran; also `sleep 60` waiting on a background search. Two of 3 files lost the `## Summary` heading and renamed Experience/Projects. | (a) Parser accepted only one JD layout and returned "no requirement lines" silently (R4 T7-OURS-2 confirms: "tool reported no requirement lines ... gap list as mine"). (b) Agent edited the file shape. | Yes: `--resume` mode that writes the finished file (round 6, `src/bullets.ts:523-538` prints the headings). |
| T7 | 6, 7 | none (ours 5.00 vs 4.00 BASE) | n/a | Ceiling reached. | n/a | n/a |
| T7 | 8 | BASE, JD, JD_I 4.00 (below ours 4.67) | n/a | Run 3 file correct, final chat answer never names the Rust/gRPC gap (C3). | Final answer omits gaps; file has them. | Yes: commit `8a87409` (skill rule that the last chat message states the Gaps; test). Unmeasured. |
| T8 GapToGrowth example | 3 | BASE, RCP, RCP_I 5.00 vs ours 4.67 | Plain model: `/tmp/h2h-wp-r7-runs/T8-BASE-1/out.jsonl` shows Read + Write only (no tools), kept layout, reworded two bullets with JD keywords, final answer lists changes and "**Gaps:** ... no Rust or gRPC experience, so I left both [out]". | Final answer in one run did not name the missing skills; skill fired in 1 of 3. | Final answer omitted gaps; skill not loaded. | Partly: `workproof bullets` (R4) fixed the file; chat gap sentence fixed in `8a87409`. |
| T8 | 4-7 | BASE, RCP, GAP 5.00 tie ours 5.00 | n/a | Ceiling reached. | n/a | n/a |
| T8 | 8 | BASE, RCP, RCP_I, GAP 5.00 vs ours 4.67 | As R7 BASE above: gaps stated in the chat answer. | Run 3: file correct, answer says only that a background search finished, never the Rust/gRPC gap. | Final answer variance. | Commit `8a87409` (not yet measured; round 9 runs exist in `/tmp/h2h-wp-r9-runs` for T1-T3 only seen, results not read). |
| T1 visa evidence | 7 | none (ours 3.67 vs 1.67 RCP_I) | n/a | One run: grader judged the attachable report contained an email, path or code (C3). Same file full marks in other 2 runs. | Grader variance, or report text. Unverified which. | Round 8 "public look" change; T1 rose to 4.00. |
| T2 CV bullets | 2 | JD 2.67 vs ours 3.67 | n/a | Ours ahead; one run 3 of 4. | Minor. | n/a |
| H1 visa evidence, public-clone repo | final gate (held-out) | GAP_I 4.67; BASE, JD_I 4.33; RCP_I 4.33; GAP 4.33; ours 1.67 (0-5) | Doc only: every competitor and BASE built the `./evidence/` package. | Doc only: in 2 of 3 runs the skill saw that the repository is the public Express project, told the user, did not build `./evidence/`, asked for confirmation. 0 of 5 in those runs. Third run built it (5). | Over-cautious stop: a safety check blocked the deliverable. | Yes in text: commit `e9eac0e` and `skills/workproof/SKILL.md:30-36` ("A public-looking repository never stops the task ... put ONE line inside the package"). Not re-measured on held-out (round 8 skipped held-out). |
| H3 received report in a foreign format | final gate (held-out) | JD_I 5.00; BASE 4.67; RCP_I 4.67; ours 2.00 (2-2) | Doc only: the bare model counted commits and lines with git, found the altered figures, and confirmed true ones. `/tmp/h2h-wp-r3-runs/T3-JD-1/out.jsonl` shows the same mechanism on a workproof-format report. | Doc only: `workproof verdict` rejected the `commits_authored` / `lines_added` / `figures_sha256` report before comparing anything; the agent passed on "not compared" and never counted. | Tool-only path: no fallback when the tool refuses its input. | Yes in text: commit `e9eac0e` (`src/foreign.ts`, `src/verdict.ts` foreign path; `skills/workproof/references/received-report.md`). Not re-measured on held-out. |
| H2 email-lookalike colleague | final gate (held-out) | ours 4.00 vs best GAP/GAP_I 3.67 (PASS) | n/a | C4 failed in every run: chat answer listed email addresses and named the lookalike colleague while explaining exclusions. | Privacy rule applied to files only. | Yes in text: round 8 "chat privacy" change in `e9eac0e`. Not re-measured. |

### Cross-row findings

1. Every loss round 4 onward was one run of three, in the model's own writing step after the tool returned (final chat answer, section headings, basis sentence). The tool output was correct in those runs (`docs/HEAD-TO-HEAD.md` R5, R7, R8).
2. Competitor wins on T7/T8 come from a single-pass answer that states the gaps and ordering in plain chat prose (`/tmp/h2h-wp-r5-runs/T7-JD-1/out.jsonl`, `/tmp/h2h-wp-r7-runs/T8-BASE-1/out.jsonl`). The grader counts C3 on the chat text, not on the file.
3. Competitor wins on T3/H3 come from computing figures independently with git. Ours lost when it depended on its own tool and the tool refused (H3) or the tool/reference could not be found (R3 T3-OURS-1 spent 3 Bash calls searching the disk).
4. T6 never lost on the numbers after round 5; the remaining loss is the required Skill call and the basis sentence (C5) in one run per round.
5. Where a competitor reached the ceiling and ours did not, the ceiling rule turned a 4.67 into a gate FAIL (T7 R4, R5; T8 R3, R8; H3).

### Generalisation risks (likely, not yet seen)

1. **Foreign-format reports other than the one tested.** `src/foreign.ts` recognises named fields (`commits_authored`, `lines_added`, `figures_sha256`); a report with other field names, nested JSON, CSV or a PDF would fall to "recognised figure: none". Risk: same H3 failure with a new schema.
2. **JD or fact-bank layouts the parser does not accept.** `src/bullets.ts` `parseJd` (line 181) and `parseFactsMarkdown` (line 232) expect a bullet layout and `## E01 Name` banks. R4 T7-OURS-2 already showed "no requirement lines" on a one-line JD. Risk: a JD in prose, a bank in YAML, or a PDF-extracted resume produces empty coverage and no gaps.
3. **Skill trigger depends on phrasing and on `hooks/workproof-hint.sh`.** Rounds 1-6 lost T4 and T6 to non-firing. The hook only matches anchored first-person or workproof phrases (R4: 14 false triggers fixed by tightening). Risk: new wording, other languages (Turkish README exists), or non-Claude-Code harnesses never load the skill; the run then scores as the bare model.
4. **Hook and tool paths assume the plugin environment.** `${CLAUDE_PLUGIN_ROOT}` did not resolve in R3; `npx workproof` was routed to a local build by `bench/head-to-head/shim/npx`. Risk: a user without network or without the package on the path hits the "search the disk, ask the user" failure again (R3 T3-OURS-1).
5. **Over-cautious stops.** H1 showed a safety or privacy check turning into a refusal. Similar checks (public repository, other person's email, large repository above 20,000 commits where the hook is silent per `docs/HEAD-TO-HEAD.md` R7) could stop a task the user asked for. Risk: 0 on a task that every competitor completes.
6. **Final chat answer omits what only the file holds.** Gaps, ordering, exclusions and the privacy-safe wording must appear in the reply the user reads. `8a87409` fixes only tailoring gaps. Other tasks (verdict, usage report, mine) have no equivalent rule. Risk: new tasks with a "tell the user" criterion lose one run in three.
7. **Tasks where workproof has no tool and the bare model already reaches the ceiling.** T3 and T8 are saturated; T4 is receipts' home. A new task in that class (a plain git count, a plain edit) can only tie, and the ceiling rule treats a tie below max as FAIL. A skill that loads there can only lower the score, never raise it.
8. **Run variance at three runs per cell.** A single run in three decides most outcomes (T7 R8, T8 R8, T6 final gate). Fixes judged on one round of 3 runs cannot be separated from noise. Unverified: confidence intervals were not computed.

### Loss classes

A fix has to address these general classes, not individual tasks.

1. **Trigger gap.** The skill or hook does not load for a prompt that does not use the domain words. A non-loaded run is the bare model and fails a Skill-call rule. Fix target: a trigger that does not depend on phrasing, or output that is correct without the skill.
2. **Tool-only dependency with no fallback.** When the CLI refuses its input (foreign report), cannot be found (path variable), or returns empty (JD layout), the agent reports "not compared" or asks the user instead of doing the work another way (plain git, plain reading). Competitors with no tool never hit this.
3. **Refusal or stop instead of deliver-with-note.** A safety or privacy check ends the turn (H1). Competitors always deliver. Fix target: every check adds a line to the deliverable and never blocks it.
4. **Final chat answer incomplete.** Facts, gaps, exclusions and bases are in the file but not in the reply the grader reads (T7/T8 R8, T3 R3 verdict). Fix target: a required closing statement per task type, checked by test.
5. **Privacy applies to files only.** Email addresses, colleague names and paths leak in chat text and attachable reports (H2 C4, T1 R7 C3). Fix target: the same redaction rule for every user-visible string.
6. **Model rewrites a deterministic output.** The tool prints the correct shape or sentence and the agent renames headings, drops the Summary, or turns the basis into a table (T7 R4/R5, T6 R5/R7/final). Fix target: the agent saves the tool output unchanged; the tool writes the file.
7. **Parser strictness on unseen input formats.** JD, fact bank and received-report parsers accept one layout. Fix target: tolerant parsing with an explicit "could not parse X, falling back to Y" path.
8. **Skill applied where the bare model is already at the ceiling.** On saturated or competitor-home tasks, extra steps add only variance and cost; a tie below the maximum fails the gate. Fix target: keep the skill's behaviour on those tasks no worse than the plain model (same answer content, no extra stops).

## Phase 2a: JD Resume Tailor, receipts, GapToGrowth

Date: 2026-10-22. Method: `git clone --depth 1` into `/tmp/deep-comp/{jd,rcp,gap}`. No competitor code was executed. Nothing was installed. No competitor was contacted.

Note on inputs: `deep/common.md` names the repo ai-slop-linter and its tasks h1..h18. This task text asks about the workproof arms and situations (a) to (h), so the findings below answer the task text. The URLs and licences come from `workproof/docs/PLUGIN-COMPARISON.md:5`. `docs/HEAD-TO-HEAD.md` "Arms" (lines 9-16) names the arms but gives no URL or sha; `rerun.sh` and `workproof-scan.md` do not list the three repos either (the scan lists cv-builder and session-report only). The pinned shas below are the HEAD of the shallow clones made today, so they are the shas that were read, not shas a benchmark run pinned.

Reading coverage. Read front to back: all of JD (SKILL.md, 4 references, 2 examples, evals, README, install.sh, CI, AGENTS, SECURITY, CHANGELOG, LICENSE); all of receipts SKILL.md and README; GapToGrowth SKILL.md, README, PRIVACY, START_HERE (first 60 lines), lesson-format (first 60 lines), templates 00 to 05 (00, 01, 02 first 60 lines, 03, 04, 05, decisions). Read in part: `mine-transcripts.mjs` (1474 lines; header, path rules, project naming, git commit logic, summary object, CSV and HTML escaping; the session parser at lines 448-740 and the HTML/CSS template at 1204-1474 were not read line by line: unverified); `make-sample.mjs` (grep only). Not read: GapToGrowth `Career_Learning_Hub.html` (628 lines of UI), the demo `content/*.js`, `dist/` binaries, images. Statements about those are unverified.

---

### 1. JD Resume Tailor

- URL: https://github.com/Day-Raval/jd-resume-tailor
- HEAD sha: `701801493babf6ee75561b5a76b0d0c255bd12e8` (last commit date 2026-10-11)
- Licence: `LICENSE:1` "MIT License", `LICENSE:3` "Copyright (c) 2026 Dayesh Raval". Code and text may be adopted with the notice.
- Size: 594 lines in 20 text files. One skill, no scripts, no network, no MCP (`SECURITY.md:11`).

#### How it works

`skills/jd-resume-tailor/SKILL.md` is a 10-step procedure (lines 11-38) plus hard rules (40-47) plus a fixed output template (49-87). Inputs are the JD text and a private "portfolio bank" file. The bank holds numbered facts (`E01-F1`, `P02-F2`; format in `references/portfolio-bank.sample.md:8-25`). Every bullet must end with fact IDs in brackets (`SKILL.md:25`, `42`).

#### Situations

(a) Skill Gaps in the final chat message. The output template has a `## Gaps` section and a `## Coverage score` section (`SKILL.md:78-84`). Line 87: "Always output every section above, starting with `## Target`. Never skip the resume sections." Gaps are the product's output, printed in the same message as the resume, not a note after it. Consistency rule at `SKILL.md:47`: every Gaps line must match a coverage-table row with the same status, and every count in the score must equal the number of rows with that status. The coverage table has one row per JD item, copied "as written" (`SKILL.md:26-33`), with four statuses `yes`, `swap Pxx`, `listed`, `no` (`34-38`). A worked example is `examples/sample-output.md:28-49`: it shows 3 must-haves missing (Python, PyTorch, Docker) and the score line "Evidenced 5 / 8 · Missing 3" (`sample-output.md:48`). The Gaps list is a deterministic function of the bank, so a grader that looks for "the JD requires X and the facts do not support it" finds it in a fixed place.

(b) Reading truth from git/diff and refusing to invent facts. JD does not read git at all. Its truth source is the user-written bank. Refusal mechanisms: "A bullet without a source tag is invalid. Delete it rather than invent a fact." (`SKILL.md:42`); "Never add a skill, tool, metric or domain claim the bank does not support. Put it under Gaps instead." (`43`); "Never change a number from the bank. Do not round up, estimate or combine metrics." (`45`); facts marked `TODO` are never used (`22`, bank sample line 25); "If the bank has fewer than 3 relevant projects, say so ... Do not stretch." (`46`); Skills section only from K01 or a chosen entry's Stack (`44`). Style checklist: "Every number appears verbatim in the bank" (`style-guide.md:52`). `evals/trigger-tests.md:20-21` makes a human check that every tag exists in the bank and that no number differs. Weakness: the bank is trusted. Nothing verifies the bank against any repository or document.

(c) Received report or file in a foreign or unknown format to check against the repo. Not handled. No mention of received, forged, hash or external reports in any file (grep over all `*.md`: only match for "public repo" is `portfolio-bank.sample.md:3`, which is about their own sample file). `SKILL.md:13` scope guard replies "This skill only tailors resumes." and stops, for anything that is not a resume tailoring request.

(d) Repository that looks public or is not the user's. Not handled. The skill never looks at a repository. The only privacy mechanisms are: the bank is never shipped (`CHANGELOG.md:18`), CI fails if `portfolio-bank.md` is committed (`.github/workflows/validate.yml:14-18`), and the installer keeps a personal bank when reinstalling (`install.sh:26-30`). The README Privacy section states one local file is read (`README.md:82-84`).

(e) Privacy of emails and other people's names in the final answer. No rule. The output template has no contact line and no email field (`SKILL.md:53-85`), so emails do not appear by construction. The bank format has no person-name field except company names. Nothing says to omit third-party names in the final message. `SECURITY.md:5` contains the maintainer's email only for vulnerability reports (not in the skill).

(f) Evidence package and verification commands. No package and no commands. Verification is the source-tag scheme (`SKILL.md:25`) plus the manual checklist (`evals/trigger-tests.md:19-25`) plus CI that validates the plugin manifest and the installer (`validate.yml:12-23`). A reader verifies by looking up a tag in the bank: that is a lookup into a private file, not a deterministic check.

(g) Complete final message (no status-only ending). The fixed section list and the "Always output every section" line (`SKILL.md:51`, `87`) is the whole mechanism. The response body is the deliverable, so a status-only ending is not possible. Failure paths are also fixed strings: `SKIP: <rule id> - <quoted JD line>` (`SKILL.md:20`, `hard-skips.md:3`), "This skill only tailors resumes." (`13`), and a no-bank stop with the sample format shown (`18`).

(h) Other reasons it scores 5.00 where we score less (hypotheses from the text; the grader packets were not read, so the link to score is unverified):
1. Single-purpose skill with an exact output template. The model has no choice of format, so every criterion about "Gaps stated" or "no invented skill" is met in every run.
2. Hard skip rules (`hard-skips.md:5-14`) with an "only skip on explicit wording" rule (`13`) and a `WARN:` flag when unsure (`14`). A JD that says "no sponsorship" gets a quoted-line refusal.
3. Mutually exclusive coverage statuses with a count that must reconcile (`SKILL.md:47`). Graders can check the arithmetic.
4. The invoked arm in our benchmark gives it a bank holding the ground-truth facts (HEAD-TO-HEAD.md round 2 ruling 3), so the fact source is perfect for it. This is an arm-setup advantage, not a skill advantage.
5. The trigger description names the verbs "tailor, target, adapt or customize" (`SKILL.md:3`) and says what is not covered, so it fires on the T7 prompt.

#### Weaknesses to exploit
- No git, no diff, no repository reading, no report verification, no hash. It cannot do T1, T3, T5, T6 at all.
- All truth comes from a hand-written bank. A wrong or stale bank produces a confident, fully tagged resume that is false. We can show that our source tags point at git-derived figures that can be re-run.
- Tags are IDs into a private file (`SKILL.md:25`), so a recruiter cannot check them. Ours can carry a command or report hash.
- Style rules are specific to one persona (ban "student", "Position as a practitioner who bridges business problems and full-stack solutions", `style-guide.md:23`, `43`). It is not general.
- Requires a bank to exist; with none it stops (`SKILL.md:18`). A user with only a resume and a repo gets no output.
- Coverage score counts only keyword presence in the bank, not strength. "Evidenced 5 / 8" treats a Stack-line mention and a measured result equally (`SKILL.md:35`).
- `evals/trigger-tests.md` has blank "Triggered" columns (lines 8-17): no recorded eval results.
- The CI installs `@anthropic-ai/claude-code` from npm unpinned (`validate.yml:11`): a supply-chain exposure for them, not for us.

#### Worth adopting (MIT, code and text allowed with notice)
- The coverage table with four statuses and the reconciliation rule (`SKILL.md:26-38`, `47`). Workproof already adapted `bullets.md` and `tailor.md` from this repo (`workproof/docs/PLUGIN-COMPARISON.md:34`), so check which of these are already in.
- Hard-skip table with `SKIP:` and `WARN:` output (`hard-skips.md`).
- Fact-ID-in-brackets on every bullet, and "delete the bullet rather than invent" (`SKILL.md:42`).
- The CI guard against committing a private data file (`validate.yml:14-18`): useful for a workproof repo that holds sample reports.
- `install.sh` multi-agent copy with personal-file preservation (`install.sh:23-33`).
- A "Try it with sample data" walk-through (`README.md:61-67`).

---

### 2. receipts (Anthropic claude-plugins-official, `plugins/receipts`)

- URL: https://github.com/anthropics/claude-plugins-official (path `plugins/receipts`)
- HEAD sha of the clone: `af59ee3a1051a29dda4a2e7a2af221aa457ae08b` (last commit date 2026-10-21). This is the same sha that `HEAD-TO-HEAD.md:896` pins for session-report in the same repo.
- Licence: `plugins/receipts/LICENSE:1` "Apache License" (version 2.0 text, 202 lines). The repo-root `LICENSE` first line is also "Apache License". Code may be adopted with licence text, notice and change statement (workproof already adapted `mine-transcripts.mjs` with attribution: `PLUGIN-COMPARISON.md:36`).
- Files: `SKILL.md` 300 lines, `scripts/mine-transcripts.mjs` 1474 lines, `assets/make-sample.mjs` 183 lines, `README.md` 77 lines.
- Note: the unpatched script reads `~/.claude/projects` only (`mine-transcripts.mjs:88`); `RECEIPTS_HOME` does not appear in the file. The benchmark patch is ours.

#### How it works

`SKILL.md` runs a local Node miner over Claude Code session logs (`SKILL.md:34`), gets one JSON object (schema in a comment block, `71-137`), and writes a markdown report from that JSON alone (`165`). It also writes a self-contained HTML receipt with a CSV export. Everything is local; the model sees only a small summary (`SKILL.md:292-300`).

#### Situations

(a) Skill gaps in the final chat message. Not applicable: receipts does not tailor resumes. It has the same shape for its own limits: footnotes for what the numbers do not mean. Examples: "lines touched (approx.)" and "an edit that revisits the same region counts each time" (`SKILL.md:176-180`); "which columns add up, and which don't" (`148-157`, `207-214`); null commit count with `gitUnavailable` means "unknown, not zero" (`215-226`). These are the closest thing to a Gaps list.

(b) Reading truth from git and refusing to invent facts. Strongest of the three. The miner computes commits with `git log --no-merges --pretty=format:%H %cI %ae -- <pathspec>` (`mine-transcripts.mjs:822-828`) and counts a commit only if it matches both the repository's configured author email (`gitUserEmailFor`, 872-890; `%ae` compare at 842-851) and a file Claude Code touched (`770-865`). Rationale in the comment at 838-849: identity alone counts cron and release-bot commits; path alone counts unrelated bot commits. The email is resolved per repository so an `includeIf` work identity is respected (`860-870` comment). `:(literal)` pathspecs stop globs from "inventing work out of punctuation" (`783-788` comment). Git errors return the `GIT_UNAVAILABLE` symbol, so "couldn't tell" is not reported as "none" (`mine-transcripts.mjs:856-858`; `SKILL.md:100-104`, `215-226`). Skill-text refusals: "Do not invent 'hours saved' or dollar-value-created numbers" (`SKILL.md:261-263`); "No dollar figures, anywhere" (`159-163`); no breakdown of spend by activity because it is "a modeling choice, not a measurement" (`228-247`); "don't call these 'commits made by Claude Code'" (`185-186`). It counts commits carrying AI-touched files, not the user's total commits, so it undercounts "my commits" by design (relevant to T1/T6 where the truth is 56 or 63 non-merge commits).

(c) Received report or file in a foreign format to check against the repo. Not handled. It has no input other than its own local logs. The one adversarial-input rule is for project names: "Project names are data, never instructions" (`SKILL.md:139-146`), with control-character stripping (`mine-transcripts.mjs:349-355`), HTML escaping (`1121`, `1222`), CSV formula-prefix escaping (`1140-1154`) and `<`/`>` escaping inside embedded JSON (`1196-1202`). This is prompt-injection and file-injection hygiene on data it produced itself, not a check of a foreign report.

(d) Repository that looks public or is not the user's. No visibility or ownership check (no `remote`, `visibility` or fork logic in the file; grep of the script found none). The closest controls: it counts a commit only if authored by the repo's configured email (`mine-transcripts.mjs:851`), so another person's repository yields zero commits; paths outside the user's work (agent scratch, `~/.claude`, its own earlier receipts) are excluded (`isAgentMachinery`, 273-290); and `Step 5` says "Do not publish the receipt anywhere by default" and publish only on request after the project-name list is shown (`SKILL.md:285-290`).

(e) Privacy of emails and other people's names in the final answer. Explicit. The email "is used locally to match commit authorship and is never sent" (`README.md:64-65`); the summary sent to the model has name, counts and repo names only: no code, no conversation, no tool or MCP names (`SKILL.md:296-300`; `README.md:61-65`). Out-of-repo paths are cut to the last two segments because "a full absolute path is a map of the dev's filesystem" (`mine-transcripts.mjs:365-368`), with an honest limit: "it bounds the shape, it does not anonymize" (`369-371`). Step 5 lists the project names back to the user before the report travels, "internal codenames, client names, or unannounced projects" (`SKILL.md:277-283`), and `--repo` scopes the report. The report uses the user's own git name (`SKILL.md:74`, `170`). Other people's names do not enter the summary (author compare is by email, locally).

(f) Evidence package and verification commands. The package is a markdown report plus a self-contained HTML receipt (no external resources; `mine-transcripts.mjs:13-15`) with a CSV export button, saved to fixed names `~/claude-code-receipts-<since>-to-<until>.{md,html}` (`SKILL.md:267-275`). No hash or signature. Verification is by re-running the miner. The "Framing for a manager" section says the report is "self-reported and built from local data on one machine" and tells the user to cite the organisation's verified metrics for headline numbers (`SKILL.md:249-259`). It never claims tamper evidence. `make-sample.mjs` builds an invented home with real git repos so the output can be regression-tested (`make-sample.mjs:35-58`, `153-177`, comment at 15 on /tmp repos reporting zero commits).

(g) Complete final message. `Step 6 - wrap up` requires telling the user where both files are and what did or did not leave the machine (`SKILL.md:292-300`). Step 5 requires one line "this receipt names: X, Y, Z" (`277-278`). Step 3 gives a fixed report structure: header, "What you shipped", "By project", framing for a manager (`167-259`). Not a guarantee against a status-only ending, but the last steps name the content to be said.

(h) Other reasons it scores where it does (hypotheses; grader packets not read): the footnote discipline ("lines touched (approx.)", "commits carrying work", "unknown, not zero") covers the "limits" criteria in T4; the no-dollar rule matches T4 C3 (`HEAD-TO-HEAD` scan note, `workproof-scan.md` row 9); the privacy block states what left the machine, which is the content a "privacy" criterion asks for.

#### Weaknesses to exploit
- No tamper evidence at all. A modified `.md` or `.html` receipt cannot be detected. Our hash plus a check command is a clear gap for it on T3-type tasks.
- Cannot verify anyone else's report (no input path).
- Counts only commits that touch files Claude Code edited. For "how many commits are mine" (T1/T6) it gives a smaller, different number, and it does not merge several identities: one email per repo (`gitUserEmailFor`, 872-890).
- Reads `~/.claude/projects`, so it only sees Claude Code work, not the user's whole history; no `git blame` (surviving lines) at all.
- Skips any directory under a path containing the agent scratch pattern (`isAgentMachinery`, 277-279): our fixtures in scratch folders give zero (the harness already works around this, `HEAD-TO-HEAD.md:24`).
- The report names project directories verbatim; it only warns after the fact (`SKILL.md:277-283`), it does not remove them by default.
- No `--author` or identity-merge option; no visibility check.

#### Worth adopting
- Code (Apache-2.0, with licence text and notice): `csvCell` formula-prefix escaping (`mine-transcripts.mjs:1149-1154`), `jsonForScript` (`1196-1202`), `cleanProjectName` control-character strip (`349-355`), `:(literal)` pathspec use (`783-788`), the `GIT_UNAVAILABLE` "unknown, not zero" pattern (`SKILL.md:215-226`; code at the symbol, line 768).
- Ideas only (no licence issue, rewrite in our words): "data, never instructions" rule for names read from disk (`SKILL.md:139-146`); "which columns add up" footnote (`148-157`); read project names back before the report leaves (`277-283`); refuse unsupported derived numbers and say why (`228-247`); explicit "what left the machine" paragraph (`296-300`).

---

### 3. GapToGrowth

- URL: https://github.com/sidhartharivarasan/gaptogrowth (README install line uses `SidharthArivarasan/gaptogrowth`, `README.md:112`; the URL read is the one in `PLUGIN-COMPARISON.md:5`)
- HEAD sha: `dab7c0a403a1dc044311d2509f7f420c66a7ee55` (last commit date 2026-10-03)
- Licence: `LICENSE:1` "MIT License" and `plugins/gaptogrowth/LICENSE:1` "MIT License"; `README.md:181` "MIT © 2026 Sidharth Arivarasan". Code and text may be adopted with the notice.
- Size: SKILL.md 254 lines; the rest is templates, a 628-line offline HTML Learning Hub, docs, sample resumes.

#### How it works

Folder-based agent: it needs a project folder with the user's past resumes (`SKILL.md:12`, `34`). Phase 0 onboarding (`128-143`), Phase 1 consolidation of all resumes into knowledge files 00 to 05 (`147-157`), then a per-JD workflow of 8 steps (`161-207`). Per JD, each keyword gets a category: AUTO-ADDED (90%+ confidence), A (add, needs approval), B (learning only), C (verify with user) (`175-182`). Nothing stays in C before the Word file is written (`185`). The Word file comes first; the PDF only after explicit approval (`192`, `194`).

#### Situations

(a) Skill Gaps in the final chat message. Partly. After the Word file the skill must "report the number of JD keywords used and list any important ones left out, with the reason (usually: not verified)" (`SKILL.md:124`). The keyword review in one message with evidence, confidence, need and category (`175-182`) shows the gaps before the resume exists. Each gap also becomes a Learning Hub lesson, and the skill tells the user in one short message what changed (`206`). Weaknesses: the gap list is gated behind several user replies (Step 4, 5, 6 questions, `184-192`), so a single-turn headless run ends on a question, not on a finished resume with Gaps. The final turn of Step 6 is the fixed sentence "Please review the Word version. Are the changes good, and should I generate the PDF?" (`192`).

(b) Reading truth from git/diff and refusing to invent facts. No git. Truth source is the user's own past resumes plus chat confirmations (`SKILL.md:60`, template `02_Resume_Master_Career_Knowledge.md:3-9`). Refusal rules: "Honesty overrides ATS value. Never invent experience, tools, skills, responsibilities, metrics, achievements, qualifications, or proficiency." (`SKILL.md:108`); "A high score never permits fabrication." (`182`); "Claim Confidence is evidence strength, not permission to claim." (`templates/03_Verified_Skills_Evidence_Bank.md:17`); low-confidence signal phrases such as "exposure to", "currently learning" (`03:32`); a skill listed without a bullet showing use is scored conservatively (`03:31`); facts from chat are recorded as `Confirmed by user (YYYY-MM-DD)` (`SKILL.md:99`); contradictions stop work: "stop and ask before changing it" (`100`); resume disagreements are never silently resolved (`62`); a lab is never professional experience (`218`, `230`). Strongest honesty process of the three for resumes, but it is trust in the user's earlier resumes, and it asks questions instead of answering.

(c) Received report or file in a foreign or unknown format to check against the repo. Not handled for reports. It handles foreign resumes by quarantining them: resumes in `Reference Resumes` belong to other people and are used for layout only, never as facts, never copied or quoted or stored (`SKILL.md:64-69`; template `01_Writing_Style_DNA.md:11`, `02:9`). That is a rule for untrusted third-party documents (never treat them as facts), but it checks nothing against a repository. Also: `G2G-PROGRESS:` JSON is parsed, and if damaged the skill says so and asks the user to copy it again (`225`). The hub HTML applies `safeUrl` to links (`Career_Learning_Hub.html:173`, regex `^https?://`).

(d) Repository that looks public or is not the user's. Not handled for repositories. Nearest controls: work only inside the project folder, never read other places (`SKILL.md:34`); never copy other people's resume content (`66-69`); ask the owner first before adding a friend's resume (`137`; `PRIVACY.md:20-21`); do not share the filled folder, share the public repo instead (`SKILL.md:254`; `README.md:167`).

(e) Privacy of emails and other people's names in the final answer. Rules are about storage and sharing, not about the final message. Contact details go in the document body, not in a header or footer (`SKILL.md:121`). Third-party resume content is never stored (`69`). PRIVACY.md states the stored data includes name, email, phone number and work history, nothing is sent elsewhere (`PRIVACY.md:8-15`). Issues must never contain resume content (`README.md:177`; `PRIVACY.md:27`). It does put the user's own email on the resume by design (sample `Reference_Experienced_OnePage.md:19` is fictional). No rule on emails or other people's names in the chat reply.

(f) Evidence package and verification commands. Evidence package is the per-JD decisions file (`decisions_template.md:1-24`): keyword, evidence, confidence, need, category, user's decision, resume usage, plus verification answers and output paths. Plus the Verified Skills & Evidence Bank with Claim Confidence bands (`03:3-17`). No hash, no commands, no tests (no test files in the repo; CHANGELOG and README only). It does have a page-count and layout check for the PDF (`SKILL.md:195`).

(g) Complete final message. Mechanisms: every question that expects a choice ends with "Reply with one of:" and backticked options (`SKILL.md:114`); Step 6 ends with a fixed approval question (`192`); Step 8.7 ends with a one-message change summary (`206`); token estimate before optional large writes (`115`). This makes the end of each turn well-defined, but the ending is often a question. It is built to wait for the user, so a single-shot benchmark run can end with no resume. The HEAD-TO-HEAD note that GapToGrowth "is built for Cowork with a folder of past resumes, which a headless run cannot reproduce" (round 2 ruling 3) matches `SKILL.md:12` and `34`.

(h) Other mechanisms that can score high on T8: the keyword-review table with Need = required / preferred / unknown (`SKILL.md:170`, `176`) makes gaps like Rust and gRPC explicit with a reason; the standing-resume rule (`60`) gives one source of truth; ATS rules give concrete checkable formatting (`117-124`: one page, single column, standard headings, no icons or tables, one date format, JD's exact title when honest). These are criteria-friendly. Unverified: whether it reaches 5.00 in any arm; its arm is "shown but not a case for or against anyone" (F3 in round 2 ruling 5).

#### Weaknesses to exploit
- Needs folder and previous resumes; with no folder it stops (`SKILL.md:12`); with no `My Resumes` it asks and waits (`138`).
- Multi-turn gating: Phase 0, Phase 1 and the Step 4 to 6 approvals mean one prompt produces questions, not an output.
- No git, no diff, no reports, no hash, no verification commands, no tests.
- Heavy token and file overhead (6 knowledge files, an HTML app, a new JS content file per JD, `SKILL.md:197-206`), plus a promise about usage savings that is not measured in the repo (`README.md:50-58`).
- Ships binaries in `dist/` (`gaptogrowth.skill`, a zip), which duplicate the source; maintainers must keep them in sync (`docs/MAINTAINER_NOTES.md:3-4`). Not auditable by reading.
- Requires paid Claude plan and desktop app (`README.md:62-79`); not a plain Claude Code skill.
- Confidence percentages (0 to 100) are model judgments with no calibration; the 90% auto-add threshold (`SKILL.md:177`) adds keywords without asking, which is a fabrication risk if the evidence file is wrong.

#### Worth adopting (MIT)
- Category scheme AUTO-ADDED / A / B / C with "Reply with one of:" (`SKILL.md:114`, `175-182`): adopt as a model for the Gaps list in the tailor step; the "C" question form ("Have you used Snowflake at work, in a lab, or not at all?", `180`) is a good template.
- "Honesty overrides ATS value" plus confidence bands (`03:3-17`).
- Reference-resume quarantine rule (`SKILL.md:64-69`) for any third-party document that must not become a fact source.
- ATS formatting checklist (`SKILL.md:117-124`).
- Decisions file layout (`decisions_template.md`).
- The `Learning Hub` is out of scope for workproof; do not adopt.

---

### 4. Table: situation x competitor

Cells give what the competitor does, with `file:line` (paths relative to each repo clone; receipts paths relative to `plugins/receipts`). "None" means the clone has no mechanism; I searched by reading and by grep.

| Situation | JD Resume Tailor | receipts | GapToGrowth |
|---|---|---|---|
| (a) Skill Gaps in the final chat message | Fixed `## Gaps` and `## Coverage score` sections printed with the resume, `skills/jd-resume-tailor/SKILL.md:78-84`; "Always output every section" `SKILL.md:87`; Gaps must match the table rows `SKILL.md:47`; example `examples/sample-output.md:42-49` | Not a tailoring tool. Footnotes for limits instead: `skills/receipts/SKILL.md:176-180`, `148-157`, `215-226` | Keyword review with categories `plugins/gaptogrowth/skills/gaptogrowth/SKILL.md:175-182`; after the Word file report keywords used and important ones left out `SKILL.md:124`; but gated behind user replies `SKILL.md:184-192` |
| (b) Truth from git/diff, no invented facts | No git. Truth is a user-written bank; no tag means delete the bullet `SKILL.md:42`, no unsupported claim `43`, no changed numbers `45`, `TODO` facts unused `22` | Git author email plus file path both required `skills/receipts/scripts/mine-transcripts.mjs:842-851`; git failure is "unknown, not zero" `mine-transcripts.mjs:856-858`, `SKILL.md:215-226`; no hours or dollars `SKILL.md:159-163`, `261-263` | No git. Truth is past resumes plus confirmations `SKILL.md:60`, `99`; "Honesty overrides ATS value" `108`; stop and ask on contradiction `100`; confidence is not permission `templates/03_Verified_Skills_Evidence_Bank.md:17` |
| (c) Received report/file in unknown format, check against repo | None. Out-of-scope guard `SKILL.md:13` | None for reports. Names from disk are data, not instructions `SKILL.md:139-146`; escaping `mine-transcripts.mjs:349-355`, `1140-1154`, `1196-1202` | None for reports. Foreign resumes are layout-only, never facts `SKILL.md:64-69`; damaged progress JSON is rejected `SKILL.md:225` |
| (d) Public or not-the-user's repo | None. CI blocks committing a private bank `.github/workflows/validate.yml:14-18` | No visibility check. Other people's commits not counted (author email must match) `mine-transcripts.mjs:851`; no publish by default `SKILL.md:285-290` | None for repos. Work only inside the folder `SKILL.md:34`; ask the owner before using a friend's resume `SKILL.md:137` |
| (e) Privacy of emails and other people's names in the final answer | No contact or email field in the output template `SKILL.md:53-85`; no rule on third-party names | Email never sent `README.md:64-65`; summary has no code or tool names `SKILL.md:296-300`; path cut to last two segments `mine-transcripts.mjs:365-371`; project names read back `SKILL.md:277-283` | Third-party resume content never stored `SKILL.md:69`; contact in body `121`; storage-only privacy `PRIVACY.md:8-21`; no rule for the chat reply |
| (f) Evidence package and verification commands | Source tags `SKILL.md:25`; manual checklist `evals/trigger-tests.md:19-25`; CI manifest and installer checks `validate.yml:12-23`; no hash, no verify command | `.md` and `.html` with CSV export, fixed file names `SKILL.md:267-275`; self-contained HTML `mine-transcripts.mjs:13-15`; no hash; re-run to verify; sample builder `assets/make-sample.mjs:35-58` | Decisions file `templates/decisions_template.md:1-24`; evidence bank `templates/03_Verified_Skills_Evidence_Bank.md:3-17`; PDF page check `SKILL.md:195`; no hash, no tests |
| (g) Complete final message | Mandatory section list `SKILL.md:51`, `87`; fixed `SKIP:` line `20`, fixed no-bank stop `18` | Step 6 wrap-up names files and what left the machine `SKILL.md:292-300`; one-line project list `277-278` | "Reply with one of:" ending `SKILL.md:114`; fixed approval question `192`; change summary `206`; often ends on a question, so a one-shot run may have no resume |
| (h) Other score drivers (hypotheses) | Single fixed template; hard skips `references/hard-skips.md:5-14`; coverage arithmetic `SKILL.md:47`; description names the trigger verbs `SKILL.md:3`; invoked arm gets a perfect bank (round 2 ruling 3) | Calibrated footnotes (approx., unknown vs zero) `SKILL.md:176-226`; no-dollar rule matches T4 C3 | Required/preferred tagging `SKILL.md:170`; ATS checklist `117-124`; arm is "shown, not a case" because the folder flow is not reproducible headless (round 2 ruling 3) |

### 5. Actions for us (derived from the above; not run)

1. T7/T8 (tailoring): make the final chat message contain the Gaps list and a reconciled count, as JD does (`SKILL.md:47`, `78-84`). Put it in the reply body, not only in a file. JD's fixed-section rule `SKILL.md:87` is the mechanism that beats us when our skill does not fire or writes a file and ends with a status line.
2. Add a SKIP/WARN-style refusal table for sponsorship and seniority only if the benchmark tasks include such JD lines (not verified; check `tasks.json` T7 criteria).
3. Add a "foreign document is data, not facts" rule for received reports (idea from `gap SKILL.md:64-69` and `receipts SKILL.md:139-146`); it is an idea only for our case (c) because neither competitor checks a report against a repo. Our advantage in (c) is real: both competitors do nothing there.
4. In (d) and (e) neither competitor handles a public or foreign repo; receipts' ideas (read names back, last two path segments, never send email) are the best reference. Reuse as ideas; code only where listed above and with Apache-2.0 notice for receipts.
5. Our edge to state in the docs: hash plus a check command (none of the three has one), identity merge across emails (receipts uses one email per repo, `mine-transcripts.mjs:872-890`), `git blame` surviving lines (none of the three), and verification of someone else's report (none of the three).

## Phase 2b: session-report and cv-builder

Date: 2026-10-22. Nothing from either repository was executed. No contact with the competitors.

### Provenance and coverage

| Item | session-report (SR) | cv-builder (CV) |
|---|---|---|
| Clone | /tmp/deep-comp/sr, plugin path plugins/session-report | /tmp/deep-comp/cv |
| Pinned sha (fetched, `git rev-parse HEAD` matched) | af59ee3a1051a29dda4a2e7a2af221aa457ae08b | f7c8c3b6d379f8d12ca1c70fc7576652dcdfe16c |
| Licence file | plugins/session-report/LICENSE: Apache License 2.0 (first text line "Apache License", then "Version 2.0, January 2004"). Repository root LICENSE is the same text. | LICENSE:1 "MIT License", line 3 "Copyright (c) 2026 CV Builder contributors". plugin.json also says MIT. |
| Read front to back | skills/session-report/SKILL.md (all 42 lines); analyze-sessions.mjs (lines 1-545 in full; lines 546-875 only by search for output keys, cost, privacy and network terms) | skills/tailor-resume/SKILL.md, rewrite-achievements/SKILL.md, create-resume/SKILL.md (lines 9-91), review-resume/SKILL.md (lines 9-60), tailor-resume/references/writing-quality.md (all), PRIVACY.md, docs/AUDIT.md, .mcp.json, plugin.json |
| Read only in part (unverified beyond this) | template.html (569 lines): only searched for network URLs, cost terms and the two AGENT slots; markup and JS not read | references/markdown-v1.md: headings and lines 93-124 only. The 15 template files: one (simple-ats.md) first 25 lines. README.md: install and MCP lines only. .github/verify-plugin.mjs, SHA256SUMS, workflow: key words only |
| Duplicates | none | `cmp` shows markdown-v1.md and writing-quality.md are byte-identical in all four skills, and all 15 templates are identical in create-resume and tailor-resume. Only one copy was read. |

Our side was read for comparison: bench/head-to-head/tasks.json (T2, T4, T7, T8), labels.json (keys only, first 300 characters of T2/T4/T7/T8), heldout/t1-t3/criteria.md (the OLD held-out H1-H3), skills/workproof/SKILL.md, skills/workproof/references/tailor.md (grep of rules), src/sessions/mine-sessions.mjs (header and grep).

Scores below are my estimates from reading the text. None was measured. Treat each as a range, not a result.

---

### 1. session-report (SR)

#### 1.1 What it is

An Apache-2.0 Claude Code plugin with one skill. The skill runs a Node analyzer over `~/.claude/projects/**/*.jsonl` and then has the model fill two slots in an HTML template (SKILL.md:12-33). It produces a token and cache usage report. It has no git cross-reference, no file, line or commit counts, no pull request counts and no price table (a search of analyze-sessions.mjs and template.html for cost, price, usd and dollar terms found nothing).

Our src/sessions/mine-sessions.mjs:14-18 states that it is adapted from a different plugin in the same repository (skills/receipts/scripts/mine-transcripts.mjs), not from SR. SR is therefore a second, independent parser of the same log format, and a source of cross-checks.

#### 1.2 Data model and session-log parsing (file:line in analyze-sessions.mjs unless stated)

- One API response is split over several `assistant` entries sharing a `requestId`; only the last has the final `output_tokens`. SR keeps the entry with the highest `output_tokens` per request (304-321) and dedupes across files with a global `seenRequestIds` (349-351). Header explanation: 14-18.
- Global dedupe by entry `uuid` so resumed sessions that replay history are not counted twice (26-27, 226-230). Main transcripts are processed before subagent transcripts so replayed fork entries are charged to the parent (541-545 in the file; comment at 541-544).
- Four token fields are kept apart: uncached input, cache creation, cache read, output (70-73, 86-92). Total per call is the sum of the four (353-357).
- Subagents: path `<project>/<sessionId>/subagents/*.jsonl` with sibling `*.meta.json` carrying `agentType` (23-25, 111-156). Fallback: label parsed from the file name, else the type linked through the parent's `Agent`/`Task` tool_use id and the `toolUseResult.agentId` in the result (163-166, 247-265, 294-299).
- Workflow transcripts are recognised by a `workflows` path part (132-135).
- Skill attribution: `Skill` tool_use name (287-293) and slash commands read from `<command-name>` or `<command-message>` tags (451-457). A plain human message resets the current skill (459). Token cost of each API call is charged to the current skill (362-366).
- Human message rule: not `isMeta`, not `isCompactSummary`, not a `tool_result`, not an interrupt marker, only in main files with `isSidechain` falsy (427-438, 461-465). Task notifications, scheduled wakeups and background-task messages do not start a new prompt (442-450).
- Per-prompt roll-up including subagent tokens through `agentIdToPrompt` (166, 207-210, 368-377). The skill text says `top_prompts` already includes subagent tokens (SKILL.md:41).
- Active time: gaps between consecutive entries shorter than 5 minutes are summed; longer gaps are idle (50, 238-241). Wall clock is last minus first timestamp (327-333).
- Cache break: a call with uncached input above 100,000 tokens (49, 386-404).
- Window filter: `--since` with `7d`, `24h` or an ISO date (52-61, 236). Default skill window is 7 days (SKILL.md:12).
- Output keys: `overall`, `by_project`, `by_subagent_type`, `by_skill`, `cache_breaks` (capped at 100), `top_prompts` (100), `by_day` (about lines 651-673, found by search only).

#### 1.3 Cost and token attribution

Tokens only. No dollars and no relative weights. Attribution axes: project, subagent type, skill or slash command, prompt, day. The skill tells the model to express findings as a percentage of total tokens (SKILL.md:27) and lists thresholds: cache hit below 85%, a prompt above 2% of total, subagent type averaging above 1M tokens per call (SKILL.md:31).

Ours (mine-sessions.mjs:227-241, 253, 666) uses a unitless relative cost weight per response (cache read weighted lower than cache write). SR's four raw counters are simpler and need no weight assumption; ours is closer to the real cost. Neither prints dollars.

#### 1.4 Privacy

Weak for a document sent to a manager.
- `promptPreview` keeps up to 240 characters of each prompt (482-490) and `top_prompts` embeds that text, plus ±2 neighbouring prompts for drill-down (494-512), in the HTML.
- `project` is the first path part under the projects folder (117), which is the encoded working directory, so it carries the path and normally the user name.
- Session ids are in `cache_breaks` (392-400).
- template.html:7-9 loads a Google Fonts stylesheet when the report is opened (a network request from the report, found by search).
- No redaction option exists. Our mine-sessions.mjs:10-11 and change list 2-3 remove prompt text, paths, user name and session ids.

#### 1.5 Gap detection

Anomaly hints only (SKILL.md:31): cache-hit below 85%, a share above a threshold, clustering of cache breaks. It does not detect missing data, an empty window, or fixture-versus-real-machine differences.

#### 1.6 How SR handles the situations in T4

T4 prompt (tasks.json): usage and impact report for a manager, logs under `{home}/.claude/projects`, "over the last month". Truth: 40 sessions, 64 prompts, 28 active days, 14 files, 3,120 lines, 12 commits, 7 PR commands.

| Situation | SR behaviour | Evidence |
|---|---|---|
| Window "last month" | Skill default is `--since 7d`; the skill says to honour a user range such as `30d` (SKILL.md:12). An agent that does not pass `30d` drops older fixture sessions. | SKILL.md:12-16; analyze:48, 236 |
| Home directory is not the real home | Default root is `os.homedir()/.claude/projects`; `--dir` overrides (45). The skill never mentions `--dir`, so the agent must infer it. If HOME is set to the fixture home this works; otherwise the real home is read. | analyze:45; SKILL.md:13 |
| Sessions count | `overall.sessions` is a set of session ids from main and subagent files that had in-range entries (407-417). It can differ from the miner's 40 (which includes the no-repository research bucket). Unverified against F4. | analyze:407-411 |
| Active days | No active-day count. `by_day` exists, so an agent could count its entries, but nothing in SKILL.md tells it to. `activeMs` is minutes of activity, not days. | analyze:50, 238-241; SKILL.md:18 |
| Files, lines, commits, PR commands | Absent. The report cannot say what the usage delivered. | grep of analyze-sessions.mjs found no git, file or line counters |
| Dollar figures / hours saved | Not produced by the script. The anomalies and optimisation text is token-percent based (SKILL.md:27-32). C3 should hold unless the agent adds money itself. | SKILL.md:27-32 |
| By-project breakdown with a no-repository bucket | `by_project` is keyed by the encoded directory. The research bucket appears as its own encoded key, not labelled as such. | analyze:117, about 663 |
| Output for a manager | One HTML file in the current directory, `session-report-YYYYMMDD-HHMM.html` (SKILL.md:20-22). Framing is waste and optimisation ("anomalies", "optimizations", SKILL.md:27-32), not delivery. Final reply is only the file path (SKILL.md:35). | SKILL.md:20-35 |
| Prompt injection from project names | No rule. Project names go into HTML via the JSON blob. | SKILL.md:26 |

#### 1.7 Estimated score on T4 criteria (our labels: C1 process, C2-C5 outcome)

| Criterion | Estimate | Reason |
|---|---|---|
| C1 deterministic command, raw jsonl not read | Pass, likely | The skill instructs `node analyze-sessions.mjs --json` (SKILL.md:13-14). Needs `node` in the harness. |
| C2 sessions 40 and active days 28 | Fail or partial | No active-day output; session count semantics differ; default 7-day window. Depends on the agent adding `30d` and counting `by_day`. |
| C3 no dollars, no hours saved | Pass, likely | Script has no money field. Risk: the model adds "hours" from `activeMs`; hours of activity is not "hours saved" but a checker may flag it. |
| C4 by-project with research bucket | Partial | Per-project rows exist; the research bucket is not named. |
| C5 file with manager framing | Partial | File exists. Framing is waste-oriented and token-based, with no delivery outcomes. |

Expected 2 to 3 of 5 (range). Estimate, not measured.

#### 1.8 Behaviour of the SR arm in our harness (`claude -p` in a temp HOME)

- The analyzer reads `~/.claude/projects` through `os.homedir()` (45). In a temp HOME that holds the fixture, the run's own session log is also written under HOME/.claude/projects while the agent works. That log would be counted as one more session and one more project (the temp working directory), and the prompt would be counted. SR has no exclusion of the current session or of agent scratch paths. Ours has one (mine-sessions.mjs:270-307). Unverified by execution, inferred from the code.
- Fixture dates against `--since`: if the invented sessions are older than the window the agent passes, they are dropped silently (236).
- The plugin must be loaded (for example `--plugin-dir`); how the harness installs competitor plugins is not in what I read.
- `node` must exist in the arm's PATH. The analyzer needs Node with ES modules and `readline` (30-33).
- No network is needed to produce the file; the HTML would request Google Fonts only when opened (template.html:7-9).
- A 2 MB guard (SKILL.md:42) means large fixtures lead the model to trim JSON, which is a place for count errors.
- The model fills the template with Edit (SKILL.md:25-26). That is an extra step where it can mis-copy the JSON.

#### 1.9 What is better than ours, and adoptable

Better or complementary:
1. Four-way token split with output kept as the max over duplicate blocks (304-321). Ours already groups by `requestId` (mine-sessions.mjs:529-533, 612); equal in result. Idea only as a cross-check.
2. Active time with a 5-minute idle cutoff (50, 238-241). We report active days, not active time. Time of activity is a figure managers read; add as a labelled activity figure, not as "time saved".
3. Prompt-to-subagent attribution through tool_use id to `agentId` (247-265, 294-299, 368-377). Ours ladders subagents into the parent session by session id (mine-sessions.mjs:477), which is coarser but sufficient for per-repository figures.
4. Skill and slash-command attribution of tokens (287-293, 451-457, 362-366). Ours has none. A "which skills did the work" table helps an AI-usage report. Cost: medium.
5. Cache-break detection threshold (386-404). Waste signal, not a delivery signal; low value for T4.
6. Auto-continuation messages are not prompts (442-450). Check that our prompt count skips `<task-notification`, `<scheduled-wakeup`, `<background-task`. I did not verify ours; unverified.

Worse than ours: no privacy, no git cross-reference, no fixed output contract, no research bucket, no exclusion of agent machinery, 7-day default, token-only metrics, framing aimed at spend rather than delivery.

Licence: Apache-2.0. Code may be reused with attribution (the licence text, a statement of changes, and keeping notices). Our src/sessions already carries LICENSE-APACHE-2.0 and a change list, which is the correct pattern; a second Apache file from SR can sit in the same folder with its own change list.

---

### 2. cv-builder (CV)

#### 2.1 What it is

An MIT-licensed plugin of four prompt-only skills (create-resume, tailor-resume, review-resume, rewrite-achievements), shared reference files, and a remote MCP server declaration (.mcp.json:1-5) whose one tool `open_builder` sends the finished Markdown to a relay on workers.dev (README.md:57-61, PRIVACY.md:5-7). It contains no script that measures anything. All checks are instructions to the model. The only code is .github/verify-plugin.mjs, a repository integrity check (not read in full, unverified) with SHA256SUMS.

#### 2.2 Rules by topic (file:line)

Truthfulness:
- tailor-resume/SKILL.md:50-55 "Map, never invent"; do not add employers, dates, degrees, metrics, skills.
- :79 "Tailoring may change emphasis and order, but never the strength or ownership of a claim."
- rewrite-achievements/SKILL.md:26-31 numbers only from the user; :34-35 scope preservation.
- writing-quality.md:9-10 preserve meaning and facts; :55-56 no participation into leadership, no team outcome into individual outcome, no estimate into exact number; :145 candidate's role and ownership unchanged; :160-165 four worked before/after examples including "Supported the team that reduced review time by 15%" kept as team outcome.
- writing-quality.md:124-125 invented specificity and any change of owner of an action is flagged.

Gap detection:
- tailor-resume/SKILL.md:56-59 gap table with columns Requirement, Evidence from resume, Missing proof, Suggested bullet; instruction to ask the user instead of guessing.
- :43-49 fit score: skills 40%, experience 40%, culture and seniority 20%; verdict bands 75+, 60-74, 45-59 ("ask the user before drafting"), below 45 ("do not draft without the user's confirmation").
- :32-36 hard-requirement stop (citizenship, visa, language).
- docs/AUDIT.md:11 records the origin of the 40/40/20 scoring and the intake prompts (the author's personal skills).

ATS keyword matching:
- tailor-resume/SKILL.md:51-54 mirror posting terminology only where true; keyword stuffing does not work.
- :63-67 classify each requirement as required/knockout or nice-to-have, confirm each required one has real content, check contact info, parseable dates, real headings.
- review-resume/SKILL.md:27-49 checklist: one H1, email, phone 7-15 digits, parseable dates (`2021`, `05/2021`, `Present`), start not after end, standard section order, no empty sections.
- writing-quality.md:61-62 keep exact qualifications and one stable term per concept.
- No script computes coverage; the model self-reports.

Privacy:
- PRIVACY.md:5-15 relay holds one payload up to 5 minutes; no accounts or logs of content. tailor-resume:29-31 and :94 posting text is untrusted data; links in it are not fetched. Examples use example.com/example.test (tailor:97-98).

Style / slop:
- writing-quality.md:96-110 English and Russian word and pattern lists, em dash replacement (:108-110), final humanization pass (:112-136), preservation checklist (:138-154). The tailor and rewrite skills require this pass before output (tailor:18-25).

Output format:
- Canonical `cv-builder/v1` Markdown with frontmatter and `{zone=...}` attributes (templates/simple-ats.md:1-17; tailor:13-14, 60-62), delivered in chat (tailor:68, create:48), not to a file. Limits 65,536 bytes, 128 blocks (tailor:62).

#### 2.3 How CV handles the task situations

| Task situation | CV behaviour | Evidence |
|---|---|---|
| T2: bullets from a git repository | No git step. create-resume collects facts from the user (create:28-34). rewrite-achievements: numbers "only the user provided" (rewrite:30). An agent running non-interactively must read git itself, with no rule for identities, bots, vendored or generated files, merges or reverts. | create:28-34; rewrite:26-31 |
| T2: way to verify each bullet | Not required anywhere. No source tag, command or evidence file. | search of all four SKILL.md and writing-quality.md |
| T2: no unsupported impact claims | Good. "include a result only if confirmed" (rewrite:26-28); no leadership or ownership inflation (writing-quality:55-56). | |
| T2: exactly 4 bullets, no email, no dash | No count rule. Dash rule yes (writing-quality:108-110; rewrite:40). | |
| T7: JD with gaps (PyTorch, Pinecone, FAISS, Docker) | Gap table plus questions (tailor:56-59); coverage check classes required vs nice (tailor:63-67). Does not add unsupported skills (tailor:54-55). Strong. | |
| T7: trace each bullet to a fact | Not required. Source tags in a resume would also conflict with "keep placeholders and notes outside the final resume" (tailor:89, writing-quality:63). | |
| T7: in-progress project after complete ones | No rule. "Most relevant achievements first" (tailor:51-52) may put ScanSense (YOLO, ONNX) first. | |
| T7: file saved | Skill says deliver in chat (tailor:68). Task prompt asks for resume.md; the model will follow the user prompt, but nothing in the skill writes the file. | |
| T7: fit gate in non-interactive run | If the weighted score lands 45-59 the skill says ask before drafting; below 45, do not draft (tailor:47-49). This JD has four of six required items unsupported, so a score under 60 is plausible. In `claude -p` no one answers, so the arm may output a fit report and no resume.md. Unverified, inferred. | tailor:44-49 |
| T8: dates, titles, employers unchanged | Rule against adding or changing (tailor:55, rewrite:34-35). Risk: the canonical grammar and review checklist prefer `05/2021`-style parseable dates (review:35), so the model may reformat date text. | |
| T8: lead with event-driven work, name required supported items | Matches "most relevant achievements first" and mirror terminology (tailor:50-53). Good. | |
| T8: under 450 words | No length cap beyond "follow the employer" (create:64). Frontmatter and `{zone=main}` tags add tokens that a word counter may count. | |
| Rust and gRPC gaps told to the user | Yes: gap table and questions (tailor:56-59, 68-70). | |

#### 2.4 Estimated score on criteria (estimates, not measured)

| Task | C1 | C2 | C3 | C4 | C5 | Total (range) |
|---|---|---|---|---|---|---|
| T2 CV bullets | partial (numbers come from whatever git commands the agent runs; no rule to run any) | pass (no unsupported claims) | fail or partial (no identity merge, no vendored exclusion rule) | fail (no verification tag) | likely pass on dashes and email; count is not enforced | 1.5 to 2.5 of 5 |
| T7 sample JD | pass | fail (no tags) | pass (gaps listed and told) | partial (project order rule missing) | pass if it drafts; fail if it stalls at the fit gate | 3 to 3.5 of 5 if it drafts; about 1 if it stalls |
| T8 past resume | pass | pass, with a date-format risk | pass | pass | uncertain (no word cap, extra markup) | 3.5 to 4.5 of 5 |

#### 2.5 Behaviour of the CV arm in our harness

- Without `.mcp.json` no `open_builder` tool exists. The skills treat the tool as optional ("If the CV Builder MCP server is connected", tailor:70, create:48-49, rewrite:52). Output falls back to Markdown in chat. Nothing breaks, and no resume text leaves the machine (PRIVACY.md:5-7 applies only when the tool is called).
- The shipped grammar copy is used instead of the live `cv-builder://markdown/v1` resource (tailor:15-16). No functional loss.
- The skills ask questions often (create:28, tailor:37-38, 56-59). With `claude -p` the questions go unanswered; the output will end with questions, and files may not be written. This is the largest risk for T2 and for borderline T7.
- Each skill asks the model to read a 13 KB writing-quality file and a 12 KB grammar file before writing (tailor:20; create:13). That adds input tokens per run, with no change to numeric accuracy.
- The arm's skill trigger depends on the skill description text (tailor-resume front matter, lines 3-7); T2 (git bullets, no resume file) matches none of the four descriptions closely, so the arm may not load any skill for T2. Unverified.

#### 2.6 What is better than ours, and adoptable

Our tailor reference already has: tagged facts, a deterministic `bullets --resume` command, a Gaps section, a keyword coverage table with Must-have column, an ordering check, and the in-progress rule (references/tailor.md:5, 18, 28-36, 52-64). That is stricter than CV on number fidelity, traceability and ordering. CV is better on:

1. Fit score with weights and verdict bands (tailor:43-49). Gives a numeric "how well does the bank cover the JD" line. Risk: the stop-and-ask bands would hurt in a non-interactive run; adopt the number, not the gate.
2. Knockout versus nice-to-have classification (tailor:63-67). Ours has a Must-have column; the knockout flag adds a pass/fail framing for hard requirements.
3. Hard-requirement stop for citizenship, visa, language level (tailor:32-36). Ours has no equivalent that I found. Adopt as a gap type that is reported, not blocking.
4. Ownership and attribution preservation with worked examples (writing-quality:55-56, 145, 160-165). Useful for T2-type rewrites where "led" or "owned" must not appear (old held-out H2 criterion 5).
5. Review mode that quotes the exact wording with a proposed fix and does not silently rewrite (writing-quality:27-28).
6. Posting-as-untrusted-input rule (tailor:29-31). Ours has a project-name rule (SKILL.md "Claude Code usage report" step 4); extend the same wording to JD text if tailor.md does not have it (I saw no match in the grep; unverified).
7. Dash replacement guidance (writing-quality:108-110). We already meet C5 of T2/T7 on dashes.

Not adoptable or not useful for us: country templates, rirekisho, canonical `{zone=...}` grammar, the relay and `open_builder`, the Russian word lists (outside our tasks).

Licence: MIT. Code and text may be copied with the copyright notice and licence text kept. Almost all of the useful part is prose rules, which we would reword anyway.

---

### 3. Idea table

Loss classes used: N = number or fact fidelity; G = gap disclosure; V = verifiability or source trace; P = privacy; S = scope/ownership inflation; H = harness/non-interactive behaviour; R = report framing for the reader; A = attribution of usage.

| idea | source file:line | licence | closes which loss class | cost |
|---|---|---|---|---|
| Active-time figure with 5-minute idle cutoff, labelled as activity not time saved | SR analyze-sessions.mjs:50, 238-241 | Apache-2.0, code reusable with attribution and change notice | R (manager report content); not a T4 criterion directly | Low. About 15 lines in mine-sessions.mjs, new field, must be checked against the C3 "no hours saved" rule |
| Token share per skill and slash command | SR analyze-sessions.mjs:287-293, 362-366, 451-457 | Apache-2.0 | A, R | Medium. New table, new tests, must not leak skill names that identify private work |
| Prompt to subagent attribution via tool_use id and agentId | SR analyze-sessions.mjs:247-265, 294-299, 368-377 | Apache-2.0 | A | Medium. Our session-level ladder is enough for T4; idea only |
| Skip auto-continuation messages when counting prompts | SR analyze-sessions.mjs:442-450 | Apache-2.0 | N (T4 C2 prompt count if it differs from the miner) | Low. Check whether ours already does; unverified |
| Process main transcripts before subagent files to give replayed entries to the parent | SR analyze-sessions.mjs:541-545 | Apache-2.0 | N (double counting) | Low. Check whether ours has an ordering equivalent; unverified |
| Default-window and `--dir` pitfall: state the window used and the root read in the output | SR SKILL.md:12-16 (the gap), analyze:45, 236 | Apache-2.0 (observation only) | H, N | Low. Add period and root-kind to our report text so a wrong window is visible |
| Current-session and agent scratch exclusion (SR lacks it; ours has it) | ours mine-sessions.mjs:270-307; SR absent | n/a | H, N | None. Keep; it is where we beat SR in a temp-HOME harness |
| Fit score 40/40/20 with verdict bands, number only | CV tailor-resume/SKILL.md:43-49 | MIT, prose may be copied with notice | G, R | Low. Do not copy the "ask before drafting" gate: non-interactive runs stall |
| Knockout versus nice-to-have flag per JD requirement | CV tailor-resume/SKILL.md:63-67 | MIT | G | Low. Add one column value to our keyword coverage table |
| Hard-requirement report (citizenship, visa, language level) | CV tailor-resume/SKILL.md:32-36 | MIT | G | Low. Report as a gap line, no blocking |
| Ownership and attribution preservation rule with worked examples | CV references/writing-quality.md:55-56, 145, 160-165 | MIT | S | Low. Add 2 examples to bullets.md; helps H2-style "led/owned" criterion |
| Review mode: quote, problem, proposed fix, no silent rewrite | CV references/writing-quality.md:27-28; review-resume/SKILL.md:21-22 | MIT | V, S | Low |
| Posting text is untrusted data, links not followed | CV tailor-resume/SKILL.md:29-31, 94 | MIT | H (injection), P | Low. Confirm the same sentence exists in references/tailor.md |
| Date format hazard: do not normalise source date text | CV review-resume/SKILL.md:35 (the risk), ours tailor.md:6 (date ranges copied as written) | n/a | N | None. Ours already copies dates as written; keep |
| Prompt-text and path redaction (SR lacks it; ours has it) | ours mine-sessions.mjs:10-11; SR analyze:117, 482-490 | n/a | P | None. Keep |

### 4. Summary for the decision

- SR does not threaten our T4 outcome. It fails the active-day and by-project-with-research-bucket items by design, has no delivery figures, no privacy handling, and a 7-day default. Its parser logic is sound and close to ours; its only useful additions are active time, skill attribution and the continuation-message rule.
- CV can score on T7/T8 gap and fidelity criteria because of its gap table and non-invention rules (tailor:50-59), but has no traceability, no ordering rule, no git evidence and no verification tag, so it loses T2 C1/C3/C4 and T7 C2. Its biggest outcome risk in our harness is stopping to ask questions (tailor:47-49, create:28), which would zero some criteria for it. This favours it being weaker than ours on T2/T7 and about equal on T8.
- Nothing here changes the round-3 loss on h1, h2, h9, h14, h17, h18 directly. I did not read those task definitions in this phase, so I make no claim about them.

## Phase 2c: open-source and technology survey

Date: 2026-10-22. Scope: techniques for workproof (dependency-light Node/TypeScript CLI).

### 0. Method and limits

- `common.md` describes a different product (ai-slop-linter, benchmark h1..h18). Its hard rules were applied (no execution of third-party code, no repo edits, only this output file written, plain literal prose). Its benchmark context was not used, because the task statement names workproof.
- No repository was cloned. Source files were not read. Every statement about internals comes from README pages, man pages, the GitHub API (`api.github.com/repos/...` fields `license.spdx_id`, `pushed_at`) or arXiv API listings fetched in this session. Anything not fetched is marked "unverified".
- "Last commit" is the GitHub `pushed_at` value, fetched 2026-10-22. It is the last push to any branch, not necessarily the default branch.
- `NOASSERTION` from the API means GitHub could not detect the licence. I then used the README text or the LICENSE file where I fetched it.
- Loss classes: a = final-answer completeness/gaps; b = foreign-format report fallback; c = public-looking repo; d = privacy in chat; e = truthfulness/claim-evidence; f = generalisation.
- Not covered (budget): RAKE, spaCy skill matchers, OpenResume internals, Reactive-Resume, JobSpy, SLSA spec text, W3C verifiable credentials, `git notes` man page. They appear below only as "unverified" rows.

### 1. Git contribution statistics and identity merging

Facts from the git manuals (fetched):

- `.mailmap` has four forms: `Name <commit-email>`, `<proper-email> <commit-email>`, `Name <proper-email> <commit-email>`, `Name <proper-email> Commit Name <commit-email>`. Matching ignores case. Location: repo root, or `mailmap.file` / `mailmap.blob` (https://git-scm.com/docs/gitmailmap). The man page does not state how shortlog/log/blame use it. That part is unverified here (general knowledge: `git shortlog` applies it by default, `git log` needs `--use-mailmap`).
- `git blame -w` ignores whitespace when comparing parent and child. `-M[num]` detects moves/copies inside a file (default threshold 20 alphanumeric characters). `-C[num]` detects copies from other files: once = files changed in the same commit; twice = also the commit that created the file; three times = any commit (default threshold 40). `--ignore-rev` / `--ignore-revs-file` / `blame.ignoreRevsFile` assign blame as if the commit did not happen. `blame.markIgnoredLines` and `blame.markUnblamableLines` mark affected lines. `--porcelain` and `--line-porcelain` give machine output with `author`, `author-mail`, `author-time`, `summary` (https://git-scm.com/docs/git-blame).

| Technique | Source | Licence | Last push | Loss class | Cost | Generalisation risk | Verdict |
|---|---|---|---|---|---|---|---|
| `.mailmap` + `git shortlog -sne` / `git log --use-mailmap` | https://git-scm.com/docs/gitmailmap | part of git (GPL-2.0, unverified for this page) | n/a | e, f | zero dependency, offline, fast | A mailmap exists only if the repo owner wrote one. Without it, aliases are not merged. | Adopt idea: read `.mailmap` if present; also let the user pass an alias list. |
| `git blame -w -M -C --line-porcelain` | https://git-scm.com/docs/git-blame | git | n/a | e | zero dependency, offline. Slow on large files (one blame per file). `-C -C -C` is the slowest. | `-w` and `-M` reduce credit for reformatting and moves. They cannot remove credit for a bulk rewrite whose commit is not listed. | Adopt idea: `-w -M -C` for surviving-line attribution; allow `.git-blame-ignore-revs`. |
| `--ignore-revs-file` | same page | git | n/a | e | zero | Needs the list of formatter/mass-edit commits. Detection of such commits could use a size threshold (own heuristic, not from a source). | Adopt idea. |
| git-fame (Python) | https://github.com/casperdcl/git-fame | MPL-2.0 (LICENCE first line "Mozilla Public License Version 2.0") | 2026-10-05 | e | Python plus pip packages; README implies tqdm, tabulate, shtab (README did not list them; unverified) | Python, not Node. Shows `-w -M -C` are exposed as options (README text says `-w`, `-M`, `-C` flags are explained; I only confirmed the descriptions). | Adopt idea only: mirrors the blame-based lines/commits/files triple. Reject code (language, MPL file-level copyleft). |
| gitinspector | https://github.com/ejwa/gitinspector | GPL-3.0 | 2026-10-21 | e | Python | GPL-3.0 prevents copying code into a permissive tool. README page did not describe alias merging or rewritten-history detection (not covered; unverified). | Reject (licence). |
| git-quick-stats | https://github.com/arzzen/git-quick-stats | MIT | 2026-04-18 | e | Bash script; commits per author, timezone/hour breakdown, CSV and JSON export, `_GIT_IGNORE_AUTHORS` | Bash only. Counts commits, not surviving lines. | Adopt idea: per-author timezone/hour breakdown as a cross-check signal. Reject code. |
| git-who | https://github.com/sinclairtarget/git-who | MIT | 2026-05-28 | e | Go binary; `table`, `tree`, `hist` modes; respects `.mailmap`; skips commits in `.git-blame-ignore-revs`; caches under `XDG_CACHE_HOME` | Binary dependency. | Adopt idea: "top contributor per path" (`tree`) and yearly `hist` are good cross-checks against a claimed role. Reject code (Go). |

Rewritten-history detection: none of the fetched pages describes a detector. Candidate checks workproof can compute itself (own design, not from a source): author date vs committer date gaps, committer different from author on many commits, commit count per day spikes, signature present/absent, reflog not available in a clone. Mark as unverified design.

### 2. Resume and job-description matching, gap detection

| Technique | Source | Licence | Last push | Loss class | Cost | Generalisation risk | Verdict |
|---|---|---|---|---|---|---|---|
| Resume-Matcher | https://github.com/srbhr/Resume-Matcher | Apache-2.0 (API; README page said "not stated", API says Apache-2.0) | 2026-10-21 | a | Python 3.13 + FastAPI + LiteLLM + SQLite + Playwright. README: ATS score is plain code, weights keyword 40%, skills 20%, title 15%, section completeness 15%, date consistency 10%; tailoring uses an LLM. | Weights are the project's own choice; no validation seen. Whole stack is too heavy. | Adopt idea: a deterministic keyword/skill coverage score with a gap list (JD terms not found in evidence). Reject code. |
| OpenResume (parser) | https://github.com/xitanggg/open-resume | AGPL-3.0 | 2024-10-29 | a | TypeScript, but AGPL and not updated for two years | AGPL forbids copying into a permissive tool | Reject. |
| pyresparser | https://github.com/OmkarPathak/pyresparser | GPL-3.0 | 2023-09-13 | a | Python, stale | GPL, stale | Reject. |
| YAKE | https://github.com/LIAAD/yake | licence not named on README; API gave no SPDX result (unverified) | 2026-08-25 | a | Python 3.10+, unsupervised, no corpus, multilingual (Portuguese example; Turkish not mentioned) | Output depends on language stop-word list | Adopt idea: statistical keyword extraction without a model is possible. Own TypeScript term-frequency + n-gram is enough. Reject code. |
| KeyBERT | https://github.com/MaartenGr/KeyBERT | MIT | 2026-10-21 | a | PyTorch via sentence-transformers by default; a no-torch path uses model2vec (README) | Heavy ML dependency | Reject. |
| RAKE, spaCy skill matchers | not fetched | unverified | unverified | a | unverified | unverified | No verdict; not surveyed. |
| ESCO skills taxonomy | https://esco.ec.europa.eu (search result only; page not opened) | EU content CC BY 4.0; some parts CC BY-SA 4.0 per search snippet | unverified | a, f | Large CSV download; multilingual (Turkish presence unverified) | Skill labels do not cover repo-level evidence such as "uses Redis" | Adopt idea: use a small bundled alias list of technologies, not the whole taxonomy. |
| O*NET database | https://www.onetcenter.org/license_agreements.html (search result only) | CC BY 4.0 per snippet; database terms not confirmed | unverified | a | Large download | US occupations | Reject (size, low value). |
| jjzha/jobbert_skill_extraction (HF) | https://huggingface.co/jjzha/jobbert_skill_extraction | licence not stated on page | not shown | a | 0.1B parameter token classifier; needs transformers runtime | No licence stated means no right to use. English only. | Reject. |
| algiraldohe/lm-ner-linkedin-skills-recognition (HF) | https://huggingface.co/algiraldohe/lm-ner-linkedin-skills-recognition | licence not listed | not shown | a | DistilBERT NER | no licence, training data "None dataset" | Reject. |
| jjzha/skillspan dataset (HF) | https://huggingface.co/datasets/jjzha/skillspan | cc-by-4.0 | not shown | a | 11.5k sentences, English | job-posting text, not resumes | Adopt idea: usable as a test corpus for a skill matcher; no runtime use. |
| ttxy/resume_ner dataset (HF) | via search result (page not opened) | "bsd" tag per snippet | unverified | a | CSV, 1k to 10k rows | language/provenance unverified | Unverified; do not use until opened. |

### 3. PII and privacy masking

| Technique | Source | Licence | Last push | Loss class | Cost | Generalisation risk | Verdict |
|---|---|---|---|---|---|---|---|
| Microsoft Presidio | https://github.com/microsoft/presidio | MIT | 2026-10-19 | d | Python; NER via spaCy/transformers; predefined and custom recognizers (regex, checksum, context). Offline operation not stated on README. | Name detection by NER misses lookalike and non-English names | Adopt idea: recognizer = pattern + context + score. Reject code (Python + models). |
| scrubadub | https://pypi.org/project/scrubadub/ | "Apache Software License (MIT)" per PyPI | 2.0.1, released 2023-09-01 | d | Python 3.6+; detectors for names, emails, phones, URLs, credit cards, US SSN, GB numbers | Stale; US/GB-centred | Adopt idea only: filter-per-type design. Reject code. |
| pii-codex, lookalike-name handling | not fetched | unverified | unverified | d | unverified | unverified | No verdict. |
| Own deterministic output filter on the final answer | own design | n/a | n/a | d, e | Dependency-free regexes (email, phone, IBAN-like, API-key prefixes, absolute home paths) plus an exact-match deny list built from `git config user.email` and author emails of the repo | A deny list of exact strings does not catch variants (case, diacritics, `ı`/`i`). Normalise before matching (own design, untested). | Adopt: this is the only option that fits the dependency constraint. Run it on the final answer, not only on inputs. |

### 4. Claude Code session-log analysis

| Technique | Source | Licence | Last push | Loss class | Cost | Generalisation risk | Verdict |
|---|---|---|---|---|---|---|---|
| ccusage | https://github.com/ryoppippi/ccusage | MIT (README; LICENSE file is at `apps/ccusage/LICENSE`, content not read) | 2026-10-22 | e, f | Node/Rust monorepo; reads `~/.claude/projects`; USD cost from LiteLLM pricing; `--offline` flag exists. JSONL fields and de-duplication logic: not covered on the page, unverified. | Log format is undocumented and can change | Adopt idea: pricing table + per-session grouping. Read its source before copying parsing rules (not done). |
| claude-code-log | https://github.com/daaain/claude-code-log | MIT | 2026-10-09 | e | Python; parses user prompts, assistant replies with token usage, tool uses and results, thinking, summaries; outputs HTML/Markdown/JSON; commit SHA links | Python | Adopt idea: message-type list is a useful schema checklist. |
| claude-code-transcripts | https://github.com/simonw/claude-code-transcripts | Apache-2.0 | 2026-02-12 | e | Python; JSON/JSONL to HTML | same | Adopt idea only. |
| Anthropic session-report plugin | https://claude.com/marketplace/plugins/session-report (search result only) | unverified | unverified | e | Builds an HTML report from local transcripts: tokens, cache efficiency, subagents, skills, costly prompts (search snippet) | Source not seen | No verdict (unverified). |

Schema note: the JSONL schema is not documented in any page I fetched. Treat field names as unverified until read from a real local session file.

### 5. Evidence and attestation

| Technique | Source | Licence | Last push | Loss class | Cost | Generalisation risk | Verdict |
|---|---|---|---|---|---|---|---|
| gitsign | https://github.com/sigstore/gitsign | Apache-2.0 (LICENSE first line "Apache License") | 2026-08-27 | c, e | Go; keyless signing with OIDC identity; README says offline Rekor mode is experimental | Needs the repo owner's signing setup; verifying needs network by default | Adopt idea: report whether commits carry a verifiable signature (`git log --show-signature` / `%G?`) as a trust signal. Reject code. |
| in-toto | https://github.com/in-toto/in-toto | "Copyright 2018 New York University" first line; Apache-2.0 per API is not confirmed (API returned NOASSERTION) | 2026-02-11 | e | Python; signed link/layout metadata | Designed for supply-chain steps, not authorship | Adopt idea: a signed list of (claim, evidence pointer) pairs. Reject code. |
| SLSA | https://github.com/slsa-framework/slsa | API NOASSERTION (unverified) | 2026-10-22 | e | specification only | Targets build provenance | Reject. |
| Hash-chained report | own design | n/a | n/a | e | `node:crypto` only. Each claim stores the SHA of the commit/file blob it cites; the report stores a SHA-256 of the claim list. | Proves integrity of the report, not truth of the claim | Adopt: cheap and local. |
| `git notes`, verifiable credentials | not fetched | unverified | unverified | e | unverified | unverified | No verdict. |

### 6. arXiv papers (found via the arXiv API; abstracts only, full texts not read)

| Paper | Source | Date | Relevance | Verdict |
|---|---|---|---|---|
| FActScore | https://arxiv.org/abs/2305.14251 | 2023-05-23 | Splits text into atomic facts and measures the share supported by a source. Same shape as claim-evidence checking. | Adopt idea (e). |
| SelfCheckGPT | https://arxiv.org/abs/2303.08896 | 2023-03-15 | Detects hallucination by sampling agreement; needs multiple model runs. | Reject (cost; workproof has a source of truth, the repo). |
| ResumeFlow | https://arxiv.org/abs/2402.06221 | 2024-02-09 | LLM resume tailoring with alignment and hallucination metrics. | Adopt idea: report a hallucination count next to an alignment score. |
| Grounded Optimization (resume rewriting) | https://arxiv.org/abs/2607.01457 | 2026-07-01 | Five-layer defence; abstract says prompt grounding alone removed detected hallucinations at low temperature with a strong model. | Adopt idea (e), after reading the full text. |
| Career-Aware Resume Tailoring with provenance tracking | https://arxiv.org/abs/2605.05257 | 2026-05-06 | Provenance tracking of each statement; scores fall when domain experience is missing. | Adopt idea: every output line carries a source pointer; missing evidence is shown as a gap (a, e). |
| Multi-FAct / Multilingual FActScore | https://arxiv.org/abs/2402.18045, https://arxiv.org/abs/2406.19415 | 2024 | Factuality checks behave inconsistently across languages. | Adopt as a warning for non-English output (f). |

The first query on a search engine found no arXiv papers; these came from the arXiv API. I did not find a paper that verifies claims specifically against a git repository (SA-Bench, 2608.24252, compares generated code to paper specifications, which is a different problem).

### 7. Ranked top 10 (value for workproof vs cost)

1. Own deterministic output filter for the final answer: regexes + exact deny list from repo author emails, with Unicode normalisation (d, e). No dependency.
2. Claim-evidence record: every sentence in the final answer carries a pointer (commit SHA, file path, line) and unsupported statements are dropped or shown as gaps. Basis: FActScore atomic facts, provenance paper 2605.05257 (e, a).
3. `git blame -w -M -C --line-porcelain` for surviving-line attribution, with `.git-blame-ignore-revs` / `--ignore-revs-file` (e).
4. `.mailmap` support plus a user-supplied alias list, applied before any per-author count (e, f).
5. Deterministic JD-coverage score with a gap list (JD terms with no evidence), modelled on Resume-Matcher's code-only ATS score. Weights need your own validation (a).
6. Cross-check signals from git-quick-stats and git-who ideas: per-author timezone/hour profile and top contributor per path, to detect a claimed role that the history does not support (e).
7. Signature status of commits (`%G?`) reported as a trust signal; no gitsign code (c, e).
8. Hash-chained report using `node:crypto`: SHA-256 over the claim list with cited blob SHAs (e).
9. Session-log parsing based on ccusage and claude-code-log message types, after reading a real local JSONL file to confirm fields (e, f). ccusage pricing/offline approach is a design reference.
10. Use SkillSpan (CC BY 4.0) as a test corpus for the skill matcher, not at runtime (a, f).

Rejected for licence or weight: gitinspector (GPL-3.0), pyresparser (GPL-3.0), OpenResume (AGPL-3.0), KeyBERT (PyTorch), jobbert and the LinkedIn skills NER (no licence stated), Presidio and scrubadub code (Python, models).
