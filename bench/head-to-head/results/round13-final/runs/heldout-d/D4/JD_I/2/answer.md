I wrote `weekly-update.md` in this folder. I didn't use the jd-resume-tailor skill. It only tailors resumes, so its own scope check stops it for this request, and I built the update directly from the git history and the session logs.

**What's in it**
- **Delivered:**
  - the ESM named-exports fix (8 Sep)
  - the NO_COLOR docs (9 Sep)
  - the Node 22 CI matrix (10 Sep, credited to Kenji Mori since it was their commit)
  - the FORCE_COLOR=0 tests (11 Sep)
  - the dev-dependency bump (12 Sep)
- **Open:** nothing outstanding. The abandoned lazy-colour-table experiment is noted as not adopted and not shipped.

**What I left out because the update goes to the client's distribution list**
- The AWS credentials pasted in the 8 Sep session.
- The internal staging hostname.
- The client's name.
- The Orbis Bank portal work. It's a different client's project, and the patch isn't committed.

Because the credentials appeared in the session logs, which are committed in `sessions/`, you may want to rotate those keys even though they look like example values. The `--since=2025-09-08` filter missed the ESM fix commit (`26a3bb9`), so I took it from the full history.