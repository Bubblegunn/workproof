### Set public, first 5 votes (outcome criteria only)
```
per task mean (of 5), votes usable per task: {'T1': 5, 'T2': 5, 'T3': 4, 'T4': 5, 'T5': 5, 'T6': 5, 'T7': 4, 'T8': 5}
task | OURS | BASE | CV | CV_I | JD | JD_I | RCP | RCP_I
T1 | 3.67 [4, 3, 4] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0]
T2 | 3.33 [3, 4, 3] | 0.67 [1, 0, 1] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2] | 0.33 [0, 0, 1] | 3.33 [3, 4, 3] | 0.33 [1, 0, 0] | 0.00 [0, 0, 0]
T3 | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.33 [3, 3, 4] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 2.67 [3, 2, 3] | 2.67 [3, 2, 3] | 3.67 [3, 4, 4]
T4 | 3.67 [3, 4, 4] | 3.33 [3, 3, 4] | 4.00 [4, 4, 4] | 3.00 [3, 3, 3] | 3.67 [4, 3, 4] | 2.67 [4, 0, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4]
T5 | 3.00 [3, 3, 3] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 2.00 [0, 4, 2] | 0.00 [0, 0, 0] | 2.33 [3, 0, 4] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2]
T6 | 3.33 [4, 3, 3] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2]
T7 | 5.00 [5, 5, 5] | 4.00 [4, 4, 4] | 3.67 [4, 3, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 3.67 [4, 3, 4]
T8 | 5.00 [5, 5, 5] | 3.33 [5, 0, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2] | 5.00 [5, 5, 5] | 3.33 [0, 5, 5]
total (max 35): OURS 30.00, BASE 16.33, CV 18.00, CV_I 21.00, JD 13.00, JD_I 19.00, RCP 18.00, RCP_I 18.67
best other arm by total: CV_I 21.00; OURS minus best = 9.00
tasks where OURS trails the best other arm (that arm's task mean minus ours): []
bootstrap (10000 resamples, seed r13-final) 95% interval of OURS minus best other arm: [7.0000, 10.6667]
clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task): True
Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):
   ('T1', True, 3.67, 'BASE', 0.0)
   ('T2', False, 3.33, 'JD_I', 3.33)
   ('T3', False, 3.0, 'RCP_I', 3.67)
   ('T4', False, 3.67, 'CV', 4.0)
   ('T5', True, 3.0, 'JD_I', 2.33)
   ('T6', True, 3.33, 'BASE', 2.0)
   ('T7', True, 5.0, 'BASE', 4.0)
   ('T8', True, 5.0, 'CV', 5.0)
Rule A: our lost points 5.00, best other arm's lost points 14.00; ratio 0.36 (pass if <= 0.80)
Rule B': Rule B fails on at most one task and there by 0.34 or less: False [('T2', 0.0), ('T3', 0.67), ('T4', 0.33)]
better of plain and invoked, per competitor family: {'BASE': 16.333333333333332, 'CV': 21.0, 'JD': 19.0, 'RCP': 18.666666666666668}
```

