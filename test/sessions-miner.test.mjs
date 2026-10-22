import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
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
