I wrote the statement to `contribution-statement.md`. It's built only from the git history, and I didn't treat anything as proven that the history doesn't show.

**What it claims, since 3 March 2025**
- **Authored, four commits.**
  - Trace-ID hook with a test file (10 Mar, 84 lines).
  - Generated level strings (8 Apr, 1,803 lines).
  - Moving the formatter files into `formatters/` (12 May, 0 lines changed).
  - Redaction formatter (82 lines, bad date).
- **Co-credited, one commit.** Wei Zhang's "Rework hook dispatch for concurrency" lists you as co-author. I claim no share of its 43 lines.
- **Excluded.** Two earlier commits under your name are dated 24 Feb and 2 Mar 2025, before you joined.

**Things to check before it goes to your lawyer**
- **The redaction formatter is dated 1 Jan 2031.** That is impossible, so the history can't show when you made it. The statement says this openly. Please confirm the real date with your team, because an officer who spots a 2031 date would question the whole document.
- **The 1,803-line commit is machine-generated.** The file says "DO NOT EDIT", and the generator itself isn't in the repo. The statement says so and doesn't count it as hand-written code.
- **The file move changed no lines.** It also moved files you didn't write.
- **The code in the trace-ID and redaction commits is filler.** Those files contain only numbered placeholder functions like `x + 1`, with no real trace-ID or redaction logic. So the statement describes your commits only by their titles and doesn't say what the code does. If this is a sanitised copy, a lawyer should have the real repo checked. If it is the real code, the redaction commit in particular may not support its title.

The statement makes no claims about business impact or code quality, and it covers only this repo. If you want to add code review, design work or other repos, you'd need separate evidence for those.