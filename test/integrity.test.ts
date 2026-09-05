import { test } from "node:test";
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, checkReport, verifyReport, canonicalize, validateReport, hashOf } from "../src/index.js";

const KEY = "0123456789abcdef0123456789abcdef";
const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, fingerprintKey: KEY };

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

    const v = await verifyReport(edited, [dir], { fingerprintKey: KEY });
    assert.equal(v.ok, false);
    assert.equal(v.integrity.ok, false);
    assert.deepEqual(v.rows, []);
    const good = await verifyReport(report, [dir], { fingerprintKey: KEY });
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
    const v = await verifyReport(report, [b], { fingerprintKey: KEY });
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
    execFileSync("node", [cli, "--repo", dir, "--author", "ada@example.com", "--out", join(dir, "r"), "--fingerprint-key", KEY], { encoding: "utf8" });
    const ok = execFileSync("node", [cli, "check", join(dir, "r.json")], { encoding: "utf8", cwd: dir });
    assert.match(ok, /^schema ok\nhash ok [0-9a-f]{64}\n$/);
    const report = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(join(dir, "r.json"), "utf8")));
    report.repositories[0].figures[0].value.days = 1000;
    await writeFile(join(dir, "edited.json"), JSON.stringify(report));
    assert.throws(() => execFileSync("node", [cli, "check", join(dir, "edited.json")], { encoding: "utf8", stdio: "pipe" }), (err: { status: number; stdout: string }) => err.status === 1 && /hash mismatch/.test(err.stdout));
    assert.throws(() => execFileSync("node", [cli, "verify", join(dir, "edited.json"), "--repo", dir], { encoding: "utf8", stdio: "pipe" }), (err: { status: number; stdout: string }) => err.status === 1 && /^schema ok\nhash mismatch/.test(err.stdout) && /not recomputed/.test(err.stdout));
    const v = execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir, "--fingerprint-key", KEY], { encoding: "utf8" });
    assert.match(v, /^schema ok\nhash ok [0-9a-f]{64}\n.*: fingerprint ok\nall figures reproduce\n/);
    assert.match(v, /What this proves: every figure in the report was recomputed/);
    assert.match(v, /What it does not prove: that the repository itself is honest history/);
    const unkeyed = execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir], { encoding: "utf8" });
    assert.match(unkeyed, /fingerprint not compared \(pass --fingerprint-key\)\nall figures reproduce\n/);
    assert.throws(() => execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir, "--fingerprint-key", "ff".repeat(16)], { encoding: "utf8", stdio: "pipe" }), (err: { status: number; stdout: string }) => err.status === 1 && /different repository/.test(err.stdout));
    assert.throws(() => execFileSync("node", [cli, "check", join(dir, "r.json"), "--repo", dir], { encoding: "utf8", stdio: "pipe" }), /never reads a repository/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the hash does not depend on the machine: directory name and git version are out", () => {
  // The product's whole claim is that a stranger with the same repository recomputes the
  // same string. Before 0.4.0 the hash covered environment.git and the local directory
  // name, so the same repository measured under a different name, or on a machine with a
  // different git, hashed differently. Both were reproduced with real runs.
  const repo = {
    name: "alpha",
    head: "a".repeat(40),
    fingerprint: "b".repeat(64),
    environment: { git: "git version 2.51.0", blame: ["-w", "-M"], ignoreRevs: null, seed: "" },
    figures: [{ id: "tenure", title: "t", value: 1, command: "git log", limits: [] }],
  };
  const renamed = { ...repo, name: "beta" };
  const otherGit = { ...repo, environment: { ...repo.environment, git: "git version 2.39.5 (Apple Git-154)" } };
  const params = { depth: 2 };

  assert.equal(hashOf(params, [renamed]), hashOf(params, [repo]), "a different directory name must not move the hash");
  assert.equal(hashOf(params, [otherGit]), hashOf(params, [repo]), "a different git version must not move the hash");

  // What the hash must still cover: the figures, and the flags the caller chose.
  const otherFigure = { ...repo, figures: [{ ...repo.figures[0]!, value: 2 }] };
  const otherFlags = { ...repo, environment: { ...repo.environment, blame: ["-w"] } };
  const otherHead = { ...repo, head: "c".repeat(40) };
  assert.notEqual(hashOf(params, [otherFigure]), hashOf(params, [repo]), "a changed figure must move the hash");
  assert.notEqual(hashOf(params, [otherFlags]), hashOf(params, [repo]), "changed blame flags must move the hash");
  assert.notEqual(hashOf(params, [otherHead]), hashOf(params, [repo]), "a different commit must move the hash");
});
