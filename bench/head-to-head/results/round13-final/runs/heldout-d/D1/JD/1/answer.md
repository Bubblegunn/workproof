I wrote `promo-evidence.md` in this folder. It has no code in it.

For 1 July to 31 December 2025, matched on alex.rivera@northwind.example:
- **Commits:** 8, not counting the merge commit.
- **Net lines:** +243. That is 343 added and 100 removed.

Four judgment calls change those numbers, and the file explains each one:
- **Generated file left out:** The 12 August commit imported a generated API snapshot of about 12,000 lines. I left it out because it isn't hand-written. Counting it would make the net about +12,243. If you'd rather include it, say so.
- **Merge commit left out:** The 3 November merge only repeats the audit-log commit from 28 October.
- **Possibly yours:** The 1 October "Harden signature comparison" commit (+40 lines) was committed under a GitHub no-reply address with your name, not your work email. I didn't count it. If it's yours, the totals become 9 commits and +283 net lines, and you should confirm that before submitting.
- **Similar name:** A commit by "Alex Rivero" is someone else's, so I excluded it.

The themes are:
- key rotation
- token-expiry metrics
- security hardening and an audit log for signing failures
- a serializer experiment that you reverted
- docs and release notes

The reverted serializer experiment adds a commit but nets to zero lines.

The file also tells the committee that these counts measure activity, not impact. You may want to add outcomes from a manager or colleague.