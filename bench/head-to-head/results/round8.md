## Results, round 8

Date: 2026-10-22, local session, API-key billing (`apiKeySource` checked: `ANTHROPIC_API_KEY`). Code under test: commit `e9eac0e`, run from an immutable `git archive` copy (`/private/tmp/h2h-wp-r8-code`, built, `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `verdict` code holds the foreign-format path). Rulings frozen in `64a2ee4`, measurement protocol frozen in `3a8f7d0`, both before the code change and before any run. Sonnet (`claude-sonnet-5-5`), parallelism 2, temporary HOME per run, guard clean (no STOP file). One run (T3 ours 3) ended in an error result and was repeated before grading. Fixtures: the round 7 fixtures (`/private/tmp/h2h-wp-r7`). Per the protocol, only OURS ran (24 runs, 3 per task); competitor and baseline cells are reused ("r7 reused", T6 "final gate reused"). Ours was graded as one blind packet per task, ours only (not pooled with competitor outputs as in rounds 2 to 7: a recorded caveat). The held-out set, F9 and F6 were not run (ruling 6: the public set failed; and the run budget).

### Outcome criteria only

| Task (max) | OURS (r8) | best other arm (reused) | Result |
|---|---|---|---|
| T1 (4) | 4.00 | 1.67 RCP_I (r7 reused) | PASS |
| T2 (4) | 4.00 | 3.00 JD_I (r7 reused) | PASS |
| T3 (4) | 4.00 | 4.00 RCP_I (r7 reused) | PASS (ceiling) |
| T4 (4) | 4.00 | 4.00 RCP, RCP_I, JD_I, GAP_I (r7 reused) | PASS (ceiling) |
| T5 (5) | 5.00 | 3.00 JD_I (r7 reused) | PASS |
| T6 (4) | 4.00 | 2.33 RCP_I (final gate reused) | PASS |
| T7 (5) | 4.67 (4-5) | 4.00 BASE, JD, JD_I (r7 reused) | PASS |
| T8 (5) | 4.67 (4-5) | 5.00 BASE, RCP, RCP_I, GAP (r7 reused) | **FAIL** (ceiling: a competitor is at the maximum and ours is not) |
| Total (35) | 34.33 | 23.33 RCP_I | |

Rule A: lost 0.67, the best other arm lost 11.67, limit 9.33: PASS. Rule B: FAIL (T8). **Public gate: FAIL.**

Skill calls in ours: every run called the skill at least once (T1 1,1,1; T2 2,1,1; T3 2,1,1; T4 1,1,1; T5 2,2,2; T6 1,1,1; T7 1,1,1; T8 1,1,1). `workproof bullets` ran in 3 of 3 runs of T7 and T8.

### Why T8 (and T7) lose one point

In T7 run 3 and T8 run 3 the resume file is correct, but the final chat answer never tells the user about the skill gaps (C3: "the final answer text only says a background search finished" / "never tells the user about the Rust/gRPC gap"). The Gaps section is in the file. The three round 8 product changes (public look, foreign report, chat privacy) did not touch this path; the loss is run variance in the final answer, 1 run of 3 on each task. T1 (the public-looking repository) rose from 3.67 to 4.00 and T6 stays at 4.00 of 4.

### What a round 9 would change (not run, needs the owner's go)

1. Tailoring: the final chat answer states the Gaps list in one sentence (a skill rule and a test), frozen as a ruling before the change.
2. Then ours x3 on T7 and T8 (protocol: the other tasks' cells stay as they are only if the product change does not touch them; otherwise all eight).
3. Only if the public set passes: new held-out set (written, unread, in `~/claude-kredi-runs/2026-10-22/heldout-r8/`, not committed), F9, F6. It needs about 20 USD for 72 held-out runs; the cost so far is in `workproof-cost.tsv`.

Cost (sum of `total_cost_usd`): public 24 runs 3.87 USD, T3 repeat 0.07 USD; grading about 1.4 USD (estimate, `grade.sh` does not record cost).
