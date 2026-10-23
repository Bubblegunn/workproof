I wrote `promo-evidence.md` in this folder. The jd-resume-tailor skill declined the request, because it only tailors resumes. I built the summary directly from the git history instead.

Filtered by your work email and 1 July to 31 December 2025, the numbers are:
- **Commits:** 9, which is 8 direct commits plus the merge of the audit-log branch.
- **Lines:** 12,343 added and 100 removed, so +12,243 net.
- **Net excluding generated files:** +243. One commit on 12 August imported a 12,000-line generated API snapshot. I split this out in the file so the committee doesn't read it as hand-written code.

The themes in the file are:
- key rotation, with a helper and tests;
- expiry metrics;
- audit logging for signing failures;
- a serialiser experiment that you reverted, whose added and removed lines cancel out;
- docs and year-end release notes.

The file contains no code.

Three commits in the date range are excluded because they weren't under your work email:
- **`e25df1f`, "Harden signature comparison (#412)":** this is under `alex.rivera@users.noreply.github.example`, so it's probably yours (GitHub web merge). If so, add 1 commit and +40 lines, which is a security-hardening change that suits the committee.
- **`c568738`, "Fix typos in docs":** this is by "Alex Rivero" at a different email, so I assumed it isn't you.
- **`1ee5319` and `994fb16`:** these are Maya Chen's commits.

Tell me if the noreply commit is yours and I'll fold it in.