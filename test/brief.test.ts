import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { addressKind, briefLines, runBrief, withoutAddresses } from "../src/figures.js";

// Identity comes from each repository's own config, never from the developer's global or system git config.
process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_NOSYSTEM = "1";
for (const key of Object.keys(process.env)) if (key.startsWith("GIT_") && key !== "GIT_CONFIG_GLOBAL" && key !== "GIT_CONFIG_NOSYSTEM") delete process.env[key];

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));

type Who = { name: string; email: string };
const ADA: Who = { name: "Ada Lovelace", email: "ada@work.example" };
const HOME_ADA: Who = { name: "Ada Lovelace", email: "ada.lovelace@home.example" };
const WEBMAIL_ADA: Who = { name: "Ada Lovelace", email: "ada.lovelace@gmail.com" };
const CONTRACTOR: Who = { name: "A. Contractor", email: "ada@contract.example" };
const GRACE: Who = { name: "Grace Hopper", email: "grace@navy.example" };
const BOT: Who = { name: "dependabot[bot]", email: "49699333+dependabot[bot]@users.noreply.github.com" };

const dirs: string[] = [];
after(async () => {
  for (const d of dirs) await rm(d, { recursive: true, force: true });
});

function git(dir: string, args: string[], who?: Who, date?: string, input?: string): string {
  const env = { ...process.env } as Record<string, string>;
  if (who) Object.assign(env, { GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email });
  if (date) Object.assign(env, { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date });
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", env, input });
}

async function newRepo(name = ADA.name, email = ADA.email): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-brief-"));
  dirs.push(dir);
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.name", name]);
  git(dir, ["config", "user.email", email]);
  return dir;
}

async function write(dir: string, file: string, text: string): Promise<void> {
  await mkdir(join(dir, dirname(file)), { recursive: true });
  await writeFile(join(dir, file), text);
}

/** Stages everything and commits as `who` on `date`. */
function commitAs(dir: string, who: Who, date: string, message: string): void {
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "--allow-empty", "-m", message], who, date);
}

const lines = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix} ${i}`).join("\n") + "\n";

/**
 * One history with every brief figure: the configured identity with a merge, a revert, a whitespace-only commit
 * and a large licensed file; a second address with the same name; a personal-webmail namesake; a contractor whose
 * address name matches; a commit by someone else that names the identity in a Co-authored-by trailer; a bot.
 */
async function buildHistory(): Promise<string> {
  const dir = await newRepo();
  await write(dir, "notes.txt", "one\ntwo\n");
  commitAs(dir, ADA, "2026-03-02T10:00:00Z", "start notes");
  await write(dir, "notes.txt", "one\ntwo\nthree\n");
  commitAs(dir, ADA, "2026-03-03T10:00:00Z", "extend notes");
  await write(dir, "vendor/parser.js", `/* License: MIT. All rights reserved. */\n${lines("fn", 45)}`);
  commitAs(dir, ADA, "2026-03-10T10:00:00Z", "vendor the parser");
  const extend = git(dir, ["rev-parse", "HEAD~1"]).trim();
  git(dir, ["revert", "--no-edit", extend], ADA, "2026-03-16T10:00:00Z");
  await write(dir, "notes.txt", "one \ntwo \n");
  commitAs(dir, ADA, "2026-03-16T12:00:00Z", "trailing spaces only");
  git(dir, ["checkout", "-q", "-b", "side"]);
  await write(dir, "side.txt", lines("s", 2));
  commitAs(dir, ADA, "2026-03-17T10:00:00Z", "side work");
  git(dir, ["checkout", "-q", "main"]);
  git(dir, ["merge", "--no-ff", "-q", "side", "-m", "merge side"], ADA, "2026-03-18T10:00:00Z");
  await write(dir, "home-1.txt", "h\n");
  commitAs(dir, HOME_ADA, "2026-03-11T10:00:00Z", "home one");
  await write(dir, "home-2.txt", "h\n");
  commitAs(dir, HOME_ADA, "2026-03-12T10:00:00Z", "home two");
  await write(dir, "webmail.txt", "w\n");
  commitAs(dir, WEBMAIL_ADA, "2026-03-13T10:00:00Z", "webmail namesake");
  await write(dir, "contract.txt", "c\n");
  commitAs(dir, CONTRACTOR, "2026-03-14T10:00:00Z", "contract work");
  await write(dir, "grace.txt", "g\n");
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", `grace's fix\n\nCo-authored-by: ${ADA.name} <${ADA.email}>`], GRACE, "2026-03-15T10:00:00Z");
  await write(dir, "package.json", "{}\n");
  commitAs(dir, BOT, "2026-03-19T10:00:00Z", "bump a dependency");
  await write(dir, "final.txt", "f\n");
  commitAs(dir, ADA, "2026-03-20T10:00:00Z", "final notes");
  return dir;
}

