import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { computeOwner, renderOwner, hasGeneratedMarker, show, OWNER_SENTENCE } from "../src/owner.js";
import type { OwnerReport, OwnerRow } from "../src/owner.js";

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));

// Invented people on .example domains. Ada wrote the file, Ben re-indented and renamed it, Sam is a namesake.
const ADA = { name: "Ada Ruiz", email: "ada@alpha.example" };
const BEN = { name: "Ben Okafor", email: "ben@beta.example" };
const SAM = { name: "Sam Ortega", email: "sam@alpha.example" };
const NAMESAKE = { name: "Sam Ortega", email: "sortega@gamma.example" };
const LONG = { name: "L".repeat(100), email: "long@delta.example" };
const WS_LABEL = "surviving lines by author, whitespace and moves ignored";
const PLAIN_LABEL = "surviving lines by author, plain blame";
const LEFT_LABEL = "left out of the two blame rows";
const CREATED_LABEL = "file created by";
const BACKDATE_LABEL = "committer date more than 30 days after author date (rebase, cherry-pick or backdating; the history cannot tell which)";
const FILE = "src/report/format.ts";
/** An address: a token with an at-sign and a dotted domain. The marker '@generated' is not one. */
const ADDRESS = /[^\s<>'"()]+@[^\s<>'"()]+\.[A-Za-z]{2,}/;

interface Fixture {
  dir: string;
  heads: Record<string, string>;
}

let fx: Fixture;
let report: OwnerReport;
let dirReport: OwnerReport;
let adaReport: OwnerReport;
let benReport: OwnerReport;
let addressReport: OwnerReport;
let noMatchReport: OwnerReport;
let notesReport: OwnerReport;
let renameReport: OwnerReport;
let cafeReport: OwnerReport;
let cafeDirReport: OwnerReport;
let literalReport: OwnerReport;
let starReport: OwnerReport;
let submoduleReport: OwnerReport;

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

const rowOf = (rows: OwnerRow[], label: string): OwnerRow => {
  const r = rows.find((x) => x.label === label);
  assert.ok(r, `no row labelled ${label}`);
  return r;
};

const valueOf = (rows: OwnerRow[], label: string): string => rowOf(rows, label).value;

const hasRowLabel = (rows: OwnerRow[], label: string): boolean => rows.some((r) => r.label === label);

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
  const readText = (file: string) => execFileSync("cat", [join(dir, file)], { encoding: "utf8" });
  const withSam = (extra: string) => readText(FILE) + `    ${extra}\n`;

  git(["init", "-q", "."]);
  // c1: Ada writes the file under its first name. The subject carries control and format characters,
  // a unit separator, a pipe and an address.
  await write("src/report/render.ts", `${plain(12).join("\n")}\n`);
  commit("create", ADA, "2026-01-10T10:00:00Z", "Add render\u001b[31m helper\u0007\u001f | for ada@alpha.example​");
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
  // c10: a generated file, a lock file, a binary file, a symlink, a submodule entry, and a file that is
  // renamed in c11.
  await write("src/report/schema.gen.ts", "// Generated by the schema tool. Do not edit by hand.\nexport const schema = 1;\n");
  await write("src/report/yarn.lock", '# yarn lockfile v1\n\nleft-pad@1.0.0:\n  version "1.0.0"\n');
  writeFileSync(join(dir, "src/report/blob.bin"), Buffer.from([0x00, 0x01, 0x02, 0x03]));
  symlinkSync("format.ts", join(dir, "src/report/link.ts"));
  await write("src/lib/x.ts", "export const lib = 1;\n");
  // A gitlink whose directory is missing is staged as deleted by a later add -A, so the directory exists.
  await mkdir(join(dir, "src/report/sub"), { recursive: true });
  git(["add", "-A"], ADA, "2026-03-01T10:00:00Z", "2026-03-01T10:00:00Z");
  git(["update-index", "--add", "--cacheinfo", `160000,${git(["rev-parse", "HEAD"])},src/report/sub`], ADA, "2026-03-01T10:00:00Z", "2026-03-01T10:00:00Z");
  git(["commit", "-q", "-m", "Add generated schema, lock, binary, symlink and submodule entry"], ADA, "2026-03-01T10:00:00Z", "2026-03-01T10:00:00Z");
  heads["generated"] = git(["rev-parse", "HEAD"]);
  // c11: Ben renames a file across directories with an empty side in the brace form (src/{lib => }/x.ts).
  git(["mv", "src/lib/x.ts", "src/x.ts"]);
  commit("brace", BEN, "2026-03-04T10:00:00Z", "Move x out of lib");
  // c12: a non-ASCII directory and file name.
  await write("café/é.ts", "export const cafe = 1;\n");
  commit("cafe", ADA, "2026-03-05T10:00:00Z", "Add the cafe file");
  // c13: a path with glob characters.
  // A sibling that a wildcard lit* would also match, committed first by someone else, so a glob
  // would name it as the creator of lit*.
  await write("litter/c.ts", "export const litter = 1;\n");
  commit("litter", SAM, "2026-03-06T10:00:00Z", "Add the litter file");
  await write("lit[1]/a.ts", "export const lit = 1;\n");
  await write("lit*/a.ts", "export const star = 1;\n");
  commit("literal", BEN, "2026-03-06T12:00:00Z", "Add the literal paths");
  // c14: a hand-written file that mentions "generated", and a comment with a real marker.
  await write("src/notes/ids.ts", "// see generated ids\nexport const ids = 1;\n");
  await write("src/notes/auto.ts", "// autogenerated by the tool\nexport const auto = 1;\n");
  commit("notes", ADA, "2026-03-07T10:00:00Z", "Add the notes");
  // c15: a very long author name.
  await write("src/notes/long.ts", "export const long = 1;\n");
  commit("long", LONG, "2026-03-08T10:00:00Z", "Add the long-named file");

  // A directory of 201 small files, for the cap.
  const many = join(dir, "many");
  await mkdir(many);
  for (let i = 0; i < 201; i++) writeFileSync(join(many, `f${String(i).padStart(3, "0")}.ts`), `export const v${i} = ${i};\n`);
  git(["add", "-A"], ADA, "2026-03-09T10:00:00Z", "2026-03-09T10:00:00Z");
  git(["commit", "-q", "-m", "Add many files"], ADA, "2026-03-09T10:00:00Z", "2026-03-09T10:00:00Z");
  return { dir, heads };
}

