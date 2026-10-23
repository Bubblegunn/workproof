I wrote `PROMOTION_EVIDENCE.md` in this folder. The numbers are weak evidence, and a few things in the history could count against you if a committee reads them closely.

**What the history shows (1 Jan to 30 Jun 2026)**
- You authored 13 commits in the window. 8 are work that is still in the code base.
- That work adds about 342 hand-written lines: 157 source, 145 tests and 40 docs. After the 2 June test rewrite deleted lines, the net is about 278.
- The main thread is JSON export for tables. It runs from the core feature through the None-cell fix, export options and tests to the CLI flag. Tomasz merged the options and tests as PR #41.

**What I left out**
- A 30,002-line dataset and a 1,800-line generated lockfile.
- The paginate cache, which was added and reverted, so it nets to zero.
- Tomasz's `side.py` change, which you only merged.
- The 14 July docs note, which falls after the window.

**How far to trust it**
- **Test rewrite:** the 2 June commit replaced 119 lines of real tests with 55 one-line tests like `assert stable_sort_N([])`. I didn't run them. They look like placeholders, and `test_jsonexport.py` has the same style. Please check these before citing them.
- **No impact data:** the repo has no usage, performance or benchmark data. Line counts say nothing about value.
- **Pagination doc:** `docs/pagination.md` describes a feature you reverted, so check it before citing it.
- **Your author identities:** three commits are under `priya@priya-laptop.invalid`. I assumed that is you, so please confirm.
- **Sorting work:** the sorting feature is Lena's commit with you as co-author. Your share is unknown, so I didn't count it.
- **Rebased commits:** two commits have December author dates but January commit dates, 50 lines in total. I excluded them. Add them if the committee counts by commit date.
- **Code review:** your review of Tomasz's CSV commit isn't recorded in git, so I didn't count it.

The cv-builder skills are built for resumes and job postings, so only `rewrite-achievements` fit. I used its rule of stating only confirmed facts. I didn't use tailor-resume, review-resume or create-resume.

If you can supply PR links, the benchmark behind the cache revert, or who uses the JSON export, I can add them.