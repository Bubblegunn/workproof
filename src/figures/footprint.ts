import type { Commit } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

const LANG: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", cs: "C#", go: "Go", rs: "Rust", java: "Java", kt: "Kotlin", swift: "Swift", rb: "Ruby", php: "PHP",
  c: "C", h: "C", cpp: "C++", hpp: "C++", ex: "Elixir", exs: "Elixir", scala: "Scala", sc: "Scala", hs: "Haskell", lhs: "Haskell", lua: "Lua", r: "R", m: "Objective-C", mm: "Objective-C", zig: "Zig",
  css: "CSS", scss: "CSS", html: "HTML", vue: "Vue", svelte: "Svelte",
  sql: "SQL", sh: "Shell", yml: "YAML", yaml: "YAML", json: "JSON", md: "Markdown", mdx: "Markdown", tf: "Terraform", dart: "Dart",
};

export function languageOf(path: string): string | null {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return path.includes(".") ? LANG[ext] ?? null : null;
}

const isTest = (p: string) => /(^|\/)(__tests__|tests?|spec|e2e)\//i.test(p) || /\.(test|spec)\.[a-z]+$/i.test(p);
const isDoc = (p: string) => /\.(md|mdx|rst)$/i.test(p);

function dirAt(path: string, depth: number): string | null {
  const parts = path.split("/");
  if (parts.length <= 1) return null;
  return parts.slice(0, Math.min(depth, parts.length - 1)).join("/");
}

export interface OwnedDirectory { path: string; author: number; total: number; share: number }

export function footprint(commits: Commit[], id: Identity, opts: { depth: number; threshold: number; minCommits: number }) {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  const touched = new Set<string>();
  const dirs = new Map<string, { author: number; total: number }>();
  const langLines = new Map<string, number>();
  for (const c of nonMerge) {
    const mine = isMine(c, id);
    const seenDirs = new Set<string>();
    for (const f of c.files) {
      if (mine) {
        touched.add(f.path);
        const lang = languageOf(f.path);
        if (lang && f.added !== null) langLines.set(lang, (langLines.get(lang) ?? 0) + f.added);
      }
      const d = dirAt(f.path, opts.depth);
      if (d) seenDirs.add(d);
    }
    for (const d of seenDirs) {
      const e = dirs.get(d) ?? { author: 0, total: 0 };
      e.total++;
      if (mine) e.author++;
      dirs.set(d, e);
    }
  }
  const ownedDirectories: OwnedDirectory[] = [...dirs.entries()]
    .map(([path, e]) => ({ path, author: e.author, total: e.total, share: e.total ? e.author / e.total : 0 }))
    .filter((d) => d.total >= opts.minCommits && d.share >= opts.threshold)
    .sort((a, b) => b.share - a.share || b.total - a.total);
  const totalLines = [...langLines.values()].reduce((s, n) => s + n, 0);
  const languages = [...langLines.entries()]
    .map(([language, lines]) => ({ language, lines, share: totalLines ? lines / totalLines : 0 }))
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 8);
  const value = { filesTouched: touched.size, ownedDirectories, languages };
  const figure: Figure<typeof value> = {
    id: "footprint",
    title: "Footprint",
    value,
    command: `git log --no-merges --numstat -M; directories at depth ${opts.depth} where the author's commit share is at least ${Math.round(opts.threshold * 100)}% over at least ${opts.minCommits} commits; languages by lines added, extension map`,
    limits: [
      "Generated, vendored, lock and snapshot files are excluded by the built-in lists and .gitattributes; anything they miss still counts.",
      "A directory owned by commit count may still contain other people's surviving code; see the blame figure.",
    ],
  };
  return figure;
}

export function testsAndDocs(commits: Commit[], id: Identity) {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  let testChangesAuthor = 0;
  let testChangesTotal = 0;
  const docs = new Set<string>();
  for (const c of nonMerge) {
    const mine = isMine(c, id);
    for (const f of c.files) {
      if (isTest(f.path)) {
        testChangesTotal++;
        if (mine) testChangesAuthor++;
      }
      if (mine && isDoc(f.path)) docs.add(f.path);
    }
  }
  const value = { testChangesAuthor, testChangesTotal, testShare: testChangesTotal ? testChangesAuthor / testChangesTotal : 0, docsAuthored: docs.size };
  const figure: Figure<typeof value> = {
    id: "testsAndDocs",
    title: "Tests and documentation",
    value,
    command: "git log --no-merges --numstat; test paths match __tests__/, test/, tests/, spec/, e2e/ or *.test.* / *.spec.*; docs are .md, .mdx, .rst",
    limits: ["Test file changes are counted, not test cases or coverage.", "A README edit and a design document count the same."],
  };
  return figure;
}
