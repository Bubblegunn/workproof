/**
 * The two claims from `npm run bench:adversarial` that must not quietly regress:
 * reformatting does not move surviving lines, and a co-author trailer does not
 * hand anyone else's lines to the subject. The bench itself builds six
 * repositories and takes about a minute, so it stays a bench; these are the
 * same properties on repositories small enough to run in a test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyseRepo } from "../src/analyse.js";

const ADA = { name: "Ada", email: "ada@example.com" };
const BOB = { name: "Bob", email: "bob@example.com" };
const PARAMS = { author: ["ada@example.com"], sample: 1, depth: 2, threshold: 0.05, minCommits: 1, paths: false, emails: false, exclusions: true, exclude: [], seed: "", copies: false };

const surviving = (r: Awaited<ReturnType<typeof analyseRepo>>) =>
  (r.figures.find((f) => f.id === "survivingLines")!.value as { lines: number }).lines;

async function repo() {
  const dir = await mkdtemp(join(tmpdir(), "workproof-adv-test-"));
  const git = (args: string[], who: typeof ADA, date: string) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email,
        GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email,
        GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date,
      },
    });
  git(["init", "-q", "-b", "main"], ADA, "2026-01-05T10:00:00Z");
  git(["config", "core.autocrlf", "false"], ADA, "2026-01-05T10:00:00Z");
  return { dir, git, write: (rel: string, text: string) => writeFile(join(dir, rel), text) };
}

const TWELVE = Array.from({ length: 12 }, (_, i) => `const line${i} = ${i};`).join("\n") + "\n";

test("reformatting every line does not move surviving lines away from whoever wrote them", async () => {
  const { dir, git, write } = await repo();
  try {
    await write("a.ts", TWELVE);
    git(["add", "."], ADA, "2026-01-05T10:00:00Z");
    git(["commit", "-q", "-m", "ada: code"], ADA, "2026-01-05T10:00:00Z");
    const before = surviving(await analyseRepo(dir, PARAMS));
    assert.equal(before, 12);

    await write("a.ts", TWELVE.split("\n").map((l) => (l ? `    ${l}   ` : l)).join("\n"));
    git(["add", "."], BOB, "2026-01-12T10:00:00Z");
    git(["commit", "-q", "-m", "bob: reindent"], BOB, "2026-01-12T10:00:00Z");

    assert.equal(surviving(await analyseRepo(dir, PARAMS)), 12, "blame runs with -w, so whitespace does not transfer a line");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a Co-authored-by trailer changes the co-authored count and nothing else", async () => {
  const build = async (trailer: boolean) => {
    const { dir, git, write } = await repo();
    await write("a.ts", TWELVE);
    git(["add", "."], ADA, "2026-01-05T10:00:00Z");
    git(["commit", "-q", "-m", "ada: code"], ADA, "2026-01-05T10:00:00Z");
    await write("b.ts", Array.from({ length: 30 }, (_, i) => `const b${i} = ${i};`).join("\n") + "\n");
    git(["add", "."], BOB, "2026-01-12T10:00:00Z");
    git(["commit", "-q", "-m", trailer ? "bob: work\n\nCo-authored-by: Ada <ada@example.com>" : "bob: work"], BOB, "2026-01-12T10:00:00Z");
    return { dir, report: await analyseRepo(dir, PARAMS) };
  };

  const plain = await build(false);
  const credited = await build(true);
  try {
    const only = (r: Awaited<ReturnType<typeof analyseRepo>>) =>
      r.figures.filter((f) => f.id !== "coAuthored").map((f) => [f.id, JSON.stringify(f.value)]);
    assert.deepEqual(only(credited.report), only(plain.report), "the trailer moved a figure other than the co-authored count");
    assert.equal(surviving(credited.report), 12, "the subject keeps the twelve lines she wrote, not Bob's thirty");
  } finally {
    rmSync(plain.dir, { recursive: true, force: true });
    rmSync(credited.dir, { recursive: true, force: true });
  }
});
