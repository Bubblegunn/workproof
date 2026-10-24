import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { execFileSync } from "node:child_process";
import { analyseRepo } from "../src/index.js";
import { listCommits } from "../src/git.js";

const FILES = 12;

/** A repository of `commits` commits by two authors over FILES files, built with one fast-import. */
function syntheticRepo(dir: string, commits: number): void {
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dir });
  let stream = "";
  for (let i = 0; i < commits; i++) {
    const who = i % 2 ? "bob" : "ada";
    const file = `src/f${i % FILES}.ts`;
    const body = `line ${i}\nstable\n`;
    const msg = `c${i}`;
    stream += `commit refs/heads/main\nmark :${i + 1}\nauthor ${who} <${who}@example.com> ${1767600000 + i * 3600} +0000\ncommitter ${who} <${who}@example.com> ${1767600000 + i * 3600} +0000\ndata ${msg.length}\n${msg}\n`;
    if (i > 0) stream += `from :${i}\n`;
    stream += `M 100644 inline ${file}\ndata ${body.length}\n${body}\n`;
  }
  execFileSync("git", ["fast-import", "--quiet"], { cwd: dir, input: stream });
  execFileSync("git", ["reset", "-q", "--hard", "main"], { cwd: dir });
}

/** Runs `fn` with a `git` first on PATH that appends one line per invocation to a log, and returns the count. */
async function countGitCalls(fn: () => Promise<unknown>): Promise<number> {
  const bin = await mkdtemp(join(tmpdir(), "wp-shim-"));
  const log = join(bin, "calls.log");
  const real = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  await writeFile(join(bin, "git"), `#!/bin/sh\necho x >> "${log}"\nexec "${real}" "$@"\n`);
  await chmod(join(bin, "git"), 0o755);
  await writeFile(log, "");
  const saved = process.env.PATH;
  process.env.PATH = `${bin}${delimiter}${saved}`;
  try {
    await fn();
  } finally {
    process.env.PATH = saved;
  }
  const n = (await readFile(log, "utf8")).split("\n").filter(Boolean).length;
  await rm(bin, { recursive: true, force: true });
  return n;
}

const params = { author: ["ada@example.com"], depth: 2, threshold: 0.5, minCommits: 1, paths: false, emails: false, sample: 1 };

test("git invocations grow with the number of files, not the number of commits", async () => {
  const small = await mkdtemp(join(tmpdir(), "wp-perf-"));
  const large = await mkdtemp(join(tmpdir(), "wp-perf-"));
  try {
    syntheticRepo(small, 60);
    syntheticRepo(large, 360);
    const a = await countGitCalls(() => analyseRepo(small, params));
    const b = await countGitCalls(() => analyseRepo(large, params));
    // Same files, six times the commits: the history is read in a fixed number of calls.
    assert.equal(b, a, `60 commits used ${a} git calls, 360 used ${b}`);
    // One blame per file plus a small constant for everything else.
    assert.ok(b <= FILES + 25, `${b} git calls for ${FILES} files`);
  } finally {
    await rm(small, { recursive: true, force: true });
    await rm(large, { recursive: true, force: true });
  }
});

test("a large history is read in a few log calls, not one per commit, and gives the same commits in the same order", async () => {
  const dir = await mkdtemp(join(tmpdir(), "wp-perf-"));
  try {
    syntheticRepo(dir, 300);
    const single = await listCommits(dir, { splitMin: Infinity });
    let split: Awaited<ReturnType<typeof listCommits>> = [];
    const calls = await countGitCalls(async () => {
      split = await listCommits(dir, { splitMin: 10 });
    });
    assert.equal(single.length, 300);
    assert.deepEqual(split, single);
    assert.ok(calls <= 10, `${calls} git calls to read 300 commits`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
