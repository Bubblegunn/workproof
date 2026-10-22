I saved the paragraph to `self-review.md`. It's 100 words.

> In fx I made 63 of the 131 non-merge commits in my tenure window, 7 November 2013 to 22 August 2015 (48%), and 697 of the 1,417 lines still in the code today (49%). The first number counts activity; the second counts what survived, and I read them separately. Two of my addresses were merged by a GitHub-login rule. The figures come from workproof report 6c06f56f; recompute them with `npx workproof verify workproof-report.json --repo .` in the repository. They show survival and activity, not quality, review, design or mentoring, and git history can be rewritten before a report is made.

- **Checks:** I ran `npx workproof`, then `check` and `verify`. `check` passed, and `verify` printed "all figures reproduce" with the fingerprint matching.
- **Merged address:** The tool counted your configured address and one `<email:266aea16>` address as you, because the GitHub login matches. That is a rule, not proof. If that address isn't yours, rerun with `--no-merge-identities` and the numbers will change.
- **Merge commits:** Your 13 merge commits are not counted in the 63.
- **Window:** Commits are counted only inside your tenure window, not across the whole repository history.
- **Surviving lines:** Your 697 lines are 49% of the 1,417 lines now in the project. The report ranks you first of 42 code authors by surviving lines, but I left that out because the rules say not to call you the top contributor.
- **Public look:** The repository has no remote, so nothing says it is public.
- **For your manager:** Your manager needs `workproof-report.json` and `workproof-report.md`, which are in this directory, to run the check. They are untracked, so commit or send them with the review.