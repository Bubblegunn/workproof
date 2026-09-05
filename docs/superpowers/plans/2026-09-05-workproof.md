# workproof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `workproof` 0.1.0: `npx workproof` in a git repository writes a verifiable engineering report (Markdown + JSON) for one author without exposing code, and `npx workproof verify report.json` reproduces it.

**Architecture:** One `git log --numstat` pass over the tenure window feeds most figures; `surviving-lines` supplies the blame figure; each figure is a small module returning `{ id, title, value, command, limits }`; `report.ts` renders Markdown and JSON and hashes the verifiable part; `verify` recomputes and diffs. The CLI is a thin argument parser over `analyse()` and `verify()`.

**Tech Stack:** TypeScript 5, Node 20+, ESM, `node:test`, one runtime dependency (`surviving-lines`), GitHub Actions matrix (ubuntu, macos, windows x Node 20, 22, 24).

**Spec:** `docs/superpowers/specs/2026-09-05-workproof-design.md`

## Global Constraints

- Package name `workproof`, MIT, author Efe Genc, `engines.node >= 20`, `type: module`.
- Only dependency: `surviving-lines@^0.1.1`. Dev: `typescript`, `@types/node`.
- Never print code content. No file paths unless `--paths`; then directories only, depth-limited (default 2). Author emails only with `--emails`.
- Every figure carries `command` (the git command that produced it) and `limits` (what it cannot show).
- Test command names files explicitly (`node --test dist/test/*.test.js` does not expand on Node 20): use `node --test dist/test/figures.test.js dist/test/report.test.js dist/test/cli.test.js`.
- No em dashes in shipped text.

---

### Task 1: Scaffold, git helpers, and the test fixture

**Files:**
- Create: `package.json`, `tsconfig.json`, `LICENSE`, `.gitignore`, `.github/workflows/ci.yml`
- Create: `src/git.ts`
- Create: `test/fixture.ts`
- Test: `test/figures.test.ts` (first cases)

**Interfaces:**
- Produces:
  - `git(args: string[], cwd: string): Promise<string>`
  - `interface Commit { sha: string; email: string; name: string; date: Date; parents: number; files: FileChange[] }`
  - `interface FileChange { path: string; added: number | null; deleted: number | null }` (null for binary)
  - `listCommits(cwd, opts: { since?: string; until?: string }): Promise<Commit[]>` (all authors, newest first, merges included with `parents > 1`, mailmapped identities)
  - `listTags(cwd): Promise<{ name: string; date: Date; email: string }[]>` (email = tagger, else tagged commit author)
  - `rootCommit(cwd)`, `headSha(cwd)`, `remoteUrl(cwd)`, `configuredEmail(cwd)`
  - `test/fixture.ts`: `makeRepo(): Promise<string>` builds a repository with authors Ada (ada@example.com) and Bob (bob@example.com), commits on 2026-01-05, 01-12, 01-19 (Ada), 02-02, 02-09 (Bob), a tag `v1.0.0` on Ada's third commit, a `src/`, `test/`, `docs/` tree, a rename, a binary; returns its path.

- [ ] **Step 1: Scaffold files**

`package.json`:

```json
{
  "name": "workproof",
  "version": "0.1.0",
  "description": "Turn a private git repository into a verifiable engineering report for one author, without showing any code.",
  "type": "module",
  "main": "./dist/src/index.js",
  "types": "./dist/src/index.d.ts",
  "exports": { ".": { "types": "./dist/src/index.d.ts", "import": "./dist/src/index.js" } },
  "bin": { "workproof": "./dist/src/cli.js" },
  "files": ["dist/src", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "test": "npm run build && node --test dist/test/figures.test.js dist/test/report.test.js dist/test/cli.test.js",
    "prepublishOnly": "npm test"
  },
  "engines": { "node": ">=20" },
  "keywords": ["git", "portfolio", "proof-of-work", "career", "blame", "engineering-evidence"],
  "author": "Efe Genc",
  "license": "MIT",
  "repository": { "type": "git", "url": "git+https://github.com/Bubblegunn/workproof.git" },
  "homepage": "https://github.com/Bubblegunn/workproof#readme",
  "dependencies": { "surviving-lines": "^0.1.1" },
  "devDependencies": { "@types/node": "^22.15.0", "typescript": "^5.8.0" }
}
```

`tsconfig.json`: same as proactive-gate (`target ES2022`, `module NodeNext`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `declaration`, `outDir dist`, `rootDir .`, `include ["src/**/*.ts", "test/**/*.ts"]`, `allowJs: true` so the surviving-lines JS import type-checks as any).

`.gitignore`: `node_modules/`, `dist/`, `*.log`, `.DS_Store`, `workproof-report.*`.

`.github/workflows/ci.yml`: the proactive-gate workflow verbatim (npm ci, lint, test on 3 OS x Node 20/22/24).

Run `npm install`.

- [ ] **Step 2: Write the fixture**

```ts
// test/fixture.ts
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

type Who = "ada" | "bob";
const people = {
  ada: { name: "Ada", email: "ada@example.com" },
  bob: { name: "Bob", email: "bob@example.com" },
};

export async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-"));
  const g = (args: string[], who: Who, date: string) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: people[who].name, GIT_AUTHOR_EMAIL: people[who].email,
        GIT_COMMITTER_NAME: people[who].name, GIT_COMMITTER_EMAIL: people[who].email,
        GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date,
      },
    });
  const w = (rel: string, text: string) => writeFile(join(dir, rel), text);
  g(["init", "-q", "-b", "main"], "ada", "2026-01-05T10:00:00Z");
  g(["config", "core.autocrlf", "false"], "ada", "2026-01-05T10:00:00Z");
  g(["remote", "add", "origin", "git@example.com:acme/app.git"], "ada", "2026-01-05T10:00:00Z");
  await mkdir(join(dir, "src")); await mkdir(join(dir, "test")); await mkdir(join(dir, "docs"));
  await w("src/a.ts", Array.from({ length: 10 }, (_, i) => `line ${i}`).join("\n") + "\n");
  await w("src/b.ts", Array.from({ length: 5 }, (_, i) => `b ${i}`).join("\n") + "\n");
  await w("docs/guide.md", "# Guide\n\nHello.\n");
  await w("logo.png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]).toString("binary"));
  g(["add", "."], "ada", "2026-01-05T10:00:00Z");
  g(["commit", "-q", "-m", "ada: initial"], "ada", "2026-01-05T10:00:00Z");
  await w("test/a.test.ts", "test('a', () => {});\ntest('b', () => {});\n");
  g(["add", "."], "ada", "2026-01-12T10:00:00Z");
  g(["commit", "-q", "-m", "ada: tests"], "ada", "2026-01-12T10:00:00Z");
  await w("src/a.ts", ["line 0", "line 1", "line 2", "line 3", "line 4", "line 5", "ada 6", "ada 7", "line 8", "line 9"].join("\n") + "\n");
  g(["add", "."], "ada", "2026-01-19T10:00:00Z");
  g(["commit", "-q", "-m", "ada: tweak"], "ada", "2026-01-19T10:00:00Z");
  g(["tag", "-a", "v1.0.0", "-m", "first"], "ada", "2026-01-19T11:00:00Z");
  await w("src/a.ts", ["line 0", "line 1", "line 2", "line 3", "line 4", "line 5", "bob 6", "bob 7", "bob 8", "bob 9"].join("\n") + "\n");
  await w("src/c.py", Array.from({ length: 6 }, (_, i) => `c ${i}`).join("\n") + "\n");
  g(["add", "."], "bob", "2026-02-02T10:00:00Z");
  g(["commit", "-q", "-m", "bob: rewrite tail, add c"], "bob", "2026-02-02T10:00:00Z");
  g(["mv", "src/b.ts", "src/renamed.ts"], "bob", "2026-02-09T10:00:00Z");
  g(["commit", "-q", "-m", "bob: rename b"], "bob", "2026-02-09T10:00:00Z");
  return dir;
}
```

