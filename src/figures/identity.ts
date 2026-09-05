import type { Commit } from "../git.js";
import { configuredEmail, configuredName } from "../git.js";
import type { Identity } from "./types.js";


/**
 * Fold a name or address for matching. Two things defeat a plain `toLowerCase()`:
 *
 * Normalization. A repository authored on Linux can carry "José" decomposed while the same name
 * typed on macOS arrives precomposed. They are the same name and compared unequal, and the error
 * then listed an author that looked identical to what was typed, which nobody can debug.
 *
 * The Turkish dotted and dotless i. `"İ".toLowerCase()` is "i" followed by a combining dot above,
 * and `"I".toLowerCase()` is "i" rather than "ı", so "İSMAİL YILMAZ" matched neither "İsmail
 * Yılmaz" nor itself lowercased. A locale-aware fold cannot be applied globally, because it would
 * turn English "I" into "ı", so the four i forms collapse to one instead. The cost is that two
 * names differing only in dotted and dotless i match each other; the benefit is that a Turkish
 * name matches itself in any case, and the error message prints the folded form that was tried.
 */
export function foldIdentity(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u0130\u0131Ii]/g, "i")
    .replace(/\u0307/g, "")
    .toLowerCase()
    .normalize("NFC")
    .trim();
}

/**
 * Resolve the author to report on. `author` entries match mailmapped emails or
 * names, case-insensitively; with none given, the repository's configured
 * user.email is used.
 */
export async function resolveIdentity(commits: Commit[], author: string[] | undefined, cwd: string): Promise<Identity> {
  const explicit = author && author.length ? author : [];
  // Without --author, try the configured email, then the configured name.
  const wanted = (explicit.length ? explicit : [await configuredEmail(cwd), await configuredName(cwd)]).filter(Boolean).map(foldIdentity).filter(Boolean);
  if (!wanted.length) throw new Error(`no author given and git config has no user.email or user.name; pass --author. ${authorsHint(commits)}`);
  const emails = new Set<string>();
  const names = new Set<string>();
  for (const c of commits) {
    if (wanted.includes(foldIdentity(c.email)) || wanted.includes(foldIdentity(c.name))) {
      emails.add(c.email);
      names.add(c.name);
    }
  }
  if (!emails.size) throw new Error(`no commits by ${wanted.join(" or ")} in this repository, comparing names and addresses folded to that form. ${authorsHint(commits)}`);
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
