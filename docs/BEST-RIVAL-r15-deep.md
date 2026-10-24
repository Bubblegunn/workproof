# Best-rival capability table, round 15 (deep read, research only)

Date: 2026-10-24. Scope: read-only research. No `claude` call, no rival code run, nothing added to git, no held-out path
opened (`round11-final-gate` and every `heldout*` path under `bench/` were not opened; the E and D transcripts and task folders
named in the brief were read, they are development material now). Rival repositories were read as files and as raw GitHub
READMEs/source. Clones are under `/private/tmp/claude-501/-Users-efe-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/deep-rivals`
(raw README and script downloads only, nothing built or executed).

Job under study: turn a person's git history and local coding-assistant records into trustworthy, checkable statements
(promotion, visa and immigration evidence, CV bullets, client or manager reports, checking someone else's claim or invoice,
audit evidence of who reviewed changes).

Evidence tags used in every table:
- [S] source or skill text read by me, with file:line.
- [R] README or help text read, behaviour not confirmed in code.
- [D] vendor documentation page fetched 2026-10-24.
- [T] local transcript or task file read.
- [G] local `git help` page of git 2.50.1 (this Mac).
- [K] known from earlier rounds only (`BEST-RIVAL-r12.md`, `BEST-RIVAL-r13.md`), not re-read here.

Licence rule: MIT, Apache-2.0, BSD may be adapted with attribution in `THIRD-PARTY-NOTICES.md`. MPL-2.0, GPL, AGPL, no licence
= idea only, no code.

## 1. Rivals and pins

| Rival | Pin or version read | Licence (verified how) | Read how |
|---|---|---|---|
| receipts plugin, anthropics/claude-plugins-official | 465f09344424225c25d438f2e052732c3d688d2f | Apache-2.0 (`rcp/LICENSE` header) [S] | `skills/receipts/SKILL.md` all 330 lines, `scripts/mine-transcripts.mjs` (1474 lines) by grep and sections 560-570, 806-890 [S] |
| cv-builder | f7c8c3b6d379f8d12ca1c70fc7576652dcdfe16c | MIT (`cv/LICENSE` first line) [S] | `skills/tailor-resume/SKILL.md`, file list, `PRIVACY.md`; the other three skills only by line count [S] |
| jd-resume-tailor | 701801493babf6ee75561b5a76b0d0c255bd12e8 | MIT (`jd/LICENSE`) [S] | `skills/jd-resume-tailor/SKILL.md` all, file list [S] |
| git-fame (casperdcl) | main, pushed 2026-10-05 | MPL-2.0 (`LICENCE` file; GitHub API says NOASSERTION) = idea only | `README.rst` help text [R] |
| git-quick-stats | master, pushed 2026-04-18 | MIT (API) | README [R] and the shell script `git-quick-stats` lines 41-141, 571-572, 1513-1525 [S] |
| git-who (sinclairtarget) | master, pushed 2026-05-28 | MIT (API) | README [R] |
| gitinspector (ejwa) | master, pushed 2026-10-21 | GPL-3.0 (API) = idea only | README and `gitinspector/help.py` [R]; options not individually verified |
| hercules (src-d) | master, last push 2023-02-07 (unmaintained) | Apache-2.0 (README badge and `LICENSE.md` header; API says NOASSERTION) | README [R] |
| git-of-theseus (erikbern) | master, last push 2023-11-25 | Apache-2.0 (API) | README [R] |
| GitHub contributors graph and Pulse | docs.github.com, fetched | not code | [D] |
| `git shortlog`, `git blame`, `git log`, `git interpret-trailers` | git 2.50.1 local man pages | GPL-2.0, features only | [G] |

Not read: gitinspector wiki (metric definitions), hercules and git-fame source code. Every statement about their internals is
marked [R] and unverified.

## 2. What the transcripts say (evidence for section 5)

Task E5 (held-out set e): "Our auditor wants evidence that every change to lib/ in Q1 2026 got a second person's review. We
record reviews as Reviewed-by trailers ... write change-review-evidence.csv ... tell me which ones the auditor will question."
Truth: 12 rows; 6 independent, 6 not (9e9751f and bc7e732 self-review via .mailmap alias, 8465169 prose quote, ad96886
Acked-by, 2f7f724 and f70e6a8 no trailer; b07be54 and 268e72a count as reviewed through merge dada197; fa7f9fc lowercase key).
Scores `results.txt`: CV_I 4.33 [5,5,3], OURS 2.67 [2,2,4], CV 2.67, RCP 2.00, BASE 1.33. [T]

