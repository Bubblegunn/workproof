# Round 14 summary: confirmation on held-out set e

Scope. workproof product commit `f74cb3c12c75dc6d35778362377157a536e37b85` (unchanged since round 13), Sonnet, Claude Code 2.1.308 on the owner's subscription login, 2026-10-23. Held-out set e: 5 tasks (25 outcome criteria) written by a fresh Sonnet agent and sealed on a local branch before any run (commit `f919b7f9f1841557a66fbdb518bf54d3128732a4`). Eight arms (OURS, BASE, RCP, RCP_I, JD, JD_I, CV, CV_I), three runs per cell, 120 runs, all fresh. Five blind reason-first votes per packet; criteria passed on a majority of valid votes.

## Result against claim I1

| Set | OURS | best other arm | difference | 95 percent interval | I1 |
|---|---|---|---|---|---|
| held-out e (max 25) | 17.00 | CV_I 18.67 | -1.67 | [-4.00, 0.33] | does not hold |

Ours is tied second (17.00 with RCP, ahead of RCP_I 16.00, BASE 15.33, JD 15.00, CV 14.67, JD_I 13.33). Per-task better of plain and invoked, per family: CV 18.67, RCP 17.33, JD 16.67, BASE 15.33; OURS minus the best family -1.67. Rule A fails (our lost points 8.00 against 6.33, ratio 1.26). Rule B fails on E2 (4.67 against CV_I 5.00), E3 (0.00 against BASE 1.00) and E5 (2.67 against CV_I 4.33); it passes on E1 (4.67 against JD 4.33) and E4 (all eight arms 5.00). Rule B' fails.

Launch claim for workproof (public set I1 from round 13 plus set e I1 plus F6-grader): not met. The public-set result of round 13 stands as published (five-vote [7.00, 10.67]; three-vote [6.33, 10.33]); held-out set d (round 13) gave [0.00, 3.33] with five votes and [0.33, 3.33] with three; set e gives [-4.00, 0.33]. Taken together the held-out evidence does not support "first in total" on unseen task sets.

## Where the points went (numbers only, from `results.md` and the votes)

E3: every arm scores 1.00 or less of 5 (OURS 0.00); criteria C4 and C5 are passed by no arm. E5: CV_I 4.33 (runs 5, 5, 3) against OURS 2.67 (2, 2, 4); the other six arms average 1.7 (0.67 to 2.67). E1: OURS is the best arm. E4: every arm full marks. A best-of-seven comparison with three runs per cell is noisy upward for the best arm; the interval reports that.

## F6-grader (pass or fail)

Twelve of 120 cells (seed `r14-f6`) were re-graded together with all arms of their task by fresh Opus sessions (three valid votes per task; E1 and E4 needed extra votes because earlier ones were unreadable). Largest score difference 1 point; criterion agreement 57/60 = 95.0 percent. F6-grader passes. Details in `results.md` and `grades/heldout-e/f6/`.

## Not done

F6-runs and F9 (Haiku and Opus) were not run: the launch condition (I1 on set e) failed first, so they could not change the outcome, and the session limit had already interrupted the round once.

## What went wrong or differs from the plan

- The first launch of the 120 runs hit the Claude Code session limit: 110 of 120 cells returned "You've hit your session limit" and 10 were clean. The 110 failed cells were set aside (`failed-attempts-session-limit.txt` lists them), never graded, and re-run after the limit reset; no cell was run twice and kept selectively. The 10 clean cells from the first launch were kept.
- Unreadable grader votes (unescaped quotes break the JSON): E2 had 4, E3 3, E5 3 valid votes of five after the one re-ask. E5 had only 2 valid, so three extra votes (v6 to v8, new shuffles) were drawn for E5 only until three were valid (v1, v3, v8). The scorer ignores invalid votes and refuses a packet with fewer than three valid ones.
- `score-r14.py` was changed twice after the first run of grading to read votes strictly (it crashed on a vote with a null entry). The change affects only which votes are valid, not the criteria or the arms.
- The controller read the writer's closing message listing the repositories, pinned commits and one-line hazard lists; it read no prompt, truth file or criterion before the measurement. The product was frozen, so this could not influence the result.
- The competitors' arms are the same as in round 13 (receipts patched only for `RECEIPTS_HOME`).

## Reproduce

`./recompute.sh > results.md` (no network, no model call) must reproduce `results.md`. Protocol: `docs/HEAD-TO-HEAD.md`, section "Round 14 protocol" (commit e2ae7d6, before any run).
