import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { analyseRepo, buildReport, verifyReport } from "../src/index.js";
import { hashOf } from "../src/report.js";
import type { Params } from "../src/index.js";
import type { Report } from "../src/report.js";

// One author name on two addresses, plus a third person. A report built with the exact
// --author <address> counts one address only; verify must count the same one, not every
// address that shares the name. Names and addresses are fixtures.
const WORK = "ada.work@example.com";
const HOME = "ada.home@example.org";
const KEY = "00112233445566778899aabbccddeeff";
const base: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, fingerprintKey: KEY };
const meta = { version: "0.0.0-test", generatedAt: "2026-10-23T00:00:00Z" };

async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-vid-"));
  const git = (args: string[], env: NodeJS.ProcessEnv = process.env) => execFileSync("git", args, { cwd: dir, env, encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.name", "Ada Lovelace"]);
  git(["config", "user.email", WORK]);
  git(["remote", "add", "origin", "git@example.com:acme/app.git"]);
  const commits: [string, string, string][] = [
    ["Ada Lovelace", WORK, "2026-01-05"],
    ["Ada Lovelace", WORK, "2026-01-12"],
    ["Ada Lovelace", HOME, "2026-01-19"],
    ["Ada Lovelace", HOME, "2026-02-02"],
    ["Ada Lovelace", HOME, "2026-02-09"],
    ["Carol Vance", "carol@elsewhere.example", "2026-01-08"],
  ];
  for (const [i, [name, email, day]] of commits.entries()) {
    await writeFile(join(dir, `f${i}.ts`), `export const v${i} = ${i};\n`.repeat(i + 1));
    const date = `${day}T10:00:00Z`;
    const env = { ...process.env, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
    git(["add", "."], env);
    git(["commit", "-q", "-m", `c${i}`], env);
  }
  return dir;
}

const rehash = (r: Report): Report => ({ ...r, hash: hashOf(r.params, r.repositories) });
const commitShare = (r: Report) => r.repositories[0]!.figures.find((f) => f.id === "commitShare")!.value as { author: number; total: number };

async function reportFor(dir: string, params: Params): Promise<Report> {
  return buildReport([await analyseRepo(dir, params)], params, meta);
}

test("a report made with an exact --author address verifies, though another address shares the name", async () => {
  const dir = await makeRepo();
  try {
    const report = await reportFor(dir, { ...base, author: [WORK] });
    assert.equal(commitShare(report).author, 2, "the report counts the two commits of that one address");
    const v = await verifyReport(report, [dir], { fingerprintKey: KEY });
    assert.equal(v.ok, true, JSON.stringify(v.rows.filter((r) => !r.match)));
    const other = await reportFor(dir, { ...base, author: [HOME] });
    assert.equal(commitShare(other).author, 3);
    assert.equal((await verifyReport(other, [dir], { fingerprintKey: KEY })).ok, true, "and the other address too");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the CLI path: write with --author <email>, verify with --fingerprint-key", async () => {
  const dir = await makeRepo();
  const out = await mkdtemp(join(tmpdir(), "workproof-vid-out-"));
  const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
  try {
    const run = spawnSync("node", [cli, "--repo", dir, "--author", WORK, "--fingerprint-key", KEY, "--sample", "1", "--out", join(out, "r")], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const v = spawnSync("node", [cli, "verify", join(out, "r.json"), "--repo", dir, "--fingerprint-key", KEY], { encoding: "utf8" });
    assert.equal(v.status, 0, v.stdout + v.stderr);
    assert.match(v.stdout, /all figures reproduce/);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(out, { recursive: true, force: true });
  }
});

test("the report stores one keyed hash per counted address and no address", async () => {
  const dir = await makeRepo();
  try {
    const report = await reportFor(dir, { ...base, author: [WORK] });
    const id = report.repositories[0]!.identity;
    assert.equal(id.keys?.length, 1);
    assert.match(id.keys![0]!, /^[0-9a-f]{64}$/);
    const text = JSON.stringify(report);
    for (const secret of [WORK, HOME, "elsewhere.example", KEY]) assert.ok(!text.includes(secret), `${secret} must not be in the report`);
    const leaky = buildReport(report.repositories, { ...base, identityKeys: ["a".repeat(64)] }, meta);
    assert.ok(!("identityKeys" in leaky.params), "the verifier-only parameter is never written to a report");
    const merged = await reportFor(dir, { ...base, author: ["Ada Lovelace"] });
    assert.equal(merged.repositories[0]!.identity.keys?.length, 2, "selected by name: both addresses are counted and keyed");
    assert.equal((await verifyReport(merged, [dir], { fingerprintKey: KEY })).ok, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a report of the previous format (no keys) still verifies as before", async () => {
  const dir = await makeRepo();
  try {
    const report = await reportFor(dir, { ...base, author: ["Ada Lovelace"] });
    const old = structuredClone(report);
    delete old.repositories[0]!.identity.keys;
    const v = await verifyReport(rehash(old), [dir], { fingerprintKey: KEY });
    assert.equal(v.ok, true, "name-selected old report: resolved by names, as before");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("forged identity keys are caught: by the hash, and by the figures when the hash is recomputed", async () => {
  const dir = await makeRepo();
  try {
    const report = await reportFor(dir, { ...base, author: [WORK] });
    const both = await reportFor(dir, { ...base, author: ["Ada Lovelace"] });
    const forged = structuredClone(report);
    forged.repositories[0]!.identity.keys = both.repositories[0]!.identity.keys!;
    const stale = await verifyReport(forged, [dir], { fingerprintKey: KEY });
    assert.equal(stale.ok, false);
    assert.equal(stale.integrity.ok, false, "editing the keys without the hash fails the integrity check");
    const resealed = await verifyReport(rehash(forged), [dir], { fingerprintKey: KEY });
    assert.equal(resealed.ok, false, "a resealed report claiming the wider identity does not reproduce its figures");
    assert.ok(resealed.rows.some((r) => !r.match));
    const junk = structuredClone(report);
    junk.repositories[0]!.identity.keys = ["not-a-hash"];
    assert.equal((await verifyReport(rehash(junk), [dir], { fingerprintKey: KEY })).ok, false, "malformed keys fail the schema");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("with the wrong key the repository is refused before any figure", async () => {
  const dir = await makeRepo();
  try {
    const report = await reportFor(dir, { ...base, author: [WORK] });
    const v = await verifyReport(report, [dir], { fingerprintKey: "ffeeddccbbaa99887766554433221100" });
    assert.equal(v.ok, false);
    assert.equal(v.rows.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
