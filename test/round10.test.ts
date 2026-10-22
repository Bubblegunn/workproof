import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, renderMarkdown } from "../src/index.js";
import { plainSummary } from "../src/summary.js";
import { recogniseText } from "../src/foreign.js";
import { buildVerdict, ReceivedText } from "../src/verdict.js";
import { countWords } from "../src/bullets.js";
import { stopCheck, asksForAddresses, PRIVACY_REASON } from "../src/stopcheck.js";

const ROOT = join(import.meta.dirname, "..", "..");
const CLI = join(ROOT, "dist", "src", "cli.js");
const FIX = join(ROOT, "test", "fixtures", "bullets");
const params = { author: ["bob@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };
const git = (dir: string, args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });

// ---- ruling 1: answer completeness ----

test("the report holds windowed lines added and deleted after exclusions, equal to plain git numstat", async () => {
  const dir = await makeRepo();
  try {
    const repo = await analyseRepo(dir, params);
    let added = 0;
    let deleted = 0;
    for (const line of git(dir, ["log", "--no-merges", "--author=bob@example.com", "--numstat", "--format="]).split("\n")) {
      const m = /^(\d+)\t(\d+)\t(.+)$/.exec(line);
      if (m && m[3] !== "gen/out.ts") { added += Number(m[1]); deleted += Number(m[2]); }
    }
    assert.deepEqual(repo.windowLines, { added, deleted });
    assert.ok(added > 0 && deleted > 0);
    const md = renderMarkdown(buildReport([repo], params, { version: "0.7.0", generatedAt: "2026-10-22T00:00:00Z" }));
    assert.match(md, new RegExp(`lines in the window, after exclusions: ${added} added, ${deleted} deleted`));
    assert.match(plainSummary(repo), new RegExp(`added ${added} lines and deleted ${deleted} lines`));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("excluded items: merge ids, excluded path counts (names only with --paths), commits outside a --since/--until window", async () => {
  const dir = await makeRepo();
  try {
    git(dir, ["config", "user.name", "Bob"]);
    git(dir, ["config", "user.email", "bob@example.com"]);
    git(dir, ["checkout", "-q", "-b", "side"]);
    writeFileSync(join(dir, "side.txt"), "side\n");
    git(dir, ["add", "."]);
    git(dir, ["commit", "-q", "-m", "side work"]);
    git(dir, ["checkout", "-q", "main"]);
    git(dir, ["merge", "--no-ff", "-q", "-m", "merge side", "side"]);
    const mergeId = git(dir, ["rev-parse", "--short=7", "HEAD"]).trim();
    const win = { since: "2026-01-01", until: "2099-01-01" };
    const hidden = await analyseRepo(dir, { ...params, ...win });
    const items = hidden.excluded.items!;
    assert.deepEqual(items.mergeCommits.ids, [mergeId]);
    assert.equal(items.paths.count, 1);
    assert.equal(items.paths.added, 8);
    assert.equal(items.paths.hidden, true);
    assert.deepEqual(items.paths.files, []);
    assert.equal(items.outsideWindow!.count, 0);
    const shown = await analyseRepo(dir, { ...params, paths: true, since: "2026-02-09", until: "2026-02-12" });
    assert.deepEqual(shown.excluded.items!.paths.files, [{ path: "gen/out.ts", added: 8, deleted: 0 }]);
    const out = shown.excluded.items!.outsideWindow!;
    assert.ok(out.count >= 2, String(out.count));
    assert.ok(out.commits.every((c) => /^[0-9a-f]{7}$/.test(c.id) && /^\d{4}-\d{2}-\d{2}$/.test(c.date)));
    const md = renderMarkdown(buildReport([shown], { ...params, paths: true }, { version: "0.7.0", generatedAt: "2026-10-22T00:00:00Z" }));
    assert.match(md, /commits by the author outside the window \(not counted\): \d+ \([0-9a-f]{7} on \d{4}-/);
    assert.match(md, /gen\/out\.ts: 8 added, 0 deleted/);
    assert.ok(!renderMarkdown(buildReport([hidden], params, { version: "0.7.0", generatedAt: "2026-10-22T00:00:00Z" })).includes("gen/out.ts"), "path names stay hidden without --paths");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("stop hook: the email block does not fire when the user's prompt asks for addresses or identities", () => {
  assert.ok(asksForAddresses("Which identities did you count and which email addresses were left out?"));
  assert.ok(!asksForAddresses("How many commits are mine?"));
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-stop-"));
  try {
    const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
    execFileSync("git", ["init", "-q"], { cwd: dir, env });
    writeFileSync(join(dir, "a.txt"), "x\n");
    execFileSync("git", ["add", "."], { cwd: dir, env });
    execFileSync("git", ["-c", "user.name=Kim", "-c", "user.email=kim.example@example.org", "commit", "-q", "-m", "init"], { cwd: dir, env });
    const lines = (prompt: string) => [
      { type: "user", message: { role: "user", content: prompt } },
      { type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "Bash", input: { command: "npx workproof mine" } }] } },
      { type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "ok" }] } },
      { type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "Counted: kim.example@example.org." }] } },
    ];
    const run = (prompt: string) => {
      const t = join(dir, "t.jsonl");
      writeFileSync(t, lines(prompt).map((l) => JSON.stringify(l)).join("\n") + "\n");
      return stopCheck(JSON.stringify({ transcript_path: t, cwd: dir }));
    };
    assert.match(run("How many commits are mine?"), new RegExp(PRIVACY_REASON.slice(0, 30)));
    assert.equal(run("Which identities and addresses did you count?"), "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- ruling 3: received evidence ----

test("the foreign parser ignores the digits of SHA-256 when it reads commit counts", () => {
  const r = recogniseText("Commits file SHA-256 of commits.csv: abc\nsha256 commits: see file\n");
  assert.deepEqual(r.found, []);
  assert.deepEqual(recogniseText("42 commits by the author, SHA-256 of commits.csv below").found.map((f) => [f.kind, f.value]), [["commits", 42]]);
});

test("verdict Row checks: SHA-256 of an attached file, per-row lines, author and date, ids not in the repository", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-rows-"));
  const repo = join(dir, "repo");
  const recv = join(dir, "received");
  try {
    mkdirSync(repo);
    mkdirSync(recv);
    git(repo, ["init", "-q"]);
    const commit = (file: string, body: string, msg: string, date: string) => {
      writeFileSync(join(repo, file), body);
      git(repo, ["add", "."]);
      execFileSync("git", ["-c", "user.name=Rowan Test", "-c", "user.email=rowan@example.test", "commit", "-q", "-m", msg], { cwd: repo, env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });
      return git(repo, ["rev-parse", "HEAD"]).trim();
    };
    const a = commit("a.txt", "1\n2\n3\n", "first", "2026-03-01T10:00:00Z");
    const b = commit("b.txt", "1\n2\n", "second", "2026-03-02T10:00:00Z");
    const csv = `commit,author,date,added,deleted\n${a.slice(0, 7)},Rowan Test,2026-03-01,3,0\n${b.slice(0, 7)},Rowan Test,2026-03-02,20,0\nabcdef0,Rowan Test,2026-03-03,5,0\n`;
    writeFileSync(join(recv, "commits.csv"), csv);
    const sha = createHash("sha256").update(csv).digest("hex");
    const text = (hash: string) => `Report for Rowan Test\nCommit rows: commits.csv\nSHA-256 of commits.csv: ${hash}\n`;
    writeFileSync(join(recv, "report.md"), text(sha));
    const good = await buildVerdict(new ReceivedText(text(sha)), [repo], { reportPath: join(recv, "report.md"), reportText: text(sha), authors: ["Rowan Test"] });
    assert.match(good.markdown, /## Row checks/);
    assert.match(good.markdown, /commits\.csv: SHA-256 [0-9a-f]{12} matches a hash in the report/);
    assert.match(good.markdown, /\| [0-9a-f]{7} \| lines added \| 20 \| 2 \|/);
    assert.match(good.markdown, /Commit ids not in the repository: abcdef0/);
    assert.match(good.markdown, /3 rows with a commit id compared with `git show --numstat`: 1 match, 1 differ, 1 not in the repository/);
    assert.equal(good.status, "do-not-trust");
    assert.ok(!good.markdown.includes("256 commits"), "SHA-256 is not read as a commit count");
    const wrong = "0".repeat(64);
    const bad = await buildVerdict(new ReceivedText(text(wrong)), [repo], { reportPath: join(recv, "report.md"), reportText: text(wrong), authors: ["Rowan Test"] });
    assert.match(bad.markdown, /does not match any hash in the report/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- ruling 4: output size ----

test("bullets --resume trims to --max-words, says so, and the count is wc -w", () => {
  const work = mkdtempSync(join(tmpdir(), "workproof-r10-words-"));
  try {
    const jd = join(FIX, "jd-backend.md");
    const facts = join(FIX, "past-resume.md");
    const full = join(work, "full.md");
    const small = join(work, "small.md");
    const a = spawnSync(process.execPath, [CLI, "bullets", "--jd", jd, "--facts", facts, "--resume", "--out", full], { encoding: "utf8" });
    assert.equal(a.status, 0, a.stderr);
    const fullWords = countWords(readFileSync(full, "utf8"));
    assert.match(a.stdout, new RegExp(`\\(${fullWords} words, limit 450\\)`));
    assert.ok(!a.stdout.includes("Trimmed"));
    const limit = Math.max(60, fullWords - 40);
    const b = spawnSync(process.execPath, [CLI, "bullets", "--jd", jd, "--facts", facts, "--resume", "--max-words", String(limit), "--out", small], { encoding: "utf8" });
    assert.equal(b.status, 0, b.stderr);
    const smallWords = countWords(readFileSync(small, "utf8"));
    assert.ok(smallWords < fullWords, `${smallWords} < ${fullWords}`);
    assert.match(b.stdout, new RegExp(`Trimmed to fit ${limit} words: dropped \\d+ lowest-ranked bullets? and \\d+ coverage rows?`));
    const wc = spawnSync("wc", ["-w", small], { encoding: "utf8" });
    assert.equal(Number(wc.stdout.trim().split(/\s+/)[0]), smallWords);
    assert.ok(readFileSync(small, "utf8").includes("## Gaps"), "the Gaps section is never trimmed");
    const bad = spawnSync(process.execPath, [CLI, "bullets", "--jd", jd, "--facts", facts, "--resume", "--max-words", "x"], { encoding: "utf8" });
    assert.equal(bad.status, 1);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("stop hook: blocks when a resume written by bullets is over the cap, and allows it once it fits", () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-cap-"));
  try {
    const resume = join(dir, "resume.md");
    const t = join(dir, "t.jsonl");
    const transcript = () => [
      { type: "user", message: { role: "user", content: "tailor my resume" } },
      { type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "Bash", input: { command: `npx workproof bullets --jd jd.txt --facts r.md --resume --out ${resume}` } }] } },
      { type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "wrote" }] } },
      { type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "Done." }] } },
    ].map((l) => JSON.stringify(l)).join("\n") + "\n";
    writeFileSync(t, transcript());
    writeFileSync(resume, Array.from({ length: 500 }, (_, i) => `word${i}`).join(" "));
    const blocked = stopCheck(JSON.stringify({ transcript_path: t, cwd: dir }));
    assert.match(blocked, /has 500 words and the limit is 450/);
    assert.equal(stopCheck(JSON.stringify({ transcript_path: t, cwd: dir, stop_hook_active: true })), "");
    writeFileSync(resume, Array.from({ length: 449 }, (_, i) => `word${i}`).join(" "));
    assert.equal(stopCheck(JSON.stringify({ transcript_path: t, cwd: dir })), "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- ruling 2 and 5: sessions --dir and the hint hook ----

test("sessions --dir: unique responses, tokens by type and model, tool calls once per id, secrets and addresses redacted", () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-export-"));
  try {
    mkdirSync(join(dir, "sessions"));
    const asst = (id: string, model: string, usage: Record<string, number>, content: unknown[] = []) => ({ type: "assistant", sessionId: "s1", message: { id, model, usage, content } });
    const u = (i: number, o: number, cr = 0, cc = 0) => ({ input_tokens: i, output_tokens: o, cache_read_input_tokens: cr, cache_creation_input_tokens: cc });
    const rows = [
      { type: "user", sessionId: "s1", message: { role: "user", content: "contact me at someone@example.org" } },
      asst("m1", "model-a", u(10, 1), [{ type: "tool_use", id: "tu1", name: "Read" }]),
      asst("m1", "model-a", u(10, 5, 100, 20), [{ type: "tool_use", id: "tu1", name: "Read" }, { type: "tool_use", id: "tu2", name: "Bash" }]),
      asst("m2", "model-b", u(7, 3)),
      asst("m3", "<synthetic>", u(0, 0)),
      asst("m4", "model-a", u(0, 0)),
      asst("m5", "sk-abcdefghijklmnopqrstuvwxyz0123456789", u(1, 1)),
    ];
    writeFileSync(join(dir, "sessions", "one.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    writeFileSync(join(dir, "sessions", "two.jsonl"), JSON.stringify({ type: "user", sessionId: "s2", message: { role: "user", content: "hi" } }) + "\nnot json\n");
    const r = spawnSync(process.execPath, [CLI, "sessions", "--dir", dir], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.sessions, 2);
    assert.equal(out.assistantResponses, 3);
    assert.equal(out.excludedResponses.syntheticOrZeroUsage, 2);
    assert.deepEqual(out.tokens, { input: 18, output: 9, cacheRead: 100, cacheCreation: 20, all: 147 });
    assert.deepEqual(out.byModel["model-a"], { responses: 1, input: 10, output: 5, cacheRead: 100, cacheCreation: 20 });
    assert.equal(out.byModel["model-b"].responses, 1);
    assert.deepEqual(out.toolCalls, { total: 2, byTool: { Bash: 1, Read: 1 } });
    assert.ok(!r.stdout.includes("someone@example.org") && !r.stdout.includes("sk-abcdefghijkl"), "no address or secret-looking string is printed");
    assert.match(r.stdout, /\(secret hidden\)/);
    const missing = spawnSync(process.execPath, [CLI, "sessions", "--dir", join(dir, "nope")], { encoding: "utf8" });
    assert.equal(missing.status, 2);
    const mixed = spawnSync(process.execPath, [CLI, "sessions", "--dir", dir, "--days", "3"], { encoding: "utf8" });
    assert.equal(mixed.status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("hint hook: export, token and tool phrasings match; the context carries the --dir rule and the plugin root; exit 0", () => {
  const hook = join(ROOT, "hooks", "workproof-hint.sh");
  const ask = (prompt: string, env: Record<string, string> = {}) => spawnSync("sh", [hook], { input: JSON.stringify({ prompt, cwd: tmpdir() }), encoding: "utf8", env: { ...process.env, ...env } });
  for (const p of [
    "I exported my sessions into a folder. How many assistant responses, and totals by type and per model?",
    "Which tools did Claude call most in the session export?",
    "How many commits list Claude as a co-author?",
  ]) {
    const r = ask(p);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /sessions --dir <folder>/, p);
  }
  const r = ask("summarise my usage from the session logs", { CLAUDE_PLUGIN_ROOT: "/opt/plug-in" });
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /Plugin root: \/opt\/plug-in /);
  const derived = JSON.parse(ask("summarise my usage from the session logs", { CLAUDE_PLUGIN_ROOT: "" }).stdout).hookSpecificOutput.additionalContext;
  assert.ok(derived.includes(`Plugin root: ${ROOT} `), derived.slice(-160));
  assert.equal(ask("rename this variable").stdout, "");
});

// ---- review fixes ----

import { rowChecks, rowChecksFail, rowChecksUnconfirmed } from "../src/rowchecks.js";

function reviewRepo(dir: string, date = "2026-03-01T10:00:00Z") {
  const repo = join(dir, "repo");
  mkdirSync(repo);
  const env = { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  execFileSync("git", ["init", "-q"], { cwd: repo, env });
  writeFileSync(join(repo, "a.txt"), "1\n2\n3\n");
  execFileSync("git", ["add", "."], { cwd: repo, env });
  execFileSync("git", ["-c", "user.name=Rowan Test", "-c", "user.email=rowan@example.test", "commit", "-q", "-m", "first"], { cwd: repo, env });
  return { repo, id: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim() };
}

test("review 1: a long run of name characters does not hang rowChecks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-redos-"));
  try {
    writeFileSync(join(dir, "report.md"), "x");
    for (const text of ["a".repeat(200_000), "a.".repeat(100_000)]) {
      const t0 = Date.now();
      await rowChecks(join(dir, "report.md"), text, undefined);
      assert.ok(Date.now() - t0 < 3000, `took ${Date.now() - t0} ms`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review 2: an unrelated csv beside the report is not a hash mismatch", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-unrel-"));
  try {
    const csv = "commit,added\nabcdef0,1\n";
    writeFileSync(join(dir, "commits.csv"), csv);
    writeFileSync(join(dir, "notes.csv"), "a,b\n1,2\n");
    const sha = createHash("sha256").update(csv).digest("hex");
    const text = `SHA-256 of commits.csv: ${sha}\n`;
    writeFileSync(join(dir, "report.md"), text);
    const rc = await rowChecks(join(dir, "report.md"), text, undefined);
    assert.equal(rc.hashMismatch, false);
    assert.ok(rc.hashLines.some((l) => /notes\.csv.*the report holds no hash for it/.test(l)), rc.hashLines.join("\n"));
    const named = await rowChecks(join(dir, "report.md"), `notes.csv hash: ${sha}\n`, undefined);
    assert.equal(named.hashMismatch, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review 3: a UTC date for a commit made late in a negative offset is accepted", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-utc-"));
  try {
    const { repo, id } = reviewRepo(dir, "2024-03-05T23:30:00-08:00");
    writeFileSync(join(dir, "commits.csv"), `commit,date\n${id.slice(0, 7)},2024-03-06\n`);
    const text = "Rows in commits.csv\n";
    writeFileSync(join(dir, "report.md"), text);
    const rc = await rowChecks(join(dir, "report.md"), text, repo);
    assert.equal(rc.rowsChecked, 1);
    assert.deepEqual(rc.problems, []);
    writeFileSync(join(dir, "commits.csv"), `commit,date\n${id.slice(0, 7)},2024-03-20\n`);
    assert.equal((await rowChecks(join(dir, "report.md"), text, repo)).problems.length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review 4: a few missing commit ids give not-checked; most missing give do-not-trust", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-miss-"));
  try {
    const { repo, id } = reviewRepo(dir);
    const text = "Rows in commits.csv\n";
    writeFileSync(join(dir, "report.md"), text);
    writeFileSync(join(dir, "commits.csv"), `commit\n${id.slice(0, 7)}\n${id.slice(0, 7)}\nabcdef0\n`);
    const few = await rowChecks(join(dir, "report.md"), text, repo);
    assert.deepEqual(few.missing, ["abcdef0"]);
    assert.equal(rowChecksFail(few), false);
    assert.equal(rowChecksUnconfirmed(few), true);
    const v = await buildVerdict(new ReceivedText(text), [repo], { reportPath: join(dir, "report.md"), reportText: text });
    assert.notEqual(v.status, "do-not-trust", v.markdown);
    assert.match(v.markdown, /Commit ids not in the repository: abcdef0\. The clone may lack a branch/);
    writeFileSync(join(dir, "commits.csv"), `commit\n${id.slice(0, 7)}\nabcdef0\nabcdef1\n`);
    const most = await rowChecks(join(dir, "report.md"), text, repo);
    assert.equal(rowChecksFail(most), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review 5: a report cannot make rowChecks read a file outside its own folder", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-r10-esc-"));
  try {
    mkdirSync(join(dir, "recv"));
    writeFileSync(join(dir, "secret.json"), "[]");
    writeFileSync(join(dir, "recv", "report.md"), "x");
    const rc = await rowChecks(join(dir, "recv", "report.md"), `see ../secret.json and ${join(dir, "secret.json")}\n`, undefined);
    assert.deepEqual(rc.files, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("review 6: the hint hook and asksForAddresses ignore unrelated prompts", () => {
  const hook = join(ROOT, "hooks", "workproof-hint.sh");
  const ask = (prompt: string) => spawnSync("sh", [hook], { input: JSON.stringify({ prompt, cwd: tmpdir() }), encoding: "utf8" });
  for (const p of ["what is the per model pricing of gpt for my app", "write an email about per-model cost"]) assert.equal(ask(p).stdout, "", p);
  assert.match(ask("show tokens per model from my exported session logs").stdout, /sessions --dir/);
  assert.equal(asksForAddresses("draft an email to my manager from my bullets"), false);
  assert.equal(asksForAddresses("list the email addresses you counted"), true);
  assert.equal(asksForAddresses("which emails did you merge"), true);
  assert.equal(asksForAddresses("which identities were counted"), true);
});

test("SKILL.md carries the CV bullet and self-review rules inline", () => {
  const b = readFileSync(join(ROOT, "skills", "workproof", "SKILL.md"), "utf8");
  for (const part of ["source tag", "never rounded or recounted", "Keep the commit share and the surviving-lines share apart", "say how to check it"]) assert.ok(b.includes(part), part);
});