- [ ] **Step 3: Write the failing git helper test**

```ts
// test/figures.test.ts (first cases)
import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { makeRepo } from "./fixture.js";
import { listCommits, listTags, rootCommit, headSha, remoteUrl } from "../src/git.js";

test("git helpers read commits with files, tags, root and head", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    assert.equal(commits.length, 5);
    assert.equal(commits[0]?.email, "bob@example.com");
    assert.equal(commits[4]?.email, "ada@example.com");
    const initial = commits[4]!;
    assert.equal(initial.files.length, 4);
    assert.equal(initial.files.find((f) => f.path === "logo.png")?.added, null);
    assert.equal(initial.files.find((f) => f.path === "src/a.ts")?.added, 10);
    const rename = commits[0]!;
    assert.ok(rename.files.some((f) => f.path === "src/renamed.ts"));
    const tags = await listTags(dir);
    assert.deepEqual(tags.map((t) => t.name), ["v1.0.0"]);
    assert.equal(tags[0]?.email, "ada@example.com");
    assert.equal((await rootCommit(dir)).length, 40);
    assert.equal((await headSha(dir)).length, 40);
    assert.equal(await remoteUrl(dir), "git@example.com:acme/app.git");
    const windowed = await listCommits(dir, { since: "2026-02-01", until: "2026-02-28" });
    assert.equal(windowed.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test`
Expected: TypeScript error, `Cannot find module '../src/git.js'`.

- [ ] **Step 5: Write src/git.ts**

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

export async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileP("git", args, { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 512 });
  return stdout;
}

export interface FileChange { path: string; added: number | null; deleted: number | null }
export interface Commit { sha: string; email: string; name: string; date: Date; parents: number; files: FileChange[] }

/** All commits reachable from HEAD, newest first, with per-file numstat. One git call. */
export async function listCommits(cwd: string, opts: { since?: string; until?: string }): Promise<Commit[]> {
  const args = ["log", "--numstat", "--format=%x1e%H%x1f%aE%x1f%aN%x1f%aI%x1f%P", "-M"];
  if (opts.since) args.push(`--since=${opts.since}`);
  if (opts.until) args.push(`--until=${opts.until}`);
  const out = await git(args, cwd);
  const commits: Commit[] = [];
  for (const block of out.split("\x1e")) {
    if (!block.trim()) continue;
    const [header, ...rest] = block.split("\n");
    const [sha, email, name, iso, parents] = header!.split("\x1f");
    const files: FileChange[] = [];
    for (const line of rest) {
      if (!line.trim()) continue;
      const [a, d, ...pathParts] = line.split("\t");
      let path = pathParts.join("\t");
      // rename entries look like "old => new" or "dir/{old => new}/file"
      const brace = path.match(/^(.*)\{(.*) => (.*)\}(.*)$/);
      if (brace) path = `${brace[1]}${brace[3]}${brace[4]}`;
      else if (path.includes(" => ")) path = path.split(" => ")[1]!;
      files.push({ path, added: a === "-" ? null : Number(a), deleted: d === "-" ? null : Number(d) });
    }
    commits.push({ sha: sha!, email: email!.toLowerCase(), name: name!, date: new Date(iso!), parents: parents ? parents.trim().split(" ").filter(Boolean).length : 0, files });
  }
  return commits;
}

export interface Tag { name: string; date: Date; email: string }

