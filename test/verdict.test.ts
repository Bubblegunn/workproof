import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { analyseRepo, buildReport, fingerprint, hashOf, newFingerprintKey } from "../src/index.js";
import { rootCommit, remoteUrl } from "../src/git.js";
import type { Params, Report } from "../src/index.js";
import { buildVerdict } from "../src/verdict.js";
import { SPLIT_CATEGORY } from "../src/figures/identity.js";
import { makeRepo } from "./fixture.js";

const CLI = new URL("../src/cli.js", import.meta.url).pathname;
const meta = { version: "0.0.0-test", generatedAt: "2026-10-21T00:00:00Z" };
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]+/i;
const ABSOLUTE = /\/(Users|var|private|tmp|home)\//;

/** Heading lines, in the order the template gives them. */
function assertHeadingsInOrder(md: string, extra: string[] = []) {
  const order = ["# Verdict on ", "## Verdict", "## Altered figures", "## Hash status", ...extra, "## What a passing check would not prove", "## Recommendation"];
  const lines = md.split("\n");
  let at = -1;
  for (const h of order) {
    const i = lines.findIndex((l) => l.startsWith(h));
    assert.ok(i > at, `heading missing or out of order: ${h}`);
    at = i;
  }
}

/** Nothing identifying leaves the verdict: no address, no absolute path. */
function assertNoIdentifiers(md: string, dir: string) {
  assert.ok(!EMAIL.test(md), `an email address is in the verdict:\n${md}`);
  assert.ok(!md.includes(dir), "the repository path is in the verdict");
  assert.ok(!ABSOLUTE.test(md), "an absolute path is in the verdict");
}

const figureRows = (md: string) => md.split("\n").filter((l) => /^\| /.test(l) && !l.startsWith("| Figure"));

async function honestReport(dir: string, key: string): Promise<Report> {
  const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
  const repo = await analyseRepo(dir, params);
  return buildReport([repo], params, meta);
}

/** Edits a copy of the report and recomputes its hash, so only the figures are false. */
function forge(report: Report, edit: (r: Report) => void): Report {
  const copy = structuredClone(report);
  edit(copy);
  copy.hash = hashOf(copy.params, copy.repositories);
  return copy;
}

const figure = (report: Report, id: string) => report.repositories[0]!.figures.find((f) => f.id === id)!;

async function otherRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-other-"));
  const git = (args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.name", "Ada"]);
  git(["config", "user.email", "ada@example.com"]);
  git(["remote", "add", "origin", "git@example.com:other/thing.git"]);
  await writeFile(join(dir, "unrelated.txt"), "something else entirely\n");
  git(["add", "."]);
  git(["commit", "-q", "-m", "unrelated"]);
  return dir;
}

