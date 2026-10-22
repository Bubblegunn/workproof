import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyseRepo, newFingerprintKey } from "../src/index.js";
import type { Params, RepoReport } from "../src/index.js";
import { buildMine } from "../src/mine.js";

// The same fixture as identity-merge.test.ts: one person, three addresses, and an unrelated person.
const SUBJECT_NAME_IN_GIT = "Ada Lovelace";
const SUBJECT_EMAIL = "adalogin@example.com";
const NOREPLY = "12345+adalogin@users.noreply.github.com";
const OTHER_DOMAIN = "adalogin@other.example";
const CAROL_EMAIL = "carol@elsewhere.example";
const CAROL_NAME = "Carol Vance";
const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));

async function makeSplitRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-mine-"));
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

const base: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, fingerprintKey: "00".repeat(16) };
const tenureOf = (repo: RepoReport) => repo.figures.find((f) => f.id === "tenure")!.value as { first: string; last: string };

test("mine prints the fixed template with the merged basis and no address when --emails is off", async () => {
  const dir = await makeSplitRepo();
  try {
    const repo = await analyseRepo(dir, base);
    const text = buildMine([repo], { emails: false });
    const t = tenureOf(repo);
    assert.ok(text.startsWith(`# My work in ${basename(dir)}\n`), text);
    assert.ok(text.includes(`- Commits: 4 non-merge commits are mine, out of 6 non-merge commits by everyone between my first and my last commit (${t.first} to ${t.last}).`), text);
    assert.match(text, /- Surviving lines: 4 of the 6 lines at HEAD are mine \(66\.7%\), counted with git blame -w -M\./);
    assert.ok(text.includes("## Which addresses are counted"));
    assert.ok(text.includes("Counted as the same person: 2 other addresses, because the rules matched:"), text);
    assert.ok(text.includes("an address whose commits carry the same name"), text);
    assert.ok(text.includes("a GitHub noreply address whose login matches the name or the address in git config"), text);
    assert.ok(text.includes("--no-merge-identities counts only the configured address and addresses with the same name."), text);
    assert.ok(text.includes("## What this does not show"));
    assert.ok(text.includes("Run `npx workproof` and `npx workproof verify`"));
    assert.ok(!text.includes("@"), "no address is written without --emails");
    assert.ok(!text.includes(dir), "no absolute path is written");
    assert.ok(!text.includes("Addresses:"), "the address list is only given with --emails");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mine with --emails lists the merged addresses in the basis sentence", async () => {
  const dir = await makeSplitRepo();
  try {
    const shown = { ...base, emails: true };
    const repo = await analyseRepo(dir, shown);
    const text = buildMine([repo], { emails: true });
    assert.ok(text.includes(`Addresses: ${OTHER_DOMAIN}, (github noreply).`) || text.includes(`Addresses: (github noreply), ${OTHER_DOMAIN}.`), text);
    assert.ok(text.includes(OTHER_DOMAIN));
    assert.ok(!text.includes(CAROL_EMAIL), "an unrelated address is never listed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("buildMine never writes a merged address unless asked, even from a record that carries them", async () => {
  const dir = await makeSplitRepo();
  try {
    const repo = await analyseRepo(dir, { ...base, emails: true });
    assert.ok(repo.identity.merged?.emails?.includes(OTHER_DOMAIN), "the record carries the merged address with --emails");
    const hidden = buildMine([repo], { emails: false });
    assert.ok(!hidden.includes(OTHER_DOMAIN), "the address is not written without --emails");
    assert.ok(!hidden.includes("@"));
    assert.ok(buildMine([repo], { emails: true }).includes(OTHER_DOMAIN));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mine with --no-merge-identities states that nothing was merged and discloses the possible split", async () => {
  const dir = await makeSplitRepo();
  try {
    const repo = await analyseRepo(dir, { ...base, mergeIdentities: false });
    const text = buildMine([repo], { emails: false });
    assert.match(text, /- Commits: 2 non-merge commits are mine, out of 3 non-merge commits by everyone/);
    assert.ok(text.includes("No other address was merged by rule. The address from git config (or --author) is counted, together with any address whose commits carry the same name."), text);
    assert.ok(text.includes("2 other addresses may be the same person and were not counted; pass them with --author."), text);
    assert.ok(!text.includes("Counted as the same person"));
    assert.ok(!text.includes("@"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mine prints one block per repository under a top heading when several are given", async () => {
  const a = await makeSplitRepo();
  const b = await makeSplitRepo();
  try {
    const repos = [await analyseRepo(a, base), await analyseRepo(b, base)];
    const text = buildMine(repos, { emails: false });
    assert.ok(text.startsWith("# My work\n"), text);
    assert.equal(text.split("## My work in ").length - 1, 2, "one block per repository");
  } finally {
    await rm(a, { recursive: true, force: true });
    await rm(b, { recursive: true, force: true });
  }
});

test("the CLI writes the template to stdout, and to --out when given", async () => {
  const dir = await makeSplitRepo();
  const outDir = await mkdtemp(join(tmpdir(), "workproof-mine-out-"));
  try {
    const run = spawnSync(process.execPath, [cli, "mine", "--repo", dir], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.ok(run.stdout.startsWith(`# My work in ${basename(dir)}\n`), run.stdout);
    assert.ok(!run.stdout.includes("fingerprint key"), "the fingerprint key is not printed");
    assert.ok(!run.stdout.includes("@"), run.stdout);

    const file = join(outDir, "mine.md");
    const toFile = spawnSync(process.execPath, [cli, "mine", "--repo", dir, "--out", file], { encoding: "utf8" });
    assert.equal(toFile.status, 0, toFile.stderr);
    assert.equal(await readFile(file, "utf8"), run.stdout, "the file holds exactly the template");
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});

test("mine with --no-merge-identities and --author from the CLI keeps the author exact", async () => {
  const dir = await makeSplitRepo();
  try {
    const run = spawnSync(process.execPath, [cli, "mine", "--repo", dir, "--author", SUBJECT_EMAIL], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.ok(run.stdout.includes("No other address was merged"), run.stdout);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mine rejects an unknown option with exit 1 and writes nothing to stdout", async () => {
  const run = spawnSync(process.execPath, [cli, "mine", "--bogus"], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, "");
  assert.match(run.stderr, /unknown option --bogus/);
});

test("mine takes a fresh fingerprint key and prints no key", async () => {
  const dir = await makeSplitRepo();
  try {
    const repo = await analyseRepo(dir, { ...base, fingerprintKey: newFingerprintKey() });
    assert.ok(!buildMine([repo], { emails: false }).includes(repo.fingerprint.slice(0, 16)));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("mine states the total number of addresses counted, including addresses that carry the configured name even with --no-merge-identities", async () => {
  const dir = await makeSplitRepo();
  try {
    const merged = buildMine([await analyseRepo(dir, base)], { emails: false });
    assert.match(merged, /Addresses counted in total: 3 \(/, merged);
    const none = buildMine([await analyseRepo(dir, { ...base, mergeIdentities: false })], { emails: false });
    assert.match(none, /Addresses counted in total: 1 \(/, none);
    assert.ok(none.includes("together with any address whose commits carry the same name"), none);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
