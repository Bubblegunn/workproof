import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/tasks.json"), "utf8"));
const page = readFileSync(join(ROOT, "docs/HEAD-TO-HEAD.md"), "utf8");

test("the page publishes every task prompt, criterion and ground truth that the harness runs", () => {
  assert.ok(Object.keys(cfg.tasks).length >= 6, "six public tasks");
  for (const [id, t] of Object.entries(cfg.tasks)) {
    assert.ok(page.includes(`### ${id}. ${t.title}`), `${id} heading`);
    assert.ok(page.replace(/\n> /g, "\n").includes(t.prompt), `${id} prompt`);
    assert.ok(page.includes(t.truth), `${id} ground truth`);
    for (const [k, v] of Object.entries(t.criteria)) assert.ok(page.includes(`- ${k}: ${v}`), `${id} ${k}`);
  }
});

test("the page states the ground-truth figures the harness grades against", () => {
  const g = cfg.groundTruth;
  for (const n of [g.commitsConfiguredEmail, g.commitsAllThreeIdentities, g.commitsAllRepository, g.survivingLinesConfiguredEmail, g.survivingLinesAllThreeIdentities]) {
    assert.ok(page.includes(String(n)), `figure ${n}`);
  }
});

test("every script the page tells a reader to run exists", () => {
  for (const f of ["tasks.json", "labels.json", "make-fixtures.sh", "tamper.mjs", "forge.mjs", "run-one.sh", "run.sh", "task.py", "assemble.py", "grade.sh", "score.py", "rerun.sh", "archive.sh", "fixtures/portfolio-bank.md", "fixtures/F3-round1/workproof-report.json", "fixtures/F3-round2/workproof-report.json", "fixtures/F3-round3/workproof-report.json", "forge3.mjs", "guard.sh", "hook-prompts.json", "hook-prompts-r5.json", "failed-cells.py"]) {
    assert.ok(existsSync(join(ROOT, "bench/head-to-head", f)), f);
  }
});

test("the page names no email address", () => {
  assert.doesNotMatch(page, /[\w.+-]+@[\w-]+\.[\w.]+/);
  assert.doesNotMatch(readFileSync(join(ROOT, "bench/head-to-head/tasks.json"), "utf8"), /[\w.+-]+@[\w-]+\.[\w.]+/);
});

test("the results section states the date, the build commit, a table row per task and the gate verdict", () => {
  const at = page.indexOf("## Results, round 1");
  assert.ok(at >= 0, "no results section");
  const body = page.slice(at);
  assert.match(body, /Date: \d{4}-\d{2}-\d{2}/);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of ["T1", "T2", "T3", "T4", "T5", "T6"]) assert.ok(body.slice(0, body.indexOf("## ", 5) > 0 ? body.indexOf("## ", 5) : undefined).includes(`| ${id} `), `no row for ${id}`);
});

test("every criterion has an outcome or process label, and the page records the rulings and the fairness rules", () => {
  const labels = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/labels.json"), "utf8"));
  for (const [id, t] of Object.entries(cfg.tasks)) {
    for (const c of Object.keys(t.criteria)) assert.match(labels[id]?.[c]?.label ?? "", /^(outcome|process)$/, `${id} ${c} has no label`);
    assert.ok(Object.values(labels[id]).some((l) => l.label === "outcome"), `${id} has no outcome criterion`);
  }
  assert.ok(page.includes("## Rulings"));
  for (const arm of ["RCP_I", "JD_I", "GAP_I"]) assert.ok(page.includes(arm), arm);
  assert.ok(page.includes("ceiling") || page.includes("Rule B at the ceiling"));
});

test("the forged report of round 2 passes check and fails verify's figures (hash recomputed, figures raised)", async () => {
  const { checkReport } = await import("../dist/src/verify.js");
  const r = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/fixtures/F3-round2/workproof-report.json"), "utf8"));
  assert.equal(checkReport(r).ok, true, "the forged report must pass the offline check");
  const old = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/fixtures/F3-round1/workproof-report.json"), "utf8"));
  assert.equal(checkReport(old).ok, false, "the round 1 report must fail the offline check");
});

