import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

type Who = "ada" | "bob";
const people = {
  ada: { name: "Ada", email: "ada@example.com" },
  bob: { name: "Bob", email: "bob@example.com" },
};

/** Two authors, five commits over January and February 2026, one tag, a rename, a binary, tests and docs. */
export async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-"));
  const g = (args: string[], who: Who, date: string) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: people[who].name,
        GIT_AUTHOR_EMAIL: people[who].email,
        GIT_COMMITTER_NAME: people[who].name,
        GIT_COMMITTER_EMAIL: people[who].email,
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
      },
    });
  const w = (rel: string, text: string | Buffer) => writeFile(join(dir, rel), text);
  const d1 = "2026-01-05T10:00:00Z";
  g(["init", "-q", "-b", "main"], "ada", d1);
  g(["config", "core.autocrlf", "false"], "ada", d1);
  g(["remote", "add", "origin", "git@example.com:acme/app.git"], "ada", d1);
  await mkdir(join(dir, "src"));
  await mkdir(join(dir, "test"));
  await mkdir(join(dir, "docs"));
  await w("src/a.ts", Array.from({ length: 10 }, (_, i) => `line ${i}`).join("\n") + "\n");
  await w("src/b.ts", Array.from({ length: 5 }, (_, i) => `b ${i}`).join("\n") + "\n");
  await w("docs/guide.md", "# Guide\n\nHello.\n");
  await w("logo.png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]));
  g(["add", "."], "ada", d1);
  g(["commit", "-q", "-m", "ada: initial"], "ada", d1);
  const d2 = "2026-01-12T10:00:00Z";
  await w("test/a.test.ts", "test('a', () => {});\ntest('b', () => {});\n");
  g(["add", "."], "ada", d2);
  g(["commit", "-q", "-m", "ada: tests"], "ada", d2);
  const d3 = "2026-01-19T10:00:00Z";
  await w("src/a.ts", ["line 0", "line 1", "line 2", "line 3", "line 4", "line 5", "ada 6", "ada 7", "line 8", "line 9"].join("\n") + "\n");
  g(["add", "."], "ada", d3);
  g(["commit", "-q", "-m", "ada: tweak"], "ada", d3);
  g(["tag", "-a", "v1.0.0", "-m", "first"], "ada", "2026-01-19T11:00:00Z");
  const d4 = "2026-02-02T10:00:00Z";
  await w("src/a.ts", ["line 0", "line 1", "line 2", "line 3", "line 4", "line 5", "bob 6", "bob 7", "bob 8", "bob 9"].join("\n") + "\n");
  await w("src/c.py", Array.from({ length: 6 }, (_, i) => `c ${i}`).join("\n") + "\n");
  g(["add", "."], "bob", d4);
  g(["commit", "-q", "-m", "bob: rewrite tail, add c"], "bob", d4);
  const d5 = "2026-02-09T10:00:00Z";
  g(["mv", "src/b.ts", "src/renamed.ts"], "bob", d5);
  g(["commit", "-q", "-m", "bob: rename b"], "bob", d5);
  return dir;
}
