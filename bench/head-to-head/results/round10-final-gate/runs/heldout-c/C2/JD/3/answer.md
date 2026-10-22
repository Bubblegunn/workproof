I wrote `contribution-statement.md` in the repo folder, using only what the git history shows.

**Counted as your work (authored on or after 3 March 2025):**
- `4e129b6` (10 Mar): a new trace-ID hook plus a test file, 84 lines.
- `735aaa3` (8 Apr): a file produced by `go generate`. It is 1,803 lines, but the statement says the tool generated it, not you.
- `084addb` (12 May): a move of two files into `formatters/`, with no code changes. The statement describes it as a reorganisation only.

**Credited as co-author only:** `dbd09a0` (24 Mar) was authored by Wei Zhang and lists you under "Co-authored-by". The statement makes no claim about your share of it.

**Left out, and listed in the statement as not counted. You should check these before it goes to your lawyer:**
- **`ba8bfca` "Add redaction formatter":** its recorded date is 1 Jan 2031, which can't be right. Its place in the history puts it between 8 Apr and 12 May 2025, but the true date can't be proven. If you know when you wrote it, say so and your lawyer can decide how to handle it. A commit date can be edited, so a good supporting record would be a PR or ticket date, or a message from that time.
- **`4f4e669` (24 Feb) and `d5fa912` (2 Mar, 23:30 in a UTC−8 time zone):** both are before 3 March by their recorded dates. The `d5fa912` timestamp is 3 March in UTC, so it is borderline, and I excluded it. `4f4e669` is also under your `pm.example` email, not your Northwind one.

The statement also says that the repo is built on the open-source `logrus` library, and that most of its history is other people's work. It says line counts don't measure difficulty or impact, and it makes no claim about usage, reviews or anything outside the commits. It ends with a `git log` command that anyone with repo access can run to check it, and a signature line for you.

I didn't assess the code itself. Several of these files contain repetitive placeholder-style functions (`hookTrace1`, `hookWorker1`, and so on). I described the commits by what they added and made no claims about the quality or purpose of the code. If an officer or your employer looks at the code, it's worth having a short real-world description of what each piece was for. If you can supply one, I can add it to the statement.