export async function listTags(cwd: string): Promise<Tag[]> {
  const out = await git(["for-each-ref", "--format=%(refname:short)%09%(creatordate:iso-strict)%09%(taggeremail)%09%(*authoremail)%09%(authoremail)", "refs/tags"], cwd);
  const tags: Tag[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const [name, iso, tagger, tagged, direct] = line.split("\t");
    const email = (tagger || tagged || direct || "").replace(/^<|>$/g, "").toLowerCase();
    tags.push({ name: name!, date: new Date(iso!), email });
  }
  return tags.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const rootCommit = async (cwd: string) => (await git(["rev-list", "--max-parents=0", "HEAD"], cwd)).trim().split("\n").pop()!;
export const headSha = async (cwd: string) => (await git(["rev-parse", "HEAD"], cwd)).trim();
export async function remoteUrl(cwd: string): Promise<string> {
  try { return (await git(["config", "--get", "remote.origin.url"], cwd)).trim(); } catch { return ""; }
}
export async function configuredEmail(cwd: string): Promise<string> {
  try { return (await git(["config", "--get", "user.email"], cwd)).trim().toLowerCase(); } catch { return ""; }
}
```

- [ ] **Step 6: Run the test, commit**

Run: `npm test`
Expected: 1 passing.

```bash
git add -A
git commit -m "feat: git helpers and the two-author test fixture"
```

---

### Task 2: Identity, tenure and commit share

**Files:**
- Create: `src/figures/types.ts`, `src/figures/identity.ts`, `src/figures/commits.ts`
- Test: `test/figures.test.ts`

**Interfaces:**
- Produces:
  - `interface Figure<T> { id: string; title: string; value: T; command: string; limits: string[] }`
  - `resolveIdentity(commits: Commit[], author: string[] | undefined, cwd: string): Promise<{ emails: string[]; names: string[] }>` (author strings match emails or names case-insensitively; when undefined, uses `configuredEmail`)
  - `isMine(c: Commit, id: Identity): boolean`
  - `tenure(commits, id, override: { since?: string; until?: string }): Figure<{ first: string; last: string; days: number }>`
  - `commitShare(commits, id): Figure<{ author: number; total: number; share: number }>` over non-merge commits already windowed to tenure by the caller.

- [ ] **Step 1: Write the failing tests**

```ts
import { resolveIdentity, isMine } from "../src/figures/identity.js";
import { tenure, commitShare } from "../src/figures/commits.js";

test("identity resolves by email or name, tenure spans first to last commit, commit share excludes merges", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["Ada"], dir);
    assert.deepEqual(ada.emails, ["ada@example.com"]);
    const bob = await resolveIdentity(commits, ["bob@example.com"], dir);
    assert.deepEqual(bob.names, ["Bob"]);
    const t = tenure(commits, ada, {});
    assert.equal(t.value.first, "2026-01-05");
    assert.equal(t.value.last, "2026-01-19");
    assert.equal(t.value.days, 15);
    const inTenure = commits.filter((c) => c.date >= new Date("2026-01-05") && c.date <= new Date("2026-01-19T23:59:59Z"));
    const share = commitShare(inTenure, ada);
    assert.deepEqual(share.value, { author: 3, total: 3, share: 1 });
    const all = commitShare(commits, ada);
    assert.equal(all.value.total, 5);
    assert.ok(Math.abs(all.value.share - 0.6) < 1e-9);
    assert.match(share.command, /git log/);
    assert.ok(share.limits.length >= 1);
    assert.equal(isMine(commits[0]!, ada), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: `Cannot find module '../src/figures/identity.js'`.

- [ ] **Step 3: Implement**

`src/figures/types.ts`:

```ts
export interface Figure<T> { id: string; title: string; value: T; command: string; limits: string[] }
export interface Identity { emails: string[]; names: string[] }
```

`src/figures/identity.ts`:

```ts
import type { Commit } from "../git.js";
import { configuredEmail } from "../git.js";
import type { Identity } from "./types.js";

export async function resolveIdentity(commits: Commit[], author: string[] | undefined, cwd: string): Promise<Identity> {
  const wanted = (author && author.length ? author : [await configuredEmail(cwd)]).map((a) => a.toLowerCase()).filter(Boolean);
  if (!wanted.length) throw new Error("no author given and git config user.email is empty; pass --author");
  const emails = new Set<string>();
  const names = new Set<string>();
  for (const c of commits) {
    if (wanted.includes(c.email) || wanted.includes(c.name.toLowerCase())) { emails.add(c.email); names.add(c.name); }
  }
  if (!emails.size) throw new Error(`no commits by ${wanted.join(", ")} in this repository`);
  return { emails: [...emails].sort(), names: [...names].sort() };
}

export const isMine = (c: Commit, id: Identity) => id.emails.includes(c.email);
```

`src/figures/commits.ts`:

```ts
import type { Commit } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

const day = (d: Date) => d.toISOString().slice(0, 10);

export function tenure(commits: Commit[], id: Identity, override: { since?: string; until?: string }): Figure<{ first: string; last: string; days: number }> {
  const mine = commits.filter((c) => isMine(c, id)).map((c) => c.date).sort((a, b) => a.getTime() - b.getTime());
  const first = override.since ? new Date(override.since) : mine[0]!;
  const last = override.until ? new Date(override.until) : mine[mine.length - 1]!;
  const days = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  return {
    id: "tenure",
    title: "Tenure window",
    value: { first: day(first), last: day(last), days },
    command: override.since || override.until ? "--since/--until as given" : "git log --format=%aI --author=<identity>; first and last commit dates",
    limits: ["Tenure is measured from commits, so work before the first commit or after the last is invisible."],
  };
}

export function commitShare(commits: Commit[], id: Identity): Figure<{ author: number; total: number; share: number }> {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  const author = nonMerge.filter((c) => isMine(c, id)).length;
  const total = nonMerge.length;
  return {
    id: "commitShare",
    title: "Share of commits in tenure",
    value: { author, total, share: total ? author / total : 0 },
    command: "git log --no-merges --format=%aE --since=<first> --until=<last>; count by author over all",
    limits: ["Commits measure activity, not what survived. One commit can be a typo or a subsystem.", "Squash-merged branches count once regardless of size."],
  };
}
```

- [ ] **Step 4: Run tests, commit**

Run: `npm test`
Expected: 2 passing.

```bash
git add -A && git commit -m "feat: identity resolution, tenure window and commit share"
```

---

### Task 3: Cadence

**Files:**
- Create: `src/figures/cadence.ts`
- Test: `test/figures.test.ts`

**Interfaces:**
- Produces: `cadence(commits: Commit[], tags: Tag[], id: Identity, window: { first: string; last: string }): Figure<{ activeWeeks: number; weeksInTenure: number; commitsPerActiveWeek: number; longestStreakWeeks: number; tagsInTenure: number; authorTags: number }>`
- ISO week key: `isoWeek(d: Date): string` returning `YYYY-Www`.

- [ ] **Step 1: Failing test**

```ts
import { cadence, isoWeek } from "../src/figures/cadence.js";

test("cadence counts active weeks, streaks and tags in tenure", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const tags = await listTags(dir);
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const c = cadence(commits, tags, ada, { first: "2026-01-05", last: "2026-01-19" });
    assert.equal(c.value.activeWeeks, 3);
    assert.equal(c.value.weeksInTenure, 3);
    assert.equal(c.value.commitsPerActiveWeek, 1);
    assert.equal(c.value.longestStreakWeeks, 3);
    assert.equal(c.value.tagsInTenure, 1);
    assert.equal(c.value.authorTags, 1);
    assert.equal(isoWeek(new Date("2026-01-05T10:00:00Z")), "2026-W02");
    assert.equal(isoWeek(new Date("2026-01-04T10:00:00Z")), "2026-W01");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`. Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// src/figures/cadence.ts
import type { Commit, Tag } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weeksBetween(first: string, last: string): string[] {
  const out: string[] = [];
  const d = new Date(first + "T00:00:00Z");
  const end = new Date(last + "T00:00:00Z");
  while (d <= end) { const w = isoWeek(d); if (out[out.length - 1] !== w) out.push(w); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}

export function cadence(commits: Commit[], tags: Tag[], id: Identity, window: { first: string; last: string }) {
  const mine = commits.filter((c) => isMine(c, id) && c.parents <= 1);
  const perWeek = new Map<string, number>();
  for (const c of mine) perWeek.set(isoWeek(c.date), (perWeek.get(isoWeek(c.date)) ?? 0) + 1);
  const weeks = weeksBetween(window.first, window.last);
  let streak = 0, longest = 0;
  for (const w of weeks) { if (perWeek.has(w)) { streak++; longest = Math.max(longest, streak); } else streak = 0; }
  const activeWeeks = perWeek.size;
  const start = new Date(window.first + "T00:00:00Z"), end = new Date(window.last + "T23:59:59Z");
  const inTenure = tags.filter((t) => t.date >= start && t.date <= end);
  const value = {
    activeWeeks,
    weeksInTenure: weeks.length,
    commitsPerActiveWeek: activeWeeks ? Math.round((mine.length / activeWeeks) * 10) / 10 : 0,
    longestStreakWeeks: longest,
    tagsInTenure: inTenure.length,
    authorTags: inTenure.filter((t) => id.emails.includes(t.email)).length,
  };
  const figure: Figure<typeof value> = {
    id: "cadence",
    title: "Cadence",
    value,
    command: "git log --no-merges --format=%aI --author=<identity>; ISO weeks; git for-each-ref refs/tags with creatordate",
    limits: ["A week with one commit and a week with forty both count as active.", "Tags are releases only if the project tags releases."],
  };
  return figure;
}
```

- [ ] **Step 4: Run tests, commit**

Run: `npm test`. Expected: 3 passing.
`git add -A && git commit -m "feat: cadence figure"`

---

### Task 4: Footprint, tests and docs

**Files:**
- Create: `src/figures/footprint.ts`
- Test: `test/figures.test.ts`

**Interfaces:**
- Produces:
  - `footprint(commits: Commit[], id: Identity, opts: { depth: number; threshold: number; minCommits: number }): Figure<{ filesTouched: number; ownedDirectories: { path: string; author: number; total: number; share: number }[]; languages: { language: string; lines: number; share: number }[] }>`
  - `testsAndDocs(commits: Commit[], id: Identity): Figure<{ testChangesAuthor: number; testChangesTotal: number; testShare: number; docsAuthored: number }>`
  - `languageOf(path: string): string | null` (extension map; null for unknown/binary)

- [ ] **Step 1: Failing test**

```ts
import { footprint, testsAndDocs, languageOf } from "../src/figures/footprint.js";

test("footprint counts files, owned directories and languages; tests and docs are recognised", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const f = footprint(commits, ada, { depth: 1, threshold: 0.5, minCommits: 1 });
    assert.equal(f.value.filesTouched, 5); // src/a.ts, src/b.ts, docs/guide.md, logo.png, test/a.test.ts
    const src = f.value.ownedDirectories.find((d) => d.path === "src");
    assert.ok(src && src.total === 5 && src.author === 3);
    assert.equal(f.value.languages[0]?.language, "TypeScript");
    const td = testsAndDocs(commits, ada);
    assert.equal(td.value.testChangesAuthor, 1);
    assert.equal(td.value.testChangesTotal, 1);
    assert.equal(td.value.docsAuthored, 1);
    assert.equal(languageOf("x/y.tsx"), "TypeScript");
    assert.equal(languageOf("a.cs"), "C#");
    assert.equal(languageOf("a.png"), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`. Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// src/figures/footprint.ts
import type { Commit } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

const LANG: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", cs: "C#", go: "Go", rs: "Rust", java: "Java", kt: "Kotlin", swift: "Swift", rb: "Ruby", php: "PHP",
  c: "C", h: "C", cpp: "C++", hpp: "C++", css: "CSS", scss: "CSS", html: "HTML", vue: "Vue", svelte: "Svelte",
  sql: "SQL", sh: "Shell", yml: "YAML", yaml: "YAML", json: "JSON", md: "Markdown", mdx: "Markdown", tf: "Terraform", dart: "Dart",
};

export function languageOf(path: string): string | null {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return path.includes(".") ? LANG[ext] ?? null : null;
}

const isTest = (p: string) => /(^|\/)(__tests__|tests?|spec|e2e)\//i.test(p) || /\.(test|spec)\.[a-z]+$/i.test(p);
const isDoc = (p: string) => /\.(md|mdx|rst)$/i.test(p);

function dirAt(path: string, depth: number): string | null {
  const parts = path.split("/");
  if (parts.length <= 1) return null;
  return parts.slice(0, Math.min(depth, parts.length - 1)).join("/");
}

export function footprint(commits: Commit[], id: Identity, opts: { depth: number; threshold: number; minCommits: number }) {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  const touched = new Set<string>();
  const dirs = new Map<string, { author: number; total: number }>();
  const langLines = new Map<string, number>();
  for (const c of nonMerge) {
    const mine = isMine(c, id);
    const seenDirs = new Set<string>();
    for (const f of c.files) {
      if (mine) {
        touched.add(f.path);
        const lang = languageOf(f.path);
        if (lang && f.added !== null) langLines.set(lang, (langLines.get(lang) ?? 0) + f.added);
      }
      const d = dirAt(f.path, opts.depth);
      if (d) seenDirs.add(d);
    }
    for (const d of seenDirs) {
      const e = dirs.get(d) ?? { author: 0, total: 0 };
      e.total++; if (mine) e.author++;
      dirs.set(d, e);
    }
  }
  const ownedDirectories = [...dirs.entries()]
    .map(([path, e]) => ({ path, author: e.author, total: e.total, share: e.total ? e.author / e.total : 0 }))
    .filter((d) => d.total >= opts.minCommits && d.share >= opts.threshold)
    .sort((a, b) => b.share - a.share || b.total - a.total);
  const totalLines = [...langLines.values()].reduce((s, n) => s + n, 0);
  const languages = [...langLines.entries()].map(([language, lines]) => ({ language, lines, share: totalLines ? lines / totalLines : 0 })).sort((a, b) => b.lines - a.lines).slice(0, 8);
  const value = { filesTouched: touched.size, ownedDirectories, languages };
  const figure: Figure<typeof value> = {
    id: "footprint",
    title: "Footprint",
    value,
    command: `git log --no-merges --numstat -M; directories at depth ${opts.depth} where the author's commit share is at least ${Math.round(opts.threshold * 100)}% over at least ${opts.minCommits} commits; languages by lines added, extension map`,
    limits: ["Lines added include generated and vendored files unless they were excluded upstream.", "A directory owned by commit count may still contain other people's surviving code; see the blame figure."],
  };
  return figure;
}

export function testsAndDocs(commits: Commit[], id: Identity) {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  let testChangesAuthor = 0, testChangesTotal = 0;
  const docs = new Set<string>();
  for (const c of nonMerge) {
    const mine = isMine(c, id);
    for (const f of c.files) {
      if (isTest(f.path)) { testChangesTotal++; if (mine) testChangesAuthor++; }
      if (mine && isDoc(f.path)) docs.add(f.path);
    }
  }
  const value = { testChangesAuthor, testChangesTotal, testShare: testChangesTotal ? testChangesAuthor / testChangesTotal : 0, docsAuthored: docs.size };
  const figure: Figure<typeof value> = {
    id: "testsAndDocs",
    title: "Tests and documentation",
    value,
    command: "git log --no-merges --numstat; test paths match __tests__/, test/, tests/, spec/, e2e/ or *.test.* / *.spec.*; docs are .md, .mdx, .rst",
    limits: ["Test file changes are counted, not test cases or coverage.", "A README edit and a design document count the same."],
  };
  return figure;
}
```

- [ ] **Step 4: Run tests, commit**

Run: `npm test`. Expected: 4 passing.
`git add -A && git commit -m "feat: footprint, tests and docs figures"`

---

### Task 5: Surviving lines via the surviving-lines package

**Files:**
- Create: `src/figures/surviving.ts`
- Test: `test/figures.test.ts`

**Interfaces:**
- Consumes: `surviving-lines` exports `analyse(o)` and `parseArgs(argv)` (JS, typed as any).
- Produces: `survivingLines(cwd: string, id: Identity, opts: { sample: number; version: string }): Promise<Figure<{ lines: number; linesAttributed: number; share: number; filesSampled: number; filesTotal: number; sample: number }>>`

- [ ] **Step 1: Failing test**

```ts
import { survivingLines } from "../src/figures/surviving.js";

test("surviving lines come from surviving-lines and follow the identity", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const s = await survivingLines(dir, ada, { sample: 1, version: "test" });
    // a.ts: 6 Ada + 4 Bob; renamed.ts: 5 Ada; c.py: 6 Bob; test: 2 Ada; docs: 3 Ada
    assert.equal(s.value.linesAttributed, 26);
    assert.equal(s.value.lines, 16);
    assert.ok(Math.abs(s.value.share - 16 / 26) < 1e-9);
    assert.equal(s.value.filesTotal, 5);
    assert.match(s.command, /git blame -w -M/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`. Expected: module not found.

- [ ] **Step 3: Implement**

```ts
// src/figures/surviving.ts
import type { Figure, Identity } from "./types.js";
// surviving-lines ships plain ESM JavaScript; treat its exports as untyped.
// @ts-ignore
import { analyse, parseArgs } from "surviving-lines/bin/surviving-lines.js";

export async function survivingLines(cwd: string, id: Identity, opts: { sample: number; version: string }) {
  const result = await analyse(parseArgs(["--cwd", cwd, "--sample", String(opts.sample)]));
  const mine = result.authors.filter((a: { mail: string }) => id.emails.includes(a.mail));
  const lines = mine.reduce((s: number, a: { lines: number }) => s + a.lines, 0);
  const value = {
    lines,
    linesAttributed: result.sample.linesAttributed as number,
    share: result.sample.linesAttributed ? lines / result.sample.linesAttributed : 0,
    filesSampled: result.sample.filesSampled as number,
    filesTotal: result.sample.filesTotal as number,
    sample: opts.sample,
  };
  const figure: Figure<typeof value> = {
    id: "survivingLines",
    title: "Surviving lines at HEAD",
    value,
    command: `surviving-lines ${opts.version}: git blame -w -M --line-porcelain over a deterministic 1-in-${opts.sample} file sample (FNV-1a on path)`,
    limits: ["Survivorship, not merit: deleted-on-purpose code counts for nobody.", "Whitespace and moved lines keep their original author; copied lines do not unless --copies is used upstream."],
  };
  return figure;
}
```

Add to `package.json` exports check: surviving-lines exposes `bin/surviving-lines.js` in `files`, so the deep import resolves; if `exports` blocks it in a future version, pin `^0.1.1`.

- [ ] **Step 4: Run tests, commit**

Run: `npm test`. Expected: 5 passing.
`git add -A && git commit -m "feat: surviving lines figure through the surviving-lines package"`

---

### Task 6: analyse(), report rendering, hashing, fingerprint

**Files:**
- Create: `src/analyse.ts`, `src/report.ts`, `src/index.ts`
- Test: `test/report.test.ts`

**Interfaces:**
- Produces:
  - `interface Params { author?: string[]; since?: string; until?: string; sample?: number; depth: number; threshold: number; minCommits: number; paths: boolean; emails: boolean }`
  - `analyseRepo(cwd: string, params: Params): Promise<RepoReport>` where `RepoReport = { name: string; head: string; fingerprint: string; identity: { emails: string[]; names: string[]; count: number }; figures: Figure<any>[] }`
  - `buildReport(repos: RepoReport[], params: Params, meta: { version: string; generatedAt: string }): Report` with `Report = { tool: "workproof"; version; generatedAt; params; repositories; hash }`, hash = sha256 over canonical JSON of `{ params, repositories }` with emails removed when `params.emails` is false.
  - `renderMarkdown(report: Report, narrative?: string): string`
  - `fingerprint(root: string, remote: string): string` = sha256 of `${root}\n${normalised remote}` where normalisation lowercases, strips `.git`, converts `git@host:path` to `host/path`, strips protocol.

- [ ] **Step 1: Failing test**

```ts
// test/report.test.ts
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
    assert.ok(!text.includes("src/a.ts"), "paths must not leak");
    const md = renderMarkdown(report, "Narrative here.");
    assert.match(md, /# Engineering report/);
    assert.match(md, /Surviving lines at HEAD/);
    assert.match(md, /Generated narrative \(not verified\)/);
    assert.match(md, /What this cannot show/);
    const withEmails = buildReport([await analyseRepo(dir, { ...params, emails: true })], { ...params, emails: true }, { version: "0.1.0", generatedAt: "x" });
    assert.ok(JSON.stringify(withEmails).includes("ada@example.com"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`. Expected: module not found for `../src/index.js`.

- [ ] **Step 3: Implement analyse.ts**

```ts
// src/analyse.ts
import { createHash } from "node:crypto";
import { basename } from "node:path";
import { createRequire } from "node:module";
import { listCommits, listTags, rootCommit, headSha, remoteUrl } from "./git.js";
import { resolveIdentity } from "./figures/identity.js";
import { tenure, commitShare } from "./figures/commits.js";
import { cadence } from "./figures/cadence.js";
import { footprint, testsAndDocs } from "./figures/footprint.js";
import { survivingLines } from "./figures/surviving.js";
import type { Figure } from "./figures/types.js";

export interface Params { author?: string[]; since?: string; until?: string; sample?: number; depth: number; threshold: number; minCommits: number; paths: boolean; emails: boolean }
export interface RepoReport { name: string; head: string; fingerprint: string; identity: { emails: string[]; names: string[]; count: number }; figures: Figure<any>[] }

export function fingerprint(root: string, remote: string): string {
  let r = remote.trim().toLowerCase().replace(/\.git$/, "");
  r = r.replace(/^[a-z+]+:\/\//, "").replace(/^git@([^:]+):/, "$1/");
  return createHash("sha256").update(`${root}\n${r}`).digest("hex");
}

const require = createRequire(import.meta.url);
const survivingVersion = (): string => { try { return require("surviving-lines/package.json").version; } catch { return "unknown"; } };

export async function analyseRepo(cwd: string, params: Params): Promise<RepoReport> {
  const all = await listCommits(cwd, {});
  const id = await resolveIdentity(all, params.author, cwd);
  const t = tenure(all, id, { ...(params.since ? { since: params.since } : {}), ...(params.until ? { until: params.until } : {}) });
  const start = new Date(t.value.first + "T00:00:00Z"), end = new Date(t.value.last + "T23:59:59Z");
  const inTenure = all.filter((c) => c.date >= start && c.date <= end);
  const tags = await listTags(cwd);
  const sample = params.sample ?? (all.reduce((n, c) => n + c.files.length, 0) > 50000 ? 7 : 1);
  const fp = footprint(inTenure, id, { depth: params.depth, threshold: params.threshold, minCommits: params.minCommits });
  if (!params.paths) fp.value = { ...fp.value, ownedDirectories: fp.value.ownedDirectories.map((d) => ({ ...d, path: "(hidden; run with --paths)" })) };
  const figures: Figure<any>[] = [
    t,
    commitShare(inTenure, id),
    cadence(inTenure, tags, id, { first: t.value.first, last: t.value.last }),
    fp,
    testsAndDocs(inTenure, id),
    await survivingLines(cwd, id, { sample, version: survivingVersion() }),
  ];
  return {
    name: basename(cwd),
    head: await headSha(cwd),
    fingerprint: fingerprint(await rootCommit(cwd), await remoteUrl(cwd)),
    identity: { emails: params.emails ? id.emails : [], names: id.names, count: id.emails.length },
    figures,
  };
}
```

- [ ] **Step 4: Implement report.ts and index.ts**

```ts
// src/report.ts
import { createHash } from "node:crypto";
import type { Params, RepoReport } from "./analyse.js";

export interface Report { tool: "workproof"; version: string; generatedAt: string; params: Params; repositories: RepoReport[]; hash: string }

const canonical = (v: unknown): string => JSON.stringify(v, (_k, val) => (val && typeof val === "object" && !Array.isArray(val) ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, (val as any)[k]])) : val));

export function buildReport(repositories: RepoReport[], params: Params, meta: { version: string; generatedAt: string }): Report {
  const hash = createHash("sha256").update(canonical({ params, repositories })).digest("hex");
  return { tool: "workproof", version: meta.version, generatedAt: meta.generatedAt, params, repositories, hash };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const n = (x: number) => x.toLocaleString("en-US");

function figureLines(f: RepoReport["figures"][number]): string[] {
  const v = f.value;
  switch (f.id) {
    case "tenure": return [`${v.first} to ${v.last} (${n(v.days)} days)`];
    case "commitShare": return [`${n(v.author)} of ${n(v.total)} non-merge commits, ${pct(v.share)}`];
    case "cadence": return [`${v.activeWeeks} active weeks of ${v.weeksInTenure}, ${v.commitsPerActiveWeek} commits per active week, longest streak ${v.longestStreakWeeks} weeks`, `${v.authorTags} of ${v.tagsInTenure} release tags in tenure`];
    case "footprint": return [
      `${n(v.filesTouched)} files touched`,
      `${v.ownedDirectories.length} directories with a commit share at or above the threshold` + (v.ownedDirectories.length && v.ownedDirectories[0].path.startsWith("(hidden") ? " (paths hidden)" : ""),
      ...v.ownedDirectories.filter((d: any) => !d.path.startsWith("(hidden")).slice(0, 12).map((d: any) => `  ${d.path}: ${d.author} of ${d.total} commits, ${pct(d.share)}`),
      "languages by lines added: " + v.languages.map((l: any) => `${l.language} ${pct(l.share)}`).join(", "),
    ];
    case "testsAndDocs": return [`${n(v.testChangesAuthor)} of ${n(v.testChangesTotal)} test-file changes, ${pct(v.testShare)}`, `${n(v.docsAuthored)} documents authored`];
    case "survivingLines": return [`${n(v.lines)} of ${n(v.linesAttributed)} surviving lines, ${pct(v.share)} (files ${v.filesSampled}/${v.filesTotal}, sample 1 in ${v.sample})`];
    default: return [JSON.stringify(v)];
  }
}

export function renderMarkdown(report: Report, narrative?: string): string {
  const out: string[] = [`# Engineering report`, ``, `Generated by workproof ${report.version} on ${report.generatedAt}. Every figure below names the command that produced it and what it cannot show. Verify with \`npx workproof verify <this report>.json\` in the same repository.`, ``];
  for (const repo of report.repositories) {
    out.push(`## ${repo.name}`, ``, `HEAD \`${repo.head.slice(0, 12)}\` · fingerprint \`${repo.fingerprint.slice(0, 16)}\` · identities: ${repo.identity.names.join(", ")}${repo.identity.emails.length ? ` (${repo.identity.emails.join(", ")})` : ""}`, ``);
    for (const f of repo.figures) {
      out.push(`### ${f.title}`, ``);
      for (const line of figureLines(f)) out.push(line.startsWith("  ") ? `- ${line.trim()}` : line);
      out.push(``, `How: \`${f.command}\``, ``);
      out.push(`What this cannot show: ${f.limits.join(" ")}`, ``);
    }
  }
  out.push(`## Integrity`, ``, `Report hash \`${report.hash}\` (sha256 of parameters and figures). Repository fingerprints are hashes of the root commit and remote; they identify a repository without naming it.`, ``);
  if (narrative) out.push(`## Generated narrative (not verified)`, ``, `The paragraph below was produced by a language model from the figures above and is not part of the hash.`, ``, narrative.trim(), ``);
  return out.join("\n");
}
```

```ts
// src/index.ts
export { analyseRepo, fingerprint } from "./analyse.js";
export type { Params, RepoReport } from "./analyse.js";
export { buildReport, renderMarkdown } from "./report.js";
export type { Report } from "./report.js";
export type { Figure, Identity } from "./figures/types.js";
```

- [ ] **Step 5: Run tests, commit**

Run: `npm test`. Expected: 7 passing.
`git add -A && git commit -m "feat: analyse, report rendering, hash and fingerprint"`

---

### Task 7: verify, narrate, CLI

**Files:**
- Create: `src/verify.ts`, `src/narrate.ts`, `src/cli.ts`
- Modify: `src/index.ts` (export `verifyReport`, `narrate`)
- Test: `test/cli.test.ts`

**Interfaces:**
- Produces:
  - `verifyReport(report: Report, repoDirs: string[]): Promise<{ ok: boolean; rows: { repo: string; figure: string; match: boolean; expected: string; actual: string }[]; headMoved: string[] }>`
  - `narrate(report: Report, env: { url: string; key: string; model: string }, fetchImpl?: typeof fetch): Promise<string>`
  - CLI: `workproof [options] [--repo <dir>]...` and `workproof verify <report.json> [--repo <dir>]...`

- [ ] **Step 1: Failing tests**

```ts
// test/cli.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { rm, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { makeRepo } from "./fixture.js";
import { analyseRepo, buildReport, verifyReport, narrate } from "../src/index.js";

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
    execFileSync("git", ["-c", "user.name=Bob", "-c", "user.email=bob@example.com", "commit", "-q", "-m", "bob: more"], { cwd: dir, env: { ...process.env, GIT_AUTHOR_DATE: "2026-03-01T10:00:00Z", GIT_COMMITTER_DATE: "2026-03-01T10:00:00Z" } });
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
    req.on("end", () => { seen.push(body); res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ choices: [{ message: { content: "Ada wrote most of it." } }] })); });
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as { port: number }).port;
  const dir = await makeRepo();
  try {
    const report = buildReport([await analyseRepo(dir, params)], params, { version: "0.1.0", generatedAt: "x" });
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
    assert.match(out, /wrote .*r\.md and .*r\.json/);
    const json = JSON.parse(await readFile(join(dir, "r.json"), "utf8"));
    assert.equal(json.tool, "workproof");
    const v = execFileSync("node", [cli, "verify", join(dir, "r.json"), "--repo", dir], { encoding: "utf8" });
    assert.match(v, /all figures reproduce/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`. Expected: module not found for verify/narrate exports.

- [ ] **Step 3: Implement verify.ts and narrate.ts**

```ts
// src/verify.ts
import { analyseRepo } from "./analyse.js";
import { headSha } from "./git.js";
import type { Report } from "./report.js";

const show = (v: unknown) => JSON.stringify(v);

export async function verifyReport(report: Report, repoDirs: string[]) {
  const rows: { repo: string; figure: string; match: boolean; expected: string; actual: string }[] = [];
  const headMoved: string[] = [];
  for (const [i, expected] of report.repositories.entries()) {
    const dir = repoDirs[i] ?? repoDirs[0] ?? process.cwd();
    const head = await headSha(dir);
    if (head !== expected.head) headMoved.push(`${expected.name}: report at ${expected.head.slice(0, 12)}, repository at ${head.slice(0, 12)}`);
    const actual = await analyseRepo(dir, report.params);
    for (const f of expected.figures) {
      const a = actual.figures.find((x) => x.id === f.id);
      const e = show(f.value), g = show(a?.value);
      rows.push({ repo: expected.name, figure: f.id, match: e === g, expected: e, actual: g });
    }
  }
  return { ok: rows.every((r) => r.match) && headMoved.length === 0, rows, headMoved };
}
```

```ts
// src/narrate.ts
import type { Report } from "./report.js";

export async function narrate(report: Report, env: { url: string; key: string; model: string }, fetchImpl: typeof fetch = fetch): Promise<string> {
  const figures = report.repositories.map((r) => ({ repository: r.name, figures: r.figures.map((f) => ({ id: f.id, title: f.title, value: f.value })) }));
  const prompt = `You are writing a short, sober paragraph for an engineering résumé. Use only the numbers below; add nothing, round nothing up, and say "commit share" and "surviving lines" as separate things. No adjectives like "impressive". Figures:\n${JSON.stringify(figures)}`;
  const anthropic = /anthropic\.com/.test(env.url);
  const body = anthropic
    ? { model: env.model, max_tokens: 400, messages: [{ role: "user", content: prompt }] }
    : { model: env.model, messages: [{ role: "user", content: prompt }], temperature: 0.2 };
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (anthropic) { headers["x-api-key"] = env.key; headers["anthropic-version"] = "2023-06-01"; } else headers.authorization = `Bearer ${env.key}`;
  const res = await fetchImpl(env.url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`narrative request failed: ${res.status} ${await res.text()}`);
  const data: any = await res.json();
  const text = anthropic ? data.content?.[0]?.text : data.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("narrative response had no text");
  return text;
}
```

Add to `src/index.ts`: `export { verifyReport } from "./verify.js"; export { narrate } from "./narrate.js";`

- [ ] **Step 4: Implement cli.ts**

```ts
#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { analyseRepo, buildReport, renderMarkdown, verifyReport, narrate } from "./index.js";
import type { Params, Report } from "./index.js";

const HELP = `usage: workproof [options] [--repo <dir>]...
       workproof verify <report.json> [--repo <dir>]...

Turn a git repository into a verifiable engineering report for one author, without showing code.

  --author <email|name>  identity to report on (repeatable; default: git config user.email)
  --repo <dir>           repository to analyse (repeatable; default: current directory)
  --since / --until      override the tenure window (dates git understands)
  --sample <n>           blame every n-th file (default: 1, or 7 for very large repositories)
  --depth <n>            directory depth for ownership (default: 2)
  --paths                include directory paths in the report (off by default)
  --emails               include author emails in the report (off by default)
  --narrate              append a model-written paragraph; needs WORKPROOF_API_URL, WORKPROOF_API_KEY, WORKPROOF_MODEL
  --out <basename>       output basename (default: workproof-report)
  --json                 print the JSON to stdout instead of writing files
  -h, --help             this text`;

function parse(argv: string[]) {
  const params: Params = { depth: 2, threshold: 0.5, minCommits: 5, paths: false, emails: false };
  const repos: string[] = [];
  let out = "workproof-report", json = false, doNarrate = false, verifyFile: string | undefined;
  const authors: string[] = [];
  if (argv[0] === "verify") { verifyFile = argv[1]; argv = argv.slice(2); if (!verifyFile) throw new Error("verify needs a report.json"); }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { const v = argv[++i]; if (v === undefined) throw new Error(`${a} needs a value`); return v; };
    if (a === "--author") authors.push(next());
    else if (a === "--repo") repos.push(resolve(next()));
    else if (a === "--since") params.since = next();
    else if (a === "--until") params.until = next();
    else if (a === "--sample") params.sample = Number(next());
    else if (a === "--depth") params.depth = Number(next());
    else if (a === "--paths") params.paths = true;
    else if (a === "--emails") params.emails = true;
    else if (a === "--narrate") doNarrate = true;
    else if (a === "--out") out = next();
    else if (a === "--json") json = true;
    else if (a === "-h" || a === "--help") { console.log(HELP); process.exit(0); }
    else throw new Error(`unknown option ${a} (see --help)`);
  }
  if (authors.length) params.author = authors;
  if (!repos.length) repos.push(process.cwd());
  return { params, repos, out, json, doNarrate, verifyFile };
}

async function main() {
  const { params, repos, out, json, doNarrate, verifyFile } = parse(process.argv.slice(2));
  if (verifyFile) {
    const report = JSON.parse(await readFile(verifyFile, "utf8")) as Report;
    const result = await verifyReport(report, repos);
    for (const h of result.headMoved) console.log(`HEAD moved: ${h}`);
    for (const r of result.rows) if (!r.match) console.log(`mismatch ${r.repo}/${r.figure}\n  report:     ${r.expected}\n  repository: ${r.actual}`);
    console.log(result.ok ? "all figures reproduce" : `${result.rows.filter((r) => !r.match).length} figures differ`);
    process.exit(result.ok ? 0 : 1);
  }
  const version = createRequire(import.meta.url)("../../package.json").version as string;
  const repositories = [];
  for (const dir of repos) repositories.push(await analyseRepo(dir, params));
  const report = buildReport(repositories, params, { version, generatedAt: new Date().toISOString() });
  let narrative: string | undefined;
  if (doNarrate) {
    const url = process.env.WORKPROOF_API_URL, key = process.env.WORKPROOF_API_KEY, model = process.env.WORKPROOF_MODEL;
    if (!url || !key || !model) throw new Error("--narrate needs WORKPROOF_API_URL, WORKPROOF_API_KEY and WORKPROOF_MODEL");
    narrative = await narrate(report, { url, key, model });
  }
  if (json) { console.log(JSON.stringify(report, null, 2)); return; }
  await writeFile(`${out}.json`, JSON.stringify(report, null, 2));
  await writeFile(`${out}.md`, renderMarkdown(report, narrative));
  console.log(`wrote ${out}.md and ${out}.json`);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (entry === import.meta.url || entry.endsWith("/workproof")) {
  main().catch((err) => { console.error(err instanceof Error ? err.message : String(err)); process.exit(1); });
}
```

- [ ] **Step 5: Run tests, commit**

Run: `npm test`. Expected: 10 passing.
`git add -A && git commit -m "feat: verify, optional narrative, and the CLI"`

---

### Task 8: Real run, README, changelog, publish

**Files:**
- Create: `README.md`, `CHANGELOG.md`, `assets/wordmark.svg`

**Interfaces:**
- Consumes: the CLI from Task 7. The README's example is the real output of `node dist/src/cli.js --repo /Users/efe/Desktop/portfolio --author efegenc95@gmail.com --paths --json` trimmed to the Markdown render.

- [ ] **Step 1: Run on a real repository and keep the Markdown**

Run: `node dist/src/cli.js --repo /Users/efe/Desktop/portfolio --author efegenc95@gmail.com --out /tmp/wp-portfolio && cat /tmp/wp-portfolio.md`
Expected: a report with six figures and no file paths.

- [ ] **Step 2: Write README.md**

Structure, in this order, same visual language as proactive-gate and product-engineer: wordmark SVG (hand-written, `workproof` with the blue underline under `proof`); the hook line "Your best work is in private repos. Prove it anyway."; badges (npm, stars, MIT); a 30-second section (`npx workproof`, then `npx workproof verify workproof-report.json`); the real example report (from Step 1, unedited except the identity line); "What it measures" (six figures, one line each, with the limit); "How verification works" (HEAD, fingerprint, hash, verify table, what a hiring manager needs: the repository and the report); "Privacy" (no code, no paths by default, no emails by default, narrative optional and marked); "For candidates / For hiring managers / For visa and immigration evidence" (three short paragraphs; the last says it was built for a UK Global Talent application and that the report is evidence, not an endorsement); "What it does not do"; "Where it comes from" (link to the ownership essay and to surviving-lines); "Development"; MIT.

- [ ] **Step 3: CHANGELOG.md**

```markdown
# Changelog

## 0.1.0 (2026-09-11)

First release: six figures (tenure, commit share, cadence, footprint, tests and docs, surviving lines), Markdown and JSON reports, sha256 hash and repository fingerprint, verify, optional model narrative, multi-repository reports.
```

- [ ] **Step 4: Push, CI, publish**

```bash
git add -A && git commit -m "docs: README with a real report, changelog, wordmark"
gh repo create Bubblegunn/workproof --public --source . --description "Your best work is in private repos. Prove it anyway. A verifiable engineering report from git, without showing code." --push
git tag v0.1.0 && git push origin --tags
gh run list --repo Bubblegunn/workproof --limit 1
npm publish --access public
```

Expected: CI green on nine legs; `npm view workproof version` prints `0.1.0`.
