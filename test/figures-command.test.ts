import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { computeFigures, readBack, renderFigures, headerKinds, runFigures } from "../src/figures.js";
import type { FiguresResult } from "../src/figures.js";

const cli = fileURLToPath(new URL("../src/cli.js", import.meta.url));
const VERDICT_WORDS = /\b(pass|passed|fail|failed|failure|trust|trusted|valid|invalid|ok)\b/i;

const sam = { name: "Sam Ortega", email: "sam@alpha.example" };
const samLaptop = { name: "Sam O.", email: "sam@beta.example" };
const samName = { name: "Sam Ortega", email: "sortega@gamma.example" };
const riley = { name: "Riley Chen", email: "riley@delta.example" };

let dir = "";
let plain = "";
const window = { since: "2026-01-01", until: "2026-03-31" };

/**
 * One repository built to hit every figure: a second address with the same local part, a second
 * address with the same name, a commit authored before the window and committed inside it, a merge,
 * a revert pair, a whitespace-only commit, a large added file with a licence header, a commit dated
 * in the future and a commit committed before it was authored.
 */
async function build(): Promise<string> {
  const d = await mkdtemp(join(tmpdir(), "workproof-figures-"));
  const g = (args: string[], who: { name: string; email: string }, author: string, committer = author) =>
    execFileSync("git", args, {
      cwd: d,
      encoding: "utf8",
      env: { ...process.env, GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email, GIT_AUTHOR_DATE: author, GIT_COMMITTER_DATE: committer },
    }).trim();
  const lines = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix} ${i}`).join("\n") + "\n";
  const commit = async (who: typeof sam, file: string, text: string, message: string, author: string, committer = author) => {
    await mkdir(join(d, file.split("/").slice(0, -1).join("/") || "."), { recursive: true });
    await writeFile(join(d, file), text);
    g(["add", "."], who, author);
    g(["commit", "-q", "-m", message], who, author, committer);
    return g(["rev-parse", "HEAD"], who, author);
  };
  g(["init", "-q", "-b", "main"], sam, "2026-01-05T10:00:00Z");
  await commit(sam, "app.txt", lines("line", 10), "add app", "2026-01-05T10:00:00Z");
  await commit(sam, "app.txt", lines("line", 13), "grow app", "2026-01-12T10:00:00Z");
  await commit(sam, "vendor/lib.js", `/* Copyright (c) 2019 Someone Else\n * Licensed under the MIT licence */\n${lines("fn", 43)}`, "add library", "2026-01-20T10:00:00Z");
  await commit(sam, "app.txt", lines("line", 13).split("\n").map((l) => (l ? `  ${l}` : l)).join("\n"), "reindent app", "2026-01-25T10:00:00Z");
  const bad = await commit(sam, "bad.txt", lines("bad", 4), "add bad file", "2026-02-02T10:00:00Z");
  g(["revert", "--no-edit", bad], sam, "2026-02-03T10:00:00Z");
  await commit(samLaptop, "other.txt", lines("o", 2), "laptop work", "2026-02-05T10:00:00Z");
  await commit(samName, "third.txt", lines("t", 1), "third address work", "2026-02-06T10:00:00Z");
  await commit(riley, "riley.txt", lines("r", 6), "riley work", "2026-02-07T10:00:00Z");
  g(["checkout", "-q", "-b", "side"], riley, "2026-02-08T10:00:00Z");
  await commit(riley, "side.txt", lines("s", 3), "side work", "2026-02-08T10:00:00Z");
  g(["checkout", "-q", "main"], sam, "2026-02-09T10:00:00Z");
  g(["merge", "--no-ff", "-q", "side", "-m", "merge side"], sam, "2026-02-10T10:00:00Z");
  await commit(sam, "old.txt", lines("old", 3), "replayed work", "2025-12-20T10:00:00Z", "2026-02-12T10:00:00Z");
  await commit(sam, "future.txt", lines("f", 2), "dated ahead", "2099-01-01T10:00:00Z");
  await commit(sam, "late.txt", lines("l", 2), "committed early", "2026-03-01T10:00:00Z", "2026-02-28T10:00:00Z");
  return d;
}

before(async () => {
  dir = await build();
  plain = await mkdtemp(join(tmpdir(), "workproof-figures-plain-"));
});
after(async () => {
  await rm(dir, { recursive: true, force: true });
  await rm(plain, { recursive: true, force: true });
});

const figures = (extra: { authors?: string[] } = {}) => computeFigures({ repo: dir, authors: extra.authors ?? ["sam@alpha.example"], ...window, json: false });
const value = (r: FiguresResult, label: string) => {
  const row = r.rows.find((x) => x.label === label);
  assert.ok(row, `no row labelled ${label}`);
  return row.value;
};

test("figures: exact counts for the identity and the window, by author date", async () => {
  const r = await figures();
  assert.equal(value(r, "authored non-merge commits"), 7);
  assert.equal(value(r, "authored non-merge commits, with identity candidates"), 9);
  assert.equal(value(r, "all authors, non-merge commits"), 11);
  assert.equal(value(r, "distinct authors"), 4);
  assert.equal(value(r, "authored non-merge commits, by committer date"), 8);
  assert.equal(value(r, "merge commits by the identities"), 1);
  assert.equal(value(r, "authored before the window, committed inside it"), 1);
  assert.equal(value(r, "revert commits"), 1);
  assert.equal(value(r, "commits reverted by those reverts"), 1);
  assert.equal(value(r, "whitespace-only commits"), 1);
  assert.equal(value(r, "lines added, raw"), 77);
  assert.equal(value(r, "lines deleted, raw"), 17);
  assert.equal(value(r, "lines added, whitespace ignored"), 64);
  assert.equal(value(r, "lines deleted, whitespace ignored"), 4);
  assert.equal(value(r, "large added files"), 1);
  assert.equal(value(r, "large added files with a licence, copyright or source-URL header"), 1);
  assert.equal(value(r, "author date in the future"), 1);
  assert.equal(value(r, "committer date earlier than author date"), 1);
  const replay = r.rows.find((x) => x.label === "authored before the window, committed inside it")!;
  assert.match(replay.detail![0]!, /author 2025-12-20 committer 2026-02-12/);
  const header = r.rows.find((x) => x.label.startsWith("large added files with"))!;
  assert.match(header.detail![0]!, /vendor\/lib\.js/);
  assert.match(header.detail![0]!, /licence, copyright/);
});

test("figures: identity candidates are printed with the rule and never merged", async () => {
  const r = await figures();
  assert.equal(r.candidates.length, 2);
  assert.ok(r.candidates.some((c) => c.includes("sam@beta.example") && c.includes("same address name") && c.includes("not merged")), r.candidates.join("\n"));
  assert.ok(r.candidates.some((c) => c.includes("sortega@gamma.example") && c.includes("same name") && c.includes("not merged")), r.candidates.join("\n"));
  // The identity count stays at the named address.
  assert.equal(value(r, "authored non-merge commits"), 7);
  const none = await figures({ authors: ["riley@delta.example"] });
  assert.equal(value(none, "authored non-merge commits"), 2);
});

test("figures: an author that matches no commit is not computed, never zero", async () => {
  const r = await figures({ authors: ["nobody@omega.example"] });
  assert.match(String(value(r, "authored non-merge commits")), /^not computed \(no commit has that author name or address\)$/);
  assert.equal(value(r, "all authors, non-merge commits"), 11);
  assert.ok(r.rows.every((x) => x.computed || String(x.value).startsWith("not computed (")));
});

test("figures text: labelled lines, at most 60, no verdict words", async () => {
  const chunks: string[] = [];
  const code = await runFigures(["--repo", dir, "--author", "sam@alpha.example", "--since", window.since, "--until", window.until], { write: (s) => chunks.push(s) });
  assert.equal(code, 0);
  const lines = chunks.join("").trimEnd().split("\n");
  assert.ok(lines.length <= 60, `${lines.length} lines`);
  assert.doesNotMatch(lines.join("\n"), VERDICT_WORDS);
  const labelled = lines.filter((l) => !l.startsWith("  ") && l.includes(" | "));
  assert.ok(labelled.length >= 20);
  for (const l of labelled) assert.equal(l.split(" | ").length >= 3, true, l);
  assert.ok(lines.includes("authored non-merge commits | 7 | identities sam@alpha.example; author date 2026-01-01 to 2026-03-31 (date-only bounds are the local calendar date in the commit's own offset), reachable from HEAD"), lines.join("\n"));
});

test("figures text: the cap holds for a result with many rows", () => {
  const rows = Array.from({ length: 200 }, (_, i) => ({ label: `figure ${i}`, value: i, filter: "synthetic", computed: true, detail: [`detail ${i}`] }));
  const text = renderFigures({ repo: "x", window: "w", rows, candidates: [] });
  assert.ok(text.trimEnd().split("\n").length <= 60);
  assert.match(text, /more lines not shown/);
});

test("figures --json carries the same rows as the text", async () => {
  const chunks: string[] = [];
  assert.equal(await runFigures(["--repo", dir, "--author", "sam@alpha.example", "--since", window.since, "--until", window.until, "--json"], { write: (s) => chunks.push(s) }), 0);
  const parsed = JSON.parse(chunks.join("")) as FiguresResult;
  assert.equal(value(parsed, "authored non-merge commits"), 7);
  assert.equal(parsed.candidates.length, 2);
});

test("figures: a git failure prints not computed with the reason, and exit code 0", async () => {
  const chunks: string[] = [];
  const code = await runFigures(["--repo", plain], { write: (s) => chunks.push(s) });
  assert.equal(code, 0);
  const text = chunks.join("");
  assert.match(text, /authored non-merge commits \| not computed \(.*not a git repository.*\) \|/i);
  assert.doesNotMatch(text, /\| 0 \|/);
  assert.doesNotMatch(text, VERDICT_WORDS);
});

test("figures --doc: integers next to counting nouns are matched to labels, or reported as matching no figure", async () => {
  const doc = join(plain, "statement.md");
  await writeFile(
    doc,
    [
      "# Statement",
      "I authored 7 commits between January and March, 9 of 11 commits including other addresses.",
      "The work includes 5 sessions of review and 3 files.",
      "",
      "```",
      "$ git log --author=me",
      "```",
      "Contact sam@alpha.example. Compare origin/main with feature/login.",
      "Released v1.2.3 in 2026-01-05 with 12 lines of notes.",
    ].join("\n"),
  );
  const r = await figures();
  const back = await readBack(doc, r.rows);
  const hit = (line: number, n: number) => back.hits.find((h) => h.line === line && h.integer === n);
  assert.deepEqual(hit(2, 7)?.labels, ["authored non-merge commits"]);
  assert.deepEqual(hit(2, 9)?.labels, ["authored non-merge commits, with identity candidates"]);
  assert.deepEqual(hit(2, 11)?.labels, ["all authors, non-merge commits"]);
  assert.deepEqual(hit(3, 5)?.labels, []);
  assert.equal(hit(3, 5)?.noun, "sessions");
  assert.deepEqual(hit(3, 3)?.labels, []);
  assert.deepEqual(hit(9, 12)?.labels, []);
  assert.equal(back.hits.some((h) => h.line === 9 && h.integer === 2026), false, "a date is not a count");
  const shows = (label: string) => back.shows.find((s) => s.label === label)!;
  assert.equal(shows("email addresses").count, 1);
  assert.equal(shows("shell-command lines").count, 1);
  assert.equal(shows("code blocks").count, 1);
  assert.equal(shows("branch-like names").count, 2);
  const text = renderFigures({ ...r, doc: back });
  assert.match(text, /doc line 3 \| 5 sessions \| ".*" \| no computed figure equals 5/);
  assert.match(text, /doc line 2 \| 7 commits \| ".*" \| equals: authored non-merge commits$/m);
  assert.doesNotMatch(text.split("read-back of")[1]!, VERDICT_WORDS);
});