before(async () => {
  fx = await buildFixture();
  const repo = fx.dir;
  report = await computeOwner({ path: FILE, repo, json: true });
  dirReport = await computeOwner({ path: "src/report", repo, json: true });
  adaReport = await computeOwner({ path: FILE, repo, claim: ADA.name, json: true });
  benReport = await computeOwner({ path: FILE, repo, claim: BEN.name, json: true });
  addressReport = await computeOwner({ path: FILE, repo, claim: NAMESAKE.email, json: true });
  noMatchReport = await computeOwner({ path: FILE, repo, claim: "Nobody Here", json: true });
  notesReport = await computeOwner({ path: "src/notes", repo, json: true });
  renameReport = await computeOwner({ path: "src/x.ts", repo, json: true });
  cafeReport = await computeOwner({ path: "café/é.ts", repo, json: true });
  cafeDirReport = await computeOwner({ path: "café", repo, json: true });
  literalReport = await computeOwner({ path: "lit[1]", repo, json: true });
  starReport = await computeOwner({ path: "lit*", repo, json: true });
  submoduleReport = await computeOwner({ path: "src/report/sub", repo, json: true });
});

after(async () => {
  if (fx) await rm(fx.dir, { recursive: true, force: true });
});

test("plain blame credits the re-indenter; -w -C credits the author; both are shown side by side", () => {
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
  assert.ok(rowOf(report.rows, WS_LABEL).basis.includes("-w -C"), "the basis names the flags that were run");
});

test("the creation commit follows the rename back to the first name; control and format characters are stripped; an address is redacted and a pipe neutralised", () => {
  const created = valueOf(report.rows, CREATED_LABEL);
  assert.ok(created.includes(ADA.name), created);
  assert.ok(created.includes("2026-01-10"), created);
  assert.ok(created.includes(fx.heads["create"]!.slice(0, 7)), created);
  assert.ok(created.includes("Add render[31m helper / for (address)"), created);
  assert.ok(!created.includes("@"), "no email address in the creation row");
});

