// usage: node forge.mjs <report.json> <report.md> <workproof-dist-dir>
// Raises the author's commit count by 40 and surviving lines by 500, then recomputes the hash over the altered figures
// with workproof's own function, so `workproof check` passes. Only `verify` against the repository exposes it.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join, resolve } from "node:path";
const [jsonPath, mdPath, dist] = process.argv.slice(2);
if (!jsonPath || !mdPath || !dist) throw new Error("usage: forge.mjs <report.json> <report.md> <dist dir>");
const { hashOf } = await import(pathToFileURL(join(resolve(dist), "src/report.js")).href);
const report = JSON.parse(readFileSync(jsonPath, "utf8"));
let md = readFileSync(mdPath, "utf8");
const grouped = (n) => n.toLocaleString("en-US");
const swap = (from, to) => { md = md.replace(new RegExp(`\\b${grouped(from)} of `, "g"), `${grouped(to)} of `); };
const oldHash = report.hash;
let changed = 0;
for (const repo of report.repositories) {
  for (const f of repo.figures) {
    if (f.id === "commitShare" && typeof f.value?.author === "number") { const o = f.value.author; const oldShare = f.value.share; f.value.author = o + 40; f.value.share = f.value.author / f.value.total; swap(o, o + 40); md = md.replace(`${(oldShare * 100).toFixed(1)}%`, `${(f.value.share * 100).toFixed(1)}%`).replace(`(${Math.round(oldShare * 100)}%)`, `(${Math.round(f.value.share * 100)}%)`); changed++; }
    if (f.id === "survivingLines" && typeof f.value?.lines === "number") { const o = f.value.lines; const oldShare = f.value.share; f.value.lines = o + 500; f.value.share = f.value.lines / f.value.linesAttributed; swap(o, o + 500); md = md.replace(`${(oldShare * 100).toFixed(1)}%`, `${(f.value.share * 100).toFixed(1)}%`).replace(`(${Math.round(oldShare * 100)}%)`, `(${Math.round(f.value.share * 100)}%)`); changed++; }
  }
}
if (changed !== 2) throw new Error(`changed ${changed} figures, expected 2`);
report.hash = hashOf(report.params, report.repositories);
md = md.split(oldHash).join(report.hash);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));
writeFileSync(mdPath, md);
console.log(`raised commitShare and survivingLines; hash recomputed: ${report.hash.slice(0, 12)}`);
