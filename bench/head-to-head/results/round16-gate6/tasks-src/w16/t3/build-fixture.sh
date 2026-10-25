#!/usr/bin/env bash
REPO_URL=https://github.com/spf13/pflag; PIN=1118d46dfe34c2d77aee04d819315a21942aa444
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
# gen <file> <prefix> <lines>: small deterministic Go file
gen() { mkdir -p "$(dirname "$DEST/$1")"; awk -v p="$2" -v n="$3" 'BEGIN{print "package pflag\n"; for(i=1;i<=n;i++) printf "var %s%d = %d\n", p, i, i*3}' > "$DEST/$1"; }
# t <name> <email> <date> <message> [file prefix lines]: one commit touching a new/rewritten file
t() { gen "$5" "$6" "$7"; c "$1" "$2" "$3" "$4"; }

# --- 2025: before the compared quarters ---
t "Noor Haddad" noor.haddad@example.com "2025-02-10T09:00:00Z" "Add duration slice example" x_dur_example.go nd 8
t "Noor Haddad" noor.haddad@example.com "2025-06-03T09:00:00Z" "Fix typo in IP slice doc" x_ip_doc.go ni 4
t "Iris Moreau" iris@oldjob.example.net "2025-09-15T10:00:00Z" "Add uint16 slice tests" x_u16_test.go iu 10
t "Mei Tanaka" mei.tanaka@old-corp.example.net "2025-10-20T10:00:00Z" "Add int8 slice helper" x_i8.go mi 12
t "Kofi Mensah" kofi.mensah@example.com "2026-01-14T10:00:00Z" "Add bool func variant" x_bf.go kb 9
t "Jonas Weber" jonas.weber@example.com "2026-02-09T10:00:00Z" "Improve error text for unknown flags" x_err.go je 6

# --- Q2 2026 (April to June) ---
t "Iris Moreau" iris@oldjob.example.net "2026-04-08T10:00:00Z" "Add float slice tests" x_fl_test.go if 14
t "Lucia Bianchi" lucia.bianchi@example.com "2026-04-10T10:00:00Z" "Add count flag example" x_count_ex.go lc 7
t "Jonas Weber" jonas.weber@example.com "2026-04-20T10:00:00Z" "Refactor flag set lookup" x_lookup.go jl 20
t "Lucia Bianchi" lucia.bianchi@example.com "2026-05-02T10:00:00Z" "Fix shorthand parsing of grouped bool flags" x_short.go ls 16
t "Mei Tanaka" mei.tanaka@old-corp.example.net "2026-05-14T10:00:00Z" "Add int16 slice flag" x_i16.go mj 18
t "Kofi Mensah" kofi.mensah@example.com "2026-06-18T10:00:00Z" "Add string-to-int map docs" x_map_doc.go km 5

# --- Q3 2026 (July to September) ---
t "Iris Moreau" iris.moreau@example.com "2026-07-03T10:00:00Z" "Add int32 slice flag" x_i32.go ii 18
t "Jonas Weber" jonas.weber@example.com "2026-07-11T10:00:00Z" "Fix panic on empty flag name" x_empty.go jp 7
t "Omar Haddad" omar.haddad@example.com "2026-07-22T10:00:00Z" "Support env var defaults for string flags" x_env.go oe 24
t "Mei Tanaka" mei.tanaka@example.com "2026-07-29T10:00:00Z" "Add uint8 slice flag" x_u8.go mu 15
t "dependabot[bot]" dependabot@example.invalid "2026-08-05T05:00:00Z" "Bump actions/setup-go from 5 to 6" x_ci_bump.go db 2
t "Jonas Weber" jonas.weber@example.com "2026-08-09T10:00:00Z" "Document hidden flags" x_hidden.go jh 9
t "Noor Haddad" noor.haddad@example.com "2026-08-18T10:00:00Z" "Fix IP mask slice parsing" x_ipmask.go nm 13
t "Iris Moreau" iris.moreau@example.com "2026-08-27T10:00:00Z" "$(printf 'Add IPv6 mask flag (#412)\n\nSquashed from 5 commits.\n\nCo-authored-by: Rhea Kapoor <rhea.kapoor@example.com>\nCo-authored-by: Jonas Weber <jonas.weber@example.com>')" x_v6.go iv 21
t "Pia Lindqvist" pia.lindqvist@example.com "2026-09-29T10:00:00Z" "Clarify usage output for required flags" x_usage.go pu 11

# --- after the quarter ---
t "Kofi Mensah" kofi.mensah@example.com "2026-10-12T10:00:00Z" "Add rune slice flag" x_rune.go kr 10
finish
