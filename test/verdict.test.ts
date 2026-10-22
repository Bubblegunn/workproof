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

/** A report in another format. */
const foreignReport = (figures: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ subject: "Ada", figures, figures_sha256: "0".repeat(64), ...extra }) as unknown as Report;

interface Truth { commits: number; added: number; deleted: number; first: string; last: string }

/** A repository with a merge commit, a bot commit, a lock file and a second person; the expected figures come from plain git. */
async function foreignRepo(): Promise<{ dir: string; truth: Truth }> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-foreign-"));
  const run = (args: string[], who = "Ada", email = "ada@example.com", date = "2026-03-01T10:00:00Z") =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: who, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: who, GIT_COMMITTER_EMAIL: email, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
  const write = (f: string, n: number, tag: string) => writeFile(join(dir, f), Array.from({ length: n }, (_, i) => `${tag} ${i}`).join("\n") + "\n");
  run(["init", "-q", "-b", "main"]);
  await write("a.txt", 12, "a");
  run(["add", "."]); run(["commit", "-q", "-m", "one"]);
  await write("package-lock.json", 80, "lock");
  run(["add", "."]); run(["commit", "-q", "-m", "lock"], "Ada", "ada@example.com", "2026-03-05T10:00:00Z");
  await write("bot.txt", 30, "bot");
  run(["add", "."]); run(["commit", "-q", "-m", "bump"], "dependabot[bot]", "49699333+dependabot[bot]@users.noreply.github.com", "2026-03-06T10:00:00Z");
  run(["checkout", "-q", "-b", "topic"]);
  await write("b.txt", 7, "b");
  run(["add", "."]); run(["commit", "-q", "-m", "topic"], "Bob", "bob@example.com", "2026-03-07T10:00:00Z");
  run(["checkout", "-q", "main"]);
  await write("c.txt", 5, "c");
  run(["add", "."]); run(["commit", "-q", "-m", "two"], "Ada", "ada@example.com", "2026-03-09T10:00:00Z");
  run(["merge", "-q", "--no-ff", "-m", "merge topic", "topic"], "Ada", "ada@example.com", "2026-03-10T10:00:00Z");
  // Expected figures with plain git only: Ada's non-merge commits, the lock file left out.
  const commits = Number(run(["rev-list", "--no-merges", "--count", "--author=ada@example.com", "HEAD"]).trim());
  let added = 0;
  let deleted = 0;
  for (const line of run(["log", "--no-merges", "--author=ada@example.com", "--numstat", "--format="]).split("\n")) {
    const [a, d, f] = line.split("\t");
    if (f && f !== "package-lock.json") { added += Number(a); deleted += Number(d); }
  }
  const days = run(["log", "--no-merges", "--author=ada@example.com", "--format=%ad", "--date=short"]).trim().split("\n").sort();
  return { dir, truth: { commits, added, deleted, first: days[0]!, last: days[days.length - 1]! } };
}

const withForeign = async (fn: (dir: string, t: Truth) => Promise<void>) => {
  const { dir, truth } = await foreignRepo();
  try { await fn(dir, truth); } finally { await rm(dir, { recursive: true, force: true }); }
};

test("(h) a foreign-format report whose figures match plain git reproduces, with the merge, bot and lock file left out", () => withForeign(async (dir, t) => {
  assert.equal(t.commits, 3, "the fixture has three non-merge commits by Ada");
  const report = foreignReport({ commits_authored: String(t.commits), lines_added: `${t.added}`, lines_deleted: t.deleted, first_commit: `${t.first}T10:00:00Z`, last_commit_date: t.last });
  const { markdown, status } = await buildVerdict(report, [dir], { reportName: "foreign.json" });
  assert.equal(status, "reproduces", markdown);
  assert.ok(markdown.includes("The hash and the fingerprint were not checked"), markdown);
  assert.ok(markdown.includes("Compared: commits_authored, lines_added, lines_deleted, first_commit, last_commit_date."), markdown);
  assert.deepEqual(figureRows(markdown), []);
  assertHeadingsInOrder(markdown);
  assertNoIdentifiers(markdown, dir);
}));

test("(i) altered commits and lines are do-not-trust with both values; the string number 1,197 is read as 1197", () => withForeign(async (dir, t) => {
  const { markdown, status } = await buildVerdict(foreignReport({ commits_authored: t.commits + 7, lines_added: "1,197", insertions: t.added }), [dir], { reportName: "foreign.json" });
  assert.equal(status, "do-not-trust", markdown);
  const rows = figureRows(markdown);
  assert.ok(rows.includes(`| commits_authored | ${t.commits + 7} | ${t.commits} |`), markdown);
  assert.ok(rows.includes(`| lines_added | 1197 | ${t.added} |`), markdown);
  assert.ok(!rows.some((r) => r.startsWith("| insertions |")), "a matching figure is not an altered row");
  assertNoIdentifiers(markdown, dir);
}));

