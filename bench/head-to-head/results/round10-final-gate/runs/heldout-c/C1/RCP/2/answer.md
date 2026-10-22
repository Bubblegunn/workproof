I wrote `promotion-evidence.md` in the repo folder. It covers what you delivered from January to June 2025, in plain terms for readers who haven't seen the code.

**What's in it** (about 400 lines of code and tests you wrote):
- **Table-of-contents extension:** about 90 lines including tests.
- **LaTeX footnote rendering:** 120 lines, the largest piece of original code in the period.
- **Math plugin v2 with block equations:** 111 lines including tests, merged through a feature branch.
- **Formatter header:** applied across 37 files. The change is broad, but each edit is one line.

**What I left out of the totals, and why:**
- **Vendored python-slugify:** the 6,000 lines are third-party code. They're listed but marked as not your output.
- **Parser speedup:** you reverted it two days after adding it. It's mentioned only as an experiment, not a shipped result.

**Questions for you:**
- **Abbreviation plugin:** its author date is Nov 2024 but its commit date is May 2025. I excluded it. Tell me if you finished it in 2025 and I'll add it.
- **"dreyes" commit:** one February bug fix is under the name "dreyes" with a personal-style email. I attributed it to you, but check that it's yours.
- **Business impact:** git can't show users or customer requests, so a sentence on why each item mattered would help.