test("a namesake on another address is counted, never printed: the name row shows two addresses", () => {
  assert.equal(valueOf(report.rows, "authors sharing a name"), "1 name with more than one address");
  assert.equal(rowsBetween(report.rows, "authors sharing a name").get(NAMESAKE.name), "2 addresses");
  assert.equal(valueOf(report.rows, "addresses sharing a name"), "none");
});

test("a backdated commit (committer more than 30 days after author) is listed; one exactly 30 days later is not", () => {
  assert.equal(valueOf(report.rows, BACKDATE_LABEL), "1");
  assert.ok(hasRowLabel(report.rows, `  ${fx.heads["late"]!.slice(0, 7)}`), "the 40-day commit is listed by its short sha");
  assert.ok(!hasRowLabel(report.rows, `  ${fx.heads["thirty"]!.slice(0, 7)}`), "the 30-day commit is not listed");
});

test("a whitespace-only commit and a rename-only commit are listed in the whitespace row", () => {
  assert.equal(valueOf(report.rows, "whitespace-only or rename-only commits").split(" of ")[0], "2");
  assert.ok(hasRowLabel(report.rows, `  ${fx.heads["reindent"]!.slice(0, 7)}`));
  assert.ok(hasRowLabel(report.rows, `  ${fx.heads["rename"]!.slice(0, 7)}`));
  assert.ok(!hasRowLabel(report.rows, `  ${fx.heads["move"]!.slice(0, 7)}`), "a commit that moves lines is not whitespace-only");
});

test("a generated file, a lock file, a binary file, a symlink and a submodule entry are left out of the blame rows and counted", () => {
  assert.ok(valueOf(dirReport.rows, LEFT_LABEL).startsWith("5 files"), valueOf(dirReport.rows, LEFT_LABEL));
  const left = valueOf(dirReport.rows, LEFT_LABEL);
  assert.ok(left.includes("lock file 1"), left);
  assert.ok(left.includes("binary 1"), left);
  assert.ok(left.includes("generated header 1"), left);
  assert.ok(left.includes("submodule 1") && left.includes("symlink 1"), left);
  assert.equal(valueOf(dirReport.rows, WS_LABEL), "17 lines in 1 file", "only format.ts is blamed");
  assert.ok(!valueOf(dirReport.rows, PLAIN_LABEL).startsWith("not computed"), "a submodule or a symlink does not make the blame rows not computed");
  for (const name of ["yarn.lock (lock file", "blob.bin (binary", "schema.gen.ts (generated header", "link.ts (symlink)", "sub (submodule)"]) {
    assert.ok(dirReport.notes.some((n) => n.includes(name)), `note names ${name}`);
  }
});

test("a path that is only a submodule has no blamable lines, and the blame rows say so rather than not computed", () => {
  assert.equal(valueOf(submoduleReport.rows, WS_LABEL), "0 lines in 0 files");
  assert.equal(valueOf(submoduleReport.rows, PLAIN_LABEL), "0 lines in 0 files");
  assert.ok(valueOf(submoduleReport.rows, LEFT_LABEL).startsWith("1 file"), valueOf(submoduleReport.rows, LEFT_LABEL));
  assert.ok(valueOf(submoduleReport.rows, LEFT_LABEL).includes("submodule 1"));
});

test("a hand-written file that says 'generated' is kept; an 'autogenerated' comment is left out", () => {
  assert.equal(valueOf(notesReport.rows, WS_LABEL), "3 lines in 2 files", "ids.ts is kept and blamed; long.ts too");
  assert.ok(valueOf(notesReport.rows, LEFT_LABEL).startsWith("1 file"), valueOf(notesReport.rows, LEFT_LABEL));
  assert.ok(valueOf(notesReport.rows, LEFT_LABEL).includes("generated header 1"));
  assert.ok(notesReport.notes.some((n) => n.includes("auto.ts (generated header")));
  assert.ok(!notesReport.notes.some((n) => n.includes("ids.ts")), "the hand-written file is not named as left out");
  assert.equal(rowsBetween(notesReport.rows, WS_LABEL).get(ADA.name), "2 lines (66.7%)");
});

