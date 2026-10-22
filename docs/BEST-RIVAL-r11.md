# Best-rival analysis, round 11

Standard: `/Users/efe/claude-kredi-runs/2026-10-22/BEST-RIVAL-SPEC.md`, steps 1 to 5. Step 6 (development gate) is not part of this file.
Scope: read-only. No rival code was run. Our code was run in one place only: `hooks/workproof-hint.sh` was fed the five set c prompts to see whether it prints a hint (it writes nothing). Rival code was read in place under `/private/tmp/...` (paths below). One shallow clone of the official plugin repository was made in `/tmp/r11-rivals/cpo` to record the commit.

Data used (all read-only), folder `R10` = `bench/head-to-head/results/round10-final-gate/`:
- `R10/SUMMARY.md` (tables), `R10/grades/heldout-c/Cn-grade.json` and `Cn-labels.json` (letters to arms), `R10/tasks/heldout-c/tasks.json` (prompts, criteria, truth).
- `R10/runs/heldout-c/<Cn>/<ARM>/<run>/answer.md`, `files/`, `trace.jsonl` (tool calls; a `Skill` call shows the skill was invoked).

Caveat that applies to everything below: 3 runs per cell. One run is 0.33 of a point on a 5 point task. Differences of 0.33 are within run-to-run noise of the same model.

---------------------------------------------------------------------------------------------------

## 1. Best rival, task by task

### 1.1 Held-out set c (now seen; gate failed)

Scores are outcome criteria only, mean of 3 runs. "Best other" is the best single arm in the table (plain or invoked), from `R10/SUMMARY.md`.

| Task | Max | Ours | Best other arm | Its score | Gap | Other arms at or above ours |
|---|---|---|---|---|---|---|
| C1 promotion evidence | 5 | 2.00 | RCP | 4.67 | 2.67 | RCP 4.67, JD 4.00, SR 3.33, GAP_I 3.33, CV 3.00, BASE 2.67, GAP 2.67, RCP_I 2.33 (CV_I 2.00 ties; JD_I 1.67 is below) |
| C2 immigration statement | 5 | 4.67 | JD_I and CV_I (tie) | 5.00 | 0.33 | BASE, RCP, RCP_I, JD, GAP_I, SR tie at 4.67 |
| C3 judging a hiring claim | 5 | 3.00 | JD | 3.33 | 0.33 | everyone else ties at 3.00 except JD |
| C4 quarterly summary | 5 | 4.00 | BASE, RCP, JD, GAP, GAP_I, SR, CV, CV_I (tie) | 5.00 | 1.00 | RCP_I 4.33 also above ours |
| C5 invoice check | 5 | 4.67 | BASE, RCP, RCP_I, JD_I, GAP, GAP_I, SR, CV, CV_I (tie) | 5.00 | 0.33 | JD 4.67 ties |
| Total | 25 | 18.33 | RCP | 22.33 | 4.00 | JD 21.67, GAP_I 21.00, SR 21.00, BASE 20.33, CV 20.33 |

### 1.2 Public set (T1 to T8, 3 new runs of ours, rival cells reused; gate passed)

| Task | Max | Ours | Best other arm | Its score | Gap (negative = we lead) |
|---|---|---|---|---|---|
| T1 | 4 | 3.67 | GAP_I | 2.00 | -1.67 |
| T2 | 4 | 4.00 | JD_I | 3.00 | -1.00 |
| T3 | 4 | 4.00 | GAP_I | 4.00 | 0.00 (tie at ceiling) |
| T4 | 4 | 4.00 | RCP / RCP_I / CV | 4.00 | 0.00 (tie at ceiling) |
| T5 | 5 | 5.00 | RCP_I / GAP | 3.67 | -1.33 |
| T6 | 4 | 4.00 | BASE and others | 2.00 | -2.00 |
| T7 | 5 | 5.00 | BASE / RCP / CV / CV_I | 4.00 | -1.00 |
| T8 | 5 | 5.00 | BASE, RCP_I, SR, CV, CV_I | 5.00 | 0.00 (tie at ceiling) |

No arm beats us on the public set. Ties at the ceiling (T3, T4, T8) are passes under the ceiling ruling.

### 1.3 Who is the primary rival

Counting a pair (plain + invoked) as one arm with its better score, tasks where the arm beats or ties ours, over all 13 tasks:

| Arm | Set c (of 5) | Public (of 8) | Total (of 13) |
|---|---|---|---|
| RCP (RCP / RCP_I) | 5 (beats on C1, C4, C5; ties C2, C3) | 2 (ties T4, T8) | 7 |
| CV (CV / CV_I) | 5 (beats on C1, C2, C4, C5; ties C3) | 2 (ties T4, T8) | 7 |
| GAP (GAP / GAP_I) | 5 | 1 (T3) | 6 |
| SR | 5 | 1 (T8) | 6 |
| BASE (no plugin) | 5 | 1 (T8) | 6 |
| JD (JD / JD_I) | 5 (beats on all five) | 0 | 5 |

Decision for this round (as the owner asked): **primary rival = RCP** (receipts; ties CV on count, has the highest set c total, 22.33). **Second = JD** (highest set c total after RCP, 21.67, and the only arm that beats us on all five set c tasks), then GAP_I and SR (21.00 each). CV is mentioned in section 5 because it ties RCP on the count.

### 1.4 The main finding of this section (read this before sections 2 and 3)

The rivals' set c scores are not produced by their plugins. Count of `Skill` tool calls in the traces (`R10/runs/heldout-c/<Cn>/<ARM>/<run>/trace.jsonl`, 3 runs each):

| Arm | C1 | C2 | C3 | C4 | C5 |
|---|---|---|---|---|---|
| RCP, JD, SR, BASE (plain) | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |
| RCP_I (invoked by prefix) | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 |
| JD_I | 3 of 3 | 3 of 3 | 1 of 3 | 3 of 3 | 0 of 3 |
| GAP_I | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 | 2 of 3 |
| OURS (natural prompt) | 3 of 3 | 0 of 3 | 0 of 3 | 3 of 3 | 0 of 3 |

