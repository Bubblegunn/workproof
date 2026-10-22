import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { buildBullets, coverage, parseFactsMarkdown, parseJd } from "../src/bullets.js";
import type { BulletsSource } from "../src/bullets.js";
import { analyseRepo, buildReport, hashOf, newFingerprintKey } from "../src/index.js";
import type { Params, Report } from "../src/index.js";
import { makeRepo } from "./fixture.js";

const CLI = new URL("../src/cli.js", import.meta.url).pathname;
const FIX = join(import.meta.dirname, "..", "..", "test", "fixtures", "bullets");
const read = (f: string) => readFileSync(join(FIX, f), "utf8");
const bank = read("portfolio-bank.md");
const resume = read("past-resume.md");
const jdMl = read("jd-ml.md");
const jdBackend = read("jd-backend.md");
const meta = { version: "0.0.0-test", generatedAt: "2026-10-21T00:00:00Z" };
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]+/i;
const ABSOLUTE = /\/(Users|var|private|tmp|home)\//;
const dashes = (s: string) => (s.match(/[\u2013\u2014]/g) ?? []).length;
const numbers = (s: string) => s.match(/\d+(?:[.,]\d+)*/g) ?? [];

const NO_ENTRY = "No entry of the source covers a requirement. Every requirement is listed under Gaps.";

const HEADINGS = ["## Summary", "## Ranked bullets", "## Skills supported by the facts", "## Gaps", "## Coverage", "## Ordering check", "## Fact table", "## Checklist before you finish"];

/** The non-empty lines under one heading of the draft. */
function section(md: string, heading: string): string[] {
  const lines = md.split("\n");
  const at = lines.indexOf(heading);
  assert.ok(at >= 0, `heading missing: ${heading}`);
  const rest = lines.slice(at + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return (end < 0 ? rest : rest.slice(0, end)).filter((l) => l.trim() !== "");
}

const tableRow = (md: string, label: string): string => {
  const row = section(md, "## Coverage").find((l) => l.startsWith(`| ${label} |`));
  assert.ok(row, `no coverage row for ${label}`);
  return row;
};

const bankDraft = (jd: string) => buildBullets({ jd, source: { kind: "facts", name: "portfolio-bank.md", markdown: bank } });
const resumeDraft = (jd: string) => buildBullets({ jd, source: { kind: "facts", name: "past-resume.md", markdown: resume } });

test("T7: DocQA and ScanSense facts appear verbatim with their tags, and in-progress ScanSense comes after DocQA", () => {
  const { markdown } = bankDraft(jdMl);
  const bullets = section(markdown, "## Ranked bullets");
  const facts = parseFactsMarkdown(bank).entries.flatMap((e) => e.facts);
  for (const tag of ["P01-F1", "P01-F2", "P02-F1"]) {
    const fact = facts.find((f) => f.tag === tag);
    assert.ok(fact, `fact ${tag} parsed`);
    assert.ok(bullets.some((b) => b.endsWith(` ${fact.text} [${tag}]`)), `${tag} is not a bullet verbatim`);
  }
  const at = (tag: string) => bullets.findIndex((b) => b.endsWith(`[${tag}]`));
  assert.ok(at("P01-F1") >= 0 && at("P02-F1") > at("P01-F1"), "in-progress ScanSense must follow DocQA");
});

test("T7: the gaps name PyTorch and Docker, and the vector row says Pinecone and FAISS are missing while Chroma is covered", () => {
  const { markdown, gaps } = bankDraft(jdMl);
  assert.ok(gaps.includes("PyTorch: not in your facts"));
  assert.ok(gaps.includes("Docker: not in your facts"));
  assert.ok(gaps.includes("Pinecone, FAISS: not in your facts; Chroma is covered"));
  assert.ok(section(markdown, "## Gaps").includes("- Pinecone, FAISS: not in your facts; Chroma is covered"));
  assert.ok(tableRow(markdown, "Vector databases: Chroma, Pinecone, FAISS").startsWith("| Vector databases: Chroma, Pinecone, FAISS | yes | yes |"));
  assert.ok(tableRow(markdown, "LLM applications: LangGraph, RAG").includes("| yes | yes |"));
});

test("T7: the skills list has supported terms only, and never PyTorch, Pinecone, FAISS or Docker", () => {
  const { markdown } = bankDraft(jdMl);
  const skills = section(markdown, "## Skills supported by the facts")[0]!.replace(/^- /, "").split(", ");
  for (const term of ["PyTorch", "Pinecone", "FAISS", "Docker"]) assert.ok(!skills.includes(term), term);
  for (const term of ["LangGraph", "RAG", "Chroma", "FastAPI"]) assert.ok(skills.includes(term), `${term} is supported`);
});

test("T7: every number in the draft also appears in the bank", () => {
  const { markdown } = bankDraft(jdMl);
  // Strip what the template adds: list numbers, [tags], and tags in the tables.
  const content = markdown
    .split("\n")
    .filter((l) => !l.startsWith("## "))
    .map((l) => l.replace(/^\d+\. /, "").replace(/\[[^\]]*\]/g, "").replace(/\b[A-Z]+\d*-F\d+\b/g, ""))
    .join("\n");
  const found = numbers(content);
  assert.ok(found.length > 0);
  for (const n of found) assert.ok(bank.includes(n), `number ${n} is not in the bank`);
});

