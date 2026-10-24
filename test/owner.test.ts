import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { computeOwner, renderOwner, OWNER_SENTENCE } from "../src/owner.js";
import type { OwnerReport, OwnerRow } from "../src/owner.js";

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));

// Invented people on .example domains. Ada wrote the file, Ben re-indented and renamed it, Sam is a namesake.
const ADA = { name: "Ada Ruiz", email: "ada@alpha.example" };
const BEN = { name: "Ben Okafor", email: "ben@beta.example" };
const SAM = { name: "Sam Ortega", email: "sam@alpha.example" };
const NAMESAKE = { name: "Sam Ortega", email: "sortega@gamma.example" };
const WS_LABEL = "surviving lines by author, whitespace and moves ignored";
const PLAIN_LABEL = "surviving lines by author, plain blame";
const FILE = "src/report/format.ts";

interface Fixture {
  dir: string;
  heads: Record<string, string>;
  many: string;
}

let fx: Fixture;
let report: OwnerReport;
let dirReport: OwnerReport;
let adaReport: OwnerReport;
let benReport: OwnerReport;
let addressReport: OwnerReport;

/** Git with GIT_* stripped from the inherited environment, so a hook's GIT_DIR cannot leak in. */
function gitEnv(who?: { name: string; email: string }, date?: string, committerDate?: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("GIT_")) env[k] = v;
  if (who) Object.assign(env, { GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email });
  if (date) Object.assign(env, { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: committerDate ?? date });
  return env;
}

function rowsBetween(rows: OwnerRow[], label: string): Map<string, string> {
  const out = new Map<string, string>();
  const at = rows.findIndex((r) => r.label === label);
  assert.notEqual(at, -1, `no row labelled ${label}`);
  for (const r of rows.slice(at + 1)) {
    if (!r.label.startsWith("  ")) break;
    out.set(r.label.trim(), r.value);
  }
  return out;
}

const valueOf = (rows: OwnerRow[], label: string): string => {
  const r = rows.find((x) => x.label === label);
  assert.ok(r, `no row labelled ${label}`);
  return r.value;
};

async function buildFixture(): Promise<Fixture> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-owner-"));
  const git = (args: string[], who?: { name: string; email: string }, date?: string, committerDate?: string): string =>
    execFileSync("git", ["-c", "commit.gpgsign=false", ...args], { cwd: dir, encoding: "utf8", env: gitEnv(who, date, committerDate) }).trim();
  const heads: Record<string, string> = {};
  const commit = (key: string, who: { name: string; email: string }, date: string, subject: string, committerDate = date) => {
    git(["add", "-A"], who, date, committerDate);
    git(["commit", "-q", "--allow-empty", "-m", subject], who, date, committerDate);
    heads[key] = git(["rev-parse", "HEAD"]);
  };
  const write = async (file: string, text: string) => {
    await mkdir(join(dir, file.split("/").slice(0, -1).join("/")), { recursive: true });
    await writeFile(join(dir, file), text);
  };
  const plain = (n: number) => Array.from({ length: n }, (_, i) => `export const row${i} = ${i};`);
  const indent = (lines: string[]) => lines.map((l) => `    ${l}`);

  git(["init", "-q", "."]);
  // c1: Ada writes the file under its first name. The subject carries control characters.
  await write("src/report/render.ts", `${plain(12).join("\n")}\n`);
  commit("create", ADA, "2026-01-10T10:00:00Z", "Add render\u001b[31m helper\u0007");
  // c2: Ben re-indents it, and nothing else changes.
  await write("src/report/render.ts", `${indent(plain(12)).join("\n")}\n`);
  commit("reindent", BEN, "2026-01-20T10:00:00Z", "Re-indent render");
  // c3: Ben renames it. No content changes.
  git(["mv", "src/report/render.ts", FILE]);
  commit("rename", BEN, "2026-01-21T10:00:00Z", "Rename render to format");
  // c4: Ada adds a line.
  await write(FILE, `${[...indent(plain(12)), "    export const extraAda = 1;"].join("\n")}\n`);
  commit("ada-line", ADA, "2026-02-01T10:00:00Z", "Add a line");
  // c5: Ben moves the first three rows to the end of the file. The lines are not changed, only moved.
  const body = indent(plain(12));
  await write(FILE, `${[...body.slice(3), "    export const extraAda = 1;", ...body.slice(0, 3)].join("\n")}\n`);
  commit("move", BEN, "2026-02-05T10:00:00Z", "Move the first block to the end");
  // c6: Sam Ortega adds a line on one address.
  const withSam = (extra: string) => readFileText(dir, FILE) + `    ${extra}\n`;
  await write(FILE, withSam("export const extraSam = 1;"));
  commit("sam", SAM, "2026-02-10T10:00:00Z", "Add the Sam line");
  // c7: Ada, committed 40 days after she authored it.
  await write(FILE, withSam("export const late = 1;"));
  commit("late", ADA, "2026-02-15T10:00:00Z", "Late fix", "2026-03-27T10:00:00Z");
  // c8: Ben, committed exactly 30 days after he authored it. Not more than 30, so not backdated.
  await write(FILE, withSam("export const thirty = 1;"));
  commit("thirty", BEN, "2026-02-20T10:00:00Z", "Thirty day line", "2026-03-22T10:00:00Z");
  // c9: the namesake, on another address.
  await write(FILE, withSam("export const namesake = 1;"));
  commit("namesake", NAMESAKE, "2026-02-25T10:00:00Z", "Namesake line");
  // c10: a generated file and a lock file in the same directory.
  await write("src/report/schema.gen.ts", "// Generated by the schema tool. Do not edit by hand.\nexport const schema = 1;\n");
  await write("src/report/yarn.lock", '# yarn lockfile v1\n\nleft-pad@1.0.0:\n  version "1.0.0"\n');
  commit("generated", ADA, "2026-03-01T10:00:00Z", "Add generated schema and lock");

  // A directory of 201 small files, for the cap.
  const many = join(dir, "many");
  await mkdir(many);
  for (let i = 0; i < 201; i++) writeFileSync(join(many, `f${String(i).padStart(3, "0")}.ts`), `export const v${i} = ${i};\n`);
  git(["add", "-A"], ADA, "2026-03-02T10:00:00Z", "2026-03-02T10:00:00Z");
  git(["commit", "-q", "-m", "Add many files"], ADA, "2026-03-02T10:00:00Z", "2026-03-02T10:00:00Z");
  return { dir, heads, many: "many" };
}