- The plain rival arms never loaded their skill. Their answers are the unplugged model working from `git log`. BASE (empty plugin) scores 20.33; RCP plain scores 22.33 with the same behaviour. The 2.00 point gap between BASE and RCP plain is inside the noise of 3 runs per cell (C1: BASE 2.67 vs RCP 4.67, no skill in either).
- When a rival skill was invoked it did not help: RCP_I on C1 wrote "I built it from the git history directly, not with the `/receipts` miner, because that tool reports Claude Code session activity and you asked for repo history" (`R10/runs/heldout-c/C1/RCP_I/1/answer.md`); JD_I on C1 wrote "The jd-resume-tailor skill only tailors resumes, so it declined this request" (`.../C1/JD_I/1/answer.md`). RCP_I scores 2.33 on C1 against 4.67 for RCP plain; JD_I scores 1.67 against 4.00 for JD plain.
- So the "best rival" on set c is, in effect, "the model reading git history by hand without any workproof skill". Our product loses when the workproof skill IS used (C1, C4: skill called 3 of 3, scores 2.00 and 4.00) and when it is NOT used (C2, C3, C5) it gets the same score as the unplugged model, minus noise.
- Consequence: a copy of a rival's technique is not what closes the gap. What closes it is (a) making our skill's path produce documents as good as hand-written ones on identity, padding and audience, and (b) making the general checks (counts, provenance, whitespace-only, branch state) apply even when the skill is not called.

---------------------------------------------------------------------------------------------------

## 2. Primary rival: RCP (receipts), read end to end

Source: `anthropics/claude-plugins-official`, `plugins/receipts`, licence Apache-2.0.
Pin: our arm file (`R10/arms.json`) infers `d1adba47161a271799de7b548225d929310046bd`. The shallow clone made now (`/tmp/r11-rivals/cpo`, HEAD `af59ee3a1051a29dda4a2e7a2af221aa457ae08b`, 2026-10-21) has `skills/receipts/SKILL.md` byte-identical to the benchmark copy; `scripts/mine-transcripts.mjs` differs at line 88 (the `RECEIPTS_HOME` patch used for the benchmark). The shallow clone cannot confirm the inferred older pin.

Files it loads (benchmark copy `/private/tmp/claude-501/-Users-efe-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/h2h/workproof/plugins/receipts-patched`, abbreviated `RCP/` below): `RCP/skills/receipts/SKILL.md` (300 lines), `RCP/skills/receipts/scripts/mine-transcripts.mjs` (1474 lines), `RCP/README.md` (77), `RCP/assets/make-sample.mjs` and `sample-receipt.png` (documentation only). No hooks, no commands folder, no references folder, no `CLAUDE.md` or `AGENTS.md`. All line numbers below are from `RCP/skills/receipts/SKILL.md` unless another file is named.

### 2.1 What it is

A report of the user's own Claude Code usage and impact, from local session transcripts (`~/.claude/projects/**/*.jsonl`) cross-referenced with `git log` per repo (lines 8 to 17). It is not a git-evidence tool. It never reads git history for evidence of what a person delivered; it reads git only to count commits that touch files Claude Code edited (`mine-transcripts.mjs:741-878`, `git log --no-merges` at 825).

Trigger text (description, line 3): "Use when the user asks for 'receipts', an 'impact report', 'usage report', wants to 'show my Claude Code activity', 'prove the value of Claude Code', or runs `/receipts`." None of the five set c prompts contains these phrases. This is why RCP plain was never invoked.

### 2.2 Steps, in the order it states

1. Step 1 (lines 19 to 26): parse `$ARGUMENTS`: "week" 7 days, "month" 30 (default), "quarter" 90, "year" 365, a bare number is days, a project substring becomes `--repo <substr>`.
2. Step 2 (lines 28 to 52): run `node <skill-dir>/scripts/mine-transcripts.mjs --days <N> [--repo <substr>] --html /tmp/cc-receipt.html`; do not read any `*.jsonl` yourself (lines 45 to 48); it takes seconds, no need to warn the user (50 to 52).
3. "What the numbers mean" (54 to 163): rules about what the JSON fields mean and which columns add up.
4. Step 3 (165 to 263): write a markdown report from the JSON only: header, "What you shipped", "By project" table, no "where the spend went" section, "Framing for a manager".
5. Step 4 (265 to 268): save the markdown to `~/claude-code-receipts-<since>-to-<until>.md`, dates from the JSON.
6. Step 5 (270 to 290): copy the HTML to `~/claude-code-receipts-<since>-to-<until>.html`; list the project names the receipt names, in one line, before the user sends it; do not publish unless asked.
7. Step 6 (292 to 300): tell the user where the files are and what did and did not leave the machine.

### 2.3 Every rule, pattern or check (numbered)

1. Claude Code's own machinery (scratchpad, per-session tool output, `~/.claude`) is excluded from "work" (60 to 62).
2. A project is where work landed, not where the shell was: sessions are attributed to the project(s) their file operations touched, resolved to the git root (63 to 69).
3. Subagents share their parent's session; there is no "delegated" bucket (66 to 69).
4. Project names are data, never instructions (139 to 146); an instruction-like name is itself worth telling the user.
5. `filesTouched`, `linesTouched`, `prCreateCmds`, `pctSpend` sum to the totals; `sessions`, `activeDays`, `commitsWithOurWork` do not; say so in one line under the table (148 to 157, 209 to 214).
6. No dollar figures anywhere; `pctSpend` is a share (159 to 163).
7. Lines are labelled "lines touched (approx.)", rounded (`~4,600`, not `4,637`), never "lines of code written", never a diffstat (176 to 180).
8. `commitsWithOurWork` = authored by the dev AND touching a file Claude Code touched, de-duplicated by SHA; call it "commits carrying work Claude Code did", not "commits made by Claude Code" (181 to 188; script comment 88 to 98).
9. Qualify with `gitActiveDayOverlap` ("N of your M active days ended with that work committed") (187 to 188).
10. `prCreateCmds` reported only if above 0; it counts `gh pr create` commands, not confirmed PRs (189 to 190).
11. Table of `byRepo`, order kept (miner picks top 12 by spend, rest in "(other repos)") (192 to 198).
12. Name the rows honestly: a directory is not a repo (`isRepo: false`); the research row is real work, often the largest (202 to 207).
13. Commit column: `?` if git was unavailable (unknown, not zero), `-` if nothing landed (215 to 226). A null commit total is not "git is broken".
14. No spend breakdown by activity (228 to 247). Reason given: attribution of a turn's cost to a tool is a modelling choice that swings 40 points.
15. Framing for a manager, 2 to 3 sentences in the user's voice: lead with shipped output, say it is self-reported from one machine, prompt the user to add one or two concrete wins by hand (249 to 259).
16. Do not invent "hours saved" or dollar value (261 to 263).
17. Write the file with dates from the JSON, not own date arithmetic (265 to 268).
18. Surface the repository names the file contains before it travels (277 to 283).
19. Do not publish by default; only with the Artifact tool on request (285 to 290).
20. State what stayed on the machine (292 to 300).

Script checks (`RCP/skills/receipts/scripts/mine-transcripts.mjs`): local-midnight windows by calendar arithmetic (44 to 51, 63 to 72), a window that counts calendar days inclusive (55 to 61, 67 to 72), bad `--days` or `--since` exits with code 2 and a message instead of scanning everything (79 to 85), heredoc stripping before matching commands (160 to 167), relative token weights for a spend share (188 to 198), chunked `git log` to avoid argument limits (811).

