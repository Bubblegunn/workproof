import type { Commit } from "../git.js";
import { configuredEmail, configuredName } from "../git.js";
import type { Identity } from "./types.js";

/**
 * Resolve the author to report on. `author` entries match mailmapped emails or
 * names, case-insensitively; with none given, the repository's configured
 * user.email is used.
 */
export async function resolveIdentity(commits: Commit[], author: string[] | undefined, cwd: string): Promise<Identity> {
  const explicit = author && author.length ? author : [];
  // Without --author, try the configured email, then the configured name.
  const wanted = (explicit.length ? explicit : [await configuredEmail(cwd), await configuredName(cwd)]).map((a) => a.toLowerCase()).filter(Boolean);
  if (!wanted.length) throw new Error(`no author given and git config has no user.email or user.name; pass --author. ${authorsHint(commits)}`);
  const emails = new Set<string>();
  const names = new Set<string>();
  for (const c of commits) {
    if (wanted.includes(c.email) || wanted.includes(c.name.toLowerCase())) {
      emails.add(c.email);
      names.add(c.name);
    }
  }
  if (!emails.size) throw new Error(`no commits by ${wanted.join(" or ")} in this repository. ${authorsHint(commits)}`);
  return { emails: [...emails].sort(), names: [...names].sort() };
}

/** The most frequent author names, so the error tells the user what to pass. */
function authorsHint(commits: Commit[]): string {
  const counts = new Map<string, number>();
  for (const c of commits) counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, n]) => `"${name}" (${n})`);
  return top.length ? `Authors here: ${top.join(", ")}. Pass one with --author.` : "The repository has no commits.";
}

export const isMine = (c: Commit, id: Identity): boolean => id.emails.includes(c.email);
