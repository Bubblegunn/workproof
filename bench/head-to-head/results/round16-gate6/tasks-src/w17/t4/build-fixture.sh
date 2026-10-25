#!/usr/bin/env bash
REPO_URL=https://github.com/dtolnay/itoa; PIN=758499d5663211927f5c4e3b5694542b7e755952
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

# ---- synthetic history ----
HS="Hana Sato"; HE=hana@example.com
EB="Eli Brandt"; EE=eli@example.com
# rv <sha> <author-name> <author-email> <date>   (real git revert, message left as git writes it)
rv() {
  GIT_AUTHOR_NAME="$2" GIT_AUTHOR_EMAIL="$3" GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
  G -c commit.gpgsign=false -c core.hooksPath=/dev/null revert --no-edit "$1" >/dev/null
}
pol() { # pol <max_age> <mfa> [signing]
  { printf '# Repository policy\n[review]\nrequire_review = true\n\n[auth]\nmfa = %s\nmax_age_days = %s\n' "$2" "$1"
    if [ "${3:-}" = signing ]; then printf '\n[signing]\nallow_unsigned = false\n'; fi
  } > "$DEST/config/policy.toml"
}
mkdir -p "$DEST/config"
pol 90 true
c "$HS" $HE "2025-03-03T10:00:00+0000" "Add repository policy file"
pol 30 true
c "$HS" $HE "2025-03-17T10:00:00+0000" "Tighten token age to 30 days"
pol 30 false
c "$EB" $EE "2025-04-01T10:00:00+0000" "Disable mfa check temporarily for CI"
S_C=$(G rev-parse HEAD)
rv $S_C "$HS" $HE "2025-04-03T10:00:00+0000"
S_D=$(G rev-parse HEAD)
pol 90 true
c "$EB" $EE "2025-05-12T10:00:00+0000" "Align max age with docs"
pol 90 true signing
c "$HS" $HE "2025-07-01T10:00:00+0000" "Refuse unsigned releases"
pol 90 true
c "$EB" $EE "2025-08-12T10:00:00+0000" "Simplify config"
pol 90 false
c "$EB" $EE "2025-09-10T10:00:00+0000" $'Revert "Revert "Disable mfa check temporarily for CI""\n\nThis reverts commit '"$S_D"$'.'

sed -i.bak 's/^# Repository policy/# Repository policy (owner: platform team)/' "$DEST/config/policy.toml"; rm -f "$DEST/config/policy.toml.bak"
c "$HS" $HE "2025-10-01T10:00:00+0000" "Revert comment wording in policy header"
ap() { printf '%s\n' "$2" >> "$DEST/$1"; }
ap README.md "[![ci](https://example.invalid/badge.svg)](https://example.invalid)"
c "$EB" $EE "2025-10-10T10:00:00+0000" "Add badge to README"
rv HEAD "$HS" $HE "2025-10-15T10:00:00+0000"
sed -i.bak 's/^mfa = false/mfa = true/' "$DEST/config/policy.toml"; rm -f "$DEST/config/policy.toml.bak"
c "$HS" $HE "2026-02-02T10:00:00+0000" "CI fixed, mfa back on"
finish
