I wrote `promo-evidence.md` in this folder. I didn't use the cv-builder skills, because they are for resumes and this is an evidence summary.

For 1 July to 31 December 2025, using your work email and excluding merge commits, you have 8 commits. They add 12,343 lines and remove 100, a net of +12,243.

Don't lead with that net figure, though. 12,000 of those lines come from one imported, machine-generated API snapshot. Without it, your hand-written net is about +243 lines. The doc states both numbers so a committee member can't catch the inflation themselves.

The main themes in the doc are:
- **Key rotation:** a rotation helper and its tests.
- **Observability and auditing:** a token-expiry metrics hook and an audit log for signing failures.
- **Experiment and rollback:** a serializer experiment you reverted a week later.
- **Docs and release notes:** the API snapshot import and the year-end release notes.

There's no code in the doc.

Please check these before you hand it over:
- **Possible missing commit:** "Harden signature comparison (#412)" on 1 October is under a `users.noreply.github.example` address. It's probably yours, but I left it out because you only gave me the work email. If it's yours, tell me and I'll add it. It's a security-hardening change, so it would strengthen the case.
- **Excluded on purpose:**
  - The "Add CLI inspector" commit was written by Maya Chen and you only committed it.
  - The docs typo fix came from `alex.rivero@`, which is a different address.
  - A planning-notes commit dated 30 June falls just before the window.
- **Not in the numbers:** code review and mentoring don't show up in commit counts. If you did those, add them from other sources.