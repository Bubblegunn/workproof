# Head-to-head: workproof against the other plugins

This page freezes the six public tasks, how each fixture is built, how runs are graded and what counts as a win. It was committed before any change of round 1, so the tasks cannot have been bent toward the result. The scripts are in `bench/head-to-head/`; anyone can rerun them.

## Why these tasks

The pain: "I did real engineering work in a repo I cannot show, and I need evidence for a CV, a promotion or a visa application that a reviewer can trust." Each task is one thing a person asks for in that situation. No prompt names a tool. The first measurement, on 2026-10-21, showed workproof 0.7.0 winning only the visa task, because its skill did not load on the other tasks. Round 1 fixes that and the gaps behind it.

## Arms

- OURS: this repository as a Claude Code plugin directory (`--plugin-dir`), with the CLI from the same checkout.
- BASE: an empty plugin. Claude with no plugin.
- RCP: receipts (Apache-2.0, anthropics/claude-plugins-official, plugins/receipts), patched only so that the session-log folder can be redirected with RECEIPTS_HOME.
- JD: JD Resume Tailor (MIT).
- GAP: GapToGrowth (MIT).
- Infinite Resume needs a sign-in for its handoff, so it is compared on features only: not runnable without an account.

Model: Sonnet. Each task runs 3 times per arm, each time on a fresh copy of its fixture. Plugins are loaded with `--plugin-dir`, settings from the project only, MCP servers off, permissions skipped.

## Fixtures

- F1: a full clone of github.com/tj/co (not shallow, not blobless) with the origin remote removed, `user.name` set to "Jonathan Ong" and `user.email` set to the address he used most often in the history. His work sits under three identities.
- F3: F1 plus `./received/` holding a workproof report whose commit count was raised by 40 and surviving lines by 500, with a false `identity.merged` claim added, and whose hash was then recomputed, so `check` passes (`bench/head-to-head/forge3.mjs`; the frozen files are in `bench/head-to-head/fixtures/F3-round3/`). Earlier versions: `fixtures/F3-round2/` (hash recomputed, no merged claim, `forge.mjs`) and `fixtures/F3-round1/` (hash left stale, `tamper.mjs`).
- F4: an invented Claude Code home with 36 sessions over invented repositories, made by the receipts plugin's own `assets/make-sample.mjs`; the working directory is one invented repository and RECEIPTS_HOME points at the home. Build it outside any folder whose path contains "scratchpad": the receipts miner skips such paths as agent scratch space.

`bench/head-to-head/make-fixtures.sh <workdir> [local clone]` builds all three.

## Ground truth

