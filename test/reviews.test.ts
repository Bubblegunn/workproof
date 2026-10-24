import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { runReviews, csvCell, CONVENTION_FIXED } from "../src/reviews.js";

// Invented people on .example domains; every date is fixed so the fixture is the same on every run.
interface Person { name: string; email: string }
const ADA: Person = { name: "Ada Lind", email: "ada@north.example" };
const BEN: Person = { name: "Ben Ortiz", email: "ben@north.example" };
const CY: Person = { name: "Cy Marsh", email: "cy@south.example" };
const DEE: Person = { name: "Dee Park", email: "dee@south.example" };
const SAM: Person = { name: "Sam Ortega", email: "sam@alpha.example" };
const BOT: Person = { name: "releasebot", email: "bot@ci.example" };

const WINDOW = ["--since", "2026-03-01", "--until", "2026-03-31"];

const SUBJECT = {
  independent: "feat(lib): add a",
  selfAddress: "feat(lib): self by address",
  selfAlias: "feat(lib): sam alias",
  noTrailer: "feat(lib): dee no trailer",
  quoted: "feat(lib): quoted only",
  acked: "feat(lib): acked only",
  featureOne: "feat(lib): feature one",
  featureTwo: "feat(lib): feature two",
  mainTwo: "feat(lib): main two",
  revert: 'Revert "feat(lib): add a"',
  late: "chore(lib): late",
  lastDay: "feat(lib): last day",
  readme: "docs: readme touch",
  bot: "chore(release): generated",
  lowercase: "fix(lib): tidy e",
  csvGuard: "=SUM(A1) tidy lib",
  control: "feat(lib): tidy\u001b[2K output\u0007",
};

