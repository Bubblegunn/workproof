I've written `PROMOTION_EVIDENCE.md` in the repo folder. Nothing is left to do except your review.

The history shows about 157 net lines of source, 90 lines of new tests and 40 lines of docs, counting by author date between 1 January and 30 June 2026. That covers JSON export, export options, a CLI flag, one small fix and a pagination doc page. I didn't run the code or the tests.

Before you submit, these points matter:

- **Test regression:** the 2 June commit "test: cover stable sorting" is a net loss of 64 lines. It replaced a real sorting test suite with 55 one-line stubs that call functions I couldn't find defined anywhere. The file warns against citing it as test work.
- **Reverted work:** the pagination cache (+120 lines) was reverted the next day, so it counts as zero.
- **Left out of the totals:**
  - The 30,002-line dataset and the 1,800-line generated lockfile.
  - Other people's commits: stable sorting by Lena Fischer, and the CSV dialect option and a side experiment by Tomasz Varga.
- **Weak line counts:** the new files are highly templated, with many near-identical one-line functions. I wouldn't lead with line counts.
- **Two author names:** some commits are under `priya@priya-laptop.invalid`, so please confirm that's you. I counted the 20 January fix as yours but left out two December units-helper commits that were committed in January.
- **Date edge case:** the CLI flag was authored on 28 June but committed on 3 July. I counted it, but a strict reader using commit dates might not.
- **What the history can't show:** the repo has no reviews, design work or impact. The only review evidence is a thank-you in Tomasz's commit message. A senior-level case would need that from other sources.