F1 is a full clone of github.com/tj/co with git config user.name 'Jonathan Ong' and user.email set to the address that Jonathan Ong used most often in the history. His work sits under three identities. Non-merge commits: 56 under the configured address alone, 63 with all three identities, 230 in the whole repository. Surviving lines in `git blame -w -M`: 585 under the configured address alone, 697 with all three identities (workproof's exclusions of bots and generated files applied).

## Grading

Objective facts are read from the transcript and the files the run left behind. A separate Sonnet call receives the criteria, the ground truth and the outputs of every arm with the arms shuffled and given letters, so it does not know which tool made which output. The tool under test is never the judge of its own output. `assemble.py` builds the packets, `grade.sh` runs the grader, `score.py` computes the table and the gate.

## Win rule

On every task our mean score is strictly higher than every other arm's mean, and our total is at least 20 percent above the best other arm's total. A task on which every arm scores full marks does not discriminate and is replaced by a harder variant of the same pain before the final gate. A run of ours must call the Skill tool; a pass without it is recorded as the bare model.

## Public tasks

### T1. Visa evidence from a private repo

Fixture: F1.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> This repo is from a client engagement and it is private, I am not allowed to show anyone the code. I wrote the commits in it myself, under the git identity configured in this repo. I am applying for a visa and need proof of what I actually did in it. I cannot share the repo. Put together something I can attach. {suffix}

Ground truth: The user is Jonathan Ong (git user.name and user.email as configured). Non-merge commits: 56 under the configured email, 63 across all three identities.

Criteria, 1 point each:

- C1: A deterministic command computed the figures from git (visible in the commands list), not model estimates.
- C2: An output file exists and its commit count for the author is in the range 56 to 63.
- C3: The output file has no email address and no source code or file paths.
- C4: The output carries a tamper-evidence mechanism (hash or checksum) plus how a reviewer checks it.
- C5: The output states what the figures cannot show (limits).

### T2. Four CV bullets

Fixture: F1.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> I am updating my CV. Write me 4 bullet points about my work in this repo that I can paste in. Save them to cv-bullets.md in the current directory.

Ground truth: Commits 56 to 63, surviving lines 585 to 697, shares 41% to 49% of lines.

Criteria, 1 point each:

- C1: Every number in the bullets appears in command output in the transcript (none invented).
- C2: No impact claim that git cannot support (percent speedups, users, revenue).
- C3: Commit or line numbers match the ground truth (commits 56 to 63, surviving lines 585 to 697, or shares 41% to 49%).
- C4: The bullets carry a way to verify (source tag, command, or reference to an evidence file).
- C5: Exactly 4 bullets, no email address, no em dash or en dash.

### T3. A forged report with a consistent hash and a false claim of merged addresses

Fixture: F3.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> Someone applying to us sent the two files in ./received as evidence of their work in this repo. They say their numbers are higher than a plain count because they committed under several email addresses. I have a clone of the repo in this folder. Can I trust what the files say? Tell me what you checked and write your verdict to verdict.md in the current directory.

Ground truth: F3 is F1 plus ./received/ holding workproof-report.json and workproof-report.md, made by workproof for Jonathan Ong and then altered: the author's commit count was raised by 40 (63 to 103) and the surviving lines by 500 (697 to 1,197), the report was given a plausible but false identity.merged claim (three other addresses merged, with three reasons) to explain the higher numbers, and the hash was recomputed over the altered content, so `workproof check` passes. The repository has three identities for this author; merging all of them gives 63 non-merge commits and 697 surviving lines, so the several-addresses explanation does not account for the difference. Only re-deriving the figures from the repository exposes the change.

Criteria, 1 point each:

- C1: A command re-derived the author's figures from the repository (a verify run, or a git log or blame count), not only an offline check of the files.
- C2: verdict.md says the figures do not match the repository, naming 103 commits against about 63, or 1,197 lines against about 697.
- C3: verdict.md says the hash or offline check is internally consistent or passes, and that this does not make the figures true.
- C4: verdict.md tests the several-addresses explanation against the repository (for example by counting commits under all of the person's addresses, or by showing the merged claim does not produce the claimed numbers) and says it does not account for the difference.
- C5: verdict.md gives a clear do-not-trust-as-is verdict and states what a passing check would still not prove (for example that history can be rewritten, or that quality is not shown).

### T4. Claude Code usage report for a manager

Fixture: F4.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> My manager keeps asking what all my Claude Code usage over the last month actually delivered. Put together a short usage and impact report I can send her. This machine's session logs are under {home}/.claude/projects and {home} is the home directory for this. {suffix}

Ground truth: F4 is an invented home with 36 Claude Code sessions over 4 invented repositories (make-sample.mjs from the receipts plugin), cwd is one invented repository. Miner output: 40 sessions, 64 prompts, 28 active days, 14 files, 3,120 lines, 12 commits, 7 PR commands when run outside a scratchpad path.

Criteria, 1 point each:

- C1: A deterministic command mined the session logs (the raw jsonl was not read by the model).
- C2: Session count and active-day count in the report match the miner's JSON (40 sessions, 28 active days).
- C3: No dollar figures and no hours saved.
- C4: A by-project breakdown including the no-project research bucket.
- C5: A file exists in the current directory with framing for a manager.

### T5. Promotion self-review paragraph

Fixture: F1.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> I am up for promotion and my manager asked how much of this codebase is actually mine. Write a short paragraph, under 120 words, for my self-review, saved as self-review.md in the current directory. Keep it honest, they will check.

Ground truth: Commits 56 to 63 (not 76, which counts merge commits of other people), surviving lines 585 to 697.

Criteria, 1 point each:

- C1: The file exists and is under 120 words.
- C2: It contains a commit figure and a surviving-lines figure, both correct against the ground truth.
- C3: It keeps commit share and surviving-lines share apart and does not call the person top or sole owner without evidence.
- C4: It tells the manager how to check it.
- C5: No quality or impact claim that git cannot support.

### T6. Three email addresses

Fixture: F1.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> I have committed to this repo from three different email addresses over the years, one of them a GitHub noreply address, and git config here knows only one of them. How many commits and how many surviving lines are mine across all three? Save the answer to mine.md in the current directory.

Ground truth: Non-merge commits across all three identities: 63 (56 under the configured email alone). Surviving lines across all three: 697 (585 under the configured email alone).

Criteria, 1 point each:

- C1: A deterministic command computed the figures from git (visible in the commands list), not model estimates.
- C2: The commit count in mine.md is 63.
- C3: The surviving-lines count in mine.md is between 660 and 720.
- C4: mine.md names or counts the addresses that were combined (three identities, or the list of them).
- C5: mine.md states how it decided the addresses belong to the same person, or what that decision rests on.

### T7. JD Resume Tailor's README example: tailor a resume to the sample job description

Fixture: F7.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> Tailor my resume for this JD. My portfolio bank is portfolio-bank.md in this folder. Save the resume to resume.md in the current directory.
> 
> # Sample JD (fictional): ML Engineer, Retail AI
> 
> ## Required Skills
> - Python
> - PyTorch
> - LLM applications: LangGraph, RAG
> - Vector databases: Chroma, Pinecone, FAISS
> - Docker, FastAPI
> - Computer vision: YOLO or similar
> 
> ## Nice to Have
> - ONNX or edge deployment
> - Experience with churn or customer models

Ground truth: F7 is a folder holding portfolio-bank.md, the public sample bank of JD Resume Tailor (fictional facts: Example Corp churn model 1.2M records 0.87 AUC 40k predictions per day; DocQA 5,000 PDFs accuracy 62% to 81% on 200 questions, Stack LangGraph, ChromaDB, FastAPI; ScanSense in progress, YOLOv8, ONNX, 25 FPS on CPU). The JD requires PyTorch, Pinecone, FAISS and Docker, which the bank does not support. This is the example in that tool's README (sample bank plus sample-jd.md).

Criteria, 1 point each:

- C1: Every number in resume.md appears in portfolio-bank.md (none invented or changed).
- C2: Every bullet traces to a fact in portfolio-bank.md (a source tag, a fact ID or an explicit reference).
- C3: Skills the bank does not support (PyTorch, Pinecone, FAISS, Docker) are not listed as the person's skills in resume.md, and the answer tells the user about the gap.
- C4: resume.md uses the DocQA and ScanSense projects, and puts the in-progress project after the complete ones.
- C5: resume.md exists with a summary, skills and experience or projects sections, and has no em dash or en dash.

### T8. GapToGrowth's README example: tailor a resume to a job description from past resumes

Fixture: F8.

Prompt, word for word (`{suffix}` is "Save any files in the current directory.", `{home}` is the F4 home):

> My past resume is in ./resumes/past-resume.md. Tailor my resume for this JD. Save the tailored resume to resume.md in the current directory.
> 
> # Backend Engineer, Shipment Platform (fictional)
> 
> ## Required
> - Go
> - Queue-based systems such as AWS SQS
> - Event-driven design
> - PostgreSQL
> - Terraform
> 
> ## Nice to have
> - Kubernetes
> - Rust
> - gRPC

Ground truth: F8 is a folder holding resumes/past-resume.md, GapToGrowth's fictional reference resume of Avery Collins (Cedarline Logistics, Brightforge Software, Harbor & Pine Insurance; Go, AWS SQS, Step Functions, PostgreSQL, Terraform, Kubernetes, Docker). The JD asks for Rust and gRPC, which the resume does not support. This is the prompt in that tool's README (tailor my resume for this JD, from past resumes).

Criteria, 1 point each:

- C1: Every number in resume.md appears in the past resume (none invented or changed).
- C2: No employer, job title or date in resume.md differs from the past resume.
- C3: Skills the past resume does not support (Rust, gRPC) are not listed as the person's skills in resume.md, and the answer tells the user about the gap.
- C4: resume.md leads with the event-driven shipment work and names the JD's required items that the resume supports (Go, SQS, event-driven, PostgreSQL, Terraform).
- C5: resume.md exists and is under 450 words.

## Rulings

Recorded 2026-10-21 after round 1, before any round 2 code change.

1. Rule B at the ceiling. When another arm reaches the maximum on a task, we pass that task only if we also reach the maximum, because nobody can exceed full marks. Otherwise "strictly above every other arm" stands. Cost if wrong: a task where we tie a perfect competitor counts as a pass.
2. T3 was saturated in round 1 (all arms 5.00). It is replaced by the harder T3 below: a forged report whose hash was recomputed over the altered figures, from an applicant whose name is spelled differently. The round 1 T3 and its result stay in this page under "Superseded".
3. T4 stays in the public set as the fairness probe on the receipts tool's home ground. To pass it we must reach the maximum.
4. T6 and T3 triggering: the skill description gets the phrasings those prompts use, and a Skill call is required in our runs.
5. Fairness rules F1 to F5 of the spec apply from round 2. F1: every criterion is labelled outcome or process by an auditor that had read none of our code (`bench/head-to-head/labels.json`, committed before the round 2 runs); the gate counts outcome criteria only, and both tables are reported. F2: each competitor also runs in an invoked arm (`RCP_I`, `JD_I`, `GAP_I`) whose prompt starts with the sentence in `tasks.json` "invoked", and the gate compares us with the better of its two arms per task and in total; our arm keeps the natural prompt. F3: competitors are set up as their README says; the JD Resume Tailor README requires a portfolio bank, so its invoked arm gets `fixtures/portfolio-bank.md` holding the ground-truth facts (the most favourable bank possible); GapToGrowth is built for Cowork with a folder of past resumes, which a headless run cannot reproduce, so its results are shown but it is not a case for or against anyone. F4: transcripts, grader prompts, label maps, scripts and a one-command re-run are in `bench/head-to-head/` (see `rerun.sh`). F5: per-run scores, mean, min-max and n are given for every cell, and claims are scoped to these six tasks, this model and this date.
6. Home-ground tasks (F8). T7 and T8 are the examples that the JD Resume Tailor and GapToGrowth READMEs show (tailor a resume to a job description from a bank or past resume), frozen in the same commit as the rest of round 2 before any run. workproof does not tailor resumes. They are in the set so that a reader can see our result on the other tools' ground, not to hide it; if we do not reach the maximum there, the gate reports it as failed.
7. Models (F9). The model is a harness parameter (`H2H_MODEL`, and `H2H_GRADER_MODEL` for grading, default Sonnet). Round 2 runs Sonnet only; the Haiku and Opus runs belong to the final gate.
8. Star hint. The CLI prints at most one plain line asking for a star, once per machine, only on a TTY, never in CI, a pipe, an agent or the GitHub Action, and never inside a report or a hash; `--quiet` or `WORKPROOF_NO_STAR_HINT=1` turns it off. It is tested per condition.
9. Reuse. Runs of the plain competitor arms on T1, T2, T4, T5 and T6 are the round 1 runs (identical prompts and fixtures); the plain competitor arms on the new T3, T7 and T8, every invoked arm, and all runs of ours are new. Re-grading is blind and pools every arm of a task.

## Rulings, round 3

Recorded 2026-10-21 after round 2, before any round 3 code change.

1. T7 and T8 stay in the set. The owner's requirement is that workproof is stronger than every competitor in every area the set covers, so round 3 adds a "tailor to a job description" step to the skill: it takes the text of a job description, writes CV bullets ranked by relevance, takes every number from a fact source with its source tag (the workproof report with figure id and hash prefix, or a portfolio bank or past resume the user names), and lists the skills the facts do not support as gaps, never as claims. It extends the adaptation of JD Resume Tailor (MIT, Copyright (c) 2026 Dayesh Raval). Target: the maximum on T7 and T8.
2. Description and routing. The description opens with the question forms ("how many commits are mine across all my email addresses", "how much of this repo is my work"), carries the Claude Code usage sentence early, and the body routes "my Claude Code usage" and AI-assisted work requests to the session miner even inside a git repository. A Skill call is required in every run of ours on T4, T6 and T7 (`requireSkill` in `tasks.json`); a run without one fails the task in the gate because it measures the bare model.
3. T3 is saturated again: in round 2 every plain arm, including the empty plugin, scored the maximum. It is replaced by the T3 above: the forged report also carries a false `identity.merged` claim of three merged addresses, offered as the applicant's explanation of the higher numbers, and the hash is recomputed. The round 1 and round 2 versions and their results stay under "Superseded".
4. Independent review. A Sonnet reviewer that did not write the round 2 miner and skill changes reviews them; its findings are fixed or answered in the round 3 commits.
5. Isolation. Every run of every arm uses a temporary HOME under the scratch folder (`run.sh`), with only the login and no hooks or MCP servers. `guard.sh` records the `hooks` object of the real `~/.claude/settings.json` and the `mcpServers` object of the real `~/.claude.json` before the round, and `run-one.sh` compares them before and after every run; any change writes a STOP file, no further run starts, and the round is reported as stopped. All cells of round 3 are new runs; nothing is reused from earlier rounds.

## Rulings, round 4

Recorded 2026-10-21 after round 3, before any round 4 code change.

1. Logic moves out of skill-relative scripts into the CLI, so nothing depends on `${CLAUDE_PLUGIN_ROOT}`. `workproof sessions` is the Apache-2.0 session miner with its attribution and the same privacy defaults; `workproof verdict` prints the verdict file of a received report in a fixed template; `workproof bullets --jd <file>` prints ranked, source-tagged bullets and a Gaps list from a report or from a portfolio bank or past resume. The skill only runs `npx workproof ...`.
2. Deterministic triggering. The plugin gets a `UserPromptSubmit` hook (`hooks/hooks.json` and a plain POSIX shell script, path written with `${CLAUDE_PLUGIN_ROOT}`, no network, no file writes, no reads of credentials, under 50 ms) that adds one line of context naming the workproof skill when the prompt matches a situation the skill covers. `bench/head-to-head/hook-prompts.json` freezes 16 positive prompts and 20 unrelated negative prompts (some deliberately close: git, resume, LinkedIn) before the hook is written; the eight task prompts are positives too. The false-trigger count on the 20 negatives is reported.
3. T6 audit. Every arm scored exactly 2.00 in rounds 2 and 3, so we checked whether two criteria are unreachable. They are not: in round 2 one run of RCP_I passed all of C2 to C5 (it stated 63 excluding merges beside a headline of 76, and said the noreply commits carry the name "jongleberry" as the link), and BASE, RCP and JD each passed C2 in one run. The wording of C2 is ambiguous about merge commits (a count of 76 is a legitimate reading of "commits"), but the graders already accept a file that states 63 labelled as the non-merge count. So the task is fair and no criterion changes; the product has to make ours reach 63 and a stated basis for treating the addresses as one person.
4. Fixed output templates. A verdict on a received report has the sections Altered figures, Hash status, What a passing check would not prove, Recommendation (and a Merged-address claim section when the report makes one). The tailoring output has ranked bullets with source tags, a Gaps section that is always present (with "None" when there is none), and an ordering check. Both are produced by the CLI, not written freehand.
5. T7 and T8 must go through the CLI. `requireSkill` now lists T4, T6, T7 and T8, and `requireCommand` makes the gate fail T7 or T8 if a run of ours did not run `workproof bullets`; a run without it measures the bare model.
6. Isolation and guard unchanged from round 3 (ruling 5 of round 3): temporary HOME, guard before and after every run, Vaara banned from benchmarks. Everything in round 4 is a new run.

## Rulings, round 5

Recorded 2026-10-21 after round 4, before any round 5 code change.

1. T7. `workproof bullets` always prints a `## Summary` heading with a fixed first line built from the report (or, for a bank or a resume, from the top-ranked entry), and ends with a short checklist (Summary, ranked bullets, Gaps, ordering) that the skill tells the agent to satisfy before finishing and not to copy into the file.
2. T6. The main report and a new `workproof mine` command print the merged addresses with the basis of each merge as a sentence the user can paste (same name on another address, same GitHub login, address name matching the GitHub login). Emails stay hidden wherever the report hides them: the sentence names the rule, not the address, unless the user asked for addresses (`--emails`). Any run that uses the CLI then carries the basis the criterion asks for.
3. T6 firing. The hook gets a stronger rule for "several, multiple, two or three email addresses" and "old work email" phrasings, written as a conjunction (first person, a commit word, an email phrase and a counting intent) so that unrelated email prompts do not match. `bench/head-to-head/hook-prompts-r5.json` freezes 8 positive and 8 close negative prompts before the change; the earlier frozen and extra negatives must still add nothing. If a run still skips the skill, that is recorded as a model choice and the task is not changed.
4. All eight tasks times all arms times three runs are re-run, guard on, outcome criteria only. If the gate passes, F9 follows: the eight public tasks on Haiku and on Opus, one run per task, for ours, the best competitor arm of each task and the empty plugin.

## Rulings, round 6

Recorded 2026-10-21 after round 5, before any round 6 code change.

1. T7. `workproof bullets --resume` prints the finished file shape (name line, `Target role:`, `## Summary`, `## Skills`, `## Experience` or `## Projects` with the entry heading lines copied from the source, `## Gaps`, `## Keyword coverage`, `## Ordering check`), so the agent saves it and adds at most one sentence. The headings are the ones a real resume needs, which are also the ones the T7 criteria expect.
2. T6. `workproof mine --out <file>` is the single instruction for the several-addresses task: the skill says to run it with the file the person named, so the basis sentence is in the file and not in the chat.
3. The report-mode Summary of `workproof bullets` no longer reads figures from the first repository only: it uses one repository that has both figures and names it, and with several repositories it says so.
4. Rate limits. Round 6 runs at parallelism 2. `failed-cells.py` lists every run without a DONE marker, a result event, or with an error result or a rate-limit, overload or API-error message; those cells are repeated and a round is never graded while the list is not empty.
5. F9 follows only if the gate passes: the eight public tasks on Haiku and on Opus, one run per task, for ours, the best competitor arm of each task (taken from the round 6 outcome table, plain or invoked) and the empty plugin, graded blind per model; a task is lost on a model when ours is below the maximum and not strictly above every other arm of that model, with the ceiling ruling.
6. Guard, temporary HOME and everything else are unchanged from earlier rounds; all cells of round 6 are new runs.

## Rulings, round 7

Recorded 2026-10-22 after round 6, before any round 7 code change.

1. T6 is delivered by the product, not by the model's choice to load a skill. Counting only the runs that called the skill, or narrowing the claim, would bend the test, so neither is done. Instead, when the `UserPromptSubmit` hook matches the several-addresses situation inside a git repository, it computes the answer itself with plain read-only git (`git config`, `git shortlog -sne --no-merges`, `git rev-parse`, `git rev-list`; POSIX shell and awk, no launcher, no network, no writes) and adds it to the context: the number of non-merge commits across the addresses that share the configured name, whose address name matches, or that are GitHub noreply addresses whose login matches, the rule that merged each group, and the line "for the full verifiable figures run `npx workproof mine --out <file>`". Addresses are shown only as rules and counts unless the prompt asks for them. The computation is skipped silently when the working directory is not a repository or the history has more than 20,000 commits.
2. Measurements to report: the time on a 10,000-commit repository (target under 300 ms), false triggers on the frozen negative lists (0), and silence of the computed part in a directory that is not a repository.
3. The static rules test of the hook, which forbade the word `git`, is changed to allow exactly four read-only git subcommands (`config`, `shortlog`, `rev-parse`, `rev-list`) and nothing else.
4. Benchmark. On the owner's go, T6 is re-run for all arms (3 runs each) and T1 to T8 for ours only (3 runs), to show nothing regressed; the gate is reported on those cells together with the round 6 cells of the other tasks and arms, which are unchanged.

## Rulings, final gate

Recorded 2026-10-22 after round 7, before any change of the final gate.

1. The condition "a Skill call is required in every run of ours" (and the requirement to run a given CLI command), added in round 3 and carried by `requireSkill` and `requireCommand`, is a process criterion. Spec F1 says the gate counts outcome criteria only, so it was an error of the coordinator, not a loosening. From now on the gate is computed on outcome criteria alone and `score.py` prints the skill-call rate and the command use beside the table as process measures. Rounds 3 to 7 are shown under both conditions; the verdicts printed at the time (old condition) stay in their sections.

| Round | Gate on outcome criteria only | Gate under the old condition (as printed then, with the task set of that round) |
|---|---|---|
| 3 | FAIL (T3, T4, T6, T7, T8) | FAIL |
| 4 | FAIL (T7) | FAIL (T6, T7) |
| 5 | FAIL (T7) | FAIL (T7) |
| 6 | PASS | FAIL (T6: a run made no Skill call) |
| 7 | PASS | FAIL (T6: a run made no Skill call) |

   The outcome-only verdicts of rounds 3 to 7 were recomputed with the final `score.py` on the archived grades.
2. The final gate runs in this order, all from an immutable `git archive` copy of one final commit, built and probed before the first run: (a) the hook context carries the paste-ready basis sentence ("Counted as the same person because ...") and ours is re-run on T6 (Sonnet, 3 runs); (b) the held-out tasks, written by an agent that had not read our code or our public tasks, run on all arms (Sonnet, 3 runs each); the product is not changed after they are read; (c) F9: Haiku and Opus, one run per task on the 8 public and the 3 held-out tasks, for ours, the best competitor arm of each task (from the Sonnet table) and the empty plugin; (d) the report shows the public, held-out and F9 tables (outcome-only and full), the gate on each, the cost, and a scoped result statement.
3. F6 (an independent re-run of a random 10 percent of cells by a fresh agent) is done by the coordinator afterwards.

## Baseline measurement, 2026-10-21 (workproof 0.7.0, before round 1)

Five tasks (T1 as first written, without the author statement; T6 did not exist), criteria passed of 5.

| Task | OURS | RCP | JD | GAP | BASE |
|---|---|---|---|---|---|
| T1 visa evidence | 5 | 0 | 0 | 0 | 0 |
| T2 four CV bullets | 4 | 4 | 4 | 4 | 4 |
| T3 verify a tampered report | 5 | 5 | 5 | 5 | 5 |
| T4 usage report | 5 | 5 | 5 | 4 | 4 |
| T5 self-review | 3 | 0 | 3 | 2 | 3 |
| Total of 25 | 22 | 14 | 17 | 15 | 16 |

One run per cell. The skill loaded in 1 of 5 runs of ours, so four rows describe Claude without the plugin. In T1 the other arms refused because the prompt did not say the user wrote the commits; the T1 prompt above now states it.

## Results, round 1

Date: 2026-10-21. Build under test: commit 4ebeeac (branch plugin-leadership), run as the plugin directory, with `npx workproof` routed to the local build by `bench/head-to-head/shim/npx`. Sonnet, 3 runs per task per arm on fresh fixtures, 90 runs, graded blind by one Sonnet call per task over all arms. Fixtures were built outside any `claude-*` temp folder; F3 uses the frozen report from the baseline measurement (61 raised to 101, 696 raised to 1,196). Mean criteria passed of 5.

| Task | OURS | BASE | RCP | JD | GAP | OURS Skill calls (runs 1 to 3) |
|---|---|---|---|---|---|---|
| T1 visa evidence | 5.00 | 2.00 | 1.67 | 1.67 | 1.00 | 1, 1, 1 |
| T2 four CV bullets | 4.67 | 0.67 | 1.00 | 2.33 | 2.33 | 2, 2, 1 |
| T3 verify a tampered report | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 1, 0, 0 |
| T4 usage report | 4.00 | 3.33 | 5.00 | 3.67 | 3.33 | 0, 0, 0 |
| T5 self-review | 5.00 | 2.00 | 2.33 | 2.00 | 2.33 | 2, 2, 2 |
| T6 three addresses | 3.33 | 3.33 | 3.33 | 3.33 | 3.00 | 0, 0, 0 |
| Total of 30 | 27.00 | 16.33 | 18.33 | 18.00 | 17.00 | |

Gate: FAIL.

- Rule A (total at least 20 percent above the best other arm): passes. 27.00 against receipts at 18.33, which needs 22.00.
- Rule B (strictly above every other arm on every task): fails on three tasks.
  - T3: all five arms score 5.00. The task does not discriminate. Under the ruling above it is replaced by a harder variant of the same pain before the final gate; that replacement is not made in round 1. Our skill fired in 1 of 3 runs, so two of our three runs are the bare model.
  - T4: receipts scores 5.00, the maximum, so no arm can be strictly above it. This is the task built around receipts' strength; workproof does not write a usage report and its skill correctly did not fire (0 of 3). The rule cannot be passed on this task unless receipts drops a point, so the question for the final gate is whether T4 stays a public task.
  - T6: all arms tie at 3.33 (GapToGrowth 3.00). The skill did not fire in any of our runs, because the description names "several email addresses" but the prompt says "committed to this repo from three different email addresses" and asks "how many commits and surviving lines are mine". Without the skill the runs counted 76 commits (merge commits and a second ref) and gave no basis for treating the addresses as one person (C5).

Skill calls in our runs: T1, T2 and T5 fired in 9 of 9 runs; T3 in 1 of 3; T4 and T6 in 0 of 3. Baseline before round 1 was 1 of 5 runs.

What round 2 would change (not done; the loop stops after one round on this repository until Efe decides):

1. Description and commands: add the T6 and T3 phrasings ("how many commits are mine across all my emails", "someone sent me these files as evidence of their work") to the skill description, and check the length stays under 1,024 characters.
2. A first line in the skill body for the case where the user states several addresses: run the tool and read the merged list instead of grouping by email.
3. Replace T3 with a variant on which the bare model does not already pass (for example a report that is intact but made from another repository, so only the fingerprint check catches it) and decide with Efe whether T4 stays public.
4. Optional item 7 from the baseline report, a printable usage receipt, would only matter for T4 and is not planned.

Caveats: three runs per cell is a small sample; one grader call grades all runs of a task together, with the arm letters shuffled; the held-out tasks required by the spec have not been run.

## Results, round 2

Date: 2026-10-21. Build under test: commit e576729 (branch plugin-leadership); the tasks, labels and harness were frozen in commit cd08c18 before the code changes of round 2. Model: Sonnet (`H2H_MODEL`), 3 runs per task per arm on fresh fixtures, graded blind by one Sonnet call per task over all eight arms with the letters shuffled. n is stated in every cell: mean (min-max, n). The plain competitor arms on T1, T2, T4, T5 and T6 are the round 1 runs (ruling 9); every other cell is new: 132 new runs. Arms: OURS; BASE; RCP, JD, GAP (natural prompt); RCP_I, JD_I, GAP_I (prompt starts with the competitor's own skill name, ruling 5). JD_I also had a portfolio bank (T7 uses the sample bank of its README). GapToGrowth is built for Cowork with a folder of past resumes, which a headless run does not reproduce, so its columns are shown but are not evidence for or against anyone. Scope of any claim: these eight tasks, this model, this date. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round2.tar.gz` (round 1 in `round1.tar.gz`); Gmail addresses and the maintainer's account name were replaced by `REDACTED` in the archives because the agents read them from their environment. `bench/head-to-head/rerun.sh` repeats everything.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 1.00 (1-1, n=3) | 0.67 (0-2, n=3) | 0.67 (0-2, n=3) | 0.67 (0-2, n=3) | 1.00 (0-2, n=3) | 0.00 (0-0, n=3) | 1.33 (0-2, n=3) |
| T2 (4) | 3.67 (3-4, n=3) | 0.67 (0-1, n=3) | 0.33 (0-1, n=3) | 0.33 (0-1, n=3) | 1.33 (1-2, n=3) | 2.67 (0-4, n=3) | 1.33 (1-2, n=3) | 0.67 (0-1, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) |
| T4 (4) | 2.00 (1-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 2.00 (0-3, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.00 (0-3, n=3) | 3.00 (3-3, n=3) | 2.33 (2-3, n=3) | 2.67 (2-3, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) |
| T6 (4) | 2.00 (2-2, n=3) | 2.33 (2-3, n=3) | 2.33 (2-3, n=3) | 2.67 (2-4, n=3) | 2.33 (2-3, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 4.00 (4-4, n=3) | 2.67 (2-3, n=3) | 3.67 (3-4, n=3) | 3.00 (2-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 1.00 (0-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) |
| Total (35) | 29.67 | 21.00 | 23.00 | 22.00 | 18.67 | 20.67 | 20.33 | 15.33 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 5.00 (5-5, n=3) | 2.00 (2-2, n=3) | 1.67 (1-3, n=3) | 1.67 (1-3, n=3) | 1.67 (1-3, n=3) | 2.00 (1-3, n=3) | 1.00 (1-1, n=3) | 2.33 (1-3, n=3) |
| T2 (5) | 4.67 (4-5, n=3) | 0.67 (0-1, n=3) | 0.67 (0-2, n=3) | 0.67 (0-1, n=3) | 2.33 (2-3, n=3) | 3.33 (0-5, n=3) | 2.33 (2-3, n=3) | 1.33 (0-2, n=3) |
| T3 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 4.33 (4-5, n=3) |
| T4 (5) | 2.33 (1-5, n=3) | 3.33 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 2.00 (0-3, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.00 (0-3, n=3) | 3.00 (3-3, n=3) | 2.33 (2-3, n=3) | 2.67 (2-3, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) |
| T6 (5) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-5, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 4.00 (4-4, n=3) | 2.67 (2-3, n=3) | 3.67 (3-4, n=3) | 3.00 (2-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 1.00 (0-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) |
| Total (40) | 34.00 | 24.00 | 27.33 | 26.33 | 22.67 | 24.33 | 24.33 | 19.00 |

### Skill calls in our runs

Runs 1 to 3 of each task: T1 1, 1, 1; T2 2, 1, 2; T3 0, 2, 2; T4 2, 1, 2; T5 2, 2, 2; T6 0, 0, 0; T7 0, 0, 0; T8 0, 0, 0. Round 1 for comparison: T1 1, 1, 1; T2 2, 2, 1; T3 1, 0, 0; T4 0, 0, 0; T5 2, 2, 2; T6 0, 0, 0.

### Gate

- T1: ours 4.00, best competitor 1.33 (GAP), max 4: PASS (strictly above every competitor)
- T2: ours 3.67, best competitor 2.67 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 4.00 (BASE), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T4: ours 2.00, best competitor 4.00 (RCP), max 4: FAIL (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 4.00 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 2.00, best competitor 2.67 (RCP), max 4: FAIL (strictly above every competitor)
- T7: ours 4.00, best competitor 4.00 (JD), max 5: FAIL (strictly above every competitor)
- T8: ours 5.00, best competitor 5.00 (BASE), max 5: PASS (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 29.67, best competitor total 23.00 (RCP), needs 27.60: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### Why it fails, task by task

- T4 (usage report): the skill now fires in all three runs (2, 1 and 2 Skill calls), and in one run it produced a correct report (all four outcome criteria, 4 of 4). In the other two it chose the git route because the working directory is a repository, and it wrote a git report instead of mining the session logs (outcome 1 of 4 and 1 of 4). The "Start here" line for usage requests lost against the repository in the working directory. Receipts scores the maximum, so under ruling 1 we needed the maximum and have a mean of 2.00.
- T6 (three addresses): the skill again did not fire in any of the three runs, so the runs are the bare model: 76 or 77 commits counted with merges and a second ref instead of 63, and no stated basis for treating the addresses as one person. All eight arms are within 2.00 to 2.67; receipts' invoked arm has the best mean by chance of one run that scored 4. We do not pass.
- T7 (JD Resume Tailor's example): we tie JD Resume Tailor at 4.00 of 5 (our skill did not fire, so this is the bare model). Ruling 1 does not apply because nobody reaches 5, and a tie is not strictly above.
- T3 (forged report with a recomputed hash): every plain arm and ours score the maximum, including the empty plugin, because a model that recomputes the figures with git finds the forgery without any tool. Under ruling 1 we pass because we also reach the maximum. The task still does not discriminate; it is recorded as saturated a second time.
- T8 (GapToGrowth's example): we pass only through the ceiling ruling; the empty plugin also scores 5.00, and JD Resume Tailor and GapToGrowth score 0.00 to 3.33 on their own example when run headless; the reasons are in the archived transcripts.
- Rule A (total at least 20 percent above the best competitor total) passes: 29.67 against 23.00 for receipts.

### What a round 3 would change (not run)

1. Make the skill choose the usage miner when the user asks about Claude Code usage even inside a git repository, for example by putting that sentence first in the body and in the description's opening clause.
2. Make the skill fire for the T6 wording. The description already contains "three different email addresses" and the prompt says "committed to this repo from three different email addresses"; the model still did not load the skill, so a command-style trigger (a first line in the project instructions the plugin cannot set) may be needed, or the description should open with the question form "how many commits are mine across all my email addresses".
3. T7 and T8 are the other tools' home ground. workproof does not tailor resumes; the honest options are to drop them from the claim we make about workproof's category, or to build a tailoring step, which is a different product. This needs a decision, not more tuning.
4. Replace T3 with a task the bare model does not already pass.

Caveats: three runs per cell is a small sample; the grader pools the runs of a task in one call; F6 (an independent re-run and re-grade of a random 10 percent of cells by a separate auditor) and F9 (Haiku and Opus runs) belong to the final gate and were not done; the held-out tasks were not run.

## Results, round 3

Date: 2026-10-21. Build under test: commit 66d5b11 (branch plugin-leadership); tasks, labels and harness frozen in commit 9991944 before the round 3 code changes. Sonnet, 3 runs per task per arm, 192 new runs, nothing reused from earlier rounds, graded blind by one Sonnet call per task over all eight arms. Every run used a temporary HOME with only the login (ruling 5). Isolation record: `guard.sh` compared the `hooks` object of the real `~/.claude/settings.json` and the `mcpServers` object of the real `~/.claude.json` with their state before and after every run. After 105 runs it tripped: a Vaara pre-tool-use hook had been added to the real settings by another benchmark on the same machine (not by these runs, which load no settings from the real HOME). The round stopped, the owner removed the hook, the guard was re-initialised against the clean state, the 105 finished runs were checked (each has a result event, none mentions the hook or a login failure; two of ours contain a harness message about `sleep`, unrelated), and only the 87 unfinished cells were run. The guard stayed clean after the last run. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round3.tar.gz` (Gmail addresses and the account name redacted). Scope of any claim: these eight tasks, this model, this date.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 0.00 (0-0, n=3) | 0.00 (0-0, n=3) | 1.00 (0-2, n=3) | 0.00 (0-0, n=3) | 1.33 (1-2, n=3) | 0.00 (0-0, n=3) | 0.67 (0-2, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 1.33 (1-2, n=3) | 1.00 (1-1, n=3) | 0.33 (0-1, n=3) | 1.67 (1-2, n=3) | 3.00 (3-3, n=3) | 1.67 (1-2, n=3) | 0.67 (0-1, n=3) |
| T3 (4) | 3.33 (2-4, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 4.00 (4-4, n=3) | 3.00 (2-4, n=3) |
| T4 (4) | 1.33 (0-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 2.33 (0-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 1.33 (0-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-3, n=3) | 2.00 (2-2, n=3) | 3.33 (2-4, n=3) | 1.33 (0-2, n=3) | 2.33 (2-3, n=3) |
| T6 (4) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 4.00 (3-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 2.67 (2-3, n=3) | 2.00 (0-3, n=3) |
| T8 (5) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 3.00 (3-3, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) |
| Total (35) | 28.33 | 20.67 | 21.33 | 22.33 | 17.33 | 22.00 | 19.00 | 14.33 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 5.00 (5-5, n=3) | 1.00 (1-1, n=3) | 1.00 (1-1, n=3) | 2.00 (1-3, n=3) | 1.00 (1-1, n=3) | 2.33 (2-3, n=3) | 1.00 (1-1, n=3) | 1.67 (1-3, n=3) |
| T2 (5) | 5.00 (5-5, n=3) | 2.33 (2-3, n=3) | 1.67 (1-2, n=3) | 0.67 (0-2, n=3) | 2.00 (1-3, n=3) | 3.00 (3-3, n=3) | 2.00 (1-3, n=3) | 0.67 (0-1, n=3) |
| T3 (5) | 4.33 (3-5, n=3) | 4.33 (4-5, n=3) | 4.33 (4-5, n=3) | 4.33 (4-5, n=3) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 4.00 (3-5, n=3) |
| T4 (5) | 1.67 (0-5, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 2.33 (0-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 1.33 (0-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-3, n=3) | 2.00 (2-2, n=3) | 3.33 (2-4, n=3) | 1.33 (0-2, n=3) | 2.33 (2-3, n=3) |
| T6 (5) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 4.00 (3-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 2.67 (2-3, n=3) | 2.00 (0-3, n=3) |
| T8 (5) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 3.00 (3-3, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) |
| Total (40) | 32.67 | 24.67 | 26.00 | 26.67 | 20.67 | 25.00 | 22.33 | 17.33 |

### Skill calls in our runs

T1 1, 1, 1; T2 2, 2, 2; T3 1, 0, 1; T4 1, 1, 1; T5 2, 2, 2; T6 0, 0, 0; T7 1, 2, 1; T8 1, 0, 0.

### Gate

- T1: ours 4.00, best competitor 1.33 (JD), max 4: PASS (strictly above every competitor)
- T2: ours 4.00, best competitor 3.00 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 3.33, best competitor 4.00 (JD), max 4: FAIL (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T4: ours 1.33, best competitor 4.00 (RCP), max 4: FAIL (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 3.33 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 2.00, best competitor 2.00 (BASE), max 4: FAIL (strictly above every competitor; FAILED: a run of ours made no Skill call, so it measures the bare model)
- T7: ours 4.00, best competitor 4.00 (BASE), max 5: FAIL (strictly above every competitor)
- T8: ours 4.67, best competitor 5.00 (BASE), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 28.33, best competitor total 22.33 (RCP), needs 26.80: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### Why it fails, task by task

- T1, T2 and T5 pass with a full-marks mean for us and a lower best competitor.
- T3 (forged report, false merged claim): we score 3.33; JD Resume Tailor's plain arm and GapToGrowth's plain arm score 4.00. In one run of ours the verdict did not discuss the hash and did not say what a passing check would not prove; the skill fired in 2 of 3 runs.
- T4 (usage report): the skill fired in all three runs, and one run was perfect. In the other two it loaded without a usable path to the bundled miner (`${CLAUDE_PLUGIN_ROOT}` was not resolved from the Bash tool), searched the machine, did not find it and asked the user a question instead of writing the report. Receipts scores the maximum, so we needed 4.00 and have 1.33.
- T6 (three addresses): the skill again did not fire in any run (0 of 3), so the runs are the bare model, and all eight arms tie at 2.00. Requiring a Skill call fails the task.
- T7 (JD Resume Tailor's example): the tailoring step fired in all three runs and one run scored the maximum, but the other two lost a point each (the in-progress project was listed before the complete one; no Summary section; the gap was not told to the user in the answer). The empty plugin, receipts and both JD arms score 4.00 as well, so we are tied, not above.
- T8 (GapToGrowth's example): 4.67 against 5.00 for the empty plugin and receipts. In one run the final answer did not name the skills the resume lacks; the skill fired in 1 of 3 runs, so two of three runs are the bare model.
- Rule A passes: 28.33 against 22.33 for receipts' invoked arm.

### What a round 4 would change (not run)

1. Make the miner reachable without `${CLAUDE_PLUGIN_ROOT}`: tell the agent to locate `skills/workproof/scripts/mine-sessions.mjs` under the plugin directory as a fallback, or ship the miner as a `workproof sessions` subcommand of the CLI.
2. T6 and the other prompts that carry no word of our domain do not trigger the skill even with the question forms in the description; a trigger that does not depend on the description (a hook or a project instruction) would be needed, or the claim has to be limited to prompts that name the situation.
3. Tighten tailor.md so the answer always names the gaps and the in-progress ordering is checked last, and add an explicit "end your answer with the Gaps sentence" rule.
4. T3, T7 and T8 are tasks on which the bare model already scores at or near the maximum; under ruling 1 they decide the gate only when we also reach the maximum, which needs the skill to fire in every run.

Caveats: three runs per cell is a small sample; one grader call pools the runs of a task; F6 (an independent re-run of a random 10 percent of cells), F9 (Haiku and Opus runs) and the held-out tasks belong to the final gate and were not done.

## Results, round 4

Date: 2026-10-21. Build under test: commit 6617343 (branch plugin-leadership); tasks, labels, hook prompt lists and harness frozen in commit 34a7090 before the round 4 code changes. Sonnet, 3 runs per task per arm, 192 new runs, graded blind by one Sonnet call per task over all eight arms, every run in a temporary HOME. The configuration guard (hooks and mcpServers of the real configuration, checked before and after every run) stayed clean for the whole round; no run was stopped. The first grader reply for T7 was not valid JSON (kept as `T7-grade.attempt1.json` in the archive); the same prompt was graded again and that reply is the one scored. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round4.tar.gz` (Gmail addresses and the account name redacted). Scope of any claim: these eight tasks, this model, this date.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 0.00 (0-0, n=3) | 0.00 (0-0, n=3) | 1.00 (0-2, n=3) | 0.00 (0-0, n=3) | 1.33 (1-2, n=3) | 0.33 (0-1, n=3) | 0.00 (0-0, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 0.67 (0-1, n=3) | 0.67 (0-1, n=3) | 0.00 (0-0, n=3) | 1.33 (0-2, n=3) | 3.33 (3-4, n=3) | 1.33 (1-2, n=3) | 1.33 (1-2, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 2.33 (2-3, n=3) | 2.67 (2-3, n=3) | 2.67 (2-4, n=3) | 2.00 (2-2, n=3) | 3.00 (2-4, n=3) | 2.67 (2-3, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 2.67 (0-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 1.67 (0-3, n=3) | 2.67 (2-3, n=3) | 2.00 (0-3, n=3) | 2.33 (2-3, n=3) | 3.33 (3-4, n=3) | 1.67 (0-3, n=3) | 2.33 (2-3, n=3) |
| T6 (4) | 2.67 (2-3, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 4.67 (4-5, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.67 (2-3, n=3) | 3.33 (0-5, n=3) | 1.67 (0-5, n=3) |
| Total (35) | 33.33 | 19.67 | 20.67 | 20.33 | 17.00 | 22.33 | 17.67 | 16.67 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 5.00 (5-5, n=3) | 1.00 (1-1, n=3) | 1.00 (1-1, n=3) | 2.00 (1-3, n=3) | 1.00 (1-1, n=3) | 2.33 (2-3, n=3) | 1.33 (1-2, n=3) | 1.00 (1-1, n=3) |
| T2 (5) | 5.00 (5-5, n=3) | 1.67 (1-2, n=3) | 0.67 (0-1, n=3) | 0.00 (0-0, n=3) | 2.00 (0-3, n=3) | 4.33 (4-5, n=3) | 2.00 (2-2, n=3) | 2.00 (1-3, n=3) |
| T3 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-5, n=3) | 3.00 (3-3, n=3) | 4.00 (3-5, n=3) | 3.67 (3-4, n=3) |
| T4 (5) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 2.67 (0-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 1.67 (0-3, n=3) | 2.67 (2-3, n=3) | 2.00 (0-3, n=3) | 2.33 (2-3, n=3) | 3.33 (3-4, n=3) | 1.67 (0-3, n=3) | 2.33 (2-3, n=3) |
| T6 (5) | 3.67 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 2.67 (2-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 4.67 (4-5, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.67 (2-3, n=3) | 3.33 (0-5, n=3) | 1.67 (0-5, n=3) |
| Total (40) | 38.33 | 23.67 | 24.67 | 24.33 | 20.67 | 26.33 | 21.33 | 20.33 |

### Skill calls in our runs

T1 1, 1, 1; T2 1, 1, 1; T3 1, 1, 1; T4 1, 1, 1; T5 2, 2, 2; T6 1, 0, 1; T7 1, 1, 1; T8 1, 1, 1. Round 3 for comparison: T3 1, 0, 1; T4 1, 1, 1; T6 0, 0, 0; T7 1, 2, 1; T8 1, 0, 0.

### Gate

- T1: ours 4.00, best competitor 1.33 (JD), max 4: PASS (strictly above every competitor)
- T2: ours 4.00, best competitor 3.33 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 3.00 (BASE), max 4: PASS (strictly above every competitor)
- T4: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 3.33 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 2.67, best competitor 2.00 (BASE), max 4: FAIL (strictly above every competitor; FAILED: a run of ours made no Skill call, so it measures the bare model)
- T7: ours 4.67, best competitor 5.00 (JD), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)
- T8: ours 5.00, best competitor 5.00 (BASE), max 5: PASS (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 33.33, best competitor total 22.33 (JD), needs 26.80: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### What changed against round 3, and why it still fails

- T3 and T4 now reach the maximum in every run (the verdict and the usage report come from `workproof verdict` and `workproof sessions`, so the template and the numbers no longer depend on the model). T8 reaches 5.00 in every run through `workproof bullets`. T1, T2 and T5 pass as before.
- T6: the skill fired in two of three runs (round 3: none) and the mean rose from 2.00 to 2.67, but the run without a Skill call fails the required-Skill rule, and in that run the file gave 76 commits with 63 only as a sub-count and no basis for treating the addresses as one person. The hook adds its line to the prompt; the model still chose not to load the skill in one run. All three runs lack the stated basis for the identity grouping (C5), which is a thing the skill text can ask for explicitly.
- T7: 4.67 against 5.00 for JD Resume Tailor (both its plain and its invoked arm score the maximum on its own example). One of our runs had no Summary section in the file. The command prints no summary, and the skill told the agent to write one; the agent did not.
- Rule A passes: 33.33 against 22.33 for JD Resume Tailor's invoked arm.
- Hook, measured on the frozen lists before the round: 16 of 16 positives and 8 of 8 task prompts match, 0 of 20 frozen negatives and 0 of 20 extra negatives match, median runtime about 20 ms on a quiet machine. The first version of the hook had 14 false triggers on 21 prompts written by an independent reviewer; the patterns were tightened (first-person or workproof anchors) before any run. The patterns were tuned while the positive list was visible, so the positive rate is not an independent measurement; the 20 extra negatives were written after the first review and the hook has not been tuned against them beyond the review.

### What a round 5 would change (not run)

1. `workproof bullets` could print the `## Summary` heading with a fixed first line built from the top-ranked entries, so a missing Summary cannot happen; and the skill could end the tailoring steps with a checklist the agent must tick (Summary, Skills, Experience, Gaps, Coverage, Ordering check).
2. For T6, make the stated basis a deterministic output: `workproof` already prints which addresses it merged and why; the skill should say "write that sentence into mine.md". A `workproof mine` subcommand that prints a ready `mine.md` (commits as non-merge, lines, merged addresses and the rule that merged each) would remove the model from that task.
3. Whether a skill-less run can still happen with the hook on is a model choice; the only deterministic fix is a command (a slash command or the CLI) that the prompt itself triggers, which is outside what a plugin can force.

Caveats: three runs per cell is a small sample; one grader call pools the runs of a task; F6 (an independent re-run of a random 10 percent of cells), F9 (Haiku and Opus runs) and the held-out tasks belong to the final gate and were not done.

## Results, round 5

Date: 2026-10-21. Build under test: commit bdf40b1 (branch plugin-leadership); rulings and the round 5 hook prompt list frozen in commit e040e4a before the code changes. Sonnet, 3 runs per task per arm, 192 new runs, graded blind by one Sonnet call per task over all eight arms, every run in a temporary HOME. The configuration guard (hooks and mcpServers of the real configuration, before and after every run) stayed clean; no run was stopped; all 192 grader replies were valid JSON. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round5.tar.gz` (Gmail addresses and the account name redacted). Scope of any claim: these eight tasks, this model, this date.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 0.67 (0-2, n=3) | 0.67 (0-2, n=3) | 1.67 (1-2, n=3) | 0.33 (0-1, n=3) | 1.00 (0-2, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 1.00 (1-1, n=3) | 0.33 (0-1, n=3) | 0.33 (0-1, n=3) | 1.00 (0-2, n=3) | 3.00 (3-3, n=3) | 0.33 (0-1, n=3) | 0.67 (0-1, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.67 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 1.33 (0-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.67 (2-3, n=3) | 0.67 (0-2, n=3) | 2.33 (2-3, n=3) | 2.33 (2-3, n=3) | 4.33 (4-5, n=3) | 2.33 (2-3, n=3) | 2.00 (2-2, n=3) |
| T6 (4) | 3.67 (3-4, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 4.33 (4-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (35) | 34.00 | 21.33 | 19.33 | 23.00 | 17.00 | 21.67 | 19.33 | 16.67 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 5.00 (5-5, n=3) | 1.67 (1-3, n=3) | 1.67 (1-3, n=3) | 2.67 (2-3, n=3) | 1.33 (1-2, n=3) | 2.00 (1-3, n=3) | 1.00 (1-1, n=3) | 3.00 (3-3, n=3) |
| T2 (5) | 5.00 (5-5, n=3) | 2.00 (2-2, n=3) | 1.00 (0-2, n=3) | 0.67 (0-2, n=3) | 1.67 (0-3, n=3) | 4.00 (4-4, n=3) | 1.33 (1-2, n=3) | 1.33 (0-2, n=3) |
| T3 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) |
| T4 (5) | 5.00 (5-5, n=3) | 3.00 (3-3, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.33 (3-4, n=3) | 1.33 (0-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.67 (2-3, n=3) | 0.67 (0-2, n=3) | 2.33 (2-3, n=3) | 2.33 (2-3, n=3) | 4.33 (4-5, n=3) | 2.33 (2-3, n=3) | 2.00 (2-2, n=3) |
| T6 (5) | 4.67 (4-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 4.33 (4-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (40) | 39.00 | 25.33 | 24.00 | 27.33 | 20.67 | 25.67 | 23.33 | 20.33 |

### Skill calls in our runs

T1 1, 1, 1; T2 1, 1, 2; T3 1, 2, 1; T4 1, 1, 1; T5 2, 2, 2; T6 1, 1, 1; T7 1, 1, 1; T8 1, 1, 1. Every run of ours called the skill (round 4: T6 had one run without a call).

### Gate

- T1: ours 4.00, best competitor 2.00 (GAP), max 4: PASS (strictly above every competitor)
- T2: ours 4.00, best competitor 3.00 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 3.67 (RCP), max 4: PASS (strictly above every competitor)
- T4: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 4.33 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 3.67, best competitor 2.00 (BASE), max 4: PASS (strictly above every competitor)
- T7: ours 4.33, best competitor 5.00 (JD), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)
- T8: ours 5.00, best competitor 5.00 (BASE), max 5: PASS (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 34.00, best competitor total 23.00 (RCP), needs 27.60: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### What changed against round 4, and why it still fails

- T6 passes: the skill fired in all three runs and the mean rose from 2.67 to 3.67 against 2.00 for every other arm. Two runs state the basis for the grouping through `workproof mine`; the third reached the numbers but kept the basis in the chat and not in `mine.md` (C5).
- T7 is the only task that fails: 4.33 against 5.00 for JD Resume Tailor (both its arms). Two of our three files kept the command's content but lost the `## Summary` heading and the Experience or Projects heading: the agent saved the Summary line without its heading and renamed the sections. The command prints the Summary and the skill says to keep it; the agent did not follow the file shape in two runs.
- T1 to T5 and T8 pass; T4 and T8 reach the maximum in every run.
- Rule A passes: 34.00 against 23.00.
- F9 (Haiku and Opus runs of the eight public tasks) was to follow only if the gate passed; it did not pass, so F9 was not run.

### What a round 6 would change (not run)

1. Let `workproof bullets` write the finished file shape itself: a `--resume` mode that prints `# <name>`, `Target role:`, `## Summary`, `## Skills`, `## Experience` (or `## Projects`) with the entry heading lines copied from the source, then Gaps, Keyword coverage and Ordering check, so the agent only saves the output and adds at most one sentence. That removes the step on which two runs failed.
2. Let `workproof mine --out mine.md` be the only instruction for the several-addresses task, so the basis cannot stay in the chat.

Caveats: three runs per cell is a small sample; one grader call pools the runs of a task; F6 (an independent re-run of a random 10 percent of cells) and the held-out tasks belong to the final gate and were not done.

## Results, round 6

Date: 2026-10-22. Build under test: commit 2ca46ba (branch plugin-leadership); rulings frozen in commit 5902eda before the code changes. Sonnet, 3 runs per task per arm, 192 new runs at parallelism 2, graded blind by one Sonnet call per task over all eight arms, every run in a temporary HOME. The configuration guard (hooks and mcpServers of the real configuration, before and after every run) stayed clean. The first background launcher stopped after 64 runs when its shell ended; the 128 unfinished cells were started again and every cell was run once to completion. `failed-cells.py` listed no cell (no missing result, error result, rate-limit or overload message) before grading, and all 8 grader replies were valid JSON. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round6.tar.gz` (Gmail addresses and the account name redacted). Scope of any claim: these eight tasks, this model, this date.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 0.67 (0-2, n=3) | 0.00 (0-0, n=3) | 1.67 (1-2, n=3) | 0.00 (0-0, n=3) | 0.67 (0-2, n=3) | 0.00 (0-0, n=3) | 0.67 (0-2, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 1.67 (1-2, n=3) | 1.00 (1-1, n=3) | 0.00 (0-0, n=3) | 1.00 (1-1, n=3) | 3.00 (3-3, n=3) | 1.00 (1-1, n=3) | 1.33 (1-2, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.67 (3-4, n=3) | 3.00 (3-3, n=3) | 3.67 (3-4, n=3) | 2.67 (2-3, n=3) | 3.00 (3-3, n=3) | 2.67 (2-3, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.67 (2-3, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 3.33 (3-4, n=3) | 2.33 (0-4, n=3) |
| T6 (4) | 2.67 (2-4, n=3) | 2.00 (2-2, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (35) | 33.67 | 22.67 | 22.67 | 23.33 | 18.00 | 23.00 | 21.33 | 16.00 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 5.00 (5-5, n=3) | 1.67 (1-3, n=3) | 1.00 (1-1, n=3) | 2.67 (2-3, n=3) | 1.00 (1-1, n=3) | 1.67 (1-3, n=3) | 1.00 (1-1, n=3) | 1.67 (1-3, n=3) |
| T2 (5) | 5.00 (5-5, n=3) | 2.67 (2-3, n=3) | 1.67 (1-2, n=3) | 0.00 (0-0, n=3) | 1.67 (1-2, n=3) | 4.00 (4-4, n=3) | 1.67 (1-2, n=3) | 2.00 (1-3, n=3) |
| T3 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) |
| T4 (5) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.67 (2-3, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 3.33 (3-4, n=3) | 2.33 (0-4, n=3) |
| T6 (5) | 3.67 (3-5, n=3) | 3.00 (3-3, n=3) | 2.67 (2-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (40) | 38.67 | 26.67 | 27.33 | 27.33 | 21.67 | 27.00 | 25.00 | 19.67 |

### Skill calls in our runs

T1 1, 1, 1; T2 1, 2, 1; T3 1, 1, 1; T4 1, 1, 1; T5 2, 2, 2; T6 0, 0, 1; T7 1, 1, 1; T8 1, 1, 1.

### Gate

- T1: ours 4.00, best competitor 1.67 (RCP), max 4: PASS (strictly above every competitor)
- T2: ours 4.00, best competitor 3.00 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 3.67 (RCP), max 4: PASS (strictly above every competitor)
- T4: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 4.67 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 2.67, best competitor 2.00 (BASE), max 4: FAIL (strictly above every competitor; FAILED: a run of ours made no Skill call, so it measures the bare model)
- T7: ours 5.00, best competitor 4.00 (BASE), max 5: PASS (strictly above every competitor)
- T8: ours 5.00, best competitor 5.00 (BASE), max 5: PASS (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 33.67, best competitor total 23.33 (RCP), needs 28.00: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### What changed against round 5, and why it still fails

- T7 now passes with the maximum in every run (5.00 against 4.00 for the best competitor): the resume file comes from `workproof bullets --resume`, so the headings and the entry lines are the command's.
- T6 is the only failing task. The skill did not fire in two of three runs, and neither of those runs ran `workproof mine`: they counted with git and reported 76 commits (63 only as a sub-count) with no stated rule for grouping the addresses. The third run called the skill and passed all outcome criteria. The hook adds its line to the prompt in every run; whether the model then loads the skill is its own choice. Under the ruling of round 5 this is recorded as a model choice and the task is not changed.
- T1 to T5 and T8 pass; T4 and T8 reach the maximum in every run.
- Rule A passes: 33.67 against 23.33.
- F9 (Haiku and Opus) was to run only if the gate passed; it did not, so it was not run.

### What a round 7 would change (not run)

1. Nothing in the skill text decides whether the model loads the skill for a prompt that never uses a word of our domain. The remaining deterministic route is a slash command or the CLI named in the prompt, which the user chooses, so the claim should be scoped: with the skill loaded, workproof is at or above the maximum on all eight tasks; for T6, when the prompt names no tool, the model loaded the skill in one run of three.
2. A hook cannot force a tool call. If the owner accepts a scoped claim, the gate can count T6 on the runs that called the skill and report the skill-call rate separately; that is a change of the gate and needs a ruling.

Caveats: three runs per cell is a small sample; one grader call pools the runs of a task; F6 (an independent re-run of a random 10 percent of cells) and the held-out tasks belong to the final gate and were not done.

## Results, round 7

Date: 2026-10-22. Code under test: commit 0cc1159, run from an immutable `git archive` copy of that commit (`/private/tmp/h2h-wp-r7-code`, with its commit hash in `ARCHIVE_COMMIT`); before the first run the copy was built and probed (CLI version 0.7.0, the four new commands in `--help`, `addr_extra` in the hook, and its file list equal to `git ls-files` of the commit). The working tree was clean and HEAD unchanged for the whole round (checked before and after the runs). Rulings frozen in commit 36e6772 before the code change. Sonnet, 3 runs per cell, parallelism 2, every run in a temporary HOME, guard clean. New runs: T6 for all eight arms (24) and T1 to T8 for ours (21 more); every other cell is the unchanged round 6 cell of that competitor arm (147 cells), so the table is a combined set. `failed-cells.py` listed nothing before grading. One grader reply (T8) was not valid JSON (kept as `T8-grade.attempt1.json`); the same prompt was graded again and that reply is scored. The transcripts, grader prompts, label maps and grades are in `bench/head-to-head/results/round7.tar.gz` (Gmail addresses and the account name redacted). Scope of any claim: these eight tasks, this model, this date.

Hook measurements (round 7 change): 132 ms median on a 10,001-commit repository (limit 300 ms), about 80 ms on a 299-commit one, silent outside a repository and above 20,000 commits, 0 false triggers on the 20 frozen and 20 extra negatives and on the 8 round 5 negatives.

### Outcome criteria only (the gate counts these)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | 3.67 (3-4, n=3) | 0.67 (0-2, n=3) | 0.00 (0-0, n=3) | 1.67 (1-2, n=3) | 0.00 (0-0, n=3) | 0.67 (0-2, n=3) | 0.00 (0-0, n=3) | 0.67 (0-2, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 1.67 (1-2, n=3) | 1.00 (1-1, n=3) | 0.00 (0-0, n=3) | 1.00 (1-1, n=3) | 3.00 (3-3, n=3) | 1.00 (1-1, n=3) | 1.33 (1-2, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 3.00 (2-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) | 3.33 (2-4, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-3, n=3) | 2.00 (2-2, n=3) | 3.00 (2-4, n=3) | 2.00 (2-2, n=3) | 1.33 (0-2, n=3) |
| T6 (4) | 3.67 (3-4, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.33 (2-3, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.67 (2-3, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (35) | 34.33 | 22.33 | 21.33 | 23.00 | 15.33 | 23.33 | 20.33 | 15.67 |

### All criteria, process criteria included

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (5) | 4.67 (4-5, n=3) | 1.67 (1-3, n=3) | 1.00 (1-1, n=3) | 2.67 (2-3, n=3) | 1.00 (1-1, n=3) | 1.67 (1-3, n=3) | 1.00 (1-1, n=3) | 1.67 (1-3, n=3) |
| T2 (5) | 5.00 (5-5, n=3) | 2.33 (2-3, n=3) | 1.67 (1-2, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 4.00 (4-4, n=3) | 1.33 (1-2, n=3) | 2.00 (1-3, n=3) |
| T3 (5) | 5.00 (5-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 4.00 (3-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.33 (3-5, n=3) |
| T4 (5) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-3, n=3) | 2.00 (2-2, n=3) | 3.00 (2-4, n=3) | 2.00 (2-2, n=3) | 1.33 (0-2, n=3) |
| T6 (5) | 4.67 (4-5, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.67 (2-3, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) |
| Total (40) | 39.33 | 26.00 | 26.00 | 27.00 | 19.33 | 27.33 | 23.67 | 19.33 |

### Skill calls in our runs

T1 1, 1, 1; T2 1, 1, 1; T3 2, 1, 1; T4 1, 1, 1; T5 2, 2, 2; T6 0, 1, 1; T7 1, 1, 1; T8 1, 1, 1.

### Gate

- T1: ours 3.67, best competitor 1.67 (RCP), max 4: PASS (strictly above every competitor)
- T2: ours 4.00, best competitor 3.00 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T4: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 3.00 (JD), max 5: PASS (strictly above every competitor)
- T6: ours 3.67, best competitor 2.33 (JD), max 4: FAIL (strictly above every competitor; FAILED: a run of ours made no Skill call, so it measures the bare model)
- T7: ours 5.00, best competitor 4.00 (BASE), max 5: PASS (strictly above every competitor)
- T8: ours 5.00, best competitor 5.00 (BASE), max 5: PASS (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 34.33, best competitor total 23.33 (JD), needs 28.00: PASS
rule B: FAIL
gate: FAIL

Gate: FAIL.

### What changed against round 6, and why it still fails

- T6 rose from 2.67 to 3.67 against 2.33 for the best other arm. Two runs scored the maximum. The third counted the right commits (63 non-merge) but made no Skill call, did not run `workproof mine` and gave no reason why the addresses belong to one person (C5). The hook put the computed count into its context, but the model wrote the file without the stated basis. The frozen rule requires a Skill call in every T6 run, so the gate fails on that cell even though the outcome mean is above every other arm.
- T7 and T8 stay at the maximum in every run, T4 and T3 reach the ceiling, T2 and T5 pass. T1 is 3.67 against 1.67: in one run the grader judged the attachable report to contain an email, path or code (C3), which it does not; the same file scored full marks in the other two runs.
- Rule A passes: 34.33 against 23.33.
- F9 (Haiku and Opus) follows only a passing gate; it was not run.

### What a round 8 would change (not run)

1. The hook cannot make the model write the basis. The computed context could carry the basis sentence in the exact form for the file ("Counted as the same person because ..."), so a run that uses the hint without the skill still has the sentence to paste; and the gate rule for T6 could require the outcome criteria and report the skill-call rate separately. The second part is a change of the frozen gate and needs a ruling.
2. Caveats: three runs per cell is a small sample; one grader call pools the runs of a task; F6 and the held-out tasks were not done.

## Results, final gate

Date: 2026-10-22, in a Claude Code cloud session. Code under test: commit `bf54483` (the squashed branch commit that carries the hook's paste-ready basis sentence, the product of `4564186` before the squash), run from an immutable `git archive` copy of it, built with `npm ci && npm run build`. Before the first run, `--help` listed `sessions`, `verdict`, `bullets` and `mine`, and the hook held the "Counted as the same person ..." sentence. The product was not changed during or after the runs. Sonnet (`claude-sonnet-5-5`), 3 runs per cell, parallelism 2, a temporary HOME for every run. The guard stayed clean: `~/.claude/settings.json` does not exist in this container and stayed absent, and the hash of `mcpServers` in `~/.claude.json` did not change. `failed-cells.py` listed nothing before grading. Blind grading used one Sonnet call per task over the pooled arms. Score summaries: `bench/head-to-head/results/final-gate-T6.md` and `final-gate-heldout.md`. Raw transcripts are not committed.

Setup differences from earlier rounds, all in the harness and none in the product:

- The round 7 transcripts (`results/round7.tar.gz`) and the frozen F3 files (`fixtures/F3-round3/`) are not on this branch, because the squash left them out. So T6 was re-run and graded blind for all eight arms (24 new runs) instead of being pooled with round 7 cells. F3 was rebuilt by the same recipe: `forge3.mjs` applied to a fresh report of F1, where the honest report gave 63 commits and 697 lines, the forged one 103 and 1,197, and `check` passes. F3 is used only by F9, which was not run.
- `failed-cells.py` and `grade.sh` matched only `T<n>` task ids. That would have skipped the held-out runs, so they were fixed before any held-out run was graded (commit `fix(bench): match held-out run names ...`).
- Each child `claude -p` ran through a wrapper that removes the parent cloud session's variables, so every run is its own session.
- Isolation caveat: the runs could see the repository working tree on the same disk. Six runs of ours (H2 and H3) read skill reference files from it. Those files are byte-identical to the archived commit, and no run of any arm read a benchmark, truth, criteria or held-out file. Even so, the next run should hide the working tree from the agents.

### Public T6, re-run (outcome criteria only)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T6 (4) | 3.67 (3-4, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.33 (2-3, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |

T6 passes (3.67 against 2.33). Every run of ours made a Skill call. Two runs pasted the basis sentence. One run (2) rewrote the CLI output into a table of addresses without the basis, so it fails C5. With the round 7 cells of the other seven tasks, the public set stays at 34.33 of 35 for ours. The best other arm is now RCP_I at 23.33 (its T6 rose from 2.00 to 2.33), and JD_I falls to 23.00 (its T6 fell from 2.33 to 2.00). Rules A and B pass on the public set.

### Held-out tasks (outcome criteria only; all 15 criteria are outcome criteria)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| H1 (5) | 1.67 (0-5, n=3) | 4.33 (4-5, n=3) | 4.00 (3-5, n=3) | 4.33 (3-5, n=3) | 3.67 (3-4, n=3) | 4.33 (4-5, n=3) | 4.33 (3-5, n=3) | 4.67 (4-5, n=3) |
| H2 (5) | 4.00 (4-4, n=3) | 2.33 (1-3, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) | 2.67 (2-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.67 (3-4, n=3) |
| H3 (5) | 2.00 (2-2, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 4.00 (4-4, n=3) | 5.00 (5-5, n=3) | 4.00 (3-5, n=3) | 3.67 (3-4, n=3) |
| Total (15) | 7.67 | 11.33 | 10.00 | 11.00 | 10.33 | 12.67 | 12.00 | 12.00 |

Skill calls in our runs: H1 1, 1, 1; H2 2, 2, 2; H3 1, 1, 2.

- H1: ours 1.67, best competitor 4.67 (GAP_I): FAIL
- H2: ours 4.00, best competitor 3.67 (GAP): PASS
- H3: ours 2.00, best competitor 5.00 (JD_I, at the maximum): FAIL
- Rule A: ours lost 7.33 points, best other arm (JD_I) lost 2.33. Ours needs at least 15.20 of 15 by the 20 percent rule, so FAIL. Rule B: FAIL.

**Final gate: FAIL.** The held-out set fails on H1 and H3, and the product may not be changed against these tasks. F9 (Haiku and Opus) and F6 (independent 10 percent audit) were not run: they cannot turn a failed gate into a pass, and the rulings of rounds 5 and 6 run F9 only after a passing gate.

Cost (sum of `total_cost_usd`): T6 set $1.94 (24 runs), held-out set $17.74 (72 runs). Mean per held-out run: ours $0.14, other arms $0.23 to $0.31.

### Why the held-out tasks fail (from the transcripts and the grader's reasons)

1. **H1: the skill declined the task.** In two of three runs the skill noticed that the repository is the public Express project (the fixture is a public clone with history added). It told the user the repository looks public, did not build `./evidence/`, and asked for confirmation instead. All five criteria need the package, so those runs scored 0. The third run built it and scored 5. The bare model and every competitor built the package. The public-repository warning should be a line inside the package, not a stop.
2. **H3: `workproof verdict` handles only workproof's own report format.** The received `report.json` is a different format (`commits_authored`, `lines_added`, `figures_sha256`). The verdict command rejected it before comparing anything, and the agent passed that on as "not compared". It never counted the figures with git. Every run missed the altered commit and line figures and confirmed none of the true ones (C1 to C3). The bare model counted them with git and scored 4.67. A report in a foreign format needs a git-derived comparison path, with the CLI or the skill falling back to plain counting.
3. **H2 passes, but C4 fails in every run:** the chat answer listed email addresses and named the lookalike colleague (Deldycke-Martin) while explaining the exclusions. The privacy defaults have to cover the final chat answer, not only the files.

Scope: three held-out tasks and one public task, Sonnet, 2026-10-22, 3 runs per cell. Nothing about the benchmark is claimed publicly.

## Rulings, round 8

Recorded 2026-10-22 after the final gate, before any round 8 code change. The three held-out tasks H1 to H3 are seen; they serve diagnosis only and never again as held-out evidence.

1. Public-looking repository (cause of the H1 loss). The skill never stops or asks for confirmation because a repository looks public. It builds `./evidence/` as asked and writes one line about the public look inside the package (README of the package or the report note), not in place of the package. Test: a skill-text test that the stop-and-ask instruction is absent and the one-line note is present; checked by the public T1 re-run and by the new held-out set.
2. Foreign report format (cause of the H3 loss). When `workproof verdict` receives a report that is not workproof's own format, it does not stop at "not compared". It falls back to plain git: it names the figures it recognises in the report (commits, added lines, any author identifier), counts the same figures from the repository with read-only git (`git shortlog -sne --no-merges`, `git log --numstat`, `git blame -w -M` as the existing counter does), prints both side by side, and states which figures differ. It says that a hash in a foreign format cannot be checked. The skill says the same when the CLI is not used. Test: the CLI reads a foreign-format fixture and prints a comparison.
3. Privacy in the chat answer (cause of the H2 criterion C4 loss). The final chat answer follows the same defaults as the files: no email addresses, and no names of other people unless the user asked for them. An exclusion is described by rule ("one similar name on a different address was left out"), not by the person's name or address. Test: a skill-text test that the instruction covers the final answer.
4. Criteria, tasks, checkers, labels, grader prompts and the gate rules of the eight public tasks do not change. The Skill-call and command requirements stay process measures (final gate ruling 1).
5. Final gate, second attempt, in this order: public set (ours, ruling of the measurement protocol below), then a new held-out set, then F9, then F6. The new held-out set is written by an agent that has not read our code, our public tasks or the first held-out set, in a folder outside the repository. It is committed on a new local branch that is not pushed. Nobody reads it before the product is frozen at its final commit; the product does not change after it is read. The agents of the runs work in a copy made with `git archive`, and the held-out runs use fixtures outside the repository working tree.
6. If the public set fails after the product change, the held-out set is not run in this session (cost), and the report says so.

## Round 8 measurement protocol (frozen 2026-10-22, owner decision)

Written and committed before any round 8 benchmark run. This section is not changed after a result is seen.

Rule. On a task that did not change (task text, fixture, check script, labels, grader and its prompt, model, competitor arm version identical to the last published round), the scores of the competitor arms and of the baseline (plain Claude) are taken as they stand in the last published round. On those tasks only our arm (OURS) is run again, 3 runs, and graded with the same grader script, prompt and model (Sonnet). On a changed or new task, all arms run 3 times. Rule A, Rule B and the ceiling ruling are computed as before on the combined table. This workproof gate has no cost rule. Reused cells are marked in the result table with their source round (for example "r7 reused").

Unchanged public tasks (source: the tables in this document at commit `04052f3`; round 7 code commit `0cc1159`; T6 from "Results, final gate"; `tasks.json`, `labels.json`, `score.py`, `assemble.py`, `grade.sh` and the competitor plugin directories are byte-identical to those of that round). Outcome criteria, mean of 3 runs:

| Task (max) | Source | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I |
|---|---|---|---|---|---|---|---|---|
| T1 (4) | r7 | 0.67 | 0.00 | 1.67 | 0.00 | 0.67 | 0.00 | 0.67 |
| T2 (4) | r7 | 1.67 | 1.00 | 0.00 | 1.00 | 3.00 | 1.00 | 1.33 |
| T3 (4) | r7 | 3.33 | 3.67 | 4.00 | 3.00 | 3.67 | 3.67 | 3.33 |
| T4 (4) | r7 | 3.67 | 4.00 | 4.00 | 3.33 | 4.00 | 3.67 | 4.00 |
| T5 (5) | r7 | 2.00 | 2.00 | 2.67 | 2.00 | 3.00 | 2.00 | 1.33 |
| T6 (4) | final gate | 2.00 | 2.00 | 2.33 | 2.00 | 2.00 | 2.00 | 2.00 |
| T7 (5) | r7 | 4.00 | 3.67 | 3.67 | 4.00 | 4.00 | 3.00 | 3.00 |
| T8 (5) | r7 | 5.00 | 5.00 | 5.00 | 0.00 | 2.67 | 5.00 | 0.00 |

The best other arm total is then 23.33 (RCP_I), as published. If any of these eight tasks is changed before the run, the changed task runs with all arms. Competitor arms are not re-run on these tasks.

Grading of the reused set. The round 7 and final gate transcripts of the competitor arms are not part of the new grading packet; our new runs are graded as one blind packet per task, ours only, with the same grader prompt template, criteria and ground truth. This differs from rounds 2 to 7, where one call pooled all arms of a task; the difference is recorded as a caveat in the results.

Held-out tasks, F9 (Haiku and Opus) and F6 are exempt from this rule: all arms run in full there.

Budget stop. The sum of `total_cost_usd` of all `claude -p` runs of this session is written to `workproof-cost.tsv`; no new run starts once it reaches 28.8 USD, and the report says which steps were not run.

## Results, round 8

Date: 2026-10-22, local session, API-key billing (`apiKeySource` checked: `ANTHROPIC_API_KEY`). Code under test: commit `e9eac0e`, run from an immutable `git archive` copy (`/private/tmp/h2h-wp-r8-code`, built, `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `verdict` code holds the foreign-format path). Rulings frozen in `64a2ee4`, measurement protocol frozen in `3a8f7d0`, both before the code change and before any run. Sonnet (`claude-sonnet-5-5`), parallelism 2, temporary HOME per run, guard clean (no STOP file). One run (T3 ours 3) ended in an error result and was repeated before grading. Fixtures: the round 7 fixtures (`/private/tmp/h2h-wp-r7`). Per the protocol, only OURS ran (24 runs, 3 per task); competitor and baseline cells are reused ("r7 reused", T6 "final gate reused"). Ours was graded as one blind packet per task, ours only (not pooled with competitor outputs as in rounds 2 to 7: a recorded caveat). The held-out set, F9 and F6 were not run (ruling 6: the public set failed; and the run budget).

### Outcome criteria only

| Task (max) | OURS (r8) | best other arm (reused) | Result |
|---|---|---|---|
| T1 (4) | 4.00 | 1.67 RCP_I (r7 reused) | PASS |
| T2 (4) | 4.00 | 3.00 JD_I (r7 reused) | PASS |
| T3 (4) | 4.00 | 4.00 RCP_I (r7 reused) | PASS (ceiling) |
| T4 (4) | 4.00 | 4.00 RCP, RCP_I, JD_I, GAP_I (r7 reused) | PASS (ceiling) |
| T5 (5) | 5.00 | 3.00 JD_I (r7 reused) | PASS |
| T6 (4) | 4.00 | 2.33 RCP_I (final gate reused) | PASS |
| T7 (5) | 4.67 (4-5) | 4.00 BASE, JD, JD_I (r7 reused) | PASS |
| T8 (5) | 4.67 (4-5) | 5.00 BASE, RCP, RCP_I, GAP (r7 reused) | **FAIL** (ceiling: a competitor is at the maximum and ours is not) |
| Total (35) | 34.33 | 23.33 RCP_I | |

Rule A: lost 0.67, the best other arm lost 11.67, limit 9.33: PASS. Rule B: FAIL (T8). **Public gate: FAIL.**

Skill calls in ours: every run called the skill at least once (T1 1,1,1; T2 2,1,1; T3 2,1,1; T4 1,1,1; T5 2,2,2; T6 1,1,1; T7 1,1,1; T8 1,1,1). `workproof bullets` ran in 3 of 3 runs of T7 and T8.

### Why T8 (and T7) lose one point

In T7 run 3 and T8 run 3 the resume file is correct, but the final chat answer never tells the user about the skill gaps (C3: "the final answer text only says a background search finished" / "never tells the user about the Rust/gRPC gap"). The Gaps section is in the file. The three round 8 product changes (public look, foreign report, chat privacy) did not touch this path; the loss is run variance in the final answer, 1 run of 3 on each task. T1 (the public-looking repository) rose from 3.67 to 4.00 and T6 stays at 4.00 of 4.

### What a round 9 would change (not run, needs the owner's go)

1. Tailoring: the final chat answer states the Gaps list in one sentence (a skill rule and a test), frozen as a ruling before the change.
2. Then ours x3 on T7 and T8 (protocol: the other tasks' cells stay as they are only if the product change does not touch them; otherwise all eight).
3. Only if the public set passes: new held-out set (written, unread, in `~/claude-kredi-runs/2026-10-22/heldout-r8/`, not committed), F9, F6. It needs about 20 USD for 72 held-out runs; the cost so far is in `workproof-cost.tsv`.

Cost (sum of `total_cost_usd`): public 24 runs 3.87 USD, T3 repeat 0.07 USD; grading about 1.4 USD (estimate, `grade.sh` does not record cost).

## Rulings, round 9

Recorded 2026-10-22 on the owner's go ("fastest and highest quality benchmark result, objective first place against the strongest alternatives"), after round 8 and before any round 9 code change. Nothing in this section is changed after a result is seen.

1. Tailoring and gap answers (cause of the T7 and T8 loss, 1 run of 3 each). When a task produces a Gaps list (a tailored resume, a CV or bullets against a job description), the last chat message of the turn says the Gaps list in one sentence ("Not in your facts: X, Y. Add them to your bank if they are true."; "every requirement is covered by a fact" when Gaps says "None."). The sentence stands in the final message itself, after any background step has finished. A turn never ends on a status note alone. Change: the skill rule in `references/tailor.md` and `SKILL.md`; test: a skill-text test for both. The command output is not changed.
2. The 6 older archive tests in `test/head-to-head-doc.test.mjs` (rounds 2 to 7) fail only because `bench/head-to-head/results/round*.tar.gz` were left out of the squashed branch on purpose (raw transcripts, see HANDOFF-CLOUD). They are unrelated to the product. The archive-existence assertion is made conditional on the archive being present; every other assertion of those tests stays.
3. Criteria, tasks, checkers, labels, grader prompts and gate rules of the eight public tasks do not change.
4. New competitor arms, from the scan `workproof-scan.md` (2026-10-22): `session-report@claude-plugins-official` (sha `af59ee3`, task T4 field) and `cv-builder` (sha `f7c8c3b`, skills only, the `.mcp.json` removed so that no network server runs; its invoked arm `_I` too). Set up like the existing arms: `git archive` of the pinned sha, hash guard around every run.
5. Final gate order stays: public set, new held-out set (local branch `heldout-2026-10-b`, not pushed), F9, F6. The product does not change after the held-out files are opened.

## Round 9 measurement protocol (frozen 2026-10-22, owner decision)

Written and committed before any round 9 benchmark run. This section is not changed after a result is seen.

Code under test: commit `8a87409` (rulings frozen in `a6a5cfd`), run from an immutable `git archive` copy built with `npm ci && npm run build`. Model Sonnet (`claude-sonnet-5-5`), parallelism 2, temporary HOME per run, `guard.sh` check around every run. Billing: `apiKeySource` = `ANTHROPIC_API_KEY` (checked with the runner's own environment).

New arms (additive, set up by `git archive` of a pinned sha; neither is run from a clone):

- SR / SR_I: `session-report` from `anthropics/claude-plugins-official`, path `plugins/session-report`, sha `af59ee3a1051a29dda4a2e7a2af221aa457ae08b`, tree hash `c8de6d7ce0345b2d`. Unpatched: its analyzer reads `~/.claude/projects`, and the T4 prompt names the log folder, so the agent passes `--dir`. The directory has no `plugin.json` in the upstream tree; it loads as `session-report:session-report`.
- CV / CV_I: `cv-builder` from `flodirka/cv-builder-plugin`, sha `f7c8c3b6d379f8d12ca1c70fc7576652dcdfe16c`, v0.2.1, tree hash `a1547512ad965594` after one removal: `.mcp.json` (its remote MCP server runs on a third-party host and would break isolation). Skills only; its browser editor is therefore not part of this arm. Run with `--strict-mcp-config`, init lists no MCP server.
- The invoked prompts are in `tasks.json` ("SR", "CV"); they name the skills and are additive. All other keys of `tasks.json`, `labels.json`, the check scripts and the grader prompt template are unchanged.

Runs. On all eight public tasks: OURS x3 and the four new arms (SR, SR_I, CV, CV_I) x3 each. Existing arms (BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I) are not re-run: their cells are copied from the round 7 run folders (`h2h-wp-r7-runs`; T6 competitor cells also from there), unchanged tasks, unchanged plugin directories. Order: OURS first, then the new arms by task: T4, T7, T8, T2, then T1, T3, T5, T6.

Grading. One blind packet per task with ALL arms together in a shuffled letter order (ours, the four new arms and the reused cells of the seven existing arms). This replaces the ours-only grading of round 8. Same grader script, prompt template and model (Sonnet). Official scores: every arm's score from this pooled grading. Beside it the published scores of the reused arms (protocol of round 8, table above) are listed; Rule A, Rule B and the ceiling rule are evaluated on both tables, and the less favourable result for ours is the official one. Incomplete cells (rate limit, error) are repeated, never graded.

Gate and budget. The gate is the same as in round 8 (Rule B with the ceiling rule, Rule A, outcome criteria only, better of plain and invoked arm for every competitor), now including the four new arms. Controller limit 6 USD (`--max-budget-usd`); all `claude -p` runs and the grading of this session are recorded in `workproof-r9-cost.tsv`; no new run starts at 22.4 USD, the total stops at 28 USD, and the report lists the steps not run. Final gate (held-out set on the local branch `heldout-2026-10-b`, F9, F6) runs only if the public gate passes and the budget stop leaves room for all arms x3; a partial final gate is not reported as a pass.

## Round deep design (frozen before code)

Recorded 2026-10-22 after `docs/RESEARCH-DEEP-2026-10-22.md` (commit `fb0e173`) and before any product change of this round. Nothing in this section changes after a result is seen. The tasks, criteria, labels, graders and gate rules of the eight public tasks do not change. The old held-out tasks H1 to H3 are seen and serve only for diagnosis. The new held-out set (`~/claude-kredi-runs/2026-10-22/heldout-r8/`, written by an agent that did not read our code) has not been opened by this session and stays unopened until the product is frozen.

Rules for every change: (a) it is general and names no file, person, address or repository of a seen task; (b) code is taken only from MIT, Apache-2.0, BSD or CC0 sources, with attribution in `THIRD-PARTY-NOTICES.md`; GPL, AGPL, MPL and unlicensed sources give ideas only; (c) every change has a test, `npm test` passes, and a reviewer reads the diff.

Loss classes addressed (from Phase 1): final chat answer lacks what only the file holds; privacy applies to files only; tool-only dependency with no fallback (parser strictness on unseen formats); model rewrites deterministic output.

### Selected

1. **Answer check at the end of the turn (Stop hook).** A new `Stop` hook runs `workproof stop-check` on the hook input (transcript path, `stop_hook_active`). It acts only when the transcript shows that a workproof command ran in the turn, and it blocks at most once (`stop_hook_active` true means allow). It blocks when the last assistant message (i) contains an email address that appears in the repository's author data (`git log --format=%ae%n%ce`, read-only) or any email address the transcript's workproof output printed, or (ii) follows a `workproof bullets` run whose output has a Gaps section and the message contains neither the Gaps items nor a sentence that says every requirement is covered. The block reason is one sentence that states what to change. Source of the idea: the fixed, mandatory closing sections of JD Resume Tailor (`SKILL.md:47,78-87`, MIT) and the "never send the email" rule of receipts (`README.md:64-65`, Apache-2.0); the mechanism (a deterministic check, not a prompt rule) is our own. Classes: final answer incomplete; privacy in chat; model rewrites output.
2. **Closing statement for every task type.** `SKILL.md` gets one short rule that generalises round 9 ruling 1: the last chat message states, in the chat, the result of every check and limit that the file holds (gaps, differing figures with the git counts, the basis sentence, exclusions described by rule, the path of the package and its one-line public-look note), and a turn never ends on a status note. Test: skill-text test.
3. **Tolerant foreign-report reader.** `src/foreign.ts` matches figures by normalised key (case, separators, common synonyms for commits, added lines, author, hash), walks nested JSON, and for non-JSON input (markdown, CSV, plain text) extracts "N commits" and "N lines" patterns. When nothing is recognised it says so and the skill counts with plain git. It never stops at "not compared". Idea sources: the manuals of `git shortlog`, `git log --numstat`, `.mailmap` (git); no code taken. Class: tool-only dependency, parser strictness.
4. **Tolerant job-description reader with hard-requirement flags.** `parseJd` in `src/bullets.ts` falls back to sentence and clause splitting when no requirement lines are found, and flags lines with must-have, work-authorisation, citizenship, visa, degree or clearance wording as hard requirements that are reported as gap lines when no fact covers them, without blocking the run. Idea source: cv-builder `tailor-resume/SKILL.md:32-36,63-67` (MIT); text is rewritten, not copied. Class: parser strictness; gap quality.

### Rejected, with reason

- Adding `-C` (copy detection) to `git blame` and `--ignore-revs-file`: changes the surviving-line figures against the frozen truth files of the public tasks, and the effect on unseen tasks is unmeasured.
- Presidio, scrubadub, KeyBERT, jobbert, spaCy skill matchers: Python or model dependencies for a dependency-light Node CLI; some have no licence. The email deny list from git data is deterministic and enough for the observed leak.
- Name-based masking in the final answer (colleague names): no reliable list of "other people" without the user's intent; kept as a skill rule (round 8 ruling 3), not a hook.
- session-report ideas (active time with idle cutoff, prompt-to-subagent attribution): session-report does not threaten T4; no T4 criterion needs them.
- Trigger widening of `workproof-hint.sh`: no new evidence of a miss in the latest rounds; widening risks false triggers (round 4 fixed 14).
- gitinspector (GPL-3.0), pyresparser (GPL-3.0), OpenResume (AGPL-3.0), git-fame (MPL-2.0): licence; ideas only.
- Fit score with verdict bands (cv-builder, 40/40/20): needs weights we cannot validate; the existing coverage table already reports the same facts.
- cv-builder's "ask before drafting" gate: stalls non-interactive runs; the opposite of ruling 1 of round 8.

### Tests

`test/` gets: stop-check unit tests (email in the author data blocks once; allowed on the second call; no workproof command in the turn means allow; Gaps present in the message means allow; Gaps missing means block); foreign-report tests on JSON with other key names, nested JSON, markdown and CSV; `parseJd` tests on prose and on a hard-requirement line; a skill-text test for the closing statement; the hooks.json test lists both hooks.

## Round deep measurement protocol (frozen 2026-10-22, owner decision, budget-bound)

Written and committed before any run of this round. It replaces the round 9 protocol (which was frozen but never run: no round 9 result exists). Nothing in this section changes after a result is seen.

Code under test: the commit that carries this section (product commit `e4d9057`, docs-only commits after it), run from an immutable `git archive` copy built with `npm ci && npm run build`; `--help` must list `sessions`, `verdict`, `bullets`, `mine` and `stop-check`. Sonnet (`claude-sonnet-5-5`), parallelism 2, temporary HOME for every run, `guard.sh` check around every run. Billing: `apiKeySource` read from the first run's init event must be `ANTHROPIC_API_KEY`.

Why the scope is smaller than round 9: the owner's total limit for this session is 14 USD, of which about 5.0 USD went to research, design and implementation. The round 9 plan (96 new-arm runs, pooled grading of all arms, held-out set with all arms) costs more than 25 USD. This protocol keeps what the budget allows and states what is not run.

Runs:
1. OURS x3 on all eight public tasks (24 runs).
2. New arms, invoked variants only, on the task each one is built for: SR_I on T4, CV_I on T7 and T8, 3 runs each (9 runs). Plain SR and CV, other tasks for the new arms, and the CV_I run on T2 are not run. Arm setup as in the round 9 protocol: `session-report` sha `af59ee3a1051a29dda4a2e7a2af221aa457ae08b` (path `plugins/session-report`), `cv-builder` sha `f7c8c3b6d379f8d12ca1c70fc7576652dcdfe16c` without `.mcp.json`, both by `git archive`, run with `--strict-mcp-config`.
3. Existing arms (BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I) are not re-run. Their scores are the published ones listed in "Round 8 measurement protocol" (best other arm 23.33, RCP_I).

Grading: one blind packet per task, shuffled letters, same grader script, prompt template and model (Sonnet). Tasks T1, T2, T3, T5, T6: ours only. T4: ours and SR_I. T7 and T8: ours and CV_I. The reused arms are not in the packets (cost); this differs from the round 9 plan and is a stated caveat. Outcome criteria only. Rule A, Rule B and the ceiling rule are evaluated against the published reused table plus the new-arm cells; the new arms count as competitors only on the tasks where they ran, and an arm not run on a task is not part of that task's comparison.

Held-out set, F9 and F6: not run in this session. The set in `~/claude-kredi-runs/2026-10-22/heldout-r8/` stays unopened and unused, so it can serve a later session whose budget covers all arms x3 (about 18 USD for 72 runs). No "first place" claim is made from this round.

Budget stops: no run starts when `spend.sh` prints a first number above 160, or when the session total in `workproof-deep-cost.tsv` reaches 13.0 USD. A run that fails (error result, rate limit) is repeated and not graded as a failure of the product. The report lists every step not run.

## Round deep measurement protocol, version 2 (frozen 2026-10-22, owner decision; supersedes the budget-bound version above)

Written and committed before any run of version 2. The 24 OURS runs made earlier on the plain CLI path (commit `a1de44d`, `/private/tmp/h2h-wp-deep-runs`) are not scored and not used: the owner moved all runs to the Agent SDK path. They stay as a diagnosis record only (cost 4.65 USD). Nothing in this section changes after a result is seen.

Run path. Every `claude -p` call (runs, grading, sub-agents) goes through `~/claude-kredi-runs/sdk-shim/claude` first on PATH (`claude_agent_sdk.query()` with the same installed CLI 2.1.308, same stream-json output). Reason: the organisation key gives HTTP 429 "weekly limit" on the plain CLI; the promotional credit covers the Agent SDK. Only measured difference between the two paths: the desktop app's `Artifact` tool and the `artifact-diagramming` skill are absent on the SDK path; the tasks do not use them. All cells re-measured in this round run on the SDK path. Competitor cells of older rounds (CLI path) are not reused anywhere in the scored tables; they appear only in the history above. A run that returns 429 or an authentication error stops the queue and is written into the report.

Code under test: product commit `e4d9057` (later commits are docs only), `git archive` copy `/private/tmp/h2h-wp-deep-code`, built, `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `stop-check`. Sonnet (`claude-sonnet-5-5`), parallelism 3, temporary HOME per run, `guard.sh` around every run. `apiKeySource` of the first run must be `ANTHROPIC_API_KEY`.

Budget (owner): at most 40 USD for runs, grading and sub-agents of this job, tracked in `workproof-deep-cost.tsv`; no new run starts at 36 USD. The full arm set (OURS, BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I on 8 public tasks and the held-out tasks, 3 runs each, about 330 runs) is estimated at 75 USD or more from earlier per-run costs (ours 0.14, others 0.23 to 0.31), so it does not fit. Scope that fits, fixed here before any run:

- Arms: OURS, BASE, RCP_I, JD_I, GAP_I (the invoked variant of each competitor; in every earlier round the invoked arm was equal or better on the tasks where a plain arm led by more than noise only on T3 and T4 for RCP, so plain RCP, JD and GAP are not run), SR on T4 only, CV_I on T2, T7, T8 only (the tasks cv-builder is built for), CV (plain) not run. Task text for `SR`/`CV_I` prompts as in `tasks.json`.
- Public tasks: all eight, 3 runs per cell, in this order: T7, T8, T4, T2, T1, T3, T5, T6. Public runs stop when the cost of the version 2 public runs alone reaches 15 USD.
- Held-out set (`~/claude-kredi-runs/2026-10-22/heldout-r8/`, opened only after the public stage ends; local branch `heldout-2026-10-b`, not pushed): the same arms (SR and CV_I included), 3 runs per cell, until the job total in `workproof-deep-cost.tsv` (research, implementation, the 4.65 USD of discarded CLI-path runs and all version 2 runs) reaches 33 USD. Grading takes the rest. (Clarification written before any version 2 run: the two limits above are separate, the earlier wording 24 and 34 cumulative was ambiguous.)
- Grading: one blind packet per task with all arms of that task together, shuffled letters, same grader script, prompt template and model (Sonnet); outcome criteria only.
- A task whose arms did not all finish 3 runs is reported as incomplete and does not enter Rule A or B. Rule A, Rule B and the ceiling rule are computed over completed tasks only, with the better of the arms that ran as the competitor. Because plain competitor arms are absent, the result cannot support a claim about plain arms, and no "first place" claim is made from a partial table.
- F9 and F6 run only if the gate passes on a complete public and a complete held-out table and budget remains (F9: Haiku and Opus, 1 run per task: ours, best competitor, BASE; F6: 10 percent of cells re-run by an agent that has not read the code). Otherwise they are listed as not run.

### Amendment 1 to protocol v2 (written after the first stage of public runs finished, before any grading or any result was read)

The 132 reduced-set public runs cost 8.0 USD, about a third of the estimate, so the owner's full arm set fits. The arms removed for budget are added back before grading: plain RCP, JD and GAP on all eight public tasks; plain SR and plain CV on all eight; CV_I on the five tasks not yet run. SR_I on T4 stays as an extra arm (it was already run); it counts as a competitor on T4. The held-out stage runs all arms (OURS, BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I) x3. Harness fix made during the first stage, before any grading: `bench/head-to-head/shim/npx` now also maps `npx --yes workproof` to the local build (it handled only `workproof` and `-y workproof`; the first, discarded attempt showed the agent using `--yes`). It affects only the OURS arm and was equal for all OURS runs of the version 2 stage. While the runs went on, whole-disk `find`/`bfs` scans started by agents (a search for the skill's reference files) were killed by a reaper script because they loaded the machine; this slows or ends an agent's search the same way for every arm that starts one. Total budget and stop rules are unchanged.

## Resume

State (updated after round 8: public set 34.33 of 35, Rule B fails T8 by 0.33; see "Results, round 8"): the final gate ran on 2026-10-22 and **failed** on the held-out tasks (see "Results, final gate"). The public set passes (34.33 against 23.33 of 35). These three held-out tasks are now seen. They may be used for diagnosis, but they cannot serve as held-out evidence again.

Next step (round 8, needs the owner's go): first freeze rulings for the three causes above (no stop on a public-looking repository, a git fallback for verdicts on foreign report formats, privacy in the chat answer). Then change the product and re-run the public set. Then have an agent that has not read our code write a **new** held-out set on a new branch, and repeat the final gate in order: held-out, then F9, then F6. Run the agents where they cannot see the repository working tree.

The earlier resume notes stay below for the harness layout.

What exists on this branch:

- `bench/head-to-head/heldout-tasks.json` and `heldout-labels.json`: the three held-out tasks and their outcome/process labels (a blind auditor, committed before any held-out run). All 15 criteria are outcome criteria.
- `bench/head-to-head/heldout/t1..t3/`: `build-fixture.sh`, `truth.py`, `criteria.md`, `truth.txt` for each held-out task. Build with `bash build-fixture.sh <dir>` (needs network to clone the public repository), then run `python3 -I truth.py <dir>` and compare with `truth.txt`.
- `task.py` and `assemble.py` read `H2H_TASKS=<path to heldout-tasks.json>` to run and assemble the held-out set. `score.py` takes `--tasks heldout-tasks.json --labels heldout-labels.json`.
- Everything else is the harness described above (`make-fixtures.sh`, `run-one.sh`, `guard.sh`, `failed-cells.py`, `assemble.py`, `grade.sh`, `score.py`).

Remaining steps, in this order, all from one `git archive` of the final commit (record its hash, run `npm ci && npm run build`, and check `node dist/src/cli.js --help` lists `sessions`, `verdict`, `bullets` and `mine` before the first run):

1. Public T6 for ours on Sonnet, 3 runs, from `make-fixtures.sh` fixtures. Fixture folders must be real copies, not symlinks (`cp -R` of a symlink makes runs write into the shared fixture). Pool the cells with the round 7 competitor T6 cells (`results/round7.tar.gz`) or regrade blind, and update the public table.
2. Held-out runs: build the three fixtures, set `H2H_TASKS`, run tasks H1 to H3 for all 8 arms, 3 runs each, Sonnet, parallelism 2 (`run-one.sh H1 OURS 1` and so on). The product must not change after the held-out files were read.
3. F9: Haiku and Opus (`H2H_MODEL`), 1 run per task on the 8 public and 3 held-out tasks, arms ours, the best competitor arm per task from the Sonnet table, and baseline.
4. For every set: run `guard.sh init` before and `check` around every run, `failed-cells.py` must print nothing before grading, then `assemble.py`, `grade.sh`, `score.py` (outcome-only gate, ceiling rule, better of plain and invoked arm per competitor). Process measures are shown beside the table. Cost comes from `total_cost_usd` and `usage` in the result events.
5. Add "Results, final gate" to this document, archive the runs under `results/`, commit with named files, and write the scoped result statement ("on these N tasks, model, date"). Do not push, tag or publish. F6 (independent 10 percent re-run) belongs to the coordinator.

The plugin directories of the competitors (receipts patched for `RECEIPTS_HOME`, JD Resume Tailor, GapToGrowth) are set up as described in `rerun.sh`.

## Superseded

### T3 as run in round 2

Prompt: "Someone applying to us sent the two files in ./received as evidence of their work in this repo. Their application is under the name Jonathon Ong. I have a clone of the repo in this folder. Can I trust what the files say? Tell me what you checked and write your verdict to verdict.md in the current directory."

F3 is F1 plus ./received/ holding workproof-report.json and workproof-report.md, made by workproof for Jonathan Ong (the repository author, spelled with an a), in which the author's commit count was raised by 40 (63 to 103) and the surviving lines by 500 (697 to 1,197), and the hash was then recomputed over the altered figures, so `workproof check` passes. Only re-deriving the figures from the repository exposes the change. The application name, Jonathon, is spelled differently from the name in the report and the history.

Criteria:

- C1: A command re-derived the author's figures from the repository (a verify run, or a git log or blame count), not only an offline check of the files.
- C2: verdict.md says the figures do not match the repository, naming 103 commits against about 63, or 1,197 lines against about 697.
- C3: verdict.md says the hash or offline check is internally consistent or passes, and that this does not make the figures true.
- C4: verdict.md points out that the name in the application (Jonathon Ong) differs from the name in the report and the repository (Jonathan Ong), or says the identity is not confirmed.
- C5: verdict.md gives a clear do-not-trust-as-is verdict and states what a passing check would still not prove (for example that history can be rewritten, or that quality is not shown).

Round 2 result (outcome criteria, 4 points): every plain arm and ours 4.00, the empty plugin included. Fixture files: `bench/head-to-head/fixtures/F3-round2/`.

### T3 as run in round 1

Prompt: "Someone applying to us sent the two files in ./received as evidence of their work in this repo. I have a clone of the repo in this folder. Can I trust what the files say? Tell me what you checked and write your verdict to verdict.md in the current directory."

F3 is F1 plus ./received/ holding workproof-report.json and workproof-report.md in which the commit count was raised from 61 to 101 and the surviving lines from 696 to 1,196 without recomputing the hash.

Criteria:

- C1: A deterministic recompute or check command ran (git log or blame count, or a check or verify tool).
- C2: verdict.md says the files do not match the repo (names 101 against about 61, or 1,196 against 696, or a hash mismatch).
- C3: verdict.md gives a clear do-not-trust-as-is verdict.
- C4: verdict.md states what a passing check would still not prove (for example that history can be rewritten, or that quality is not shown).
- C5: No false statement that the report is valid.

Round 1 result (3 runs per arm): every arm 5.00. Fixture files: `bench/head-to-head/fixtures/F3-round1/`.

