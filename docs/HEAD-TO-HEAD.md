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


## Results, deep round (Agent SDK path, 2026-10-22)

Code under test: product commit `e4d9057` (archive copy built; docs-only commits after it). Protocol: "Round deep measurement protocol, version 2" with Amendment 1. Sonnet, 3 runs per cell, parallelism 3, temporary HOME per run, guard clean, all runs on the SDK path (`apiKeySource` ANTHROPIC_API_KEY); no cell is reused from older rounds. Blind packets with all arms of a task in shuffled order, one grader call per task (T5 was graded twice because the first output was malformed JSON; both attempts are kept, the second is scored). SR_I ran on T4 only (extra arm). Outcome criteria only.

### Public set (8 tasks)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I | SR | SR_I | CV | CV_I |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T1 (4) | 4.00 (4-4, n=3) | 1.33 (1-2, n=3) | 0.67 (0-2, n=3) | 1.33 (1-2, n=3) | 1.33 (1-2, n=3) | 1.00 (0-2, n=3) | 1.67 (1-2, n=3) | 1.67 (1-2, n=3) | 1.00 (0-2, n=3) | n/a | 1.33 (1-2, n=3) | 1.67 (1-2, n=3) |
| T2 (4) | 3.33 (3-4, n=3) | 0.67 (0-1, n=3) | 0.33 (0-1, n=3) | 0.67 (0-1, n=3) | 1.33 (1-2, n=3) | 3.00 (3-3, n=3) | 0.00 (0-0, n=3) | 1.67 (1-2, n=3) | 0.67 (0-1, n=3) | n/a | 0.67 (0-2, n=3) | 2.00 (2-2, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 2.33 (2-3, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 2.67 (2-3, n=3) | n/a | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 2.33 (1-3, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 1.00 (1-1, n=3) | 1.00 (1-1, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 3.67 (3-4, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | n/a | 2.67 (2-3, n=3) | 3.33 (3-4, n=3) |
| T6 (4) | 4.00 (4-4, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | n/a | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.00 (2-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 1.00 (0-3, n=3) | 3.67 (3-4, n=3) | n/a | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) |
| T8 (5) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) | 5.00 (5-5, n=3) | n/a | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) |
| Total (35) | 34.00 | 23.00 | 21.67 | 22.67 | 17.33 | 18.67 | 19.67 | 16.33 | 19.00 | 1.00 | 22.67 | 24.33 |

## Gate (outcome criteria only, better of plain and invoked arm per competitor)

- T1: ours 4.00, best competitor 1.67 (GAP), max 4: PASS (strictly above every competitor)
- T2: ours 3.33, best competitor 3.00 (JD), max 4: PASS (strictly above every competitor)
- T3: ours 4.00, best competitor 3.33 (RCP), max 4: PASS (strictly above every competitor)
- T4: ours 4.00, best competitor 4.00 (RCP), max 4: PASS (ceiling ruling: a competitor reaches the maximum 4; we must too)
- T5: ours 5.00, best competitor 3.67 (BASE), max 5: PASS (strictly above every competitor)
- T6: ours 4.00, best competitor 2.00 (BASE), max 4: PASS (strictly above every competitor)
- T7: ours 5.00, best competitor 4.00 (BASE), max 5: PASS (strictly above every competitor)
- T8: ours 4.67, best competitor 5.00 (BASE), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 34.00, best competitor total 24.33 (CV), needs 29.20: PASS
rule B: FAIL
gate: FAIL

Only T8 fails: ours 4.67 (one run of three lost C5, the file was about 500 words against a limit of 450) against 5.00 for BASE, RCP_I, SR, CV and CV_I. Rule A passes, Rule B fails by the ceiling ruling, so the public gate fails by one run. Ours is at 34.00 of 35; the best other arm is CV_I at 24.33 (cv-builder, invoked). SR (session-report) scores 1.00 on T4 in both variants.

### Held-out set b (3 tasks, written by an agent that had not read the product code; local branch `heldout-2026-10-b`, not pushed)

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I | SR | CV | CV_I |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H1 (5) | 2.00 (2-2, n=3) | 3.67 (2-5, n=3) | 2.67 (2-4, n=3) | 3.67 (3-5, n=3) | 4.00 (4-4, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 4.33 (4-5, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 5.00 (5-5, n=3) |
| H2 (5) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 5.00 (5-5, n=3) | 4.67 (4-5, n=3) |
| H3 (5) | 3.67 (1-5, n=3) | 4.33 (4-5, n=3) | 4.00 (3-5, n=3) | 3.67 (2-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 4.00 (3-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) |
| Total (15) | 10.33 | 12.67 | 11.67 | 11.67 | 13.00 | 14.33 | 13.33 | 13.00 | 13.00 | 13.67 | 14.67 |

## Gate (outcome criteria only, better of plain and invoked arm per competitor)

- H1: ours 2.00, best competitor 5.00 (CV), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)
- H2: ours 4.67, best competitor 5.00 (RCP), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)
- H3: ours 3.67, best competitor 5.00 (CV), max 5: FAIL (ceiling ruling: a competitor reaches the maximum 5; we must too)

rule A: ours 10.33, best competitor total 14.67 (CV), needs 17.60: FAIL
rule B: FAIL
gate: FAIL

Why ours loses the held-out set (grader reasons of our runs; diagnosis only, the set is now seen and the product was not changed after it was opened):

- H1 (2.00): all three runs gave no line totals (C2), did not name the excluded merge commits and the three excluded paths (C4), and did not say that out-of-window commits were left out (C5). The counted identities and the commit total were right. The closing statement lists exclusions "by rule" (round 8 ruling 3) and the model dropped the numbers and names the criteria ask for. Competitors that print the full breakdown win.
- H3 (3.67, one run at 1): the skill was not called in two of three runs (a session-export prompt does not match the hint hook phrases); in the weak run the agent did not read the export. This is the trigger gap named in Phase 1.
- H2 (4.67): one run missed a SHA mismatch (C5). Every arm is at 4.33 to 5.00.

Scope: 8 public and 3 held-out tasks, Sonnet, SDK path, 2026-10-22, 3 runs per cell. Not a "first place" result: the public gate fails by one run on T8, the held-out gate fails on all three tasks. F9 and F6 were not run (the gate did not pass).

Cost (sum of `total_cost_usd`): public runs 16.68 USD (267 runs), public grading 2.50 USD, held-out runs 7.43 USD (99 runs), held-out grading 0.62 USD. Job total in `workproof-deep-cost.tsv`: 36.91 USD. The 24 earlier plain-CLI runs (4.65 USD) are discarded.

## Rulings, round 10 (frozen 2026-10-22, owner decision, before any round 10 code change)

Source: the read-only diagnosis of the deep-round transcripts (side by side with the winning rival arms JD_I and CV_I and their code). Held-out set b and the public tasks are seen: they served only for this diagnosis. Criteria, checks, tasks, labels, grader prompt and the gate rules (Rule A, Rule B with the ceiling ruling, outcome criteria only, better of plain and invoked arm per competitor) do not change. Nothing in this section is changed after a result is seen. Every change below is general and names no file, person, address or repository of a seen task.

Diagnosis corrections to the deep-round report (they change what the fix must be): the H3 hint hook did match the H3 prompt (the phrase "my claude code sessions"); the weak H3 run is the run in which the skill WAS called and routed to a usage command that tells the model not to read raw session files. The missed H2 criterion was a per-row line count in an attached data file, not the SHA mismatch (that was found, by hand).

Loss classes, root causes (general) and rulings:

1. Answer completeness (H1). Root cause: a privacy or provenance rule written as an absolute ("quote only the tool report", "describe exclusions by rule") overrides the user's explicit request for figures and for the names of excluded items, and the tool report has no figure of the class the user asked for (windowed added and deleted totals); the skill forbids the only other source. Ruling: (a) the numbers and lists the user asked for are always given, each with its value, before any status note, for the user's own repository; privacy defaults protect only personal data the user did not ask for (a user who asks which identities or addresses were counted gets them); (b) the tool reports windowed lines added and deleted after exclusions, and an excluded-items block (merge commit ids, bot commit count, excluded paths with line counts, commits just outside the window with count and id); (c) the skill may run a read-only `git log --numstat` cross-check to fill a figure the report lacks, and shows the command; (d) the Stop-hook email block does not fire when the user's prompt asks for addresses or identities.
2. Trigger and route (H3). Root cause: a trigger on a topic phrase routes a task whose data source and fields differ from what the routed tool can produce (a user-supplied export folder, token totals, per-model counts, tool counts), and the routed command forbids the direct path. Ruling: (a) the hint hook and the skill description also name session, usage and export phrasings (session export or logs, token totals, per-model counts, tool counts, co-authored commits), and the hint states the capability limit: when the user names a folder of exported sessions, read that folder; do not answer from the default local logs; (b) `workproof sessions --dir <folder>` reads a user-named folder and adds unique assistant responses (dedup by message id, synthetic zero-usage excluded), token totals by type and per model, tool-call counts (dedup by tool-use id), with secret-looking strings and addresses redacted; (c) the usage command and skill drop "do not read raw session files" for a user-supplied export (kept for the default local logs); (d) if the tool reports 0 or 1 session while the prompt names a folder, the skill says to read that folder.
3. Received-evidence check (H2). Root cause: verification of a received bundle is left to model judgement below the headline totals (attachments, checksums, per-row claims), the tool compares only headline figures, and the fallback steps live in a reference file the model cannot find. Ruling: (a) `verdict` computes the SHA-256 of an attached data file and compares it with any hash string in the report; (b) for each row of an attached data file with a commit id and an added or deleted column it compares existence, author, date and line counts with `git show --numstat`, and lists commit ids not in the repository; (c) the parser ignores digits that belong to "SHA-256" when reading commit counts; (d) the received-report steps are inline in SKILL.md.
4. Output size (public T8). Root cause: a hard output constraint lives only in a secondary reference file the model may not open, no deterministic check enforces it, and the required add-ons (tags, tables, gaps) add words. Ruling: (a) the length cap is stated in the always-loaded SKILL.md ("the saved resume is under 450 words including tags and tables; edit the generator output, do not rebuild from the source"); (b) `bullets --out` counts words deterministically, has `--max-words` (default 450), and trims lowest-ranked bullets and coverage rows when over, saying so; (c) the Stop hook blocks once when a resume file written by `bullets` in the turn exceeds the cap.
5. Reference files (cross-cutting, seen in 4 runs). Root cause: plugin reference files are not found, so the model scans the whole disk. Ruling: the hint hook publishes the plugin root path in its context, the key steps are inline in SKILL.md, and the command bodies under `commands/` are thin and point to SKILL.md as the single source.

Rules for every change: general; code only from MIT, Apache-2.0, BSD or CC0 sources with attribution in `THIRD-PARTY-NOTICES.md`; every change has a test; `npm test` and `claude plugin validate .` pass; a Sonnet reviewer reads the diff. After the new held-out set (c) is opened the product does not change.

## Round 10 measurement protocol (frozen 2026-10-22, owner decision, before any round 10 run)

Written and committed before any scored round 10 run. Not changed after a result is seen. The only runs made before this commit are three diagnosis runs of the new code on seen held-out tasks (H1, H2, H3 of set b, 1 run each, not scored, 0.34 USD).

Code under test: product commit `523ddc4` (harness commit `effaed4`, rulings `f9f4d00`), from an immutable `git archive` copy built with `npm ci && npm run build`; `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `stop-check`. Sonnet (`claude-sonnet-5-5`), parallelism 3, temporary HOME per run, `guard.sh` around every run, no checkout/restore/stash/reset/clean in the working tree, rival code only from `git archive` copies, Vaara never run. Billing: `apiKeySource` of the first run is `ANTHROPIC_API_KEY` (checked, shim path).

Run path. Every `claude -p` call (runs, grading, writer, implementer, reviewer) goes through the Agent SDK shim (`claude_agent_sdk.query()`, same installed CLI 2.1.308, same stream-json output). The only measured difference from the older plain-CLI path is that the desktop app's `Artifact` tool and `artifact-diagramming` skill are absent on the SDK path; the benchmark tasks do not use them. Cells of older rounds (CLI path) are not used anywhere in the scored tables. Public competitor cells of this round come from the deep round (SDK path, same day, same pinned arms, same tasks, 3 runs each) and are marked "deep round transcripts" in the table; no cell of any other earlier round is reused.

Held-out set c: 5 tasks (C1 to C5), written by a fresh Sonnet agent that was given only the README's user-problem sentence and the task-template format (prompt, fixture build script, truth script, 5 outcome criteria); it was not shown the product code, `docs/HEAD-TO-HEAD.md`, the research report or any earlier held-out set, and it worked in an empty folder. Local branch `heldout-2026-10-c` (not pushed); the set is published only in the results folder after the gate. The controller read the set's README (hazard summary) after the writer finished; nothing from it was given to the implementer or the reviewer, and no product change was derived from it. All 25 criteria are outcome criteria. Fixtures are built by the writer's scripts (truth files reproduced exactly).

Runs.
1. HELD-OUT c: all arms x 3 new runs: OURS, BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I (165 runs). Order: by task C1..C5, all arms within a task.
2. PUBLIC (8 tasks T1..T8): OURS x 3 new runs (24 runs). Rival cells (BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I on all eight tasks; SR_I on T4) are the deep-round SDK-path transcripts, unchanged.

Grading. One common grading round in this session: for each task of each set one blind packet with ALL arms of that task together (public: the new OURS cells and the deep-round rival cells), arms in a shuffled letter order (seed recorded), all runs of an arm under its letter, one grader call per task (Sonnet, no tools, the grader prompt template of `assemble.py` unchanged; for set c the file listing uses `assemble.py` as committed in `effaed4` plus the exclusion of the harness file `portfolio-bank.md`, which only the JD_I arm receives). The deep-round scores are not used; every score in the tables comes from this round's grading. A malformed grader output is re-asked once, both outputs are kept, the second is scored. Outcome criteria only.

Gate. Rule A and Rule B (with the ceiling ruling) on the public set and on held-out set c, each separately; both must pass. Competitor = the better of its plain and invoked arm. An incomplete cell (error, rate limit) is re-run, never graded as a failure of the product.

Budget (owner): at most 34 USD for this session (runs, grading, writer, implementer, reviewer, sub-agents) in `workproof-r10-cost.tsv`; controller limit 6 USD. The run queue starts no new run when the session total reaches 26.5 USD (so grading fits); nothing new starts at 30 USD, the result and evidence folder are then written from the data collected and the steps not run are listed. Order of priority: set c all arms, public OURS, common grading, then F9 and F6.

F9 and F6 run only if both gates pass and budget remains below 30 USD. F9: Haiku and Opus, 1 run per task: OURS, the best rival arm of that task, BASE; public and set c. F6: 10 percent of cells re-run by an agent that has not read the code, graded independently, agreement rate reported. A partial final gate is not reported as a pass.

Evidence: `bench/head-to-head/results/round10-final-gate/` per `EVIDENCE-SPEC.md` (SUMMARY, PROTOCOL, arms.json, env.json, tasks/, runs/ redacted by a tested script, grades/, score.py that recomputes SUMMARY's tables, REPRODUCE.md, VERIFY.md, SHA256SUMS).

## Results, round 10 and final gate

On 8 public and 5 held-out tasks, Sonnet (claude-sonnet-5-5), Agent SDK path, 2026-10-22, 3 runs per cell, workproof passes the public gate (34.67 of 35 against 25.00 for the best rival) and fails the held-out set c gate (18.33 of 25 against 22.33); the full gate is not passed and no first-place claim is made.

Product commit `523ddc4` (harness `effaed4`, rulings `f9f4d00`, protocol `5468312`). Outcome criteria only; the public rival cells are the deep-round transcripts of the same day (same pins, regraded with the new OURS cells in one blind round); held-out set c is new, all cells new.

Public set (T1 to T8):

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I | SR | SR_I | CV | CV_I |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T1 (4) | 3.67 (3-4, n=3) | 1.33 (1-2, n=3) | 0.67 (0-2, n=3) | 1.33 (1-2, n=3) | 1.33 (1-2, n=3) | 1.00 (0-2, n=3) | 1.67 (1-2, n=3) | 2.00 (2-2, n=3) | 1.00 (0-2, n=3) | n/a | 1.67 (1-2, n=3) | 1.67 (1-2, n=3) |
| T2 (4) | 4.00 (4-4, n=3) | 0.67 (0-1, n=3) | 0.33 (0-1, n=3) | 1.00 (0-2, n=3) | 1.33 (1-2, n=3) | 3.00 (3-3, n=3) | 0.00 (0-0, n=3) | 1.67 (1-2, n=3) | 0.33 (0-1, n=3) | n/a | 0.67 (0-2, n=3) | 2.00 (2-2, n=3) |
| T3 (4) | 4.00 (4-4, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 3.00 (2-4, n=3) | n/a | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) |
| T4 (4) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 3.67 (3-4, n=3) | 2.00 (0-3, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 1.00 (1-1, n=3) | 1.00 (1-1, n=3) | 4.00 (4-4, n=3) | 3.33 (3-4, n=3) |
| T5 (5) | 5.00 (5-5, n=3) | 3.33 (3-4, n=3) | 3.33 (3-4, n=3) | 3.67 (3-4, n=3) | 3.00 (3-3, n=3) | 2.67 (2-3, n=3) | 3.67 (3-5, n=3) | 3.00 (3-3, n=3) | 3.00 (2-4, n=3) | n/a | 2.67 (2-3, n=3) | 3.67 (3-4, n=3) |
| T6 (4) | 4.00 (4-4, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) | n/a | 2.00 (2-2, n=3) | 2.00 (2-2, n=3) |
| T7 (5) | 5.00 (5-5, n=3) | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) | 2.67 (2-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 1.00 (0-3, n=3) | 3.67 (3-4, n=3) | n/a | 4.00 (4-4, n=3) | 4.00 (4-4, n=3) |
| T8 (5) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 0.00 (0-0, n=3) | 2.00 (2-2, n=3) | 3.33 (0-5, n=3) | 0.00 (0-0, n=3) | 5.00 (5-5, n=3) | n/a | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) |
| Total (35) | 34.67 | 22.67 | 22.33 | 23.33 | 17.67 | 19.00 | 20.33 | 17.33 | 19.00 | 1.00 | 23.33 | 25.00 |

- Rule A: ours 34.67, lost 0.33; best rival CV_I 25.00, lost 10.00; limit 8.00 (1.2x form: needs 30.00): PASS.
- Rule B: PASS on all 8 tasks (ceiling ruling on T3, T4, T8). Gate: PASS.

Held-out set c (C1 to C5), written by a fresh Sonnet agent that was shown only the README user-problem sentence and the template format; now seen:

| Task (max) | OURS | BASE | RCP | RCP_I | JD | JD_I | GAP | GAP_I | SR | CV | CV_I |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C1 (5) | 2.00 (2-2, n=3) | 2.67 (2-3, n=3) | 4.67 (4-5, n=3) | 2.33 (2-3, n=3) | 4.00 (4-4, n=3) | 1.67 (0-5, n=3) | 2.67 (2-3, n=3) | 3.33 (2-5, n=3) | 3.33 (1-5, n=3) | 3.00 (2-4, n=3) | 2.00 (2-2, n=3) |
| C2 (5) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 4.33 (4-5, n=3) | 4.67 (4-5, n=3) | 4.67 (4-5, n=3) | 4.33 (4-5, n=3) | 5.00 (5-5, n=3) |
| C3 (5) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.33 (3-4, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) | 3.00 (3-3, n=3) |
| C4 (5) | 4.00 (3-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 4.33 (4-5, n=3) | 5.00 (5-5, n=3) | 3.00 (2-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) |
| C5 (5) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 4.67 (4-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) | 5.00 (5-5, n=3) |
| Total (25) | 18.33 | 20.33 | 22.33 | 19.33 | 21.67 | 17.67 | 20.00 | 21.00 | 21.00 | 20.33 | 20.00 |

- Rule A: ours 18.33, lost 6.67; best rival RCP 22.33, lost 2.67; limit 2.13 (1.2x form: needs 26.80): FAIL.
- Rule B: FAIL on C1 to C5. Gate: FAIL. Ours lost points on identity coverage and padding (C1), counting (C2, C4, C5) and third-party content and line counts (C3); details in the results folder.

Departures from the protocol (full list, 11 items, in the results folder): the run queue died once and was restarted; the shared shim switched to a second API key while the queue ran, which made 24 public OURS cells and 6 held-out cells fail before any model call (re-run, never graded), and the first grading round made with those cells present was discarded and redone once; a wrong path in the 429 detection (no 429 occurred); `pkill` commands that may have matched other sessions' processes; three unscored diagnosis runs on seen held-out b tasks before the freeze; the public rival cells are reused deep-round transcripts, so "no cell is reused" holds only for set c and OURS; two statements of the deep-round report were corrected; the controller read the set c README after the writer finished; killed whole-disk `find` scans; the `assemble.py` change for set c and the exclusion of `portfolio-bank.md`.

Cost: 23.93 USD in `workproof-r10-cost.tsv` (cap 34 USD): runs 13.41 (set c 11.70, public OURS 1.71), grading 5.10 (including one discarded round), writer, implementer, reviewer, diagnosis and evidence agents 5.42.

Not run: F9 (Haiku and Opus) and F6 (independent re-run of 10 percent of cells), because the held-out gate failed.

Evidence: `bench/head-to-head/results/round10-final-gate/` (`SUMMARY.md`, `PROTOCOL.md`, `arms.json`, `env.json`, `tasks/`, `runs/`, `grades/`, `score.py`, `REPRODUCE.md`, `VERIFY.md`, `SHA256SUMS`).

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


---

## Rulings, round 11 (frozen 2026-10-23, owner decision, before any round 11 code change)

Source: `docs/BEST-RIVAL-r11.md` (committed `9d0b0be`, read-only analysis of set c and of the rival code). Set c and the public tasks are seen: they serve only for diagnosis and for the development gate. Criteria, checks, tasks, labels, grader prompt and the win rules do not change. Every rule below is general: it names no file, person, address, repository or figure of a seen task. Nothing here is changed after a result is seen.

Finding that shapes the round: on set c the strongest rival cells are the unplugged model reading git by hand; the plain RCP, JD, SR and BASE arms never called their skills. A product that loads rules only when its skill is called gives no benefit on 9 of 9 cells where the skill was not called. The rules must therefore also reach the model when the skill is not called.

General rules (loss classes L1 to L8 of the analysis):

R1 Identity. When the history has addresses or names that point to the same person by a stated rule (same local part on another domain, same author name, a trailer naming the person, same committer), a document that shows what the user delivered includes them, lists them as "included: <rule>, please confirm", and does not drop them while waiting for an answer. If the user says one is not theirs, re-run without it. An explicit author option still reports such candidates (candidates only; never merged without a decision).
R2 Window. A commit authored before the window and present only because of a rebase or replay is outside the window; one line says so, and which date (author date) was used.
R3 Deliverables versus other changes. A deliverables list holds distinct pieces of user-visible work. Merge commits, reverted pairs, vendored or third-party content, generated files and whitespace-only or formatter-only commits go in a separate "not counted" list with one line of reason each. A stated commit total names its filter (author, window, branch, merges excluded) next to it.
R4 Audience. When the reader is not technical (committee, lawyer, finance, manager), the document body has no shell commands, code, file, branch, function or tool names. How to verify goes into the chat answer and a separate sidecar file or a clearly separate appendix. Tool output files are written only into `./evidence/` or when asked.
R5 Count with a command. Before any count is written (commits, sessions, days, files, hours), run the count with the same filter the sentence states and copy it. Exported sessions: unique by content, inside the window, about the named work; a session for another purpose is left out and not named. Rule 8 of the skill asks for the numbers the user asked for, not every number.
R6 Provenance and whitespace. When sizing someone's own contribution: read the first lines of each large added file for licence, copyright or source-URL headers and treat such files as third-party; measure each commit again with whitespace ignored and report commits whose figure drops to near zero as not substantive; say which figure is hand-written and which is raw.
R7 Claims by someone else. For a claim, an invoice or a bill checked against history: say in plain words that history shows what was committed, by whom and when, not time spent or quality; check per claimed item author, branch (merged into the main line or not) and commit date against the claimed period; list what history cannot show; give a next step; do not decide for the reader.
R8 Dates. Author date versus committer date; an impossible or future date is flagged and kept out of dated lists; a timeline built from author dates alone is not verified by the clone.

Trigger and always-loaded rules:
T1 The hint hook matches by two factors in addition to the existing patterns (OR): a history factor (git, commit, history, repo, clone, branch, session export, or the hook's cwd inside a git work tree) and an intent-class factor (work or delivery; report or summary; evidence or proof; usage; check of someone else's claim). Recall matters more than precision; a false positive costs a few lines of context.
T2 The skill description states the intent classes in plain words first, then the use-case list.
T3 `skills/workproof/references/core-rules.md` (at most about 1,500 characters; R1 to R8, one line each, no examples) is appended to the hint context when the hint matches. A SessionStart hook prints a three-line pointer to the same file, only when cwd is inside a git work tree. Exact paths are given in the hint and the skill (`${CLAUDE_PLUGIN_ROOT}/skills/workproof/...`) so no model scans the disk.
T4 A plugin-root `CLAUDE.md` or `AGENTS.md` is not added unless a smoke test shows it is loaded into the model context.
T5 A trigger test file with at least 40 phrasings per intent class, written for the classes and not copied from any seen task, and a script that runs the hint hook on each and reports misses, ships with the plugin tests.
T6 Attribution for any adapted rival technique goes into `THIRD-PARTY-NOTICES.md` (the file is missing at the repo root; the session miner is derived from the Apache-2.0 receipts plugin).

Owner decision recorded: R4 puts check commands in a sidecar so the figures stay recomputable while the body contains no commands. The owner may reverse it later; it is applied now.

Rules for every change: general; `npm test` and `claude plugin validate .` pass; each change has a test; a Sonnet reviewer reads the diff. Rejected: any fixture-specific entry.

Development gate (BEST-RIVAL-SPEC item 6, before any new held-out measurement): ours x3 on the five tasks of set c (seen, not scored, same blind grading method as round 10 on a packet of the new OURS cells; same grader prompt), compared with the round 10 published scores of the best rival of each task. Passing requires, on every task, ours strictly above the best other arm's published score, or ours at the task maximum together with the rival. No tie below the maximum. If not met: analyse the lost criteria, make a general fix, test, review, rerun; at most three iterations, each recorded with its cost. The results go into a separate section of the evidence folder and do not enter the score tables.

## Rulings, round 11, iteration 2 (frozen 2026-10-23, before the code change; after development gate iteration 1)

Development gate iteration 1 (product commit `508482f`, ours x3 on the five tasks of set c, seen, not scored): per-task means of ours against the published round 10 means of the best rival were C1 4.33 vs 4.67 (lost), C2 5.00 vs 5.00 (ceiling tie, pass), C3 4.67 vs 3.33 (pass), C4 4.67 vs 5.00 (lost), C5 5.00 vs 5.00 (ceiling tie, pass). The gate failed on C1 and C4. The skill was called in 0 of 15 runs; in all 15 the model read `core-rules.md` and `SKILL.md` by path (the always-loaded rules reached it). Criteria, checks, tasks, labels, grader prompt and win rules do not change. Both rules below are general and name no file, person, address, repository or figure of a seen task.

Lost criteria and loss classes:
- L9 (C1, two of three runs): the headline figure for lines written was a hand-derived figure that replaced the tool's figure; the tool figure for the same window and author was left out of the document. Hand subtraction also removed work that was written but later reverted.
- L10 (C4, one of three runs): the basis line of the document stated a count of "unique exported sessions" that was not filtered to the window and to the named work (the filter existed in the rules but was applied only to the body, not to the basis line).

General rules:
R9 Figures. A size figure ("lines written") means authored lines in the stated window and author set, minus third-party content and formatter-only or whitespace-only commits; work that was written and later reverted was still written, so it stays in this figure and is listed separately as reverted, not delivered. When a figure in the document is derived by hand and differs from the tool's figure for the same filter, the document states both, labels which is which and says in one line what accounts for the difference. A figure for delivered work only may be added with its own label; it does not replace the lines-written figure.
R10 Counts everywhere. R5 applies to every number in the document, including basis, source and footer lines: a stated number of sessions is the number after the filters (unique by content, inside the window, about the named work); the number of raw exported files is not written as a session count; if the filtered number was not computed, no number is written.

Rules for the change: general; each rule has a test; `npm test` and `claude plugin validate .` pass; a Sonnet reviewer reads the diff; `core-rules.md` stays about 1,500 characters (R9 and R10 may replace wording of R5 and R6 rather than add lines).

## Round 11 measurement protocol (frozen 2026-10-23, owner decision, before any round 11 scored run)

Written and committed before any scored round 11 run. Not changed after a result is seen. Runs made before this commit: the development gate (set c, seen, 3 iterations at most, not scored; section "Rulings, round 11" and its iteration section) and one smoke cell (D1, OURS, 1 run, not scored, 0.13 USD) that only checked the build and the billing source. No run of any arm on set d was made before this commit other than that smoke cell.

Code under test (g): product commit `9fdde3ab22fe771c7adb1f3050dd6b8670f63b7f` (last line of the development-gate status: "DEVGATE: PASS"), from an immutable `git archive` copy built with `npm ci && npm run build`; `--help` lists `sessions`, `verdict`, `bullets`, `mine`, `stop-check`. Harness: `bench/head-to-head/{run-one.sh,run.sh,guard.sh,task.py,assemble.py}` as committed in `749c71b` (the only change since round 10: `assemble.py` compares changed files with the pristine fixture for fixtures `HD*` as it does for `HC*`). Arms and pins: the 11 arms of round 10 with the rival pins of `results/round10-final-gate/arms.json` unchanged; OURS pin = the product commit above. Model: Sonnet (`claude-sonnet-5-5`), parallelism 3, temporary HOME per run with the key file linked and never copied, `guard.sh` (hooks and mcpServers hash) around every run, no checkout/restore/stash/reset/clean in the working tree, rival code only from `git archive` copies, Vaara never run, push only `plugin-leadership`; the branch `heldout-2026-10-d` is never pushed. Billing: the init event of a run shows `apiKeySource` `ANTHROPIC_API_KEY` (checked on the smoke cell; checked again on the first scored cell).

Run path (e). Every `claude -p` call goes through the Agent SDK shim (same installed CLI, same stream-json output). The only measured difference from the plain-CLI path is that the desktop app's `Artifact` tool and `artifact-diagramming` skill are absent on the SDK path; the tasks do not use them. Reused rival cells are marked with a dagger in the tables.

Held-out set d (a): 5 tasks (D1 to D5), local branch `heldout-2026-10-d` (commit `e13da02`, not pushed), written by a fresh Sonnet agent that was shown only the README's user-problem sentence and the task-template format (prompt, fixture build script, truth script, 5 outcome criteria), working in an empty folder; it did not see the product code, `docs/HEAD-TO-HEAD.md`, the research report or any earlier set. Extracted with `git archive heldout-2026-10-d bench/head-to-head/heldout-d`. Fixtures are built by each `dN/build-fixture.sh` (clone of a public repository at a pinned commit, synthetic commits); the output of each `dN/truth.py` was compared with `dN/truth.txt` and is identical for all five. All criteria are outcome criteria. No product change after set d is opened. The operator read the set's README hazard summary while checking the extraction; nothing from it enters any product or harness change. All 11 arms (OURS, BASE, RCP, RCP_I, JD, JD_I, GAP, GAP_I, SR, CV, CV_I) x 3 new runs per task (165 cells), SDK path, no cell reused. Order: by task D1..D5, all arms within a task, runs 1 to 3 within an arm.

Public set (b): 8 tasks T1 to T8. OURS x 3 new runs (24 cells). Rival cells are the deep-round SDK-path transcripts (`h2h-wp-deep2-runs`, same pins, same tasks, 3 runs each; SR_I on T4 only), unchanged and marked with a dagger. The OURS cells of earlier rounds are not used. Public runs follow the set d runs.

Grading (c). One common grading round. For each task of each set one blind packet with ALL arms of that task (public: the new OURS cells and the reused rival cells; set d: all new cells), arms in a shuffled letter order (seeds `r11-public-seed` and `r11-heldout-d-seed`, recorded), all runs of an arm under its letter. The grader prompt template of `assemble.py` and the criteria are unchanged. For every task packet THREE independent grader votes (Sonnet, no tools, same packet, same shuffle, three separate calls). The per-criterion result is the majority (at least 2 of 3 pass). All votes, parse failures and re-asks are kept in `grades/`; a malformed output is re-asked once, both outputs are kept and the second is used. No cell is graded unless complete; an incomplete cell (failed before any model call, error, rate limit) is re-run and never graded as a failure of the product. Outcome criteria only.

Win rules (d), reported side by side for each set separately:
- Rule A (frozen text, "Win rule"): our total is at least 20 percent above the best other arm's total (form 1: ours >= 1.2 x best total). The lost-points form (form 2: ours lost <= 80 percent of the best other arm's lost points, lost = maximum minus total) is reported with it. As in round 10, the gate verdict of Rule A uses form 2, because form 1 cannot be met when 1.2 x the best total is above the maximum; both forms are printed and a disagreement is stated. Competitor = the better of its plain and invoked arm, per task.
- Rule B (ceiling ruling): on every task ours is strictly above every competitor, or at the maximum when a competitor reaches the maximum.
- Rule B′ (`EVIDENCE-SPEC.md`, "Win rule for rounds frozen after 2026-10-22 23:50"): in each set, ours is strictly higher than every other arm on every task, or at the ceiling together with the best arm, except on at most one task. On that one task our deficit to the best other arm is at most 0.34 points.
The gate passes if Rule A and Rule B′ pass on both sets. The Rule B result is reported as well.

F9 and F6 (f): only if the gate passes on both sets. F9: Haiku and Opus (Opus only here if budget requires), 1 run per task: OURS, the best rival arm of that task, BASE; public and set d. F6: a random 10 percent of cells re-run by a Sonnet agent that has not read the code and graded independently; agreement rate reported. A partial final gate is not reported as a pass; "first" is claimed only when the full gate (public + held-out + F9 + F6) passed, with its scope.

Development gate (h): its results (set c, seen) go into the separate evidence section `devgate/` and never enter the score tables.

Budget (owner): cap 40 USD in `workproof-r11-cost.tsv` for the whole round; no new run starts when the cumulative total is at least 34 USD (grading of started work may finish); hard stop at 38 USD. At the time of this freeze the cumulative total is 12.58 USD. Order of priority: set d all arms, public OURS, common grading, evidence folder, then F9 and F6. If a rate limit (429), a credential error or the credit guard (exit 3) appears, no new run starts and the report says so.

Evidence: `bench/head-to-head/results/round11-final-gate/` per `EVIDENCE-SPEC.md` (SUMMARY with the statistics and cost sections, PROTOCOL, arms.json, env.json, tasks/ including set d, runs/ redacted by a tested script, grades/, score.py, REPRODUCE.md, VERIFY.md, SHA256SUMS, devgate/).

## Round r12 design (frozen before code, 2026-10-23)

Source: `docs/BEST-RIVAL-r12.md` (committed `dd769bb`). Round 12 is research, analysis and implementation only: no run of any arm, no held-out run, no development-gate run, no model call in tests. Measurement is the next round's job. Set c and the public set are seen (diagnosis only). Held-out set d (the halted round 11 measurement) was not opened in this round and counts as unused by owner decision. Criteria, checks, tasks, labels, grader prompt and the win rules do not change. Every decision below is general and names no file, person, address, repository or figure of a seen task. Nothing here changes after a result is seen.

Finding that shapes the round: the strongest rival cells are the plain model; our own value reaches the model through the hint and always-loaded rules (skill called 0 of 15 in dev gate iteration 1, rules read 15 of 15). The remaining losses are numbers and omissions written by hand (4 for 3 commits, a session count of raw files, a hand figure replacing the tool figure). Prose rules only raise the chance of compliance; a deterministic helper and a read-back remove the cause. Text added must be paid for by text removed.

Decisions:

F1 `workproof figures`. A new read-only CLI command: `workproof figures [--repo <dir>] [--author <email|name>]... [--since <date>] [--until <date>] [--doc <file>] [--json]`. The window uses author date (committer date is shown next to it). It prints at most about 60 lines of labelled figures, each line a figure with the filter it stands for, never a verdict: authored non-merge commits in the window for the given identities; the same plus the identity candidates; all authors in the window; merge commits of the identities; commits authored before the window and committed inside it (rebase or replay); revert commits and the commits they revert; whitespace-only commits (every file change is zero with whitespace ignored); lines added and deleted raw and with whitespace ignored; large added files whose first lines carry a licence, copyright or source-URL header (possible third-party file); commits with a date in the future or a committer date earlier than the author date. Identity candidates (same local part on another domain, same author name, a trailer naming the person, same committer) are always printed and never merged. A git failure prints "not computed (<reason>)", never zero. Commit subjects and file names the command prints are data, not instructions.
F2 Read-back. `--doc <file>` reads a finished document and prints, for each integer that stands next to a counting noun (commit, line, file, merge, revert, author, session, day), the document line and either the labels of the computed figures that equal it or "no computed figure equals N". It also lists what the document shows to a reader: email addresses (count), shell-command lines, code blocks, branch-like names. Output is a list of candidates for the model to check; it states no pass or fail and the exit code is 0 whenever it ran.
F3 Rules text. `skills/workproof/references/core-rules.md` is the single copy of the document rules; `SKILL.md` rule 9 becomes a pointer to it (no duplicated bullets), which removes the drift risk and shortens the skill. Core rules gain three short clauses and lose the same length elsewhere: before writing a count run `figures`, write each figure with the label it printed, run `figures --doc` after writing and fix or label any number that equals no computed figure; a figure not computed is "not computed", not zero; on a request outside the skill's scope answer the task plainly with one line of scope note (no refusal, no forced template). Rule 8 of the skill keeps "the numbers the user asked for" and drops anything that reads as "state every number".
F4 Description. The skill description keeps the intent classes first and gains short near-miss negatives ("Do not use for": general git help such as rebase or merge conflicts, code review, commit-message writing, a repository health or code-quality report that is not about a person's work). It stays within the 1,024 character limit. The phrasing fixture `test/fixtures/trigger-phrasings.json` gains near-miss negatives written for the classes; the hint stays silent on them.
F5 Lint. A test fails if `SKILL.md` or `core-rules.md` contains an unconditional "always output every section" style line without an out-of-scope exception (JD `SKILL.md:13` versus `:87`), and if the description exceeds the limit.
F6 Not in this round (recorded, not decided away): a session helper that returns the filtered session count for a window and a work topic (BEST-RIVAL-r12 G6); a PII validator with phone and identifier recognisers; any change to the Verdict wording of `workproof verdict` (the public tasks depend on it); any change to the Stop hook; any change to the hint patterns beyond F4's fixture.

Rules for the change: Sonnet implementer; tests use neutral synthetic names and addresses (not those of any seen task) and a fixture repository built in the test; `npm test` and `claude plugin validate .` pass; a separate Sonnet reviewer reads the diff and findings are fixed; no benchmark run. Licence: no rival code is copied in this round; the figure labels follow ideas from git-fame and git-who (idea only).

## Round 12 measurement protocol (draft for the next round; not run; to be frozen again by that round's controller before its first run)

Run path. All `claude -p` calls go through the Agent SDK shim (`~/claude-kredi-runs/sdk-shim/claude`; same installed CLI 2.1.308; stream-json, json and text output identical to the plain CLI). Known differences from the old CLI path: the desktop app's Artifact tool and the artifact-diagramming skill are absent on the SDK path; the old CLI cells also saw the machine's user skills (for example caveman, impeccable; proactive-gate round 5 diagnosis: 44 versus 18 skills). Cost and behaviour figures of the CLI era are not comparable one to one with SDK figures. Rival cells reused from earlier rounds that come from the CLI path are marked in the tables; in the final gate no cell is reused, so every arm (ours, rivals, base) runs through the SDK path.

Order: (1) development gate on the seen sets (set c, and the public set once) with the r12 build, same blind grading, three iterations at most; (2) a held-out set that no agent of this project has opened: set d is the candidate if the owner confirms that the cell outputs of the halted round 11 run are archived outside the repository and that the controller never read them; otherwise a new set e written by a fresh agent that sees only the README's user-problem sentence and the task template; (3) public ours x3; (4) common blind grading, three votes per packet; (5) F9 (Haiku, Opus), F6 (10 percent independent regrade) only if Rule A and Rule B' pass on both sets. Win rules unchanged: Rule A (form 2 decides, both printed), Rule B, Rule B'. A run that returns 429 or an identity error stops the queue.

## Round 13 development gate protocol (frozen 2026-10-23, before any run of it)

Source: `docs/BEST-RIVAL-r13.md`. Owner decisions of 2026-10-23 apply: runs go through the subscription wrapper, not an API key; the controller runs the gate itself and, if the lead is clear, goes straight to the final measurement with a second protocol frozen first.

Tasks. A new development set of six tasks (T11 to T16) written this round for this gate only: `bench/head-to-head/dev/dev-tasks.json`, fixtures built by `bench/head-to-head/dev/make-dev-fixtures.mjs` (synthetic repositories HCV1 to HCV6 with invented people and fixed dates; it asserts its own counts), outcome labels in `dev-labels.json`. The classes follow the task kinds the category asks for (promotion evidence, committee statement, a claim checked before hiring, a quarterly summary from exported sessions, an invoice check, a plain git question that is out of scope). It is not the public `tasks.json` set and not any held-out set. Criteria, truth lines and fixtures are committed with this protocol and do not change after a result is seen. The set is a development set: its result decides whether to iterate or to start the final measurement; it is never quoted as a benchmark result.

Arms (4). OURS (product commit recorded in `env.json` of the run folder; `git archive`, `npm ci && npm run build`, `--plugin-dir`, `npx workproof` shimmed to that build); RCP (receipts, `anthropics/claude-plugins-official` `plugins/receipts` at 465f093, `git archive`, a minimal `.claude-plugin/plugin.json` added, plain prompt); RCP_I (same plugin, prompt prefixed with the invoked sentence of `tasks.json`: "Use the receipts skill (the /receipts command)."); BASE (empty plugin). RCP is the best rival of the previous held-out measurement (22.33 of 25 on set c) and, with BASE, the plain model arms led there. JD stays out of this gate to save calls; it is in the final measurement.

Runs. 6 tasks x 4 arms x 3 runs = 72 runs, model `sonnet`, `--setting-sources project --plugin-dir <arm> --strict-mcp-config --dangerously-skip-permissions`, `claude` resolved to `/Users/efe/claude-kredi-runs/sub-shim/claude` (forces HOME to the wrapper home, which holds no user settings, hooks or skills), `sdk-shim` removed from PATH. `guard.sh init` once, `check` around every run. Parallelism 3. A usage-limit, session-limit or authentication error stops the queue; `failed-cells.py` must print nothing before grading, and a failed cell is repeated only after the cause is gone, never graded.

Grading. Three independent blind votes: for each vote `assemble.py` builds one packet per task with the arms in a shuffled order from its own seed (`r13-dev-1`, `-2`, `-3`), the unchanged grader prompt of `assemble.py`, graded by `grade.sh` (Sonnet, no tools). A criterion of a run passes when at least two of three usable votes pass it. An unparseable vote is ignored; a packet with fewer than two usable votes is regraded once. Calls: 72 runs + 18 grading + 1 probe = 91, plus at most about 10 repeats; the first cell is a probe (one OURS cell on T11) to check isolation (the transcript init event shows the plugin, no user skills) before the queue starts.

Statistic and the lead rule. Per arm: total = sum over the six tasks of the mean run score (maximum 30). `score-dev.py` prints the totals, the best other arm, the 95 percent paired bootstrap interval of OURS minus the best other arm (10,000 resamples of the runs inside each task and arm, seed `r13-dev`), and the tasks where OURS trails the best other arm. A clear lead means: the lower bound of that interval is above zero AND OURS trails the best other arm by more than 0.34 on at most one task. A clear lead starts the final measurement. Anything else is not a lead: read the lost criteria, return to research and implementation, at most two development iterations in this round; each iteration is a new commit and a new run folder, the frozen criteria stay.

Cost record. Every call appends to the wrapper ledger; the run folder keeps `cost.tsv` (list-price estimate from `total_cost_usd`; the subscription is what is charged) and the claude version.

### Round 13 development gate result (2026-10-23)

Run exactly as frozen in the section above, product commit `f74cb3c12c75dc6d35778362377157a536e37b85`: 72 runs, none failed, three blind votes per packet (two usable votes for two of the six packets). Per-task means out of 5 (OURS / BASE / RCP / RCP_I): T11 5.00 / 2.67 / 3.33 / 4.00; T12 5.00 / 4.00 / 3.33 / 3.00; T13 3.67 / 1.67 / 2.33 / 2.33; T14 5.00 / 4.67 / 4.67 / 5.00; T15 4.67 / 4.00 / 4.00 / 4.00; T16 5.00 on all four arms. Totals (maximum 30): OURS 28.33, BASE 22.00, RCP 22.67, RCP_I 23.33. OURS minus the best other arm 5.00, 95 percent bootstrap interval [3.33, 6.00]; OURS trails no arm on any task. By the frozen rule this is a clear lead. Files: `bench/head-to-head/results/round13-devgate/` (`results.txt`, grades, per-run cost). Limits stated with the result: the tasks were written by the same controller that wrote the product changes, from task kinds seen in earlier rounds, so the gate shows that the product handles these classes, not that it generalises; the evidence for the launch claim is the final measurement below.

## Round 13 final measurement protocol (frozen 2026-10-23, before the first run of it)

Claim being tested (spec 2b, claim I1): in each of the two sets, the 95 percent bootstrap interval of (OURS total minus the best other arm's total) lies entirely above zero. The per-task table (Rule A as 80 percent of lost points, Rule B with the ceiling rule, Rule B') is published in full and does not decide the launch claim.

Product. Commit `f74cb3c12c75dc6d35778362377157a536e37b85` from `git archive`, `npm ci && npm run build`, `bench/` removed from the arm copy. No product, task, criterion, label or grader change after this commit is pushed; a change means a new gate.

Sets. (1) The public set: tasks T1 to T8 of `bench/head-to-head/tasks.json`, outcome labels `labels.json`, fixtures from `make-fixtures.sh`. (2) Held-out set d: the branch `heldout-2026-10-d` (tasks d1 to d5, `tasks.json`, `labels.json`, one `build-fixture.sh` per task). Set d was not read by this project's controllers: the cell outputs of the halted round 11 run were never opened and are not used; every d cell below is a new run. By the owner's decision of 2026-10-23 the runner (`dev/run-set.sh`) takes it with `git archive` (no checkout), builds its fixtures with its own scripts and prints no task, prompt or criterion; the controller reads none of them. Set d stays "read" after this measurement and cannot be held-out again.

Arms (8). OURS; BASE (empty plugin); RCP and RCP_I (receipts, `anthropics/claude-plugins-official` `plugins/receipts` at 465f093, patched only so the session folder can be redirected with `RECEIPTS_HOME`: `os.homedir()` replaced by `(process.env.RECEIPTS_HOME || os.homedir())` in `mine-transcripts.mjs`, a minimal `.claude-plugin/plugin.json` added); JD and JD_I (`day-raval/jd-resume-tailor` at 701801493babf6ee75561b5a76b0d0c255bd12e8); CV and CV_I (cv-builder-plugin at f7c8c3b6d379f8d12ca1c70fc7576652dcdfe16c, `.mcp.json` removed). The three competitors are the strongest after reading them (spec: at most 3): RCP and CV tie for second in the round 10 public set, JD beat us on every task of set c. GAP and SR (no git verification, BEST-RIVAL-r12 section 7) are not run in this measurement; they are listed in the evidence as "not run, reason: weakest in rounds 10 and 11". Invoked arms use the `invoked` prompts of `tasks.json`.

Runs. 13 tasks x 8 arms x 3 runs = 312 runs, Sonnet (`sonnet`), `--setting-sources project --plugin-dir <arm> --strict-mcp-config --dangerously-skip-permissions`, `claude` = `/Users/efe/claude-kredi-runs/sub-shim/claude` (subscription login, isolated HOME), `sdk-shim` off PATH. No cell is reused from any earlier round. Parallelism 3. Order: set d, then the public set. `guard.sh` around every run. A usage-limit, session-limit or authentication error stops the queue and is reported; `failed-cells.py` must print nothing before grading; a failed cell is never graded.

Grading. Per set and task one blind packet with all arms, arms in a shuffled order from the seeds `r13-final-d-1..3` and `r13-final-public-1..3`, the unchanged grader prompt of `assemble.py`, Sonnet, no tools; three votes; a criterion of a run passes with at least two of three usable votes; a task needs at least two usable votes or its packet is graded again once. Only outcome-labelled criteria count.

Statistics (`dev/score-dev.py --labels`): per set, arm totals (sum over tasks of the mean run score), best other arm, the paired bootstrap (10,000 resamples of runs inside each task and arm, seed `r13-final`), Rules A, B, B' as printed. Better-of-plain-and-invoked per competitor is printed beside the arm totals. The launch statement is made per set; "first in total" is claimed only if both intervals are above zero, and it is scoped: on these tasks, this model, this date, this harness.

After the two sets, in this order and only if both intervals are above zero: F6 (an Opus grader re-grades a seeded random 10 percent of cells, a disagreement of more than one point on a cell sends the grading back for repair); F9 (Haiku and Opus, one run per task for OURS, BASE and the best competitor arm of each set, graded blind the same way; no task may be lost on a model).

Evidence. `bench/head-to-head/results/round13-final/`: this protocol's commit, arms.json with the pins above, env.json (claude version, node, date, wrapper), task files and labels of both sets as run (set d included, published after the measurement as the spec requires), runs redacted by `evidence-tools/redact.py`, grades of every vote, score output, per-run cost from `total_cost_usd` (list price estimate; the subscription is charged), SHA256SUMS, a reproduce note. Anything that went wrong is written in the summary.

Call estimate: 312 runs + 13 packets x 3 votes = 39 grading calls = 351 `claude -p` calls for the main measurement; F6 about 15 more; F9 up to 78 runs + 26 grading calls. About 470 calls in total plus repeats.

### Amendment to the round 13 final measurement protocol: F6 in two parts (2026-10-23, written after the first set-d runs started and before any run was graded or any score seen)

Reason (owner message, from surviving-lines round 11): re-running a sampled cell once and requiring it to match the original fails for noise alone, because one agent run varies as much as the cell's three runs do. The F6 sentence of the frozen protocol is replaced by:
- F6-grader. A seeded random 10 percent of the cells, taken with their original answers; fresh grader sessions (Opus, no memory of the first grading) re-grade those answers, all arms of the task graded together in one packet as originally. Pass: no sampled cell differs by more than one point from its graded score and the share of criteria with the same verdict is at least 90 percent. A failure sends the grading back for repair.
- F6-runs. The same sampled cells are run once more on fresh fixtures and graded in the same way. Reported descriptively only: the count of re-runs whose score lies within the min-max of that cell's three runs. Not pass or fail.
Nothing else in the protocol changes.

### Amendment 2 to the round 13 final measurement protocol (2026-10-23, written after the set-d runs and their three-vote grading, before the public set was graded)

Owner decisions of 2026-10-23, applied as far as the frozen state allows. Stated openly: set d had already been graded with three votes and its three-vote scores had been seen when this amendment was written; the public set had not been graded.
- Launch claim: Sonnet claim I1 only. F9 (Haiku and Opus) is reported descriptively as totals and does not gate.
- Grading: five independent blind votes per packet (the three existing votes plus two more with seeds `r13-final-d-4`, `-5`, `r13-final-public-4`, `-5`), the criterion passing on a majority of valid votes, at least three valid votes per packet or the packet is an error and is graded again. The three-vote scores of set d stay in the evidence beside the five-vote scores; the five-vote scores are the ones that count, whichever is higher. The grader prompt text of `assemble.py` is not changed, so "reason written before the verdict" is not done: changing the prompt after seeing d scores would be a harder departure than leaving it. Criteria are judged by the grader, not by scripts, as before. Reverse-order passes: votes 4 and 5 use new shuffles, which is the reverse-order check; there is no separate pass.
- F6 as amended above (F6-grader pass/fail, F6-runs descriptive).

## Rulings after round 13 (orchestrator, 2026-10-23, recorded before any new call)

1. Round 13 stays published as it is, with both gradings shown: the three-vote result (public 30.33 vs 22.00, [6.33, 10.33]; set d 21.00 vs 18.67, [0.33, 3.33]) and the five-vote result (public 30.00 vs 21.00, [7.00, 10.67]; set d 20.67 vs 18.67, [0.00, 3.33]). Neither is called the launch result. The grading went from three to five votes in the middle of the round because the orchestrator's five-vote instruction reached the controller after the final protocol had been frozen and after set d had been graded with three votes; the protocol was amended openly (Amendment 2) rather than re-frozen. Set d is not re-graded with a fresh grader and no version is picked because it passes.
2. Round 14 is a confirmation on a new held-out set e for workproof, product unchanged: commit `f74cb3c12c75dc6d35778362377157a536e37b85`, the exact build measured in round 13. The public set is not re-run; its round 13 five-vote result stands (I1 [7.00, 10.67]). The launch claim for workproof needs claim I1 on the public set (round 13) and on set e (round 14), plus F6-grader passing in round 14.

## Round 14 protocol: confirmation on held-out set e (frozen 2026-10-23, before any run of set e)

Purpose. Confirm, on a new held-out set, the result of round 13 (public set five-vote I1 [7.00, 10.67] stands; the public set is not re-run). Product unchanged: commit `f74cb3c12c75dc6d35778362377157a536e37b85`, the exact build measured in round 13 (the arm folder is the same `git archive` build, `bench/` removed). The launch claim for workproof needs I1 on the public set (round 13) and on set e (this round), plus F6-grader passing in this round.

Set e. Written by one fresh Sonnet agent that was told only the user-problem sentence of the README ("Most of my work is in private repositories, and I cannot show anyone what I did there without showing the code.") and the task format (prompt, fixture builder, truth script, five outcome criteria per task), and that it must not read this repository's code, documents, earlier task sets or results; it worked in a staging folder outside the repository. Five tasks e1 to e5 on five public repositories in five ecosystems (pinned commits, synthetic history with fixed dates). The controller ran `validate-e.sh` (each fixture built twice, identical HEAD, `truth.py` output equal to `truth.txt`; all five OK) and `make-e-tasks.py` (builds `tasks.json` and `labels.json` from the writer's folders by script; all 25 criteria labelled outcome because the writer was told to write outcome criteria only). The controller did not read any prompt, truth file or criterion. Disclosure: the writer's closing message to the controller listed the five repositories with pinned commits and one-line hazard lists for each task; the controller read that message. The product is unchanged, so nothing could be tuned. The set was sealed on the local branch `heldout-2026-10-wp-e` (commit `f919b7f9f1841557a66fbdb518bf54d3128732a4`) with git plumbing (`seal-e.sh`: no checkout, nothing pushed) and is published only with the evidence of this round.

Arms (8, all re-run fresh on set e, no reused cell): OURS; BASE; RCP and RCP_I; JD and JD_I; CV and CV_I, with the same pins and patches as `bench/head-to-head/results/round13-final/arms.json`.

Runs. 5 tasks x 8 arms x 3 runs = 120 runs, Sonnet, subscription wrapper (isolated HOME, apiKeySource none), `sdk-shim` off PATH, parallelism 3, `guard.sh` around every run (`r14/run-e.sh`). A usage-limit, session-limit or authentication error stops the queue; state is written to the run folder and reported; a failed cell is never graded.

Grading, from the start: five independent blind votes per packet (Sonnet, no tools), arms shuffled per vote (seeds `r14-e-1..5`), reason written before the verdict (`r14/assemble-r14.py`; the only change from `assemble.py` is the reply instruction), a vote that cannot be read is asked once more with the same prompt, a criterion passes on a majority of valid votes, fewer than three valid votes for a packet is an error that blocks scoring. Criteria are judged by the grader; no criterion is script-checked.

Claim I1 (the launch statistic): OURS total minus the best other arm's total on set e; 95 percent paired bootstrap interval (10,000 resamples of the runs inside each task and arm, seed `r14-final`), computed by `r14/score-r14.py` with the outcome labels; it must lie entirely above zero. The best other arm is the single best of the seven (plain and invoked arms are separate arms). Also reported, descriptively: the per-task better of plain and invoked for each competitor family (family totals and OURS minus the best family), I2 (Rules A, B with the ceiling rule, B') printed in full, the per-task table with every run.

F6-grader (pass or fail). A seeded random 10 percent of the cells (12 of 120, seed `r14-f6`) with their original answers; every task that holds a sampled cell is re-graded with all its arms in one packet as originally, by three fresh Opus sessions (new shuffle, same reason-first prompt), majority per criterion. Pass: no sampled cell differs from its original graded score by more than one point and the share of criteria with the same verdict over the sampled cells is at least 90 percent. A failure sends the grading back for repair and blocks the launch claim.
F6-runs (descriptive). The same 12 cells are run once more on fresh fixtures and graded the same way; reported as the count of re-runs whose score lies inside the min-max of that cell's three original runs. Not pass or fail.
F9 (descriptive). Haiku and Opus, one run per task, for OURS, BASE and the best other arm of set e; graded by the same five-vote procedure on the cells of one model per packet; totals are reported and do not gate.

Evidence. `bench/head-to-head/results/round14-e/` per EVIDENCE-SPEC: arms.json, env.json, tasks and labels of set e as run (published after the measurement), redacted runs, every vote, F6 files, `recompute.sh` and `score.py`, cost, SUMMARY listing every departure and every failure, SHA256SUMS.

Call estimate: 120 runs + 25 grading calls (+ re-asks); F6: about 15 Opus grading calls + 12 runs + about 25 grading calls; F9: 30 runs + about 10 grading calls. About 250 calls.

## Round 15 start (orchestrator ruling, 2026-10-23, recorded before any product change)

Held-out sets d and e have been read (both published in the evidence folders of rounds 13 and 14), so they are no longer held-out. From this entry on they are DEVELOPMENT tasks, together with the controller's own T11 to T16. The public set stays seen. No public-only launch claim is made for workproof. Round 15 order: (1) diagnose per task and per criterion why OURS loses (d D2 and D3, e E5, and why every arm fails e E3 C4 and C5), looking for the general user capability behind each loss and hard-coding nothing about these repositories or criteria; (2) implement general fixes (Haiku implementers, Sonnet reviewers, tests, mutation checks); (3) a development gate on d, e and T11 to T16 with five-vote reason-first grading, OURS against RCP_I, CV_I and BASE, 3 runs, the clear-lead rule written before the run; (4) only if the lead is clear, a new held-out set f written by a fresh agent and sealed as set e was (the controller reads only the pass or fail of the validation script), with a frozen protocol, eight fresh arms, F6-grader and F6-runs, F9 descriptive. First place is the target, not perfect scores.

### Round 15 diagnosis and development gate protocol (frozen 2026-10-23, before the run)

Diagnosis (read-only agents over the round 13 and 14 transcripts and grader reasons; general capabilities, nothing fixture-specific): (a) D2: a first/last-date statement written from a hand `git log` list that did not reconcile with the printed commit count (a commit near a day boundary dropped); (b) D3: nothing asked the model to say whether an author address is organisational or personal, and rule 1 (merge same-person addresses) was read as applying to a third party; (c) E5: merge commits were put in a "not counted" list and their messages were not read, so approval recorded on a merge was missed; the hint did not fire for an auditor request; (d) E3: the same-name address of a namesake was folded into a candidate's figures, ownership was judged by touched commits rather than surviving lines, and "cannot be decided from history" was reported as "does not hold". Fixes: commit `c9aedaaaba7b189017c69ffebbd651f2fc5fb1eb` (core-rules.md rules 1, 5, 7, 9; `figures` four rows; hint words). Also found: the grader sometimes writes verdicts as the strings "true"/"false"; round 14's scorer dropped those votes as invalid. Round 15 uses `r15/score-r15.py`, which accepts exactly those two strings. Re-scored with it, the round 14 data give OURS 16.67 against CV_I 17.67, interval [-3.67, 1.00]; round 14 stays published as scored.

Gate. Development tasks: D1 to D5, E1 to E5 (now development) and T11 to T16 (16 tasks, maximum 80, outcome criteria). Arms: OURS (commit above, `git archive`, `npm ci`, build, `bench/` removed), RCP_I, CV_I, BASE, same pins as round 13. 3 runs per cell: 16 x 4 x 3 = 192 runs, Sonnet, subscription wrapper, parallelism 3, `guard.sh`. Grading: five blind reason-first votes per packet (`r14/grade-r14.sh`, `r14/assemble-r14.py`), scoring with `r15/score-r15.py`. A clear lead is all of: (1) the 95 percent bootstrap interval (10,000 resamples, seed `r15-dev`) of OURS minus the best other arm over all 16 tasks has a lower bound above zero; (2) the same on the ten tasks D1 to D5 and E1 to E5 alone; (3) OURS trails the best other arm by 1.0 or less on every task. Limit: the fixes were derived from these tasks, so the gate shows that the diagnosed gaps are closed, not that the product generalises; generalisation is tested only on a new held-out set f. If the lead is not clear: another diagnosis round, at most two iterations; no set f is written.

### Isolation check and plan change (2026-10-23, written while the round 15 development run was in progress)

Isolation. A run whose working directory is below `/Users/efe` loads the owner's `~/.claude/CLAUDE.md` as project memory. Check of rounds 13 and 14 (and the round 13 development gate): every cell ran with its working directory under `/private/tmp/claude-501/.../scratchpad/<run folder>/runs/<cell>/fx` (the session folders in the wrapper home are named `-private-tmp-claude-501-...`; the string `-Users-efe-Desktop-portfolio` inside that name is part of the scratchpad folder name, not an ancestor of the working directory). The init event of sampled cells (`final-d` D1, `final-e` E1, `final-public` T1) lists `memory_paths` with only the auto-memory folder inside the wrapper home, and no owner instruction file appears in the 312 + 120 + 72 transcripts (no cell mentions the owner's instruction text). Result: rounds 13 and 14 were not measured with the owner's instructions loaded. A second, separate contamination was found: in cells where the receipts plugin was invoked on a usage-report task without `RECEIPTS_HOME` (public T5 RCP_I runs 1 and 3 and, in the development gate, T12 RCP_I runs 1 to 3 show it in the transcript), receipts read the session history in the shared wrapper home, which holds sessions of other controllers (the transcript shows a skill name from them). That affects only the receipts arms, in usage-report cells, and does not favour OURS; it is recorded here and the scores are not changed. All round 15 work folders stay under `/private/tmp`.

Plan change. The round 15 development run (192 cells, ours = `c9aedaa`) was stopped after 66 cells (someone terminated the claude processes; 3 cells were killed mid-run); its cells are set aside and not graded. Per the owner's brief 2 the gate will instead be run on tasks written by two or three independent fresh writers plus the read sets d and e, with "clear lead" defined before the run (I1 lower bound above zero on the new writers' sets); a real-repository sweep of the deterministic commands (no model cost) runs first and its findings, logged in `docs/SWEEP-2026-10-23.md`, are fixed with tests. The protocol text above for the 16-task gate is superseded by the gate protocol that will be frozen after the sweep and the new sets exist.

### Round 15 development gate protocol v2 (frozen 2026-10-23, before any cell of it was run; replaces the 16-task gate above)

Task sets. Three independent fresh Sonnet writers each wrote a small set from a plain description of the user's job, without reading this project's code, documents or earlier tasks (staging folders outside the repository): W1 (4 tasks; description: the single user-problem sentence), W2 (4 tasks; a paragraph about a freelancer/employee who must show what they did on a project), W3 (5 tasks; a paragraph describing the tool's job from both the sender and the receiver side). Each task was checked by script (`r15/validate-w.sh`: each fixture built twice with identical HEAD, `truth.py` output equal to `truth.txt`; all 13 OK); the controller read no prompt, truth or criterion, only the writers' closing line (DONE and repository names). `r15/make-w-tasks.py` builds the task and label files by script (all 65 criteria outcome). The read sets D (D1 to D5) and E (E1 to E5) are secondary development material. The writers' sets are new to the product: its rule changes of commit `c9aedaa` were derived from D, E and the controller's tasks, not from W1 to W3.

Arms. OURS (build recorded in `env.json` of the run folder; it includes the sweep fixes below if any; the rival cells may be run before it is built, on the same day, same wrapper, same fixtures), BASE, RCP, RCP_I, CV, CV_I on W1 to W3 (13 tasks x 6 arms x 3 runs = 234 cells); OURS, BASE, RCP_I, CV_I on D and E (10 tasks x 4 arms x 3 runs = 120 cells). Same pins as round 13. Work folder under `/private/tmp`. Grading: five blind reason-first votes per packet (`r14/grade-r14.sh`, `r14/assemble-r14.py`), `r15/score-r15.py` (verdict strings "true"/"false" accepted).

Clear lead = all of: (1) on the 13 writer tasks the lower bound of the 95 percent bootstrap interval (10,000 resamples, seed `r15-gate`) of OURS minus the best other arm is above zero; (2) on each of W1, W2 and W3 alone OURS total is at least the best other arm's total; (3) on D and E together OURS total is at least the best of BASE, RCP_I, CV_I; (4) every cell ran with its working directory under `/private/tmp` and the init event lists no owner instruction file. Not clear: another diagnosis and fix round (at most two); no set f.

## Resume (written 2026-10-23, paused at the owner's request because the usage limit is close)

State of the repository (branch `plugin-leadership`, pushed): product commit `c9aedaa` (general fixes from the round 15 diagnosis: core-rules.md rules 1, 5, 7, 9; `figures` first/last date, active months, gaps rows; auditor/compliance hint words). Round 13 and 14 evidence folders stand as published. Isolation checked: rounds 13 and 14 were not measured with the owner's instructions loaded (entry "Isolation check" above).

Done in round 15: diagnosis of D2, D3, E3, E5 (general capabilities); fixes above with tests; the 192-cell development run `dev15` (ours `c9aedaa` on D, E and T11 to T16) finished but is NOT graded and superseded by the v2 gate; three independent writers produced sets W1 (4 tasks), W2 (4), W3 (5), validated by script, task and label files built by script; gate protocol v2 frozen and pushed (`ca8a572`); a real-repository sweep ran on 13 of 44 repositories and was stopped (log: `docs/SWEEP-2026-10-23.md`, script `bench/sweep/sweep.py`, list `bench/sweep/repos.tsv`; findings so far: `verify`/`verdict` fail on a report just written when another address shares the author's name (`src/verify.ts:66`), a one-commit difference against plain git on one repository, django-size history over 70 s per command, two unexplained whitespace/blame differences).

Done of the gate v2: rival cells only (BASE, RCP, RCP_I, CV, CV_I) in `/private/tmp/claude-501/-Users-efe-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/gate15/runs`: 67 complete cells; 3 half-run cells were moved to `gate15/aborted` and must be re-run; no OURS cell of the gate has been run; nothing graded.

Next, in order: (1) fix the sweep findings with tests (Haiku implementers, Sonnet reviewers), finish the remaining sweep repositories (31 not run) and the probe cases, log everything in the sweep document; (2) build OURS from the then-current commit (`git archive`, `npm ci`, build, remove `bench/`), record the commit; (3) resume the gate: `r15/run-gate15.sh <workdir>` skips finished cells (env: ARM_OURS, ARM_BASE, ARM_RCP, ARM_CV, W1_STAGE, W2_STAGE, W3_STAGE, D_SRC, E_SRC, FIX_D, FIX_E; `ARMS_ONLY` limits the arms), then grade with `r14/grade-r14.sh` (five votes) and score with `r15/score-r15.py` (clear-lead rule in the v2 protocol); (4) only on a clear lead: write a new held-out set f with another fresh writer, seal with `r14/seal-e.sh` style plumbing on a local branch, freeze the round protocol, run all eight arms fresh, F6-grader and F6-runs, F9 descriptive, evidence folder.

Sealed and unsealed sets: sealed (never read by the controller): none currently. Read, now development material: d, e (branches `heldout-2026-10-d`, local `heldout-2026-10-wp-e`), W1 to W3 (staging folders `wr1-stage`, `wr2-stage`, `wr3-stage` in the scratchpad, not in the repository), the public set, T11 to T16. The held-out sets of rounds 13 and 14 stay published in their evidence folders.

Running processes: none (the gate runner was stopped; the sweep agent was asked to stop and did). Working folders are under `/private/tmp` as required by the isolation rule.

## Round 15, phase 2 (2026-10-24): what changed since the Resume, and the multi-writer gate protocol (frozen before any gate cell is run)

Done since the Resume section, all on `plugin-leadership`, each with tests, mutation checks and a separate reader: `verify` recomputes the exact identity set the report counted (keyed hash per address in the report); commits with odd UTC offsets are no longer lost from windowed counts; unreadable records are counted; submodules are skipped in blame; large histories are read in parallel slices and `figures` reads large-file headers in one batch (django report 54 s to 32 s, `figures` on a 210-commit repository 16 s to about 1 s); new commands `workproof reviews` (second-person review evidence from trailers and merges, names only), `workproof owner` (ownership of a path by surviving lines beside plain blame); `figures` first/last date, active months and gap rows and `figures --brief`; the prompt hint adds the prepared brief, a steering sentence and, for review-evidence and ownership requests, the matching command; the Stop hook verifies counts and dates in the final answer and in written files against `figures` (B1; precision rules after review); `references/tailor.md` hard rules adapted from cv-builder and jd-resume-tailor (MIT, ideas only). B3 (a cheap second-model check) is not implemented: it stays off until read material shows a benefit. The capability table is `docs/BEST-RIVAL-r15-deep.md`; the sweep log is `docs/SWEEP-2026-10-23.md`.

Gate tasks. Three further fresh Sonnet writers (W4, W5, W6) wrote 4, 4 and 5 tasks from three different plain descriptions of the user's job (a sentence about explaining last quarter's work from git history and session logs; a paragraph about reviewing evidence others send; a paragraph about explaining engineering work to people who do not code). Same validation as W1 to W3 (all 13 fixtures OK by script); the controller read no prompt, truth or criterion. They are not material of the earlier diagnosis (D, E, W1 to W3), so the gate is the first look at them.
Arms and cells: OURS (product commit recorded in the run folder's `env.json`), BASE, RCP, RCP_I, CV, CV_I; 13 tasks x 6 arms x 3 runs = 234 cells; same pins as round 13; subscription wrapper, isolated HOME, working folder under `/private/tmp`; `guard.sh` around every run. Rival cells may be run before OURS is built (same wrapper, same day, same fixtures). Grading: five blind reason-first votes per packet (`r14/grade-r14.sh`, `r14/assemble-r14.py`), `r15/score-r15.py` (verdict strings "true"/"false" accepted), outcome criteria only.
Clear lead = all of: (1) the lower bound of the 95 percent bootstrap interval (10,000 resamples of the runs inside each task and arm, seed `r15-gate2`) of OURS minus the best other arm over the 13 tasks is above zero; (2) on each of W4, W5 and W6 alone OURS total is at least the best other arm's total; (3) mean list-price cost per OURS cell is at most 1.6 times the mean cost per BASE cell on the same tasks; (4) every cell's working directory is under `/private/tmp` and the init event lists no owner instruction file. If (1) to (4) all hold, a new sealed held-out set from yet another fresh writer is the next step; otherwise another diagnosis round (at most two) and no final.
Read-material check (descriptive, not gating): OURS on D, E and W1 to W3 (23 tasks, 3 runs), compared with the rival cells that already exist for those tasks (rounds 13 and 14 for D and E, the 67 gate-v1 cells for W1 to W3), to see whether the diagnosed losses closed.

### Round 15 multi-writer gate result (2026-10-24): not a clear lead

234 cells, no failures, five-vote grading (`bench/head-to-head/results/round15-gate2/`). OURS 55.00 of 65, CV_I 52.33, CV 47.67, RCP_I 49.67, RCP 47.00, BASE 45.33; OURS minus the best other arm 2.67, 95 percent bootstrap interval [0.33, 5.00]. Frozen conditions: (1) interval lower bound above zero: yes; (2) OURS at least the best other arm on each writer's set: W4 17.00 vs 17.00 yes, W6 21.67 vs 18.66 yes, W5 16.33 vs CV_I 16.66 NO; (3) cost per OURS cell 1.37 times BASE (limit 1.6): yes; (4) isolation: yes. Condition (2) fails by 0.33 points on W5, so by the rule frozen before the run this is not a clear lead: no final measurement; another diagnosis round (this is the first of at most two). Tasks where OURS trails the best arm: W4T2 (3.33 vs CV_I 5.00), W5T4 (4.33 vs 5.00), W5T1 (4.33 vs BASE 4.67), W6T3, W6T5, W4T3. Rule A passes (0.79); Rules B and B' fail.

## Round 15, gate 3 (2026-10-24): protocol frozen before any gate-3 cell is run

Status. This section replaces the "Resume" section (2026-10-23) as the current state. Gate 2 was not a clear lead (see above); W4 to W6, D, E and W1 to W3 are now diagnosed material and are not used again as evidence of a lead. Changes since gate 2, all on `plugin-leadership` with tests and mutation checks: rule 7 of the skill reads "same name plus a noreply address, or the user's own second address, is the same person (included, please confirm)"; commit shas and dates go in the body when a matching commit is requested; non-authored participation is its own row with the real author; the three-state tally (holds, holds with an exception, does not hold); concentration needs commit share and line share; `figures` prints "lines written, net of exclusions", the excluded lines by reason, the largest commit and the shares; `sessions --dir` warns on folders with no session rows; the Stop check blocks a repository e-mail address written to a file unless the prompt asks for addresses; the prompt-start brief is windowed by the window named in the prompt. The second-eye option (B3) stays off: no read material shows a benefit. Product commit for gate 3: `09fdd2f`, built from `git archive` into the scratchpad as `arms/ours17`.

Tasks. Three further fresh Sonnet writers (W7, W8, W9), each given one plain paragraph describing a different job (a team lead writing fair performance reviews; a freelance developer with several clients and several e-mail addresses; an investor's technical due-diligence reviewer). Same task format and the same script validation as W4 to W6; the controller reads no prompt, truth or criterion. The gate set is the first look at them.

Arms and cells: OURS, BASE, RCP, RCP_I, CV, CV_I on all W7 to W9 tasks, 3 runs each, same pins and wrapper as gate 2, working folder under `/private/tmp`, `guard.sh` around every run, `H2H_HOOK_EVENTS=1` so the init and hook events are recorded. Rival cells are run on the same day as OURS. Grading: five blind reason-first votes (`r14/grade-r14.sh`, `r14/assemble-r14.py`), `r15/score-r15.py`, outcome criteria only.

Clear lead = all of: (1) the lower bound of the 95 percent bootstrap interval (10,000 resamples of the runs inside each task and arm, seed `r15-gate3`) of OURS minus the best other arm over all W7 to W9 tasks is above zero; (2) on each of W7, W8 and W9 alone OURS total is at least the best other arm's total; (3) mean list-price cost per OURS cell is at most 1.6 times the mean cost per BASE cell; (4) every cell's working directory is under `/private/tmp` and no owner instruction file is loaded. If (1) to (4) hold, the next step is a sealed final on a further fresh writer's set with the frozen protocol; if not, the result is recorded as it is, diagnosis is limited to the cause of the failed condition, and no condition is changed afterwards.

## Round 15, gate 3 result (2026-10-24): not a clear lead

Run exactly as frozen in commit 8f1f337 (no change to protocol, tasks, arms or scorer). 270 cells, 0 failed, all working folders under `/private/tmp`. Five blind reason-first votes per packet; two packets (W8T1, W8T3) had their vote v2 unreadable and it was asked again with the same prompt (third try readable; attempt files are not votes). Data: `bench/head-to-head/results/round15-gate3/` (`results.txt`, `lead-check.txt`, grades).

Totals over W7 to W9 (outcome criteria, maximum 75): OURS 62.00, BASE 58.33, RCP_I 58.00, CV 56.00, RCP 53.67, CV_I 49.00. OURS minus best other arm (BASE) = 3.67; 95 percent bootstrap interval (10,000 resamples, seed `r15-gate3`) [-1.33, 6.67].

| Condition | Result |
|---|---|
| (1) interval lower bound above zero | FAIL (-1.33) |
| (2) OURS total at least best other arm on each of W7, W8, W9 | FAIL: W7 21.00 vs RCP_I 23.33 (fail); W8 21.00 vs 17.67 (pass); W9 20.01 vs 19.34 (pass) |
| (3) mean cost per OURS cell at most 1.6 times BASE | pass (0.1378 vs 0.0880 USD, ratio 1.57) |
| (4) all working folders under /private/tmp, no owner instruction file | pass |

Per-task: OURS trails the best other arm by more than 0.34 on W7T1 (3.00 vs 5.00), W7T2 (4.00 vs 5.00), W8T2 (4.00 vs 5.00) and W9T1 (2.67 vs 5.00); it leads on W7T4, W7T5, W8T3 (4.00 vs 2.67), W8T4, W8T5, W9T2 (4.67 vs 2.00), W9T4 is behind by 0.33. Rule A ratio 0.78 (passes); Rule B' fails. Better of plain and invoked per competitor family: RCP 62.33, so OURS minus best family = -0.33. The result is recorded as it is. By the frozen rule the sealed final is not started; diagnosis is limited to the cause of the failed conditions (W7 and the W7T1, W7T2, W9T1 losses) and the conditions are not changed.

## Round 15, gate 3 loss diagnosis and iteration 18 (2026-10-24)

Scope: the failed conditions only (W7 total below RCP_I; losses on W7T1, W7T2, W9T1, W8T2). W7 to W9 are now read material and become development material; no later gate uses them as evidence of a lead. Grader reasons and the final answers of the OURS cells were read; the capabilities behind the losses, not fixture details:

1. Identity of a person who appears under two addresses. Rule 7 kept "same name on an unrelated address" as a separate unconfirmed person. Two sets (a ranking of contributors, a per-person review file) and a trailer question (a co-author trailer carrying a second address of the same organisation) expected one person: OURS split a contributor into two rows (W9T1: lost the second place and the one-entry criterion), held out a commit from a person's record (W7T1) and refused to count a trailer (W7T2). The earlier narrowing came from a namesake case, so the new rule separates by kind: same full name at the same organisation, or beside a personal mailbox, is merged (one row, merged and split figures, labelled "please confirm"); the same name at unrelated organisations stays a separate unconfirmed person.
2. Trailer help read on every commit, in any key case, including other people's commits that name the person. One of three OURS cells missed the reviewed-by trailers on a colleague's commits.
3. A reverted piece of work was listed under "shipped" while counted in lines written. It stays in lines written but is listed under "reverted".
4. Commit counts: OURS gave only the deliverable counts (2, 3, 4), the criterion also looks for the plain non-merge commit count of each person; the answer now gives the commit count beside the counted ones.
5. Listing files (AUTHORS) that name people with no commits: they are named, with no share (OURS named them in one cell of three).
6. W8T2 (surviving versus added lines for a person's contribution) and the variance on W7T2 are noted, not changed: no general rule is derivable from one task.

Change: `skills/workproof/references/core-rules.md` rules 3, 6, 7 (4,300 characters, the hint limit; mutation-checked test additions in `test/plugin-trigger.test.mjs`). Product commit recorded below once committed. Next: a gate on three further fresh writers with a protocol frozen before any cell.

## Round 15, gate 4 (2026-10-24): protocol frozen before any gate-4 cell is run

Status. Gate 3 was not a clear lead (above); its diagnosis led to product commit `02af6c0` (core-rules 3, 6, 7). W7 to W9 are read material. Gate 4 is the first look at three further fresh writers.

Tasks. Three fresh Sonnet writers (W10, W11, W12), each given one plain paragraph describing a different job (an open-source maintainer writing an acknowledgement and impact report for a funder; a job seeker documenting their own contributions across several repositories and addresses; a university lecturer grading individual students on team projects) and a common format specification that names no tool and no rule of ours. Each wrote 5 tasks with a deterministic fixture builder and a truth script; all 15 fixtures passed the script check (two builds, equal HEAD, truth.py equals truth.txt). The controller read no prompt, truth or criterion.

Arms and cells: OURS (commit `02af6c0`, `git archive`, `npm ci`, build, `bench/` removed), BASE, RCP, RCP_I, CV, CV_I on all 15 tasks, 3 runs each (270 cells), same pins and wrapper as gate 3, working folder under `/private/tmp`, `guard.sh` around every run, `H2H_HOOK_EVENTS=1`. Grading: five blind reason-first votes (`r14/grade-r14.sh`, `r14/assemble-r14.py`; a vote that does not parse is asked again with the same prompt, never replaced by a different shuffle), `r15/score-r15.py --labels`, outcome criteria only, seed prefix `r15-gate4`.

Clear lead = all of: (1) the lower bound of the 95 percent bootstrap interval (10,000 resamples of the runs inside each task and arm, seed `r15-gate4`) of OURS minus the best other arm over all 15 tasks is above zero; (2) on each of W10, W11 and W12 alone OURS total is at least the best other arm's total; (3) mean list-price cost per OURS cell is at most 1.6 times the mean cost per BASE cell; (4) every cell's working directory is under `/private/tmp` and no owner instruction file is loaded. If (1) to (4) hold, the next step is a sealed final on a further fresh writer's set with a frozen protocol; if not, the result is recorded as it is, diagnosis is limited to the failed conditions, and no condition is changed afterwards. Scripts: `r15/make-gate4.py`, `r15/run-gate4.sh`.

## Round 15, gate 4 result (2026-10-25): OURS is behind; no lead

Run as frozen in `bbaebfa`: 270 cells (15 tasks W10 to W12, 6 arms, 3 runs), 0 failed, five blind reason-first votes (four unreadable votes were asked again with the same prompt; attempt files are not votes). Data and the writers' task sources: `bench/head-to-head/results/round15-gate4/`.

Totals (outcome criteria, maximum 75): BASE 65.33, CV_I 64.33, CV 64.00, RCP 62.00, RCP_I 61.33, OURS 60.00. OURS minus best other arm = -5.33; 95 percent bootstrap interval (seed `r15-gate4`) [-9.00, -2.33].

| Condition | Result |
|---|---|
| (1) interval lower bound above zero | FAIL (-9.00) |
| (2) OURS at least the best other arm on each writer | FAIL: W10 16.33 vs BASE 23.33; W11 21.00 vs 21.00 (pass); W12 22.66 vs 22.00 (pass) |
| (3) cost per OURS cell at most 1.6 times BASE | FAIL: 0.2038 vs 0.1144 USD, ratio 1.78 |
| (4) folders under /private/tmp | pass |

Result: not a clear lead; it is a loss on W10 and no gain elsewhere beyond noise. The sealed final is not started. The conditions are not changed.

Diagnosis of the failed conditions (W10 is now read material; capabilities, not fixtures):
1. Future author date with an in-window committer date (a clock error): OURS dropped the commit from the count in all 3 runs (W10T5: 1.00 against 5.00 for BASE). Rules 2 and 8 say author date and "omit future dates from dated lists", which was applied to counts. A count of contributors should include the person, flagged, by the committer date.
2. Reverted work in a headline figure: a request for a figure "I can defend" was answered with the reverted lines inside the headline table in 2 of 3 runs (W10T2). Rule 6 (written for the user's own work) keeps reverted work in lines written. For a person's lasting contribution the headline should exclude the reverted pair and show it beside.
3. One person split across roles or addresses in a thank-you list (W10T3): the same person appeared as two rows (author and co-author, or two reports of one reporter) and the window was applied on author date in the local offset instead of the UTC instant the user asked for.
4. Cost: mean cost per OURS cell rose to 1.78 times BASE (0.204 against 0.114 USD), outside the limit; cells for the long tasks spend extra turns on rules and tool calls that do not change the answer.
5. Across both gates the lead is concentrated on tasks with a hazard the rules name (identity, reverts, vendored code). On a writer whose job (funder reports) puts the hazards elsewhere, the plain model matched or beat the product. This is the generalisation gap the brief describes; two iterations of rule edits on read sets (gates 2 and 3) did not close it.

Not changed in the product after this gate (decision): the three rule edits above need space in `core-rules.md`, which is at its 4,300-character limit, and each edit was derived from one read task. A fourth gate on rule edits alone is unlikely to show an interval above zero, because the fresh-writer result moved from +3.67 (gate 3, read-derived fixes not yet applied) to -5.33 (gate 4) with the fixes applied. Options for the owner: (a) stop the Sonnet first-place claim for workproof and publish the measured scope (tasks about identity, reverts and vendored code, where OURS leads); (b) a redesign that removes cost and rule volume (a lighter hint, the deterministic CLI doing the identity and window decisions instead of prose rules) before a further gate on two fresh writers; (c) continue per the brief with the three rule edits and a gate on W13 to W15. No release, merge or publication was made.

## Round 16, gate 5 (2026-10-25): protocol frozen before any gate-5 cell is run

Status. Gates 3 and 4 were not clear leads (rival analysis `docs/RIVAL-ANALYSIS-2026-10-25.md`). The owner chose the redesign (option b); it is committed as `47c9f08` (CLI decides UTC/`--tz` windows, impossible author dates placed by committer date and listed, reverts by anyone and lasting lines, `workproof people` and `figures --person` with evidence-labelled identity joins; `core-rules.md` 4,300 to about 2,500 characters; the Stop hook no longer blocks reserved example domains) and `7ec2aa3` (the session pointer no longer sends the model to re-read the rules file). **Product under test: `7ec2aa3`**, built from `git archive` (`npm ci --ignore-scripts`, `npm run build`, `bench/` removed) into `arms/ours19`. 708 tests, 23 mutation checks, Docker node 22 and 24 equal to the parent commit (3 environment failures in both). Four smoke runs on already-read gate-4 tasks (W10T5, W10T2, W11T3, W11T5; not gate material) ran 4 to 7 turns at 0.10 to 0.13 USD per cell and read no rules file.

Tasks. Three fresh Sonnet writers (W13, W14, W15) wrote 5 tasks each from one plain paragraph about a different job (a hiring manager checking a candidate's claims; a release manager writing release notes and thank-yous; a researcher crediting authors for a paper) and the common specification `bench/head-to-head/r16/WRITER-SPEC.md`, which names no tool and no rule of ours. None had seen the product, its documents or an earlier task. One first W14 writer stopped producing output after its repository clones and was abandoned unread; a second W14 writer, given the same paragraph and the same specification, wrote the set that is used. Each task has a deterministic fixture builder and a truth script; all 15 fixtures passed the script check (`r15/validate-w.sh`: two builds, equal HEAD, truth.py equals truth.txt). `r15/make-w-tasks.py` built the task and label files; the controller read no prompt, truth or criterion. The three sets are new to the product: nothing in the redesign was derived from them. Development material (do not count as evidence of a lead): W1 to W12, D, E, T11 to T16.

Arms and cells (identical to gate 4): OURS (`7ec2aa3`), BASE (empty plugin), RCP, RCP_I, CV, CV_I (same pins and patches as round 13), 15 tasks x 6 arms x 3 runs = 270 cells, model Sonnet through the subscription wrapper (`sub-shim`, fresh HOME per call), working folder `/private/tmp/wp-r16/gate5`, `guard.sh` around every run, `H2H_HOOK_EVENTS=1`, three cells in parallel. A cell that fails to run is run again with the same prompt (at most twice); a finished cell is never replaced.

Grading: five blind reason-first votes per packet (`r14/grade-r14.sh`, `r14/assemble-r14.py`, seed prefix `r16-gate5`), grader model Sonnet; a vote that cannot be parsed is asked again with the same prompt (attempt files are not votes). Scoring and checks: `r16/lead-check.py` (per criterion the majority of the usable votes; outcome criteria only; a packet needs at least three usable votes). The script reproduces gate 4's published totals and interval exactly from the stored votes (60.00 against 65.33, [-9.00, -2.33], cost ratio 1.78).

**Gate pass = both of:** (I1) the lower bound of the 95 percent bootstrap interval (10,000 resamples of the runs inside each task and arm, seed `r16-gate5`) of OURS total minus the best other arm's total over all 15 tasks is above zero; (V) every cell's working directory is under `/private/tmp` and no cell loaded an owner instruction file. Reported and not gating: totals per arm and per writer set, OURS against the best other arm per writer set, mean list-price cost per cell and the OURS/BASE ratio, OURS minus BASE, OURS minus the mean of the other five arms, OURS minus the mean of the plain-model arms (BASE, RCP, CV), and the tasks where OURS trails the best other arm by more than 0.34.

If the gate passes: a final on a sealed set from a further fresh writer, protocol frozen separately before its first cell. If it fails: the result is recorded as it is, diagnosis is limited to the cause, at most one more redesign iteration and one more gate on new writers follow, and then a Resume section. No condition is changed after the first cell.

## Round 16, gate 5 result (2026-10-25): OURS is behind; the gate fails

Run as frozen in `f430bd1`: 270 cells (15 tasks W13 to W15, 6 arms, 3 runs), 0 failed cells, all working folders under `/private/tmp`, five blind reason-first votes (two votes stayed unreadable after the script's one automatic re-ask, so W13T3, W13T4 and W15T3 count four usable votes). Data: `bench/head-to-head/results/round16-gate5/`.

Totals (outcome criteria, maximum 75): BASE 68.00, CV_I 66.67, CV 66.33, RCP 66.33, RCP_I 65.67, OURS 64.00. OURS minus the best other arm = -4.00; 95 percent bootstrap interval (seed `r16-gate5`) [-7.00, -2.00].

| Check | Result |
|---|---|
| (I1) interval lower bound above zero | FAIL (-7.00) |
| (V) isolation | PASS |
| GATE | FAIL |

Reported, not gating: per writer set OURS minus the best other arm W13 -1.33, W14 -2.33, W15 -1.67; mean cost per cell OURS 0.0889 USD, BASE 0.0776, ratio 1.15 (gate 4: 1.78; the cost target was met); OURS minus BASE -4.00, minus the mean of the other five arms -2.60, minus the mean of the plain-model arms -2.89. Tasks where OURS trails the best other arm by more than 0.34: W13T1 (1.00 against 4.00), W14T2 (3.00 against 5.00), W15T2 (2.33 behind), W14T3 (0.67). OURS leads or ties on the other eleven, so the loss is concentrated in four tasks. The gate-4 gap (-5.33) narrowed to -4.00, and the cost halved its excess.

Diagnosis (W13 to W15 are now read material; capabilities, not fixtures). Of the 32 failed OURS criteria, the causes were:

1. **One person split across addresses at two organisations** (W14T2 Zoe Park listed twice and the count 9 instead of 8; W15T2 Dan Petrov in two rows; W13T2 "refuses to merge the two identities"; part of W13T1). The redesigned `groupPeople` kept the same full name at unrelated organisations apart, a rule taken from one gate-4 task. In the seven independent writers' sets that touch the question (W9T1, W10T3, W12T3, W14T2, W15T2, W13T1, W13T2) six expect one person; only W11T5 expects a namesake kept apart. A prior over independent writers, not a fixture detail.
2. **Ownership counted for the wrong person** (W13T1, 12 failed run-criteria): `owner --claim` matched only the exact name, so the claimant's other addresses were not hers (9 percent, then "possibly 0 percent"), a mass quote reformat took over her lines (`git blame -w` ignores whitespace but not a quote change), and the squash commit that credits her as Co-authored-by was never mentioned.
3. **Own reading of reverts** (W14T3): the model listed a backed-out change that had been put back; `figures` already ignores a revert that was itself reverted, but the model read the log by hand.

Not changed: the pass rule, the arms or the tasks of gate 5. The per-run answers show no failure of the date, window or revert machinery of iteration 1 on these writers: UTC windows, the `--tz Europe/Berlin` semester split and the impossible-date listing were used correctly in W15T2.

### Iteration 2 (one more redesign, allowed by the gate-5 protocol)

General changes, each tested with mutation checks (no fixture, name or number from W13 to W15 appears in the code or the tests): the same full name on two addresses is joined as probable at any organisation, with a namesake caution and the proven-only count beside it; a first name shortened to an initial joins the one matching full name; any `users.noreply.*` login counts as a noreply login; `workproof owner` adds rows by person (bots left out, addresses joined as in `people`), detects formatting-only commits (added lines equal removed lines after whitespace, quote characters and trailing commas) and passes them to `git blame --ignore-rev`, and reports a claim-person row with direct surviving lines and the lines credited only by Co-authored-by. The next gate uses three further fresh writers (W16 to W18), protocol frozen before the first cell; if it passes, the final uses a sealed set from a fourth fresh writer (W19), already written and unread.

## Round 16, gate 6 (2026-10-25): protocol frozen before any gate-6 cell is run

Status. Gate 5 failed (above). Iteration 2 is committed as `58078d1` (same full name joins as probable at any organisation, initial-and-surname joins, `owner` by person with formatting-only commits skipped and Co-authored-by credit apart). **Product under test: `58078d1`**, built from `git archive` into `arms/ours20` as in gate 5 (`npm ci --ignore-scripts`, build, `bench/` removed). 712 tests, 28 mutation checks, Docker node 22 and 24: the same 3 environment failures as the parent of round 16 (Ruby formula and two Linux-only tests), no new failure.

Tasks. Three further fresh Sonnet writers (W16, W17, W18), each given one plain paragraph about a different job (an engineering manager's quarterly business review; a compliance and security auditor; a community and documentation lead's contributors page) and the common specification `bench/head-to-head/r16/WRITER-SPEC.md` (the paragraphs are appended there). None saw the product, its documents or any task. Each wrote 5 tasks with a deterministic fixture builder and a truth script; all 15 fixtures passed the script check (two builds, equal HEAD, truth.py equals truth.txt); the controller read no prompt, truth or criterion (only the writers' closing lines, which name the repositories and the hazards in a sentence each). They are new to the product; W1 to W15, D, E are development material. A fourth set (W19, a CTO's code-ownership questions) was written at the same time and is sealed: nobody has read it, it is used only if this gate passes.

Everything else is as in gate 5: arms OURS, BASE, RCP, RCP_I, CV, CV_I (same pins), 15 tasks x 6 arms x 3 runs = 270 cells, Sonnet through the subscription wrapper, working folder `/private/tmp/wp-r16/gate6`, `guard.sh`, `H2H_HOOK_EVENTS=1`, three cells in parallel, a failed cell is re-run (at most twice), five blind reason-first votes (`r14/grade-r14.sh`, seed prefix `r16-gate6`), scoring and checks by `r16/lead-check.py --seed r16-gate6`. **Gate pass = (I1) the lower bound of the 95 percent bootstrap interval (10,000 resamples, seed `r16-gate6`) of OURS minus the best other arm over all 15 tasks is above zero, and (V) isolation in every cell.** Reported, not gating: per-set totals, cost ratio, OURS minus BASE, minus the mean of the other arms, minus the plain-model arms, tasks trailing.

If the gate passes: the sealed final on W19 with its own protocol frozen before its first cell. If it fails: the result is recorded as it is, a Resume section is written and the programme stops (gate 5 and gate 6 are the allowed two iterations).

## Round 16, gate 6 result (2026-10-25): OURS is behind; the gate fails; the programme stops

Run as frozen in `be0f5e0`: 270 cells (15 tasks W16 to W18, 6 arms, 3 runs), 0 failed cells, all working folders under `/private/tmp`, five blind reason-first votes (one vote unreadable after the automatic re-ask; W17T5 counts four). Data: `bench/head-to-head/results/round16-gate6/`.

Totals (outcome criteria, maximum 75): CV_I 67.00, BASE 64.00, CV 63.67, OURS 63.00, RCP_I 63.00, RCP 62.33. OURS minus the best other arm (CV_I) = -4.00; 95 percent bootstrap interval (seed `r16-gate6`) [-7.33, -0.67]. (I1) FAIL; (V) PASS; GATE FAIL.

Reported, not gating: per writer set OURS minus the best other arm W16 -0.67, W17 -3.00, W18 -1.33; mean cost per cell OURS 0.0873 USD, BASE 0.0819, ratio 1.07; OURS minus BASE -1.00, minus the mean of the other five arms -1.00, minus the mean of the plain-model arms -0.33. Tasks trailing by more than 0.34: W16T3 (2.00), W17T1 (1.33), W18T2 (1.33), W16T5, W17T2, W17T3 (0.67 each).

Reading. Across gates 2 to 6 the totals against the best other arm were +2.67, +3.67 (-1.33 lower bound), -5.33, -4.00 and -4.00. Round 16 removed the cost excess (ratio 1.78 to 1.07) and brought OURS to the level of the plain model (-0.33 against the mean of BASE, RCP and CV), but not above it, and the best single other arm in a gate of five rivals sits above the plain-model mean in every gate (+2.0 to +4.0). The first-place claim for the Sonnet I1 criterion is not supported.

Diagnosis, limited to the cause (W16 to W18 are read material). Of 36 failed OURS criteria no single mechanism dominates, unlike gates 3 to 5: new-versus-returning classification when the same person's earlier work sits under another address (W16T3, W18T2: 9 criteria), review and approval trailers read as evidence (W17T1, W17T3: 12), a weak "limit stated" criterion where co-author handling or additivity is not explained (W16T5, W17T5: 5), classification percentages that depend on how docs are counted (W16T2), and a merge described as work (W18T1). Each is a separate general capability (first-contribution detection across joined addresses; a review-evidence row that names Approved-by and similar trailers; a standing limits line), none of them reached by the redesign.

Decision. By the rule frozen for gate 6 the sealed final on W19 is not started, and no condition was changed. The sealed set W19 stays unread (copy and combined hash `5b17425c9fa0` in `~/claude-kredi-runs/sealed/workproof-w19`); one disclosure: the writer's closing message, delivered to the controller automatically, named the repositories and one hazard line per task; the product was already frozen and nothing was changed after it, but the set is not blind in that narrow sense and should be treated as read for any later final. No release, merge or publication was made.

## Resume (written 2026-10-25, after gate 6)

State. Branch `plugin-leadership`, last product commit `58078d1` (iteration 2), last protocol commit `be0f5e0`, this result committed after it. Redesign of round 16 (UTC/`--tz` windows, impossible dates placed by committer date and listed, reverts by anyone, `workproof people`, `figures --person`, `owner` by person with formatting-only commits skipped, rules 4,300 to about 2,500 characters, no rules-file re-read, narrowed Stop-hook address block) is complete and tested (712 tests; Docker node 22 and 24 show only the 3 environment failures of the parent commit). Nothing is running. Gate numbers: gate 5 OURS 64.00 against BASE 68.00 ([-7.00, -2.00]); gate 6 OURS 63.00 against CV_I 67.00 ([-7.33, -0.67]); cost ratio 1.15 and 1.07 (gate 4: 1.78).

What the evidence supports. OURS no longer costs more than the plain model and wins on tasks with a hazard it names (silently wrong windows, impossible dates, revert by others, joined identities), but across fresh writers it ties the plain model and loses to the best of five rivals. Option (a) of the owner decision stands: publish the measured scope, not first place.

What would be next if the owner wants another attempt (not started): a gate needs a capability the writers keep asking for that tools do not yet provide: first-contribution and returning-contributor classification across joined addresses, review evidence from Approved-by and similar trailers in `reviews`, and a short "what this history cannot show" line in every answer; then a gate on three more fresh writers and the W19 final with a new fresh writer (W19 is no longer blind). Cost is no longer the obstacle.
