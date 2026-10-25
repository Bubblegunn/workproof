import { foldIdentity, githubLogin, localPart, loose } from "./identity.js";
import { isBotIdentity } from "./bot.js";

/**
 * Who is one person. Git knows addresses; a person can hold several, and two people can share a name. This groups the
 * addresses of a history into people from stated evidence only, and records every merge with the rule that made it, so a
 * reader sees the evidence and not a guess. Two strengths:
 *
 * - proven: the repository itself ties the addresses (a Signed-off-by trailer of the same name, a GitHub noreply login
 *   that equals the other address's name, a .mailmap, which git has already applied).
 * - probable: the same full name on two addresses at the same organisation, or beside a personal mailbox. Counted in the
 *   merged figure and labelled, so the user can see the split figure beside it.
 *
 * The same full name at two unrelated organisations is NOT merged: it is listed as a namesake and kept apart.
 */
export interface PersonCommit {
  sha: string;
  email: string;
  name: string;
  body: string;
  parents: number;
  committerEmail: string;
}

export type MergeStrength = "proven" | "probable";

export interface Merge {
  a: string;
  b: string;
  rule: string;
  strength: MergeStrength;
}

export interface Person {
  /** The most frequent display name. */
  name: string;
  /** Lower-cased addresses, most commits first. */
  emails: string[];
  names: string[];
}

export interface Namesake {
  name: string;
  emails: string[];
  reason: string;
}

export interface People {
  people: Person[];
  merges: Merge[];
  namesakes: Namesake[];
  bots: { name: string; emails: string[] }[];
}

const WEBMAIL = /^(?:gmail|googlemail|outlook|hotmail|live|msn|yahoo|icloud|me|mac|proton|protonmail|pm|gmx|qq|163|126|yandex)\.[a-z]{2,}(?:\.[a-z]{2})?$/;

export type AddressClass = "organisational" | "personal" | "noreply" | "unknown";

/** Organisational (a domain with a dot that is not webmail), personal (webmail), noreply, or unknown. */
export function addressClass(email: string): AddressClass {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1 || at === e.length - 1) return "unknown";
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (domain === "users.noreply.github.com" || /^(?:noreply|no-reply|donotreply)(?:[+.-]|$)/.test(local) || /(?:^|\.)noreply\./.test(domain)) return "noreply";
  if (WEBMAIL.test(domain)) return "personal";
  if (!domain.includes(".") || /\.(?:local|localdomain|internal|lan)$/.test(domain)) return "unknown";
  return "organisational";
}

const domainOf = (email: string): string => email.slice(email.lastIndexOf("@") + 1).toLowerCase();

/** An organisation, as far as an address shows one: the registrable-looking tail of the domain (last two labels, three for co.uk style). */
function orgOf(email: string): string {
  const labels = domainOf(email).split(".");
  const tail = labels.length >= 3 && /^(?:co|com|org|ac|gov|net)$/.test(labels[labels.length - 2]!) ? 3 : 2;
  return labels.slice(-tail).join(".");
}

const isBotName = (name: string): boolean => /\[bot\]$/i.test(name.trim()) || /^(?:dependabot|renovate(?:\[bot\])?|github-actions|greenkeeper|snyk-bot|mergify|pre-commit-ci)\b/i.test(name.trim());

const SIGNOFF_RE = /^Signed-off-by:\s*(.*?)\s*<([^>]+)>\s*$/gim;