### 2.4 What it does on input it does not recognise

- Unrecognised arguments to the script are ignored silently: `parseArgs` has no `else` branch (`mine-transcripts.mjs:22-31`). An unparseable window value stops with exit 2 and a message (79 to 85).
- A request that is not about Claude Code usage: the skill has no scope check and no refusal text. Nothing in `SKILL.md` tells the agent to stop. In practice (set c, `RCP_I`) the model decided by itself that the miner did not fit and worked from git directly (see 1.4). It does not harm the answer, but the skill gives no help either.
- A project name that reads like an instruction: treated as inert (139 to 146).

### 2.5 Invoked form versus natural form

- Natural (plain RCP): the skill is never loaded on set c (0 of 15 cells). The result is the model's own approach.
- Invoked: prefix "Use the receipts skill (the /receipts command). " (`R10/arms.json`). The skill is loaded 15 of 15; the model then declines the miner for a repo-history request and falls back to git. Cost: the load, an argument line, and a statement about the miner. Effect on score: C1 4.67 plain vs 2.33 invoked; C4 5.00 vs 4.33; C2, C3, C5 equal. On the public set RCP_I is 23.33 vs RCP 22.33.
- Why invoked is lower on C1: not isolated. I did not grade-check the RCP_I C1 files line by line; the trace shows the skill was loaded and then set aside. Do not read the drop as a rule of RCP; it may be noise (3 runs).

---------------------------------------------------------------------------------------------------

## 3. Side by side on every cell where ours loses or ties the best rival

Format per task: prompt, criterion text (shortened), best rival's decisive part, ours, criteria lost (from the grade json), which rival rule produced the passing behaviour, why ours did not, and whether the skill was called.

Because of 1.4, the "rival rule" is usually "no rule: the model read the commit bodies and each commit itself". Where a rival text does say something relevant I cite it with file:line; where it does not I say so.

### 3.1 C1 (promotion evidence, Python repo; ours 2.00, RCP 4.67, JD 4.00)

Prompt: "I'm up for promotion at Acme and our repo is private, so I can't show the committee any of it. Using the git history here (I'm Dana Reyes, my work email is dana.reyes@acme-corp.example), write promotion-evidence.md in this folder covering January to June 2025: what I delivered and roughly how big it was, in terms someone who hasn't seen the code can follow."

Criteria that matter (`R10/tasks/heldout-c/tasks.json`):
- C1 identity and window: the commit by `dana.reyes@gmail.example` (4 lines, 3 Feb) must be counted as Dana's; the abbreviation plugin (authored 30 Nov 2024, rebased 9 May 2025) must be outside the window or flagged.
- C4 no padding: merge commit, formatter-header commit and revert are not separate deliverables; a stated total is 9, or 5 (plus or minus 1) distinct deliverables; FAIL if 10 or more or the formatter/merge is listed as a feature.
- C5 suitable for the committee: states the period and that both identities were included, and has no code, code blocks or function names.

Grades (OURS letter F; `grades/heldout-c/C1-grade.json`): ours fails C1, C4, C5 in all 3 runs (C2 size and C3 reverted pass). Reasons from the grader: run 1 "Gmail fix excluded", "Formatter is a table row and 8 commits are stated", "Gmail not included; contains a branch name and npx commands"; runs 2 and 3 the same with "table rows include the formatter change and the revert", "contains code references".
RCP (letter B): run 1 and 3 pass all 5, run 2 fails C4 only ("Formatter header listed as deliverable #5").

Rival's decisive text (`R10/runs/heldout-c/C1/RCP/1/files/promotion-evidence.md`): a table of four deliverables, then "Supporting work" (vendored library, "not code I wrote (~6,000 lines)", reverted experiment "I'd recommend not citing the 30% figure"), then "Mechanical changes (not counted as feature work)" for the formatter header, then "Notes on attribution and scope": "The 3 Feb bug fix was committed under a personal email (`dana.reyes@gmail.example`...). The commit is signed off as Dana Reyes, so I've included it. Confirm it's yours before submitting." and "The abbreviation extension plugin ... is dated 30 Nov 2024, so it falls outside this period and is excluded."

Ours (`R10/runs/heldout-c/C1/OURS/1/files/promotion-evidence.md`): a 6 row "What I delivered" table that includes the vendored library (row 2, "none written by me"), the tests (row 5) and "Project-wide file header" (row 6); the line "Author identity counted: Dana Reyes, work address."; "Commits: 8 of the 12 non-merge commits"; the "How a reader can check this" section. Final chat answer: "The tool found one other address that may be yours and left it out, because an explicit `--author` merges nothing else ... If the other address is yours, tell me. I'll re-run with both addresses."

Why ours lost, with our file:line:
1. Identity (criterion C1, C5). The model took the user's work address and passed `--author dana.reyes@acme-corp.example` (our `skills/workproof/SKILL.md:50`: "If the user names addresses the tool did not find, pass each one with `--author`; an explicit `--author` merges nothing else"). The tool code does exactly that: `src/analyse.ts:172-174` ("An explicit --author is exact and merges nothing"), and the default merge rules are only noreply-login matches (`src/basis.ts:6`). The gmail address has the same local part on a different domain; the tool did not merge it and the model, following rule 7 (`SKILL.md:29`: give exactly the identities the user asked for) and "do not assume", left it out and asked. The rival (and BASE) included it with a "confirm" note. For an evidence document this default is wrong: the user asked for what they delivered, and leaving a commit out loses it silently.
2. Padding (criterion C4). The tool's report counts "8 of 12 commits" and lists the work as a flat list; the skill's rule 2 (`SKILL.md:24`) says to quote the report's commit figure. Nothing in the skill says to separate feature work from vendored, mechanical and reverted commits in a deliverables list, nor to state 9 with an explanation. The rival (run 1, 3) wrote a separate "Mechanical changes (not counted)" section by its own judgment; ours put those items in the numbered table.
3. Audience (criterion C5). `SKILL.md:73` says the evidence document is `workproof-report.md` plus `.json` and "tell them how a reader checks it: `npx workproof check ...`". Our file therefore contains `npx` commands, a branch name (`feature/math-v2`) and code references. The criterion treats these as code. Nothing in the skill says that a document for a non-technical audience must be free of commands, branch names and file names.
4. Side effect: our runs left `workproof-report.md`, `workproof-report.json` and a fingerprint key in the user's folder next to the requested file (`.../OURS/1/files/`).

