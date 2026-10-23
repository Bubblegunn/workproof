I've written `PROMOTION_EVIDENCE.md` and I'm giving you a summary of it now.

**What it covers (1 Jan – 30 Jun 2026, by author date):**
- You authored 12 non-merge commits and one merge. About **342 hand-written lines were added** and 119 removed.
- The work was JSON export, a None-cell fix, export options, a CLI export flag, JSON export tests and pagination docs.
- I left out the 30,002-line sample dataset and the 1,800-line pip-compile lockfile, because they're data or generated files. I also left out the pagination cache, which you added on 5 Mar and reverted on 6 Mar (net zero).
- I didn't claim Lena's sorting implementation, Tomasz's CSV dialect work, or the upstream history.

**Things to check before you submit:**
1. **Sorting tests (`16de668`):** this commit deletes 119 lines of real tests. It replaces them with 55 trivial `assert stable_sort_N([])` lines. It's a net −64, so it doesn't count as added coverage, and a reviewer could count it against you.
2. **Code that looks templated:** most new files are runs of near-identical one-line functions. Line counts overstate substance.
3. **Two git identities:** `priya <priya@priya-laptop.invalid>` made the None-cell fix. It's probably you, but git doesn't prove it.
4. **Dates:**
   - The CLI flag was authored on 28 Jun but committed on 3 Jul.
   - The December unit helpers were committed on 8–9 Jan, so they fall in or out of the window depending on which date the committee uses. They're excluded by author date.
5. **No impact data:** the repo has nothing on usage, reviews or mentoring. The only trace is Tomasz's "thanks Priya for the review" commit message.

The file also has a suggested wording paragraph for the committee, with a prompt to add outcomes from outside git.