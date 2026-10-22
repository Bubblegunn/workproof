// Copies the non-TypeScript files the CLI runs from src/ into dist/, after tsc.
// tsc emits only .ts sources, so the session miner (.mjs) and its Apache licence
// would otherwise be missing from the built package. Fails loudly if either is absent.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = ["mine-sessions.mjs", "LICENSE-APACHE-2.0"];
const from = join(root, "src", "sessions");
const to = join(root, "dist", "src", "sessions");

mkdirSync(to, { recursive: true });
for (const name of assets) {
  const source = join(from, name);
  if (!existsSync(source)) throw new Error(`copy-assets: missing ${source}`);
  copyFileSync(source, join(to, name));
}
console.log(`copy-assets: ${assets.length} files into dist/src/sessions`);
