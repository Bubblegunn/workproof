I wrote `promo-evidence.md` in this folder. It has no code in it.

**Numbers for 1 July to 31 December 2025:**
- **Commits:** 9, not counting the merge commit for the audit-log branch.
- **Net lines:** +283 hand-written (383 added, 100 removed). That rises to +12,283 if you count a 12,000-line generated API snapshot import. The file shows both figures and says why they differ, so the committee can't think you padded the total.
- **Themes:** security hardening (signature comparison, audit log), key rotation, token-expiry metrics, documentation and release notes, and a msgpack serializer experiment that you reverted.

**Check these before you hand it over:**
- **`#412` commit:** "Harden signature comparison" was committed as `alex.rivera@users.noreply.github.example`, not your work email. I counted it as yours because the name matches and it fits the security theme. If it isn't yours, the total drops to 8 commits and +243 net hand-written lines, and you'd need to remove the hardening bullet.
- **Excluded commits:** I left out a typo-fix commit by "Alex Rivero" (a different person, one letter off), plus two commits by Maya Chen.
- **Reverted experiment:** The msgpack experiment and its revert cancel out in the net figure. I presented it as evidence of judgement, which is my own framing. Cut it if you'd rather not mention it.