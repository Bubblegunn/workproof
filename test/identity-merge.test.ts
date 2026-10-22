import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { analyseRepo, buildReport, renderMarkdown, verifyReport } from "../src/index.js";
import type { AnalyseHooks, Params, RepoReport } from "../src/index.js";
import { SPLIT_CATEGORY } from "../src/figures/identity.js";

// One person, three addresses. The configured identity is the first; the other two are the
// same person by evidence the rules recognise: a GitHub noreply address whose commit name is
// the login, and an address with the same commit name as the subject on another domain.
// The names and addresses are fixtures.
const SUBJECT_NAME_IN_GIT = "Ada Lovelace";
const SUBJECT_EMAIL = "adalogin@example.com";
const NOREPLY = "12345+adalogin@users.noreply.github.com";
const OTHER_DOMAIN = "adalogin@other.example";
// An unrelated person who must never be merged.
const CAROL_EMAIL = "carol@elsewhere.example";
const CAROL_NAME = "Carol Vance";

type MergeNotice = { repo: string; emails: string[]; reasons: string[] };
type WithMerge = Params & { mergeIdentities?: boolean };
type Hooks = AnalyseHooks & { merged?: (m: MergeNotice) => void };
type Ident = {
  count: number;
  names: string[];
  emails: string[];
  merged?: { count: number; reasons: string[] };
  possiblySplit?: { count?: number; reasons: string[]; names: string[] };
};

const base = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };
const meta = { version: "0.0.0-test", generatedAt: "2026-10-21T00:00:00Z" };
const identityOf = (repo: RepoReport): Ident => repo.identity as Ident;
const commitShareOf = (repo: RepoReport) => repo.figures.find((f) => f.id === "commitShare")!.value as { author: number; total: number };

/**
 * Six commits. Ada's configured address (two commits), a noreply address whose commit name is
 * the login, an other-domain address whose commit name is the same as the subject's, and an
 * unrelated person with two commits.
 */
