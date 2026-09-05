import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { makeRepo } from "./fixture.js";
import { execFileSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyseRepo } from "../src/analyse.js";
import { listCommits, listTags, rootCommit, headSha, remoteUrl, gitVersion, checkAttr, PINNED_CONFIG } from "../src/git.js";

test("git helpers read commits with files, tags, root and head", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    assert.equal(commits.length, 10);
    assert.equal(commits[0]?.email, "bob@example.com");
    assert.equal(commits[9]?.email, "ada@example.com");
    const initial = commits[9]!;
    assert.equal(initial.files.length, 4);
    assert.equal(initial.files.find((f) => f.path === "logo.png")?.added, null);
    assert.equal(initial.files.find((f) => f.path === "src/a.ts")?.added, 10);
    const rename = commits[5]!;
    assert.ok(rename.files.some((f) => f.path === "src/renamed.ts"));
    const tags = await listTags(dir);
    assert.deepEqual(tags.map((t) => t.name), ["v1.0.0"]);
    assert.equal(tags[0]?.email, "ada@example.com");
    assert.equal((await rootCommit(dir)).length, 40);
    assert.equal((await headSha(dir)).length, 40);
    assert.equal(await remoteUrl(dir), "git@example.com:acme/app.git");
    const windowed = await listCommits(dir, { since: "2026-02-01", until: "2026-02-28" });
    assert.equal(windowed.length, 7);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("git runs with pinned diff settings and reads trailers and linguist attributes", async () => {
  const dir = await makeRepo();
  try {
    assert.deepEqual(PINNED_CONFIG.filter((_, i) => i % 2 === 1), ["diff.renames=true", "diff.algorithm=myers", "diff.indentHeuristic=true", "core.autocrlf=false"]);
    assert.match(await gitVersion(dir), /^git version \d+\.\d+/);
    const commits = await listCommits(dir, {});
    const generated = commits.find((c) => c.files.some((f) => f.path === "gen/out.ts"))!;
    assert.deepEqual(generated.coAuthors, ["ada@example.com"]);
    assert.deepEqual(generated.coAuthorNames, ["Ada"]);
    const assisted = commits.find((c) => c.name === "Bob (aider)")!;
    assert.deepEqual(assisted.coAuthors, ["noreply@anthropic.com"]);
    assert.ok(assisted.coAuthorNames.includes("Claude"));
    assert.deepEqual(assisted.assistedBy, []);
    assert.deepEqual(commits[0]!.coAuthors, []);
    const attrs = await checkAttr(dir, ["gen/out.ts", "src/a.ts"]);
    assert.deepEqual(attrs.get("gen/out.ts"), { generated: true, vendored: false });
    assert.deepEqual(attrs.get("src/a.ts"), { generated: false, vendored: false });
    assert.equal((await checkAttr(dir, [])).size, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

import { resolveIdentity, isMine } from "../src/figures/identity.js";
import { tenure, commitShare } from "../src/figures/commits.js";
import { cadence, isoWeek } from "../src/figures/cadence.js";
import { footprint, testsAndDocs, languageOf } from "../src/figures/footprint.js";
import { survivingLines, parseBlame, listTextFiles } from "../src/figures/surviving.js";

test("identity resolves by email or name, tenure spans first to last commit, commit share excludes merges", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["Ada"], dir);
    assert.deepEqual(ada.emails, ["ada@example.com"]);
    const bob = await resolveIdentity(commits, ["bob@example.com"], dir);
    assert.deepEqual(bob.names, ["Bob", "Bob (aider)"]);
    const t = tenure(commits, ada, {});
    assert.equal(t.value.first, "2026-01-05");
    assert.equal(t.value.last, "2026-01-19");
    assert.equal(t.value.days, 15);
    const inTenure = commits.filter((c) => c.date >= new Date("2026-01-05") && c.date <= new Date("2026-01-19T23:59:59Z"));
    const share = commitShare(inTenure, ada);
    assert.deepEqual(share.value, { author: 3, total: 3, share: 1 });
    const all = commitShare(commits, ada);
    assert.equal(all.value.total, 10);
    assert.ok(Math.abs(all.value.share - 0.3) < 1e-9);
    assert.match(share.command, /git log/);
    assert.ok(share.limits.length >= 1);
    assert.equal(isMine(commits[0]!, ada), false);
    await assert.rejects(resolveIdentity(commits, ["nobody@example.com"], dir), /no commits by nobody@example.com in this repository\. Authors here: "Bob" \(5\), "Ada" \(3\)/);
    // Without --author, the repository's configured name is enough when the email does not match.
    execFileSync("git", ["config", "user.email", "other@example.com"], { cwd: dir });
    execFileSync("git", ["config", "user.name", "Bob"], { cwd: dir });
    assert.deepEqual((await resolveIdentity(commits, undefined, dir)).emails, ["bob@example.com"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

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

test("footprint counts files, owned directories and languages; tests and docs are recognised", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const f = footprint(commits, ada, { depth: 1, threshold: 0.3, minCommits: 1 });
    assert.equal(f.value.filesTouched, 5);
    const src = f.value.ownedDirectories.find((d) => d.path === "src");
    // src is touched by commits 1, 3, 4, 5 and 9 (the tests commit touches only test/): Ada has 2 of 5.
    assert.ok(src && src.total === 5 && src.author === 2, JSON.stringify(f.value.ownedDirectories));
    assert.equal(f.value.languages[0]?.language, "TypeScript");
    const td = testsAndDocs(commits, ada);
    assert.equal(td.value.testChangesAuthor, 1);
    assert.equal(td.value.testChangesTotal, 1);
    assert.equal(td.value.docsAuthored, 1);
    assert.equal(languageOf("x/y.tsx"), "TypeScript");
    assert.equal(languageOf("a.cs"), "C#");
    assert.equal(languageOf("lib/parser.ex"), "Elixir");
    assert.equal(languageOf("lib/parser.scala"), "Scala");
    assert.equal(languageOf("src/parser.hs"), "Haskell");
    assert.equal(languageOf("scripts/build.lua"), "Lua");
    assert.equal(languageOf("analysis/model.r"), "R");
    assert.equal(languageOf("src/main.mm"), "Objective-C");
    assert.equal(languageOf("src/main.zig"), "Zig");
    assert.equal(languageOf("a.png"), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("one blame pass honours ignore-revs, exclusions and the seed, and buckets the subject's lines by year", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const base = { sample: 1, seed: "", exclude: [], copies: false, excluded: new Set(["gen/out.ts", "package-lock.json"]), version: "test" };
    // Bob's semicolon reformat is listed in .git-blame-ignore-revs, so Ada keeps line 0 to line 5 of src/a.ts.
    const honoured = await survivingLines(dir, ada, { ...base, ignoreRevsFile: ".git-blame-ignore-revs" });
    assert.equal(honoured.value.filesTotal, 7);
    assert.equal(honoured.value.filesSampled, 7);
    assert.equal(honoured.value.linesAttributed, 31);
    assert.equal(honoured.value.lines, 16);
    assert.deepEqual(honoured.value.byYear, [{ year: 2026, lines: 16 }]);
    assert.match(honoured.command, /git blame --line-porcelain -w -M --ignore-revs-file \.git-blame-ignore-revs HEAD/);
    assert.ok(honoured.limits.some((l) => l.includes(".git-blame-ignore-revs")));
    // Without it, the reformat takes all ten lines of src/a.ts.
    const ignored = await survivingLines(dir, ada, { ...base, ignoreRevsFile: null });
    assert.equal(ignored.value.lines, 10);
    assert.equal(ignored.value.linesAttributed, 31);
    // Nothing excluded and copies on: the lock file and the generated file come back.
    const raw = await survivingLines(dir, ada, { ...base, excluded: new Set(), copies: true, ignoreRevsFile: null });
    assert.equal(raw.value.filesTotal, 9);
    assert.equal(raw.value.linesAttributed, 59);
    assert.match(raw.command, /-w -M -C HEAD/);
    // A glob drops files too, and the seed changes which files a sample draws.
    const globbed = await survivingLines(dir, ada, { ...base, ignoreRevsFile: null, exclude: ["*.md", "test/**"] });
    assert.equal(globbed.value.filesTotal, 5);
    const a = await survivingLines(dir, ada, { ...base, ignoreRevsFile: null, sample: 3, seed: "one" });
    const b = await survivingLines(dir, ada, { ...base, ignoreRevsFile: null, sample: 3, seed: "two" });
    assert.ok(a.value.filesSampled < 7 && b.value.filesSampled < 7);
    assert.equal(a.value.seed, "one");
    assert.deepEqual((await listTextFiles(dir)).map((f) => f.path).sort(), [".git-blame-ignore-revs", ".gitattributes", "docs/guide.md", "gen/out.ts", "package-lock.json", "src/a.ts", "src/c.py", "src/renamed.ts", "test/a.test.ts"]);
    assert.deepEqual(parseBlame("abc 1 1 1\nauthor Ada\nauthor-mail <Ada@Example.com>\nauthor-time 1767607200\n\tline 0\n"), [{ mail: "ada@example.com", year: 2026 }]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a directory that is not a repository gets a plain sentence", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workproof-norepo-"));
  try {
    await assert.rejects(analyseRepo(dir, { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false }), /not inside a git repository/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
