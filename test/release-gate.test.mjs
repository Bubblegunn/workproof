// scripts/release-gate.mjs against a throwaway package directory.
//
// No network: npm pack runs in the local fixture only.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  chmodSync,
} from "node:fs";
import { join, dirname, delimiter } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "scripts",
  "release-gate.mjs",
);

function fixture({ packageVersion, changelogHeading }) {
  const base = mkdtempSync(join(tmpdir(), "release-gate-test-"));
  const repo = base;

  const write = (file, content) => {
    const path = join(repo, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };

  write(
    "package.json",
    `${JSON.stringify(
      {
        name: "fixture-pkg",
        version: packageVersion,
        description: "release gate fixture",
        files: ["dist"],
      },
      null,
      2,
    )}\n`,
  );

  write(
    "CHANGELOG.md",
    `# Changelog\n\n${changelogHeading}\n\n- Something changed.\n\n`,
  );

  write(
    "CITATION.cff",
    `cff-version: 1.2.0
title: "fixture-pkg"
version: "${packageVersion}"
date-released: "2026-01-01"
`,
  );

  write(
    "action.yml",
    `name: fixture
inputs:
  version:
    description: fixture version
    required: false
    default: "${packageVersion}"
runs:
  using: composite
  steps: []
`,
  );

  write(
    "python/pyproject.toml",
    `[project]
name = "fixture-pkg"
version = "${packageVersion}"
`,
  );

  write(
    ".claude-plugin/plugin.json",
    `${JSON.stringify(
      {
        name: "fixture-pkg",
        version: packageVersion,
      },
      null,
      2,
    )}\n`,
  );

  write("dist/index.js", "console.log('fixture');\n");

  write(
    "scripts/pack-allowlist.txt",
    [
      "package.json",
      "CHANGELOG.md",
      "CITATION.cff",
      "action.yml",
      "python/pyproject.toml",
      ".claude-plugin/plugin.json",
      "dist/index.js",
    ].join("\n") + "\n",
  );

  return {
    base,
    repo,
    read: (file) => readFileSync(join(repo, file), "utf8"),
  };
}

const run = (repo, args = [], env = process.env) =>
  spawnSync(process.execPath, [script, ...args], {
    cwd: repo,
    encoding: "utf8",
    env,
  });

function resolveRealNpm() {
  const command = process.platform === "win32" ? "where.exe" : "which";

  const result = spawnSync(command, ["npm"], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`could not resolve npm: ${result.stderr}`);
  }

  const npmPath = result.stdout.trim().split(/\r?\n/)[0];
  if (!npmPath) {
    throw new Error("could not resolve npm path");
  }

  return npmPath;
}

function createFakeNpm(repo, mode, realNpm) {
  const fakeBin = join(repo, "fake-bin");
  mkdirSync(fakeBin);

  const fakeNpmScript = join(fakeBin, "fake-npm.mjs");

  writeFileSync(
    fakeNpmScript,
    ` import { execFileSync } from "node:child_process";
      import { readFileSync } from "node:fs";

      const realNpm = ${JSON.stringify(realNpm)};
      const mode = ${JSON.stringify(mode)};
      const args = process.argv.slice(2);

      const expected = [
        "pack",
        "--dry-run",
        "--json",
        "--ignore-scripts",
      ];

      if (
        args.length !== expected.length ||
        args.some((arg, index) => arg !== expected[index])
      ) {
        process.stderr.write(
          \`unexpected npm invocation: \${args.join(" ")}\`,
        );
        process.exit(1);
      }

      if (mode === "invalid") {
        process.stdout.write(JSON.stringify({ unexpected: true }));
        process.exit(0);
      }

      const output = execFileSync(realNpm, args, {
        cwd: process.cwd(),
        encoding: "utf8",
        ${process.platform === "win32" ? "shell: true," : ""}
      });

      const packed = JSON.parse(output);

      const packageJson = JSON.parse(
        readFileSync("package.json", "utf8"),
      );

      const packageName = packageJson.name;

      let packageData;

      if (Array.isArray(packed)) {
        packageData = packed[0];
      } else if (packed && typeof packed === "object") {
        packageData = packed[packageName];
      }

      if (!packageData) {
        throw new Error(
          "could not extract package data from real npm output",
        );
      }

      process.stdout.write(
        JSON.stringify({
          [packageName]: packageData,
        }),
      );
      `,
  );

  if (process.platform === "win32") {
    writeFileSync(
      join(fakeBin, "npm.cmd"),
      `@echo off\r\n"${process.execPath}" "${fakeNpmScript}" %*\r\n`,
    );
  } else {
    const fakeNpm = join(fakeBin, "npm");

    writeFileSync(
      fakeNpm,
      `#!/bin/sh
      exec "${process.execPath}" "${fakeNpmScript}" "$@"
    `,
    );

    chmodSync(fakeNpm, 0o755);
  }

  return fakeBin;
}