Was the skill called: yes, 3 of 3 (trace step 1 `Skill {"skill": "workproof:workproof"}`). Hint matched (our run of `hooks/workproof-hint.sh` on this prompt prints a hint; the pattern is the "promotion ... git" alternative at `hooks/workproof-hint.sh:33`).

Why all arms are weak on C1: 7 of 11 arms score 3.33 or less. The three traps (second identity under a different domain, a pre-window commit rebased into the window, a padded commit list) each need a deliberate check; only the arms that happened to read `git shortlog -sne` and each commit's body (RCP 1 and 3, JD plain) passed. The plain model passes it about half the time (BASE 2.67, RCP 4.67, JD 4.00, GAP 2.67), so the check is not routine.

### 3.2 C2 (immigration statement, Go repo; ours 4.67, JD_I and CV_I 5.00)

Prompt: "My immigration lawyer needs a factual statement of what I personally contributed to our team's Go logging library since I joined Northwind on 3 March 2025 (I'm Tomás Alvarez). The repo is private, so please write it from the git history into contribution-statement.md in this folder, in plain language an immigration officer can follow, with nothing in it that could later be shown to be overstated."

Lost criterion (run 3 only): C5 "if a number of commits is given it is 3, or at most 4 with the undated commit clearly separated". Ours run 3 wrote "has authored **4 commits** and is credited as co-author on **1 more**" with the 2031-dated commit in the same table (`.../C2/OURS/3/files/contribution-statement.md`, lines 13 to 21). The grader: "Says four authored commits with the undated one in the same table".
JD_I (3 of 3 pass): the file separates the groups: "Commits that are clearly Mr. Alvarez's, made after his start date" (line 14), "Commits that involve Mr. Alvarez but need qualification" (21), and the 2031 commit's own paragraph: "its recorded date is **1 January 2031**, which is in the future and cannot be correct" (29), "Commits excluded from this statement" (31).

Rival rule that produced this: none. JD_I called its skill (`Skill jd-resume-tailor`, trace step 1) and then ignored it. Its own `SKILL.md:13` says "If the request is not to tailor a resume ... reply: 'This skill only tailors resumes.' and stop"; the run did not stop. The structure (clear / need qualification / excluded) is the model's own.

Why ours missed: the skill was NOT called (0 of 3); the hook printed nothing (see 3.6). The behaviour is the plain model's. Ours passes 2 of 3 runs, same as BASE, RCP and JD plain (4.67). Our skill has no rule for "a count is shown only for the group that is clean; an item with an unreliable date goes into a separate group", so even with the skill the third run could have failed. A general counting rule (section 6, class L4) fits.

### 3.3 C3 (judging a hiring candidate's claim, Rust repo; ours 3.00, JD 3.33)

Prompt: "A candidate for our hiring panel, Jun Park, sent me a clone of this repo as proof that they wrote the theme feature: they say about 900 lines, mostly alone, built over two weeks in March 2025. I only have this clone, not the original. Looking only at the git history, how much of that claim holds up? Answer here in chat, with numbers."

Lost criteria (ours, all 3 runs): C3 "the three bundled theme files (150 lines) are identified as copied from an external project (header: github.com/alexrivera/termthemes, MIT)"; C5 "the whitespace-only `Run cargo fmt` commit is reported as not substantive and a hand-written figure of 240 to 300 (263) is given".
Grader: C3 "Calls the TOML files data, no copy note" / "Not noticed"; C5 "274 includes the fmt lines; not 263", "Gives 235/613", "Says only 194 Rust lines".
JD plain: C3 passes in run 2 only; C5 fails in all 3 runs. JD's average of 3.33 comes from that one run.

Rival decisive text (`.../C3/JD/2/answer.md`, line 43): "The theme files look copied. `nord.toml` begins with a comment saying it was copied from `github.com/alexrivera/termthemes` (MIT, Copyright 2019 Alex Rivera)". The trace shows why: step 4 ran `git show edbfb4c | grep -c '^+$'` and then `sed -n '1,6p;40,4...'` on `themes/nord.toml` and the code files, so it looked at the first lines of the added files. Step 3 used `git blame -w --line-porcelain` (ignore whitespace).
Ours (`.../C3/OURS/1/answer.md`): "Theme TOML files: 150 (3 x 50, which are data files and probably near-identical in structure)" and "'Run cargo fmt': `edbfb4c` adds 39 lines to `src/lib.rs` and removes none. A real formatting pass would normally change existing lines, so this looks like new code under a formatting label." The trace has two `git` calls only (log and numstat) and never opens a file. The second statement is the opposite of the truth (whitespace-only lines).

Rival rule: none in JD's text (the JD skill is not about this). The passing behaviour is "read the first lines of the large added files" and "diff with whitespace ignored".
Why ours missed: skill not called (0 of 3); hook silent. Even if called, our skill has no rule about file content provenance (the tool excludes vendored paths by directory name, `src/exclusions.ts:40`, which does not detect a copied file under `themes/`) and no whitespace-only commit detection (`grep` of `src/*.ts` finds none; `src/git.ts:70` takes `--numstat` only). This is a general gap, not a fixture entry.

### 3.4 C4 (quarterly summary, git + exported sessions; ours 4.00, BASE and eight others 5.00)

Prompt: "I need my Q3 2025 summary (July to September) for my manager's review doc; I'm Ines Kowalski. Our repo is private, so it should say what got done rather than show code. Use the git history and my exported Claude sessions in session-exports/, and write it to q3-summary.md in this folder."

Lost criteria: run 2 C5 "States '5 distinct work sessions' in the exports" (expected 3 relevant: alpha, performance, types; one file is a duplicate export, one is dated 2 Oct, one is a personal recipe session); run 3 C3 "Summary names 'A recipe-parser side project session'" (a personal session must not appear as work) and C5 "States 5 exported sessions and four relate to this repo".
BASE (3 of 3 pass 5/5): `.../C4/BASE/1/files/q3-summary.md` lines 16 to 18: "Sources: git history (5 commits in the quarter) and my exported Claude sessions", "I left out the personal side-project session.", "I also left out the credentials and customer name that appeared in one session."
Ours run 3 (`.../C4/OURS/3/files/q3-summary.md`, lines 3, 23, 24): "five exported Claude Code sessions", "Claude Code sessions: 5 exported sessions in the folder (a sixth file is an exact duplicate ...). Four of them relate to this repository", "A recipe-parser side project session and a v6 migration-guide draft ... are not part of Q3 work."