async function briefText(dir: string, budgetMs = 60000): Promise<string> {
  let text = "";
  const code = await runBrief(dir, budgetMs, { write: (s: string) => (text += s) });
  assert.equal(code, 0);
  return text;
}

let history = "";
before(async () => {
  history = await buildHistory();
});

test("the brief for the configured identity has exactly these lines", async () => {
  const text = await briefText(history);
  assert.equal(
    text,
    [
      "Brief for Ada Lovelace (configured), all history, author date, local dates:",
      "repository commits: 14",
      "shallow clone: no",
      ".mailmap: absent",
      "authored non-merge commits: 7",
      "first authored commit date: 2026-03-02",
      "last authored commit date: 2026-03-20",
      "active months: 1",
      "gaps over 30 days: 0",
      "merge commits by the identity: 1",
      "revert commits: 1",
      "whitespace-only commits: 1",
      "lines written (net of exclusions): 6 (raw 54)",
      "largest commit: 85.2% of lines added",
      "large added files with a licence, copyright or source header: 1",
      "identity candidates: 2 other address(es) with the same name",
      "identity candidates: 1 with the same local part",
      "identity candidates: 1 via Co-authored-by trailers",
      "top author 1: Ada Lovelace: 7 commits, organisational",
      "top author 2: Ada Lovelace: 2 commits, organisational",
      "top author 3: dependabot[bot]: 1 commit, bot",
      "top author 4: Ada Lovelace: 1 commit, personal webmail",
      "top author 5: A. Contractor: 1 commit, organisational",
      "",
    ].join("\n"),
  );
});

test("the brief has at most 24 lines and no address anywhere", async () => {
  const text = await briefText(history);
  const count = text.trimEnd().split("\n").length;
  assert.ok(count <= 24, `${count} lines`);
  assert.ok(!text.includes("@"), text);
  assert.ok(!/[\u0000-\u0008\u000b-\u001f\u007f]/.test(text), "control characters in the output");
});

test("the brief's lines come from the same figures rows as workproof figures (the first authored date)", async () => {
  const text = await briefText(history);
  const figures = spawnSync(process.execPath, [cli, "figures", "--repo", history, "--author", ADA.email], { encoding: "utf8" });
  assert.equal(figures.status, 0);
  const row = figures.stdout.split("\n").find((l) => l.startsWith("first authored commit date | "));
  assert.ok(row, figures.stdout);
  assert.match(text, /^first authored commit date: 2026-03-02$/m);
  assert.match(row, /\| 2026-03-02 \|/);
});

test("a configured name that is an address is printed as a placeholder, never as the address", async () => {
  const dir = await newRepo("ada@work.example", ADA.email);
  await write(dir, "a.txt", "a\n");
  commitAs(dir, { name: "ada@work.example", email: ADA.email }, "2026-04-01T10:00:00Z", "one");
  const text = await briefText(dir);
  assert.ok(text.startsWith("Brief for [address removed] (configured), all history"), text);
  assert.ok(!text.includes("@"), text);
});

