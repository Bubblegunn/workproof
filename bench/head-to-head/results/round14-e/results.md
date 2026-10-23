### Set heldout-e, five-vote scores (outcome criteria only)
```
per task mean (of 5), valid votes per task: {'E1': 5, 'E2': 4, 'E3': 3, 'E4': 5, 'E5': 3} invalid votes ignored: {'E3': 2, 'E5': 4}
task | OURS | BASE | CV | CV_I | JD | JD_I | RCP | RCP_I
E1 | 4.67 [4, 5, 5] | 3.33 [3, 3, 4] | 2.33 [2, 2, 3] | 3.33 [3, 4, 3] | 4.33 [4, 4, 5] | 1.33 [0, 4, 0] | 4.00 [4, 3, 5] | 4.33 [4, 4, 5]
E2 | 4.67 [5, 5, 4] | 4.67 [4, 5, 5] | 4.33 [4, 5, 4] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 4.67 [5, 5, 4] | 5.00 [5, 5, 5] | 4.67 [5, 4, 5]
E3 | 0.00 [0, 0, 0] | 1.00 [0, 2, 1] | 0.33 [1, 0, 0] | 1.00 [0, 3, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 1.00 [3, 0, 0] | 0.67 [2, 0, 0]
E4 | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5]
E5 | 2.67 [2, 2, 4] | 1.33 [3, 1, 0] | 2.67 [3, 5, 0] | 4.33 [5, 5, 3] | 0.67 [1, 1, 0] | 2.33 [2, 3, 2] | 2.00 [2, 2, 2] | 1.33 [0, 4, 0]
total (max 25): OURS 17.00, BASE 15.33, CV 14.67, CV_I 18.67, JD 15.00, JD_I 13.33, RCP 17.00, RCP_I 16.00
best other arm by total: CV_I 18.67; OURS minus best = -1.67
tasks where OURS trails the best other arm (that arm's task mean minus ours): [('E2', 0.33), ('E3', 1.0), ('E5', 1.67)]
bootstrap (10000 resamples, seed r14-final) 95% interval of OURS minus best other arm: [-4.0000, 0.3333]
clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task): False
Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):
   ('E1', True, 4.67, 'JD', 4.33)
   ('E2', False, 4.67, 'CV_I', 5.0)
   ('E3', False, 0.0, 'BASE', 1.0)
   ('E4', True, 5.0, 'BASE', 5.0)
   ('E5', False, 2.67, 'CV_I', 4.33)
Rule A: our lost points 8.00, best other arm's lost points 6.33; ratio 1.26 (pass if <= 0.80)
Rule B': Rule B fails on at most one task and there by 0.34 or less: False [('E2', 0.33), ('E3', 1.0), ('E5', 1.67)]
better of plain and invoked, per competitor family: {'BASE': 15.333333333333334, 'CV': 18.666666666666668, 'JD': 15.0, 'RCP': 17.0}
per-task better of plain and invoked, family totals: {'BASE': 15.33, 'CV': 18.67, 'JD': 16.67, 'RCP': 17.33} ; OURS minus best family = -1.67 (CV)
```

### F6-grader (fresh Opus votes against the original majority, sampled cells)
```
task arm run | original score | fresh Opus score | criteria with the same verdict
E1 RCP 1 | 4 | 3 | 4/5
E2 CV 2 | 5 | 5 | 5/5
E2 JD_I 2 | 5 | 5 | 5/5
E2 RCP 2 | 5 | 5 | 5/5
E3 CV 1 | 1 | 2 | 4/5
E3 CV 3 | 0 | 0 | 5/5
E3 CV_I 1 | 0 | 0 | 5/5
E3 CV_I 3 | 0 | 0 | 5/5
E3 RCP_I 1 | 2 | 2 | 5/5
E3 RCP_I 3 | 0 | 0 | 5/5
E4 OURS 1 | 5 | 4 | 4/5
E5 BASE 3 | 0 | 0 | 5/5
largest score difference: 1; criterion agreement: 57/60 = 95.0%
F6-grader pass (no cell differs by more than 1 point and agreement >= 90%): True
```
