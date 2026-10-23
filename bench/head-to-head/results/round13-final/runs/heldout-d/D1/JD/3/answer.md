I've written `promo-evidence.md` in this folder. It covers 9 commits under your work email, 8 if you leave out one merge commit. Net lines changed come to +243.

- **Net lines:** I left out a 12,000-line generated docs snapshot you imported in August, because it would inflate the figure. With it included the net is +12,243, and the file shows both numbers. The experimental msgpack serializer (+100) and its revert (−100) cancel out.
- **Themes:** key rotation and signature-comparison hardening, observability (a token expiry metrics hook and an audit log for signing failures), a serializer experiment that was reverted, and docs and release notes.

**Commits I left out (your call):**
- `e25df1f`, "Harden signature comparison (#412)", is under `alex.rivera@users.noreply.github.example`. I didn't count it as a commit or in the +243. It looks like yours, probably a GitHub web or PR merge. If it is, add 1 commit and 40 lines, which makes 10 commits and +283. The write-up already mentions that work as a theme.
- `c568738`, a docs typo fix, is by "Alex Rivero" (`alex.rivero@…`). I treated that as a different person and left it out.

I didn't check any of this against the code itself, only commit metadata and line counts.