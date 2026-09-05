import type { Commit } from "../git.js";
import { configuredEmail } from "../git.js";
import type { Identity } from "./types.js";

/**
 * Resolve the author to report on. `author` entries match mailmapped emails or
 * names, case-insensitively; with none given, the repository's configured
 * user.email is used.
 */
export async function resolveIdentity(commits: Commit[], author: string[] | undefined, cwd: string): Promise<Identity> {
  const wanted = (author && author.length ? author : [await configuredEmail(cwd)]).map((a) => a.toLowerCase()).filter(Boolean);
  if (!wanted.length) throw new Error("no author given and git config user.email is empty; pass --author");
  const emails = new Set<string>();
  const names = new Set<string>();
  for (const c of commits) {
    if (wanted.includes(c.email) || wanted.includes(c.name.toLowerCase())) {
      emails.add(c.email);
      names.add(c.name);
    }
  }
  if (!emails.size) throw new Error(`no commits by ${wanted.join(", ")} in this repository`);
  return { emails: [...emails].sort(), names: [...names].sort() };
}

export const isMine = (c: Commit, id: Identity): boolean => id.emails.includes(c.email);
