import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { answerReason, computeAll, windowFromPrompt, ANSWER_PREFIX } from "../src/answercheck.js";
import type { FiguresFn } from "../src/answercheck.js";
import { parseTurn, stopCheckAsync, stopCheck } from "../src/stopcheck.js";

const AUTHOR = "grace.hopper@example.org";
const ENV = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
const DEFAULT_DATES = ["2024-03-05", "2024-04-10", "2024-06-01"];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A repository whose commits are by AUTHOR on the given dates (author and committer). Default: three commits. */
function repo(dates: string[] = DEFAULT_DATES): string {
  const dir = mkdtempSync(join(tmpdir(), "workproof-answer-repo-"));
  execFileSync("git", ["init", "-q"], { cwd: dir, env: ENV });
  execFileSync("git", ["config", "user.email", AUTHOR], { cwd: dir, env: ENV });
  execFileSync("git", ["config", "user.name", "Grace"], { cwd: dir, env: ENV });
  dates.forEach((d, i) => {
    writeFileSync(join(dir, `f${i}.txt`), `${i}\n`);
    execFileSync("git", ["add", "."], { cwd: dir, env: ENV });
    execFileSync("git", ["commit", "-q", "-m", `change ${i}`], {
      cwd: dir,
      env: { ...ENV, GIT_AUTHOR_DATE: `${d}T10:00:00+00:00`, GIT_COMMITTER_DATE: `${d}T10:00:00+00:00` },
    });
  });
  return dir;
}

type Line = Record<string, unknown>;
const user = (text: string): Line => ({ type: "user", message: { role: "user", content: text } });
const say = (text: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text }] } });
const tool = (id: string, command: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name: "Bash", input: { command } }] } });
const write = (id: string, file_path: string, content: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name: "Write", input: { file_path, content } }] } });
const result = (id: string, content: string): Line => ({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: id, content }] } });

const turnOf = (lines: Line[]) => parseTurn(lines.map((l) => JSON.stringify(l)).join("\n"));

/** The stdin JSON of the hook for a transcript written to a temporary file. */
function hookInput(lines: Line[], cwd: string, extra: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "workproof-answer-t-"));
  const transcript = join(dir, "t.jsonl");
  writeFileSync(transcript, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  return JSON.stringify({ session_id: "s", transcript_path: transcript, cwd, ...extra });
}

const COMMIT_PROMPT = "How many commits did I make?";