async function makeSplitRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-merge-"));
  const git = (args: string[], env: NodeJS.ProcessEnv = process.env) => execFileSync("git", args, { cwd: dir, env, encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.name", SUBJECT_NAME_IN_GIT]);
  git(["config", "user.email", SUBJECT_EMAIL]);
  git(["remote", "add", "origin", "git@example.com:acme/app.git"]);
  const commits: [string, string, string][] = [
    ["Ada", SUBJECT_EMAIL, "2026-01-05"],
    ["Ada", SUBJECT_EMAIL, "2026-01-12"],
    ["adalogin", NOREPLY, "2026-01-19"],
    ["Ada", OTHER_DOMAIN, "2026-02-02"],
    [CAROL_NAME, CAROL_EMAIL, "2026-01-08"],
    [CAROL_NAME, CAROL_EMAIL, "2026-01-15"],
  ];
  for (const [i, [name, email, day]] of commits.entries()) {
    await writeFile(join(dir, `f${i}.ts`), `export const v${i} = ${i};\n`);
    const date = `${day}T10:00:00Z`;
    const env = { ...process.env, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
    git(["add", "."], env);
    git(["commit", "-q", "-m", `c${i}`], env);
  }
  return dir;
}

test("default run merges the other addresses of the configured person before any figure is computed", async () => {
  const dir = await makeSplitRepo();
  try {
    const seen: MergeNotice[] = [];
    const hooks: Hooks = { merged: (m) => { seen.push(m); } };
    const repo = await analyseRepo(dir, base as Params, hooks);
    const id = identityOf(repo);
    assert.equal(id.count, 3, "the configured address and both others are counted");
    assert.deepEqual(id.merged, { count: 2, reasons: [SPLIT_CATEGORY.login, SPLIT_CATEGORY.sameName].sort() });
    assert.equal(id.possiblySplit, undefined, "nothing merged is still reported as a possible split");
    assert.deepEqual(commitShareOf(repo), { author: 4, total: 6, share: 4 / 6 }, "the figures include the merged commits and the unrelated person in the window");
    assert.equal(seen.length, 1, "the hook is called once for the repository");
    assert.deepEqual(seen[0]!.emails, [NOREPLY, OTHER_DOMAIN].sort(), "the hook carries the merged addresses in full, for the terminal only");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mergeIdentities: false counts only the configured address and keeps the split warning", async () => {
  const dir = await makeSplitRepo();
  try {
    const optOut: WithMerge = { ...base, mergeIdentities: false };
    const repo = await analyseRepo(dir, optOut);
    const id = identityOf(repo);
    assert.equal(id.count, 1, "only the configured address is counted");
    assert.equal(id.merged, undefined);
    assert.equal(id.possiblySplit?.count, 2, "the two other addresses are still disclosed as possible splits");
    assert.deepEqual(commitShareOf(repo), { author: 2, total: 3, share: 2 / 3 }, "the window ends at the configured address last commit, so the other addresses are outside it");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an explicit author is exact: nothing is merged and the warning stays", async () => {
  const dir = await makeSplitRepo();
  try {
    const seen: MergeNotice[] = [];
    const hooks: Hooks = { merged: (m) => { seen.push(m); } };
    const repo = await analyseRepo(dir, { ...base, author: [SUBJECT_EMAIL] } as Params, hooks);
    const id = identityOf(repo);
    assert.equal(id.count, 1, "--author names exactly one address, so only that address is counted");
    assert.equal(id.merged, undefined);
    assert.equal(id.possiblySplit?.count, 2, "the old warning path still runs");
    assert.equal(seen.length, 0, "no merge notice is printed for an explicit author");
    assert.ok(id.possiblySplit?.reasons.length, "the candidates carry the rule that found them");
    assert.match(renderMarkdown(buildReport([repo], { ...base, author: [SUBJECT_EMAIL] } as Params, meta)), /Candidates, not merged/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a different person with a different name and an unrelated address is never merged", async () => {
  const dir = await makeSplitRepo();
  try {
    const seen: MergeNotice[] = [];
    const hooks: Hooks = { merged: (m) => { seen.push(m); } };
    const repo = await analyseRepo(dir, base as Params, hooks);
    const id = identityOf(repo);
    assert.ok(!id.names.includes(CAROL_NAME), "Carol's name is not in the identity");
    assert.ok(!seen.flatMap((m) => m.emails).includes(CAROL_EMAIL), "Carol's address is not merged");
    assert.equal(id.merged?.count, 2, "only the two evidenced addresses are merged");
    assert.equal(commitShareOf(repo).author, 4, "Carol's commits are not in the author's share");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the CLI prints the merge on stderr, and --no-merge-identities suppresses it", async () => {
  const dir = await makeSplitRepo();
  const outDir = await mkdtemp(join(tmpdir(), "workproof-merge-out-"));
  const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
  try {
    const on = spawnSync("node", [cli, "--format", "json", "--sample", "1", "--out", join(outDir, "on")], { cwd: dir, encoding: "utf8" });
    assert.equal(on.status, 0, on.stderr);
    assert.match(on.stderr, /merged 2 other addresses into your identity because GitHub login matches, same name on another address: /);
    assert.ok(on.stderr.includes(NOREPLY) && on.stderr.includes(OTHER_DOMAIN), "the terminal line lists the merged addresses in full");
    assert.match(on.stderr, /Pass --no-merge-identities to count only the configured address, or --author to choose exactly\./);

    const off = spawnSync("node", [cli, "--format", "json", "--sample", "1", "--no-merge-identities"], { cwd: dir, encoding: "utf8" });
    assert.equal(off.status, 0, off.stderr);
    assert.ok(!off.stderr.includes("into your identity"), "no merge line with the opt-out");
    const report = JSON.parse(off.stdout) as { params: { mergeIdentities?: boolean }; repositories: RepoReport[] };
    assert.equal(report.params.mergeIdentities, false, "the opt-out is recorded in the parameters");
    assert.equal(identityOf(report.repositories[0]!).count, 1);
    assert.equal(identityOf(report.repositories[0]!).merged, undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});

test("verify reproduces a report made with merging on, with emails hidden, from the CLI and in process", async () => {
  const dir = await makeSplitRepo();
  const outDir = await mkdtemp(join(tmpdir(), "workproof-merge-verify-"));
  const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
  try {
    const repo = await analyseRepo(dir, base as Params);
    const report = buildReport([repo], base as Params, meta);
    assert.deepEqual(report.repositories[0]!.identity.emails, [], "emails are hidden");
    assert.equal(identityOf(report.repositories[0]!).merged?.count, 2, "the report carries the merge");
    const inProcess = await verifyReport(report, [dir]);
    assert.equal(inProcess.ok, true, JSON.stringify(inProcess.rows.filter((r) => !r.match)));

    // With --emails the noreply address is written as a placeholder; verify must still resolve it.
    const shown: WithMerge = { ...base, emails: true };
    const withEmails = buildReport([await analyseRepo(dir, shown)], shown, meta);
    assert.ok(identityOf(withEmails.repositories[0]!).emails.length === 3 && withEmails.repositories[0]!.identity.emails.includes("(github noreply)"));
    assert.equal((await verifyReport(withEmails, [dir])).ok, true, "a report that shows the merged addresses verifies too");

    const file = join(outDir, "report.json");
    await writeFile(file, JSON.stringify(report, null, 2));
    const cliVerify = spawnSync("node", [cli, "verify", file, "--repo", dir], { encoding: "utf8" });
    assert.equal(cliVerify.status, 0, cliVerify.stdout + cliVerify.stderr);
    assert.match(cliVerify.stdout, /all figures reproduce/);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});

test("the markdown report states the merge in one line and carries no address", async () => {
  const dir = await makeSplitRepo();
  try {
    const report = buildReport([await analyseRepo(dir, base as Params)], base as Params, meta);
    const text = renderMarkdown(report);
    assert.match(text, /Merged by rule: 2 other addresses \(GitHub login matches, same name on another address\)\. Counted as the same person: 2 other addresses, because the rules matched: a GitHub noreply address whose login matches the name or the address in git config; an address whose commits carry the same name\. This is a rule, not proof: it can be wrong, and --no-merge-identities counts only the configured address and addresses with the same name\./);
    for (const email of [SUBJECT_EMAIL, NOREPLY, OTHER_DOMAIN, CAROL_EMAIL]) {
      assert.ok(!text.includes(email), `${email} must not be written without --emails`);
    }
    assert.ok(!JSON.stringify(report).includes(OTHER_DOMAIN), "the JSON carries no merged address either");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const DEFAULT_CONFIG = { name: SUBJECT_NAME_IN_GIT, email: SUBJECT_EMAIL };

/** A repository from an explicit list of [commit name, commit address, day]; the configured identity is DEFAULT_CONFIG. */
async function makeRepoFrom(commits: [string, string, string][]): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-merge-from-"));
  const git = (args: string[], env: NodeJS.ProcessEnv = process.env) => execFileSync("git", args, { cwd: dir, env, encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.name", DEFAULT_CONFIG.name]);
  git(["config", "user.email", DEFAULT_CONFIG.email]);
  git(["remote", "add", "origin", "git@example.com:acme/app.git"]);
  for (const [i, [name, email, day]] of commits.entries()) {
    await writeFile(join(dir, `g${i}.ts`), `export const w${i} = ${i};\n`);
    const date = `${day}T10:00:00Z`;
    const env = { ...process.env, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
    git(["add", "."], env);
    git(["commit", "-q", "-m", `g${i}`], env);
  }
  return dir;
}

const OTHER_PERSON_NAME = "Ada Other";
const STRANGER_EMAIL = "stranger@third.example";

test("an other-domain look-alike is warned about, not merged, and pulls in no namesake", async () => {
  const dir = await makeRepoFrom([
    ["Ada", SUBJECT_EMAIL, "2026-01-05"],
    ["Ada", SUBJECT_EMAIL, "2026-01-12"],
    [OTHER_PERSON_NAME, OTHER_DOMAIN, "2026-01-19"],
    [OTHER_PERSON_NAME, STRANGER_EMAIL, "2026-01-26"],
  ]);
  try {
    const repo = await analyseRepo(dir, base as Params);
    const id = identityOf(repo);
    assert.equal(id.count, 1, "only the configured address is counted");
    assert.equal(id.merged, undefined, "a same-local-part address on another domain is not merged");
    assert.equal(id.possiblySplit?.count, 1, "the look-alike is still warned about; the namesake is not a split at all");
    assert.deepEqual(id.possiblySplit?.reasons, [SPLIT_CATEGORY.otherDomain]);
    const inProcess = await verifyReport(buildReport([repo], base as Params, meta), [dir]);
    assert.equal(inProcess.ok, true, "the warned-only report still reproduces");

    const outDir = await mkdtemp(join(tmpdir(), "workproof-merge-warn-"));
    try {
      const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
      const run = spawnSync("node", [cli, "--format", "both", "--sample", "1", "--out", join(outDir, "w")], { cwd: dir, encoding: "utf8" });
      assert.equal(run.status, 0, run.stderr);
      assert.ok(!run.stderr.includes("into your identity"), "nothing is merged on stderr");
      assert.match(run.stderr, /warning, 1 other address in this repository may be the same person and is not in these figures/);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the second round applies the same strong-only filter: an other-domain address reached by a merge is still not merged", async () => {
  // mike@work.example is merged by the sameName rule in round one, which adds the local part
  // "mike" to the identity. mike@home.example is then an other-domain look-alike in round two.
  const dir = await makeRepoFrom([
    ["Ada", SUBJECT_EMAIL, "2026-01-05"],
    ["Ada", SUBJECT_EMAIL, "2026-01-12"],
    ["Ada", "mike@work.example", "2026-01-19"],
    ["Zed Park", "mike@home.example", "2026-01-26"],
  ]);
  try {
    const repo = await analyseRepo(dir, base as Params);
    const id = identityOf(repo);
    assert.equal(id.merged?.count, 1, "only the sameName address is merged");
    assert.deepEqual(id.merged?.reasons, [SPLIT_CATEGORY.sameName]);
    assert.deepEqual(id.possiblySplit?.reasons, [SPLIT_CATEGORY.otherDomain], "the round-two look-alike is still warned about");
    assert.ok(await verifyReport(buildReport([repo], base as Params, meta), [dir]).then((r) => r.ok));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a merged login address whose name is shared with a stranger is merged in the second round by the sameName rule, and verify reproduces", async () => {
  const dir = await makeRepoFrom([
    ["Ada", SUBJECT_EMAIL, "2026-01-05"],
    ["Ada", SUBJECT_EMAIL, "2026-01-12"],
    ["Ada Lee", NOREPLY, "2026-01-19"],
    ["Ada Lee", "zed@third.example", "2026-01-26"],
  ]);
  try {
    const report = buildReport([await analyseRepo(dir, base as Params)], base as Params, meta);
    const repo = report.repositories[0]!;
    assert.equal(identityOf(repo).merged?.count, 2, "the login address, then the stranger who shares its name");
    assert.deepEqual(identityOf(repo).merged?.reasons, [SPLIT_CATEGORY.login, SPLIT_CATEGORY.sameName].sort());
    assert.equal(identityOf(repo).possiblySplit, undefined);
    const result = await verifyReport(report, [dir]);
    assert.equal(result.ok, true, JSON.stringify(result.rows.filter((r) => !r.match)));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a merged address with two different commit names verifies with emails hidden, in process and from the CLI", async () => {
  const dir = await makeRepoFrom([
    ["Ada", SUBJECT_EMAIL, "2026-01-05"],
    ["Ada", SUBJECT_EMAIL, "2026-01-12"],
    ["adalogin", NOREPLY, "2026-01-19"],
    ["Ada L.", NOREPLY, "2026-01-26"],
  ]);
  const outDir = await mkdtemp(join(tmpdir(), "workproof-merge-twonames-"));
  const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
  try {
    const report = buildReport([await analyseRepo(dir, base as Params)], base as Params, meta);
    const repo = report.repositories[0]!;
    assert.equal(identityOf(repo).merged?.count, 1);
    assert.ok(identityOf(repo).names.includes("adalogin") && identityOf(repo).names.includes("Ada L."), "both commit names are carried");
    assert.equal((await verifyReport(report, [dir])).ok, true);
    const file = join(outDir, "report.json");
    await writeFile(file, JSON.stringify(report, null, 2));
    const run = spawnSync("node", [cli, "verify", file, "--repo", dir], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /all figures reproduce/);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});

test("the merge line on stderr lists at most five addresses and then says how many more", async () => {
  const commits: [string, string, string][] = [["Ada", SUBJECT_EMAIL, "2026-01-05"]];
  for (let i = 1; i <= 7; i++) commits.push(["adalogin", `${i}+adalogin@users.noreply.github.com`, `2026-01-${String(5 + i * 2).padStart(2, "0")}`]);
  const dir = await makeRepoFrom(commits);
  try {
    const run = spawnSync("node", [fileURLToPath(new URL("../src/cli.js", import.meta.url)), "--format", "json", "--sample", "1"], { cwd: dir, encoding: "utf8" });
    const line = run.stderr.split("\n").find((l) => l.includes("merged 7 other addresses")) ?? "";
    assert.ok(line.length > 0, run.stderr);
    assert.equal(line.split("users.noreply.github.com").length - 1, 5, "exactly five addresses are listed");
    assert.match(line, /, and 2 more\. Pass --no-merge-identities/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