| Run | Tools used | What it did | Result |
|---|---|---|---|
| CV_I-1 (5) | 4 Bash, 5 turns, $0.110; no skill, no workproof | `git log` with `%(trailers:key=Reviewed-by)`, read full messages, read merge dada197, wrote CSV with sha, "via merge" status | 12 rows, reviewed set d21c30a fa7f9fc e37dd19 a54659a plus merge-covered pair marked "via merge", all 6 questionable named with reason, says trailers are not proof |
| CV_I-2 (5) | 4 Bash, $0.093 | same plus first-parent look at the merge; count of reviewed = 5 (includes a54659a as boundary note) | 12 rows, merge-covered pair under "weaker evidence" |
| CV_I-3 (3) | 5 Bash, $0.104 | `--diff-merges=first-parent` experiments; wrote 11 rows (truth: 12; which row was dropped not checked) | row-count error, merge-covered pair marked "reviewed indirectly" |
| OURS-1 (2) | Read core-rules, 4 Bash, 6 turns, $0.099 | used `git interpret-trailers --parse` per commit; correct 12 rows; but marked b07be54 and 268e72a "no review trailer" and never looked at merge dada197 | 8 flagged instead of 6; merge-level review (our own core-rules rule 9) not applied |
| OURS-2 (2) | no Read of core-rules, 4 Bash, $0.102 | listed dada197 as "only combines commits, no trailer of its own" | same error; lowercase key handled |
| OURS-3 (4) | Read core-rules, 4 Bash, $0.101 | 13 rows (merge counted as a change); merge-covered pair "counted as review at PR level only" | criterion 1 (exactly 12 rows) fails on 13 rows |

No arm called `workproof` for E5. The tool has no command for review evidence: `grep -ri reviewed-by src skills commands`
finds only the hint hook. The only rule is prose (`core-rules.md` rule 9). The winner won on three handwritten steps:
read the merge message, label the merge-covered rows "weaker", state that a trailer is a claim. These are deterministic and
the CLI can do them. Costs and turn counts are equal across arms (5-6 turns, $0.09-0.11), so cost is not a differentiator. [T]

Task D2 (continuous activity statement, set d): OURS-1 ran `figures` (it printed first, last, active months, gaps), then
re-ran its own `git log --until=2025-12-31T23:59:59` and answered "last commit 2025-12-01", dropping `6fa6eb6`
(2025-12-31T21:00-08:00); truth is 2025-12-31. The hand-written end time is the exact thing core-rules rule 5 forbids.
RCP-1 answered correctly with one `git log` and mentioned UTC shifts and a co-author's commits inside the gaps. OURS 4.67 =
BASE 4.67 = RCP 4.67. [T]

Task D3 (authorship claim, set d): RCP_I-1 (5.0) called the `receipts` skill, found it did not apply, then used
`git log --follow`, `git blame -w -C -C --line-porcelain`, `git diff -w` between the move and the "rewrite" commits. OURS-3
(4.67) did the same with `-w -M -C` and wrote the notes. Both hand-run git; there is no workproof command for "who owns this
file". [T]

## 3. Capability table

Columns: workproof today | rivals | decision | note | size. "Beats us" means a rival does it and we do not (or worse).

