import { test } from "node:test";
import assert from "node:assert/strict";
import { recogniseText, recogniseRecords } from "../src/foreign.js";
import { buildVerdict, parseReportText } from "../src/verdict.js";

const pairs = (r: ReturnType<typeof recogniseText>) => r.found.map((f) => `${f.kind}=${f.value}`).sort();

test("prose figures: '123 commits', '1,197 lines added', '+1197/-30'", () => {
  const r = recogniseText("Summary for Ada.\nShe made 123 commits and 1,197 lines added in 2026.\nNet change: +1197/-30\n");
  assert.deepEqual(pairs(r), ["added=1197", "commits=123", "deleted=30"]);
  assert.deepEqual(r.ambiguous, []);
});

test("key: value lines in markdown and YAML-like text, with dates and an author line", () => {
  const r = recogniseText("# Report\n- **Author:** Ada Example\n- **commits:** 63\n- lines_added: 1,197\nfirst commit: 2026-03-01\nlast_commit: 2026-04-09T10:00:00Z\n");
  assert.deepEqual(pairs(r), ["added=1197", "commits=63", "first=2026-03-01", "last=2026-04-09"]);
  assert.deepEqual(r.authors, ["Ada Example"]);
});

test("CSV header and row, and a two-column markdown table", () => {
  assert.deepEqual(pairs(recogniseText('name,commits,lines added,share\nAda,63,"1,197",40%\n')), ["added=1197", "commits=63"]);
  assert.deepEqual(pairs(recogniseText("| Metric | Value |\n|---|---|\n| commits | 63 |\n| insertions | 1,197 |\n")), ["added=1197", "commits=63"]);
});

test("a CSV with several authors reads the row that names the application name; without one the columns are ambiguous", () => {
  const csv = "author,commits,insertions\nAda Example,63,1197\nBob Other,10,50\n";
  assert.deepEqual(pairs(recogniseText(csv, ["ada example"])), ["added=1197", "commits=63"]);
  assert.deepEqual(recogniseText(csv).found, []);
  assert.deepEqual(recogniseText(csv).ambiguous.sort(), ["commits", "insertions"]);
});

test("shares, totals, merges and percentages are not the author's own figure; a figure found twice with different values is ambiguous", () => {
  const r = recogniseText("total commits: 999\nmerge commits: 4\n40% of all commits\ncommit_share: 40 percent\nThe repository has a total of 500 commits.\n");
  assert.deepEqual(r.found, []);
  const twice = recogniseText("63 commits this year\ncommits: 70\nlines added: 5\n");
  assert.deepEqual(twice.ambiguous, ["commits"]);
  assert.deepEqual(pairs(twice), ["added=5"]);
});

test("a prose sentence with commas is not read as a table", () => {
  assert.deepEqual(pairs(recogniseText("Ada made 63 commits, 1,197 lines added, and reviewed code.")), ["added=1197", "commits=63"]);
});

test("a JSON array of records is read only when exactly one record names the application name", () => {
  const list = [{ author: "Ada Example", commits: 63, lines_added: 1197 }, { author: "Bob Other", commits: 10 }];
  assert.deepEqual(pairs(recogniseRecords(list, ["ada"])), ["added=1197", "commits=63"]);
  assert.match(recogniseRecords(list, [])?.note ?? "", /no author name/);
  assert.match(recogniseRecords([...list, { author: "Ada Two", commits: 1 }], ["ada"]).note ?? "", /more than one/);
  assert.match(recogniseRecords(list, ["carol"]).note ?? "", /no record/);
});

test("unrecognised text says so, says an unknown-format hash cannot be checked, and points to plain git; it never ends at 'not compared'", async () => {
  const { markdown, status } = await buildVerdict(parseReportText("Ada is a great engineer.\nsha256: 0123abcd\n"), [], { reportName: "cv.md" });
  assert.equal(status, "not-checked");
  assert.match(markdown, /no figure in the report was recognised/);
  assert.match(markdown, /hash in an unknown format cannot be checked/);
  assert.match(markdown, /git shortlog -sne --no-merges/);
  assert.match(markdown, /git log --no-merges --author=<the person> --numstat/);
});

test("a record list with an author name goes through the foreign reader; without one it keeps the shape check", async () => {
  const withName = await buildVerdict(parseReportText('[{"author":"Ada","commits":3},{"author":"Bob","commits":1}]'), [], { authors: ["Ada"] });
  assert.match(withName.markdown, /foreign format/);
  assert.equal(withName.status, "not-checked");
  const without = await buildVerdict(parseReportText('[{"author":"Ada","commits":3}]'), []);
  assert.equal(without.status, "do-not-trust");
});

test("long runs of spaces do not stall the text patterns", () => {
  for (const text of [" ".repeat(100000), "+1" + " ".repeat(100000) + "x", "+1" + " ".repeat(1500) + "x"]) {
    const t0 = performance.now();
    recogniseText(text);
    assert.ok(performance.now() - t0 < 200, `took ${performance.now() - t0} ms`);
  }
});
