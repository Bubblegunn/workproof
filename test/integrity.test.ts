import { test } from "node:test";
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, checkReport, verifyReport, canonicalize, validateReport } from "../src/index.js";

const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };

test("canonicalize follows RFC 8785: sorted keys, no whitespace, undefined skipped, non-finite refused", () => {
  assert.equal(canonicalize({ b: 1, a: [true, null, "xé"], c: { z: 0, y: 1.5 } }), '{"a":[true,null,"xé"],"b":1,"c":{"y":1.5,"z":0}}');
  assert.equal(canonicalize({ b: undefined, a: "x" }), '{"a":"x"}');
  assert.equal(canonicalize({ B: 1, a: 1, _: 1 }), '{"B":1,"_":1,"a":1}');
  assert.equal(canonicalize([1e21, 0.000001, -0]), "[1e+21,0.000001,0]");
  assert.throws(() => canonicalize({ a: Infinity }), /non-finite/);
  assert.throws(() => canonicalize({ a: () => 1 }), /type function/);
});

test("check accepts a fresh report and names what changed in an edited one", async () => {
  const dir = await makeRepo();
  try {
    const report = buildReport([await analyseRepo(dir, params)], params, { version: "0.2.0", generatedAt: "2026-09-05T00:00:00Z" });
    assert.equal(report.schemaVersion, 2);
    assert.deepEqual(validateReport(report), []);
    const fresh = checkReport(report);
    assert.equal(fresh.ok, true);
    assert.equal(fresh.hash.stated, fresh.hash.computed);
    // Round-tripping through JSON.parse must not change the hash.
    assert.equal(checkReport(JSON.parse(JSON.stringify(report))).ok, true);

    const edited = JSON.parse(JSON.stringify(report));
    edited.repositories[0].figures[1].value.author = 99;
    const tampered = checkReport(edited);
    assert.equal(tampered.ok, false);
    assert.match(tampered.problems[0]!, /^hash mismatch: report says [0-9a-f]{64}, content hashes to [0-9a-f]{64}$/);
    assert.equal(tampered.hash.stated, report.hash);
    assert.notEqual(tampered.hash.computed, report.hash);

    const broken = JSON.parse(JSON.stringify(report));
    delete broken.hash;
    broken.repositories[0].figures[2].limits = "none";
    const problems = checkReport(broken).problems;
    assert.ok(problems.includes("hash: expected 64 hex characters"), problems.join("; "));
    assert.ok(problems.includes("repositories[0].figures[2].limits: expected array of strings"), problems.join("; "));
    assert.deepEqual(validateReport({ ...report, schemaVersion: 1 }), ["schemaVersion: expected 2"]);
    assert.deepEqual(validateReport("x"), ["report: expected object"]);

    const v = await verifyReport(edited, [dir]);
    assert.equal(v.ok, false);
    assert.equal(v.integrity.ok, false);
    assert.deepEqual(v.rows, []);
    const good = await verifyReport(report, [dir]);
    assert.equal(good.ok, true);
    assert.equal(good.integrity.ok, true);
    assert.deepEqual(good.fingerprints, [{ repo: report.repositories[0]!.name, compared: true, match: true }]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("verify stops at the fingerprint when the report is from another repository", async () => {
  const a = await makeRepo();
  const b = await makeRepo();
  try {
    execFileSync("git", ["remote", "set-url", "origin", "git@example.com:acme/other.git"], { cwd: b });
    const report = buildReport([await analyseRepo(a, params)], params, { version: "0.2.0", generatedAt: "2026-09-05T00:00:00Z" });
    const v = await verifyReport(report, [b]);
    assert.equal(v.ok, false);
    assert.equal(v.integrity.ok, true);
    assert.deepEqual(v.fingerprints, [{ repo: report.repositories[0]!.name, compared: true, match: false }]);
    assert.deepEqual(v.rows, []);
  } finally {
    await rm(a, { recursive: true, force: true });
    await rm(b, { recursive: true, force: true });
  }
});

test("the CLI's check works offline and verify prints integrity first", async () => {
  const dir = await makeRepo();
  try {
    const cli = join(process.cwd(), "dist/src/cli.js");
    execFileSync("node", [cli, "--repo", dir, "--author", "ada@example.com", "--out", join(dir, "r")], { encoding: "utf8" });
    const ok = execFileSync("node", [cli, "check", join(dir, "r.json")], { encoding: "utf8", cwd: dir });
    assert.match(ok, /^schema ok\nhash ok [0-9a-f]{64}\n$/);
    const report = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(join(dir, "r.json"), "utf8")));
    report.repositories[0].figures[0].value.days = 1000;
    await writeFile(join(dir, "edited.json"), JSON.stringify(report));
    assert.throws(() => execFileSync("node", [cli, "check", join(dir, "edited.json")], { encoding: "utf8", stdio: "pipe" }), (err: { status: number; stdout: string }) => err.status === 1 && /hash mismatch/.test(err.stdout));
    assert.throws(() => execFileSync("node", [cli, "verify", join(dir, "edited.json"), "--repo", dir], { encoding: "utf8", stdio: "pipe" }), (err: { status: number; stdout: string }) => err.status === 1 && /^schema ok\nhash mismatch/.test(err.stdout) && /not recomputed/.test(err.stdout));
    const v = execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir], { encoding: "utf8" });
    assert.match(v, /^schema ok\nhash ok [0-9a-f]{64}\n.*: fingerprint ok\nall figures reproduce\n$/);
    assert.throws(() => execFileSync("node", [cli, "check", join(dir, "r.json"), "--repo", dir], { encoding: "utf8", stdio: "pipe" }), /never reads a repository/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