### Set public, first 3 votes (outcome criteria only)
```
per task mean (of 5), votes usable per task: {'T1': 3, 'T2': 3, 'T3': 3, 'T4': 3, 'T5': 3, 'T6': 3, 'T7': 3, 'T8': 3}
task | OURS | BASE | CV | CV_I | JD | JD_I | RCP | RCP_I
T1 | 3.67 [4, 3, 4] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0]
T2 | 3.33 [3, 4, 3] | 0.67 [1, 0, 1] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2] | 0.33 [0, 0, 1] | 3.33 [3, 4, 3] | 0.33 [1, 0, 0] | 0.00 [0, 0, 0]
T3 | 3.33 [3, 4, 3] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 3.33 [3, 4, 3] | 3.33 [4, 2, 4] | 3.00 [4, 2, 3] | 4.00 [4, 4, 4]
T4 | 3.67 [3, 4, 4] | 3.33 [3, 3, 4] | 4.00 [4, 4, 4] | 3.00 [3, 3, 3] | 3.67 [4, 3, 4] | 2.67 [4, 0, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4]
T5 | 3.00 [3, 3, 3] | 0.00 [0, 0, 0] | 0.00 [0, 0, 0] | 2.00 [0, 4, 2] | 0.00 [0, 0, 0] | 2.33 [3, 0, 4] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2]
T6 | 3.33 [4, 3, 3] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2] | 2.00 [2, 2, 2]
T7 | 5.00 [5, 5, 5] | 4.00 [4, 4, 4] | 3.67 [4, 3, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 4.00 [4, 4, 4] | 3.67 [4, 3, 4]
T8 | 5.00 [5, 5, 5] | 3.33 [5, 0, 5] | 5.00 [5, 5, 5] | 5.00 [5, 5, 5] | 0.00 [0, 0, 0] | 2.00 [2, 2, 2] | 5.00 [5, 5, 5] | 3.33 [0, 5, 5]
total (max 35): OURS 30.33, BASE 17.33, CV 18.67, CV_I 22.00, JD 13.33, JD_I 19.67, RCP 18.33, RCP_I 19.00
best other arm by total: CV_I 22.00; OURS minus best = 8.33
tasks where OURS trails the best other arm (that arm's task mean minus ours): [('T3', 0.67)]
bootstrap (10000 resamples, seed r13-final) 95% interval of OURS minus best other arm: [6.3333, 10.3333]
clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task): True
Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):
   ('T1', True, 3.67, 'BASE', 0.0)
   ('T2', False, 3.33, 'JD_I', 3.33)
   ('T3', False, 3.33, 'BASE', 4.0)
   ('T4', False, 3.67, 'CV', 4.0)
   ('T5', True, 3.0, 'JD_I', 2.33)
   ('T6', True, 3.33, 'BASE', 2.0)
   ('T7', True, 5.0, 'BASE', 4.0)
   ('T8', True, 5.0, 'CV', 5.0)
Rule A: our lost points 4.67, best other arm's lost points 13.00; ratio 0.36 (pass if <= 0.80)
Rule B': Rule B fails on at most one task and there by 0.34 or less: False [('T2', 0.0), ('T3', 0.67), ('T4', 0.33)]
better of plain and invoked, per competitor family: {'BASE': 17.333333333333332, 'CV': 22.0, 'JD': 19.666666666666668, 'RCP': 19.0}
```

### Set heldout-d, first 5 votes (outcome criteria only)
```
per task mean (of 5), votes usable per task: {'D1': 5, 'D2': 5, 'D3': 5, 'D4': 5, 'D5': 4}
task | OURS | BASE | CV | CV_I | JD | JD_I | RCP | RCP_I
D1 | 5.00 [5, 5, 5] | 3.00 [3, 2, 4] | 3.00 [2, 5, 2] | 3.00 [3, 3, 3] | 3.33 [4, 2, 4] | 1.67 [2, 0, 3] | 3.33 [4, 4, 2] | 3.00 [3, 3, 3]
D2 | 4.67 [4, 5, 5] | 4.67 [4, 5, 5] | 4.33 [5, 4, 4] | 4.00 [4, 4, 4] | 4.00 [3, 4, 5] | 4.33 [5, 5, 3] | 4.67 [4, 5, 5] | 4.67 [5, 5, 4]
D3 | 4.67 [5, 5, 4] | 4.67 [5, 4, 5] | 4.67 [5, 4, 5] | 4.67 [5, 5, 4] | 4.67 [4, 5, 5] | 4.00 [5, 3, 4] | 4.67 [5, 5, 4] | 5.00 [5, 5, 5]
D4 | 3.33 [3, 3, 4] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3]
D5 | 3.00 [2, 4, 3] | 2.67 [4, 1, 3] | 2.00 [3, 1, 2] | 3.00 [3, 3, 3] | 2.33 [3, 2, 2] | 2.33 [3, 3, 1] | 2.67 [2, 3, 3] | 3.00 [3, 4, 2]
total (max 25): OURS 20.67, BASE 18.00, CV 17.00, CV_I 17.67, JD 17.33, JD_I 15.33, RCP 18.33, RCP_I 18.67
best other arm by total: RCP_I 18.67; OURS minus best = 2.00
tasks where OURS trails the best other arm (that arm's task mean minus ours): [('D3', 0.33)]
bootstrap (10000 resamples, seed r13-final) 95% interval of OURS minus best other arm: [0.0000, 3.3333]
clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task): False
Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):
   ('D1', True, 5.0, 'JD', 3.33)
   ('D2', False, 4.67, 'BASE', 4.67)
   ('D3', False, 4.67, 'RCP_I', 5.0)
   ('D4', True, 3.33, 'BASE', 3.0)
   ('D5', False, 3.0, 'CV_I', 3.0)
Rule A: our lost points 4.33, best other arm's lost points 6.33; ratio 0.68 (pass if <= 0.80)
Rule B': Rule B fails on at most one task and there by 0.34 or less: False [('D2', 0.0), ('D3', 0.33), ('D5', 0.0)]
better of plain and invoked, per competitor family: {'BASE': 18.0, 'CV': 17.666666666666668, 'JD': 17.333333333333336, 'RCP': 18.666666666666668}
```

