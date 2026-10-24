# Your job: write 5 benchmark tasks (folders t1 to t5)

Work only inside /private/tmp/wp-g4/w12. Do not read, list or search any other folder on this machine except the clones you make yourself, and do not look at any software project's documentation about how it measures git history. Use the network only to clone public GitHub repositories.

## The user's job (a plain description)

I teach a university software-engineering course. Student teams of three to five build a project in one repository over a term, and I must give each student an individual grade that is fair and that I can defend if a student appeals. I use the git history as one piece of evidence, knowing that history is not the whole story (pair work, planning, reviews, work done off the repository, students who commit under several names).

You decide which situations to cover. Pick 5 different realistic requests that a person doing this job would give to a coding assistant that has read access to a git repository and a shell. Use 5 different public repositories in different languages (small ones, so a clone is fast). Each request is an ordinary paragraph in the person's own words: it names no tool, no plugin, no skill, and does not list the traps.

## What a task is

A coding agent is started in an empty copy of a fixture (a git repository), given only `prompt.txt`, and works until it answers (in chat and/or in a file in the working directory). It does not see your files. A grader later reads the agent's answer and files against your `truth.txt` and `criteria.md`.

## Fixture

`tN/build-fixture.sh <dest>` builds the fixture deterministically (two builds must give the same HEAD sha): clone a public repository, pin a commit (record the full sha at the top as `REPO_URL=...; PIN=...`), drop remotes, tags and other branches, then add synthetic commits with fixed author names, e-mail addresses (use example.com / example.org / example.invalid style domains), author and committer dates (fixed, include a few non-UTC offsets), and messages. Use `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C`. Put real traps in the history that a careful human expert would handle and a hurried assistant would get wrong: you choose them from your knowledge of how real git histories mislead (people under several names or addresses, bots, generated or vendored files, mechanical reformats, merges, reverts, renames, squash merges, dates outside the asked window, time zones, trailers, co-authors, committer versus author, and similar). Each task needs at least 3 traps and at least 2 that a plausible first-pass answer would get wrong.

## Truth

`tN/truth.py <fixture>` prints the ground truth computed from the fixture with plain git commands and fixed conventions (state each convention in a comment: why it is the right one for this request). Save its output as `tN/truth.txt`. Do not guess: compute.

## Criteria

`tN/criteria.md`: the first line is a title; the second line starts with `Hazards:` and lists the traps; then exactly 5 numbered criteria (`1.` to `5.`). Each criterion is an outcome the person who asked would care about, checkable from the delivered answer and files against truth.txt, with tolerances where a correct method may differ slightly, and an explicit FAIL condition. Do not write criteria that reward a particular tool, a particular file layout, or a particular wording. Do not write criteria about process.

## Prompt

`tN/prompt.txt`: 200 to 600 characters, one paragraph, plain English, natural. May ask for a file by name (for example a markdown file) or for a chat answer.

## Validation (required)

Run build-fixture.sh twice and compare HEAD; run truth.py and compare with truth.txt. Fix problems. Do not print or summarise your prompts, truths or criteria in your final message.

## Final message

Print only the single line `DONE` and the list of task folders.