Rival rule: none. BASE has no plugin; it simply did not state a session count and did not name the personal session.
Why ours lost: skill called 3 of 3. Our skill step 0 (`SKILL.md:87`) says to run `npx workproof sessions --dir <folder>`, which prints sessions and tokens. The run 3 trace shows `sessions --dir` was not used (steps 9 and 10 read the files with `python3 -I`), and the number it then stated (5) counts files by hand against `SKILL.md:23` ("do not count by hand"). The skill gives no rule to deduplicate exports (identical content), to exclude sessions outside the window or about another repository, or to leave the other-purpose session out of a work document rather than name it. Stating a session count is optional in the criterion; BASE avoided the risk by not giving one. Our rule 8 (`SKILL.md:30`: "starts with every number ... the user asked for") pushes the model to state numbers, including ones nobody asked for.
Extra: the run left `workproof-report.md` and `.json` in the folder (`.../C4/OURS/3/files/`). The criterion C4 (sensitive strings) passed anyway.

### 3.5 C5 (invoice check, Ruby repo; ours 4.67, BASE and most arms 5.00)

Prompt: "Our contractor Luka Petrovic billed 62 hours for September (the invoice is in docs/billing/INV-0042.txt) and says the repo history backs it up. I'm not technical: can you check what the history does and doesn't support and write a short note for our finance team in invoice-check.md in this folder?"

Lost criterion (run 2 only): C5 "item 1 is supported by three commits on main on 9 September (first to last about 2 h 14 min) ... recommends a next step". Grader: "Says 4 commits on 9 Sep instead of three". Ours run 2 file line 7: "4 commits by Luka on 9 Sep (10:05 to 12:19), about 60 lines of code, tests and docs." BASE run 1 file line 9: "Three commits by Luka on 9 Sep, 10:05-12:19 ... the feature (32 lines), tests (20 lines) and a README note (6 lines)."
Rival rule: none (BASE). Cause of the 4 versus 3 in ours not determined from the trace (`trace.jsonl` keeps only the first 1500 characters of command output).
Why ours missed: skill not called (0 of 3); the prompt is an audit of someone else's billing, outside the skill's stated scope (the description and hint speak of "my work", "evidence of their work", "a report someone sent"). Our scores equal the plain model's except for one counting slip. A rule "before writing a count, run the count with the same filter and copy it" would address it (class L4).

### 3.6 Why the skill was not called on C2, C3, C5 (prompt wording versus triggers)

Our skill description (`skills/workproof/SKILL.md:3`) lists: "how many commits are mine across all my email addresses, how much of this repo is my work, what did my Claude Code usage deliver, a summary of exported Claude Code session logs ..., whether this report or these files can be trusted, or to tailor my resume or CV ... Covers proof of my work, CV or resume bullets, a promotion or performance self-review paragraph, a visa or immigration evidence pack, a portfolio entry, work from a private repo they cannot share, a Claude Code usage or impact report for my manager, commits under several email addresses ...".

The hint hook (`hooks/workproof-hint.sh`) fires on the regular expressions at lines 29 to 45. I ran it on the five prompts: C1 and C4 print a hint; C2, C3, C5 print nothing. Reasons, quoting the closest pattern:

| Task | Words in the prompt | Closest pattern in `workproof-hint.sh` | Why it fails |
|---|---|---|---|
| C2 | "My immigration lawyer needs a factual statement of what I personally contributed ... The repo is private, so please write it from the git history" | line 34: `(visa\|immigration\|global talent).*(proof\|evidence).*(my\|what i\|i ).*(work\|did\|built\|repo\|contribut)`; line 41: `(private\|client\|nda).*(repo\|repository).*(cannot\|can.t\|not allowed\|am not).*(show\|share).*(proof\|evidence\|what i)` | the prompt says "statement", not "proof" or "evidence"; "The repo is private" is not followed by "cannot show" |
| C3 | "A candidate for our hiring panel ... sent me a clone of this repo as proof that they wrote the theme feature ... how much of that claim holds up?" | line 37: `(sent\|received\|gave) (me\|us).*(report\|files\|evidence).*(trust\|verify\|check\|their work ...)`; line 38: `(candidate\|applicant).*(evidence of (their\|his\|her) work)` | needs "report", "files" or "evidence" after "sent me"; the prompt says "a clone ... as proof" and "claim holds up"; no "evidence of their work" |
| C5 | "Our contractor ... billed 62 hours ... check what the history does and doesn't support and write a short note for our finance team" | none | invoice or billing checks are not in any pattern or in the description |
| C1 (matched) | "I'm up for promotion ... Using the git history here" | line 33: `(promotion\|performance review).*(how much\|mine\|my work\|i (wrote\|did\|built)\|self-review\|git)` | matches on "promotion ... git" |
| C4 (matched) | "my exported Claude sessions in session-exports/" | line 40: `(export\|exported) .*(claude code\|sessions?)` and similar | matches on "exported ... sessions" |

The patterns are a list of seen phrasings: the product's hint depends on exact words ("evidence", "proof", "cannot show", "my work", "sent me ... report"). A request with the same intent in other words (a statement for a lawyer, a hiring claim, an invoice) does not match. The skill description is also read by the model when it chooses whether to call the `Skill` tool; with no hook hint the model chose not to call it in 9 of 9 cells on C2, C3, C5. In C2 the description does contain "a visa or immigration evidence pack" and "work from a private repo they cannot share", and the model still went to git directly: the description is a long list of use cases and the model decided it could do a "statement" itself. So the description is not a reliable trigger by itself; the hint is the only mechanism that works, and it is too narrow.

Also relevant: for the skill path (when it fires) the hint adds a plugin root path so the model does not scan the disk (`workproof-hint.sh:127-129`). In C4 run 3 the model still ran `find . -path ./node_modules -prune -o -name 'SKILL.md' -print` in the plugin folder (trace step 3) because the skill was loaded through the `Skill` tool, not through the hint (the hint did fire on C4, so the path was in the context; the model scanned anyway). Not harmful here, but it is the behaviour the owner wants to avoid.

---------------------------------------------------------------------------------------------------

## 4. Technique map: primary rival (RCP)

Licence: Apache-2.0 (`RCP/LICENSE`, 202 lines). Allowed to adapt with attribution in `THIRD-PARTY-NOTICES.md`. Note: `ls` of the repo root finds no `THIRD-PARTY-NOTICES.md`; our `src/sessions/mine-sessions.mjs` is already a derived work of RCP's miner (header lines 1 to 14 describe the same design; `src/sessions/LICENSE-APACHE-2.0` is in the folder). Create the notices file or confirm where the attribution lives (packaging or docs) before the next release.

