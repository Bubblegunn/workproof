#!/usr/bin/env bash
REPO_URL=https://github.com/sindresorhus/p-limit; PIN=7d14b3f04aa990f621a853e24e2a4b796baf1ec9
# --- common header (inlined into each build-fixture.sh) ---
set -euo pipefail
DEST=${1:?usage: build-fixture.sh <dest>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C
export GIT_AUTHOR_NAME=x GIT_AUTHOR_EMAIL=x@example.invalid GIT_COMMITTER_NAME=x GIT_COMMITTER_EMAIL=x@example.invalid
rm -rf "$DEST"
git clone -q --no-checkout "$REPO_URL" "$DEST"
cd "$DEST"
git checkout -q -B main "$PIN"
git remote remove origin
for r in $(git for-each-ref --format='%(refname)' | grep -v '^refs/heads/main$'); do git update-ref -d "$r"; done
git config core.autocrlf false
# cm AUTHOR_KEY AUTHOR_DATE COMMITTER_KEY COMMITTER_DATE MESSAGE  (stages everything)
cm() {
  local a="$1" ad="$2" c="$3" cd="$4" msg="$5"
  ident "$a"; local an="$N" ae="$E"
  ident "$c"; local cn="$N" ce="$E"
  git add -A
  GIT_AUTHOR_NAME="$an" GIT_AUTHOR_EMAIL="$ae" GIT_AUTHOR_DATE="$ad" \
  GIT_COMMITTER_NAME="$cn" GIT_COMMITTER_EMAIL="$ce" GIT_COMMITTER_DATE="$cd" \
    git commit -q --allow-empty -m "$msg"
}
# mg BRANCH AUTHOR_KEY DATE MESSAGE : merge --no-ff, committer = author
mg() {
  ident "$2"
  GIT_AUTHOR_NAME="$N" GIT_AUTHOR_EMAIL="$E" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="$N" GIT_COMMITTER_EMAIL="$E" GIT_COMMITTER_DATE="$3" \
    git merge -q --no-ff "$1" -m "$4"
}
# ap FILE TEXT : append a line
ap() { printf '%s\n' "$2" >> "$1"; }
finish() {
  git reflog expire --expire=now --all
  git gc -q --prune=now
  git rev-parse HEAD
}
ident() { case "$1" in
  tbA)   N="Tomasz Brandt";  E="tomasz.brandt@kestrelworks.example";;
  tbB)   N="tbrandt";        E="7310442+tbrandt@users.noreply.example.org";;
  tbC)   N="T. Brandt";      E="tb@brandt.example.net";;
  tobi)  N="Tobias Brandt";  E="tobias.brandt@example.org";;
  priya) N="Priya Nair";     E="priya.nair@example.org";;
  ren)   N="renovate[bot]";  E="29139614+renovate[bot]@users.noreply.example.org";;
  web)   N="GitHub";         E="noreply@github.example";;
esac; }
# wr FILE : stdin -> file, leading groups of 4 spaces become tabs
wr() { mkdir -p "$(dirname "$1")"; perl -pe '1 while s/^(\t*)    /$1\t/' > "$1"; }

# 1
wr retry.js <<'X'
export default function createRetry(options = {}) {
    const {retries = 3, factor = 2, minTimeout = 100} = options;

    if (!Number.isInteger(retries) || retries < 0) {
        throw new TypeError('Expected `retries` to be a non-negative integer');
    }

    const delays = [];
    for (let attempt = 0; attempt < retries; attempt++) {
        delays.push(minTimeout * (factor ** attempt));
    }

    return async function_ => {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await function_(attempt);
            } catch (error) {
                lastError = error;
                if (attempt < retries) {
                    await new Promise(resolve => {
                        setTimeout(resolve, delays[attempt]);
                    });
                }
            }
        }

        throw lastError;
    };
}
X
cm tbA 2025-02-11T10:20:00+01:00 tbA 2025-02-11T10:20:00+01:00 "Add retry helper"
# 2
cat >> index.js <<'X'

export function pLimitStats(limit) {
	return {
		get active() {return limit.activeCount;},
		get pending() {return limit.pendingCount;},
		get utilisation() {return limit.activeCount / limit.concurrency;},
	};
}
X
cm tbA 2025-02-18T15:02:00+01:00 tbA 2025-02-18T15:02:00+01:00 "Add pLimitStats"
# 3
wr describe.js <<'X'
export default function describe(limit) {
    const parts = [
        `${limit.activeCount} running`,
        `${limit.pendingCount} waiting`,
        `limit ${limit.concurrency}`,
    ];

    if (limit.pendingCount > limit.concurrency * 10) {
        parts.push('queue is long');
    }

    return parts.join(', ');
}

export function describeAll(limits) {
    return Object.entries(limits)
        .map(([name, limit]) => `${name}: ${describe(limit)}`)
        .join('\n');
}
X
cat >> test.js <<'X'

test('pLimitStats reports active and pending', async t => {
	const limit = pLimit(1);
	const stats = pLimitStats(limit);
	const first = limit(() => delay(20));
	const second = limit(() => delay(20));
	await Promise.resolve();
	t.is(stats.active, 1);
	t.is(stats.pending, 1);
	t.is(stats.utilisation, 1);
	await Promise.all([first, second]);
	t.is(stats.active, 0);
});

