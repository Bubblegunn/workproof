I wrote `WORK_SUMMARY.md` in the repo root. It runs to about one page and is in plain language with no code. Please check these points before you attach it.

- **The history is thin evidence.** The code in your commits is mostly placeholder filler, so I described the work from the commit messages and file sizes, not from the code. Check that the descriptions match what you actually did.
- **I guessed some details.** The job title "Software developer" and the period "January 2025 – October 2025" are my inference. Correct them if they're wrong.
- **Odd commit dates.** One commit is dated 2031 ("timezone handling") and one is dated 1970 ("wip"). I didn't use either date, and the timezone fix has no date in the summary. An officer who sees the repo might ask about them.
- **Other people's work.** Aiko Tanaka wrote the legacy exporter you deleted, and Aiko also wrote the carrier client and the route parser. Nadia Osei made the route fix. The summary says so and doesn't claim those. The repo also contains open-source code from its original author (Josh Baker, `gjson`), and I left that out.
- **Confidential details.** I left out the customer name (Quillfeather Retail), the internal database host, and an access token that sits in `loader.conf` in the repo. That token is committed in plain text, so you may want to tell your employer.
- **Employer letter.** The summary points to the employer's letter for job title and employment dates. Make sure the letter covers them.
- **Your name.** I took it from the commit author. Replace it if your passport name differs.