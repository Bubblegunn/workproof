I wrote `promo-evidence.md` in this folder. I didn't run the receipts miner. It reads Claude Code session transcripts, and you asked about commits and net lines in the repo. I took those straight from git history instead, filtered to your work email.

- **Commits:** 8 non-merge commits between 1 July and 31 December 2025. The feature-branch merge for the audit log is left out of that count.
- **Net lines:** +12,243 (12,343 added, 100 removed).
- **Hand-written lines:** the net is only about +243 once you set aside one generated API snapshot of 12,000 lines. I flagged this in the file, because a committee that spots it unprompted could read the headline as padded.
- **Themes:** key rotation and its tests, token-expiry metrics, docs tooling, a msgpack serializer experiment that you reverted, the audit log for signing failures, and release notes. The file describes the serializer experiment as tried and backed out, not as a shipped feature. It contains no code.

Two judgement calls for you to check:
- **"Harden signature comparison (#412)":** this commit is under a `users.noreply.github.example` address, not your work email. It looks like yours (about 40 lines), but I left it out of the numbers and mentioned it in the file. If it's yours, add it.
- **30 June planning notes:** the commit is timestamped 23:00 on 30 June in your local time, so I excluded it. It falls on 1 July in UTC. Say if you want it counted.

The file is a git-derived summary of volume. It has no impact claims, so you'll want to add a few concrete outcomes yourself.