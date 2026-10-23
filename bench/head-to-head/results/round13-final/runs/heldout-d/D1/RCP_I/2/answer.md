I wrote `promo-evidence.md` in this folder. I didn't run the receipts miner. It reports Claude Code session activity, not commits by your email, so I used the git history directly, which is what the committee needs.

**What the file says for 1 July – 31 December 2025, under alex.rivera@northwind.example:**
- **Commits:** 8, not counting merges.
- **Net lines:** +12,243 as git records it, but 12,000 of those come from one generated docs snapshot. Without it the figure is about +243. The file gives both numbers.
- **Themes:**
  - key rotation, with tests
  - token-expiry metrics
  - an audit log for signing failures
  - a serializer experiment that was tried and reverted
  - docs and year-end release notes

The file contains no code.

**Decision for you:** a commit in October, "Harden signature comparison (#412)", is authored as Alex Rivera but with a GitHub noreply address, not your work email. I left it out of the totals and said so in the file. If it's yours, the totals become 9 commits and about +12,283 net lines (about +283 without the snapshot), and you can add a security-hardening theme. Tell me and I'll update the file.

I also left out a similarly named colleague's docs-typo commit ("Alex Rivero"), your 30 June and 5 January planning commits (both outside the window), and the November merge commit.

If you want a human-readable highlight for the committee, the audit log and the reverted msgpack experiment are the easiest to explain. The revert shows you ran an experiment and made a call on it.