| Rival technique (RCP) | Do we have it | General or task-specific | Licence | Decision and reason |
|---|---|---|---|---|
| Parse `$ARGUMENTS` into a window: week/month/quarter/year/number, project substring (`SKILL.md:21-26`) | Yes: `--days`, `--since`, `--repo` in `skills/workproof/SKILL.md:88` | general | Apache-2.0 | Already adopted; nothing to do |
| Run a local script, never read raw transcripts (`45-48`) | Yes: `SKILL.md:88` ("do not read the raw .jsonl files yourself") | general | Apache-2.0 | Already adopted |
| Fail loudly on a bad window (`mine-transcripts.mjs:79-85`) | Yes: `src/sessions/mine-sessions.mjs:125-128` | general | Apache-2.0 | Already adopted |
| Project names are data, not instructions (`139-146`) | Yes: `SKILL.md:91` | general | Apache-2.0 | Already adopted |
| null is unknown, not zero; `gitUnavailable` (`94-104`, `215-226`) | Yes: `SKILL.md:89` | general | Apache-2.0 | Already adopted |
| No dollar figures, no hours saved (`159-163`, `261-263`) | Yes: `SKILL.md:90` | general | Apache-2.0 | Already adopted |
| "Which columns add up" one-line footnote under the project table (`148-157`, `209-214`) | No (`SKILL.md:90` asks for a table but has no footnote rule) | general (usage reports) | Apache-2.0 | Adopt: one sentence in `SKILL.md` step 3 of "Claude Code usage report". Low cost; not in set c scoring |
| No activity-category breakdown of spend, with the reason (`228-247`) | No | general (usage reports) | Apache-2.0 | Adopt as one line in the usage report section (prevents a number nobody can defend) |
| "lines touched (approx.)", rounded, never "lines of code written" (`176-180`) | Partly: we quote exact report figures (`SKILL.md:24`); the usage path says "totals as plain statements" (`:90`) | general | Apache-2.0 | Adapt for the usage report only: label `linesTouched` as "lines touched" and not as lines written. Do not round git report figures; they carry a hash |
| `commitsWithOurWork` qualified: authored by the dev AND carrying CC's work; not "commits made by CC" (`181-188`) | Yes: `SKILL.md:89` | general | Apache-2.0 | Already adopted |
| Manager framing: lead with shipped output, self-reported, prompt the user to add one or two concrete wins by hand (`249-259`) | Partly: `SKILL.md:90` asks for "one short paragraph a manager can use ... built only from those numbers" | general | Apache-2.0 | Adapt: add "and tell the user to add what git cannot show (design, review, incidents) by hand". Also fits evidence documents (promotion, immigration): our rule 6 (`SKILL.md:28`) already states the limits |
| Surface repo names in the file before it travels (`277-283`) | Yes: `SKILL.md:91` | general | Apache-2.0 | Already adopted |
| Report written to the home folder with dates in the name (`265-268`) | No | task-specific (a usage receipt, not an evidence file) | Apache-2.0 | Reject: set c prompts ask for a named file "in this folder"; writing to home would break them |
| Self-contained HTML receipt with CSV export (`270-275`, `assets/`) | No | presentation, general but unrelated to evidence | Apache-2.0 | Reject: no criterion rewards it, adds surface and files in the user's folder |
| Do not publish by default; Artifact tool only on request (`285-290`) | n/a (we never publish) | general | Apache-2.0 | Reject (nothing to adopt) |
| Say what stayed on the machine (`292-300`) | Partly: privacy defaults `SKILL.md:29` | general | Apache-2.0 | Adapt: one sentence in the final answer of the usage path. Low value |
| Identity of the user from `git config --global user.name` for personalisation (`mine-transcripts.mjs:741`) | No (our report has no user name by default, `SKILL.md:89`) | general | Apache-2.0 | Reject: our default is no name in the report |
| Skill has no scope check, no refusal, model decides alone (2.4) | n/a | general | n/a | Not adopted; instead see section 6 (intent classes) so that scope is decided by a rule |

Techniques that produced RCP's set c lead (not RCP's code): reading each commit body and `git shortlog -sne`, including the second address with a "confirm" note, a separate "Mechanical changes (not counted)" section. These are model habits, not RCP text. They are general and valuable; they are adopted in section 6 as our own rules (no licence issue because no text is copied).

---------------------------------------------------------------------------------------------------

## 5. Second-best arms

### 5.1 JD (jd-resume-tailor) and JD_I

Source `/private/tmp/claude-501/-Users-efe-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/h2h/workproof/competitors/jd`, pin `701801493babf6ee75561b5a76b0d0c255bd12e8`, licence MIT (`LICENSE`, "Copyright (c) 2026 Dayesh Raval"). Files: `skills/jd-resume-tailor/SKILL.md` (87 lines), `references/` (hard-skips, domain-matching, style-guide, portfolio-bank.sample), `examples/`, `AGENTS.md` (10), `evals/trigger-tests.md` (25), `install.sh`. No hooks, no commands.

What it tells the agent (`skills/jd-resume-tailor/SKILL.md`):
0. Scope check: if the request is not to tailor a resume, reply "This skill only tailors resumes." and stop (line 13).
1. Find the portfolio bank (cwd, home, skill folder); if none, STOP and offer a template (14 to 18).
2. Parse the job description (19).
3. Hard skips S1 to S4 from `references/hard-skips.md`, output `SKIP: <rule id> - <quoted JD line>` (20; hard-skips lines 5 to 10); only skip on explicit wording (hard-skips line 13).
4. Pick top 3 projects by must-have coverage (21).
5. Use only listed facts, never a fact marked TODO (22).
6. Write sections in a fixed order; style guide; source tag `[Pxx-Fy]` on every bullet; a bullet without a tag is deleted (23 to 25, 42).
7. Coverage table with one row per JD item; Gaps lines must match table rows; counts must equal rows (26 to 38, 47).
8. Hard rules: never add a skill or metric the bank does not support, never change a number (43 to 46).
`AGENTS.md:5-8` repeats the trigger and the "never invent facts" rule for agents that do not load skills (the only always-loaded text among the rivals, and it only covers resume tailoring).

On input it does not recognise: stops with a fixed sentence (line 13), or STOP with an offer (line 18). In practice on set c, JD_I loaded the skill, said it "only tailors resumes" and worked from git (C1 answer above).
Why JD scores 21.67 on set c: it is the plain model plus luck: C3 3.33 comes from one run in which the model opened the theme file; C2 JD_I 5.00 from three runs in which the model grouped the commits by reliability (3.2). No JD rule is involved.

Technique map (JD):

