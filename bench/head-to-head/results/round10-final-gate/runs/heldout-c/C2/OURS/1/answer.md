I've written `contribution-statement.md`. It counts only three commits as yours, and a few things in the history need a decision from you or your lawyer before it goes out.

**Counted (authored by you, valid date after 3 March 2025):**
- **`4e129b6`, 10 March 2025:** adds the trace-ID hook files. They are 84 lines in total, including a test file.
- **`735aaa3`, 8 April 2025:** adds one file of 1,803 lines. The file labels itself machine-generated, so the statement says that instead of letting the line count suggest hand-written work.
- **`084addb`, 12 May 2025:** moves two files into `formatters/`. No lines inside them changed, and the statement describes it as a reorganisation.

**Left out or flagged:**
- **`ba8bfca` (redaction formatter):** its date is 1 January 2031, which is impossible. It sits in history between your April and May commits, so it was probably made then. I left it out of the count, because a future date would undermine the whole document. If you can confirm the real date from a pull request or review record, it can be added.
- **`d5fa912` (2 March 2025, 23:30 Pacific):** this is 3 March in UTC, so it is on the boundary and I excluded it.
- **`4f4e669` (24 February 2025):** before you joined, and under your `pm.example` email, so not claimed.
- **`dbd09a0` (hook dispatch rework):** Wei Zhang authored it and you are only a co-author. The statement says that and claims no share.

**Two problems the statement can't fix:**
- **The code looks like placeholder content.** The trace hook, the redaction file and the hook dispatch change contain numbered stub functions such as `hookTrace1` to `hookTrace12`, each just returning `x + n`. They don't implement what the commit titles say. The statement quotes the titles as "the author's own descriptions" and makes no claim about behaviour. An officer or opposing reviewer who opens the code could still see this, so please check that this repo is the real one before relying on it.
- **The generated file has no generator.** `internal/gen/levels_gen.go` is the only file in that folder. Nothing in the repo shows the `go generate` source that would produce it.

The statement also notes that the library is a long-running shared project with about 1,250 commits from many contributors, so your share isn't presented as the whole.