let dir = "";
const shas: Record<string, string> = {};
const baseEnv = { PATH: process.env.PATH ?? "", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

const git = (args: string[], env: Record<string, string> = {}, input?: string): string =>
  execFileSync("git", args, { cwd: dir, encoding: "utf8", env: { ...baseEnv, ...env }, input }).trim();

const as = (who: Person, author: string, committer = author): Record<string, string> => ({
  GIT_AUTHOR_NAME: who.name,
  GIT_AUTHOR_EMAIL: who.email,
  GIT_AUTHOR_DATE: author,
  GIT_COMMITTER_NAME: who.name,
  GIT_COMMITTER_EMAIL: who.email,
  GIT_COMMITTER_DATE: committer,
});

/** Writes the files, commits them with the subject and body as one message, and records the sha under a key. */
async function commitAs(key: string, who: Person, author: string, subject: string, body: string, files: Record<string, string>, committer = author): Promise<void> {
  for (const [file, text] of Object.entries(files)) {
    await mkdir(join(dir, dirname(file)), { recursive: true });
    await writeFile(join(dir, file), text);
  }
  git(["add", "--", ...Object.keys(files)]);
  const message = body ? `${subject}\n\n${body}` : subject;
  git(["commit", "-q", "-F", "-"], as(who, author, committer), message);
  shas[key] = git(["rev-parse", "HEAD"]);
}

async function build(): Promise<void> {
  dir = await mkdtemp(join(tmpdir(), "workproof-reviews-"));
  git(["init", "-q", "-b", "main"]);
  // Two addresses of one person; the mailmap resolves the old one to the canonical one.
  await commitAs("base", ADA, "2026-02-10T09:00:00+00:00", "docs: start", "", { "README.md": "readme\n", ".mailmap": "Sam Ortega <sam@alpha.example> <old@epsilon.example>\n" });
  await commitAs("independent", ADA, "2026-03-02T10:00:00+00:00", SUBJECT.independent, "Reviewed-by: Ben Ortiz <ben@north.example>", { "lib/a.ts": "export const a = 1;\n" });
  await commitAs("selfAddress", ADA, "2026-03-03T10:00:00+00:00", SUBJECT.selfAddress, "Reviewed-by: Ada Lind <ada@north.example>", { "lib/b.ts": "export const b = 1;\n" });
  await commitAs("selfAlias", SAM, "2026-03-04T10:00:00+00:00", SUBJECT.selfAlias, "Reviewed-by: S. Ortega <old@epsilon.example>", { "lib/s.ts": "export const s = 1;\n" });
  await commitAs("noTrailer", DEE, "2026-03-05T10:00:00+00:00", SUBJECT.noTrailer, `Signed-off-by: ${DEE.name} <${DEE.email}>`, { "lib/c.ts": "export const c = 1;\n" });
  // "Reviewed-by:" in a prose paragraph; the last paragraph is not a trailer block, so git parses nothing.
  await commitAs(
    "quoted",
    CY,
    "2026-03-06T10:00:00+00:00",
    SUBJECT.quoted,
    "Talked it through with Ben.\n\nReviewed-by: Ben Ortiz <ben@north.example> was promised but never recorded.\n\nSee the ticket for detail.",
    { "lib/q.ts": "export const q = 1;\n" },
  );
  await commitAs("acked", DEE, "2026-03-07T10:00:00+00:00", SUBJECT.acked, `Acked-by: ${CY.name} <${CY.email}>`, { "lib/d.ts": "export const d = 1;\n" });

  // Feature branch with two commits, merged by Ben with a Reviewed-by from Dee.
  git(["checkout", "-q", "-b", "feature"]);
  await commitAs("featureOne", ADA, "2026-03-08T10:00:00+00:00", SUBJECT.featureOne, "", { "lib/m1.ts": "export const m1 = 1;\n" });
  await commitAs("featureTwo", CY, "2026-03-09T10:00:00+00:00", SUBJECT.featureTwo, "", { "lib/m2.ts": "export const m2 = 1;\n" });
  git(["checkout", "-q", "main"]);
  await commitAs("mainTwo", ADA, "2026-03-10T10:00:00+00:00", SUBJECT.mainTwo, "", { "lib/main2.ts": "export const main2 = 1;\n" });
  git(["merge", "-q", "--no-ff", "-m", `Merge feature\n\nReviewed-by: ${DEE.name} <${DEE.email}>`, "feature"], as(BEN, "2026-03-12T10:00:00+00:00"));
  shas.merge = git(["rev-parse", "HEAD"]);

  // A revert of the first commit, with its own Reviewed-by from Cy.
  git(["revert", "--no-commit", shas.independent!], as(ADA, "2026-03-13T10:00:00+00:00"));
  await commitAs(
    "revert",
    ADA,
    "2026-03-13T10:00:00+00:00",
    SUBJECT.revert,
    `This reverts commit ${shas.independent}.\n\nReviewed-by: ${CY.name} <${CY.email}>`,
    {},
  );

  // Authored in February, committed in March: outside the window by author date.
  await commitAs("late", BEN, "2026-02-27T12:00:00+00:00", SUBJECT.late, "", { "lib/late.ts": "export const late = 1;\n" }, "2026-03-14T09:00:00+00:00");
  // Authored at 23:30 on the last day in a negative offset: the next day in UTC, still the last day locally.
  await commitAs("lastDay", ADA, "2026-03-31T23:30:00-05:00", SUBJECT.lastDay, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/last.ts": "export const last = 1;\n" });
  // A commit that touches only the README.
  await commitAs("readme", DEE, "2026-03-20T10:00:00+00:00", SUBJECT.readme, "", { "README.md": "readme, updated\n" });
  // A bot author with a human reviewer.
  await commitAs("bot", BOT, "2026-03-21T10:00:00+00:00", SUBJECT.bot, `Reviewed-by: ${CY.name} <${CY.email}>`, { "lib/gen.ts": "export const gen = 1;\n" });
  // A lowercase trailer key, which is a valid trailer.
  await commitAs("lowercase", CY, "2026-03-22T10:00:00+00:00", SUBJECT.lowercase, `reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/e.ts": "export const e = 1;\n" });
  await commitAs("csvGuard", ADA, "2026-03-23T10:00:00+00:00", SUBJECT.csvGuard, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/sum.ts": "export const sum = 1;\n" });
  await commitAs("control", ADA, "2026-03-24T10:00:00+00:00", SUBJECT.control, `Reviewed-by: ${DEE.name} <${DEE.email}>`, { "lib/ctl.ts": "export const ctl = 1;\n" });
}

/** Runs the command and returns its output and exit code. */
async function run(args: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const code = await runReviews(args, { write: (s: string) => ((out += s), true) });
  return { code, out };
}

interface JsonRow { sha: string; author: string; author_date: string; reviewer: string; status: string; satisfies: string; basis: string; subject: string; raw_author_email: string }
interface JsonReport { computed: boolean; reason?: string; convention: string[]; summary: string; rows: JsonRow[]; outOfScope: { reason: string; count: number; shas: string[] }[] }

async function json(extra: string[] = []): Promise<JsonReport> {
  const { code, out } = await run(["--repo", dir, "--format", "json", ...WINDOW, ...extra]);
  assert.equal(code, 0);
  return JSON.parse(out) as JsonReport;
}

const rowFor = (report: JsonReport, subject: string): JsonRow => {
  const row = report.rows.find((r) => r.subject === subject);
  assert.ok(row, `no in-scope row for ${subject}`);
  return row;
};

before(async () => {
  process.env.GIT_CONFIG_GLOBAL = "/dev/null";
  await build();
});

after(async () => {
  await rm(dir, { recursive: true, force: true });
});

test("every status is reached by one commit in the fixture", async () => {
  const report = await json();
  assert.equal(report.computed, true);
  assert.equal(rowFor(report, SUBJECT.independent).status, "independent review");
  assert.equal(rowFor(report, SUBJECT.selfAddress).status, "self-review");
  assert.equal(rowFor(report, SUBJECT.featureOne).status, "reviewed via merge (weaker)");
  assert.equal(rowFor(report, SUBJECT.quoted).status, "quoted in message, not a trailer");
  assert.equal(rowFor(report, SUBJECT.acked).status, "other approval only");
  assert.equal(rowFor(report, SUBJECT.noTrailer).status, "no review trailer");
});

test("the fixed convention lines are printed exactly", async () => {
  const { out } = await run(["--repo", dir, ...WINDOW]);
  const lines = out.split("\n");
  assert.equal(lines[0], "Convention: author date, local date in the commit's own offset; window 2026-03-01 to 2026-03-31; paths whole repository.");
  for (const line of CONVENTION_FIXED) assert.ok(lines.includes(line), `missing: ${line}`);
  assert.equal(CONVENTION_FIXED.length, 3);
});

test("a commit whose reviewer is the author by address is self-review with that basis", async () => {
  const row = rowFor(await json(), SUBJECT.selfAddress);
  assert.equal(row.status, "self-review");
  assert.equal(row.satisfies, "no");
  assert.match(row.basis, /same address/);
});

test("a reviewer whose address is a .mailmap alias of the author is self-review by mailmap", async () => {
  const row = rowFor(await json(), SUBJECT.selfAlias);
  assert.equal(row.status, "self-review");
  assert.match(row.basis, /mailmap alias/);
  assert.equal(row.author, "Sam Ortega <sam@alpha.example>");
});

test("a lowercase reviewed-by key is a valid trailer", async () => {
  const row = rowFor(await json(), SUBJECT.lowercase);
  assert.equal(row.status, "independent review");
  assert.equal(row.satisfies, "yes");
});

test("a Reviewed-by: inside a prose paragraph is quoted, not a trailer", async () => {
  const row = rowFor(await json(), SUBJECT.quoted);
  assert.equal(row.status, "quoted in message, not a trailer");
  assert.equal(row.reviewer, "");
});

test("an Acked-by alone is other approval, and the author's own sign-off is not an approval", async () => {
  const report = await json();
  assert.equal(rowFor(report, SUBJECT.acked).status, "other approval only");
  const own = rowFor(report, SUBJECT.noTrailer);
  assert.equal(own.status, "no review trailer");
  assert.match(own.basis, /own sign-off/);
});

test("a merge's Reviewed-by covers both branch commits, labelled weaker, and nothing beyond the second parent", async () => {
  const report = await json();
  for (const subject of [SUBJECT.featureOne, SUBJECT.featureTwo]) {
    const row = rowFor(report, subject);
    assert.equal(row.status, "reviewed via merge (weaker)");
    assert.equal(row.satisfies, "yes (weaker)");
    assert.match(row.basis, /second-parent range of merge/);
  }
  // Main-line commits were not merged by the merge, so they keep their own status.
  assert.equal(rowFor(report, SUBJECT.mainTwo).status, "no review trailer");
  // The commit before the fork is an ancestor of both parents, so the range must not reach it.
  assert.equal(rowFor(report, SUBJECT.noTrailer).status, "no review trailer");
});

test("a revert is in scope like any commit and says what it reverts", async () => {
  const row = rowFor(await json(), SUBJECT.revert);
  assert.equal(row.status, "independent review");
  assert.match(row.basis, new RegExp(`revert of ${shas.independent!.slice(0, 7)}`));
});

test("a commit authored before the window and committed inside it is out of scope", async () => {
  const report = await json();
  assert.equal(report.rows.some((r) => r.subject === SUBJECT.late), false);
  const group = report.outOfScope.find((g) => g.reason === "authored outside the window, committed inside it");
  assert.ok(group, "reason group present");
  assert.ok(group.shas.includes(shas.late!));
});

test("a commit at 23:30 on the last day in a negative offset is in scope for that day", async () => {
  const row = rowFor(await json(), SUBJECT.lastDay);
  assert.equal(row.author_date, "2026-03-31");
  assert.equal(row.status, "independent review");
});

test("with --path lib/ a README-only commit is out of scope", async () => {
  const report = await json(["--path", "lib/"]);
  assert.equal(report.rows.some((r) => r.subject === SUBJECT.readme), false);
  const group = report.outOfScope.find((g) => g.reason === "do not touch the paths");
  assert.ok(group?.shas.includes(shas.readme!));
  assert.match(report.convention[0]!, /paths lib\/\./);
  // Without the filter the same commit is in scope.
  assert.equal(rowFor(await json(), SUBJECT.readme).status, "no review trailer");
});

test("a bot-authored commit touching lib/ is in scope and takes its status from its trailers", async () => {
  const row = rowFor(await json(["--path", "lib/"]), SUBJECT.bot);
  assert.equal(row.status, "independent review");
  assert.equal(row.author.startsWith("releasebot <bot@ci.example>"), true);
});

test("a csv cell starting with = gets a leading single quote", async () => {
  const { out } = await run(["--repo", dir, "--format", "csv", ...WINDOW]);
  assert.match(out, /,'=SUM\(A1\) tidy lib(\n|$)/, "guarded subject in csv (the subject is the last column)");
  assert.equal(out.includes(",=SUM(A1)"), false);
  assert.equal(csvCell("=1+1"), "'=1+1");
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell("plain"), "plain");
});

test("control characters are stripped from subjects in every format", async () => {
  const report = await json();
  const row = rowFor(report, "feat(lib): tidy[2K output");
  assert.equal(row.status, "independent review");
  const { out } = await run(["--repo", dir, ...WINDOW]);
  assert.equal(/\u001b|\u0007/.test(out), false);
});

test("the csv header and a row carry the documented columns", async () => {
  const { out } = await run(["--repo", dir, "--format", "csv", ...WINDOW]);
  assert.equal(out.split("\n")[0], "sha,author,author_date,reviewer,status,satisfies,basis,subject");
});

test("the summary line counts in scope and the groups that do not satisfy", async () => {
  const report = await json();
  assert.match(report.summary, /^\d+ in scope: \d+ independent, \d+ via merge \(weaker\), \d+ do not satisfy \(self-review \d+, no trailer \d+, quoted \d+, other approval \d+\)$/);
  const counted = report.rows.length;
  assert.ok(report.summary.startsWith(`${counted} in scope:`));
});

test("--out writes the file once, prints wrote and the summary, and refuses to overwrite", async () => {
  const file = join(dir, "..", `reviews-out-${process.pid}-${Date.now()}.txt`);
  const first = await run(["--repo", dir, ...WINDOW, "--out", file]);
  assert.equal(first.code, 0);
  assert.match(first.out, /^wrote /);
  assert.equal(existsSync(file), true);
  assert.equal((await readFile(file, "utf8")).startsWith("Convention:"), true);
  const second = await run(["--repo", dir, ...WINDOW, "--out", file]);
  assert.equal(second.code, 1);
  await rm(file, { force: true });
});

test("exit codes: 0 when it ran, 1 for usage errors, 0 with not computed for a git failure", async () => {
  assert.equal((await run(["--repo", dir, ...WINDOW])).code, 0);
  assert.equal((await run(["--repo", dir, "--since", "2026-13-40"])).code, 1);
  assert.equal((await run(["--repo", dir, "--since", "2026-03-01T00:00"])).code, 1, "an instant without an offset is refused");
  assert.equal((await run(["--repo", dir, "--format", "xml"])).code, 1);
  assert.equal((await run(["--repo", dir, "--trailer", "not a key"])).code, 1);
  assert.equal((await run(["--bogus"])).code, 1);
  const plain = await mkdtemp(join(tmpdir(), "workproof-reviews-plain-"));
  try {
    const failed = await run(["--repo", plain]);
    assert.equal(failed.code, 0);
    assert.match(failed.out, /^not computed \(/);
    const failedJson = await run(["--repo", plain, "--format", "json"]);
    assert.equal(failedJson.code, 0);
    assert.equal((JSON.parse(failedJson.out) as { computed: boolean }).computed, false);
  } finally {
    await rm(plain, { recursive: true, force: true });
  }
});

test("the out-of-scope block lists merges as a count only", async () => {
  const report = await json();
  const merges = report.outOfScope.find((g) => g.reason.startsWith("merge commits"));
  assert.ok(merges && merges.count >= 1);
  assert.deepEqual(merges.shas, []);
});

test("the raw recorded author address is kept beside the mailmap-resolved one", async () => {
  const row = rowFor(await json(), SUBJECT.selfAlias);
  assert.equal(row.raw_author_email, "sam@alpha.example");
});

test("a second reading gives the same rows (deterministic)", async () => {
  const a = await json();
  const b = await json();
  assert.deepEqual(a.rows, b.rows);
});

