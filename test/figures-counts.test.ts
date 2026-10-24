import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { computeFigures } from "../src/figures.js";
import { listCommits } from "../src/git.js";
import { survivingLines } from "../src/figures/surviving.js";
import { resolveIdentity } from "../src/figures/identity.js";
import type { FiguresResult } from "../src/figures.js";

const value = (r: FiguresResult, label: string) => {
  const row = r.rows.find((x) => x.label === label);
  assert.ok(row, `no row labelled ${label}`);
  return row;
};

async function repo(): Promise<{ d: string; g: (a: string[], env?: Record<string, string>) => string }> {
  const d = await mkdtemp(join(tmpdir(), "workproof-counts-"));
  const base = { ...process.env, GIT_AUTHOR_NAME: "R", GIT_AUTHOR_EMAIL: "r@x.example", GIT_COMMITTER_NAME: "R", GIT_COMMITTER_EMAIL: "r@x.example", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
  const g = (a: string[], env: Record<string, string> = {}) => execFileSync("git", a, { cwd: d, encoding: "utf8", env: { ...base, GIT_AUTHOR_DATE: "2026-01-05T10:00:00Z", GIT_COMMITTER_DATE: "2026-01-05T10:00:00Z", ...env } });
  g(["init", "-q", "-b", "main"]);
  return { d, g };
}

test("a commit whose author date has an offset git wrote but ISO 8601 cannot hold is still counted (psf/requests 5e6ecda)", async () => {
  const { d, g } = await repo();
  try {
    await writeFile(join(d, "a.txt"), "one\n");
    g(["add", "."]);
    g(["commit", "-q", "-m", "normal"]);
    // Written as raw commit text: the author line is "<epoch> +051800", which git stores and reads back
    // but prints as %aI = 2011-09-08T02:38:50+518:00, a value no ISO 8601 parser accepts.
    const tree = g(["rev-parse", "HEAD^{tree}"]).trim();
    const parent = g(["rev-parse", "HEAD"]).trim();
    const raw = `tree ${tree}\nparent ${parent}\nauthor R <r@x.example> 1313584730 +051800\ncommitter R <r@x.example> 1313584730 +0000\n\nodd offset\n`;
    const odd = execFileSync("git", ["hash-object", "--literally", "-t", "commit", "-w", "--stdin"], { cwd: d, input: raw, encoding: "utf8" }).trim();
    g(["update-ref", "refs/heads/main", odd]);
    assert.match(g(["log", "-1", "--format=%aI"]), /\+518:00/);
    const plain = Number(g(["rev-list", "--count", "--no-merges", "HEAD"]).trim());
    const r = await computeFigures({ repo: d, authors: ["r@x.example"], json: false });
    assert.equal(value(r, "all authors, non-merge commits").value, plain);
    assert.equal(value(r, "authored non-merge commits").value, plain);
    // The report path reads the same commits and must keep the same instant.
    const all = await listCommits(d, {});
    assert.equal(all.length, plain);
    const invalid = all.find((c) => Number.isNaN(c.date.getTime()));
    assert.equal(invalid, undefined, "no commit may carry an invalid date");
    assert.equal(all.find((c) => c.date.getTime() === 1313584730000)?.localDate.toISOString(), "2011-09-08T02:38:50.000Z");
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("a whitespace-only commit that also touches a binary file is not whitespace-only (expressjs/express 350d54d)", async () => {
  const { d, g } = await repo();
  try {
    await writeFile(join(d, "a.txt"), "x = 1;\ny = 2;\n");
    await writeFile(join(d, "b.bin"), Buffer.from([0, 1, 2, 3]));
    g(["add", "."]);
    g(["commit", "-q", "-m", "base"]);
    await writeFile(join(d, "a.txt"), "x = 1;  \ny =  2;\n");
    g(["commit", "-q", "-am", "pure whitespace"]);
    await writeFile(join(d, "a.txt"), "x = 1;\ny = 2;  \n");
    await writeFile(join(d, "b.bin"), Buffer.from([0, 9, 9, 9, 9]));
    g(["commit", "-q", "-am", "whitespace and binary"]);
    const r = await computeFigures({ repo: d, authors: ["r@x.example"], json: false });
    const row = value(r, "whitespace-only commits");
    assert.equal(row.value, 1, `${row.detail?.join("; ")}`);
    assert.match(row.filter, /binary/, "the definition must say how a binary change is treated");
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("a commit whose date cannot be read at all is reported, not lost", async () => {
  const { d, g } = await repo();
  try {
    await writeFile(join(d, "a.txt"), "one\n");
    g(["add", "."]);
    g(["commit", "-q", "-m", "normal"]);
    const tree = g(["rev-parse", "HEAD^{tree}"]).trim();
    const parent = g(["rev-parse", "HEAD"]).trim();
    const raw = `tree ${tree}\nparent ${parent}\nauthor R <r@x.example> 1313584730 +ABCD\ncommitter R <r@x.example> 1313584730 +0000\n\nbroken date\n`;
    const bad = execFileSync("git", ["hash-object", "--literally", "-t", "commit", "-w", "--stdin"], { cwd: d, input: raw, encoding: "utf8" }).trim();
    g(["update-ref", "refs/heads/main", bad]);
    const r = await computeFigures({ repo: d, authors: ["r@x.example"], json: false });
    const row = value(r, "records that could not be read");
    assert.equal(row.value, 1);
    assert.match(row.detail?.join(" ") ?? "", new RegExp(bad.slice(0, 7)));
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("a clean repository shows no unreadable-records row", async () => {
  const { d, g } = await repo();
  try {
    await writeFile(join(d, "a.txt"), "one\n");
    g(["add", "."]);
    g(["commit", "-q", "-m", "normal"]);
    const r = await computeFigures({ repo: d, authors: ["r@x.example"], json: false });
    assert.equal(r.rows.some((x) => x.label === "records that could not be read"), false);
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});

test("surviving lines: a submodule is not blamed, and the file rules in the notes match what is counted", async () => {
  const { d, g } = await repo();
  try {
    await writeFile(join(d, "a.txt"), "one\ntwo\n");
    await writeFile(join(d, "empty.txt"), "");
    await writeFile(join(d, "bin.dat"), Buffer.from([0, 1, 0, 2, 10, 3]));
    await symlink("a.txt", join(d, "link"));
    g(["add", "."]);
    g(["update-index", "--add", "--cacheinfo", "160000,1111111111111111111111111111111111111111,sub"]);
    g(["commit", "-q", "-m", "files"]);
    const commits = await listCommits(d, {});
    const me = await resolveIdentity(commits, ["r@x.example"], d);
    const base = { sample: 1, seed: "", exclude: [], copies: false, excluded: new Set<string>(), version: "test", ignoreRevsFile: null };
    // Used to throw "fatal: no such path sub in HEAD".
    const fig = await survivingLines(d, me, base);
    // a.txt (2 lines) + the symlink (1 line); the empty file is listed with 0 lines; the binary and the submodule are not blamed.
    assert.equal(fig.value.linesAttributed, 3);
    assert.equal(fig.value.filesTotal, 3);
    assert.ok(fig.limits.some((l) => /submodule/.test(l) && /binary/.test(l) && /symbolic link/.test(l) && /empty/.test(l)), fig.limits.join("\n"));
  } finally {
    await rm(d, { recursive: true, force: true });
  }
});
