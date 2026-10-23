I wrote `WORK_SUMMARY.md` in the repo root. It's one page of plain language with no code, file names or email addresses in it.

It describes seven pieces of work, dated January to October 2025:
- shipment-record search
- an invoice rounding fix
- a reader for very large records
- removal of the old export tool
- a time-zone date fix
- a set of edge-case tests
- a how-to guide

**Counts.** There are 10 commits under your identity. The summary counts 7 of them as work and lists 3 as not counted: a 5,000-line auto-generated table, a "wip" to-do note, and a database connection setting. Raw totals are 5,622 lines added and 2,500 removed, and both match the tool's figures. The "622 lines written by hand" figure is my own subtraction (5,622 minus the 5,000 generated lines). The tool has no figure for it, so the page labels it that way.

**Things the officer might ask about:**
- The 2,500 removed lines were written by a colleague, and the page says so. It doesn't claim them as your writing.
- The time-zone fix has an author date of 2031, which is impossible. I used its committed date, July 2025, and the page says why. The "wip" commit is dated 1970 and is left out of the dated list.
- The page makes no claims about time spent, number of users or quality, because the history can't show those.

**Please confirm:**
- Your commits appear under two spellings of your name, both with the same work address. I counted both as you (included: same address). The tool found no other candidate addresses.
- The connection-setting commit contains what looks like an access token. It's a placeholder-looking value on a non-working host, but check it's harmless, and don't attach any raw history to the application.
- I mentioned "a retail customer" without naming it. Check that's acceptable for your employer's confidentiality terms.

I also saved the tool's figures to `evidence/figures.txt`, separate from the page you attach. To re-check the numbers yourself, run the `figures` command with your work address as the author filter.