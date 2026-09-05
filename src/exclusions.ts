/**
 * What leaves every denominator before a figure is computed.
 *
 * Bots are recognised by the two patterns GitHub uses for app identities, nothing
 * cleverer: a name ending in "[bot]" or the "<id>+<name>[bot]@users.noreply.github.com"
 * address. Generated, vendored, lock and snapshot files follow the subset of
 * github-linguist's generated.rb and vendor.yml that moves line counts, plus whatever a
 * repository marks with linguist-generated or linguist-vendored in .gitattributes.
 */

export const isBot = (c: { name: string; email: string }): boolean =>
  /\[bot\]$/.test(c.name) || /^\d+\+.*\[bot\]@users\.noreply\.github\.com$/i.test(c.email);

const LOCK_FILES = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
  "cargo.lock",
  "poetry.lock",
  "uv.lock",
  "pdm.lock",
  "pipfile.lock",
  "gemfile.lock",
  "composer.lock",
  "go.sum",
  "packages.lock.json",
  "flake.lock",
  "mix.lock",
  "pubspec.lock",
  "gradle.lockfile",
  "podfile.lock",
  "deno.lock",
]);

const VENDORED_DIRS = /(^|\/)(vendor|vendors|node_modules|third_party|third-party|thirdparty|bower_components|jspm_packages|pods|\.yarn|\.pnp|extern|externals|deps)\//i;

const GENERATED_PATTERNS: RegExp[] = [
  /(^|\/)__snapshots__\//,
  /\.snap$/,
  /\.min\.(js|css|mjs|cjs)$/,
  /\.(js|css|mjs|cjs)\.map$/,
  /\.pb\.(go|ts|js|cc|h|swift|rb|py)$/,
  /_pb2(_grpc)?\.py$/,
  /\.pb\.dart$/,
  /\.g\.(dart|cs)$/,
  /\.generated\.[a-z0-9]+$/i,
  /\.designer\.cs$/i,
  /(^|\/)generated\//i,
  /(^|\/)__generated__\//,
  /(^|\/)dist\//,
  /(^|\/)build\/.*\.(js|css)$/,
  /(^|\/)swagger\.(json|yaml|yml)$/i,
  /(^|\/)openapi\.(json|yaml|yml)$/i,
  /\.xcodeproj\//,
  /\.nib$/,
  /\.xib$/,
  /\.storyboard$/,
  /(^|\/)Godeps\//,
  /(^|\/)Pipfile\.lock$/,
];

/** True for paths the built-in lists treat as generated, vendored, lock or snapshot files. */
export function isExcludedPath(path: string): boolean {
  const base = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  if (LOCK_FILES.has(base)) return true;
  if (VENDORED_DIRS.test(path)) return true;
  return GENERATED_PATTERNS.some((re) => re.test(path));
}

export interface PathAttributes { generated: boolean; vendored: boolean }

/**
 * The set of paths to drop, from the built-in lists, the repository's .gitattributes,
 * and the user's --exclude globs (already compiled to RegExp).
 */
export function excludedSet(paths: Iterable<string>, attrs: Map<string, PathAttributes>, extra: RegExp[]): Set<string> {
  const out = new Set<string>();
  for (const p of paths) {
    const a = attrs.get(p);
    if (isExcludedPath(p) || a?.generated || a?.vendored || extra.some((re) => re.test(p))) out.add(p);
  }
  return out;
}