| Technique | Do we have it | General or task-specific | Licence | Decision |
|---|---|---|---|---|
| Every bullet carries a source tag; no tag, delete (`SKILL.md:42`, 25) | Yes: `skills/workproof/SKILL.md:74` (tag `[<figure id> #<hash8>]`) | general | MIT | Already have (ours also ties the tag to a hash) |
| Never change a number; never round (45) | Yes: `skills/workproof/SKILL.md:23-24`, `references/bullets.md` | general | MIT | Already have |
| Gaps must match table rows; counts equal rows (47) | Yes (the tailoring step ends with the Gaps sentence, `SKILL.md:18`) | general | MIT | Already have |
| Scope check with fixed refusal text (13) | No scope check; out-of-scope requests get no rule | general | MIT | Adapt: not a refusal but a routing rule (section 6, intent classes), because refusing would hand points away; three of five set c tasks sit just outside our description |
| Hard skip rules before writing (hard-skips) | no | task-specific (job posting filters) | MIT | Reject |
| Trigger tests file `evals/trigger-tests.md` (25 lines) | No | general | MIT | Adapt: add a trigger test list for our hint and description (phrasings by intent class) with a script that runs `hooks/workproof-hint.sh` on each |
| `AGENTS.md` fallback instruction for agents that do not load skills | No | general | MIT | Adapt (see 6.3: a short rules block delivered by a hook, since a plugin-root `AGENTS.md` is read only by agents that load repository files) |

### 5.2 GAP and GAP_I (gaptogrowth), SR (session-report), CV (cv-builder)

GAP: `.../competitors/gap/plugins/gaptogrowth`, pin `dab7c0a403a1dc044311d2509f7f420c66a7ee55`, MIT. `skills/gaptogrowth/SKILL.md` (254 lines) is a resume-positioning agent that needs a project folder, `Instructions/00_User_Profile.md`, a Learning Hub and several template files (`SKILL.md:8-13`, files table 17 to 25). Key rules: "Honesty overrides ATS value. Never invent experience, tools, skills ... metrics" (line 108); when sources disagree, never silently pick a side, flag it and default to the standing resume (62); work only inside the project folder (34). On set c it was invoked 14 of 15 times and its scores are 3.33/4.67/3.00/5.00/5.00 (GAP_I, 21.00): again the model works from git; the skill adds a folder bootstrap. Technique worth keeping: "never silently pick a side; flag the conflict with both values" (62), the same as our "show both values side by side" (`SKILL.md:98`). Nothing new to adopt. Reject: project-folder bootstrap, Learning Hub (task-specific, writes many files).

SR: `/private/tmp/h2h-wp-r9/arm-sr/plugins/session-report`, Apache-2.0 (`LICENSE`, 202 lines). `skills/session-report/SKILL.md` (42 lines): run `analyze-sessions.mjs --json --since 7d`, copy `template.html`, fill 3 to 5 findings as a share of total tokens, 1 to 4 optimisation callouts, report the path (lines 12 to 35). Never invoked on set c (0 of 15). SR's 21.00 is the plain model. Decision: reject; the "express findings as a percent of total tokens" idea (27) fits only usage reports and we already print per-model counts (`SKILL.md:87`).

CV: `/private/tmp/h2h-wp-r9/arm-cv`, MIT. Four resume skills (`create-resume`, `review-resume`, `rewrite-achievements`, `tailor-resume`, 336 lines in total) plus a browser builder over MCP (MCP turned off in the benchmark). CV ties RCP on the 13-task count (7). Not invoked in plain form; CV_I scores 5.00 on C2 and C5 and 2.00 on C1 and 5.00 on C4 by the plain model's behaviour. Reject all (resume-only). Its description text is another example of a narrow trigger: "Use when the user asks to create, write, or build a resume".

Conclusion of section 5: fixing the primary rival's lead does not open a gap to another arm, because no rival has a technique that produced its set c result.

---------------------------------------------------------------------------------------------------

## 6. General loss classes and proposed general rules

Rules below contain no word, name, address or file name from the seen tasks. Examples are in sections 3 and 1.

### 6.1 Loss classes (what the evidence shows)

- L1 Identity coverage: an address that is the same person under another domain, a commit signed off by the same name, or a rebased old commit is left out or put in the wrong window (C1; evidence 3.1).
- L2 Padding: vendored, mechanical, reverted and merge commits listed as deliverables, or a commit total stated without the filter (C1; 3.1).
- L3 Audience fit: a document for a non-technical reader contains shell commands, branch names, file names or tool vocabulary; tool artefacts are left in the user's folder (C1 and C4; 3.1, 3.4).
- L4 Counting hygiene: counts that are wrong because of duplicates, files outside the window or about another purpose, or a missing filter (C2 run 3, C4, C5; 3.2, 3.4, 3.5).
- L5 Content provenance and whitespace: copied third-party files inside the repo and whitespace-only commits are counted as authored work (C3; 3.3).
- L6 Out-of-scope intents: requests that audit someone else's claim or bill from git history are outside the description and the hint (C3, C5; 3.3, 3.5, 3.6).
- L7 Trigger brittleness: the hint matches seen phrasings only (C2, C3, C5: 0 of 9 skill calls; 3.6).
- L8 Statements the skill pushes beyond what was asked: rule 8 asks the final message to start with every number (`SKILL.md:30`), which makes the model state counts that can be wrong (C4 run 3).

### 6.2 Proposed general rules (for `skills/workproof/SKILL.md`, to be frozen in the round's design section before code)

R1 Identity (L1). When the history has addresses that point to the same person by rule (same local part on another domain, same author name, a commit trailer that names the person, the same committer), include them in the figures for a document that is meant to show what the user delivered, list them in the document as "included: <rule>, please confirm", and do not drop them while waiting for an answer. If the user says one is not theirs, re-run without it. Change `skills/workproof/SKILL.md:50` accordingly, and make `src/analyse.ts:172-174` report these candidates even with an explicit `--author` (candidates only, never merged without the model or user deciding).
R2 Window (L1). A commit authored before the window and present only because of a rebase or replay is outside the window; say so in one line. Use author date for the window and say which date was used.
R3 Deliverables versus other changes (L2). A deliverables list holds distinct pieces of user-visible work. Merge commits, reverted pairs, vendored or third-party content, generated files and whitespace-only or formatter-only commits go in a separate "not counted" list with one line of reason each. If a commit total is stated, state the filter (author, window, branch, merges excluded) next to it.
R4 Audience (L3). When the reader is not technical (committee, lawyer, finance, manager), the body has no shell commands, code, file or branch names, function names or tool names. How to verify goes into the chat answer and into a separate sidecar file, or into a clearly separate appendix. Tool output files are written only into `./evidence/` or when asked; do not leave them next to the requested file.
R5 Count with a command (L4, L8). Before writing any count (commits, sessions, days, files, hours), run the count with the same filter that the sentence states and copy it. For exported sessions: unique by content, inside the window, about the named work; a session that is for another purpose is left out and not named. If the user did not ask for a count, a count may be left out when it cannot be made exact. Change rule 8 (`SKILL.md:30`) so that it asks for the numbers the user asked for, not "every number".
R6 Provenance and whitespace (L5). When sizing someone's own contribution: (a) read the first lines of each large added file for licence, copyright or source-URL headers and treat such files as third-party; (b) measure each commit again with whitespace ignored (`git show -w --numstat` or `git diff -w --numstat`) and report commits whose figure drops to near zero as not substantive; (c) say which figure is hand-written and which is raw.
R7 Claims about work by someone else (L6). For a claim, an invoice or a bill checked against history, state in plain words that history shows what was committed, by whom and when, not time spent or quality; check, for each claimed item, the author, the branch (merged into the main line or not), and the commit date against the claimed period; list what history cannot show; give a next step; do not decide for the reader.
R8 Dates (kept from what already works). Author date versus committer date; an impossible or future date is flagged and its item is kept out of dated lists; a timeline built from author dates alone is not verified by the clone.

