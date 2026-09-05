import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { makeRepo } from "./fixture.js";
import { execFileSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyseRepo } from "../src/analyse.js";
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

import { resolveIdentity, isMine } from "../src/figures/identity.js";
import { tenure, commitShare } from "../src/figures/commits.js";
import { cadence, isoWeek } from "../src/figures/cadence.js";
import { footprint, testsAndDocs, languageOf } from "../src/figures/footprint.js";
import { survivingLines } from "../src/figures/surviving.js";

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
    await assert.rejects(resolveIdentity(commits, ["nobody@example.com"], dir), /no commits by nobody@example.com in this repository\. Authors here: "Ada" \(3\), "Bob" \(2\)/);
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
    const f = footprint(commits, ada, { depth: 1, threshold: 0.5, minCommits: 1 });
    assert.equal(f.value.filesTouched, 5);
    const src = f.value.ownedDirectories.find((d) => d.path === "src");
    // src is touched by commits 1, 3, 4 and 5 (the tests commit touches only test/): Ada has 2 of 4.
    assert.ok(src && src.total === 4 && src.author === 2, JSON.stringify(f.value.ownedDirectories));
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

test("surviving lines come from surviving-lines and follow the identity", async () => {
  const dir = await makeRepo();
  try {
    const commits = await listCommits(dir, {});
    const ada = await resolveIdentity(commits, ["ada@example.com"], dir);
    const s = await survivingLines(dir, ada, { sample: 1, version: "test" });
    assert.equal(s.value.linesAttributed, 26);
    assert.equal(s.value.lines, 16);
    assert.ok(Math.abs(s.value.share - 16 / 26) < 1e-9);
    assert.equal(s.value.filesTotal, 5);
    assert.match(s.command, /git blame -w -M/);
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
