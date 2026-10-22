# Verdict on received/workproof-report.{md,json}

**Short answer: do not trust the headline numbers as written. Some figures match the repo exactly. The two figures that carry the claim, commit count and surviving lines, are inflated well beyond what merging email addresses explains.**

Both files are one report from a tool called "workproof 0.7.0", with the same figures in markdown and JSON. They contain no instructions, only data. The report is for a repo it calls "F1", and its HEAD `249bbdc72da2` is this clone's HEAD. I recomputed everything with plain `git` in this clone. I did not run `npx workproof verify`, because that would run downloaded code from an unknown party.

## What I checked

The identity is Jonathan Ong / jongleberry. Git has these author addresses for them:
- `<email:d29caa5c>`: 56 non-merge commits
- `<email:4132b6bd>`: 4 + 1
- `<email:266aea16>`: 2

The report says it merged 3 other addresses, which is consistent with that list.

| Figure | Report claims | I get from git | Result |
|---|---|---|---|
| Commits by the identity, all addresses merged (non-merge) | **103** | **63** (76 if merge commits are counted) | **Does not match** |
| Commits by the single main address | n/a | 56 | n/a |
| Commits in the tenure window, any author | 131 | 131 (2013-11-07 to 2015-08-22) | Matches |
| Share of commits | 78.6% | 63/131 = 48% | Does not match |
| Tenure end date | 2015-08-22 | The last non-merge authored commit is 2015-07-09. 2015-08-22 is a merge commit (`4117a48`). | Only matches if merge commits are counted, but the commit count excludes merges. |
| Surviving lines at HEAD (git blame, `-w -M`) | **1,197 of 1,417 (84%)** | **~697 of 1,417 (~49%)** | **Does not match** |
| Total lines at HEAD | 1,417 | 1,417 | Matches |
| Files touched | 34 | 34 | Matches |
| Test-file changes | 31 | 31 | Matches |
| Lines added (JS/MD/JSON/YAML) | 1,274 | 1,276 | Matches |
| Authors in the window | 42 | 42 | Matches |
| Files at HEAD | 19 | 19 | Matches |
| Rank by surviving lines | 1 | 1 (Jonathan Ong 696, TJ Holowaychuk 551) | Matches, but the lead is much smaller than claimed. |

## Interpretation

- **Merging email addresses does not explain the gap.** The merge is real and legitimate. It moves the count from 56 to 63, not to 103. I tried author, committer, author-or-committer (82), and with and without merges. None gives 103.
- **Surviving lines are inflated by about 500.** 1,197 does not correspond to any name grouping I could construct. The two other large authors total 696 and 551. Jonathan Ong is still the top surviving author, but with about 49% of lines, not 84%.
- **The "second number is the one that lasts" narrative rests on those two inflated figures.** The accurate version is about 48% of commits and about 49% of surviving lines. That is a real, substantial contribution, but a different story from the one the report tells.
- **Footprint, test and size figures check out.** That means the file was probably produced by running a tool on this repo. The two headline figures were then either altered or computed on something other than this clone's history.
- **The report's own integrity hash does not help here.** The hash only shows the file wasn't edited after generation. I did not recompute it, and it says nothing about how the figures were produced.
- **Possible name coincidence.** The subject, Jonathan Ong, has the same name as the git user configured in this clone. I can't tell from the files who the applicant is, so check that the applicant really is this identity and not someone claiming another person's history.

## Suggested next step

Ask the applicant for the exact command and flags they ran, and the email addresses they say are theirs. Then compare against the numbers above: about 63 authored commits and about 697 surviving lines. A genuine explanation would have to produce those figures, not 103 and 1,197.
