import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

type Who = "ada" | "bob" | "bot" | "aider";
const people = {
  ada: { name: "Ada", email: "ada@example.com" },
  bob: { name: "Bob", email: "bob@example.com" },
  bot: { name: "dependabot[bot]", email: "49699333+dependabot[bot]@users.noreply.github.com" },
  aider: { name: "Bob (aider)", email: "bob@example.com" },
};

/**
 * Two people and a bot, ten commits over January and February 2026, one tag, a rename, a
 * binary, tests and docs. Commits 6 to 10 exist to exercise the exclusions: a bot adding a
 * lock file, a generated file marked in .gitattributes with a co-author trailer, an
 * AI-assisted commit, a reformat, and the .git-blame-ignore-revs that names it.
 */
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
  const d6 = "2026-02-10T10:00:00Z";
  await w("package-lock.json", Array.from({ length: 20 }, (_, i) => `  "dep-${i}": "1.0.${i}",`).join("\n") + "\n");
  g(["add", "."], "bot", d6);
  g(["commit", "-q", "-m", "chore(deps): bump deps"], "bot", d6);
  const d7 = "2026-02-11T10:00:00Z";
  await mkdir(join(dir, "gen"));
  await w("gen/out.ts", Array.from({ length: 8 }, (_, i) => `export const g${i} = ${i};`).join("\n") + "\n");
  await w(".gitattributes", "gen/* linguist-generated\n");
  g(["add", "."], "bob", d7);
  g(["commit", "-q", "-m", "bob: generated output", "-m", "Co-authored-by: Ada <ada@example.com>"], "bob", d7);
  const d8 = "2026-02-12T10:00:00Z";
  await w("docs/guide.md", "# Guide\n\nHello.\n\nMore.\n");
  g(["add", "."], "aider", d8);
  g(["commit", "-q", "-m", "docs: more guide", "-m", "Co-Authored-By: Claude <noreply@anthropic.com>"], "aider", d8);
  const d9 = "2026-02-13T10:00:00Z";
  await w("src/a.ts", ["line 0", "line 1", "line 2", "line 3", "line 4", "line 5", "bob 6", "bob 7", "bob 8", "bob 9"].map((l) => `${l};`).join("\n") + "\n");
  g(["add", "."], "bob", d9);
  g(["commit", "-q", "-m", "style: semicolons everywhere"], "bob", d9);
  const reformat = g(["rev-parse", "HEAD"], "bob", d9).trim();
  const d10 = "2026-02-14T10:00:00Z";
  await w(".git-blame-ignore-revs", `# semicolons\n${reformat}\n`);
  g(["add", "."], "bob", d10);
  g(["commit", "-q", "-m", "chore: blame ignore revs"], "bob", d10);
  return dir;
}
