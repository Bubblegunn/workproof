import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { makeRepo } from "./fixture.js";
import { analyseRepo, renderMarkdown, buildReport } from "../src/index.js";
import { isBot, isExcludedPath, excludedSet } from "../src/exclusions.js";

const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };

test("bots are recognised by GitHub's two app-identity patterns only", () => {
  assert.equal(isBot({ name: "dependabot[bot]", email: "49699333+dependabot[bot]@users.noreply.github.com" }), true);
  assert.equal(isBot({ name: "renovate[bot]", email: "bot@renovateapp.com" }), true);
  assert.equal(isBot({ name: "Ada", email: "ada@example.com" }), false);
  assert.equal(isBot({ name: "Robot Ross", email: "ross@example.com" }), false);
});

test("lock, snapshot, minified, generated and vendored paths are excluded; source is not", () => {
  for (const p of ["package-lock.json", "a/__snapshots__/x.snap", "vendor/x.go", "web/app.min.js", "proto/x.pb.go", "node_modules/left-pad/index.js", "Cargo.lock", "src/__generated__/types.ts"]) {
    assert.equal(isExcludedPath(p), true, p);
  }
  for (const p of ["src/a.ts", "README.md", "lockfile.md", "src/vendorlist.ts", "test/a.test.ts"]) assert.equal(isExcludedPath(p), false, p);
  const set = excludedSet(["src/a.ts", "gen/out.ts", "yarn.lock", "docs/x.md"], new Map([["gen/out.ts", { generated: true, vendored: false }]]), [/^docs\//]);
  assert.deepEqual([...set].sort(), ["docs/x.md", "gen/out.ts", "yarn.lock"]);
});

test("analyseRepo drops the bot from every denominator and excluded files from every count", async () => {
  const dir = await makeRepo();
  try {
    const repo = await analyseRepo(dir, params);
    assert.equal(repo.excluded.botCommits, 1);
    assert.equal(repo.excluded.files, 2);
    assert.equal(repo.excluded.enabled, true);
    assert.equal(repo.excluded.linesAddedShare, 0);
    assert.match(repo.environment.git, /^git version/);
    assert.deepEqual(repo.environment.blame, ["-w", "-M", "--ignore-revs-file .git-blame-ignore-revs"]);
    assert.equal(repo.environment.ignoreRevs, ".git-blame-ignore-revs");
    const bob = await analyseRepo(dir, { ...params, author: ["bob@example.com"] });
    const share = bob.figures.find((f) => f.id === "commitShare")!;
    assert.deepEqual(share.value, { author: 6, total: 6, share: 1 });
    const fp = bob.figures.find((f) => f.id === "footprint")!;
    assert.ok(!fp.value.languages.some((l: { language: string }) => l.language === "JSON"), JSON.stringify(fp.value.languages));
    // src/a.ts, src/c.py, src/renamed.ts, docs/guide.md, .gitattributes, .git-blame-ignore-revs; gen/out.ts is out
    assert.equal(fp.value.filesTouched, 6);
    // 33 lines added by people in Bob's window, 8 of them in gen/out.ts
    assert.ok(Math.abs(bob.excluded.linesAddedShare - 8 / 33) < 1e-9, String(bob.excluded.linesAddedShare));
    const s = bob.figures.find((f) => f.id === "survivingLines")!;
    assert.equal(s.value.filesTotal, 7);
    const md = renderMarkdown(buildReport([bob], params, { version: "0.2.0", generatedAt: "2026-09-05T00:00:00Z" }));
    assert.match(md, /excluded 1 bot commit and 2 generated, vendored or lock files \(24\.2% of lines added\)/);
    const off = await analyseRepo(dir, { ...params, author: ["bob@example.com"], exclusions: false });
    assert.equal(off.excluded.enabled, false);
    assert.equal(off.excluded.botCommits, 0);
    assert.equal(off.figures.find((f) => f.id === "commitShare")!.value.total, 7);
    const extra = await analyseRepo(dir, { ...params, exclude: ["docs/**"] });
    assert.equal(extra.excluded.files, 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