test("figures --doc: a numeric cell under a counting-noun header is read as that noun, a column without one is not", async () => {
  const doc = join(plain, "table.md");
  const rows = [
    "# Months",
    "",
    "| Month | Commits | Notes |",
    "|---|---|---|",
    "| January | 7 | first |",
    "| February | 12 | second |",
    "",
    "| Month | Rating |",
    "|---|---|",
    "| March | 7 |",
    "| April | 1,200 |",
    "",
  ];
  await writeFile(doc, rows.join("\n"));
  const r = await figures();
  const back = await readBack(doc, r.rows);
  const hit = (line: number, n: number) => back.hits.find((h) => h.line === line && h.integer === n);
  assert.equal(hit(5, 7)?.noun, "commits");
  assert.equal(hit(6, 12)?.noun, "commits");
  assert.deepEqual(hit(5, 7)?.labels, ["authored non-merge commits"]);
  assert.deepEqual(hit(6, 12)?.labels, []);
  assert.equal(hit(5, 7)?.excerpt, "| January | 7 | first |");
  assert.equal(back.hits.some((h) => h.line >= 8), false, "a column whose header names no counting noun is not read");
  assert.equal(back.hits.length, 2);
});

test("figures --doc: a document with no counted numbers says so, and an unreadable path is not computed", async () => {
  const doc = join(plain, "plain.md");
  await writeFile(doc, "A short note about the project.\nVersion 2.1 shipped.\n");
  const back = await readBack(doc, []);
  assert.equal(back.hits.length, 0);
  assert.match(renderFigures({ repo: "x", window: "w", rows: [], candidates: [], doc: back }), /no integer next to commit/);
  const folder = await readBack(plain, []);
  assert.match(folder.note ?? "", /not computed \(the path is not a regular file\)/);
  const missing = await readBack(join(plain, "absent.md"), []);
  assert.match(missing.note ?? "", /^not computed \(ENOENT\)$/);
  const big = join(plain, "big.md");
  await writeFile(big, "x".repeat(1024 * 1024 + 1));
  assert.match((await readBack(big, [])).note ?? "", /the limit is 1048576/);
});