test("T8: the current Cedarline entry (end date Present) is complete and comes first", () => {
  const { markdown } = resumeDraft(jdBackend);
  const { entries } = parseFactsMarkdown(resume);
  assert.equal(entries[0]!.status, "complete", "a Present end date is not in-progress");
  const bullets = section(markdown, "## Ranked bullets");
  const first = entries[0]!.facts[0]!.tag;
  const second = entries[1]!.facts[0]!.tag;
  assert.ok(bullets[0]!.endsWith(`[${first}]`), `first bullet is ${bullets[0]}`);
  assert.ok(bullets.findIndex((b) => b.endsWith(`[${first}]`)) < bullets.findIndex((b) => b.endsWith(`[${second}]`)));
});

test("T8: Rust and gRPC are gaps, and Go, the queue row, event-driven design, PostgreSQL, Terraform and Kubernetes are covered", () => {
  const { markdown, gaps } = resumeDraft(jdBackend);
  assert.ok(gaps.includes("Rust: not in your facts"));
  assert.ok(gaps.includes("gRPC: not in your facts"));
  for (const label of ["Go", "Queue-based systems such as AWS SQS", "Event-driven design", "PostgreSQL", "Terraform"]) {
    assert.ok(tableRow(markdown, label).startsWith(`| ${label} | yes | yes |`), label);
  }
  assert.ok(tableRow(markdown, "Kubernetes").startsWith("| Kubernetes | no | yes | SK-F"));
});

test("T8: the ordering check passes and the entries and dates are unchanged", () => {
  const { markdown } = resumeDraft(jdBackend);
  assert.ok(markdown.includes("Complete before in-progress: ok\n"));
  assert.ok(markdown.includes("Entries and dates unchanged from the source: ok\n"));
});

test("the headings appear in the template order, and Gaps is present even when nothing is missing", () => {
  const { markdown } = bankDraft("## Required\n- Chroma\n- FastAPI\n");
  assert.deepEqual(markdown.split("\n").filter((l) => l.startsWith("## ")), HEADINGS);
  assert.deepEqual(section(markdown, "## Gaps"), ["None."]);
});

test("Summary: the first line in facts mode names the first ranked entry, and has no digit", () => {
  const docqa = section(bankDraft(jdMl).markdown, "## Summary");
  assert.deepEqual(docqa, ["Ranked first: DocQA. Requirements that no fact covers are listed under Gaps."]);
  assert.ok(!/\d/.test(docqa[0]!), "the facts-mode summary has a digit");
  const cedarline = section(resumeDraft(jdBackend).markdown, "## Summary");
  assert.deepEqual(cedarline, ["Ranked first: Cedarline Logistics. Requirements that no fact covers are listed under Gaps."]);
  assert.ok(!/\d/.test(cedarline[0]!), "the facts-mode summary has a digit");
});

test("Summary: a source with no entry covering a requirement says so, and the bullets section says None.", () => {
  const { markdown } = buildBullets({ jd: "## Required\n- Rust\n", source: { kind: "facts", name: "f.md", markdown: "## E01 Co\nStatus: complete\n" } });
  assert.deepEqual(section(markdown, "## Summary"), ["No entry of the source covers a requirement. Every requirement is listed under Gaps."]);
  assert.deepEqual(section(markdown, "## Ranked bullets"), ["None."]);
  const empty = buildBullets({ jd: jdMl, source: { kind: "facts", name: "empty.md", markdown: "" } });
  assert.deepEqual(section(empty.markdown, "## Summary"), ["No entry of the source covers a requirement. Every requirement is listed under Gaps."]);
});

