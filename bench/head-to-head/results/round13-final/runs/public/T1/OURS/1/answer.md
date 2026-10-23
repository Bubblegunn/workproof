I've put together a plain-language summary for your visa application, plus the technical report behind it. `check` and `verify` both passed on that report: the file wasn't edited, and all figures were recomputed from the repo and matched.

**Files, in the current directory:**
- `work-summary.md` is the non-technical summary. It has no code, commands or addresses.
- `evidence/workproof-report.md` and `.json` are the tool's report. Its readable report does name some technical items, such as merge commit ids.
- `evidence/README.md` explains how to check the report and records the tool's verified figures.

**Numbers (7 Nov 2013 to 22 Aug 2015, by author date):**
- You wrote 63 of the 131 changes in that period (48%).
- 697 of the 1,417 lines still in the project are yours (49%).
- You added 1,276 lines and deleted 1,762.
- You started 10 of the 19 files.
- You rank 1st of 42 contributors by surviving lines.
- Not counted: 13 merge commits, 1 revert (your own work, kept in the figures and listed as reverted), and 19 commits by other people that were committed through your address.

**Addresses merged, and why:**
- The tool merged `<email:266aea16>` automatically, because the GitHub username matches.
- The report also counts `<email:4132b6bd>`, because it has the same name, "Jonathan Ong". That address is not in the tool's merge message.
- Both are listed in the summary as "included: <rule>, please confirm". Please confirm they're yours. If either isn't, I'll rerun without it.
- Counting only your configured Gmail address gives 56 commits instead of 63.

**Public-repo check:** the repo has no remote, so nothing says it's public.

**Limits:**
- The history could have been rewritten before the report was made.
- The figures don't show quality, review, design or mentoring.
- A passing check isn't proof the history is genuine. A reference from the client would strengthen the application.

**Keep these:** the JSON file and the fingerprint key `9c7895be33bbaa37c6d73b0127ab3a89`. The key isn't stored anywhere, and `verify` needs it to confirm which repository the report is from.