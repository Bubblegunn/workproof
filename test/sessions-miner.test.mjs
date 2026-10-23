import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
// The miner runs only through the CLI: `workproof sessions` spawns the built copy.
const cli = path.join(root, "dist/src/cli.js");
// Source (for the text checks) and built copy (what the package ships).
const script = path.join(root, "src/sessions/mine-sessions.mjs");
const builtScript = path.join(root, "dist/src/sessions/mine-sessions.mjs");
const licenseSrc = path.join(root, "src/sessions/LICENSE-APACHE-2.0");
const licenseBuilt = path.join(root, "dist/src/sessions/LICENSE-APACHE-2.0");
// Invented identities and markers. None of them may appear in the output.
const HOME_NAME = "invented-home-Quillon";
const GIT_NAME = "Ilmenite Testperson";
const GIT_EMAIL = "ilmenite@example.com";
const PROMPT_MARKER = "ZZ-PROMPT-MARKER";
const SESSION_IDS = ["sess-ledger-1", "sess-ledger-2", "sess-ember-3", "sess-plain-4", "sess-plain-6", "sess-research-1"];

// Fixture root. os.tmpdir() on macOS is /var/folders/.../T, which the miner's own
// agent-machinery rule treats as scratch space and would silently exclude, so the
// fixture lives under /tmp, resolved through realpath.
const tmpRoot = fs.realpathSync("/tmp");
const work = fs.mkdtempSync(path.join(tmpRoot, "workproof-miner-"));
const home = path.join(work, HOME_NAME);
const ledgerDir = path.join(home, "code", "ledger-api");
const emberDir = path.join(home, "code", "ember-web");
const plainA = path.join(home, "scratch-notes");
const plainB = path.join(home, "archive", "tax-2026");

// --- fixture -----------------------------------------------------------------

const git = (cwd, ...args) =>
  execFileSync("git", ["-C", cwd, "-c", "commit.gpgsign=false", ...args], { stdio: ["ignore", "pipe", "pipe"] });

function makeRepo(dir, file) {
  fs.mkdirSync(path.join(dir, path.dirname(file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), "x\n".repeat(20));
  git(dir, "init", "-q", "-b", "main");
  git(dir, "config", "user.name", GIT_NAME);
  git(dir, "config", "user.email", GIT_EMAIL);
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "initial");
}

