// usage: node tamper.mjs <report.json> <report.md>
// Raises the author's commit count by 40 and the surviving lines by 500 in both files and leaves the stated hash alone.
import { readFileSync, writeFileSync } from "node:fs";
const [jsonPath, mdPath] = process.argv.slice(2);
if (!jsonPath || !mdPath) throw new Error("usage: tamper.mjs <report.json> <report.md>");
const report = JSON.parse(readFileSync(jsonPath, "utf8"));
let md = readFileSync(mdPath, "utf8");
const grouped = (n) => n.toLocaleString("en-US");
const changed = [];
for (const repo of report.repositories) {
  for (const f of repo.figures) {
    if (f.id === "commitShare" && typeof f.value?.author === "number") {
      const old = f.value.author;
      f.value.author = old + 40;
      md = md.replace(new RegExp(`\\b${grouped(old)} of `, "g"), `${grouped(f.value.author)} of `);
      changed.push(f.id);
    }
    if (f.id === "survivingLines" && typeof f.value?.lines === "number") {
      const old = f.value.lines;
      f.value.lines = old + 500;
      md = md.replace(new RegExp(`\\b${grouped(old)} of `, "g"), `${grouped(f.value.lines)} of `);
      changed.push(f.id);
    }
  }
}
if (changed.length !== 2) throw new Error(`tamper.mjs changed ${changed.length} figures; expected commitShare and survivingLines`);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));
writeFileSync(mdPath, md);
console.log(`raised ${changed.join(" and ")}; hash left as written`);
