# Your job: write 5 benchmark tasks (t1 to t5) for a coding assistant

You work only inside your own folder (named in your instructions). Do not read, list or search any other folder on this machine except
/tmp or /private/tmp scratch folders you create inside your own folder. Use the network only to clone public git repositories.
If you need a fact, say in README.md that it is from memory.

## What a task is

A person asks a coding assistant (given only the prompt text, working inside a git repository, no other context) to do a job that
depends on reading the repository's git history. The assistant answers in chat or writes a file. You do not know what tools the assistant has.
You decide which situations to cover: pick 5 different realistic situations that someone doing the job described in your instructions
would bring to an assistant. Make each repository history contain realistic traps (people with several names or e-mail addresses, bots,
merge commits, reverts, time-zone edge cases, wrong clocks, rebased or amended commits, vendored or generated files, reformat commits,
squash merges with co-author trailers, renames, and so on): choose the traps that fit the job and the question, and make the right
answer depend on the purpose the person states. Different tasks should need different conventions. Do not make every task about the same trap.

## Files per task (folder t1 ... t5 in your folder)

- `prompt.txt`: what the person types. 150 to 900 characters, plain English, a real request. Name no tool, plugin or skill and give
  no rules. The person may state a purpose, a reporting time zone, a window or an audience. The answer is a file or a chat reply, as the prompt says.
- `build-fixture.sh <dest>`: deterministic script that clones a public repository, pins a commit, removes remotes, tags and other
  branches, and adds synthetic commits with fixed names, e-mail addresses (example or invalid domains) and fixed dates, leaving a clean branch
  `main`. Two builds must give the same HEAD sha. Use this header exactly (copy it) and then your own commits:

```
#!/usr/bin/env bash
REPO_URL=<url>; PIN=<full sha>
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <dest-dir>" >&2; exit 2; }
DEST="$1"; case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
export TZ=UTC LC_ALL=C
rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
git clone -q "$REPO_URL" "$DEST"
G() { git -C "$DEST" "$@"; }
G checkout -q -B fixture "$PIN"
for b in $(G for-each-ref --format='%(refname:short)' refs/heads); do [ "$b" = fixture ] || G branch -q -D "$b"; done
for r in $(G remote); do G remote remove "$r"; done
for t in $(G tag -l); do G tag -d "$t" >/dev/null; done
# c <author-name> <author-email> <author-date> <message> [committer-name committer-email committer-date]
c() {
  G add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q --allow-empty -m "$4"
}
finish() {
  G branch -q -m fixture main
  G reflog expire --expire=now --all
  G gc -q --prune=now
  echo "HEAD $(G rev-parse HEAD)"
}
w() { mkdir -p "$(dirname "$DEST/$1")"; cat > "$DEST/$1"; }
```
  Use small public repositories (different languages across your 5 tasks). Fixture dates should be in 2025 and 2026 (the assistant's "today"
  is 2026-10-24). Keep the repository small enough that the clone and the build take under a minute.
- `truth.py <fixture-dir>`: prints the ground truth computed from the built repository with plain git (python3 standard library only),
  and the conventions it used, with a comment saying why each convention is the right one for the purpose in the prompt.
  Save its output as `truth.txt`.
- `criteria.md`: first line `tN: <short title>`; second line `Hazards: ...` (one line); then exactly 5 numbered criteria
  `1.` to `5.`. Each criterion is something a reader of the answer can verify against truth.txt and says what makes it FAIL. Every
  criterion is an outcome (what the reader of the answer receives or is protected from), not a method. A correct answer that chose a
  different but defensible convention, stated clearly, must pass: say so in the criterion where it matters.

## Validation (required)

For each task build the fixture twice (two different destination folders), check the HEAD sha is equal, run truth.py on both, check
the output equals truth.txt. Fix your scripts until all 5 pass. Do not guess how any tool would do on the tasks. The tasks are not tuned
against any tool.

## Output

Put a short README.md in your folder (one paragraph per task: repository, pin, hazards, conventions). When done, print one line:
`DONE` followed by the five repository names.

## The three job paragraphs given to the gate-5 writers (one each)

- W13: "I am a hiring manager at a small company. Candidates send me a CV that says things like 'led the migration', 'author of the caching layer', 'top contributor to X', and a link to a public repository. I want an assistant to check what the repository history actually shows about that person, fairly, without punishing them for things that are not their fault (a changed e-mail address, a squash merge, work that was reviewed but landed under a maintainer's name) and without believing claims the history does not support."
- W14: "I am the release manager of an open-source library. Before each release I write the release notes and a thank-you section from the git history: what changed for users since the last release, who should be thanked, what was reverted or backed out before release and so must not be announced, and how many people and commits were involved. Contributors use several e-mail addresses, some changes arrive through squash merges or cherry-picks, and some commits have wrong dates."
- W15: "I am a researcher writing the 'software contributions' and 'authorship' section of a paper and a data-management report for a research funder. The code of our project lives in a git repository used by a lab of students, postdocs and external collaborators over several years. I need an assistant to tell me, from the history, who did how much of what and when, so that I can credit people correctly (authors versus acknowledgements), report effort per semester, and answer reviewers who ask who wrote the core method."

Each writer was an independent Sonnet subagent that read only this specification and its own paragraph; none had seen the product, its documents or any earlier task.

## The three job paragraphs given to the gate-6 writers (one each; written 2026-10-25)

- W16: "I am an engineering manager. Every quarter I prepare a business review for executives who do not read code: what each team and person delivered, how much was new feature work versus fixes versus maintenance, who joined or left the project, and how the effort compares with the previous quarter. People use several e-mail addresses, some work arrives through merges and squashes, bots commit constantly, and a few commits carry wrong dates."
- W17: "I am a compliance and security auditor. For an audit I need evidence from the repository history of who changed what and when, whether every change to the sensitive parts was reviewed by someone other than its author, whether anything was changed outside normal working windows or by unexpected accounts, and whether any change was quietly backed out. I need numbers and named commits I can put in an audit workpaper, and I must not overstate what the history can prove."
- W18: "I run community and documentation for an open-source project. I want a contributors page and a welcome message that are fair: who contributed in the last year (code, docs, tests), who is new this year versus returning, who deserves a first-contribution shout-out, and a short line per person about what they did. People contribute under different names and addresses, some contributions are co-authored or squashed, and I do not want to thank bots or leave out people whose work landed under someone else's name."
