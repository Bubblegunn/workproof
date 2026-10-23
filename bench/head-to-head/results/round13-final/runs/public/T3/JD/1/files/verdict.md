# Verdict: do not trust the headline numbers as stated

The files (`workproof-report.json` / `.md`) are real-looking output of a tool called "workproof" 0.7.0. They describe this repo at HEAD `249bbdc`, which matches my clone. The repo-level facts are right, but the applicant's own share is inflated when I recompute it with plain git. Merging several addresses is legitimate and explains only part of the gap.

## What I checked (plain `git` on my clone; I did not run the applicant's tool or `npx workproof verify`)

| Claim in report | What I found | Match? |
|---|---|---|
| HEAD 249bbdc72da2 | Same as my clone | Yes |
| 131 non-merge commits in tenure window (2013-11-07 to 2015-08-22) | 131 | Yes |
| 1,417 lines attributed in the project, 19 files | 1,416 lines; 19 files | Yes (approximately) |
| Author made **103** of those 131 commits (79%) | Authored by every Jonathan Ong / jongleberry address (4 addresses): **63** (48%) | **No** |
| 1,197 of 1,417 surviving lines are theirs (**84%**) | `git blame -w -M` gives about 585 (<email:d29caa5c>) + 111 (<email:4132b6bd>) + a few under the noreply address, so roughly **700 lines, about 50%** | **No** |
| 42 people wrote code | 59-60 distinct author names/emails in history | Doesn't match |
| Rank 1 by surviving lines | The applicant's own address is first, though TJ Holowaychuk is close at 551 lines | Plausible |
| Identity merge is legitimate | The four addresses (`<email:d29caa5c>`, `<email:4132b6bd>`, the `<email:266aea16>` noreply address, and the `jongleberry` name) do look like one person, who is also the repo owner | Yes, merging is reasonable |

Counting commits by committer instead of author gives 82. That is still not 103.

Even after merging all of the applicant's addresses, I can't reproduce 103 commits or 84% survival. Authorship by those addresses gives 63 commits and about 50% of lines.

## Other observations
- The 103 figure may come from the tool counting something other than author (for example, merged-in identities beyond these four), or from edited numbers. I can't tell which from the files alone.
- The report's "cannot be edited without the check failing" claim only helps if `verify` is run. It carries a `hash` field and a "keyed" fingerprint (`fingerprintKeyed: true`) that I cannot recompute without the tool and its key. A self-generated hash isn't independent proof.
- The report hides the actual email addresses and directory paths (`emails: false`, `paths: false`), so you can't see which addresses were merged without asking.
- Authorship in git is self-declared. Anyone can set any name or email on a commit, so even matching numbers would only show what the commits say, not who wrote them. Commits authored by others but committed by the applicant (82 vs 63) would be one source of inflation.

## Recommendation
Treat the report as unreliable on the key figures (103 commits and 84% surviving lines). Real numbers from the same repo are roughly 63 commits and about 50% of lines. That is still a substantial contribution, since the applicant is the top or second-highest code owner of this repo. Ask the applicant for the list of email addresses they merged and for the exact command used. Don't run their tool or `npx` on your own machine unless you've reviewed the package.
