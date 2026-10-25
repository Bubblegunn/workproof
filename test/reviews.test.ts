import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { runReviews, csvCell, clean, CONVENTION_FIXED } from "../src/reviews.js";

// Invented people on .example domains; every date is fixed so the fixture is the same on every run.
interface Person { name: string; email: string }
const ADA: Person = { name: "Ada Lind", email: "ada@north.example" };
const BEN: Person = { name: "Ben Ortiz", email: "ben@north.example" };
const CY: Person = { name: "Cy Marsh", email: "cy@south.example" };
const DEE: Person = { name: "Dee Park", email: "dee@south.example" };
const SAM: Person = { name: "Sam Ortega", email: "sam@alpha.example" };
const BOT: Person = { name: "releasebot", email: "bot@ci.example" };

const WINDOW = ["--since", "2026-03-01", "--until", "2026-03-31"];
const MAILMAP = "Sam Ortega <sam@alpha.example> <old@epsilon.example>\n";

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
  recorded: "feat(lib): recorded name",
  spelling: "docs: mailmap for a second spelling",
  addressRaw: "feat(lib): contact dana@y.example about tidy",
  localPart: "feat(lib): local part only",
  emptyTrailer: "feat(lib): empty reviewer",
  signedOther: "feat(lib): signed off by another",
  longName: "feat(lib): long name",
  soloAda: "feat(lib): solo by ada",
  soloCy: "feat(lib): solo by cy",
  octA: "feat(lib): oct a",
  octB: "feat(lib): oct b",
};