test("Summary: the report-mode first line carries the report's exact figures and the two hash tags", async () => {
  const dir = await makeRepo();
  try {
    const key = newFingerprintKey();
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const report = buildReport([await analyseRepo(dir, params)], params, meta);
    const hash8 = report.hash.slice(0, 8);
    const figures = report.repositories[0]!.figures;
    const commit = figures.find((f) => f.id === "commitShare")!.value as { author: number; total: number; share: number };
    const lines = figures.find((f) => f.id === "survivingLines")!.value as { lines: number; linesAttributed: number; share: number };
    const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
    const n = (x: number) => x.toLocaleString("en-US");
    const expected = `Made ${n(commit.author)} of the ${n(commit.total)} non-merge commits in the tenure window (${pct(commit.share)}) and authored ${n(lines.lines)} of the ${n(lines.linesAttributed)} lines still in the project today (${pct(lines.share)}). [commitShare #${hash8}, survivingLines #${hash8}]`;
    const out = buildBullets({ jd: "## Required\n- TypeScript\n", source: { kind: "report", report } });
    assert.deepEqual(section(out.markdown, "## Summary"), [expected]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Checklist: the section sits after the Fact table and has four unchecked boxes", () => {
  const { markdown } = bankDraft(jdMl);
  const lines = markdown.split("\n");
  assert.ok(lines.indexOf("## Checklist before you finish") > lines.indexOf("## Fact table"), "checklist must follow the Fact table");
  const boxes = section(markdown, "## Checklist before you finish");
  assert.equal(boxes.length, 4, markdown);
  for (const b of boxes) assert.ok(b.startsWith("- [ ] "), b);
  assert.ok(!markdown.includes("- [x]"));
  assert.equal(markdown.trimEnd().split("\n").at(-1), boxes.at(-1));
});

test("the JD parser reads must-have and nice-to-have rows, and the alternatives and single-term forms", () => {
  const ml = parseJd(jdMl);
  assert.equal(ml.target, "Sample JD (fictional): ML Engineer, Retail AI");
  assert.ok(ml.rows.some((r) => r.label === "Docker" && r.must && r.mode === "single"));
  assert.ok(ml.rows.some((r) => r.label.startsWith("Vector databases") && r.mode === "alternatives" && r.terms.length === 3));
  const backend = parseJd(jdBackend);
  assert.ok(backend.rows.some((r) => r.label === "Kubernetes" && !r.must), "Kubernetes is nice-to-have");
  assert.ok(backend.rows.some((r) => r.label === "Rust" && !r.must));
});

test("Go matches only the capitalised word, and hyphens match spaces", () => {
  const small = "## E01 Test Co\nStatus: complete\n- F1: We went to market with a plan.\n- F2: Built event driven services in Go.\n";
  const { gaps } = buildBullets({ jd: "## Required\n- Go\n- event-driven services\n", source: { kind: "facts", name: "small.md", markdown: small } });
  assert.deepEqual(gaps, []);
  const lower = buildBullets({ jd: "## Required\n- Go\n", source: { kind: "facts", name: "small.md", markdown: "## E01 Test Co\n- F1: We went to market.\n" } });
  assert.deepEqual(lower.gaps, ["Go: not in your facts"]);
});

test("the draft adds no dash character that the sources do not contain", () => {
  assert.ok(dashes(bankDraft(jdMl).markdown) <= dashes(bank));
  assert.ok(dashes(resumeDraft(jdBackend).markdown) <= dashes(resume));
});

test("the draft carries no email address and no absolute path", () => {
  for (const { markdown } of [bankDraft(jdMl), resumeDraft(jdBackend)]) {
    assert.ok(!EMAIL.test(markdown), "an email address is in the draft");
    assert.ok(!ABSOLUTE.test(markdown), "an absolute path is in the draft");
  }
});

test("two runs over the same input are byte-identical", () => {
  assert.equal(bankDraft(jdMl).markdown, bankDraft(jdMl).markdown);
  assert.equal(resumeDraft(jdBackend).markdown, resumeDraft(jdBackend).markdown);
});

test("report mode: figure tags carry the hash, Rust is a gap, and each figure sentence matches the figure", async () => {
  const dir = await makeRepo();
  const work = await mkdtemp(join(tmpdir(), "workproof-bullets-"));
  try {
    const key = newFingerprintKey();
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const report = buildReport([await analyseRepo(dir, params)], params, meta);
    const hash8 = report.hash.slice(0, 8);
    const figure = report.repositories[0]!.figures.find((f) => f.id === "survivingLines")!.value as { lines: number; linesAttributed: number; share: number };
    const out = buildBullets({ jd: "## Required\n- TypeScript\n- Rust\n", source: { kind: "report", report } });
    const expected = `Authored ${figure.lines.toLocaleString("en-US")} of the ${figure.linesAttributed.toLocaleString("en-US")} lines still in the project today (${(figure.share * 100).toFixed(1)}%)`;
    assert.ok(section(out.markdown, "## Ranked bullets").some((b) => b.endsWith(` ${expected} [survivingLines #${hash8}]`)), out.markdown);
    assert.ok(out.markdown.includes(`Source: workproof report ${hash8}`));
    assert.deepEqual(out.gaps, ["Rust: not in your facts"]);
    assert.ok(tableRow(out.markdown, "TypeScript").includes(`| yes | footprint #${hash8} |`));

    const bad = { ...report, hash: "f".repeat(64) } as Report;
    assert.throws(() => buildBullets({ jd: "## Required\n- Rust\n", source: { kind: "report", report: bad } }), /fails its check/);
    const reportPath = join(work, "report.json");
    const jdPath = join(work, "jd.md");
    await writeFile(reportPath, JSON.stringify(bad));
    await writeFile(jdPath, "## Required\n- Rust\n");
    const refused = spawnSync(process.execPath, [CLI, "bullets", "--jd", jdPath, "--report", reportPath], { encoding: "utf8" });
    assert.equal(refused.status, 1, refused.stderr);
  } finally {
    await rm(dir, { recursive: true, force: true });
    await rm(work, { recursive: true, force: true });
  }
});

test("the CLI writes the draft with --out, prints it otherwise, and exits 1 on a usage error or an unreadable file", async () => {
  const work = await mkdtemp(join(tmpdir(), "workproof-bullets-cli-"));
  try {
    const out = join(work, "draft.md");
    const run = spawnSync(process.execPath, [CLI, "bullets", "--jd", join(FIX, "jd-ml.md"), "--facts", join(FIX, "portfolio-bank.md"), "--out", out], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(await readFile(out, "utf8"), bankDraft(jdMl).markdown);
    const printed = spawnSync(process.execPath, [CLI, "bullets", "--jd", join(FIX, "jd-backend.md"), "--facts", join(FIX, "past-resume.md")], { encoding: "utf8" });
    assert.equal(printed.status, 0, printed.stderr);
    assert.equal(printed.stdout, resumeDraft(jdBackend).markdown);

    const noJd = spawnSync(process.execPath, [CLI, "bullets", "--facts", join(FIX, "portfolio-bank.md")], { encoding: "utf8" });
    assert.equal(noJd.status, 1);
    const both = spawnSync(process.execPath, [CLI, "bullets", "--jd", join(FIX, "jd-ml.md"), "--facts", join(FIX, "portfolio-bank.md"), "--report", out], { encoding: "utf8" });
    assert.equal(both.status, 1);
    const missing = spawnSync(process.execPath, [CLI, "bullets", "--jd", join(work, "nope.md"), "--facts", join(FIX, "portfolio-bank.md")], { encoding: "utf8" });
    assert.equal(missing.status, 1);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});

// ---- Matching (B1, B3, B5) ----

const one = (label: string, mode: "single" | "alternatives" = "single", terms: string[] = [label]) => ({ label, must: true, terms, mode });
const covered = (label: string, texts: string[]) => coverage(one(label), texts).covered;

test("B1: Java does not match Java-Script, and Lead does not match Lead-ership", () => {
  assert.equal(covered("Java", ["Java-Script expert"]), false);
  assert.equal(covered("Lead", ["Lead-ership training"]), false);
  assert.equal(covered("Java", ["Wrote Java services"]), true);
});

test("B1: event-driven and event driven are the same term in either direction", () => {
  assert.equal(covered("event-driven", ["Built event driven services"]), true);
  assert.equal(covered("event driven", ["Built event-driven services"]), true);
  assert.equal(covered("Event-driven design", ["event driven design"]), true);
});

test("B1: R does not match R&D and C does not match C#, but standalone R and C match", () => {
  assert.equal(covered("R", ["Led R&D projects"]), false);
  assert.equal(covered("C", ["Shipped C# tooling"]), false);
  assert.equal(covered("R", ["R programming for analysts"]), true);
  assert.equal(covered("C", ["Wrote C, Go and Rust"]), true);
  assert.equal(covered("C", ["wrote c code"]), false, "two-character terms are case-sensitive");
});

test("B1: C++, .NET and Node.js are matched literally and never throw", () => {
  assert.equal(covered("C++", ["Wrote C++ services"]), true);
  assert.equal(covered(".NET", ["Built .NET APIs"]), true);
  assert.equal(covered("Node.js", ["Built Node.js APIs"]), true);
  assert.equal(covered("Node.js", ["Built NodeXjs APIs"]), false, "the dot is a literal dot");
});

test("B1: 2-character Go matches the capitalised word only", () => {
  const { gaps } = buildBullets({ jd: "## Required\n- Go\n", source: { kind: "facts", name: "f.md", markdown: "## E01 Co\n- F1: We went to market.\n" } });
  assert.deepEqual(gaps, ["Go: not in your facts"]);
});

test("B5: Unicode names match themselves: Café, Müller and Đ", () => {
  assert.equal(covered("Café", ["Ran the Café kiosk"]), true);
  assert.equal(covered("Müller", ["Led the Müller account"]), true);
  assert.equal(covered("Đ", ["Đ is a letter"]), true);
  assert.equal(covered("Müller", ["Led the Muller account"]), false);
  assert.equal(covered("Caf", ["Café"]), false, "a letter with an accent is a letter: Caf is not a whole word in Café");
});

test("B3: 3+ years Python is covered by a fact that names Python", () => {
  assert.equal(covered("3+ years Python", ["Built services in Python"]), true);
  assert.equal(covered("5 yrs Java", ["Built services in Java"]), true);
  assert.equal(covered("2 year Go", ["Built services in Go"]), true);
});

test("B3: Python or Rust is one alternatives row, covered by either term", () => {
  const { markdown, gaps } = buildBullets({
    jd: "## Required\n- Python or Rust\n",
    source: { kind: "facts", name: "f.md", markdown: "## E01 Co\nStatus: complete\n- F1: Built services in Python.\n" },
  });
  assert.deepEqual(gaps, ["Rust: not in your facts; Python is covered"]);
  assert.ok(tableRow(markdown, "Python or Rust").startsWith("| Python or Rust | yes | yes |"), markdown);
});

// ---- Entries and tables (B2, B4) ----

test("B2: two entries with the same id get distinct tags, and both appear in the Fact table", () => {
  const md = "## E01 First\n- F1: Shipped the first thing.\n## E01 Second\n- F1: Shipped the second thing.\n- F2: Shipped a third thing.\n";
  const { entries } = parseFactsMarkdown(md);
  assert.deepEqual(entries.map((e) => e.id), ["E01", "E01b"]);
  const tags = entries.flatMap((e) => e.facts.map((f) => f.tag));
  assert.equal(new Set(tags).size, tags.length, `duplicate tags: ${tags}`);
  const { markdown } = buildBullets({ jd: "## Required\n- shipped\n", source: { kind: "facts", name: "d.md", markdown: md } });
  const factRows = section(markdown, "## Fact table");
  assert.ok(factRows.some((l) => l.startsWith("| E01-F1 |")), markdown);
  assert.ok(factRows.some((l) => l.startsWith("| E01b-F1 |")), markdown);
  const three = parseFactsMarkdown("## E01 A\n- F1: a\n## E01 B\n- F1: b\n## E01 C\n- F1: c\n").entries.map((e) => e.id);
  assert.deepEqual(three, ["E01", "E01b", "E01c"]);
});

/** Splits a markdown table row on the pipes that are not escaped. */
const cells = (line: string) => line.slice(1, -1).split(/(?<!\\)\|/);

test("B4: a fact or requirement containing a pipe keeps every table row at its column count", () => {
  const md = "## E01 Pipes\nStatus: complete\n- F1: Ran the Redis | Kafka pipeline in production.\n";
  const { markdown } = buildBullets({ jd: "## Required\n- Redis | Kafka\n", source: { kind: "facts", name: "p.md", markdown: md } });
  assert.ok(markdown.includes("1. Ran the Redis | Kafka pipeline in production. [E01-F1]"), markdown);
  const coverageRows = section(markdown, "## Coverage").filter((l) => l.startsWith("| "));
  for (const l of coverageRows) assert.equal(cells(l).length, 4, l);
  const factRows = section(markdown, "## Fact table").filter((l) => l.startsWith("| "));
  for (const l of factRows) assert.equal(cells(l).length, 2, l);
});

test("B4: CRLF input gives the same draft as LF input, for the JD and the facts", () => {
  const lf = bankDraft(jdMl).markdown;
  const crlf = buildBullets({ jd: jdMl.replace(/\n/g, "\r\n"), source: { kind: "facts", name: "portfolio-bank.md", markdown: bank.replace(/\n/g, "\r\n") } }).markdown;
  assert.equal(crlf, lf);
});

test("B4: an empty JD, or a JD with no bullet lines, gives Gaps None., one placeholder coverage row, a note, and no error", () => {
  for (const jd of ["", "Just a paragraph about the role.\n"]) {
    const { markdown, gaps } = bankDraft(jd);
    assert.deepEqual(gaps, []);
    assert.deepEqual(section(markdown, "## Gaps"), ["None."]);
    const rows = section(markdown, "## Coverage").filter((l) => l.startsWith("| "));
    assert.equal(rows.length, 2, markdown);
    assert.ok(rows[1]!.startsWith("| (no requirements found) |"), rows[1] ?? "");
    assert.ok(markdown.split("\n").some((l) => l.startsWith("Note:") && l.includes("no requirement")), markdown);
  }
});

test("B4: the CLI exits 0 for an empty JD file and for a CRLF JD file", async () => {
  const work = await mkdtemp(join(tmpdir(), "workproof-jd-"));
  try {
    const empty = join(work, "empty.md");
    await writeFile(empty, "");
    const r1 = spawnSync(process.execPath, [CLI, "bullets", "--jd", empty, "--facts", join(FIX, "portfolio-bank.md")], { encoding: "utf8" });
    assert.equal(r1.status, 0, r1.stderr);
    assert.ok(r1.stdout.includes("(no requirements found)"), r1.stdout);
    const crlfPath = join(work, "crlf.md");
    await writeFile(crlfPath, jdMl.replace(/\n/g, "\r\n"));
    const r2 = spawnSync(process.execPath, [CLI, "bullets", "--jd", crlfPath, "--facts", join(FIX, "portfolio-bank.md")], { encoding: "utf8" });
    assert.equal(r2.status, 0, r2.stderr);
    assert.equal(r2.stdout, bankDraft(jdMl).markdown);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});

// ---- Resume shape (--resume) ----

const bankResume = (jd: string) => buildBullets({ jd, source: { kind: "facts", name: "portfolio-bank.md", markdown: bank }, resume: true }).markdown;
const pastResume = (jd: string) => buildBullets({ jd, source: { kind: "facts", name: "past-resume.md", markdown: resume }, resume: true }).markdown;
const headingsOf = (md: string): string[] => md.split("\n").filter((l) => /^#{1,2} /.test(l));
const BANK_RESUME_HEADINGS = ["# Resume", "## Summary", "## Skills", "## Experience", "## Projects", "## Gaps", "## Keyword coverage", "## Ordering check"];
const PAST_RESUME_HEADINGS = ["# AVERY COLLINS", "## Summary", "## Skills", "## Experience", "## Gaps", "## Keyword coverage", "## Ordering check"];

test("resume T7: the bank resume headings come in the fixed order, with Experience before Projects", () => {
  const md = bankResume(jdMl);
  assert.deepEqual(headingsOf(md), BANK_RESUME_HEADINGS, md);
  const lines = md.split("\n");
  assert.ok(lines.indexOf("## Experience") < lines.indexOf("## Projects"), md);
});

test("resume T7: DocQA comes before ScanSense inside Projects, which follows Experience; the Status, Domain and Stack lines are verbatim", () => {
  const md = bankResume(jdMl);
  const lines = md.split("\n");
  const experience = lines.indexOf("## Experience");
  const projects = lines.indexOf("## Projects");
  const docqa = lines.indexOf("### DocQA");
  const scan = lines.indexOf("### ScanSense");
  const gaps = lines.indexOf("## Gaps");
  assert.ok(experience < projects && projects < docqa && docqa < scan && scan < gaps, md);
  const docqaHead = lines.slice(docqa, scan);
  for (const l of ["Status: complete", "Domain: agentic, enterprise", "Stack: LangGraph, ChromaDB, FastAPI"]) assert.ok(docqaHead.includes(l), l);
  const scanHead = lines.slice(scan, gaps);
  for (const l of ["Status: in-progress", "Domain: computer vision", "Stack: YOLOv8, ONNX"]) assert.ok(scanHead.includes(l), l);
  const example = lines.indexOf("### Example Corp");
  assert.ok(example > experience && example < projects, "Example Corp is under Experience");
  assert.equal(lines[example + 1], "Role: Machine Learning Intern, Jun 2024 to Aug 2024");
  assert.ok(!md.includes("## Fact table"), "no fact table");
  assert.ok(!md.includes("Checklist"), "no checklist");
});

test("resume T8: the past resume has the name line, Experience only, and entry header lines byte-identical to the source", () => {
  const md = pastResume(jdBackend);
  assert.deepEqual(headingsOf(md), PAST_RESUME_HEADINGS, md);
  const lines = md.split("\n");
  assert.equal(lines[0], "# AVERY COLLINS");
  const sourceLines = resume.split("\n");
  const headers = lines.flatMap((l, i) => (/^\*\*.+\*\* \| /.test(l) ? [i] : []));
  assert.ok(headers.length >= 2, md);
  for (const i of headers) {
    const pair = `${lines[i]}\n${lines[i + 1]}`;
    assert.ok(resume.includes(pair), `not verbatim in the source: ${pair}`);
    assert.ok(sourceLines.includes(lines[i]!), lines[i] ?? "");
  }
  assert.equal(lines[headers[0]!], "**Cedarline Logistics** | Chicago, IL", "Cedarline Logistics comes first");
  assert.equal(lines[headers[0]! + 1], "*Senior Software Engineer* | *Mar 2022 – Present*");
  assert.ok(!/^### /m.test(md), "no ### heading for a resume entry");
});

test("resume T8: the output is under 450 words, and every number in it is in the source", () => {
  const md = pastResume(jdBackend);
  assert.ok(md.split(/\s+/).filter((w) => w !== "").length < 450, "too long");
  const content = md
    .split("\n")
    .map((l) => l.replace(/\[[^\]]*\]/g, "").replace(/\b[A-Z]+\d*-F\d+\b/g, ""))
    .join("\n");
  const found = numbers(content);
  assert.ok(found.length > 0);
  for (const n of found) assert.ok(resume.includes(n), `number ${n} is not in the source`);
});

test("resume: the bullets, Gaps, coverage, ordering and Summary lines are the same as in the draft", () => {
  const cases: [string, BulletsSource][] = [
    [jdMl, { kind: "facts", name: "portfolio-bank.md", markdown: bank }],
    [jdBackend, { kind: "facts", name: "past-resume.md", markdown: resume }],
  ];
  for (const [jd, source] of cases) {
    const draft = buildBullets({ jd, source }).markdown;
    const res = buildBullets({ jd, source, resume: true }).markdown;
    const resLines = res.split("\n");
    for (const b of section(draft, "## Ranked bullets")) assert.ok(resLines.includes(b.replace(/^\d+\. /, "- ")), `missing bullet: ${b}`);
    assert.deepEqual(section(res, "## Gaps"), section(draft, "## Gaps"));
    assert.deepEqual(section(res, "## Keyword coverage"), section(draft, "## Coverage"));
    assert.deepEqual(section(res, "## Ordering check"), section(draft, "## Ordering check"));
    assert.deepEqual(section(res, "## Summary"), section(draft, "## Summary"));
  }
});

test("resume: the Skills line is one comma-separated line, and names the target role from the JD", () => {
  const md = pastResume(jdBackend);
  const skills = section(md, "## Skills");
  assert.equal(skills.length, 1, md);
  assert.ok(!skills[0]!.startsWith("- "), skills[0] ?? "");
  assert.ok(skills[0]!.includes(", "));
  assert.equal(section(md, "## Summary").length, 1);
  assert.ok(md.split("\n").includes(`Target role: ${parseJd(jdBackend).target}`));
  const none = buildBullets({ jd: "## Required\n- Rust\n", source: { kind: "facts", name: "f.md", markdown: "## E01 Co\nStatus: complete\n- F1: Built a thing.\n" }, resume: true }).markdown;
  assert.deepEqual(section(none, "## Skills"), ["(none supported by the facts)"]);
});

test("resume T7: the Ordering check says ok, since no in-progress entry is printed before a complete one", () => {
  const md = bankResume(jdMl);
  assert.ok(md.split("\n").includes("Complete before in-progress: ok"), md);
});

test("resume: an in-progress Experience entry printed before a complete Projects entry is named by the Ordering check", () => {
  // The ranking puts the complete P01 first, but --resume prints Experience first, so E01 sits above P01.
  const source = [
    "# Portfolio bank (inline)",
    "",
    "## E01 Example Corp",
    "Status: in-progress",
    "Role: Machine Learning Intern, Jun 2024 to Aug 2024",
    "- F1: Built a churn model in XGBoost on 1.2M customer records.",
    "",
    "## P01 DocQA",
    "Status: complete",
    "Stack: LangGraph, ChromaDB",
    "- F1: Multi-agent RAG over 5,000 policy PDFs.",
    "",
  ].join("\n");
  const md = buildBullets({ jd: "## Required\n- LangGraph\n", source: { kind: "facts", name: "inline.md", markdown: source }, resume: true }).markdown;
  assert.deepEqual(headingsOf(md), ["# Resume", "## Summary", "## Skills", "## Experience", "## Projects", "## Gaps", "## Keyword coverage", "## Ordering check"], md);
  assert.ok(md.split("\n").includes("Complete before in-progress: violated (Example Corp)"), md);
});

test("resume name: a source that starts with a name, then WORK EXPERIENCE, is titled Resume", () => {
  const source = [
    "Avery Collins",
    "Chicago, IL | (312) 555-0142",
    "",
    "WORK EXPERIENCE",
    "**Cedarline Logistics** | Chicago, IL",
    "*Senior Software Engineer* | *Mar 2022 - Present*",
    "- Designed an event-driven shipment tracking service in Go and AWS SQS that processes 4M events per day.",
    "",
  ].join("\n");
  const md = buildBullets({ jd: jdBackend, source: { kind: "facts", name: "name.md", markdown: source }, resume: true }).markdown;
  assert.equal(md.split("\n")[0], "# Resume", md);
});

test("resume name: a source with no name line is titled Resume", () => {
  const source = [
    "**Cedarline Logistics** | Chicago, IL",
    "*Senior Software Engineer* | *Mar 2022 - Present*",
    "- Designed an event-driven shipment tracking service in Go and AWS SQS that processes 4M events per day.",
    "",
  ].join("\n");
  const md = buildBullets({ jd: jdBackend, source: { kind: "facts", name: "name.md", markdown: source }, resume: true }).markdown;
  assert.equal(md.split("\n")[0], "# Resume", md);
});

test("resume report mode: Projects with the repository name as the entry heading, and no Experience", async () => {
  const dir = await makeRepo();
  try {
    const key = newFingerprintKey();
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const report = buildReport([await analyseRepo(dir, params)], params, meta);
    const md = buildBullets({ jd: "## Required\n- TypeScript\n- Rust\n", source: { kind: "report", report }, resume: true }).markdown;
    assert.deepEqual(headingsOf(md), ["# Resume", "## Summary", "## Skills", "## Projects", "## Gaps", "## Keyword coverage", "## Ordering check"], md);
    assert.ok(md.split("\n").includes(`### ${report.repositories[0]!.name}`), md);
    assert.ok(!md.includes("## Experience"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("resume CLI: --resume --out writes the resume shape, and --resume alone prints it", () => {
  const work = mkdtempSync(join(tmpdir(), "workproof-resume-cli-"));
  try {
    const out = join(work, "resume.md");
    const jd = join(FIX, "jd-backend.md");
    const facts = join(FIX, "past-resume.md");
    const written = spawnSync(process.execPath, [CLI, "bullets", "--jd", jd, "--facts", facts, "--resume", "--out", out], { encoding: "utf8" });
    assert.equal(written.status, 0, written.stderr);
    assert.equal(readFileSync(out, "utf8"), pastResume(jdBackend));
    const printed = spawnSync(process.execPath, [CLI, "bullets", "--jd", jd, "--facts", facts, "--resume"], { encoding: "utf8" });
    assert.equal(printed.status, 0, printed.stderr);
    assert.equal(printed.stdout, pastResume(jdBackend));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

// ---- Report Summary across repositories ----

test("summary: with two repositories the line takes the first repository that has both figures, and names it", async () => {
  const a = await makeRepo();
  const b = await makeRepo();
  try {
    const key = newFingerprintKey();
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const full = buildReport([await analyseRepo(a, params), await analyseRepo(b, params)], params, meta);
    // A copy whose first repository has no surviving-lines figure, with the hash recomputed so the check passes.
    const edited = structuredClone(full) as Report;
    edited.repositories[0]!.figures = edited.repositories[0]!.figures.filter((f) => f.id !== "survivingLines");
    edited.hash = hashOf(edited.params, edited.repositories);
    const hash8 = edited.hash.slice(0, 8);
    const second = edited.repositories[1]!;
    const commit = second.figures.find((f) => f.id === "commitShare")!.value as { author: number; total: number; share: number };
    const lines = second.figures.find((f) => f.id === "survivingLines")!.value as { lines: number; linesAttributed: number; share: number };
    const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
    const n = (x: number) => x.toLocaleString("en-US");
    const body = `Made ${n(commit.author)} of the ${n(commit.total)} non-merge commits in the tenure window (${pct(commit.share)}) and authored ${n(lines.lines)} of the ${n(lines.linesAttributed)} lines still in the project today (${pct(lines.share)}). [commitShare #${hash8}, survivingLines #${hash8}]`;
    const out = buildBullets({ jd: "## Required\n- TypeScript\n", source: { kind: "report", report: edited } });
    assert.deepEqual(section(out.markdown, "## Summary"), [`In ${second.name}: ${body}`]);

    // Both repositories complete: the first one is named.
    const firstFull = buildBullets({ jd: "## Required\n- TypeScript\n", source: { kind: "report", report: full } });
    assert.ok(section(firstFull.markdown, "## Summary")[0]!.startsWith(`In ${full.repositories[0]!.name}: Made `), firstFull.markdown);
  } finally {
    await rm(a, { recursive: true, force: true });
    await rm(b, { recursive: true, force: true });
  }
});

test("summary: when no repository has both figures, the fallback line is used", async () => {
  const a = await makeRepo();
  const b = await makeRepo();
  try {
    const key = newFingerprintKey();
    const params: Params = { depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1, author: ["ada@example.com"], fingerprintKey: key };
    const full = buildReport([await analyseRepo(a, params), await analyseRepo(b, params)], params, meta);
    const edited = structuredClone(full) as Report;
    edited.repositories[0]!.figures = edited.repositories[0]!.figures.filter((f) => f.id !== "survivingLines");
    edited.repositories[1]!.figures = edited.repositories[1]!.figures.filter((f) => f.id !== "commitShare");
    edited.hash = hashOf(edited.params, edited.repositories);
    const out = buildBullets({ jd: "## Required\n- TypeScript\n", source: { kind: "report", report: edited } });
    assert.deepEqual(section(out.markdown, "## Summary"), [NO_ENTRY]);
  } finally {
    await rm(a, { recursive: true, force: true });
    await rm(b, { recursive: true, force: true });
  }
});
