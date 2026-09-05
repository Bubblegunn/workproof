import { test } from "node:test";
import assert from "node:assert/strict";
import { makeRepo } from "./fixture.js";
import { analyseRepo } from "../src/analyse.js";
import { plainSummary } from "../src/summary.js";
import { buildReport, renderMarkdown } from "../src/report.js";
import { rmSync } from "node:fs";

const PARAMS = { author: ["ada@example.com"], sample: 1, depth: 2, threshold: 0.05, minCommits: 1, paths: false, emails: false, exclusions: true, exclude: [], seed: "", copies: false };

test("the plain-language summary is deterministic and carries only figures that are in the report", async () => {
  const dir = await makeRepo();
  try {
    const repo = await analyseRepo(dir, PARAMS);
    const once = plainSummary(repo);
    assert.equal(once, plainSummary(repo), "two runs over the same figures differ");

    const surviving = repo.figures.find((f) => f.id === "survivingLines")!.value as { lines: number; linesAttributed: number };
    const commits = repo.figures.find((f) => f.id === "commitShare")!.value as { author: number; total: number };
    assert.match(once, new RegExp(`${surviving.lines} of the ${surviving.linesAttributed} lines`));
    assert.match(once, new RegExp(`${commits.author} of the ${commits.total} changes`));
    assert.match(once, /npx workproof verify/, "the summary says how to check it");
    assert.match(once, /1 automated change and 2 machine-written or copied files were removed/);

    // No adjective about quality, and no claim the figures do not carry.
    for (const word of ["impressive", "excellent", "strong", "significant", "clearly", "obviously"]) {
      assert.doesNotMatch(once, new RegExp(word, "i"), `the summary editorialises: "${word}"`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the summary is rendered into the Markdown and is not part of the hash", async () => {
  const dir = await makeRepo();
  try {
    const repo = await analyseRepo(dir, PARAMS);
    const report = buildReport([repo], PARAMS, { version: "0.0.0-test", generatedAt: "2026-01-01T00:00:00.000Z" });
    const markdown = renderMarkdown(report);
    assert.match(markdown, /### In plain language/);
    assert.match(markdown, /no model involved/);
    assert.ok(markdown.indexOf("### In plain language") < markdown.indexOf("### Tenure"), "the summary comes before the figures");

    const again = buildReport([repo], PARAMS, { version: "0.0.0-test", generatedAt: "2026-01-01T00:00:00.000Z" });
    assert.equal(again.hash, report.hash, "rendering a summary changed the hash");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
