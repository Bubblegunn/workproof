#!/usr/bin/env bash
# build-fixture.sh <dest-dir>  -- deterministic fixture (public repo pinned at an exact commit + synthetic commits)
set -euo pipefail
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
DEST="${1:?usage: build-fixture.sh <dest-dir>}"
case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then echo "dest not empty: $DEST" >&2; exit 1; fi
CL=/private/tmp/claude-uid/-Users-user-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/he-clones
mkdir -p "$CL"; T=$(mktemp -d "$CL/build.XXXXXX")
git clone -q https://github.com/sindresorhus/p-limit.git "$T/r"
cd "$T/r"
git checkout -q -B main 1fb1407cb390019b004bfa66585ab5e3de1de7bd
git remote remove origin
git tag -l | while read -r t; do git tag -d "$t" >/dev/null; done
git for-each-ref --format='%(refname:short)' refs/heads | { grep -vx main || true; } | while read -r b; do git branch -q -D "$b"; done
# cm NAME EMAIL AUTHOR_DATE MSG [CNAME CEMAIL CDATE] : commit with fixed identities and dates
cm() {
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  git commit -q --allow-empty -m "$4"
}
ci() { git add -A; cm "$@"; }
# mg NAME EMAIL DATE BRANCH MSG : non-fast-forward merge
mg() {
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="$1" GIT_COMMITTER_EMAIL="$2" GIT_COMMITTER_DATE="$3" \
  git merge -q --no-ff -m "$5" "$4"
}
# gen N TEMPLATE : N lines, %d replaced by the line number
gen() { awk -v n="$1" -v t="$2" 'BEGIN{for(i=1;i<=n;i++){s=t; gsub(/%d/,i,s); print s}}'; }
EL=("Elif Demir" "elif.demir@studio-kalem.example")
RB=("renovate[bot]" "renovate@bot.example")
mkdir -p src
gen 70 'export const signalCheck%d = (s) => s?.aborted === false && %d;' > src/signal.js
ci "${EL[@]}" "2026-01-21T10:30:00+03:00" "feat: AbortSignal support"
echo "{}" > .renovaterc.json
ci "${RB[@]}" "2026-02-05T04:00:00+00:00" "chore(deps): update dependency xo to v1"
echo "// bot 2" >> .renovaterc.json
ci "${RB[@]}" "2026-02-05T04:10:00+00:00" "chore(deps): update dependency ava to v7"
gen 60 'test("signal %d", (t) => { t.is(%d, %d); });' > test-signal.js
ci "${EL[@]}" "2026-02-10T12:00:00+03:00" "test: AbortSignal cases"
gen 25 'Recipe line %d: cancel queued jobs with a signal.' >> recipes.md
ci "${EL[@]}" "2026-02-24T17:00:00+03:00" "docs: cancellation recipe"
gen 8 'export const fix%d = %d;' >> src/signal.js
ci "${EL[@]}" "2026-03-12T09:15:00+03:00" "fix: signal listener cleanup"
echo "1.1.0-rc" > .release-note
ci "${EL[@]}" "2026-03-31T23:10:00+03:00" "chore: prepare release notes"
gen 30 'export const q2feature%d = %d;' > src/priority.js
ci "${EL[@]}" "2026-04-01T01:30:00+03:00" "feat: priority queue"

# local records: exported assistant session logs (untracked, ignored locally)
mkdir -p agent-sessions
echo "agent-sessions/" >> .git/info/exclude
python3 -I - <<'PYEOF'
import json, datetime as dt
REPO = "/Users/user/work/p-limit-fork"
OTHER = "/Users/user/work/client-site"
def mk(sid, cwd, start, segs, first_text=None):
    t0 = dt.datetime.fromisoformat(start.replace("Z", "+00:00"))
    lines, n = [], 0
    for off, cnt, step in segs:
        for k in range(cnt):
            ts = t0 + dt.timedelta(minutes=off + k * step)
            role = "user" if n % 2 == 0 else "assistant"
            text = "Work item %d" % n
            if n == 0 and first_text: text = first_text
            lines.append(json.dumps({"type": role, "uuid": "%s-%03d" % (sid, n), "sessionId": sid,
                "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "cwd": cwd, "gitBranch": "main",
                "message": {"role": role, "content": text}}))
            n += 1
    return "\n".join(lines) + "\n"
files = {
 "session-A.jsonl": mk("sessA", REPO, "2026-02-10T08:00:00Z", [(0,16,8),(170,8,8)]),
 "session-B.jsonl": mk("sessB", REPO, "2026-02-10T08:03:00Z", [(0,10,8)],
     "here is my key STRIPE_KEY=sk_test_EXAMPLE0000 and mail me at elif.private@mail.invalid"),
 "session-D-client.jsonl": mk("sessD", OTHER, "2026-02-12T09:00:00Z", [(0,20,9)]),
 "session-E.jsonl": mk("sessE", REPO, "2026-03-31T20:00:00Z", [(0,10,9)]),
 "session-F.jsonl": mk("sessF", REPO, "2026-04-02T10:00:00Z", [(0,12,8)]),
 "session-G.jsonl": mk("sessG", REPO, "2026-01-20T07:00:00Z", [(0,13,10)]),
}
files["session-A (1).jsonl"] = files["session-A.jsonl"]
for k, v in files.items():
    open("agent-sessions/" + k, "w").write(v)
PYEOF
git reflog expire --expire=now --all
git gc -q --prune=now
mkdir -p "$(dirname "$DEST")"
mv "$T/r" "$DEST"; rmdir "$T"
echo "built $DEST HEAD=$(git -C "$DEST" rev-parse HEAD)"
