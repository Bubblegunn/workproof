I wrote `promo-evidence.md` in this folder. It has no code in it.

**Numbers for 1 July – 31 December 2025:**
- **Commits:** 8, matched on alex.rivera@northwind.example. I left out the merge commit for the audit-log branch, because it only joined work already counted.
- **Net lines:** +243 (243 added, 0 removed).
- **Themes:** key rotation, observability, audit logging, evaluating alternatives, and docs and release notes.

**Choices I made that you should check:**
- **Generated snapshot excluded.** One commit imported a 12,000-line generated API snapshot for the docs site. Counting it would show about +12,243 net, which a committee might see as padding. The file says it's excluded.
- **msgpack experiment.** The experiment (+100 lines) and its revert (−100 lines) cancel out. Both still count as commits.
- **Possible missing commit.** "Harden signature comparison (#412)", from 1 October, is authored as `alex.rivera@users.noreply.github.example`. It's the same name and probably yours, but you only gave me the work email, so I left it out. If it's yours, the totals become 9 commits and +283 net, and I'd add a security-hardening theme. Tell me and I'll update the file.
- **Different author.** "Fix typos in docs" is by "Alex Rivero", not Rivera, so I treated it as someone else's.
- **Not yours.** The October "Add CLI inspector" and the August "timestamp skew" commits are by Maya Chen, so I excluded them.

Line counts show volume, not impact. If you want the committee to see the impact, add a sentence or two on the outcomes yourself, such as what the audit log or rotation helper enabled.