#!/usr/bin/env bash
REPO_URL=https://github.com/pallets/markupsafe; PIN=5f2980738834f138f4684d6b86cb32fd64bac631
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
  ivA)    N="Ines Varga";   E="ines.varga@fjordlabs.example";;
  ivP)    N="ivarga";       E="9912033+ivarga@users.noreply.example.org";;
  vargas) N="Ines Vargas";  E="ines.vargas@example.net";;
  marta)  N="Marta Quist";  E="marta.quist@example.org";;
  dep)    N="dependabot[bot]"; E="49699333+dependabot[bot]@users.noreply.example.org";;
  web)    N="GitHub";       E="noreply@github.example";;
esac; }

# 1 public: real fix + test
cat >> src/markupsafe/_native.py <<'X'


def _strip_nested_comments(value: str) -> str:
    """Remove ``<!-- ... -->`` comments, including ones nested inside others."""
    while "<!--" in value:
        start = value.index("<!--")
        end = value.find("-->", start)
        if end == -1:
            value = value[:start]
            break
        value = value[:start] + value[end + 3 :]
    return value
X
cat >> tests/test_markupsafe.py <<'X'


def test_strip_nested_comments():
    from markupsafe._native import _strip_nested_comments

    assert _strip_nested_comments("a<!-- x <!-- y --> z -->b") == "a z -->b"
    assert _strip_nested_comments("a<!-- open") == "a"
X
cm ivP 2025-02-03T09:30:00+01:00 ivP 2025-02-03T09:30:00+01:00 "Fix striptags with nested comments"
# 2 docs
cat >> docs/escaping.rst <<'X'

``escape_silent`` returns an emtpy :class:`Markup` for ``None`` instead of
the string ``"None"``. Any other value is escaped as usual.
X
cm ivP 2025-02-17T14:10:00+01:00 ivP 2025-02-17T14:10:00+01:00 "docs: document escape_silent for None"
# 3 private-origin commit
cat >> src/markupsafe/_native.py <<'X'


# Tuned for the Falcon invoice pipeline, see https://git.corp.internal/falcon/notes/1432
def _escape_fast(s: str) -> str:
    """Fast path: short pure-ASCII strings with no special characters."""
    if len(s) < 64 and s.isascii() and not any(c in s for c in "&<>'\""):
        return s
    return (
        s.replace("&", "&amp;")
        .replace(">", "&gt;")
        .replace("<", "&lt;")
        .replace("'", "&#39;")
        .replace('"', "&#34;")
    )
X
cm ivA 2025-03-05T17:40:00+01:00 ivA 2025-03-05T17:40:00+01:00 $'ATLAS-1432: add fast path for escape on short ASCII input\n\nNeeded for Halvorsen Bank invoice rendering (Project Falcon).\nBenchmarked on build01.corp.internal, 31% faster on 40-byte inputs.'
# 4 private bench
cat >> bench.py <<'X'

# ATLAS-1501: baseline numbers live on build01.corp.internal:/srv/bench/falcon
for name, s in (("ascii fast path", '"invoice-" * 6'),):
    subprocess.run([sys.executable, "-m", "pyperf", "timeit", "--name", name, "-s", f"from markupsafe import escape; s = {s}", "escape(s)"])
X
cm ivA 2025-03-19T11:25:00+01:00 ivA 2025-03-19T11:25:00+01:00 $'ATLAS-1501: add ASCII fast-path benchmark\n\nFor the Falcon rollout at Halvorsen Bank.'
# 5 squash merge: maintainer author, Ines co-author only
cat >> src/markupsafe/_native.py <<'X'


_ESCAPE_CACHE: dict = {}


def _cached_escape(s: str, size: int = 256) -> str:
    out = _ESCAPE_CACHE.get(s)
    if out is None:
        out = _escape_fast(s)
        if len(_ESCAPE_CACHE) < size:
            _ESCAPE_CACHE[s] = out
    return out
X
cm marta 2025-04-08T09:00:00+00:00 web 2025-04-08T09:02:00+00:00 $'Add escape cache option (#412)\n\n* add cache\n* add tests\n\nCo-authored-by: Ines Varga <ines.varga@fjordlabs.example>'
# 6 feature then reverted
cat >> src/markupsafe/_native.py <<'X'


def _dedent(value: str) -> str:
    lines = value.splitlines()
    margin = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
    return "\n".join(l[margin:] for l in lines)
X
cm ivP 2025-04-22T16:00:00+02:00 ivP 2025-04-22T16:00:00+02:00 "Add Markup.dedent"
git revert --no-commit HEAD
cm marta 2025-05-02T10:00:00+00:00 marta 2025-05-02T10:00:00+00:00 $'Revert "Add Markup.dedent" (#430)\n\nIt changes behaviour for tab-indented text. Needs a design discussion first.'
# 7 typos
sed -i.bak 's/emtpy/empty/' docs/escaping.rst; rm docs/escaping.rst.bak
cm ivP 2025-05-14T09:00:00+02:00 ivP 2025-05-14T09:00:00+02:00 "fix typos in docs"
# 8 mechanical: SPDX header on every python file
for f in $(git ls-files '*.py'); do
  { echo '# SPDX-License-Identifier: BSD-3-Clause'; cat "$f"; } > "$f.new" && mv "$f.new" "$f"
done
cm ivP 2025-05-20T13:00:00+02:00 ivP 2025-05-20T13:00:00+02:00 "chore: add SPDX license header to every Python file"
# 9 private CI
cat >> .github/workflows/tests.yaml <<'X'
  wheels-halvorsen:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: pip wheel . --extra-index-url https://artifacts.halvorsen-bank.example/wheels
X
cm ivA 2025-06-10T10:15:00+02:00 ivA 2025-06-10T10:15:00+02:00 $'ATLAS-1620: Windows wheel build for Halvorsen deployment\n\nProject Falcon needs Windows wheels from the internal index.'
# 10 squash PR authored by Ines
cat >> src/markupsafe/_native.py <<'X'


_LOCK = __import__("threading").Lock()


def escape_silent_threadsafe(s):
    with _LOCK:
        return "" if s is None else _escape_fast(str(s))
X
cm ivP 2025-06-24T08:20:00-04:00 web 2025-06-25T09:00:00+00:00 "Make escape_silent safe under free threading (#438)"
# 11 decoy
cat >> docs/formatting.rst <<'X'

Formatting with ``%`` escapes interpolated values too.
X
cm vargas 2025-07-10T10:00:00+00:00 vargas 2025-07-10T10:00:00+00:00 "docs: mention percent formatting"
# 12 bot
cat >> requirements/tests.in <<'X'
pytest>=8.3
X
cm dep 2025-07-15T04:00:00+00:00 dep 2025-07-15T04:00:00+00:00 "Bump pytest from 8.2 to 8.3"
# 13 last: local 12 Sept, UTC 13 Sept
cat >> src/markupsafe/_native.py <<'X'


def _html_or_none(obj):
    try:
        return obj.__html__()
    except Exception:
        return None
X
cat >> tests/test_exception_custom_html.py <<'X'


def test_html_raising_returns_none():
    from markupsafe._native import _html_or_none

    class Bad:
        def __html__(self):
            raise RuntimeError

    assert _html_or_none(Bad()) is None
X
cm ivP 2025-09-12T23:05:00-07:00 ivP 2025-09-12T23:05:00-07:00 "Fix handling of objects whose __html__ raises"
finish