### 3.1 Identity and attribution

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Implementation note | Size |
|---|---|---|---|---|---|---|---|---|
| 1 | Identity resolution, mailmap | configured email plus strong merge rules (same name, GitHub login, address name); candidates printed, not merged; figures read the log as `.mailmap` shows it (`figures.ts:354`) [S] | receipts: `git config user.email`, then exact `%ae` match, no mailmap, no aliases (`mine-transcripts.mjs:878`, `:822-850`) [S]; quick-stats: `--use-mailmap` on every log call (`git-quick-stats:141`) [S]; git-who: honours `.mailmap` [R]; git-fame: asks the user to add a `.mailmap`, no own logic [R]; hercules: automatic 3-step name/email union or `--people-dict` file [R]; GitHub: only emails linked to an account [D] | No, ours is the most explicit. Missing piece: same-person test between a reviewer string and an author, used for self-review | git-who MIT, quick-stats MIT, hercules Apache, fame MPL | Reimplement (inside #5) | compare reviewer and author after mailmap, then by the same strong rules `mine`/`figures` use; name the rule in the output | S |
| 2 | Co-author trailers | `figures`: "commits by others with Co-authored-by naming an identity" shown as candidate, not merged (`figures.ts:272`); `git.ts:71` also reads Assisted-by [S] | git-fame `--auth=git\|first\|share` credits Co-authored-by and Assisted-by [R]; quick-stats counts Co-authored-by in one view only [K]; `git shortlog --group=trailer:co-authored-by` [G] | Partial: no switch to include them | MPL/MIT/GPL | Reject share-equally crediting (invents a split); keep candidate row | none | - |
| 3 | Bots | `[bot]` name and `<id>+<name>[bot]@users.noreply.github.com` only (`exclusions.ts:6`) [S] | git-fame `--ignore-author` regex or exact list [R]; quick-stats `_GIT_IGNORE_AUTHORS` (not in every view) [R]; git-who none [R] | Yes: no user-given ignore list | MPL / MIT | Reimplement | repeatable `--ignore-author <name\|email>` on `figures`/report; print each ignored identity count | S |

### 3.2 Time and history shape

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 4 | Window semantics | date-only bound = calendar day in the commit's own offset; ISO time must carry Z or offset; author date, committer date shown (`figures.ts:88-110`, `:193`) [S] | git-who passes `--since/--until` to `git log` [R]; git-fame since/until, relative allowed [R]; quick-stats `_GIT_SINCE/_GIT_UNTIL` [R]; receipts uses committer date `%cI` for "landed" and `--since` is deliberately avoided because it prunes traversal (`mine-transcripts.mjs:822-838` comments) [S] | No. But the model bypasses ours (D2: hand `--until=...T23:59:59` lost a commit) [T] | MIT/Apache | Reimplement a list mode | `figures --list`: one row per in-window commit (sha7, author date as written, UTC date, committer date, flags) so no hand `git log` is needed | S |
| 5 | First/last, active months, gaps, odd dates | present: first, last, active months, gaps over 30 days, author-date-in-future, committer-in-future (`figures.ts:257-260`, `:340-343`) [S] | git-who `hist` timeline [R]; quick-stats weekday/hour/timezone/calendar heatmap [R]; gitinspector timeline [R] | No for the legal use; D2 truth also wants "commits whose UTC date differs from local date" | MIT/GPL | Reimplement one row | `figures` row: commits whose UTC calendar date differs from the local date, with sha7; plus the gap list with end dates | S |
| 6 | Hours estimation | none by rule (`core-rules.md` rule 7: history shows what, who, when) [S] | git-fame `--cost hours` (session-gap, copies git-hours formula) and COCOMO months [R]; git-hours MIT [K] | They offer it; accuracy unproven (git-hours README says not for billing [K]) | MPL / MIT | Reject hours. Adopt only "days with at least one commit" | add `distinct commit days` figure; no per-day hours | S |
| 7 | Merge handling | non-merge commits counted, merges listed; no mapping of a merge to its branch commits [S] | quick-stats `--no-merges` default, `enable`/`exclusive` switch (`git-quick-stats:72-79`) [S]; git-who excludes merges from all metrics, `--merges` only adds to commit total [R]; GitHub graph excludes merge and empty commits [D]; receipts `--no-merges` (`:822`) [S] | Nobody maps merge to covered commits; ours is prose only | all MIT/Apache | Reimplement (in #8) | `git rev-list <m>^1..<m>^2` gives the branch commits a merge brought in; label evidence "merge-level, weaker" | S |

### 3.3 Review and approval evidence

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 8 | Review/approval evidence from trailers and merges | none in code. Prose rule 9 in `core-rules.md`; E5 transcripts show 2 of 3 OURS runs missed the merge-covered commits [T] | none of the three plugins has anything. quick-stats "Suggested code reviewers" = authors by commit count, not reviewers (`git-quick-stats:1513-1525`) [S]. `git shortlog --group=trailer:reviewed-by` counts reviewers but omits commits without the trailer [G]. GitHub PR approvals live in the API, not in git [K] | Nobody; this is the open slot. The E5 winner was plain git plus careful reading [T] | n/a | **Build** `workproof reviews` | see section 5, item 1 | M |
| 9 | Trailer parsing correctness | model-side only | `%(trailers:key=Reviewed-by,valueonly)` and `git interpret-trailers --parse` treat keys case-insensitively and require the trailer block; a "Reviewed-by" inside prose is not a trailer [G] | n/a | n/a | Reimplement with those two git features, never regex on the body | classify each of: `Reviewed-by`, `Acked-by`, `Approved-by`, `Tested-by`, `Signed-off-by` separately; prose-only mention flagged `quoted, not a trailer` | S |
| 10 | Self-review detection | none | none | n/a | n/a | Reimplement (inside #8) | reviewer equal to author by #1 rules = "self-review", reviewer shown as the author | S |
| 11 | Corroboration from outside git (PR approvals) | none; verdict text says "not verifiable here" [S] | none; GitHub shows approvals in the PR page [D-not-fetched] | n/a | n/a | Reimplement as an import only | `reviews --pr-export <json>`: user-supplied export of PR reviews; rows get column `claimed by export, not recomputable`; no network call | M |

### 3.4 Quantity of work

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 12 | Surviving lines vs churn | blame-based surviving lines plus numstat added/deleted, shares kept apart, rule 3 [S] | git-fame `--loc surv\|ins\|del`, warns that ins/del count every historical file [R]; git-who counts log-walk lines, not survival, a modified line = removal plus addition [R]; hercules burndown by cohort with DAG-aware blame [R]; git-of-theseus survival by cohort year [R]; gitinspector cumulative work [R] | No | MPL/MIT/Apache | Keep. Idea for later: cohort table (year added vs still present) from git-of-theseus (Apache) | `report` already has `survivalByCohort` (`analyse.ts:260`) [S]; no new work | - |
| 13 | Move/copy and whitespace in blame | `--copies` switch for `-C`; `.git-blame-ignore-revs` default [S cli help]; claim check by rule uses `git blame -w -M -C` [S core-rules 7] | git-fame `-w -M -C`, `--ignore-rev`, `--ignore-revs-file`, `--ignore-author` (ignored lines go to the previous committer, commit counts unchanged) [R]; git-who reads `.git-blame-ignore-revs` only at repo root [R] | Partial: file-ownership view with `-w -M -C` is not a command; D3 models hand-run it [T] | MPL/MIT | Reimplement | `workproof owner <path>` (section 5, item 3) | M |
| 14 | Generated/vendored/lock exclusion | linguist attributes plus globs, `--exclude`, `--no-exclusions`, counts reported (`exclusions.ts`, `analyse.ts:142-155`) [S] | git-fame `--excl/--incl` regex [R]; gitinspector default extension filter (java,c,cc,...,rs) [R]; quick-stats `_GIT_PATHSPEC=':!x'` [R]; git-who git pathspec exclusion `':!*.c'` [R] | No | - | Keep | the gitinspector lesson (a default filter must be printed) is already followed | - |
| 15 | Hand count safety | `figures --doc` lists numbers beside counting nouns and the figures that equal them [S cli help] | none | No | - | Keep; r13 G8 (table column nouns) still open [K] | - | - |

### 3.5 Session logs

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 16 | Session-log mining | `src/sessions/mine-sessions.mjs` (49.9K) adapted from the receipts miner, Apache-2.0 notice in `THIRD-PARTY-NOTICES.md`; `--dir` export mode with per-session rows and window (`cli.ts` help) [S] | receipts: skips sidechain prompts (`mine-transcripts.mjs:565`), attributes sessions to the project their file operations touched (`:445`), refuses a `git commit` counter because Bash calls carry no cwd (SKILL.md lines 83-87), `commitsWithOurWork` needs both author match and touched files (`:822-850`), `gitUnavailable` means unknown not zero (SKILL.md 100-104) [S]; report is one model call over a 10-20KB JSON [S] | No. Ours already adopted these | Apache | Keep | do not add pctSpend: receipts itself says it is a relative weight, not a dollar (SKILL.md 105-111) | - |
| 17 | Spend and hours claims | none (no dollar, no hours) [S SKILL.md] | receipts: no dollar figures, `pctSpend` share only [S]; "do not invent hours saved" [S] | equal | - | Keep | - | - |
| 18 | HTML/CSV receipt | removed on adoption [S THIRD-PARTY] | receipts: self-contained HTML plus Export CSV button (SKILL.md 41-45) [S]; gitinspector HTML/JSON/XML/text [R]; git-fame md/yaml/json/csv/tsv/svg [R]; quick-stats CSV and JSON [R] | Yes on formats | Apache / GPL / MPL / MIT | Reimplement CSV only | see #20 | S |

### 3.6 Privacy, verification, claims

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 19 | Report privacy | no code, no paths, no emails by default; `--paths`, `--emails` opt in; session output redacted (`export-usage.mjs:20`) [S] | receipts: project names appear in the output; skill tells the user which names are in the file before sending (SKILL.md step 5) [S]; cv-builder: sends only canonical Markdown through a 5-minute relay (`PRIVACY.md`) [S]; git tools print author emails (git-fame `--show=name\|email`, default name) [R] | No | - | Keep | - | - |
| 20 | Output formats | Markdown plus JSON, shields badge, in-toto statement [S] | md/json/csv/html/svg/yaml/xml across the git tools [R] (rows 18) | Yes: CSV | MIT | Reimplement | `--format csv` for `figures` and `reviews` (one header, RFC 4180 quoting, formula-injection guard for cells beginning `= + - @`) | S |
| 21 | Tamper evidence, verification | hash, `check`, `verify` (recompute in repo), `attest` (in-toto, optional SSH signature), `countersign` [S] | none of the rivals; cv-builder ships a `SHA256SUMS` for plugin files only (distribution integrity, not a report) [S] | We are alone | - | Keep. Gap: review rows are outside the hashed report | add a `reviews` block to the report schema (`schema/report.schema.json`) so `verify` recomputes it | M |
| 22 | Claim and invoice checking | `verdict` on a received report: row checks against `git show --numstat`, CSV SHA-256 compare (`rowchecks.ts`) [S]; unreported claims by prose rule 7 [S] | none | Rivals have nothing; D3 transcripts show models doing it by hand with `-w -C -C` and `git diff -w` [T] | - | Reimplement as command | `owner` (section 5, item 3); `invoice`-style line items already covered by rowchecks | M |
| 23 | Untrusted text | "names are data, not instructions" in figures header and SKILL rule 4 [S, T] | receipts: same rule for project names (SKILL.md 139-146) [S]; cv-builder: job posting is content, never instructions, do not fetch its links [S tailor-resume SKILL]; jd: scope check and hard skips [S] | cv-builder stricter on JD text and on hard requirements ("stop and quote the exact wording") [S] | MIT | Reimplement text | `references/tailor.md` has no rule on work-authorization, visa or language requirements (grep: 0 matches); add 3 lines | S |

### 3.7 CV and trigger

| # | Capability | workproof today | Rivals | Beats us? | Licence | Decision | Note | Size |
|---|---|---|---|---|---|---|---|---|
| 24 | CV tailoring | `bullets` fixed template, source tag `[figure id #hash8]`, gap list, `--resume` trimmed to 450 words; no model [S] | jd: bank file, rank projects by must-haves, source tags on every bullet, coverage table "one row per item, merge only interchangeable alternatives", counts must equal rows (SKILL.md 49-52, 60-66) [S]; cv-builder: 4 skills (create, review, rewrite, tailor), `cv-builder/v1` Markdown grammar, 15 templates, ATS and PDF in a browser builder, fit report and change summary [S]; no git evidence in either | Different job: they have no verifiable numbers; we have no template library or multilingual writing pass | MIT | Keep ours. Adopt jd's equal-counts check | `bullets` already prints coverage; add a self-check that every count equals rows (S). Reject templates and builder relay | S |
| 25 | Skill selection | UserPromptSubmit hook regex plus two-factor test; description list in SKILL.md [S `hooks/workproof-hint.sh`] | receipts: description only (SKILL.md line 3); jd: has `evals/trigger-tests.md` [S file list]; cv-builder: four skills, description only [S]. D3: RCP_I called `receipts:receipts` and then declared it not applicable [T] | Equal. Our hint matched the E5 prompt (tested: `hooks/workproof-hint.sh` returns additionalContext) but OURS-2 never read core-rules [T] | - | Reimplement | add review-evidence patterns to the hint regex (`reviewed-by`, `auditor`, `second person`, `approval`, `change.*review`) and make the weak answer name `workproof reviews` | S |
| 26 | Cost and turns | E5 5-6 turns, $0.099-0.102; D3 7 turns $0.129 [T] | CV_I E5 5-6 turns $0.093-0.110; D3 RCP_I 7 turns $0.163 [T] | Equal | - | none | a command that replaces 3 git calls cuts one turn at most | - |
| 27 | Shallow and huge repositories | refuses shallow clone with a message (`git.ts:172`); `--sample` (7 when over 50,000 file touches), `--max-commits` [S] | git-who per-repo cache under `XDG_CACHE_HOME` [R]; git-fame `--jobs` threads [R]; hercules memory or filesystem backend, "Burndown Out-Of-Memory" section [R]; gitinspector multi-process [R]; receipts chunks pathspecs by 400 to avoid E2BIG (`:811-818`) [S]; GitHub insights absent over 10,000 commits [D] | They are faster; speed already admitted in README | MIT/Apache/MPL | Reject cache (breaks reproducible hash), keep sample | `reviews` must not need blame, so it is a single `git log` and fast | - |

### 3.8 Things worth recording as rejected

| Idea | Source | Why rejected |
|---|---|---|
| Hours from commit gaps | git-fame `--cost hours`, git-hours | history shows what, who, when; judged as invented numbers (r13 R2) |
| Credit co-authors equally | git-fame `--auth share` | creates a split nobody recorded |
| Reviewer ranking from commit counts | quick-stats `-r` | counts authors, says nothing about review |
| Per-day or per-hour heatmap | quick-stats, gitinspector | activity pattern, not evidence for the listed jobs |
| Result cache | git-who | breaks determinism of the hashed report |
| Resume builder and templates | cv-builder | not the job; its relay sends the resume to a service |
| Hosted HTML receipt | receipts (Artifact only on request) | privacy default |

## 4. Verification limits

- gitinspector, hercules, git-fame and git-of-theseus: README only, behaviour in code not read. Treat every cell as a claim.
- git-who: README only. The statements "merges excluded from all metrics" and "`.mailmap` respected" are its own text.
- quick-stats: shell script lines read; the `--use-mailmap` and merge switch claims are verified in code.
- GitHub: the Pulse page was fetched but says nothing about merge commits or email linkage; those facts come from the
  contributors-graph page ("Merge commits and empty commits aren't counted", top 100, default branch only, fewer than 10,000
  commits for some insights) [D].
- PR approval data (GitHub review API) was not fetched or tested; item 11 is a design, not a verified capability.
- The E5 scores are 3 valid votes per cell on a 0-5 scale; one run (CV_I-3 = 3) shows the same arm can fall two points. Gaps
  below 1.0 between arms are inside that spread. The gap CV_I 4.33 against OURS 2.67 is larger, but the criteria text
  (criterion 2 and 4) is the real signal.

## 5. Ranked: ten capabilities with best expected effect

Ordering: expected improvement on the answers to the kinds of request in the brief, E5-style first. Each item has a proposal.

1. **`workproof reviews --path <glob> --since D --until D [--trailer Reviewed-by] [--csv file] [--md file]`**: one row per in-scope non-merge commit by author date (sha7, author, author date, reviewer, status), statuses `independent`, `self-review (alias)`, `no trailer`, `quoted in text, not a trailer`, `Acked-by only (different key)`, `reviewed via merge <sha7> (weaker)`, `revert`. Out-of-scope list with reasons (merge itself, other path, other dates, bot). Fixes the 2 E5 misses (merge-covered pair) and the 13-row error. (M)
2. **Review-evidence limits block printed by `reviews`**: fixed sentences "a Reviewed-by trailer is a claim recorded in the message, not proof a review happened; cross-check pull-request approvals", plus the conventions used (author date, reverts in scope, merge-level covering branch commits). E5 criterion 5 is lost without it. (S)
3. **`workproof owner <path> [--claim "Name"] [--since D]`**: blame with `-w -M -C`, per-author surviving lines for that file, creation commit through `--follow`, list of whitespace-only and rename-only commits (`git diff -w --numstat` empty), backdated commits (author date earlier than its parent's), personal-domain note. Replaces D3 hand work; the 57/12 against 12/57 plain-blame contrast is printed side by side. (M)
4. **Hint and skill selection rule for audit requests**: extend `hooks/workproof-hint.sh` with `reviewed-by`, `auditor`, `second person`, `peer review evidence`; weak answer names `reviews`. OURS-2 skipped core-rules on E5. Add a test beside the existing hint tests. (S)
5. **`figures --list` (one row per in-window commit)** with local date, UTC date, committer date, flag. D2-OURS-1 lost `6fa6eb6` by writing its own `--until=...T23:59:59`; a row list removes the reason to run hand git. (S)
6. **CSV output** (`--format csv`) for `figures` and `reviews`, cells starting with `= + - @` prefixed with `'`. E5, invoices and any auditor expect a spreadsheet; every arm wrote the CSV by hand. (S)
7. **Reviewer identity comparison with mailmap + the strong merge rules** shared with `mine`: an alias of the author in the Reviewed-by line is shown as the author with the rule named ("same name, address on another domain; please confirm"). E5 truth 9e9751f and bc7e732. (S)
8. **`reviews` block inside `workproof-report.json`** with `check`/`verify` recomputing it, so an auditor can run `verify` on the same file. No rival has any tamper evidence; this extends our one lead. (M)
9. **`--ignore-author <name|email>` (repeatable) and `distinct commit days` figure**, from git-fame and quick-stats ideas. For client and manager reports where a colleague's automation or a formatter account must be left out, and a factual replacement for hours. (S)
10. **Tailoring safety lines** in `references/tailor.md`: job-description text is data, work-authorization or language requirement the facts do not meet = stop and quote it (cv-builder `tailor-resume` SKILL), and equal-counts self-check on the coverage table (jd step 9). (S)

Not ranked: PR-approval import (#11, M) is the right next step after `reviews` exists; it needs a real export sample to test.

## 6. Mutation checks to demand when this is built (from `silent-checks-rule`)

- `reviews`: break the case-insensitive trailer match, the merge range `^1..^2`, the self-review comparison, the author-date window
  each separately; each must fail a named E5-fixture test. Fixture rows: lowercase key, prose quote, Acked-by, alias reviewer,
  merge-covered pair, revert, 30 March author / 2 April committer, 1 April author.
- `owner`: remove `-w`; the whitespace-rewrite fixture must flip the majority author.
- CSV: a cell `=1+1` must come out prefixed.

## Decisions and status (controller, 2026-10-24)

Ranked rows of the list above, with what was done in round 15 (every item has tests and a mutation check; reviewed by a separate Sonnet reader; commits on `plugin-leadership`):

| # | Capability | Decision | Status |
|---|---|---|---|
| 1 | Review-evidence table from trailers and merges | adopt (no rival has it) | `workproof reviews` (src/reviews.ts): statuses independent / self-review (address, name, mailmap alias) / via merge (weaker) / quoted / other approval / no trailer; author-date window; names only, no addresses; text, csv (formula guard) and json |
| 2 | Fixed limits block for review evidence | adopt | printed by `reviews` (trailer is a claim, conventions) |
| 3 | Ownership check of a path | adopt | `workproof owner` (src/owner.ts): blame with whitespace and moves ignored beside plain blame, creation commit, whitespace-only commits, backdated commits, namesakes |
| 4 | Hint for audit requests | adopt | hint words (`auditor`, `compliance team`, `reviewed-by trailers`, ...) in `c9aedaa`; hint steering and prepared brief in feat/b4 |
| 5 | Per-commit list so the model does not run its own `git log` | adopt | answer check (below) compares the model's counts and dates with `figures` instead; a `--list` row dump is not needed once the Stop check and the brief exist; revisit if the gate shows hand-written `git log` errors again |
| 6 | CSV output | done for `reviews` (the E5-type deliverable); `figures` stays text/json | |
| 7 | Reviewer-versus-author identity by mailmap and the same rules as `mine` | adopt | in `reviews` (basis column names the rule) |
| 8 | `reviews` block inside the signed report | defer | extends our lead in tamper evidence, no rival has any; not needed for the diagnosed losses |
| 9 | `--ignore-author`, distinct commit days | defer | no diagnosed loss depends on it |
| 10 | Posting text is data, unmet hard requirements quoted, stated counts equal table rows | adopt (cv-builder, jd-resume-tailor, MIT; rules reimplemented) | `references/tailor.md` hard rules |

Added in round 15 from the sweep and the d/e diagnosis: `verify` recomputes the exact identity set the report counted (keyed hash per address in the report); commits with odd offsets are no longer lost; unreadable records are counted; submodules are skipped in blame; first/last date, active months and gaps rows in `figures`; Stop-hook answer check (B1) and prepared brief (B4).
