I've written `PROMOTION_EVIDENCE.md` in this folder. The history supports about 290 lines of hand-written work for 1 Jan to 30 Jun 2026, and a few details could hurt you if the committee looks closely.

I read the commits and diffs only. I didn't run the code or tests, and git can't show reviews, design work or influence.

**What the history shows**
- **Delivered:** the JSON export feature end to end. That is the implementation, a None-cell bug fix, export options (merged as PR #41), tests, pagination docs, and a CLI flag.
- **Review credit:** Tomasz Varga's 4 May commit thanks you for the review. That is a single acknowledgement, and the review itself isn't in git.
- **Size:** the raw total is about 32,000 added lines, but 30,002 are a vendored dataset and 1,800 are a generated lockfile. I left both out and told the committee not to quote that figure.
- **Left out:**
  - A 120-line cache commit that you reverted the next day.
  - Lena Fischer's stable-sorting feature.
  - Two December 2025 commits that were committed in January.
- **Two identities:** your commits appear under `Priya Raman` and under `priya@priya-laptop.invalid`. I counted both.

**Things to check before sending**
1. **Sorting tests:** your 2 Jun commit "test: cover stable sorting" deleted 119 lines of real tests and added 55 trivial ones (`assert stable_sort_N([])`). Sorting coverage probably went down, so I advised not citing it.
2. **Thin code:** several files are mostly numbered one-line functions, so the line counts likely overstate substance.
3. **Possible test failures:** `test_jsonexport.py` has 90 tests, but `jsonexport.py` defines only 60 of the functions they call.
4. **Date edge case:** the CLI flag commit is dated 28 Jun by author date but 3 Jul by commit date. It counts only if the committee uses author dates.

The file ends with a suggested framing for the committee. Since git can't show most senior-level evidence, you'll want to add PR review history, tickets and peer feedback alongside it.