let dir = "";
const shas: Record<string, string> = {};
const baseEnv = { PATH: process.env.PATH ?? "", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

const git = (args: string[], env: Record<string, string> = {}, input?: string, cwd = dir): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", env: { ...baseEnv, ...env }, input }).trim();

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
  await commitAs("base", ADA, "2026-02-10T09:00:00+00:00", "docs: start", "", { "README.md": "readme\n", ".mailmap": MAILMAP });
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
  await commitAs("revert", ADA, "2026-03-13T10:00:00+00:00", SUBJECT.revert, `This reverts commit ${shas.independent}.\n\nReviewed-by: ${CY.name} <${CY.email}>`, {});

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
  // A second recorded spelling of Ada's name, mapped to the canonical name by .mailmap.
  await commitAs("spelling", ADA, "2026-03-25T10:00:00+00:00", SUBJECT.spelling, "", { ".mailmap": MAILMAP + "Ada Lind <ada@north.example> A. Lind <ada@north.example>\n" });
  await commitAs("recorded", { name: "A. Lind", email: ADA.email }, "2026-03-26T10:00:00+00:00", SUBJECT.recorded, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/rec.ts": "export const rec = 1;\n" });
  // An address in the author's name and in the subject.
  await commitAs("addressRaw", { name: "john@x.example", email: "john@a.example" }, "2026-03-27T10:00:00+00:00", SUBJECT.addressRaw, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/addr.ts": "export const addr = 1;\n" });
  // Same local part, different domain: a different person, not a self-review.
  await commitAs("localPart", { name: "John Doe", email: "john@a.example" }, "2026-03-27T11:00:00+00:00", SUBJECT.localPart, "Reviewed-by: Jo Ward <john@b.example>", { "lib/john.ts": "export const john = 1;\n" });
  // Trailers that name nobody are not reviewers.
  await commitAs("emptyTrailer", DEE, "2026-03-27T12:00:00+00:00", SUBJECT.emptyTrailer, "Reviewed-by:\nReviewed-by: <>", { "lib/empty.ts": "export const empty = 1;\n" });
  // A Signed-off-by from someone else is not an approval.
  await commitAs("signedOther", CY, "2026-03-27T13:00:00+00:00", SUBJECT.signedOther, `Signed-off-by: ${ADA.name} <${ADA.email}>`, { "lib/so.ts": "export const so = 1;\n" });
  // A subject longer than 200 characters and a name longer than 80.
  await commitAs("longSubject", ADA, "2026-03-27T14:00:00+00:00", `feat(lib): ${"z".repeat(230)}`, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/long.ts": "export const long = 1;\n" });
  await commitAs("longName", { name: "n".repeat(90), email: "long@north.example" }, "2026-03-27T15:00:00+00:00", SUBJECT.longName, `Reviewed-by: ${BEN.name} <${BEN.email}>`, { "lib/ln.ts": "export const ln = 1;\n" });

  // A merge by Ben whose Reviewed-by names Ada: Ada's own commit on that branch is not reviewed by it.
  git(["checkout", "-q", "-b", "solo"]);
  await commitAs("soloAda", ADA, "2026-03-28T10:00:00+00:00", SUBJECT.soloAda, "", { "lib/solo.ts": "export const solo = 1;\n" });
  await commitAs("soloCy", CY, "2026-03-28T11:00:00+00:00", SUBJECT.soloCy, "", { "lib/solo2.ts": "export const solo2 = 1;\n" });
  git(["checkout", "-q", "main"]);
  git(["merge", "-q", "--no-ff", "-m", `Merge solo\n\nReviewed-by: ${ADA.name} <${ADA.email}>`, "solo"], as(BEN, "2026-03-28T12:00:00+00:00"));
  shas.solo = git(["rev-parse", "HEAD"]);

  // An octopus merge: three parents, the two branch commits are both covered.
  git(["checkout", "-q", "-b", "oct-a"]);
  await commitAs("octA", BEN, "2026-03-28T13:00:00+00:00", SUBJECT.octA, "", { "lib/oa.ts": "export const oa = 1;\n" });
  git(["checkout", "-q", "main"]);
  git(["checkout", "-q", "-b", "oct-b"]);
  await commitAs("octB", CY, "2026-03-28T14:00:00+00:00", SUBJECT.octB, "", { "lib/ob.ts": "export const ob = 1;\n" });
  git(["checkout", "-q", "main"]);
  git(["merge", "-q", "--no-ff", "-m", `Merge oct\n\nReviewed-by: ${DEE.name} <${DEE.email}>`, "oct-a", "oct-b"], as(ADA, "2026-03-28T15:00:00+00:00"));
  shas.octopus = git(["rev-parse", "HEAD"]);
  const parents = git(["rev-list", "--parents", "-n", "1", "HEAD"]).split(" ").length - 1;
  assert.equal(parents, 3, "the octopus merge has three parents");
}

/** Runs the command and returns its output and exit code. */
async function run(args: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const code = await runReviews(args, { write: (s: string) => ((out += s), true) });
  return { code, out };
}

interface JsonRow { sha: string; author: string; author_date: string; reviewer: string; status: string; satisfies: string; basis: string; subject: string }
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

const rowBySha = (report: JsonReport, sha: string): JsonRow => {
  const row = report.rows.find((r) => r.sha === sha);
  assert.ok(row, `no in-scope row for ${sha.slice(0, 7)}`);
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
  assert.equal(lines[0], "Convention: author date, UTC date; window 2026-03-01 to 2026-03-31; paths whole repository.");
  for (const line of CONVENTION_FIXED) assert.ok(lines.includes(line), `missing: ${line}`);
  assert.equal(CONVENTION_FIXED.length, 3);
});

test("a commit whose reviewer is the author by address is self-review with that basis", async () => {
  const row = rowFor(await json(), SUBJECT.selfAddress);
  assert.equal(row.status, "self-review");
  assert.equal(row.satisfies, "no");
  assert.match(row.basis, /same person: same address/);
});

test("a reviewer whose address is a .mailmap alias of the author is self-review by mailmap", async () => {
  const row = rowFor(await json(), SUBJECT.selfAlias);
  assert.equal(row.status, "self-review");
  assert.match(row.basis, /same person: mailmap alias/);
  assert.equal(row.author, "Sam Ortega");
  assert.equal(row.reviewer, "Sam Ortega");
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

test("an Acked-by is other approval; a Signed-off-by is not an approval, whoever signs", async () => {
  const report = await json();
  assert.equal(rowFor(report, SUBJECT.acked).status, "other approval only");
  const own = rowFor(report, SUBJECT.noTrailer);
  assert.equal(own.status, "no review trailer");
  assert.equal(own.basis, "no review trailer");
  assert.equal(rowFor(report, SUBJECT.signedOther).status, "no review trailer");
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

test("a 3-parent merge covers the commits of every non-first parent", async () => {
  const report = await json();
  for (const subject of [SUBJECT.octA, SUBJECT.octB]) {
    const row = rowFor(report, subject);
    assert.equal(row.status, "reviewed via merge (weaker)", subject);
    assert.match(row.basis, new RegExp(`merge ${shas.octopus!.slice(0, 7)}`));
  }
});

test("a merge's reviewer who is the author of a covered commit does not review that commit", async () => {
  const report = await json();
  const own = rowFor(report, SUBJECT.soloAda);
  assert.equal(own.status, "self-review");
  assert.equal(own.basis, `only the author is named on the merge (merge ${shas.solo!.slice(0, 7)})`);
  assert.equal(own.reviewer, "Ada Lind");
  const other = rowFor(report, SUBJECT.soloCy);
  assert.equal(other.status, "reviewed via merge (weaker)");
  assert.equal(other.reviewer, "Ada Lind");
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

test("a commit at 23:30 on the last day in a negative offset is the next day in UTC (out of the window) and in scope for that day with --tz", async () => {
  assert.equal((await json()).rows.some((r) => r.subject === SUBJECT.lastDay), false, "the instant is 2026-04-01T04:30Z");
  const row = rowFor(await json(["--tz", "-05:00"]), SUBJECT.lastDay);
  assert.equal(row.author_date, "2026-03-31");
  assert.equal(row.status, "independent review");
  const legacy = rowFor(await json(["--tz", "commit"]), SUBJECT.lastDay);
  assert.equal(legacy.author_date, "2026-03-31");
  // The printed date is the day in the zone: 2026-03-20T10:00Z is already 03-21 at +14:00.
  assert.equal(rowFor(await json(), SUBJECT.readme).author_date, "2026-03-20");
  assert.equal(rowFor(await json(["--tz", "+14:00"]), SUBJECT.readme).author_date, "2026-03-21");
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
  assert.equal(row.author, "releasebot");
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
  const row = rowFor(await json(), "feat(lib): tidy[2K output");
  assert.equal(row.status, "independent review");
  const { out } = await run(["--repo", dir, ...WINDOW]);
  assert.equal(/\u001b|\u0007/.test(out), false);
});

test("clean removes format and line-separator characters and caps lengths", () => {
  assert.equal(clean("a‮b​c\u2028d\u2029e\u0007f"), "abcdef");
  assert.equal(clean("x".repeat(300), 200).length, 200);
  assert.equal(clean("john@x.example"), "(address)");
  assert.equal(clean("see dana@y.example now"), "see (address) now");
});

test("the csv header and a row carry the documented columns", async () => {
  const { out } = await run(["--repo", dir, "--format", "csv", ...WINDOW]);
  assert.equal(out.split("\n")[0], "sha,author,author_date,reviewer,status,satisfies,basis,subject");
});

test("the summary line counts in scope and the groups that do not satisfy", async () => {
  const report = await json();
  assert.match(report.summary, /^\d+ in scope: \d+ independent, \d+ via merge \(weaker\), \d+ do not satisfy \(self-review \d+, no trailer \d+, quoted \d+, other approval \d+\)$/);
  assert.ok(report.summary.startsWith(`${report.rows.length} in scope:`));
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

test("exit codes: 0 when it ran, 1 for usage errors, 2 when nothing could be computed", async () => {
  assert.equal((await run(["--repo", dir, ...WINDOW])).code, 0);
  assert.equal((await run(["--repo", dir, "--since", "2026-13-40"])).code, 1);
  assert.equal((await run(["--repo", dir, "--since", "2026-03-01T00:00"])).code, 1, "an instant without an offset is refused");
  assert.equal((await run(["--repo", dir, "--format", "xml"])).code, 1);
  assert.equal((await run(["--repo", dir, "--trailer", "not a key"])).code, 1);
  assert.equal((await run(["--bogus"])).code, 1);
  const plain = await mkdtemp(join(tmpdir(), "workproof-reviews-plain-"));
  try {
    const failed = await run(["--repo", plain]);
    assert.equal(failed.code, 2);
    assert.match(failed.out, /^not computed \(/);
    const failedJson = await run(["--repo", plain, "--format", "json"]);
    assert.equal(failedJson.code, 2);
    assert.equal((JSON.parse(failedJson.out) as { computed: boolean }).computed, false);
  } finally {
    await rm(plain, { recursive: true, force: true });
  }
});

test("repeated single-value options and option-looking values are usage errors", async () => {
  assert.equal((await run(["--repo", dir, "--since", "2026-03-01", "--since", "2026-03-02"])).code, 1);
  assert.equal((await run(["--repo", dir, "--until", "2026-03-31", "--until", "2026-03-30"])).code, 1);
  assert.equal((await run(["--repo", dir, "--repo", dir])).code, 1);
  assert.equal((await run(["--repo", dir, "--path", "--since", "--until", "2026-03-31"])).code, 1);
  assert.equal((await run(["--repo", dir, "--trailer", "--format", "json"])).code, 1);
});

test("the out-of-scope block lists merges as a count only", async () => {
  const report = await json();
  const merges = report.outOfScope.find((g) => g.reason.startsWith("merge commits"));
  assert.ok(merges && merges.count >= 1);
  assert.deepEqual(merges.shas, []);
});

test("the author column names the mapped author and adds the recorded name only when it differs", async () => {
  const report = await json();
  assert.equal(rowFor(report, SUBJECT.recorded).author, "Ada Lind (as recorded: A. Lind)");
  assert.equal(rowFor(report, SUBJECT.independent).author, "Ada Lind");
});

test("no email address is printed in text, csv or json output, with or without a path filter", async () => {
  for (const extra of [[], ["--path", "lib/"]]) {
    for (const format of ["text", "csv", "json"]) {
      const { out } = await run(["--repo", dir, "--format", format, ...WINDOW, ...extra]);
      assert.equal(out.includes("@"), false, `${format} ${extra.join(" ")} printed an @`);
    }
  }
  const report = await json(["--path", "lib/"]);
  assert.equal(report.rows.every((r) => !Object.keys(r).some((k) => k.includes("email"))), true);
});

test("an address in an author name or a subject is shown as (address)", async () => {
  const report = await json();
  const row = rowBySha(report, shas.addressRaw!);
  assert.equal(row.author, "(address)");
  assert.equal(row.subject, "feat(lib): contact (address) about tidy");
  const { out } = await run(["--repo", dir, "--format", "csv", ...WINDOW]);
  assert.equal(out.includes("john@x.example") || out.includes("dana@y.example"), false);
});

test("a trailer with an empty name and email names no reviewer", async () => {
  const row = rowBySha(await json(), shas.emptyTrailer!);
  assert.equal(row.status, "no review trailer");
  assert.equal(row.reviewer, "");
});

test("the same local part at a different domain is a different person", async () => {
  const row = rowFor(await json(), SUBJECT.localPart);
  assert.equal(row.status, "independent review");
  assert.equal(row.reviewer, "Jo Ward");
});

test("a subject longer than 200 characters and a name longer than 80 are capped in json and csv", async () => {
  const report = await json();
  assert.equal(rowBySha(report, shas.longSubject!).subject.length, 200);
  assert.equal(rowFor(report, SUBJECT.longName).author.length, 80);
  const { out } = await run(["--repo", dir, "--format", "csv", ...WINDOW]);
  // "feat(lib): " is 11 characters, so a 200-character subject keeps 189 of the z characters.
  assert.match(out, /feat\(lib\): z{189}(\n|$)/m);
  assert.equal(out.includes("z".repeat(190)), false);
  assert.equal(out.includes("n".repeat(81)), false);
});

test("a second reading gives the same rows (deterministic)", async () => {
  const a = await json();
  const b = await json();
  assert.deepEqual(a.rows, b.rows);
});

// Counts the git processes a run starts by putting a logging `git` first on PATH.
async function countGit<T>(fn: () => Promise<T>): Promise<{ result: T; calls: number }> {
  const shimDir = await mkdtemp(join(tmpdir(), "workproof-git-shim-"));
  const log = join(shimDir, "calls.log");
  const real = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
  await writeFile(join(shimDir, "git"), `#!/bin/sh\necho call >> "${log}"\nexec "${real}" "$@"\n`, { mode: 0o755 });
  const oldPath = process.env.PATH;
  process.env.PATH = `${shimDir}:${oldPath}`;
  try {
    const result = await fn();
    const calls = existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean).length : 0;
    return { result, calls };
  } finally {
    process.env.PATH = oldPath;
    await rm(shimDir, { recursive: true, force: true });
  }
}

test("40 reviewed merges are read with a bounded number of git processes, all commits covered", async () => {
  const repo = await mkdtemp(join(tmpdir(), "workproof-reviews-merges-"));
  try {
    const g = (args: string[], env: Record<string, string> = {}) => execFileSync("git", args, { cwd: repo, encoding: "utf8", env: { ...baseEnv, ...env } }).trim();
    g(["init", "-q", "-b", "main"]);
    await mkdir(join(repo, "lib"), { recursive: true });
    await writeFile(join(repo, "README.md"), "readme\n");
    g(["add", "--", "README.md"]);
    g(["commit", "-q", "-m", "docs: start"], as(ADA, "2026-03-01T09:00:00+00:00"));
    for (let i = 0; i < 40; i++) {
      const when = `2026-03-02T10:${String(i).padStart(2, "0")}:00+00:00`;
      g(["checkout", "-q", "-b", `b${i}`, "main"]);
      await writeFile(join(repo, `lib/f${i}.ts`), `export const f${i} = ${i};\n`);
      g(["add", "--", `lib/f${i}.ts`]);
      g(["commit", "-q", "-m", `feat(lib): branch ${i}`], as(ADA, when));
      g(["checkout", "-q", "main"]);
      g(["merge", "-q", "--no-ff", "-m", `Merge b${i}\n\nReviewed-by: ${BEN.name} <${BEN.email}>`, `b${i}`], as(CY, when));
    }
    const { result, calls } = await countGit(async () => {
      const out: string[] = [];
      const code = await runReviews(["--repo", repo, "--format", "json", ...WINDOW], { write: (s: string) => (out.push(s), true) });
      return { code, out: out.join("") };
    });
    assert.equal(result.code, 0);
    const report = JSON.parse(result.out) as JsonReport;
    const branches = report.rows.filter((r) => r.subject.startsWith("feat(lib): branch "));
    assert.equal(branches.length, 40);
    assert.equal(branches.every((r) => r.status === "reviewed via merge (weaker)"), true);
    assert.ok(calls >= 1 && calls <= 6, `git processes: ${calls}`);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

