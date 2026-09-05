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