test("a near-miss commit count is flagged with the computed figure and its label", async () => {
  const cwd = repo();
  const reason = await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits in that repository.")]), cwd);
  assert.ok(reason, "expected a block");
  assert.ok(reason.startsWith(ANSWER_PREFIX));
  assert.match(reason, /The answer says "I made 4 commits in that repository\." \(final answer\)/);
  assert.match(reason, /prints 3 for "authored non-merge commits"/);
  assert.match(reason, /Run `npx workproof figures --author <the person>/);
});

test("the correct commit count is not flagged", async () => {
  const cwd = repo();
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 3 commits.")]), cwd), null);
});

test("the band below ten: one away is flagged, two away is not", async () => {
  const cwd = repo();
  assert.ok(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd));
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 5 commits.")]), cwd), null);
});

test("the band from ten up: a figure of 12 allows one away and not two", async () => {
  const dates = Array.from({ length: 12 }, (_, i) => `2024-01-${String(i + 1).padStart(2, "0")}`);
  const cwd = repo(dates);
  assert.ok(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 13 commits.")]), cwd));
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 14 commits.")]), cwd), null);
});

test("a number that a tool output showed is not flagged", async () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), tool("t1", "git log --oneline"), result("t1", "4 commits found"), say("I made 4 commits.")];
  assert.equal(await answerReason(turnOf(lines), cwd), null);
});

test("a number equal to the line count of one tool output is not flagged", async () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), tool("t1", "git log --oneline"), result("t1", "a\nb\nc\nd\n"), say("I made 4 commits.")];
  assert.equal(await answerReason(turnOf(lines), cwd), null);
});

test("a number that appears only in an earlier tool output of the transcript is not flagged", async () => {
  const cwd = repo();
  const earlier = [user("list the files"), tool("t0", "ls"), result("t0", "found 4 items"), say("Listed.")];
  const lines = [...earlier, user(COMMIT_PROMPT), say("I made 4 commits.")];
  assert.equal(await answerReason(turnOf(lines), cwd), null);
});

test("a thousands group reads as one number in the sourced text", async () => {
  const cwd = repo();
  const sourced = [user(COMMIT_PROMPT), tool("t1", "cat"), result("t1", "rows 3,4,5 and 1,234"), say("I made 4 commits.")];
  assert.equal(await answerReason(turnOf(sourced), cwd), null, "3,4,5 holds the 4");
});

test("a far-off number is not flagged", async () => {
  const cwd = repo();
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 40 commits.")]), cwd), null);
});

test("a Write-tool file with the wrong number is flagged and names the file", async () => {
  const cwd = repo();
  const lines = [
    user("Write a summary of my commits."),
    write("w1", "/work/summary-notes.md", "I made 4 commits in total."),
    result("w1", "File created successfully"),
    say("Done. The summary is written."),
  ];
  const reason = await answerReason(turnOf(lines), cwd);
  assert.ok(reason, "expected a block");
  assert.match(reason, /\(summary-notes\.md\)/);
  assert.match(reason, /prints 3 for "authored non-merge commits"/);
  assert.ok(!reason.includes("/work/"), "the path is not printed, only the file name");
});

test("a first date one day off is flagged and the exact date is not", async () => {
  const cwd = repo();
  const off = await answerReason(turnOf([user("When did I make my first commit?"), say("My first commit was on 2024-03-04.")]), cwd);
  assert.ok(off, "expected a block");
  assert.match(off, /prints "2024-03-05" for "first authored commit date"/);
  const exact = await answerReason(turnOf([user("When did I make my first commit?"), say("My first commit was on 2024-03-05.")]), cwd);
  assert.equal(exact, null);
});

test("a last date one day off is flagged against the last date only", async () => {
  const cwd = repo();
  const off = await answerReason(turnOf([user("When was my latest commit?"), say("My last commit was on 2024-06-02.")]), cwd);
  assert.match(off ?? "", /prints "2024-06-01" for "last authored commit date"/);
  const exact = await answerReason(turnOf([user("When was my latest commit?"), say("My last commit was on 2024-06-01.")]), cwd);
  assert.equal(exact, null);
});

test("a date after a phrase other than first, last, earliest, latest or most recent commit is not a claim", async () => {
  const cwd = repo();
  const prompt = "When did I make my first commit?";
  for (const s of ["the last release (2024-03-04)", "Last updated 2024-03-04.", "First released 2024-03-04 on npm.", "The first commit was on 2024-03-04"]) {
    const reason = await answerReason(turnOf([user(prompt), say(s)]), cwd);
    if (s.startsWith("The first commit")) assert.ok(reason, "a real claim is still checked");
    else assert.equal(reason, null, s);
  }
});

test("the claim context and the noun rules: these sentences are not counts of the author's commits", async () => {
  const cwd = repo();
  const sentences = [
    "This PR squashes 4 commits into one.",
    "I made 4 commits, squashed into one.",
    "Rebased, I have 4 commits now.",
    "The last 4 commits touch auth.",
    "I reviewed the last 4 commits.",
    "The team has 4 authors on the paper.",
    "I touched 4 lines.",
    "The change touches 4 lines.",
    "The repository holds 4 commits.",
    "Commits: 4 on the main branch.",
    "Revert of 4 commits went in.",
  ];
  for (const s of sentences) assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say(s)]), cwd), null, s);
  assert.ok(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd), "the control claim blocks");
});

test("the prompt trigger is narrow: a prompt without a commit, contribution or related word does not trigger", async () => {
  const cwd = repo();
  assert.equal(await answerReason(turnOf([user("Tell me about the weather."), say("I made 4 commits.")]), cwd), null);
  assert.ok(await answerReason(turnOf([user("Tell me about the weather."), tool("t1", "npx workproof figures"), result("t1", "ok"), say("I made 4 commits.")]), cwd), "a workproof run in the turn triggers");
});

test("windowFromPrompt: each stated form", () => {
  const cases: [string, { since: string; until: string } | null][] = [
    ["Between 2024-01-15 and 2024-06-30", { since: "2024-01-15", until: "2024-06-30" }],
    ["from 2024-06-30 back to 2024-01-15", { since: "2024-01-15", until: "2024-06-30" }],
    ["from 3 March 2024 to 12 January 2024", { since: "2024-01-12", until: "2024-03-03" }],
    ["from March 3, 2024 until May 9, 2024", { since: "2024-03-03", until: "2024-05-09" }],
    ["in Q2 2024", { since: "2024-04-01", until: "2024-06-30" }],
    ["Q4 2023 only", { since: "2023-10-01", until: "2023-12-31" }],
    ["H2 2023", { since: "2023-07-01", until: "2023-12-31" }],
    ["H1 2023", { since: "2023-01-01", until: "2023-06-30" }],
    ["the first half of 2025", { since: "2025-01-01", until: "2025-06-30" }],
    ["the second half of 2025", { since: "2025-07-01", until: "2025-12-31" }],
    ["from January to March 2024", { since: "2024-01-01", until: "2024-03-31" }],
    ["February to February 2023", { since: "2023-02-01", until: "2023-02-28" }],
    ["October 2025 to March 2026", { since: "2025-10-01", until: "2026-03-31" }],
    ["Q1 2026 to Q3 2026", { since: "2026-01-01", until: "2026-09-30" }],
    ["in 2022", { since: "2022-01-01", until: "2022-12-31" }],
    ["during 2021 I worked", { since: "2021-01-01", until: "2021-12-31" }],
    ["my record for 2020", { since: "2020-01-01", until: "2020-12-31" }],
    ["Q2 2024 during 2025", { since: "2024-04-01", until: "2024-06-30" }],
    ["no dates here", null],
    ["from 2024-01-01 onwards", null],
    ["compare 2024 and 2025", null],
    ["Q1 2026 and H2 2025", null],
    ["2024-01-01 to 2024-02-01 and 2025-03-01 to 2025-04-01", null],
    ["2024-01-01, 2024-02-01 and 2024-03-01", null],
  ];
  for (const [prompt, expected] of cases) assert.deepEqual(windowFromPrompt(prompt), expected, prompt);
});

test("the stated window is the one the count is compared with: a count right in the window passes, a near miss in it is flagged", async () => {
  // Six commits: three in H1 2024 (January, March, April) and three in H2 2024.
  const cwd = repo(["2024-01-15", "2024-03-05", "2024-04-10", "2024-07-01", "2024-08-01", "2024-10-01"]);
  const prompt = "How many commits did I make in H1 2024?";
  const flagged = await answerReason(turnOf([user(prompt), say("I made 4 commits in H1 2024.")]), cwd);
  assert.ok(flagged, "4 is one away from the window figure 3");
  assert.match(flagged, /prints 3 for "authored non-merge commits" \(identities <identity>; author date 2024-01-01 to 2024-06-30/);
  assert.equal(await answerReason(turnOf([user(prompt), say("I made 3 commits in H1 2024.")]), cwd), null, "right in the window, wrong overall");
  assert.equal(await answerReason(turnOf([user(prompt), say("I made 6 commits in H1 2024.")]), cwd), null, "right overall, wrong in the window");
});

test("the reasons for counts and dates carry no email address, and identities are shown redacted", async () => {
  const cwd = repo();
  const count = await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd);
  const date = await answerReason(turnOf([user("When did I make my first commit?"), say("My first commit was on 2024-03-04.")]), cwd);
  for (const reason of [count, date]) {
    assert.ok(reason, "expected a block");
    assert.ok(!EMAIL.test(reason), "an address is in the reason");
    assert.ok(!reason.includes(AUTHOR));
    assert.ok(reason.includes("<identity>"), "the identity filter is shown with the address redacted");
  }
  const out = await stopCheckAsync(hookInput([user(COMMIT_PROMPT), say("I made 4 commits.")], cwd));
  assert.ok(!EMAIL.test(out));
});

test("a non-git directory is silent", async () => {
  const plain = mkdtempSync(join(tmpdir(), "workproof-answer-plain-"));
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), plain), null);
});

test("a repository above the commit threshold is silent, and the same turn blocks below it", async () => {
  const cwd = repo();
  const turn = turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]);
  assert.ok(await answerReason(turn, cwd), "control: blocks under the default threshold");
  assert.equal(await answerReason(turn, cwd, { maxCommits: 2 }), null);
});

test("stop_hook_active allows, and the same transcript blocks without it", async () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), say("I made 4 commits.")];
  assert.match(await stopCheckAsync(hookInput(lines, cwd)), /"decision":"block"/);
  assert.equal(await stopCheckAsync(hookInput(lines, cwd, { stop_hook_active: true })), "");
});

/** A figures seam that records each start and takes `ms` to answer. */
function slowFigures(starts: number[], ms: number): FiguresFn {
  return async (opts) => {
    starts.push(Date.now());
    await sleep(ms);
    return { repo: opts.repo, window: "", rows: [{ label: "authored non-merge commits", value: 3, filter: "seam", computed: true }], candidates: [] };
  };
}

test("computeAll starts no computation after the deadline and returns null (incomplete)", async () => {
  const starts: number[] = [];
  const identities = ["a@example.org", "b@example.org", "c@example.org"];
  const windows = [null, { since: "2024-01-01", until: "2024-06-30" }];
  assert.equal(await computeAll("/nonexistent", identities, windows, Date.now() - 1, slowFigures(starts, 0)), null);
  assert.equal(starts.length, 0, "a passed deadline starts nothing");
  const late: number[] = [];
  const result = await computeAll("/nonexistent", identities, windows, Date.now() + 20, slowFigures(late, 60));
  assert.equal(result, null);
  assert.equal(late.length, 1, "the first computation starts; the next is refused once the deadline has passed");
});

test("a slow figures run stops the check: nothing starts after answerReason returns", async () => {
  const cwd = repo();
  const starts: number[] = [];
  const reason = await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd, { budgetMs: 150, figures: slowFigures(starts, 400) });
  assert.equal(reason, null, "the budget expired, so the check allows");
  const atReturn = starts.length;
  assert.ok(atReturn <= 1, "at most the first computation started before the deadline");
  await sleep(600);
  assert.equal(starts.length, atReturn, "no computation started after the deadline");
});

test("the synchronous stopCheck stays synchronous and allows the same turn", () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), say("I made 4 commits.")];
  assert.equal(stopCheck(hookInput(lines, cwd)), "");
  assert.ok(parseTurn(lines.map((l) => JSON.stringify(l)).join("\n")).writes !== undefined);
});
