#!/usr/bin/env bash
REPO_URL=https://github.com/pallets/itsdangerous; PIN=62fde54d4ff717fa1c4af688dbebf97845fed495
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <dest-dir>" >&2; exit 2; }
DEST="$1"; case "$DEST" in /*) ;; *) DEST="$PWD/$DEST";; esac
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_TERMINAL_PROMPT=0
export TZ=UTC LC_ALL=C
rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
git clone -q "$REPO_URL" "$DEST"
G() { git -C "$DEST" "$@"; }
G checkout -q -B fixture "$PIN"
for b in $(G for-each-ref --format='%(refname:short)' refs/heads); do [ "$b" = fixture ] || G branch -q -D "$b"; done
for r in $(G remote); do G remote remove "$r"; done
for t in $(G tag -l); do G tag -d "$t" >/dev/null; done
# c <author-name> <author-email> <author-date> <message> [committer-name committer-email committer-date]
c() {
  G add -A
  GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" \
  GIT_COMMITTER_NAME="${5:-$1}" GIT_COMMITTER_EMAIL="${6:-$2}" GIT_COMMITTER_DATE="${7:-$3}" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q --allow-empty -m "$4"
}
finish() {
  G branch -q -m fixture main
  G reflog expire --expire=now --all
  G gc -q --prune=now
  echo "HEAD $(G rev-parse HEAD)"
}
w() { mkdir -p "$(dirname "$DEST/$1")"; cat > "$DEST/$1"; }

ap() { mkdir -p "$(dirname "$DEST/$1")"; cat >> "$DEST/$1"; }
sha() { G log -1 --format=%H --grep="^$1" fixture; }
# revert <author> <email> <date> <subject-of-target>
rv() {
  local t; t=$(G log -1 --format=%H --fixed-strings --grep="$4" fixture)
  G revert --no-commit "$t" >/dev/null
  c "$1" "$2" "$3" "Revert \"$4\"

This reverts commit $t."
}
MA=("Mara Linden" mara@example.com)

# --- before the 2.3.0 release
ap src/itsdangerous/encoding.py <<'PY'


def want_str(s,enc="utf-8"):
    return s.decode(enc) if isinstance(s,bytes) else s
PY
c "Ines Cardoso" ines@example.com "2025-02-03T10:00:00+00:00" "Add want_str helper to encoding"

{ printf 'Version 2.3.0\n-------------\n\nReleased 2025-02-10\n\n-   Add ``want_str`` helper to ``itsdangerous.encoding``.\n\n'; cat "$DEST/CHANGES.rst"; } > "$DEST/CHANGES.rst.new"
mv "$DEST/CHANGES.rst.new" "$DEST/CHANGES.rst"
c "${MA[@]}" "2025-02-10T09:00:00+00:00" "Release version 2.3.0"

# --- after the release
ap src/itsdangerous/serializer.py <<'PY'


def sorted_dumps(obj,serializer):
    """Serialize with sorted keys so signatures are stable."""
    return serializer.dumps(obj,sort_keys=True)
PY
c "Alice Ahn" alice@example.com "2025-02-12T11:00:00+00:00" "Add sort_keys option to Serializer.dumps"

ap docs/serializer.rst <<'RST'

Note: signatures depend on the serialized bytes, so keep the serializer settings the same on both ends.
RST
c "Bob Brandt" bob@example.com "2025-02-13T12:00:00+00:00" "docs: fix typo in serializer page"

ap src/itsdangerous/signer.py <<'PY'


def verify_many(signer,values):
    return [signer.validate(v) for v in values]
PY
c "Carol Cruz" carol@example.com "2025-02-14T13:00:00+00:00" "Add Signer.verify_many"

rv "${MA[@]}" "2025-02-17T09:30:00+00:00" "Add Signer.verify_many"

ap src/itsdangerous/exc.py <<'PY'


def empty_payload_message():
    return "Signature found but payload is empty"
PY
c "Dan Diaz" dan@example.com "2025-02-18T14:00:00+00:00" "Fix BadSignature message when the payload is empty"

ap src/itsdangerous/timed.py <<'PY'


def loads_with_age(serializer,s,max_age=None):
    return serializer.loads(s,max_age=max_age,return_timestamp=True)
PY
c "Erin Estes" erin@example.com "2025-02-19T15:00:00+00:00" "Add TimedSerializer.loads_with_age"

rv "${MA[@]}" "2025-02-20T09:00:00+00:00" "Add TimedSerializer.loads_with_age"
G_REV=$(G log -1 --format=%H --fixed-strings --grep='Revert "Add TimedSerializer.loads_with_age"' fixture)
G revert --no-commit "$G_REV" >/dev/null
c "${MA[@]}" "2025-02-24T09:00:00+00:00" "Revert \"Revert \"Add TimedSerializer.loads_with_age\"\"

This reverts commit $G_REV."

rv "${MA[@]}" "2025-02-25T09:00:00+00:00" "Add want_str helper to encoding"

ap .pre-commit-config.yaml <<'Y'
# autoupdated 2025-02-26
Y
c "pre-commit-ci[bot]" "66853113+pre-commit-ci[bot]@users.noreply.example" "2025-02-26T05:00:00+00:00" "[pre-commit.ci] pre-commit autoupdate"

# topic branch merged with a merge commit
BASE=$(G rev-parse HEAD)
G checkout -q -b topic "$BASE"
ap src/itsdangerous/url_safe.py <<'PY'


def accepts_memoryview(s):
    return bytes(s) if isinstance(s,memoryview) else s
PY
c "Gina Gomez" gina@example.com "2025-02-21T16:00:00+00:00" "URLSafeSerializer.loads accepts memoryview"
ap tests/test_itsdangerous/test_url_safe.py <<'PY'


def test_memoryview():
    assert accepts_memoryview(memoryview(b"x")) == b"x"
PY
c "Gina Gomez" gina@example.com "2025-02-22T16:00:00+00:00" "Add test for memoryview"
G checkout -q fixture
GIT_AUTHOR_NAME="${MA[0]}" GIT_AUTHOR_EMAIL="${MA[1]}" GIT_AUTHOR_DATE="2025-02-27T09:00:00+00:00" \
GIT_COMMITTER_NAME="${MA[0]}" GIT_COMMITTER_EMAIL="${MA[1]}" GIT_COMMITTER_DATE="2025-02-27T09:00:00+00:00" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null merge -q --no-ff topic -m "Merge pull request #409 from gina/memoryview"
G branch -q -D topic

ap src/itsdangerous/signer.py <<'PY'


def constant_time_check(a,b):
    return hmac.compare_digest(a,b)
PY
c "Frank Fiore" frank@example.com "2025-03-03T10:00:00+00:00" "Fix timing side channel in Signer.verify_signature (#412)

Squashed from 3 commits.

Co-authored-by: Erin Estes <erin@example.com>"

ap tests/test_itsdangerous/test_signer.py <<'PY'


def test_constant_time():
    assert constant_time_check(b"a", b"a")
PY
c "Hank Hill" hank@example.com "2025-03-04T10:00:00+00:00" "tests: cover constant_time_check"

for f in signer serializer timed url_safe exc encoding; do sed -i.bak 's/,\([^ ]\)/, \1/g' "$DEST/src/itsdangerous/$f.py"; rm "$DEST/src/itsdangerous/$f.py.bak"; done
c "${MA[@]}" "2025-03-05T09:00:00+00:00" "style: apply formatter to src"

finish