test("accepts a released version when the CHANGELOG entry is dated", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 0, r.stderr);
    assert.match(
      r.stdout,
      /release-gate: ok, released at 0\.4\.2,/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("accepts a future undated version as pending", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.5.0 (unreleased)",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 0, r.stderr);
    assert.match(
      r.stdout,
      /release-gate: ok, 0\.5\.0 pending, package at 0\.4\.2,/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("rejects a current version when the CHANGELOG entry is undated", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /CHANGELOG\.md top entry 0\.4\.2 is undated/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("rejects a future version when the CHANGELOG entry is dated", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.5.0 (2026-09-19)",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /CHANGELOG\.md top entry 0\.5\.0 is dated, package\.json is 0\.4\.2/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("rejects an older CHANGELOG version", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.1 (2026-09-12)",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /CHANGELOG\.md top entry is 0\.4\.1, package\.json is 0\.4\.2/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("compares versions numerically", () => {
  const f = fixture({
    packageVersion: "0.9.0",
    changelogHeading: "## 0.10.0",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 0, r.stderr);
    assert.match(
      r.stdout,
      /release-gate: ok, 0\.10\.0 pending, package at 0\.9\.0,/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("accepts a package when all packed files are in the allowlist", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    const r = run(f.repo);

    assert.equal(r.status, 0, r.stderr);
    assert.match(
      r.stdout,
      /release-gate: ok, released at 0\.4\.2,/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("reject a package when unexpected pack includes a file outside the allowed list", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    writeFileSync(
      join(f.repo, "dist", "unexpected.js"),
      "console.log('unexpected');\n",
    );
    const r = run(f.repo);
    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /npm pack would ship dist\/unexpected\.js, which is not in scripts\/pack-allowlist\.txt/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("updates the allowlist with the files npm pack would ship", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    writeFileSync(
      join(f.repo, "dist", "unexpected.js"),
      "console.log('unexpected');\n",
    );

    const r = run(f.repo, ["--update"]);

    assert.equal(r.status, 0, r.stderr);
    assert.match(
      r.stdout,
      /release-gate: wrote \d+ paths to scripts\/pack-allowlist\.txt/,
    );

    assert.match(
      f.read("scripts/pack-allowlist.txt"),
      /^dist\/unexpected\.js$/m,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("release gate handles npm 12 package-name keyed pack output", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    const realNpm = resolveRealNpm();
    const fakeBin = createFakeNpm(f.repo, "object", realNpm);

    const env = {
      ...process.env,
      PATH: `${fakeBin}${delimiter}${process.env.PATH ?? ""}`,
    };

    const result = run(f.repo, [], env);

    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});

test("release gate rejects an unrecognized npm pack output shape", () => {
  const f = fixture({
    packageVersion: "0.4.2",
    changelogHeading: "## 0.4.2 (2026-09-12)",
  });

  try {
    const realNpm = resolveRealNpm();
    const fakeBin = createFakeNpm(f.repo, "invalid", realNpm);

    const env = {
      ...process.env,
      PATH: `${fakeBin}${delimiter}${process.env.PATH ?? ""}`,
    };

    const result = run(f.repo, [], env);

    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /unexpected npm pack output shape/,
    );
  } finally {
    rmSync(f.base, { recursive: true, force: true });
  }
});
