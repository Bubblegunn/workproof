import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

export async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileP("git", args, { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 512 });
  return stdout;
}

export interface FileChange { path: string; added: number | null; deleted: number | null }
export interface Commit { sha: string; email: string; name: string; date: Date; parents: number; files: FileChange[] }

/** All commits reachable from HEAD, newest first, with per-file numstat. One git call. */
export async function listCommits(cwd: string, opts: { since?: string; until?: string }): Promise<Commit[]> {
  const args = ["log", "--numstat", "--format=%x1e%H%x1f%aE%x1f%aN%x1f%aI%x1f%P", "-M"];
  if (opts.since) args.push(`--since=${opts.since}`);
  if (opts.until) args.push(`--until=${opts.until}`);
  const out = await git(args, cwd);
  const commits: Commit[] = [];
  for (const block of out.split("\x1e")) {
    if (!block.trim()) continue;
    const [header, ...rest] = block.split("\n");
    const [sha, email, name, iso, parents] = header!.split("\x1f");
    const files: FileChange[] = [];
    for (const line of rest) {
      if (!line.trim()) continue;
      const [a, d, ...pathParts] = line.split("\t");
      let path = pathParts.join("\t");
      // rename entries look like "old => new" or "dir/{old => new}/file"
      const brace = path.match(/^(.*)\{(.*) => (.*)\}(.*)$/);
      if (brace) path = `${brace[1]}${brace[3]}${brace[4]}`;
      else if (path.includes(" => ")) path = path.split(" => ")[1]!;
      files.push({ path, added: a === "-" ? null : Number(a), deleted: d === "-" ? null : Number(d) });
    }
    commits.push({
      sha: sha!,
      email: email!.toLowerCase(),
      name: name!,
      date: new Date(iso!),
      parents: parents ? parents.trim().split(" ").filter(Boolean).length : 0,
      files,
    });
  }
  return commits;
}

export interface Tag { name: string; date: Date; email: string }

export async function listTags(cwd: string): Promise<Tag[]> {
  const out = await git(["for-each-ref", "--format=%(refname:short)%09%(creatordate:iso-strict)%09%(taggeremail)%09%(*authoremail)%09%(authoremail)", "refs/tags"], cwd);
  const tags: Tag[] = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const [name, iso, tagger, tagged, direct] = line.split("\t");
    const email = (tagger || tagged || direct || "").replace(/^<|>$/g, "").toLowerCase();
    tags.push({ name: name!, date: new Date(iso!), email });
  }
  return tags.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const rootCommit = async (cwd: string) => (await git(["rev-list", "--max-parents=0", "HEAD"], cwd)).trim().split("\n").pop()!;
export const headSha = async (cwd: string) => (await git(["rev-parse", "HEAD"], cwd)).trim();
export async function remoteUrl(cwd: string): Promise<string> {
  try { return (await git(["config", "--get", "remote.origin.url"], cwd)).trim(); } catch { return ""; }
}
export async function configuredEmail(cwd: string): Promise<string> {
  try { return (await git(["config", "--get", "user.email"], cwd)).trim().toLowerCase(); } catch { return ""; }
}
