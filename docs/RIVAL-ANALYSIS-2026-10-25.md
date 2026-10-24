# Why workproof loses to the other arms: round 15 gates 3 and 4

Date: 2026-10-25. Branch `plugin-leadership`. Product under test in gate 4: `02af6c0`, in gate 3: `09fdd2f`. Read-only analysis: no benchmark run, no `claude -p` call, no product edit.

Sources read:

- `docs/HEAD-TO-HEAD.md`, sections "Round 15, gate 3" to "Round 15, gate 4 result" (lines 1418 to 1488).
- `bench/head-to-head/results/round15-gate3/` and `round15-gate4/`: `results.txt`, `tasks.json`, the five vote folders `grades/v1..v5` (one reason and one verdict per criterion), and `tasks-src/` (the writers' prompts, criteria and truth files).
- The 540 cell transcripts (`out.jsonl`) and the files each cell wrote, in the scratchpad run folders `gate3/runs/` and `gate4/runs/`.
- The arm folders as run: `arms/ours18` (gate 4), `arms/rcp`, `arms/cv`, `arms/base`.
- The product: `skills/workproof/references/core-rules.md`, `skills/workproof/SKILL.md`, `hooks/workproof-hint.sh`, `src/figures.ts`, `src/stopcheck.ts`.

Method. I combined the five votes per criterion by majority, per run, the way `r15/score-r15.py` does. Then I listed every criterion that an OURS run failed, with the grader's reason, and read the matching OURS answer and the answer of the arm that passed. Tool calls, cost, tokens and hook events come from the `result` and `system` events of the transcripts. The helper scripts are in the scratchpad (`rival/crit.py`, `rival/cost.py`, `rival/skills.py`, `rival/trace.py`) and are not part of the repository.

Labels. **[M]** means measured from the files named. **[H]** means a hypothesis that this data does not prove.

## Summary

1. **On these tasks the rival arms are the bare model.** [M] In 270 rival cells over gates 3 and 4, CV, CV_I and RCP made no Skill call. RCP_I called `receipts:receipts` in 45 of 45 cells per gate, then wrote "The receipts miner reports one person's Claude Code activity ... I'll count from the git history directly" (W10T2-RCP_I-1) and did the work with plain git. So the five "other arms" are five samples of plain Sonnet, with slightly different prompts. Their totals spread by 4.0 points (gate 4) and 9.3 points (gate 3). OURS loses to the bare model, not to a better-designed tool.
2. **Our fixed rules choose one convention per hazard. The writers' truths choose the convention from the purpose the user states.** The bare model reads that purpose. The rules override it. Of the 45 criteria that OURS runs failed in gate 4, 16 are date handling, 10 are identity, 7 are reverts, 5 are hedged headlines and 7 are other causes. [M] In most of the first three groups the transcript shows the model applying a core rule, or trusting a `figures` row whose meaning does not match the question.
3. **Cost is 1.78 times BASE because OURS does more work, not because the task is different.** [M] OURS made 9.6 turns per cell against 5.9, produced 7,358 output tokens against 4,041, and made 91 Write/Edit calls against 43. 38 of 45 cells read `core-rules.md` again although the hint had already put all of it into the prompt. 15 of 45 cells wrote an `evidence/` sidecar that nobody asked for. In 11 of 45 cells the Stop hook blocked once over an e-mail address and forced an extra edit turn.

Recommendation: option (b), the redesign, with option (a) published now as the interim statement. The evidence does not support option (c). See "Design implications".

## 1. What the arms are

| Arm | What it is (source, pin) | What it did in gates 3 and 4 [M] |
|---|---|---|
| OURS | this repository at `02af6c0` (gate 4), `git archive`, built, `bench/` removed (`arms/ours18`) | no Skill call in 90 cells; the rules came only from the UserPromptSubmit hint; `figures` run in 25 of 45 cells (gate 4) |
| BASE | empty plugin (`arms/base/.claude-plugin/plugin.json`) | plain git |
| RCP | receipts, `anthropics/claude-plugins-official` `plugins/receipts` at 465f093, patched for `RECEIPTS_HOME` (`HEAD-TO-HEAD.md:1312`) | no Skill call; plain git |
| RCP_I | the same, with the prompt prefix "Use the receipts skill (the /receipts command)." (`tasks.json` `invoked`) | Skill called in 45 of 45 cells, found not applicable, then plain git; cost +33 % over BASE |
| CV | cv-builder `flodirka/cv-builder-plugin` at f7c8c3b, `.mcp.json` removed (`HEAD-TO-HEAD.md:897`) | no Skill call; plain git |
| CV_I | the same, with the prefix "Use the cv-builder skills (tailor-resume, rewrite-achievements, review-resume, create-resume)." | no Skill call in 45 of 45 cells; plain git |

I did not clone the upstreams again: the arm folders that were run are on disk under the scratchpad `arms/`, at the pins above.

## 2. Where OURS lost points, task by task (gate 4)

Gate 4 totals (maximum 75): BASE 65.33, CV_I 64.33, CV 64.00, RCP 62.00, RCP_I 61.33, OURS 60.00. OURS trails BASE by 8.67 points on six tasks and leads it by 3.33 points on three. The table lists every task where OURS lost points. "Who got them" is the arm that passed the same criterion.

| Task | OURS vs best | Criteria OURS failed (runs) | Grader reason (vote 1) | What OURS did, and why | What the passing arm did |
|---|---|---|---|---|---|
| W10T5 new vs returning contributors, Jan to Sep 2026 UTC | 1.00 vs BASE 5.00 | C1, C2, C4, C5 in 3 of 3 runs | "Pia is excluded from the counted totals because of her 2027 author date" | None of the 3 runs called `figures`: plain git with core rules 2 and 8 (`core-rules.md:6`, `:12`: "author date", "flag future dates, omit from dated lists"). OURS-1 even wrote "If you want it counted by its commit date, the totals become 9 people, 4 new" and still did not count her | BASE-1 `CONTRIBUTORS-2026.md:14` counts "Pia Larsen, 1, New" and flags the clock error |
| W10T3 Q3 thank-you list incl. trailers, UTC | 3.00 vs 5.00 (all five rivals) | C1, C2, C5 in runs 1 and 2 | "author dates in non-UTC offsets were used"; "Hye-jin is split into two rows, one authored and one co-authored" | Run 1 ran `figures --since 2026-07-01 --until 2026-09-30`. Date-only bounds in `figures` are "the local calendar date in the commit's own offset" (`src/figures.ts:93`, `:410`), so it counted 12 commits where the UTC truth has 10. Run 2 ran `npx --no-install workproof figures --help`, concluded "the workproof CLI isn't installed", counted by hand and split Hye-jin into an author row and a co-author row (core rule 3, `core-rules.md:7`: co-authored work "is its own row") | BASE-1 `THANKS-Q3.md:7`: "Hye-jin Seo ... 5 (2 authored, 3 co-authored)" in one row, UTC window |
| W10T2 hand-written Go lines per person, "a smaller number I can defend" | 3.67 vs 5.00 | C3, C5 in runs 1 and 3 | "Ben is headlined at +192, which counts the reverted 120 lines as his" | OURS-1 `IMPACT.md:32`: "It is hand-written and stays in his added lines, but it is not shipped work". This is core rule 6 word for word (`core-rules.md:10`: "reverted work stays in lines written") | BASE-1 `IMPACT.md:32`: "Net zero, so neither the addition nor the removal is credited to anyone" |
| W11T3 contribution statement, no overclaims | 4.00 vs CV_I 5.00 | C2 in 3 of 3 runs | "Claims the indentation-removal helper as delivered, though it was reverted" | All 3 runs ran `figures --author`. `figures` printed `revert commits | 0` and `commits reverted by those reverts | 0`, because it looks only at reverts that the person authored (`src/figures.ts:506`: `windowed.filter(isMine)`). The maintainer had reverted her commit. The model trusted the 0 and wrote "none reverted" | BASE-1 read the log: "`cd33714` (Markup.dedent): Marta Quist reverted it in `e7743b1`, so it isn't your shipped work" |
| W11T5 timeline, clock errors, namesake | 4.00, tie with BASE; C5 lost | C5 in 3 of 3 runs | "Counts the othercorp namesake commit 5992547 as hers" | OURS-1: "I included nadia.petrova@othercorp.example because it has the same full name, and I can't tell if it's you". That is rule 1 and rule 5 for the user's own work ("included ... never dropped", "add the listed identity candidates") | BASE-1: "I left it out, and it doesn't change any month or the gap" |
| W12T3 rank four students, padding | 4.33 vs CV_I 5.00 | C5 in runs 1 and 2 | "Lena's 1970-dated 'fix: rounding' commit was excluded" | `report.md:66`: "recorded date is 1 January 1970 ... not counted". Author-date window (rules 2 and 8) | BASE-2 `report.md:73`: "misconfigured clock. Its committer date is 4 Nov 2026, which is in term. I used the committer date." |
| W11T2 surviving-lines share | 3.67 vs BASE 4.00 | run 2: C1, C3; runs 2 and 3: C4 | "denominator is 790 because it includes non-source files" | one run with the wrong scope; squash-merge caveat not stated | variance, no single cause |
| W10T1 half-year acknowledgements (OURS leads 4.33 vs 4.00) | lost C2, C4 in run 3 | | "Ana is split into Ana Souza 3 and asouza 2" | OURS-3 `ACKNOWLEDGEMENTS.md:35`: "a sign-off is not proof, so they are shown as separate rows". Rule 7: "self-credit and Signed-off-by are no help" (`core-rules.md:11`) | BASE-1 `ACKNOWLEDGEMENTS.md:30`: "carry `Signed-off-by: Ana Souza <ana@example.com>`, so they are counted as Ana's" |

Where OURS gained points in gate 4 [M]: W11T1 (C1 and C2, the multi-identity commit list: OURS 3 of 3 and 2 of 3, BASE 0 of 3), W12T2 (C1, C2 and C4, the squash commit with only a Co-authored-by trailer and the merged identities: OURS 3 of 3 on C2, BASE 2 of 3, CV 0 of 3), W11T5 C4 (anomalous dates flagged: OURS 3 of 3, every rival 0 of 3), W10T1 C4.

Gate 3 shows the same pattern [M]. OURS lost W7T1 C2 and C4 in 3 of 3 runs ("signing guide held out as unconfirmed"), W9T1 C1 and C2 in 3 of 3 runs ("Mira is split into two rows"), W8T3 C5 ("uses author date in each commit's own offset") and W8T3 C2 ("Oct 19 is missing because the revert was excluded": a billing task, where a revert is a day of work). OURS won where a rule names a hazard that the bare model skips: W9T2 C1 and C3 (date convention named, two measures), W8T3 C4 (a 2027 clock date flagged), W7T4 C1 (trusted figures beside raw figures).

### Causes of the 45 failed OURS criteria in gate 4

| Cause | Run-criteria | Tasks | Mechanism |
|---|---|---|---|
| Date convention | 16 | W10T5 (12), W12T3 (2), W10T3 (2) | rules 2 and 8 (author date, omit future dates); the `figures` local-offset day window |
| Identity merge or split | 10 | W10T3 (4), W11T5 (3), W10T1 (2), W11T1 (1) | rule 3 "its own row"; rule 7 "Signed-off-by no help"; rules 1 and 5 "include candidates, never dropped" |
| Revert treatment | 7 | W10T2 (4), W11T3 (3) | rule 6 "stays in lines written"; `figures` counts only reverts the person authored |
| Hedged headline | 5 | W12T2 (5) | rule 7 three states and "not verifiable here"; the answer said "not established". C5 failed for every arm |
| Other | 7 | W11T2 (4), W10T4 (2), W11T1 (1) | scope and wording; variance |

## 3. What the rival tools do structurally

| Question | receipts (RCP) | cv-builder (CV) | workproof (OURS) |
|---|---|---|---|
| Size of what the model reads | `SKILL.md` 300 lines, 17,254 characters, read only when invoked | 4 skills of 5.3 to 7.9 thousand characters plus a 13.3 thousand character `writing-quality.md`, read only when invoked; never invoked here | 6.6 to 7.0 thousand characters of hint on every prompt (`hooks/workproof-hint.sh:202-213`: rules plus a prepared brief), 729 characters at session start, and `core-rules.md` read again in 38 of 45 cells |
| Delegated to code | everything numeric: `scripts/mine-transcripts.mjs` (1,474 lines) mines the session logs and git; the model writes "from the JSON only" (`SKILL.md:165`) | nothing: no scripts, no git; the facts come from the user's resume | some figures (`figures`, `owner`, `reviews`); the convention choices (window, identity, reverts, future dates) are in prose rules |
| Identity | one identity: `git config user.email` (`mine-transcripts.mjs:878`); no merging | none | prose rules 1, 5 and 7 plus `figures` candidate rows |
| Time window | `--days N`, filtered on committer date `%cI` ("the commit LANDED in this period", `mine-transcripts.mjs:825-835`) | none | author date, local offset of each commit (`src/figures.ts:93`, `:410`, `:474`); the brief is also on local days (`:913-914`) |
| Reverts, vendored code, trailers, thank-you lists | none (0 matches for revert, vendor, co-authored, mailmap, signed-off, thank) | none (0 matches) | rules 3, 6, 7 and 9; `figures` exclusion rows; `reviews` reads trailers |
| Guardrail style | short procedural steps, one deterministic script | "map, never invent" (`tailor-resume/SKILL.md:50`) | ten numbered rules, several of which fix one convention |

What this means [M]: neither rival has any capability for the hazards in these tasks. Their scores are the bare model's scores. The one structural idea to take from receipts is the split: code produces every number and states its convention, and the model only writes. Receipts also makes the opposite window choice (committer date), which matches 3 of the writers' truths (W10T4 landing order, W10T5 Pia, W12T3 Lena). It shows that "the right date" depends on the question, so one fixed date rule cannot be right for every writer.

## 4. Why the bare model beats us on fresh writers

### Measured facts

1. **Rules applied to the wrong case.** In 23 of the 33 date, identity and revert failures, the OURS text repeats a core rule, or follows a `figures` row whose meaning does not match the question. Examples: W10T5 (rule 8, 3 of 3 runs, no CLI call at all), W10T2 (rule 6, quoted), W10T1 (rule 7, Signed-off-by), W11T5 (rules 1 and 5), W10T3 (rule 3, and the CLI local-day window). In each of these the bare model made the choice the writer's truth expects.
2. **The writers disagree on conventions, and they pick by purpose.** W11T1 C2 wants author date in UTC, with the rebased commit out. W10T5 C4 and W12T3 C5 want an impossible author date replaced by the committer date. W11T5 C4 wants the same impossible dates excluded from a timeline. W10T2 wants reverted lines out of a "defensible" figure, but gate 3 W8T3 wants the revert day kept for billing. W10T1 accepts a Signed-off-by as proof of identity. W11T5 keeps a same-name address at another organisation apart. Every fixed rule matches some writers and fails others.
3. **Rule edits move the losses around.** The gate-3 diagnosis widened identity merging (rule 7 in `02af6c0`, `HEAD-TO-HEAD.md:1447`). In gate 4 OURS then merged a namesake in 3 of 3 runs (W11T5 C5), while BASE kept it apart in 3 of 3. Totals against the best other arm: gate 2 +2.67, gate 3 +3.67, gate 4 -5.33. `core-rules.md` is at the 4,300 character limit, so each new rule costs space for another.
4. **Wrong deterministic output is trusted more than no output.** The hint says "do not recount by hand; a number you write that you did not take from a tool output is a guess". When `figures` printed a revert count of 0 that does not answer the question (W11T3), or used a local-day window when the user asked for UTC (W10T3), the model did not check against git. BASE checked against git, because it had nothing else.
5. **The brief is often about the wrong subject.** On team tasks the prepared brief describes the "top author" (`src/figures.ts:930-935`). W10T5 got "Brief for Mateo Ruiz (top author) ... author date, local dates" on a question about nine people in UTC. It also ranks per address, not per person ("Jordan Lee: 2 commits", the old name of a returning contributor).
6. **The cost has measured parts:** 3.7 more turns per cell, +82 % output tokens, +88 % cache-read tokens, about 1.7 thousand hint tokens on every turn, 38 duplicate reads of `core-rules.md`, 15 unrequested sidecars (rule 4, `core-rules.md:8`), 11 Stop-hook blocks over e-mail addresses (`src/stopcheck.ts:37`) and 2.1 times the Write/Edit calls. In gate 3 the ratio was 1.57, inside the limit. Gate 4's longer tasks (W12) moved it to 1.78.
7. **The comparison bar is the maximum of five samples of plain Sonnet.** The mean of the five rival totals is 48.4 in gate 2, 55.0 in gate 3 and 63.4 in gate 4. Against that mean OURS is +6.6, +7.0 and -3.4. The frozen rule compares OURS with the best of the five, which by construction is above the bare model's expected score. This does not explain gate 4, where OURS is below all five arms.
8. **`SKILL.md` played no part.** No OURS cell in gate 3 or gate 4 called the Skill tool. Only `core-rules.md` (through the hint) and the CLI reached the model.

### Hypotheses (not proven by this data)

- H1: On a fresh writer, the expected effect of each prose rule is close to zero or negative. It helps only when the writer's convention for that hazard matches the rule's convention. The gains in gates 2 and 3 came from the hazards where the conventions matched (anomaly flagging, trailer credit, trusted beside raw figures).
- H2: Most of the extra cost is the hint text, plus the sidecar and Stop-hook loop, not the CLI calls. A test: the same tasks with the rules removed and the CLI kept.
- H3: The criteria are not biased against OURS as such. They are biased against hedging. Every conditional headline ("if confirmed, Ana has 5", "37 % only if ...") failed, whatever the arm. Our rules ask for hedging ("please confirm", three states, "not verifiable here"). So part of the gap is a real product choice, caution, that these writers do not reward.

## 5. Design implications, ranked by expected gain

Gains are upper bounds on the gate-4 points at stake (the OURS deficit against BASE on the criteria involved). They are not predictions, and gate-4 tasks must not be used to check them. Every change below is stated without reference to any fixture.

| Rank | Change | Kind | Points at stake in gate 4 | Evidence |
|---|---|---|---|---|
| 1 | **The CLI decides dates, and prints every convention.** `--tz` (default UTC when the prompt names UTC, otherwise ask the hint to pass the zone named), instant bounds instead of local-offset days. A row for "impossible author date" (before the repository's first commit, epoch, after the committer date, in the future) that places each such commit by committer date and lists it separately. Rows that show counts by author date and by landing (committer) date. Delete rule 8 and the date half of rule 2. | deterministic | about 5 (W10T5 4.0, W12T3 0.67, W10T3 run 1) | section 2; `src/figures.ts:93`, `:410`; receipts' landing-date choice |
| 2 | **Replace convention rules with one purpose rule.** For reverts, identity proofs and co-authorship, the CLI prints both readings as labelled rows (for example "lasting, revert pairs removed" and "written, reverts included"; "author" and "co-author" in one row per person). The rule becomes one sentence: "pick the headline that fits the purpose the user states; show the other reading beside it in one line." Delete the fixed parts of rule 3 ("its own row"), rule 6 ("stays in lines written") and rule 7 ("Signed-off-by no help"). | rules shrink | about 3 (W10T2 1.33, W11T5 C5 1.0, W10T1 0.67, part of W10T3) | items 1 to 3 of section 4 |
| 3 | **Identity is proven by code, decided once.** A `who` command that groups addresses into people by stated evidence (mailmap, a noreply address of the same login, a Signed-off-by or Co-authored-by trailer with the same name and address, the same address with a new display name, case-only differences), with every merge rule printed. It keeps same-name addresses at different organisations apart unless a trailer or mailmap joins them. The brief and `figures` then work per person, never per address. | deterministic | about 2 to 3 (W10T3 split, W10T1, W11T5, W11T1 run 2); also gate 3 W7T1 and W9T1 | items 1 and 5 of section 4 |
| 4 | **Fix the revert row:** count the person's commits that anyone reverted, not only reverts the person authored (`src/figures.ts:506`). Add a test with a revert by a second author. | bug fix | 1.0 (W11T3) | section 2, W11T3 |
| 5 | **Cut the cost.** Do not tell the model to read `core-rules.md` when the hint already contains it. Write a sidecar only when asked. Mask e-mail addresses in files at write time instead of a blocking Stop hook. Send a brief only when the prompt names one person, and when it names a group send a per-person table. | cost | target ratio under 1.6 [H] | item 6 of section 4 |
| 6 | **Hedge less in the headline.** When the evidence is in the repository (a trailer, a mailmap, a matching address), state the merged figure as the headline, give the basis once, and keep "please confirm" for real ambiguity. | rule text | about 1 to 2 (W12T2 runs, gate 3 W9T1, W9T3, W7T1) | H3 |

For the next protocol, frozen before any cell [suggestion]: report OURS against BASE and against the pooled plain-model arms beside the frozen best-of-five figure. Run rival arms that never invoke a skill as one "plain model" arm with more runs. This changes no past result.

### Which owner option the evidence supports

- **(a) Publish the measured scope: yes, now, as the interim statement.** The data supports a narrow claim. OURS leads where the job needs a deterministic scan the bare model skips (anomalous dates flagged, trailer-only credit, multi-identity lists, trusted beside raw figures: W11T1, W12T2, W11T5 C4, W9T2, W8T3 C4, W7T4). It does not lead on general "write about contributors" tasks, and it costs about 1.6 to 1.8 times as much. "First place" is not supported.
- **(b) Redesign, with the CLI deciding identity and window and the rules shrinking: supported. This is the recommendation.** Ranks 1 to 4 move the decisions that went wrong into code that prints every convention with a label, and they remove the rules that chose one convention for every user. It is the only option that addresses item 2 of section 4 (the writers disagree), and it also reduces the hint, which is the cost item. It generalises because no change refers to a task. Validate it with unit tests on synthetic histories, then with one gate on fresh writers W13 to W15, protocol frozen first, and the comparator line above reported as well.
- **(c) Rule edits plus a new gate: not supported.** Two rounds of read-set rule edits went from +3.67 to -5.33 on fresh writers. The gate-3 identity edit produced a gate-4 loss in the opposite direction (W11T5 C5). The rule file has no space left. The three rule edits listed in `HEAD-TO-HEAD.md:1482-1488` would each fix the read task they came from, and by item 2 of section 4 each would fail a writer who chose the other convention.

## Limits of this analysis

- Three runs per cell. Single-run differences (W11T2, W10T4) are within the noise.
- The graders are Sonnet votes. I did not re-grade anything. Where I say "the passing arm did X", I read that arm's file, not only the vote.
- I counted the failed run-criteria by cause by hand from the vote reasons. A different reader could put a few W10T3 and W11T1 items in another group.
- I read the gate-3 transcripts for the causes only. The gate-3 cost and tool counts are from the same scripts.
