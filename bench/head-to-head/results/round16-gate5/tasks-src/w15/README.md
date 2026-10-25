# w15: git history for credit, effort and authorship (5 tasks)

All five come from one stated job: a researcher who must credit people (authors versus acknowledgements), report effort per semester and answer reviewers, from a lab repository. Facts about the base repositories (names, rough content) are from memory plus a look at the clone; all synthetic commits use example/invalid domains and dates in 2025-2026. All pins verified by building twice (equal HEAD sha, equal truth.txt).

t1: rxi/json.lua (Lua), pin dbf4b2d. Lab solver/ added in 9 commits. Hazards: same person with two e-mails, whole-file reindent, formatter bot, code moved to a new file, small critical fix, external collaborator. Convention: surviving non-blank lines (blame -w -M -C -C, formatter commits ignored, licence header lines excluded), identity by name.

t2: mattn/go-isatty (Go), pin a7c0235 (last commit before 2025). Hazards: Europe/Berlin versus UTC versus recorded offset at semester boundaries, rebased commits (author date October, committer date April), merge commit, bots, 1970 and 2031 clocks, two e-mails. Convention: author date converted to Berlin; distinct days and commits; impossible dates reported unplaceable. Output is effort.csv.

t3: sindresorhus/is-plain-obj (JavaScript), pin 97f38e8. Hazards: squash merges committed by a GitHub identity, Co-authored-by trailers (lower-case key, co-author who only appears in trailers, second e-mail), revert never restored, bot, Reviewed-by/Signed-off-by, real merge, commits after the "Freeze for submission" commit. Convention: author plus co-author trailers, scope lab/ at the freeze.

t4: benhoyt/inih (C), pin 63a302c (last commit before 2025). Hazards: one bulk import commit by a non-author whose message names the true authors, pure rename, patches whose committer differs from the author, a later vectorisation rewrite. Convention: blame lines at HEAD by author; import lines credited per message with stated limits.

t5: dbader/schedule (Python), pin 82a43db. Hazards: 50k-line dataset plus binary, vendored dir (declared), generated docs (declared), generated protobuf module (only a header), lock file, reformat commit, rename, bot, shared lab PC account with initials, two e-mails, a commit before the window. Convention: lines added in own code (tests included), window from 2025-11-01, docs separate, shared account reported separately. Output is chat or file (the prompt asks for a table).