test("a shallow clone says so, and a repository without a configured identity names the top author", async () => {
  const clone = await mkdtemp(join(tmpdir(), "workproof-brief-shallow-"));
  dirs.push(clone);
  await rm(clone, { recursive: true, force: true });
  execFileSync("git", ["clone", "-q", "--depth", "1", `file://${history}`, clone], { env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" } });
  const text = await briefText(clone);
  const first = text.split("\n");
  assert.equal(first[0], "Brief for Ada Lovelace (top author), all history, author date, local dates:");
  assert.ok(first.includes("shallow clone: yes"), text);
  assert.ok(first.includes("repository commits: 1"), text);
  assert.ok(first.includes("top author 1: Ada Lovelace: 1 commit, organisational"), text);
  assert.ok(!text.includes("@"), text);
});

test("the address kind is one of five words, and the classification decides it", () => {
  const cases: [string, string][] = [
    ["ada@work.example", "organisational"],
    ["ada@laptop.local", "unknown"],
    ["ada@localhost", "unknown"],
    ["ada.lovelace@gmail.com", "personal webmail"],
    ["x@outlook.com", "personal webmail"],
    ["x@hotmail.co.uk", "personal webmail"],
    ["x@yahoo.co.jp", "personal webmail"],
    ["x@icloud.com", "personal webmail"],
    ["x@proton.me", "personal webmail"],
    ["x@gmx.de", "personal webmail"],
    ["x@qq.com", "personal webmail"],
    ["x@163.com", "personal webmail"],
    ["x@yandex.ru", "personal webmail"],
    ["12345+ada@users.noreply.github.com", "noreply"],
    ["noreply@github.com", "noreply"],
    ["49699333+dependabot[bot]@users.noreply.github.com", "bot"],
    ["renovate[bot]@users.noreply.github.com", "bot"],
  ];
  for (const [email, kind] of cases) assert.equal(addressKind(email), kind, email);
});

test("the no-address guarantee replaces any address-shaped text", () => {
  assert.equal(withoutAddresses("Ada <ada@work.example> and 3 commits"), "Ada [address removed] and 3 commits");
  assert.equal(withoutAddresses("no address here"), "no address here");
});

test("a time budget that cannot be met prints nothing and exits 0", async () => {
  const text = await briefText(history, 0);
  assert.equal(text, "");
  const r = spawnSync(process.execPath, [cli, "figures", "--brief", "--repo", history, "--budget-ms", "0"], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "");
});

test("the command prints the brief through the CLI with exit 0", () => {
  const r = spawnSync(process.execPath, [cli, "figures", "--brief", "--repo", history], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  assert.ok(r.stdout.startsWith("Brief for Ada Lovelace (configured), all history"), r.stdout);
});

test("not a git repository: nothing, exit 0", async () => {
  const plain = await mkdtemp(join(tmpdir(), "workproof-brief-plain-"));
  dirs.push(plain);
  assert.equal(await briefText(plain), "");
});

test("more than 20000 commits: nothing is printed", async () => {
  const dir = await newRepo();
  const chunks: string[] = [];
  for (let i = 1; i <= 20001; i++) {
    const when = `${1_600_000_000 + i} +0000`;
    chunks.push(`commit refs/heads/main\nmark :${i}\nauthor ${ADA.name} <${ADA.email}> ${when}\ncommitter ${ADA.name} <${ADA.email}> ${when}\ndata 2\nc\n`);
    if (i > 1) chunks.push(`from :${i - 1}\n`);
    chunks.push("\n");
  }
  const r = spawnSync("git", ["-C", dir, "fast-import", "--quiet"], { input: chunks.join(""), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(await briefText(dir), "");
  assert.equal(await briefLines(dir), undefined);
});

test("usage errors exit 1: --brief with --json, and --budget-ms without --brief", () => {
  const a = spawnSync(process.execPath, [cli, "figures", "--brief", "--json", "--repo", history], { encoding: "utf8" });
  assert.equal(a.status, 1);
  assert.match(a.stderr, /--brief takes only --repo and --budget-ms/);
  const b = spawnSync(process.execPath, [cli, "figures", "--budget-ms", "100", "--repo", history], { encoding: "utf8" });
  assert.equal(b.status, 1);
  assert.equal(b.stdout, "");
});
