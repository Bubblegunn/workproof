Of the 11 billed days (82 hours), 5 days (40 hours) aren't properly backed by commits. For 3 of them (24 hours) the evidence is clear. The other 2 (16 hours) depend on two points I'd like you to confirm. I read the git history directly and didn't use `workproof figures`, because this is someone else's claim. I used author dates.

**Clearly not supported (3 days, 24 hours)**

| Billed day | Hours | Commit cited | Problem |
|---|---|---|---|
| Oct 6 | 8 | 98288e0 "code quality" | Whitespace-only change to one line. Ignoring whitespace, the diff is empty, so no deliverable. |
| Oct 10 | 8 | 01eae32 "integration and sync" | Merge commit. It only brings in your PM's release-notes draft (a00f0e5, Chris Meyer) and contains no work by Lena. |
| Oct 13 | 8 | 9f3e1ab "performance work" | This commit isn't in the repository. There's only one branch, and no other commit that day. |

**Depends on confirmation (2 days, 16 hours)**

| Billed day | Hours | Commit cited | Problem |
|---|---|---|---|
| Oct 3 | 8 | 646d9df "tag cleanup" | The author is "Lena **Hofmann**" at an other-agency address, not Lena **Hoffmann** at hoffmann-dev. It may be a different person or a misconfigured identity. I haven't counted it as hers. |
| Oct 8 | 8 | 5919b6a "atom links" | Authored Sep 29 but committed Oct 8, which looks like a rebase or replay. By author date the work predates the invoice period. By commit date it falls on Oct 8. |

**Supported**
- Oct 1, 2, 7, 9, 14 and 15 each have a real feature commit on that day.
- Included: the Oct 2 commit (f0ed7a8) uses a GitHub noreply address, but the name matches Lena Hoffmann. I treated it as hers, so please confirm.

**Limits**
- Commits show what was done, who did it and when. They don't show hours or effort.
- Several supported days have a single small commit against 8 billed hours (for example Oct 9: 4 hours against one 18-line commit). I can't say whether those hours are right.
- Commits are timestamped Oct 12, 14, 15, 31, so none are future-dated.
- Lena committed on Sunday Oct 12 ("Fix feed lang attribute") and didn't bill it. That commit doesn't back any billed day.

**Next steps**
1. Ask Lena for the real hash for Oct 13. She could also say whether the work is on an unpushed branch.
2. Ask her about the Oct 3 commit and the Oct 8 rebase.
3. Ask what Oct 6 and Oct 10 actually covered.

If the Oct 3 and Oct 8 questions are answered in her favour, the unsupported total drops to 24 hours.