test("the round 2 results state the build, the archive, the outcome table, the full table and the gate verdict, and the archives exist", () => {
  const at = page.indexOf("## Results, round 2");
  assert.ok(at >= 0, "no round 2 results");
  const body = page.slice(at);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("### Outcome criteria only"));
  assert.ok(body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  for (const f of ["results/round1.tar.gz", "results/round2.tar.gz"]) assert.ok(existsSync(join(ROOT, "bench/head-to-head", f)), f);
});

test("the round 3 forgery passes check, carries the false merged claim, and the guard tripwire stops on a changed configuration", async () => {
  const { checkReport } = await import("../dist/src/verify.js");
  const r = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/fixtures/F3-round3/workproof-report.json"), "utf8"));
  assert.equal(checkReport(r).ok, true);
  assert.equal(r.repositories[0].identity.merged.count, 3);
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { spawnSync } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const home = mkdtempSync(join(tmpdir(), "guard-"));
  mkdirSync(join(home, ".claude"));
  writeFileSync(join(home, ".claude/settings.json"), '{"hooks":{"a":1}}');
  writeFileSync(join(home, ".claude.json"), '{"mcpServers":{"x":1}}');
  const dir = join(home, "g");
  const run = (mode) => spawnSync("bash", [join(ROOT, "bench/head-to-head/guard.sh"), mode, dir], { env: { ...process.env, HOME_REAL: home }, encoding: "utf8" });
  assert.equal(run("init").status, 0);
  assert.equal(run("check").status, 0);
  writeFileSync(join(home, ".claude.json"), '{"mcpServers":{"x":2}}');
  assert.equal(run("check").status, 1, "a changed mcpServers object must trip the guard");
  assert.equal(existsSync(join(dir, "STOP")), true);
  writeFileSync(join(home, ".claude.json"), '{"mcpServers":{"x":1}}');
  assert.equal(run("check").status, 1, "once tripped, the STOP file keeps the guard closed");
});

test("the round 3 results state the build, the isolation record, both tables, the gate verdict and the archive", () => {
  const at = page.indexOf("## Results, round 3");
  assert.ok(at >= 0, "no round 3 results");
  const body = page.slice(at);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("guard.sh") && body.includes("temporary HOME"));
  assert.ok(body.includes("### Outcome criteria only") && body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  assert.ok(existsSync(join(ROOT, "bench/head-to-head/results/round3.tar.gz")));
});

test("the hook prompt lists are frozen: at least 16 positives and exactly 20 unrelated negatives, with no overlap", () => {
  const h = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/hook-prompts.json"), "utf8"));
  assert.ok(h.positives.length >= 16);
  assert.equal(h.negatives.length, 20);
  assert.equal(new Set([...h.positives, ...h.negatives]).size, h.positives.length + h.negatives.length);
  assert.ok(page.includes("## Rulings, round 4") && page.includes("hook-prompts.json"));
  assert.deepEqual(cfg.requireSkill, ["T4", "T6", "T7", "T8"]);
  assert.deepEqual(Object.keys(cfg.requireCommand).sort(), ["T7", "T8"]);
});

test("the round 4 results state the build, the guard record, both tables, the gate verdict and the archive", () => {
  const at = page.indexOf("## Results, round 4");
  assert.ok(at >= 0, "no round 4 results");
  const body = page.slice(at);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("guard") && body.includes("temporary HOME"));
  assert.ok(body.includes("### Outcome criteria only") && body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  assert.ok(existsSync(join(ROOT, "bench/head-to-head/results/round4.tar.gz")));
});

test("the round 5 hook prompt list is frozen with 8 positives and 8 close negatives and is not in the earlier lists", () => {
  const r5 = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/hook-prompts-r5.json"), "utf8"));
  const old = JSON.parse(readFileSync(join(ROOT, "bench/head-to-head/hook-prompts.json"), "utf8"));
  assert.equal(r5.positives.length, 8);
  assert.equal(r5.negatives.length, 8);
  assert.equal(new Set([...r5.positives, ...r5.negatives, ...old.positives, ...old.negatives]).size, 8 + 8 + old.positives.length + old.negatives.length);
  assert.ok(page.includes("## Rulings, round 5"));
});

