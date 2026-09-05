import { test } from "node:test";
import assert from "node:assert/strict";
import { rm, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, verifyReport, narrate, renderMarkdown } from "../src/index.js";

const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };

test("verify reproduces on the same HEAD and reports mismatches after a new commit", async () => {
  const dir = await makeRepo();
  try {
    const report = buildReport([await analyseRepo(dir, params)], params, { version: "0.1.0", generatedAt: "x" });
    const same = await verifyReport(report, [dir]);
    assert.equal(same.ok, true);
    assert.equal(same.rows.every((r) => r.match), true);
    await writeFile(join(dir, "src/new.ts"), "x\n");
    execFileSync("git", ["add", "."], { cwd: dir });
    execFileSync("git", ["-c", "user.name=Bob", "-c", "user.email=bob@example.com", "commit", "-q", "-m", "bob: more"], {
      cwd: dir,
      env: { ...process.env, GIT_AUTHOR_DATE: "2026-03-01T10:00:00Z", GIT_COMMITTER_DATE: "2026-03-01T10:00:00Z" },
    });
    const moved = await verifyReport(report, [dir]);
    assert.equal(moved.ok, false);
    assert.equal(moved.headMoved.length, 1);
    assert.ok(moved.rows.some((r) => r.figure === "survivingLines" && !r.match));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("narrate posts figures only and returns the model text", async () => {
  const seen: string[] = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      seen.push(body);
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ choices: [{ message: { content: "Ada wrote most of it." } }] }));
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as { port: number }).port;
  const dir = await makeRepo();
  try {
    const report = buildReport([await analyseRepo(dir, { ...params, paths: true })], { ...params, paths: true }, { version: "0.1.0", generatedAt: "x" });
    const text = await narrate(report, { url: `http://127.0.0.1:${port}/v1/chat/completions`, key: "k", model: "m" });
    assert.equal(text, "Ada wrote most of it.");
    assert.ok(seen[0]!.includes("survivingLines"));
    assert.ok(!seen[0]!.includes("src/a.ts"));
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test("the CLI writes both files and verify exits 0", async () => {
  const dir = await makeRepo();
  try {
    const cli = join(process.cwd(), "dist/src/cli.js");
    const out = execFileSync("node", [cli, "--repo", dir, "--author", "ada@example.com", "--out", join(dir, "r")], { encoding: "utf8" });
    assert.match(out, /wrote .*r\.md and .*r\.json in \d+\.\ds/);
    const json = JSON.parse(await readFile(join(dir, "r.json"), "utf8"));
    assert.equal(json.tool, "workproof");
    const v = execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir], { encoding: "utf8" });
    assert.match(v, /all figures reproduce/);
    const help = execFileSync("node", [cli, "--help"], { encoding: "utf8" });
    assert.match(help, /usage: workproof/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("--max-commits reads only the newest commits and is recorded in the parameters", async () => {
  const dir = await makeRepo();
  try {
    const seen: string[] = [];
    const repo = await analyseRepo(dir, { ...params, maxCommits: 4 }, { progress: (m) => seen.push(m) });
    const t = repo.figures.find((f) => f.id === "tenure")!;
    assert.equal(t.value.first, "2026-01-12");
    const share = repo.figures.find((f) => f.id === "commitShare")!;
    assert.deepEqual(share.value, { author: 2, total: 2, share: 1 });
    assert.ok(seen.some((m) => /newest 4 commits/.test(m)));
    assert.ok(seen.some((m) => /4 commits read/.test(m)));
    assert.ok(seen.some((m) => /blamed \d+ of \d+ files/.test(m)));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("two repositories make one report with two sections, and verify checks both", async () => {
  const a = await makeRepo();
  const b = await makeRepo();
  try {
    const report = buildReport([await analyseRepo(a, params), await analyseRepo(b, params)], params, { version: "0.1.2", generatedAt: "x" });
    assert.equal(report.repositories.length, 2);
    const md = renderMarkdown(report);
    assert.equal((md.match(/^## workproof-/gm) ?? []).length, 2);
    const v = await verifyReport(report, [a, b]);
    assert.equal(v.ok, true);
    assert.equal(v.rows.length, 12);
  } finally {
    await rm(a, { recursive: true, force: true });
    await rm(b, { recursive: true, force: true });
  }
});