test('describe summarises a limit', t => {
	const limit = pLimit(2);
	t.is(describe(limit), '0 running, 0 waiting, limit 2');
});
X
perl -0pi -e "s/^(import pLimit.*\n)/\$1import {pLimitStats} from '.\/index.js';\nimport describe from '.\/describe.js';\n/m" test.js
cm tbB 2025-03-03T09:45:00-05:00 tbB 2025-03-03T09:45:00-05:00 "Add describe helper and tests for stats"
# 4
printf '%s\n' 'dist/** linguist-generated=true' 'package-lock.json linguist-generated=true' 'vendor/** linguist-vendored=true' >> .gitattributes
cm priya 2025-03-10T12:00:00+00:00 priya 2025-03-10T12:00:00+00:00 "Mark generated and vendored paths"
# 5
mkdir -p dist vendor
{ echo '// Generated by rollup. Do not edit.'; cat index.js; } > dist/index.js
python3 - <<'X'
import json
pk={"name":"p-limit","lockfileVersion":3,"packages":{}}
for i in range(60):
    pk["packages"][f"node_modules/pkg-{i:02d}"]={"version":f"1.{i}.0","resolved":f"https://registry.example.org/pkg-{i:02d}.tgz","integrity":f"sha512-{i:02d}"+"A"*30}
open("package-lock.json","w").write(json.dumps(pk,indent=2)+"\n")
X
wr vendor/queue.js <<'X'
// Vendored copy of a tiny linked-list queue.
class Node {
    value;
    next;

    constructor(value) {
        this.value = value;
    }
}

export default class Queue {
    #head;
    #tail;
    #size = 0;

    enqueue(value) {
        const node = new Node(value);

        if (this.#head) {
            this.#tail.next = node;
            this.#tail = node;
        } else {
            this.#head = node;
            this.#tail = node;
        }

        this.#size++;
    }

    dequeue() {
        const current = this.#head;
        if (!current) {
            return;
        }

        this.#head = this.#head.next;
        this.#size--;
        return current.value;
    }

    clear() {
        this.#head = undefined;
        this.#tail = undefined;
        this.#size = 0;
    }

    get size() {
        return this.#size;
    }
}
X
cm tbB 2025-03-14T18:30:00-05:00 tbB 2025-03-14T18:30:00-05:00 "build: add dist bundle, lockfile and vendored queue"
# 6 move validateConcurrency into its own file
python3 - <<'X'
s=open('index.js').read()
i=s.index('function validateConcurrency')
end=s.index('\n}\n',i)+3
body=s[i:end]
s=s[:i]+s[end:].lstrip('\n')
s=s.replace("import Queue from 'yocto-queue';","import Queue from 'yocto-queue';\nimport validateConcurrency from './validate.js';")
open('index.js','w').write(s)
open('validate.js','w').write('export default '+body)
X
cm tbA 2025-03-20T11:00:00+01:00 tbA 2025-03-20T11:00:00+01:00 "Move validateConcurrency to validate.js"
# 7 squash merge by maintainer: author Priya, tb only a trailer
cat >> index.js <<'X'

export function withTimeout(function_, milliseconds) {
	return (...arguments_) => Promise.race([
		function_(...arguments_),
		new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(`Timed out after ${milliseconds}ms`));
			}, milliseconds);
		}),
	]);
}
X
cm priya 2025-04-02T08:00:00+00:00 web 2025-04-02T08:05:00+00:00 $'Add withTimeout helper (#9)\n\n* add withTimeout\n* add docs\n\nCo-authored-by: Tomasz Brandt <tomasz.brandt@kestrelworks.example>'
# 8 mechanical reformat: tabs -> two spaces, strip trailing whitespace; whitespace only
for f in index.js test.js index.d.ts index.test-d.ts retry.js describe.js validate.js; do
  perl -pi -e 's/^(\t+)/"  " x length($1)/e; s/[ \t]+$//' "$f"
done
cm tbA 2025-04-15T09:00:00+02:00 tbA 2025-04-15T09:00:00+02:00 "style: normalise indentation to two spaces"
# 9 maintainer rewrites part of pLimitStats
perl -0pi -e 's/get active\(\) \{return limit.activeCount;\},\n\s+get pending\(\) \{return limit.pendingCount;\},/get active() {\n      return limit.activeCount;\n    },\n    get pending() {\n      return limit.pendingCount;\n    },/' index.js
cm priya 2025-04-22T10:00:00+00:00 priya 2025-04-22T10:00:00+00:00 "Expand stats getters"
# 10 throwaway file added then removed
wr debug.js <<'X'
export const trace = (...a) => console.error('[p-limit]', ...a);
export const traceAll = list => list.forEach(a => trace(a));
X
cm tbB 2025-04-25T20:00:00-05:00 tbB 2025-04-25T20:00:00-05:00 "wip: debug tracing"
git rm -q debug.js
cm tbB 2025-04-26T08:00:00-05:00 tbB 2025-04-26T08:00:00-05:00 "Remove debug tracing"
# 11 lookalike
wr queue-bench.js <<'X'
import Queue from './vendor/queue.js';

const queue = new Queue();
console.time('enqueue');
for (let index = 0; index < 1e6; index++) {
  queue.enqueue(index);
}
console.timeEnd('enqueue');
console.time('dequeue');
while (queue.size > 0) {
  queue.dequeue();
}
console.timeEnd('dequeue');
X
cm tobi 2025-05-01T10:00:00+00:00 tobi 2025-05-01T10:00:00+00:00 "Add queue benchmark"
# 12 bot
perl -pi -e 's/"ava": "\^6.1.3"/"ava": "^6.2.0"/' package.json
cm ren 2025-05-02T03:00:00+00:00 ren 2025-05-02T03:00:00+00:00 "Update dependency ava to v6.2.0"
# 13 third address
cat >> retry.js <<'X'

export function retryOnce(function_) {
  return createRetry({retries: 1, minTimeout: 0})(function_);
}

export const defaultRetry = createRetry();
X
cm tbC 2025-05-20T22:10:00+09:00 tbC 2025-05-20T22:10:00+09:00 "retry: add retryOnce and default instance"
finish
