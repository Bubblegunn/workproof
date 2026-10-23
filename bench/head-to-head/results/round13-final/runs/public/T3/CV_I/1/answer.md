You can't trust the headline numbers in the received report. I wrote the verdict to `verdict.md`.

I recomputed the figures with `git log` and `git blame` on your clone. I didn't run the applicant's `npx workproof verify`, since that would execute a package fetched from the network on the strength of their file.

| Figure | Report | Recomputed |
|---|---|---|
| Applicant's commits in the window | 103 of 131 (79%) | 63 of 131 (48%) |
| Surviving lines at HEAD | 1,197 of 1,417 (84.5%) | 696 of 1,417 (49%) |

- **Same result with every address merged:** I counted `<email:d29caa5c>`, `<email:4132b6bd>` and the `jonathanong` GitHub noreply address. Merging addresses can't explain the gap.
- **The report contradicts itself:** its own per-year breakdown (104 + 550 + 43) adds up to 697, which matches my 696, not its 1,197.
- **What does match:** HEAD, the 131 total commits, 1,417 total lines, 19 files, the 23 release tags and the tenure dates.
- **What I couldn't pin down:** the test-file change counts and the "files authored" score didn't reproduce, and my counting method may differ from theirs. I also couldn't reproduce the integrity hash. It wouldn't prove much anyway, since anyone can edit the numbers and recompute it.
- **Real contribution:** they are the second-largest contributor overall and the largest in that window. About half the live code is theirs, and they added 8 of the 19 current files. The report overstates that, and the verdict suggests asking them to explain the 103 and 1,197.

I didn't use the cv-builder skills, since they draft and edit resumes and this was a verification task.