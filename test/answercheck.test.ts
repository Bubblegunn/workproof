import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { answerReason, windowFromPrompt, ANSWER_PREFIX } from "../src/answercheck.js";
import { parseTurn, stopCheckAsync, stopCheck } from "../src/stopcheck.js";

const AUTHOR = "grace.hopper@example.org";
const ENV = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

/** A repository whose commits are by AUTHOR on the given dates (author and committer). Default: three commits. */
function repo(dates: string[] = ["2024-03-05", "2024-04-10", "2024-06-01"]): string {
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

/** A transcript file for the hook path, returned as the stdin JSON. */
function hookInput(lines: Line[], cwd: string, extra: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "workproof-answer-t-"));
  const transcript = join(dir, "t.jsonl");
  writeFileSync(transcript, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  return JSON.stringify({ session_id: "s", transcript_path: transcript, cwd, ...extra });
}

const COMMIT_PROMPT = "How many commits did I make?";
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/;

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

test("the near-miss band: one and two away are flagged, three away is not", async () => {
  const cwd = repo();
  assert.ok(await answerReason(turnOf([user(COMMIT_PROMPT), say("About 5 commits.")]), cwd));
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("About 6 commits.")]), cwd), null);
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

test("a far-off number is not flagged", async () => {
  const cwd = repo();
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 40 commits.")]), cwd), null);
});

test("a Write-tool file with the wrong number is flagged and names the file", async () => {
  const cwd = repo();
  const lines = [
    user("Write my evidence summary"),
    write("w1", "/work/summary-notes.md", "Authored commits: 4 commits in total."),
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
    ["in 2022", { since: "2022-01-01", until: "2022-12-31" }],
    ["during 2021 I worked", { since: "2021-01-01", until: "2021-12-31" }],
    ["my record for 2020", { since: "2020-01-01", until: "2020-12-31" }],
    ["no dates here", null],
    ["from 2024-01-01 onwards", null],
    ["compare 2024 and 2025", null],
  ];
  for (const [prompt, expected] of cases) assert.deepEqual(windowFromPrompt(prompt), expected, prompt);
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

test("no email address appears in any reason", async () => {
  const cwd = repo();
  const reason = await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd);
  assert.ok(reason);
  assert.ok(!EMAIL.test(reason), "an address is in the reason");
  assert.ok(!reason.includes(AUTHOR));
  assert.ok(reason.includes("<identity>"), "the identity filter is shown with the address redacted");
  const out = await stopCheckAsync(hookInput([user(COMMIT_PROMPT), say("I made 4 commits.")], cwd));
  assert.ok(!EMAIL.test(out));
});

test("a budget of 1 ms allows silently", async () => {
  const cwd = repo();
  assert.equal(await answerReason(turnOf([user(COMMIT_PROMPT), say("I made 4 commits.")]), cwd, { budgetMs: 1 }), null);
});

test("the synchronous stopCheck stays synchronous and allows the same turn", () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), say("I made 4 commits.")];
  assert.equal(stopCheck(hookInput(lines, cwd)), "");
  assert.ok(parseTurn(lines.map((l) => JSON.stringify(l)).join("\n")).writes !== undefined);
});