function readFileText(dir: string, file: string): string {
  return execFileSync("cat", [join(dir, file)], { encoding: "utf8" });
}

before(async () => {
  fx = await buildFixture();
  report = await computeOwner({ path: FILE, repo: fx.dir, json: true });
  dirReport = await computeOwner({ path: "src/report", repo: fx.dir, json: true });
  adaReport = await computeOwner({ path: FILE, repo: fx.dir, claim: ADA.name, json: true });
  benReport = await computeOwner({ path: FILE, repo: fx.dir, claim: BEN.name, json: true });
  addressReport = await computeOwner({ path: FILE, repo: fx.dir, claim: NAMESAKE.email, json: true });
});

after(async () => {
  if (fx) await rm(fx.dir, { recursive: true, force: true });
});

test("plain blame credits the re-indenter; -w -M -C credits the author; both are shown side by side", () => {
  const ws = rowsBetween(report.rows, WS_LABEL);
  const plain = rowsBetween(report.rows, PLAIN_LABEL);
  assert.equal(ws.get(ADA.name), "14 lines (82.4%)", "ignoring whitespace and moves, Ada keeps her 12 original lines, her added line and her late line");
  assert.equal(ws.get(BEN.name), "1 line (5.9%)");
  assert.equal(plain.get(BEN.name), "13 lines (76.5%)", "plain blame gives Ben the 12 re-indented lines and the moved block");
  assert.equal(plain.get(ADA.name), "2 lines (11.8%)");
  // The two blocks sit one after the other, so a reader sees them together.
  const wsAt = report.rows.findIndex((r) => r.label === WS_LABEL);
  const plainAt = report.rows.findIndex((r) => r.label === PLAIN_LABEL);
  assert.ok(plainAt > wsAt && plainAt - wsAt <= 8, "plain blame is printed right beside the whitespace-ignoring rows");
});

test("the creation commit follows the rename back to the first name, and control characters are stripped", () => {
  const created = valueOf(report.rows, "file created by");
  assert.ok(created.includes(ADA.name), created);
  assert.ok(created.includes("2026-01-10"), created);
  assert.ok(created.includes(fx.heads["create"]!.slice(0, 7)), created);
  assert.ok(created.includes("Add render[31m helper"), created);
  assert.ok(!/[\u0000-\u001f\u007f]/.test(created), "no control character in the created row");
});

test("a namesake on another address shows in the name and address rows", () => {
  assert.equal(valueOf(report.rows, "authors sharing a name"), "1 name with more than one address");
  const namesake = rowsBetween(report.rows, "authors sharing a name");
  assert.ok(namesake.has(NAMESAKE.name), "the name row lists the namesake");
  const addrs = namesake.get(NAMESAKE.name)!;
  assert.ok(addrs.includes(SAM.email) && addrs.includes(NAMESAKE.email), addrs);
});