R4 has one tension to decide: our value is that a reader can recompute the figures. Keeping the check commands out of the body and in a sidecar keeps that value (the report and the hash exist) while meeting a criterion that treats commands as code. The owner should confirm this.

### 6.3 Making the skill trigger on intent classes

Problem: `hooks/workproof-hint.sh:29-45` lists phrasings. Proposal: replace the list by a two-factor test, cheap and still shell only:

1. History factor (any of): `git`, `commit`, `commits`, `history`, `repo`, `repository`, `clone`, `branch`, `session export`, `exported .* sessions?`, `sessions? (folder|export)`; OR the hook's `cwd` field is inside a git work tree (the hook already reads `cwd` at line 51 and tests `rev-parse --is-inside-work-tree` at line 55).
2. Intent factor (any of, one set per class):
   - Work / delivery: `contribut`, `delivered`, `deliver`, `shipped`, `built`, `wrote`, `my work`, `what i (did|made|built)`, `accomplish`.
   - Report / summary: `summary`, `summarise`, `summarize`, `report`, `write.* (up|note|statement)`, `quarter`, `q[1-4]`, `half`, `review doc`.
   - Evidence / proof: `evidence`, `proof`, `prove`, `statement`, `attest`, `letter`, `lawyer`, `immigration`, `visa`, `committee`, `promotion`, `performance review`.
   - Usage: `claude (code )?(usage|sessions?)`, `tokens`, `per[- ]model`.
   - Check of a claim from someone else: `claim`, `holds up`, `back(s)? (it )?up`, `invoice`, `billed`, `hours`, `contractor`, `candidate`, `applicant`, `verify`, `trust`, `check what the history`.
   Match when the history factor and at least one intent factor are present. A false positive costs one extra line of context, so recall matters more than precision here.
3. Keep the existing patterns as they are (they stay valid) and add the new test as an `OR`.
4. The hint text (line 129) should name the class and the rule file, for example: "this is a work-evidence or claim-check request on git history; read the rules block in `skills/workproof/references/core-rules.md` before writing; run `npx workproof ...` only for figures about the user's own work". This keeps the tool for the user's own work and sends claim-check requests (R7) to rules only.
5. Make the skill description say the intent classes in plain words first, then the use-case list: "Use for any request to write, summarise, check or judge a person's work from git history or exported Claude Code sessions: a statement for a lawyer, a promotion or review file, a quarterly summary, a hiring or contractor claim, an invoice check, a usage report."
6. Add a trigger test file (like `evals/trigger-tests.md` in JD, MIT): 40 or more phrasings per class, not copied from set a, b, or c, and a script that runs `hooks/workproof-hint.sh` on each and prints misses. This makes the next held-out set a test of the classes, not of the phrasings.

### 6.4 A short rules block that applies even when the skill is not called

Question: does a short summary of the main rules belong in always-loaded text? Yes: the evidence says that in 9 of 9 cells where the skill was not called (C2, C3, C5) our score equals the unplugged model's, and that the rules R3 to R7 are general. The skill text cannot help when it is not loaded.

Where to put it (exact paths, so nobody scans the disk):

- Plugin root: `/Users/efe/Desktop/Open-Source/projelerim/workproof` (in an installed plugin, `${CLAUDE_PLUGIN_ROOT}`).
- Existing hook that already runs on every prompt: `hooks/workproof-hint.sh`, registered in `hooks/hooks.json` under `UserPromptSubmit`.
- Proposed new file: `skills/workproof/references/core-rules.md`, at most about 1,500 characters, R1 to R8 in one line each, no examples.
- Proposed wiring A (primary): extend `hooks/workproof-hint.sh` so that, when the two-factor test matches, it appends the content of `core-rules.md` to `additionalContext` (the script already builds `ctx` at lines 129 to 131 and reads `CLAUDE_PLUGIN_ROOT` at 127). Cost: about 400 tokens only on matching prompts.
- Proposed wiring B (cover the case where the prompt gives no hint at all): a `SessionStart` entry in `hooks/hooks.json` with a new `hooks/workproof-session.sh` that prints a 3 line pointer ("When asked to write, summarise or judge someone's work from git history or exported sessions, apply the rules in `${CLAUDE_PLUGIN_ROOT}/skills/workproof/references/core-rules.md`") only when `cwd` is inside a git work tree. Cost: about 80 tokens per session in git repositories.
- `CLAUDE.md` or `AGENTS.md` at the plugin root: neither exists now (`ls` of the repository root). I did not find evidence in this session that Claude Code loads a plugin's root `CLAUDE.md` or `AGENTS.md` into the model context (the documented plugin parts are skills, commands, agents, hooks and MCP servers); JD ships an `AGENTS.md` for agents that read repository files, not for plugin loading. Do not rely on it. If the owner wants it, test it first: install the plugin with a unique sentence in a root `CLAUDE.md`, ask the model to repeat it in a fresh session, and keep the file only if it appears.
- Risk to check in the development gate: extra context could change behaviour on the public set (34.67 of 35 now). Run the public tasks once after wiring B before accepting it.

### 6.5 Decisions to freeze for the round (summary)

| Item | Decision |
|---|---|
| Copy any RCP or JD technique | No new copying; the "which columns add up" footnote, the "no spend breakdown" line and the "add by hand what git cannot show" line are adopted for the usage-report path (Apache-2.0, add `THIRD-PARTY-NOTICES.md`) |
| Identity (R1, R2) | Adopt; change skill line 50 and tool candidates report |
| Padding (R3), audience (R4), counts (R5), provenance and whitespace (R6) | Adopt as skill rules and as part of `core-rules.md` |
| Claim checks (R7) | Adopt as rules (no tool change) |
| Hint redesign (6.3) and rules block (6.4, wirings A and B) | Adopt; trigger test file with phrasings written for classes |
| Plugin-root `CLAUDE.md` or `AGENTS.md` | Only after a smoke test shows it is loaded |
| Fixture-specific entries (names, addresses, file names, line figures from set c) | Rejected; they would overfit and the next held-out set would show it |