test("the round 5 results state the build, the guard record, both tables, the gate verdict and the archive", () => {
  const at = page.indexOf("## Results, round 5");
  assert.ok(at >= 0, "no round 5 results");
  const body = page.slice(at);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("guard") && body.includes("temporary HOME"));
  assert.ok(body.includes("### Outcome criteria only") && body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  assert.ok(existsSync(join(ROOT, "bench/head-to-head/results/round5.tar.gz")));
});

test("failed-cells.py lists a run with no result, an error result and a rate-limit message, and nothing for a clean run", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { spawnSync } = await import("node:child_process");
  const { tmpdir } = await import("node:os");
  const runs = mkdtempSync(join(tmpdir(), "fc-"));
  const make = (name, lines, done = true) => {
    mkdirSync(join(runs, name));
    writeFileSync(join(runs, name, "out.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
    if (done) writeFileSync(join(runs, name, "DONE"), "x");
  };
  const ok = { type: "result", subtype: "success", is_error: false, result: "x".repeat(500) };
  make("T1-OURS-1", [ok]);
  make("T1-OURS-2", [{ type: "system" }], true);
  make("T1-OURS-3", [{ type: "result", subtype: "success", is_error: true, result: "boom" }]);
  make("T2-BASE-1", [{ type: "result", subtype: "success", is_error: false, result: "API Error: rate_limit_error, try later" }]);
  make("T2-BASE-2", [ok], false);
  const r = spawnSync("python3", [join(ROOT, "bench/head-to-head/failed-cells.py"), runs], { encoding: "utf8" });
  const got = r.stdout.trim().split("\n").sort();
  assert.deepEqual(got, ["T1 OURS 2", "T1 OURS 3", "T2 BASE 1", "T2 BASE 2"]);
});

test("the round 6 rulings are recorded", () => {
  assert.ok(page.includes("## Rulings, round 6") && page.includes("failed-cells.py") && page.includes("bullets --resume"));
});

test("the round 6 results state the build, the guard record, both tables, the gate verdict and the archive", () => {
  const at = page.indexOf("## Results, round 6");
  assert.ok(at >= 0, "no round 6 results");
  const body = page.slice(at);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("guard") && body.includes("temporary HOME") && body.includes("failed-cells.py"));
  assert.ok(body.includes("### Outcome criteria only") && body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  assert.ok(existsSync(join(ROOT, "bench/head-to-head/results/round6.tar.gz")));
});

test("the round 7 rulings are recorded", () => {
  assert.ok(page.includes("## Rulings, round 7") && page.includes("git shortlog -sne --no-merges") && page.includes("20,000 commits"));
});

test("the round 7 results state the archived commit, the guard record, both tables, the gate verdict and the archive", () => {
  const at = page.indexOf("## Results, round 7");
  assert.ok(at >= 0, "no round 7 results");
  const body = page.slice(at);
  assert.match(body, /git archive/);
  assert.match(body, /commit [0-9a-f]{7,40}/);
  assert.ok(body.includes("guard") && body.includes("temporary HOME") && body.includes("failed-cells.py"));
  assert.ok(body.includes("### Outcome criteria only") && body.includes("### All criteria, process criteria included"));
  assert.match(body, /Gate: (PASS|FAIL)\./);
  for (const id of Object.keys(cfg.tasks)) assert.ok(body.includes(`| ${id} (`), `no row for ${id}`);
  assert.ok(existsSync(join(ROOT, "bench/head-to-head/results/round7.tar.gz")));
});

test("the final-gate ruling records the process-criterion reason and the outcome-only verdicts of rounds 3 to 7", () => {
  assert.ok(page.includes("## Rulings, final gate"));
  assert.ok(page.includes("is a process criterion") && page.includes("counts outcome criteria only"));
  for (const r of ["| 3 | FAIL", "| 4 | FAIL", "| 5 | FAIL", "| 6 | PASS", "| 7 | PASS"]) assert.ok(page.includes(r), r);
});