test("a backdated commit (committer more than 30 days after author) is listed; one exactly 30 days later is not", () => {
  const value = valueOf(report.rows, "backdated commits");
  assert.ok(value.startsWith("1 ("), value);
  assert.ok(report.rows.some((r) => r.label === `  ${fx.heads["late"]!.slice(0, 7)}`), "the 40-day commit is listed by its short sha");
  assert.ok(!report.rows.some((r) => r.label === `  ${fx.heads["thirty"]!.slice(0, 7)}`), "the 30-day commit is not listed");
});

test("a whitespace-only commit and a rename-only commit are listed in the whitespace row", () => {
  assert.equal(valueOf(report.rows, "whitespace-only or rename-only commits").split(" of ")[0], "2");
  assert.ok(report.rows.some((r) => r.label === `  ${fx.heads["reindent"]!.slice(0, 7)}`));
  assert.ok(report.rows.some((r) => r.label === `  ${fx.heads["rename"]!.slice(0, 7)}`));
  assert.ok(!report.rows.some((r) => r.label === `  ${fx.heads["move"]!.slice(0, 7)}`), "a commit that moves lines is not whitespace-only");
});

test("a generated file and a lock file are left out of the blame rows and counted", () => {
  const left = valueOf(dirReport.rows, "left out of the two blame rows");
  assert.ok(left.startsWith("2 files"), left);
  assert.ok(left.includes("lock file 1"), left);
  assert.ok(left.includes("generated header 1"), left);
  assert.equal(valueOf(dirReport.rows, WS_LABEL), "17 lines in 1 file", "only format.ts is blamed");
  assert.ok(dirReport.notes.some((n) => n.includes("schema.gen.ts") && n.includes("generated header")));
  assert.ok(dirReport.notes.some((n) => n.includes("yarn.lock") && n.includes("lock file")));
});

test("--claim for the true author: her shares, her commits, and that she created the file", () => {
  const row = adaReport.rows.find((r) => r.label === `claim: ${ADA.name}`);
  assert.ok(row, "claim row present");
  assert.ok(row.value.includes("surviving lines 82.4%"), row.value);
  assert.ok(row.value.includes("plain blame 11.8%"), row.value);
  assert.ok(row.value.includes("3 commits on the path"), row.value);
  assert.ok(row.value.endsWith("created the file: yes"), row.value);
  assert.equal(adaReport.sentence, OWNER_SENTENCE);
  assert.ok(renderOwner(adaReport).trimEnd().endsWith(OWNER_SENTENCE));
});

test("--claim for the re-indenter: plain blame shows him, surviving lines do not, and he did not create the file", () => {
  const row = benReport.rows.find((r) => r.label === `claim: ${BEN.name}`);
  assert.ok(row, "claim row present");
  assert.ok(row.value.includes("surviving lines 5.9%"), row.value);
  assert.ok(row.value.includes("plain blame 76.5%"), row.value);
  assert.ok(row.value.includes("4 commits on the path"), row.value);
  assert.ok(row.value.endsWith("created the file: no"), row.value);
});

test("--claim by a namesake's address matches that address only", () => {
  const row = addressReport.rows.find((r) => r.label === `claim: ${NAMESAKE.email}`);
  assert.ok(row, "claim row present");
  assert.ok(row.value.includes("surviving lines 5.9%"), row.value);
  assert.ok(row.value.includes("plain blame 5.9%"), row.value);
  assert.ok(row.value.includes("1 commit on the path"), row.value);
});

test("a path that is not at HEAD is refused with exit 1", () => {
  const r = spawnSync(process.execPath, [cli, "owner", "--path", "src/nope.ts", "--repo", fx.dir], { encoding: "utf8" });
  assert.equal(r.status, 1, r.stderr);
  assert.ok(r.stderr.includes("no file at HEAD matches"), r.stderr);
});

test("a usage error exits 1", () => {
  const r = spawnSync(process.execPath, [cli, "owner"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes("--path is required"), r.stderr);
});

test("the text output carries no control characters", () => {
  const text = renderOwner(report);
  assert.ok(!/[\x00-\x09\x0b-\x1f\x7f]/.test(text), "no control character in the output");
  assert.ok(text.includes("Add render[31m helper"));
});

test("more than 200 files: only the first 200 are read, and the output says so", async () => {
  const r = await computeOwner({ path: fx.many, repo: fx.dir, json: true });
  assert.ok(r.notes.some((n) => n.startsWith("only the first 200 files were read")), r.notes.join("; "));
  assert.equal(r.files, 200);
});

test("the report names the limits it ran under", () => {
  assert.ok(report.notes.some((n) => n.includes("20 s per git call") && n.includes("120 s")));
});
