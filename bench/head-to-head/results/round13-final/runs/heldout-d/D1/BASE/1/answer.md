I wrote `promo-evidence.md` in the repo folder. It has no code in it.

**Numbers for 1 July – 31 December 2025, using alex.rivera@northwind.example only:**
- **Commits:** 9. One of them is a merge commit, so 8 contain actual changes.
- **Net lines changed:** +243. That is 343 added and 100 deleted.
- **Generated file excluded:** A 12,000-line generated docs snapshot is left out of the headline figure. Including it, the net is +12,243. The file states both figures and explains the exclusion, so the committee isn't misled either way.
- **Reverted experiment:** A msgpack serializer experiment (+100 lines) was reverted (−100 lines), so it nets to zero.

**Themes:**
- Key rotation and its tests.
- An audit log for signing failures.
- A token-expiry metrics hook.
- Release hygiene: the serializer experiment and its revert, the year-end release notes, and the docs snapshot.

**Two commits I left out, which you should check:**
- **`e25df1f` "Harden signature comparison (#412)":** This is a security-hardening commit of 40 lines. It is authored as Alex Rivera but with a GitHub noreply email, not your work address. If it's yours, add it. That makes 10 commits, +283 net, and a security-hardening theme the file doesn't have yet. I can update the file if you confirm.
- **`c568738` "Fix typos in docs":** This one is authored by "Alex **Rivero**", which looks like a different person, so I excluded it.

The "Add CLI inspector" and "Add timestamp skew tolerance" commits are Maya Chen's, so they aren't counted.

The file also says the figures come from git history, so the committee knows how they were derived.