test("(j) no recognisable figure, only shares and totals, arrays of objects, null and array JSON are not compared", () => withForeign(async (dir, t) => {
  for (const report of [{ title: "CV", skills: ["go"] }, { commit_share: 0.4, total_commits: 999, repo_commits: 5, bot_commits: 3, merge_commits: 9, lines_added_total: 5 }, { rows: [{ commits: 999, lines_added: 1 }] }]) {
    const { markdown, status } = await buildVerdict(report as unknown as Report, [dir], { reportName: "x.json" });
    assert.equal(status, "not-checked", markdown);
    assert.ok(markdown.includes("plain git"), markdown);
    assertHeadingsInOrder(markdown);
  }
  for (const odd of [null, [], [{ commits: t.commits }]]) {
    const { status } = await buildVerdict(odd as unknown as Report, [dir], { reportName: "x.json" });
    assert.equal(status, "do-not-trust", "null and array JSON keep the shape check");
  }
}));

test("(k) non_merge_commits is read; a key with different values in two places is ambiguous and skipped; a figure inside an array is ignored", () => withForeign(async (dir, t) => {
  const report = foreignReport({ non_merge_commits: t.commits, lines_added: t.added }, { summary: { lines_added: t.added + 1 }, rows: [{ lines_deleted: 12345 }] });
  const { markdown, status } = await buildVerdict(report, [dir], { reportName: "x.json" });
  assert.equal(status, "reproduces", markdown);
  assert.ok(markdown.includes("Not compared: lines_added (ambiguous"), markdown);
  assert.ok(!markdown.includes("12345"), "the array figure is ignored");
}));

test("(l) explicit --author is exact: the look-alike address is not merged, and the report author is not used", () => withForeign(async (dir) => {
  execFileSync("git", ["-c", "user.name=Ada", "-c", "user.email=ada@example.org", "commit", "-q", "--allow-empty", "-m", "other address"], { cwd: dir, env: { ...process.env, GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.org", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.org" } });
  // "ada@example.com" alone is three commits; the merge rule would add the other address (same name) for a report-derived author.
  const exact = await buildVerdict(foreignReport({ commits_authored: 3 }, { subject: "Somebody Else" }), [dir], { authors: ["ada@example.com"] });
  assert.equal(exact.status, "reproduces", exact.markdown);
  const merged = await buildVerdict(foreignReport({ commits_authored: 3 }), [dir], {});
  assert.equal(merged.status, "do-not-trust", "a report-derived author merges the address that shares the name");
  assert.ok(merged.markdown.includes("| commits_authored | 3 | 4 |"), merged.markdown);
}));

test("(m2) a shallow clone is not-checked, not do-not-trust", () => withForeign(async (dir, t) => {
  const shallow = await mkdtemp(join(tmpdir(), "workproof-shallow-"));
  try {
    execFileSync("git", ["clone", "-q", "--depth", "1", `file://${dir}`, shallow]);
    const { markdown, status } = await buildVerdict(foreignReport({ commits_authored: t.commits }), [shallow], { authors: ["ada@example.com"] });
    assert.equal(status, "not-checked", markdown);
    assert.ok(markdown.includes("shallow clone, fetch full history"), markdown);
    assertNoIdentifiers(markdown, shallow);
  } finally {
    await rm(shallow, { recursive: true, force: true });
  }
}));

test("(n2) the CLI reads a foreign-format file with repeatable --author and prints a comparison", () => withForeign(async (dir, t) => {
  const work = await mkdtemp(join(tmpdir(), "workproof-cli-"));
  try {
    const reportPath = join(work, "theirs.json");
    await writeFile(reportPath, JSON.stringify(foreignReport({ commits_authored: t.commits + 1 })));
    const run = spawnSync(process.execPath, [CLI, "verdict", reportPath, "--repo", dir, "--author", "Ada", "--author", "ada@example.com"], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.ok(run.stdout.includes("**Do not trust as is.**"), run.stdout);
    assert.ok(run.stdout.includes(`| commits_authored | ${t.commits + 1} | ${t.commits} |`), run.stdout);
    assertNoIdentifiers(run.stdout, dir);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}));
