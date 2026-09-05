import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, renderMarkdown, fingerprint } from "../src/index.js";

const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };

test("fingerprint normalises remotes and is stable", () => {
  const a = fingerprint("abc", "git@github.com:Acme/App.git");
  const b = fingerprint("abc", "https://github.com/acme/app");
  assert.equal(a, b);
  assert.equal(a.length, 64);
  assert.notEqual(a, fingerprint("abd", "https://github.com/acme/app"));
});

test("analyseRepo produces every figure and buildReport hashes without emails by default", async () => {
  const dir = await makeRepo();
  try {
    const repo = await analyseRepo(dir, params);
    assert.deepEqual(repo.figures.map((f) => f.id), ["tenure", "commitShare", "cadence", "footprint", "testsAndDocs", "survivingLines"]);
    assert.equal(repo.identity.count, 1);
    const report = buildReport([repo], params, { version: "0.1.0", generatedAt: "2026-09-05T00:00:00Z" });
    assert.equal(report.hash.length, 64);
    const text = JSON.stringify(report);
    assert.ok(!text.includes("ada@example.com"), "emails must not leak by default");
    assert.ok(!text.includes("src/a.ts"), "file paths must not leak");
    assert.ok(!text.includes('"src"'), "directory paths must not leak without --paths");
    const md = renderMarkdown(report, "Narrative here.");
    assert.match(md, /# Engineering report/);
    assert.match(md, /Surviving lines at HEAD/);
    assert.match(md, /Generated narrative \(not verified\)/);
    assert.match(md, /What this cannot show/);
    assert.ok(!md.includes("—"), "no em dashes in the report");
    const withPaths = await analyseRepo(dir, { ...params, paths: true, emails: true });
    const rep2 = buildReport([withPaths], { ...params, paths: true, emails: true }, { version: "0.1.0", generatedAt: "x" });
    assert.ok(JSON.stringify(rep2).includes("ada@example.com"));
    assert.match(renderMarkdown(rep2), /- src: 2 of 2 commits, 100\.0%/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