export function groupPeople(commits: PersonCommit[]): People {
  const namesOf = new Map<string, Map<string, number>>();
  const count = new Map<string, number>();
  const botEmails = new Map<string, Map<string, number>>();
  for (const c of commits) {
    const e = c.email.toLowerCase();
    if (isBotIdentity(e) || isBotName(c.name)) {
      const m = botEmails.get(e) ?? new Map<string, number>();
      m.set(c.name, (m.get(c.name) ?? 0) + 1);
      botEmails.set(e, m);
      continue;
    }
    const m = namesOf.get(e) ?? new Map<string, number>();
    m.set(c.name, (m.get(c.name) ?? 0) + 1);
    namesOf.set(e, m);
    count.set(e, (count.get(e) ?? 0) + 1);
  }
  const emails = [...namesOf.keys()].sort();
  const parent = new Map(emails.map((e) => [e, e] as const));
  const find = (e: string): string => {
    let r = e;
    while (parent.get(r) !== r) r = parent.get(r)!;
    parent.set(e, r);
    return r;
  };
  const merges: Merge[] = [];
  const join = (a: string, b: string, rule: string, strength: MergeStrength): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
    merges.push({ a, b, rule, strength });
  };
  const nameKeys = (e: string): Set<string> => new Set([...namesOf.get(e)!.keys()].map(foldIdentity).filter(Boolean));

  // Proven 1: a GitHub noreply login equal to the other address's name part or to the other's full name without separators.
  for (const a of emails) {
    const login = githubLogin(a);
    if (!login) continue;
    for (const b of emails) {
      if (a === b || githubLogin(b)) continue;
      const nameMatch = [...nameKeys(b)].some((n) => loose(n) === loose(login));
      const nameAlso = [...nameKeys(a)].some((n) => nameKeys(b).has(n));
      if (loose(localPart(b)) === loose(login) || nameMatch || (nameAlso && loose(localPart(b)) === loose(login))) join(a, b, "GitHub noreply login matches the other address", "proven");
    }
  }
  // Proven 2: a Signed-off-by trailer on a commit that address A both authored and committed, naming another known address B
  // (or naming A's own name): the signer certifies the commit as theirs, so B is the same person as A.
  for (const c of commits) {
    const a = c.email.toLowerCase();
    if (!namesOf.has(a)) continue;
    const selfCommitted = c.committerEmail.toLowerCase() === a;
    const signers = [...c.body.matchAll(SIGNOFF_RE)].map((m) => ({ name: foldIdentity(m[1] ?? ""), email: (m[2] ?? "").toLowerCase() }));
    // A squash or aggregate commit lists several signers; one lone signer on a self-committed commit, or a signer of the author's own name, is the author.
    const foreign = new Set(signers.filter((s) => s.email !== a).map((s) => s.email));
    for (const s of signers) {
      if (s.email === a || !emails.includes(s.email)) continue;
      if ((s.name && nameKeys(a).has(s.name)) || (selfCommitted && foreign.size === 1)) join(a, s.email, "Signed-off-by trailer on a commit of the other address", "proven");
    }
  }
  // Probable: the same full name (two words or more).
  const byName = new Map<string, string[]>();
  for (const e of emails) for (const n of nameKeys(e)) if (n.includes(" ")) byName.set(n, [...(byName.get(n) ?? []), e]);
  const namesakes: Namesake[] = [];
  for (const [n, es] of [...byName].sort((x, y) => (x[0] < y[0] ? -1 : 1))) {
    if (new Set(es.map(find)).size < 2) continue;
    const perOrg = new Map<string, string[]>();
    const others: string[] = [];
    for (const e of es) {
      if (addressClass(e) === "organisational") perOrg.set(orgOf(e), [...(perOrg.get(orgOf(e)) ?? []), e]);
      else others.push(e);
    }
    for (const group of perOrg.values()) for (const e of group.slice(1)) join(group[0]!, e, "same full name at the same organisation", "probable");
    const anchor = perOrg.size ? [...perOrg.values()][0]![0]! : others[0];
    if (perOrg.size <= 1) {
      for (const e of others) if (e !== anchor) join(anchor!, e, "same full name beside a personal mailbox", "probable");
    } else {
      namesakes.push({ name: n, emails: es, reason: `the same full name at unrelated organisations (${[...perOrg.keys()].join(", ")}): kept apart, not merged` });
    }
  }
  const groups = new Map<string, string[]>();
  for (const e of emails) groups.set(find(e), [...(groups.get(find(e)) ?? []), e]);
  const people: Person[] = [...groups.values()].map((es) => {
    const names = new Map<string, number>();
    for (const e of es) for (const [n, k] of namesOf.get(e)!) names.set(n, (names.get(n) ?? 0) + k);
    const sortedNames = [...names].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([n]) => n);
    return { name: sortedNames[0]!, names: sortedNames, emails: [...es].sort((a, b) => (count.get(b) ?? 0) - (count.get(a) ?? 0) || (a < b ? -1 : 1)) };
  });
  people.sort((a, b) => a.name.localeCompare(b.name));
  const bots = [...botEmails].map(([e, names]) => ({ name: [...names.keys()][0]!, emails: [e] }));
  return { people, merges, namesakes, bots };
}