test("(a) an honest report reproduces, with the template headings in order and no altered rows", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const report = await honestReport(dir, key);
    const { markdown, status } = await buildVerdict(report, [dir], { fingerprintKey: key, reportName: "report.json" });
    assert.equal(status, "reproduces", markdown);
    assert.ok(markdown.startsWith("# Verdict on report.json\n"));
    assert.ok(markdown.includes("**Figures reproduce from this repository.**"));
    assertHeadingsInOrder(markdown);
    assert.ok(markdown.includes("None: every figure reproduces."));
    assert.deepEqual(figureRows(markdown), [], "no altered rows");
    assert.ok(!markdown.includes("## Merged-address claim"), "no merged claim without identity.merged");
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(b) a forged figure with a recomputed hash is do-not-trust, altered rows for both figures, and the hash sentence", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const forged = forge(await honestReport(dir, key), (r) => {
      (figure(r, "commitShare").value as { author: number }).author += 40;
      (figure(r, "survivingLines").value as { lines: number }).lines += 500;
    });
    const { markdown, status } = await buildVerdict(forged, [dir], { fingerprintKey: key, reportName: "forged.json" });
    assert.equal(status, "do-not-trust", markdown);
    assert.ok(markdown.includes("**Do not trust as is.**"));
    assertHeadingsInOrder(markdown);
    const rows = figureRows(markdown);
    assert.equal(rows.length, 2, markdown);
    assert.ok(rows.some((l) => l.startsWith("| commitShare |")), "commitShare row");
    assert.ok(rows.some((l) => l.startsWith("| survivingLines |")), "survivingLines row");
    assert.ok(markdown.includes("Offline check: hash ok"));
    assert.ok(markdown.includes("does not show the figures are true"));
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(c) a false merged-address claim is reported as not consistent", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const forged = forge(await honestReport(dir, key), (r) => {
      const repo = r.repositories[0]!;
      repo.identity.merged = { count: 3, reasons: [SPLIT_CATEGORY.login] };
      repo.identity.count += 3;
      (figure(r, "commitShare").value as { author: number }).author += 40;
    });
    const { markdown } = await buildVerdict(forged, [dir], { fingerprintKey: key, reportName: "forged.json" });
    assertHeadingsInOrder(markdown, ["## Merged-address claim"]);
    const section = markdown.slice(markdown.indexOf("## Merged-address claim"), markdown.indexOf("## What a passing check"));
    assert.ok(section.includes("The report claims 3 other addresses were merged"), section);
    assert.ok(section.includes("Not consistent"), section);
    assert.ok(section.includes("re-derived"), section);
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(d) a stale hash is do-not-trust with a hash mismatch and no figures compared", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const stale = await honestReport(dir, key);
    (figure(stale, "commitShare").value as { author: number }).author += 40;
    const { markdown, status } = await buildVerdict(stale, [dir], { fingerprintKey: key, reportName: "stale.json" });
    assert.equal(status, "do-not-trust");
    assert.ok(markdown.includes("hash mismatch"), markdown);
    assert.ok(markdown.includes("Not compared: the offline check failed"), markdown);
    assert.deepEqual(figureRows(markdown), [], "no figures were compared");
    assertHeadingsInOrder(markdown);
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(e) a report checked against a different repository is do-not-trust: the fingerprint differs", async () => {
  const dir = await makeRepo();
  const other = await otherRepo();
  const key = newFingerprintKey();
  try {
    const report = await honestReport(dir, key);
    const { markdown, status } = await buildVerdict(report, [other], { fingerprintKey: key, reportName: "report.json" });
    assert.equal(status, "do-not-trust", markdown);
    assert.ok(markdown.includes("fingerprint of"), markdown);
    assert.ok(markdown.includes("differs"), markdown);
    assertHeadingsInOrder(markdown);
    assertNoIdentifiers(markdown, other);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(other, { recursive: true, force: true });
  }
});

test("(f) a directory that is not a repository gives not-checked", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workproof-plain-"));
  const key = newFingerprintKey();
  const repo = await makeRepo();
  try {
    const report = await honestReport(repo, key);
    const { markdown, status } = await buildVerdict(report, [dir], { fingerprintKey: key, reportName: "report.json" });
    assert.equal(status, "not-checked", markdown);
    assert.ok(markdown.includes("**Could not be checked.**"));
    assert.ok(markdown.includes("Not compared: no repository could be opened."));
    assertHeadingsInOrder(markdown);
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(repo, { recursive: true, force: true });
  }
});