test("the generated-marker test takes a comment line and a standalone phrase only", () => {
  assert.equal(hasGeneratedMarker("// see generated ids\n"), false);
  assert.equal(hasGeneratedMarker("const generated = 1;\n"), false, "no comment marker");
  assert.equal(hasGeneratedMarker("# Code generated by tool. DO NOT EDIT.\n"), true);
  assert.equal(hasGeneratedMarker("/* @generated */\n"), true);
  assert.equal(hasGeneratedMarker("-- auto-generated\n"), true);
  assert.equal(hasGeneratedMarker("<!-- autogenerated -->\n"), true);
  assert.equal(hasGeneratedMarker("line one\n// DO NOT EDIT\n"), true, "within the first five lines");
  assert.equal(hasGeneratedMarker("a\nb\nc\nd\ne\n// DO NOT EDIT\n"), false, "not within the first five lines");
});

test("a rename written with an empty side in the brace form is followed: both commits count and the creator is found", () => {
  assert.equal(valueOf(renameReport.rows, "commits touching the path"), "2 non-merge commits by 2 authors");
  const created = valueOf(renameReport.rows, CREATED_LABEL);
  assert.ok(created.includes(ADA.name), created);
  assert.ok(!created.includes("src//"), created);
});

test("a non-ASCII path and directory are read: the file, its creation and its commits", () => {
  assert.equal(cafeReport.path, "café/é.ts");
  assert.equal(valueOf(cafeReport.rows, WS_LABEL), "1 line in 1 file");
  assert.ok(valueOf(cafeReport.rows, CREATED_LABEL).includes(ADA.name));
  assert.ok(valueOf(cafeReport.rows, CREATED_LABEL).includes("2026-03-05"));
  assert.equal(valueOf(cafeReport.rows, "commits touching the path"), "1 non-merge commit by 1 author");
  assert.ok(valueOf(cafeDirReport.rows, CREATED_LABEL).includes(ADA.name), "the directory finds the same creator");
});

test("a path with glob characters is matched literally", () => {
  assert.ok(valueOf(literalReport.rows, CREATED_LABEL).includes(BEN.name), valueOf(literalReport.rows, CREATED_LABEL));
  assert.equal(valueOf(literalReport.rows, "commits touching the path"), "1 non-merge commit by 1 author");
});

test("a path with a star is matched literally, so a sibling that the glob would match is not counted", () => {
  assert.equal(starReport.path, "lit*");
  assert.ok(valueOf(starReport.rows, CREATED_LABEL).includes(BEN.name), valueOf(starReport.rows, CREATED_LABEL));
  assert.equal(valueOf(starReport.rows, "commits touching the path"), "1 non-merge commit by 1 author");
});

test("a very long name is capped and marked, and no zero-width or line-separator character reaches the output", () => {
  const longRow = notesReport.rows.find((r) => r.label.trim().startsWith("LLL"));
  assert.ok(longRow, "the long-named author has a row");
  assert.ok(longRow.label.endsWith("..."), longRow.label);
  assert.ok(longRow.label.trim().length <= 80, longRow.label);
  const text = renderOwner(report);
  assert.ok(!text.includes("​") && !text.includes(" ") && !text.includes(" "));
  assert.equal(show("ab​c d | e", 80), "abcd / e");
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

test("--claim by a namesake's address matches that address only, and the address is never printed", () => {
  const row = addressReport.rows.find((r) => r.label === "claim: (address)");
  assert.ok(row, "claim row present, labelled without the address");
  assert.ok(row.value.includes("surviving lines 5.9%"), row.value);
  assert.ok(row.value.includes("plain blame 5.9%"), row.value);
  assert.ok(row.value.includes("1 commit on the path"), row.value);
  assert.ok(!ADDRESS.test(renderOwner(addressReport)), "no address in the output");
});

test("--claim that matches no name or address says so instead of 0.0%", () => {
  assert.equal(valueOf(noMatchReport.rows, "claim: Nobody Here"), "claim matched no name or address on this path");
});

test("no email address is printed anywhere in the text output", () => {
  for (const r of [report, dirReport, notesReport, renameReport, cafeReport, literalReport, submoduleReport, adaReport, benReport, noMatchReport]) {
    assert.ok(!ADDRESS.test(renderOwner(r)), `no address in the output for ${r.path}`);
  }
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
  const r = await computeOwner({ path: "many", repo: fx.dir, json: true });
  assert.ok(r.notes.some((n) => n.startsWith("only the first 200 files were read")), r.notes.join("; "));
  assert.equal(r.files, 200);
});

test("the report names the limits it ran under", () => {
  assert.ok(report.notes.some((n) => n.includes("20 s per git call") && n.includes("120 s for each blame pass")));
});