### Set heldout-d, first 3 votes (outcome criteria only)
```
per task mean (of 5), votes usable per task: {'D1': 3, 'D2': 3, 'D3': 3, 'D4': 3, 'D5': 3}
task | OURS | BASE | CV | CV_I | JD | JD_I | RCP | RCP_I
D1 | 5.00 [5, 5, 5] | 3.00 [3, 2, 4] | 3.00 [2, 5, 2] | 3.33 [3, 4, 3] | 3.67 [5, 2, 4] | 1.67 [2, 0, 3] | 3.67 [4, 5, 2] | 3.33 [3, 4, 3]
D2 | 4.67 [4, 5, 5] | 4.67 [4, 5, 5] | 4.00 [5, 3, 4] | 4.00 [4, 4, 4] | 4.00 [3, 4, 5] | 4.33 [5, 5, 3] | 4.67 [4, 5, 5] | 4.33 [5, 5, 3]
D3 | 4.67 [5, 5, 4] | 4.67 [5, 4, 5] | 4.67 [5, 4, 5] | 4.67 [5, 5, 4] | 4.67 [4, 5, 5] | 4.33 [5, 4, 4] | 4.67 [5, 5, 4] | 5.00 [5, 5, 5]
D4 | 3.33 [3, 3, 4] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3] | 3.00 [3, 3, 3]
D5 | 3.33 [3, 4, 3] | 2.67 [4, 1, 3] | 2.00 [3, 1, 2] | 3.00 [3, 3, 3] | 2.33 [3, 2, 2] | 2.33 [3, 3, 1] | 2.67 [2, 3, 3] | 3.00 [3, 4, 2]
total (max 25): OURS 21.00, BASE 18.00, CV 16.67, CV_I 18.00, JD 17.67, JD_I 15.67, RCP 18.67, RCP_I 18.67
best other arm by total: RCP 18.67; OURS minus best = 2.33
tasks where OURS trails the best other arm (that arm's task mean minus ours): []
bootstrap (10000 resamples, seed r13-final) 95% interval of OURS minus best other arm: [0.3333, 3.3333]
clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task): True
Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):
   ('D1', True, 5.0, 'JD', 3.67)
   ('D2', False, 4.67, 'BASE', 4.67)
   ('D3', False, 4.67, 'RCP_I', 5.0)
   ('D4', True, 3.33, 'BASE', 3.0)
   ('D5', True, 3.33, 'CV_I', 3.0)
Rule A: our lost points 4.00, best other arm's lost points 6.33; ratio 0.63 (pass if <= 0.80)
Rule B': Rule B fails on at most one task and there by 0.34 or less: False [('D2', 0.0), ('D3', 0.33)]
better of plain and invoked, per competitor family: {'BASE': 18.0, 'CV': 18.0, 'JD': 17.666666666666668, 'RCP': 18.666666666666668}
```