test("(g) the CLI writes the verdict with --out and exits 0; an unreadable file or a missing file exits 1", async () => {
  const dir = await makeRepo();
  const work = await mkdtemp(join(tmpdir(), "workproof-cli-"));
  const key = newFingerprintKey();
  try {
    const reportPath = join(work, "honest.json");
    await writeFile(reportPath, JSON.stringify(await honestReport(dir, key)));
    const outPath = join(work, "verdict.md");
    const run = spawnSync(process.execPath, [CLI, "verdict", reportPath, "--repo", dir, "--fingerprint-key", key, "--out", outPath], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const md = await readFile(outPath, "utf8");
    assert.ok(md.startsWith("# Verdict on honest.json\n"));
    assertHeadingsInOrder(md);
    assertNoIdentifiers(md, dir);

    const missing = spawnSync(process.execPath, [CLI, "verdict", join(work, "missing.json")], { encoding: "utf8" });
    assert.equal(missing.status, 1);
    const noFile = spawnSync(process.execPath, [CLI, "verdict"], { encoding: "utf8" });
    assert.equal(noFile.status, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(work, { recursive: true, force: true });
  }
});

test("(h) the verdict never carries an address or an absolute path, even for a forged report", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const forged = forge(await honestReport(dir, key), (r) => {
      (figure(r, "commitShare").value as { author: number }).author += 40;
    });
    const { markdown } = await buildVerdict(forged, [dir], { fingerprintKey: key, reportName: "forged.json" });
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const NO_DIRECTORY = "Not compared: no directory given";

test("(i) a report with more repositories than directories is not-checked, and the uncovered repository is not compared", async () => {
  const dirA = await makeRepo();
  const dirB = await makeRepo();
  const key = newFingerprintKey();
  try {
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const repoA = await analyseRepo(dirA, params);
    const repoB = await analyseRepo(dirB, params);
    const report = buildReport([repoA, repoB], params, meta);
    const { markdown, status } = await buildVerdict(report, [dirA], { fingerprintKey: key, reportName: "two.json" });
    assert.equal(status, "not-checked", markdown);
    assert.ok(!markdown.includes("Figures reproduce"), markdown);
    assert.ok(markdown.includes(NO_DIRECTORY), markdown);
    assertHeadingsInOrder(markdown);
    assertNoIdentifiers(markdown, dirA);
  } finally {
    await rm(dirA, { recursive: true, force: true });
    await rm(dirB, { recursive: true, force: true });
  }
});

test("(j) a report that names the same repository twice is not-checked with one directory", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const report = await honestReport(dir, key);
    const twice = forge(report, (r) => {
      r.repositories.push(structuredClone(r.repositories[0]!));
    });
    const { markdown, status } = await buildVerdict(twice, [dir], { fingerprintKey: key, reportName: "twice.json" });
    assert.equal(status, "not-checked", markdown);
    assert.ok(markdown.includes(NO_DIRECTORY), markdown);
    assert.ok(!markdown.includes("Figures reproduce"), markdown);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(k) an honest keyed report checked without the key is not-checked, not reproduced", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const report = await honestReport(dir, key);
    const { markdown, status } = await buildVerdict(report, [dir], { reportName: "report.json" });
    assert.equal(status, "not-checked", markdown);
    assert.ok(markdown.includes("**Could not be checked.**"), markdown);
    assert.ok(markdown.includes("The figures reproduce, but which repository this is was not confirmed: ask the sender for the fingerprint key."), markdown);
    assert.ok(!markdown.includes("**Figures reproduce from this repository.**"), markdown);
    assertHeadingsInOrder(markdown);
    assertNoIdentifiers(markdown, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(l) a report whose fingerprint is not keyed reproduces without a key", async () => {
  const dir = await makeRepo();
  const key = newFingerprintKey();
  try {
    const unkeyed = fingerprint(await rootCommit(dir), await remoteUrl(dir), undefined);
    const plain = forge(await honestReport(dir, key), (r) => {
      r.repositories[0]!.fingerprintKeyed = false;
      r.repositories[0]!.fingerprint = unkeyed;
    });
    const { markdown, status } = await buildVerdict(plain, [dir], { reportName: "plain.json" });
    assert.equal(status, "reproduces", markdown);
    assert.ok(markdown.includes("**Figures reproduce from this repository.**"), markdown);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("(m) malformed reports give do-not-trust with the schema problems and never throw", async () => {
  const inputs: unknown[] = [{}, [], { repositories: [], params: {} }, "text", 42, null];
  for (const input of inputs) {
    const { markdown, status } = await buildVerdict(input as Report, [process.cwd()], { reportName: "bad.json" });
    assert.equal(status, "do-not-trust", JSON.stringify(input));
    assertHeadingsInOrder(markdown);
    const hash = markdown.slice(markdown.indexOf("## Hash status"), markdown.indexOf("## What a passing check"));
    assert.ok(hash.includes("does not have the shape this version writes"), hash);
    assert.ok(hash.includes("- "), "the schema problems are listed");
  }
});

test("(n) the CLI exits 0 for a malformed report and HELP says the exit code is 0 whenever a verdict was produced", async () => {
  const work = await mkdtemp(join(tmpdir(), "workproof-bad-"));
  try {
    const path = join(work, "bad.json");
    await writeFile(path, "{}");
    const run = spawnSync(process.execPath, [CLI, "verdict", path], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.ok(run.stdout.includes("**Do not trust as is.**"), run.stdout);
    const help = spawnSync(process.execPath, [CLI, "--help"], { encoding: "utf8" });
    assert.ok(help.stdout.includes("exit code is 0 whenever a verdict was produced, whatever it says"), help.stdout);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});