// Local noon, N calendar days back, so each session lands on its own local date.
function at(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

// One session transcript in the layout Claude Code writes: a user prompt, then one
// assistant entry per tool call, each with its own requestId and uuid.
function transcript(sessionId, cwd, daysBack, prompt, tools) {
  const ts = at(daysBack);
  const rows = [
    {
      type: "user",
      sessionId,
      uuid: `${sessionId}-user`,
      promptId: `${sessionId}-prompt`,
      timestamp: ts,
      cwd,
      message: { content: prompt },
    },
  ];
  tools.forEach((block, i) =>
    rows.push({
      type: "assistant",
      sessionId,
      uuid: `${sessionId}-a${i}`,
      requestId: `${sessionId}-req${i}`,
      timestamp: ts,
      cwd,
      message: {
        usage: { input_tokens: 500, output_tokens: 200, cache_read_input_tokens: 1000 },
        content: [block],
      },
    })
  );
  return rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
}

const tool = (name, input) => ({ type: "tool_use", id: `tool-${name}-${Math.random().toString(36).slice(2)}`, name, input });

function writeSession(sessionId, cwd, daysBack, prompt, tools) {
  const dir = path.join(home, ".claude", "projects", "invented-project");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${sessionId}.jsonl`), transcript(sessionId, cwd, daysBack, prompt, tools));
}

function buildFixture() {
  makeRepo(ledgerDir, "src/invoice.ts");
  makeRepo(emberDir, "src/page.tsx");
  fs.mkdirSync(plainA, { recursive: true });
  fs.mkdirSync(plainB, { recursive: true });

  // Two sessions in ledger-api, one in ember-web.
  writeSession("sess-ledger-1", ledgerDir, 2, `${PROMPT_MARKER} fix the invoice totals`, [
    tool("Edit", { file_path: path.join(ledgerDir, "src/invoice.ts"), old_string: "a\n", new_string: "b\nc\n" }),
    tool("Bash", { command: "npm test" }),
  ]);
  writeSession("sess-ledger-2", ledgerDir, 5, `${PROMPT_MARKER} second pass`, [
    tool("Read", { file_path: path.join(ledgerDir, "src/invoice.ts") }),
    tool("Write", { file_path: path.join(ledgerDir, "src/ledger.ts"), content: "z\n".repeat(10) }),
  ]);
  writeSession("sess-ember-3", emberDir, 3, `${PROMPT_MARKER} new page`, [
    tool("Write", { file_path: path.join(emberDir, "src/page.tsx"), content: "p\n".repeat(30) }),
  ]);

  // Two plain directories outside any repository.
  writeSession("sess-plain-4", plainA, 4, `${PROMPT_MARKER} draft the plan`, [
    tool("Write", { file_path: path.join(plainA, "plan.md"), content: "n\n".repeat(15) }),
  ]);
  writeSession("sess-plain-6", plainB, 6, `${PROMPT_MARKER} summarise the tax letters`, [
    tool("Write", { file_path: path.join(plainB, "summary.md"), content: "s\n".repeat(12) }),
  ]);

  // Research only: no file edits, run from the home directory, which is not a repository.
  writeSession("sess-research-1", home, 1, `${PROMPT_MARKER} what changed in the pricing API`, [
    tool("WebFetch", { url: "https://example.com/docs" }),
  ]);
}

// Build once for the whole file.
let report;
let rawStdout;
const sessionCount = 6;
const activeDayCount = 6;

before(() => {
  fs.mkdirSync(home, { recursive: true });
  buildFixture();
  const run = spawnSync(process.execPath, [cli, "sessions", "--days", "30"], {
    cwd: ledgerDir,
    env: { ...process.env, WORKPROOF_HOME: home },
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `miner exited ${run.status}: ${run.stderr}`);
  rawStdout = run.stdout;
  report = JSON.parse(rawStdout);
});

after(() => {
  fs.rmSync(work, { recursive: true, force: true });
});

// --- helpers -----------------------------------------------------------------

function keysNamed(value, name, found = []) {
  if (Array.isArray(value)) value.forEach((v) => keysNamed(v, name, found));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === name) found.push(k);
      keysNamed(v, name, found);
    }
  }
  return found;
}

// --- tests -------------------------------------------------------------------

test("totals match the fixture: six sessions over six active days", () => {
  assert.equal(report.totals.sessions, sessionCount);
  assert.equal(report.totals.activeDays, activeDayCount);
});

test("byRepo has the research bucket, the numbered outside-repository labels and the repository basenames", () => {
  const names = Object.keys(report.byRepo);
  assert.ok(names.includes("Research & investigation (no project)"), `keys: ${names}`);
  assert.ok(names.includes("(directory outside a repository)"), `keys: ${names}`);
  assert.ok(names.includes("(directory outside a repository 2)"), `keys: ${names}`);
  assert.ok(names.includes("ledger-api"), `keys: ${names}`);
  assert.ok(names.includes("ember-web"), `keys: ${names}`);
  assert.equal(report.byRepo["ledger-api"].sessions, 2);
  assert.equal(report.byRepo["ember-web"].sessions, 1);
});

test("the JSON holds no file or directory path, no home directory name and no user name", () => {
  assert.ok(!rawStdout.includes(tmpRoot), "the temp root path leaked into the output");
  assert.ok(!rawStdout.includes(work), "the fixture path leaked into the output");
  assert.ok(!rawStdout.includes("/Users/"), "a /Users/ path leaked into the output");
  assert.ok(!rawStdout.includes(HOME_NAME), "the home directory name leaked into the output");
  assert.ok(!rawStdout.includes(GIT_NAME), "the git user name leaked into the output");
  assert.ok(!rawStdout.includes("Ilmenite"), "part of the git user name leaked into the output");
  for (const key of Object.keys(report.byRepo)) {
    assert.ok(!key.includes("/") && !key.includes("~"), `a project key looks like a path: ${key}`);
  }
});

test("the JSON holds no prompt text and no session id", () => {
  assert.ok(!rawStdout.includes(PROMPT_MARKER), "prompt text leaked into the output");
  for (const id of SESSION_IDS) assert.ok(!rawStdout.includes(id), `session id ${id} leaked into the output`);
});

test("no key named userName appears anywhere in the JSON", () => {
  assert.deepEqual(keysNamed(report, "userName"), []);
});

test("a hostile project directory name comes out with no control characters and within the 64 character cap", () => {
  const hostileWork = fs.mkdtempSync(path.join(tmpRoot, "workproof-hostile-"));
  try {
    const hostileHome = path.join(hostileWork, HOME_NAME);
    // Bell, ESC, newline, tab and DEL, followed by a 100 character run.
    const hostileName = "bad\u0007name\u001b[31m\nsplit\tline\u007fend-" + "n".repeat(100);
    const hostileRepo = path.join(hostileHome, "code", hostileName);
    makeRepo(hostileRepo, "src/main.ts");
    const projects = path.join(hostileHome, ".claude", "projects", "invented-project");
    fs.mkdirSync(projects, { recursive: true });
    fs.writeFileSync(
      path.join(projects, "sess-hostile-7.jsonl"),
      transcript("sess-hostile-7", hostileRepo, 2, `${PROMPT_MARKER} hostile name`, [
        tool("Write", { file_path: path.join(hostileRepo, "src/main.ts"), content: "h\n".repeat(9) }),
      ]),
    );
    const run = spawnSync(process.execPath, [cli, "sessions", "--days", "30"], {
      cwd: hostileRepo,
      env: { ...process.env, WORKPROOF_HOME: hostileHome },
      encoding: "utf8",
    });
    assert.equal(run.status, 0, `miner exited ${run.status}: ${run.stderr}`);
    const hostileReport = JSON.parse(run.stdout);
    const keys = Object.keys(hostileReport.byRepo);
    assert.equal(keys.length, 1, `keys: ${JSON.stringify(keys)}`);
    const [key] = keys;
    assert.ok(key.startsWith("bad"), `unexpected key: ${JSON.stringify(key)}`);
    assert.doesNotMatch(key, /[\u0000-\u001f\u007f-\u009f]/, "a control character survived");
    assert.ok(key.length <= 64, `key is ${key.length} characters`);
    assert.ok(!run.stdout.includes(hostileWork), "the fixture path leaked into the output");
  } finally {
    fs.rmSync(hostileWork, { recursive: true, force: true });
  }
});

test("the script file has no HTML output, no CSV output and no file writes", () => {
  const src = fs.readFileSync(script, "utf8");
  assert.ok(!src.includes("--html"), "the script still mentions --html");
  assert.ok(!src.includes("renderHTML"), "the HTML renderer is still in the script");
  assert.ok(!src.includes("buildCsv"), "the CSV builder is still in the script");
  assert.ok(!src.includes("writeFileSync"), "the script still writes files");
});

test("the file header names the Apache licence and LICENSE-APACHE-2.0", () => {
  const header = fs.readFileSync(script, "utf8").slice(0, 3000);
  assert.ok(header.includes("Apache"), "header does not mention Apache");
  assert.ok(header.includes("LICENSE-APACHE-2.0"), "header does not name LICENSE-APACHE-2.0");
  assert.ok(header.includes("workproof sessions"), "header does not say the miner runs through workproof sessions");
  assert.ok(fs.existsSync(licenseSrc), "LICENSE-APACHE-2.0 is missing from src/sessions");
  assert.ok(fs.existsSync(licenseBuilt), "LICENSE-APACHE-2.0 is missing from dist/src/sessions (the build did not copy it)");
  assert.ok(fs.existsSync(builtScript), "the miner is missing from dist/src/sessions (the build did not copy it)");
});

test("the CLI lists sessions in its usage text", () => {
  const help = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^ {7}workproof sessions \[--days N \| --since YYYY-MM-DD\] \[--repo <substr>\]$/m);
  assert.match(help.stdout, /^sessions reads the Claude Code session logs on this machine and prints JSON with counts only\.$/m);
});

test("workproof sessions with no transcripts prints a JSON summary with zero sessions and exits 0", () => {
  const empty = fs.mkdtempSync(path.join(tmpRoot, "workproof-empty-"));
  try {
    const env = { ...process.env, HOME: empty };
    delete env.WORKPROOF_HOME;
    const run = spawnSync(process.execPath, [cli, "sessions"], { cwd: empty, env, encoding: "utf8" });
    assert.equal(run.status, 0, `exit ${run.status}: ${run.stderr}`);
    const summary = JSON.parse(run.stdout);
    assert.equal(summary.totals.sessions, 0);
    assert.equal(summary.totals.activeDays, 0);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});

test("the child's non-zero exit code propagates, and its message names the miner", () => {
  const run = spawnSync(process.execPath, [cli, "sessions", "--since", "not-a-date"], {
    cwd: work,
    env: { ...process.env, WORKPROOF_HOME: home },
    encoding: "utf8",
  });
  assert.equal(run.status, 2, `exit ${run.status}: ${run.stderr}`);
  assert.match(run.stderr, /mine-sessions/);
  assert.equal(run.stdout, "");
});

test("workproof sessions works from another working directory", () => {
  const elsewhere = fs.mkdtempSync(path.join(tmpRoot, "workproof-cwd-"));
  try {
    const run = spawnSync(process.execPath, [cli, "sessions", "--days", "30"], {
      cwd: elsewhere,
      env: { ...process.env, WORKPROOF_HOME: home },
      encoding: "utf8",
    });
    assert.equal(run.status, 0, `exit ${run.status}: ${run.stderr}`);
    assert.equal(JSON.parse(run.stdout).totals.sessions, report.totals.sessions);
  } finally {
    fs.rmSync(elsewhere, { recursive: true, force: true });
  }
});

// sha256 of the original Apache License 2.0 text, as published with the receipts plugin.
const APACHE_2_0_SHA256 = "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30";

test("LICENSE-APACHE-2.0 is the original Apache License 2.0 text", () => {
  for (const file of [licenseSrc, licenseBuilt]) {
    const digest = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    assert.equal(digest, APACHE_2_0_SHA256, `the licence text in ${file} differs from the original`);
  }
  const text = fs.readFileSync(licenseSrc, "utf8");
  // The published text opens with a blank line, then the title indented by 33 spaces.
  assert.match(text, /^\n {33}Apache License\n/, "the title line is missing");
  assert.ok(text.includes("Version 2.0, January 2004"), "the version line is missing");
});

test("an unknown option is refused with exit 2 and mines nothing; the three allowed options still work", () => {
  const env = { ...process.env, WORKPROOF_HOME: home };
  const bogus = spawnSync(process.execPath, [cli, "sessions", "--bogus"], { cwd: work, env, encoding: "utf8" });
  assert.equal(bogus.status, 2, `exit ${bogus.status}: ${bogus.stderr}`);
  assert.ok(bogus.stderr.split("\n").includes("mine-sessions: unknown option --bogus"), bogus.stderr);
  assert.equal(bogus.stdout, "");
  const repo = spawnSync(process.execPath, [cli, "sessions", "--days", "30", "--repo", "no-such-repo-substring"], { cwd: work, env, encoding: "utf8" });
  assert.equal(repo.status, 0, `exit ${repo.status}: ${repo.stderr}`);
  const since = spawnSync(process.execPath, [cli, "sessions", "--since", "2000-01-01"], { cwd: work, env, encoding: "utf8" });
  assert.equal(since.status, 0, `exit ${since.status}: ${since.stderr}`);
});

// --- sessions --dir with --since / --until -----------------------------------
// Three exported files. Files A and B both carry session S1, so B repeats a session. B also holds
// S2, which starts the day before the window. C holds S3 on the last day of the window (inclusive),
// S4 on the day after it, and S5 with no timestamp at all. C also holds one synthetic response.

const local = (y, m, d, h = 0, min = 0) => new Date(y, m - 1, d, h, min).toISOString();
const S1 = "7f3a9c1e-0001-4000-8000-000000000001";
const S2 = "7f3a9c1e-0002-4000-8000-000000000002";
const S3 = "9b2d4f6a-0003-4000-8000-000000000003";
const S4 = "9b2d4f6a-0004-4000-8000-000000000004";
const S5 = "9b2d4f6a-0005-4000-8000-000000000005";
const usage = (input, output) => ({ input_tokens: input, output_tokens: output, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 });
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
const userRow = (sessionId, timestamp, cwd) => ({ type: "user", sessionId, timestamp, ...(cwd ? { cwd } : {}), message: { role: "user", content: "PROMPT-TEXT-NOT-OUTPUT" } });
const reply = (sessionId, timestamp, id, model, u, toolId) => ({
  type: "assistant",
  sessionId,
  timestamp,
  message: { id, model, usage: u, content: toolId ? [{ type: "tool_use", id: toolId, name: "Edit", input: {} }] : [{ type: "text", text: "MESSAGE-TEXT-NOT-OUTPUT" }] },
});

function exportFixture() {
  const folder = fs.mkdtempSync(path.join(tmpRoot, "workproof-export-"));
  fs.writeFileSync(path.join(folder, "a.jsonl"), jsonl([userRow(S1, local(2026, 3, 1, 0, 5), "/home/dev/work/ledger-api"), reply(S1, local(2026, 3, 1, 0, 6), "msg-1", "claude-test-a", usage(10, 100), "tool-1")]));
  fs.writeFileSync(path.join(folder, "b.jsonl"), jsonl([reply(S2, local(2026, 2, 28, 23, 59), "msg-3", "claude-test-b", usage(30, 300), "tool-3"), reply(S1, local(2026, 3, 5, 12, 0), "msg-2", "claude-test-a", usage(20, 200), "tool-2")]));
  fs.writeFileSync(
    path.join(folder, "c.jsonl"),
    jsonl([
      reply(S3, local(2026, 3, 31, 23, 30), "msg-4", "claude-test-a", usage(40, 400), "tool-4"),
      reply(S3, local(2026, 3, 31, 23, 31), "msg-7", "<synthetic>", usage(0, 0), null),
      reply(S4, local(2026, 4, 1, 0, 10), "msg-5", "claude-test-a", usage(50, 500), "tool-5"),
      { type: "assistant", sessionId: S5, message: { id: "msg-6", model: "claude-test-b", usage: usage(60, 600), content: [] } },
    ]),
  );
  return folder;
}

function runDir(folder, ...extra) {
  return spawnSync(process.execPath, [cli, "sessions", "--dir", folder, ...extra], { encoding: "utf8", env: { ...process.env, WORKPROOF_HOME: home, ...(process.env.WP_TEST_TZ ? { TZ: process.env.WP_TEST_TZ } : {}) } });
}

test("sessions --dir --since/--until: exact counts and rows, boundary days inclusive, the rest left out", () => {
  const folder = exportFixture();
  try {
    const run = runDir(folder, "--since", "2026-03-01", "--until", "2026-03-31");
    assert.equal(run.status, 0, `exit ${run.status}: ${run.stderr}`);
    const r = JSON.parse(run.stdout);
    assert.deepEqual(r.window, { since: "2026-03-01", until: "2026-03-31" });
    assert.equal(r.files, 3);
    assert.equal(r.exportedFiles, 3);
    assert.equal(r.filesRepeatingASession, 1, "file b repeats session S1 from file a");
    assert.equal(r.sessions, 2, "S1 and S3: S2 starts before the window, S4 after it");
    assert.equal(r.uniqueSessions, 2);
    assert.equal(r.sessionsWithoutDate, 1, "S5 has no timestamp");
    assert.equal(r.assistantResponses, 3, "msg-1, msg-2 and msg-4; msg-3, msg-5 and msg-6 are outside");
    assert.deepEqual(r.excludedResponses, { syntheticOrZeroUsage: 1 });
    assert.deepEqual(r.tokens, { input: 70, output: 700, cacheRead: 0, cacheCreation: 0, all: 770 });
    assert.deepEqual(r.byModel, { "claude-test-a": { responses: 3, input: 70, output: 700, cacheRead: 0, cacheCreation: 0 } });
    assert.deepEqual(r.toolCalls, { total: 3, byTool: { Edit: 3 } });
    assert.deepEqual(r.sessionRows, [
      { id: "7f3a9c1e", first: local(2026, 3, 1, 0, 5), last: local(2026, 3, 5, 12, 0), responses: 2, toolCalls: 2, folder: "ledger-api" },
      { id: "9b2d4f6a", first: local(2026, 3, 31, 23, 30), last: local(2026, 3, 31, 23, 31), responses: 1, toolCalls: 1 },
    ]);
    assert.ok(r.notes.some((n) => n.startsWith("Window: sessions whose first timestamp falls on a local calendar date from 2026-03-01 to 2026-03-31, both included.")));
    assert.ok(r.notes.some((n) => n.includes("sessionRows lists 2 of the 2 sessions in the window")));
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir without a window keeps today's keys and values, and adds the new keys", () => {
  const folder = exportFixture();
  try {
    const run = runDir(folder);
    assert.equal(run.status, 0, `exit ${run.status}: ${run.stderr}`);
    const r = JSON.parse(run.stdout);
    assert.equal(r.source, "export folder");
    assert.equal(r.files, 3);
    assert.equal(r.sessions, 5, "S1 to S5, the session with no timestamp included as today");
    assert.equal(r.assistantResponses, 6);
    assert.deepEqual(r.excludedResponses, { syntheticOrZeroUsage: 1 });
    assert.deepEqual(r.tokens, { input: 210, output: 2100, cacheRead: 0, cacheCreation: 0, all: 2310 });
    assert.deepEqual(r.byModel, {
      "claude-test-a": { responses: 4, input: 120, output: 1200, cacheRead: 0, cacheCreation: 0 },
      "claude-test-b": { responses: 2, input: 90, output: 900, cacheRead: 0, cacheCreation: 0 },
    });
    assert.deepEqual(r.toolCalls, { total: 5, byTool: { Edit: 5 } });
    assert.deepEqual(r.notes, [
      "One response per message id; a reply that was written to the file several times counts once, with its final token counts.",
      "Synthetic responses and responses with zero usage are not counted.",
      "Tool calls are counted once per tool-use id.",
      "No co-authored commit count: this reads session files, not a git repository.",
    ]);
    assert.equal(r.exportedFiles, 3);
    assert.equal(r.uniqueSessions, 5);
    assert.equal(r.filesRepeatingASession, 1);
    assert.equal(r.sessionsWithoutDate, 1);
    assert.equal(r.window, undefined);
    assert.deepEqual(r.sessionRows, [], "rows are printed only for a window");
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir: a bad date, a reversed window or a repeated option exits 2 and prints nothing", () => {
  const folder = exportFixture();
  try {
    const cases = [
      ["--since", "2026-02-30"],
      ["--until", "2026-13-01"],
      ["--since", "03/01/2026"],
      ["--since", "2026-04-01", "--until", "2026-03-01"],
      ["--since", "2026-03-01", "--since", "2026-03-02"],
      ["--since"],
      ["--days", "3"],
    ];
    for (const extra of cases) {
      const run = runDir(folder, ...extra);
      assert.equal(run.status, 2, `${extra.join(" ")}: exit ${run.status}`);
      assert.equal(run.stdout, "", `${extra.join(" ")}: printed to stdout`);
      assert.match(run.stderr, /^mine-sessions: /, extra.join(" "));
    }
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir output names no full working directory, and no full session id", () => {
  const folder = exportFixture();
  try {
    for (const extra of [[], ["--since", "2026-03-01", "--until", "2026-03-31"]]) {
      const run = runDir(folder, ...extra);
      assert.equal(run.status, 0, run.stderr);
      assert.ok(!run.stdout.includes("/home/dev"), "a full working-directory path leaked");
      assert.ok(!run.stdout.includes(folder), "the export folder path leaked");
      assert.ok(!run.stdout.includes(S1), "a full session id leaked");
      assert.ok(!run.stdout.includes("PROMPT-TEXT-NOT-OUTPUT") && !run.stdout.includes("MESSAGE-TEXT-NOT-OUTPUT"), "prompt or message text leaked");
    }
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir --since/--until: at most 100 session rows, the count still exact", () => {
  const folder = fs.mkdtempSync(path.join(tmpRoot, "workproof-export-many-"));
  try {
    const rows = [];
    for (let i = 0; i < 101; i++) {
      const id = `aaaaaaaa-${String(i).padStart(4, "0")}-4000-8000-000000000000`;
      rows.push(reply(id, local(2026, 3, 2, 8, i % 60), `many-${i}`, "claude-test-a", usage(1, 1), null));
    }
    fs.writeFileSync(path.join(folder, "many.jsonl"), jsonl(rows));
    const run = runDir(folder, "--since", "2026-03-01", "--until", "2026-03-31");
    assert.equal(run.status, 0, run.stderr);
    const r = JSON.parse(run.stdout);
    assert.equal(r.uniqueSessions, 101);
    assert.equal(r.sessionRows.length, 100);
    assert.ok(r.notes.some((n) => n.includes("sessionRows lists 100 of the 101 sessions in the window")));
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir: a message id copied into a resumed session is credited to the session that started first, whatever the file order", () => {
  for (const order of [["a.jsonl", "b.jsonl"], ["b.jsonl", "a.jsonl"]]) {
    const folder = fs.mkdtempSync(path.join(tmpRoot, "workproof-export-"));
    try {
      const rowsOld = [userRow("OLD00000-1", local(2026, 1, 10, 9, 0)), reply("OLD00000-1", local(2026, 1, 10, 9, 1), "msg-copied", "claude-test-a", usage(10, 100), "tool-copied")];
      const rowsNew = [userRow("NEW00000-2", local(2026, 3, 10, 9, 0)), reply("NEW00000-2", local(2026, 3, 10, 9, 1), "msg-copied", "claude-test-a", usage(10, 100), "tool-copied")];
      fs.writeFileSync(path.join(folder, order[0]), jsonl(order[0] === "a.jsonl" ? rowsOld : rowsNew));
      fs.writeFileSync(path.join(folder, order[1]), jsonl(order[1] === "a.jsonl" ? rowsOld : rowsNew));
      const jan = JSON.parse(runDir(folder, "--since", "2026-01-01", "--until", "2026-02-01").stdout);
      assert.equal(jan.assistantResponses, 1);
      assert.deepEqual(jan.sessionRows.map((r) => [r.responses, r.toolCalls]), [[1, 1]]);
      const mar = JSON.parse(runDir(folder, "--since", "2026-03-01", "--until", "2026-04-01").stdout);
      assert.equal(mar.assistantResponses, 0, "the copied id belongs to the January session");
      assert.deepEqual(mar.sessionRows.map((r) => [r.responses, r.toolCalls]), [[0, 0]]);
    } finally {
      fs.rmSync(folder, { recursive: true, force: true });
    }
  }
});

test("sessions --dir: a timestamp that is not an ISO time leaves the session undated, and the home folder name is never printed as a folder", () => {
  const folder = fs.mkdtempSync(path.join(tmpRoot, "workproof-export-"));
  try {
    fs.writeFileSync(path.join(folder, "j.jsonl"), jsonl([{ type: "user", sessionId: "JUNK0000-1", timestamp: "1", message: { role: "user", content: "x" } }]));
    fs.writeFileSync(path.join(folder, "h.jsonl"), jsonl([userRow("HOME0000-2", local(2026, 3, 3, 9, 0), os.homedir()), userRow("PROJ0000-3", local(2026, 3, 4, 9, 0), "/x/ledger-api")]));
    const r = JSON.parse(runDir(folder, "--since", "2026-01-01", "--until", "2026-12-31").stdout);
    assert.equal(r.sessionsWithoutDate, 1);
    assert.equal(r.uniqueSessions, 2);
    const byId = Object.fromEntries(r.sessionRows.map((x) => [x.id, x.folder]));
    assert.equal(byId["HOME0000"], undefined);
    assert.equal(byId["PROJ0000"], "ledger-api");
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

test("sessions --dir: the window uses the local calendar date of the first timestamp, not the UTC date", () => {
  // 2026-03-31T23:30:00Z is 1 April in Pacific/Kiritimati (UTC+14) and 31 March in America/Los_Angeles (UTC-7).
  const cases = [["Pacific/Kiritimati", "2026-04-01", "2026-03-31"], ["America/Los_Angeles", "2026-03-31", "2026-04-01"]];
  for (const [tz, hit, miss] of cases) {
    const folder = fs.mkdtempSync(path.join(tmpRoot, "workproof-export-"));
    try {
      fs.writeFileSync(path.join(folder, "t.jsonl"), jsonl([userRow("TZ000000-1", "2026-03-31T23:30:00.000Z")]));
      process.env.WP_TEST_TZ = tz;
      assert.equal(JSON.parse(runDir(folder, "--since", hit, "--until", hit).stdout).uniqueSessions, 1, `${tz} on ${hit}`);
      assert.equal(JSON.parse(runDir(folder, "--since", miss, "--until", miss).stdout).uniqueSessions, 0, `${tz} on ${miss}`);
    } finally {
      delete process.env.WP_TEST_TZ;
      fs.rmSync(folder, { recursive: true, force: true });
    }
  }
});