test("figures --doc: a very long line cannot make the read-back slow", async () => {
  const doc = join(plain, "long.md");
  await writeFile(doc, `${"1 ab ".repeat(150000)}\n${"a@".repeat(100000)}\n`);
  const started = Date.now();
  await readBack(doc, []);
  assert.ok(Date.now() - started < 3000, `${Date.now() - started} ms`);
});

test("headerKinds reads only the first 12 lines for licence, copyright and source-URL headers", () => {
  assert.deepEqual(headerKinds("// SPDX-License-Identifier: MIT\ncode\n"), ["licence"]);
  assert.deepEqual(headerKinds("/* Copyright (c) 2019 Someone */\n"), ["copyright"]);
  assert.deepEqual(headerKinds("// taken from https://github.com/example/project/blob/main/x.js\n"), ["source URL"]);
  assert.deepEqual(headerKinds(`${"code\n".repeat(12)}// Copyright 2020\n`), []);
});

test("the CLI runs figures, exits 0 on a git failure, exits 1 on a usage error, and lists it in --help", () => {
  const ok = spawnSync(process.execPath, [cli, "figures", "--repo", dir, "--author", "sam@alpha.example"], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /^workproof figures: read-only/);
  const failed = spawnSync(process.execPath, [cli, "figures", "--repo", plain], { encoding: "utf8" });
  assert.equal(failed.status, 0);
  assert.match(failed.stdout, /not computed \(/);
  const bad = spawnSync(process.execPath, [cli, "figures", "--nope"], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /unknown option --nope/);
  const help = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.match(help.stdout, /workproof figures \[--repo <dir>\]/);
  assert.match(help.stdout, /--doc <file>/);
});

test("figures: an invalid or impossible --since/--until is not computed, never a zero count", async () => {
  for (const bad of ["2026-13-45", "garbage", "2026-02-30"]) {
    const r = await computeFigures({ repo: dir, authors: ["sam@alpha.example"], since: bad, json: false });
    const row = r.rows.find((x) => x.label === "window")!;
    assert.ok(row && !row.computed && /^not computed \(git could not read the date/.test(String(row.value)), `${bad}: ${JSON.stringify(r.rows[0])}`);
    assert.equal(r.rows.some((x) => x.computed && x.value === 0), false);
  }
  const ok = await computeFigures({ repo: dir, authors: ["sam@alpha.example"], since: "3 years ago", json: false });
  assert.ok(ok.rows.some((x) => x.label === "authored non-merge commits" && x.computed));
});

test("figures: date-only bounds use the author's local calendar date", async () => {
  const d = await mkdtemp(join(tmpdir(), "workproof-figures-tz-"));
  try {
    const env = { ...process.env, GIT_AUTHOR_NAME: "Tz", GIT_AUTHOR_EMAIL: "tz@x.example", GIT_COMMITTER_NAME: "Tz", GIT_COMMITTER_EMAIL: "tz@x.example", GIT_AUTHOR_DATE: "2026-03-02T00:30:00+13:00", GIT_COMMITTER_DATE: "2026-03-02T00:30:00+13:00" };
    const g = (a: string[]) => execFileSync("git", a, { cwd: d, env, encoding: "utf8" });
    g(["init", "-q", "-b", "main"]);
    await writeFile(join(d, "a.txt"), "a\n");
    g(["add", "."]);
    g(["commit", "-q", "-m", "x"]);
    const r = await computeFigures({ repo: d, authors: ["tz@x.example"], since: "2026-03-02", until: "2026-03-02", json: false });
    assert.equal(value(r, "authored non-merge commits"), 1);
    assert.match(r.window, /local calendar date/);
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("figures: without --author the configured email is the only identity and a same-name address is a candidate", async () => {
  const d = await mkdtemp(join(tmpdir(), "workproof-figures-cfg-"));
  try {
    const run = (a: string[], who: string, email: string) =>
      execFileSync("git", a, { cwd: d, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: who, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: who, GIT_COMMITTER_EMAIL: email, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } });
    run(["init", "-q", "-b", "main"], "Pat Doe", "pat@one.example");
    run(["config", "user.email", "pat@one.example"], "Pat Doe", "pat@one.example");
    run(["config", "user.name", "Pat Doe"], "Pat Doe", "pat@one.example");
    for (const [f, email] of [["a", "pat@one.example"], ["b", "pdoe@two.example"]] as const) {
      await writeFile(join(d, f), f);
      run(["add", "."], "Pat Doe", email);
      run(["commit", "-q", "-m", f], "Pat Doe", email);
    }
    const r = await computeFigures({ repo: d, authors: [], json: false });
    assert.equal(value(r, "authored non-merge commits"), 1);
    assert.ok(r.candidates.some((c) => c.includes("pdoe@two.example") && c.includes("not merged")), r.candidates.join("\n"));
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("figures: a pure rename is not a whitespace-only commit, and a future committer date has its own row", async () => {
  const d = await mkdtemp(join(tmpdir(), "workproof-figures-ren-"));
  try {
    const env = { ...process.env, GIT_AUTHOR_NAME: "R", GIT_AUTHOR_EMAIL: "r@x.example", GIT_COMMITTER_NAME: "R", GIT_COMMITTER_EMAIL: "r@x.example" };
    const g = (a: string[], at: string, cat = at) => execFileSync("git", a, { cwd: d, env: { ...env, GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: cat }, encoding: "utf8" });
    g(["init", "-q", "-b", "main"], "2026-01-05T10:00:00Z");
    await writeFile(join(d, "a.txt"), Array.from({ length: 5 }, (_, i) => `l${i}`).join("\n") + "\n");
    g(["add", "."], "2026-01-05T10:00:00Z");
    g(["commit", "-q", "-m", "add"], "2026-01-05T10:00:00Z");
    g(["mv", "a.txt", "b.txt"], "2026-01-06T10:00:00Z");
    g(["commit", "-q", "-m", "rename"], "2026-01-06T10:00:00Z", "2099-01-01T10:00:00Z");
    const r = await computeFigures({ repo: d, authors: ["r@x.example"], json: false });
    assert.equal(value(r, "whitespace-only commits"), 0);
    assert.equal(value(r, "committer date in the future"), 1);
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("figures --doc: each noun matches only its own rows; ranges, 'of' filler, SHAs and versions are handled", async () => {
  const doc = join(plain, "nouns.md");
  await writeFile(doc, ["12 percent of lines were new.", "Worked 5 to 10 days on it.", "See 1234567 commits and v2.3 files.", "3 days and 7 sessions."].join("\n"));
  const rows = [
    { label: "authored non-merge commits", value: 7, filter: "f", computed: true },
    { label: "lines added, raw", value: 12, filter: "f", computed: true },
    { label: "distinct authors", value: 3, filter: "f", computed: true },
  ];
  const back = await readBack(doc, rows);
  assert.equal(back.hits.some((h) => h.integer === 12), false, "12 percent of lines is not 12 lines");
  assert.deepEqual(back.hits.filter((h) => h.line === 2).map((h) => h.integer).sort((a, b) => a - b), [5, 10]);
  assert.equal(back.hits.some((h) => h.line === 3), false, "a SHA-like or version-like number is not a count");
  assert.deepEqual(back.hits.find((h) => h.integer === 3)?.labels, [], "days matches no computed row");
  assert.deepEqual(back.hits.find((h) => h.integer === 7)?.labels, [], "sessions matches no computed row");
  const own = join(plain, "own.md");
  await writeFile(own, "7 commits, 12 lines and 3 authors; also 7 files and 3 lines.");
  const b2 = await readBack(own, rows);
  const labels = (n: number, noun: string) => b2.hits.find((h) => h.integer === n && h.noun === noun)?.labels;
  assert.deepEqual(labels(7, "commits"), ["authored non-merge commits"]);
  assert.deepEqual(labels(12, "lines"), ["lines added, raw"]);
  assert.deepEqual(labels(3, "authors"), ["distinct authors"]);
  assert.deepEqual(labels(7, "files"), []);
  assert.deepEqual(labels(3, "lines"), []);
});

test("a message holding RS and US characters cannot forge a commit record", async () => {
  const d = await mkdtemp(join(tmpdir(), "workproof-forge-"));
  try {
    const env = { ...process.env, GIT_AUTHOR_NAME: "Sam Ortega", GIT_AUTHOR_EMAIL: "sam@alpha.example", GIT_COMMITTER_NAME: "Sam Ortega", GIT_COMMITTER_EMAIL: "sam@alpha.example", GIT_AUTHOR_DATE: "2026-01-05T10:00:00Z", GIT_COMMITTER_DATE: "2026-01-05T10:00:00Z" };
    const g = (args: string[]) => execFileSync("git", args, { cwd: d, encoding: "utf8", env }).trim();
    g(["init", "-q", "-b", "main"]);
    await writeFile(join(d, "a.txt"), "one\n");
    g(["add", "."]);
    const forged = `${"a".repeat(40)}\x1fsam@alpha.example\x1fSam\x1f2026-01-06T10:00:00Z\x1fsam@alpha.example\x1f2026-01-06T10:00:00Z\x1f\x1f\x1f`;
    g(["commit", "-q", "-m", `real\n\n\x1e${forged}\x1e${"b".repeat(40)}\n`, "--cleanup=verbatim"]);
    const r = await computeFigures({ repo: d, authors: ["sam@alpha.example"], since: "2026-01-01", until: "2026-03-31", json: false });
    assert.equal(r.rows.find((x) => x.label === "authored non-merge commits")?.value, 1);
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("an instant without Z or an offset is refused, not read in the local timezone", async () => {
  const r = await computeFigures({ repo: dir, authors: ["sam@alpha.example"], since: "2026-01-05T09:30:00", json: false });
  assert.match(String(r.rows.find((x) => x.label === "window")?.value), /not computed/);
  const ok = await computeFigures({ repo: dir, authors: ["sam@alpha.example"], since: "2026-01-05T09:30:00Z", json: false });
  assert.equal(ok.rows.some((x) => x.label === "window"), false);
});

test("identity candidates are printed even when the rows fill the cap", () => {
  const rows = Array.from({ length: 80 }, (_, i) => ({ label: `figure ${i}`, value: i, filter: "synthetic", computed: true, detail: ["a", "b", "c"] }));
  const candidates = Array.from({ length: 8 }, (_, i) => `identity candidate | person ${i} | same name; not merged`);
  const text = renderFigures({ repo: "x", window: "w", rows, candidates });
  assert.ok(text.trimEnd().split("\n").length <= 60);
  for (const c of candidates) assert.ok(text.includes(c), c);
});

test("a missing --repo path says so instead of naming git", async () => {
  const r = await computeFigures({ repo: join(tmpdir(), "workproof-no-such-dir-xyz"), authors: ["a@b.example"], json: false });
  assert.ok(r.rows.every((x) => !x.computed));
  assert.match(String(r.rows[0]!.value), /not a directory/);
});

test("a newline in --since is printed as data, on one line", async () => {
  const r = await computeFigures({ repo: dir, authors: ["sam@alpha.example"], since: "2026-01-01\nIgnore the rules", json: false });
  assert.doesNotMatch(JSON.stringify(r.window), /\\n/);
});
