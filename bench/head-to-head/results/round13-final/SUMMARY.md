# Round 13 final measurement: summary

Scope. workproof product commit `f74cb3c12c75dc6d35778362377157a536e37b85`, Sonnet, Claude Code 2.1.308 on the owner's subscription login (isolated HOME), 2026-10-23. Two sets: the public set (8 tasks) and held-out set d (5 tasks, taken from branch `heldout-2026-10-d`, first used in this measurement; the controller read no task content). Eight arms: OURS, BASE, receipts (RCP, RCP_I), jd-resume-tailor (JD, JD_I), cv-builder (CV, CV_I). Three runs per cell, 312 new runs, no reused cell. Five blind grader votes per packet; a criterion passes on a majority of valid votes; only outcome-labelled criteria count.

## Result against the launch claim I1 (OURS minus the best other arm, 95 percent bootstrap interval, 10,000 resamples, seed `r13-final`)

| Set | OURS | best other arm | difference | interval | I1 |
|---|---|---|---|---|---|
| public (max 35) | 30.00 | CV_I 21.00 | 9.00 | [7.00, 10.67] | holds |
| held-out d (max 25) | 20.67 | RCP_I 18.67 | 2.00 | [0.00, 3.33] | does not hold: the lower bound is zero, not above zero |

With the first three votes only (the grading that was done first, before the protocol was amended to five votes): public 30.33 vs 22.00, [6.33, 10.33]; set d 21.00 vs 18.67, [0.33, 3.33]. The protocol amendment (`docs/HEAD-TO-HEAD.md`, Amendment 2) was written after the three-vote set-d scores had been seen and says the five-vote scores are the ones that count, whichever is higher. They count; on set d they give a lower bound of exactly zero. The claim "first in total in each set" is therefore not supported by this measurement: it holds on the public set and not on held-out set d.

## Per-task rules (printed in full in `results.md`, not deciding the claim)

Rule A (our lost points at most 80 percent of the best other arm's): public 5.00 vs 14.00 lost (0.36, passes); set d 4.33 vs 6.33 (0.68, passes). Rule B with the ceiling rule: fails on public T2 (tie 3.33 with JD_I), T3 (3.00 against RCP_I 3.67), T4 (3.67 against CV 4.00), and on d D2 (tie 4.67 with BASE and RCP) and D3 (4.67 against RCP_I 5.00). Rule B' fails on both sets (public T3 by 0.67; d D3 by 0.33 and D2 by 0.00). Per-task means for every arm and every run are in `results.md`.

## What went wrong or differs from the plan

- Grading votes were extended from three to five after the set-d three-vote scores were seen (above). The grader prompt text was not changed, so "reason before verdict" was not done; scripts do not judge any criterion.
- Votes unusable (unparseable): public T3 and T7 had four usable votes, d D5 had four; every other packet had five. Counted as the protocol says (at least three valid).
- The stock `failed-cells.py` and `grade.sh` only recognise task ids `T..`/`H..`; set d uses `D1..D5`. Copies with a wider pattern (`dev/failed-cells-any.py`, `dev/grade-any.sh`) were used; `failed-cells-any.py` printed nothing for both sets. The runner's own end-of-run check on set d used the stock script and is therefore not evidence; the manual check is.
- Not done in this session: F6-grader, F6-runs and F9 (Haiku and Opus, descriptive). They were scheduled to follow a pass on both sets, which did not happen.
- The competitors chosen were three (receipts, jd-resume-tailor, cv-builder); GAP and SR were not run (weakest in earlier rounds).
- The receipts arm is the current clone (465f093), not the round 10 pin; it is patched only for `RECEIPTS_HOME`.
- Cost: 28.17 USD list price for the 312 runs (`cost-summary.md`); the grading calls are in the wrapper ledger only. The subscription is charged, not an API key.

## Development gate that preceded it

`bench/head-to-head/results/round13-devgate/`: 72 runs, OURS 28.33 against 23.33, interval [3.33, 6.00]. The tasks were written by the controller that also wrote the product changes; it gated the decision to measure and is not evidence for the claim.

## Score tables

The tables in `results.md` are produced by `recompute.sh` (calls `score.py`, no network, no model). `recompute.sh > results.md` must reproduce that file byte for byte.
