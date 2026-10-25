import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

export interface SpecCommit {
  name: string;
  email: string;
  /** Author date, any git date format. */
  date: string;
  /** Committer date; the author date when absent. */
  committerDate?: string;
  /** Committer name and address; the author's when absent. */
  committer?: { name: string; email: string };
  message: string;
  /** Files written in this commit (path to text). A commit with no files is an empty commit. */
  files?: Record<string, string>;
}

/** Builds a repository from a list of commits, in order, with fixed dates and no global git configuration. */
export async function buildHistory(commits: SpecCommit[]): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "workproof-history-"));
  const base = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  const git = (args: string[], env: NodeJS.ProcessEnv = {}) => execFileSync("git", args, { cwd: dir, env: { ...base, ...env }, encoding: "utf8" });
  git(["init", "-q", "-b", "main"]);
  for (const [i, c] of commits.entries()) {
    for (const [path, text] of Object.entries(c.files ?? {})) {
      await mkdir(dirname(join(dir, path)), { recursive: true });
      await writeFile(join(dir, path), text);
    }
    git(["add", "."]);
    const committer = c.committer ?? { name: c.name, email: c.email };
    git(["-c", "commit.gpgsign=false", "commit", "-q", "--allow-empty", "-m", c.message], {
      GIT_AUTHOR_NAME: c.name,
      GIT_AUTHOR_EMAIL: c.email,
      GIT_AUTHOR_DATE: c.date,
      GIT_COMMITTER_NAME: committer.name,
      GIT_COMMITTER_EMAIL: committer.email,
      GIT_COMMITTER_DATE: c.committerDate ?? c.date,
    });
    void i;
  }
  return dir;
}

/** `n` lines of text, so a commit adds a known number of lines. */
export const lines = (n: number, tag = "x"): string => Array.from({ length: n }, (_, i) => `${tag} ${i}`).join("\n") + "\n";

export const head = (dir: string): string => execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
