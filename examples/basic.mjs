// Cross-platform twin of basic.sh, used by `npm run examples` and CI.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const out = join(mkdtempSync(join(tmpdir(), "workproof-example-")), "report");
const run = (args) => process.stdout.write(execFileSync("node", ["dist/src/cli.js", ...args], { encoding: "utf8" }));
run(["--repo", ".", "--author", "Efe Genc", "--out", out]);
run(["verify", `${out}.json`, "--repo", "."]);
