## Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| H1 (5) | 1.67 (0-5, n=3) | 4.33 (4-5, n=3) | 4.00 (3-5, n=3) | 4.33 (3-5, n=3) | 3.67 (3-4, n=3) | 4.33 (4-5, n=3) | 4.33 (3-5, n=3) | 4.67 (4-5, n=3) |
| H2 (5) | 4.00 (4-4, n=3) | 2.33 (1-3, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) |
| H3 (5) | 2.00 (2-2, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 4.00 (3-5, n=3) | 3.67 (3-4, n=3) |
| Total (15) | 7.67 | 11.33 | 10.00 | 11.00 | 10.33 | 12.67 | 12.00 | 12.00 |

## All criteria (process criteria included)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| H1 (5) | 1.67 (0-5, n=3) | 4.33 (4-5, n=3) | 4.00 (3-5, n=3) | 4.33 (3-5, n=3) | 3.67 (3-4, n=3) | 4.33 (4-5, n=3) | 4.33 (3-5, n=3) | 4.67 (4-5, n=3) |
| H2 (5) | 4.00 (4-4, n=3) | 2.33 (1-3, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) |
| H3 (5) | 2.00 (2-2, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 4.00 (3-5, n=3) | 3.67 (3-4, n=3) |
| Total (15) | 7.67 | 11.33 | 10.00 | 11.00 | 10.33 | 12.67 | 12.00 | 12.00 |

## Skill calls in OURS runs

- H1: [1, 1, 1]
- H2: [2, 2, 2]
- H3: [1, 1, 2]

## Process measures beside the table (not part of the gate)

- H1: Skill call in 3 of 3 runs of ours
- H2: Skill call in 3 of 3 runs of ours
- H3: Skill call in 3 of 3 runs of ours

## Gate (outcome criteria only, better of plain and invoked arm per competitor)

- H1: ours 1.67, best competitor 4.67 (GAP), max 5: FAIL (strictly above every competitor)
- H2: ours 4.00, best competitor 3.67 (GAP), max 5: PASS (strictly above every competitor)
- H3: ours 2.00, best competitor 5.00 (JD), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 7.67, best competitor total 12.67 (JD), needs 15.20: FAIL
rule B: FAIL
gate: FAIL
gate under the old condition (Skill call and CLI command required in every run of ours): FAIL
