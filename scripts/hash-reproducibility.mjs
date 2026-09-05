// The hash is the product's one promise: the same repository at the same commit hashes
// the same for a stranger. This builds a fixture whose commit SHAs are fully pinned,
// measures it twice under two directory names, and checks the hash against a constant.
// Run on Linux, macOS and Windows in CI, a cross-platform difference fails the build.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const cli = join(root, "dist", "src", "cli.js");
const KEY = "0123456789abcdef0123456789abcdef";

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.com",
  GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.com",
  GIT_AUTHOR_DATE: "2026-01-01T10:00:00+00:00", GIT_COMMITTER_DATE: "2026-01-01T10:00:00+00:00",
  TZ: "UTC",
};
const git = (cwd, ...args) => execFileSync("git", ["-c", "core.autocrlf=false", "-c", "init.defaultBranch=main", ...args], { cwd, env, encoding: "utf8" });

function fixture(dir) {
  mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q");
  for (let i = 1; i <= 6; i++) {
    // Explicit LF: a CRLF checkout would change the blob and so the commit sha.
    writeFileSync(join(dir, `f${i}.ts`), `const a${i} = ${i};\nconst b${i} = ${i};\nconst c${i} = ${i};\n`);
    git(dir, "add", `f${i}.ts`);
    git(dir, "commit", "-q", "-m", `add f${i}`);
  }
  return dir;
}

const base = mkdtempSync(join(tmpdir(), "wp-repro-"));
try {
  const alpha = fixture(join(base, "alpha"));
  const beta = join(base, "beta");
  cpSync(alpha, beta, { recursive: true });

  const hashIn = (cwd) => {
    const out = execFileSync(process.execPath, [cli, "--author", "ada@example.com", "--fingerprint-key", KEY, "--json"], { cwd, env, encoding: "utf8" });
    return JSON.parse(out).hash;
  };
  const a = hashIn(alpha);
  const b = hashIn(beta);

  console.log(`${process.platform} node ${process.versions.node} git ${git(alpha, "--version").trim()}`);
  console.log(`  alpha ${a}`);
  console.log(`  beta  ${b}`);
  if (a !== b) {
    console.error("the directory name moved the hash; the report is not reproducible");
    process.exit(1);
  }
  if (process.env.WORKPROOF_EXPECT && process.env.WORKPROOF_EXPECT !== a) {
    console.error(`this platform hashes ${a}, another hashed ${process.env.WORKPROOF_EXPECT}`);
    process.exit(1);
  }
  console.log(`ok: one hash for one repository, whatever it is called (${a})`);
} finally {
  rmSync(base, { recursive: true, force: true });
}
