#!/usr/bin/env bash
REPO_URL=https://github.com/rxi/json.lua; PIN=dbf4b2dd2eb7c23be2773c89eb059dadd6436f94
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

# ---- lab history -------------------------------------------------------
w solver/core.lua <<'EOF'
-- Adaptive relaxation solver (core method)
local M = {}

local function residual(grid, i, j)
  local up = grid[i - 1][j]
  local down = grid[i + 1][j]
  local left = grid[i][j - 1]
  local right = grid[i][j + 1]
  return (up + down + left + right) / 4 - grid[i][j]
end

local function max_residual(grid, n)
  local worst = 0
  for i = 2, n - 1 do
    for j = 2, n - 1 do
      local r = math.abs(residual(grid, i, j))
      if r > worst then
        worst = r
      end
    end
  end
  return worst
end

function M.relax(grid, n, omega)
  for i = 2, n - 1 do
    for j = 2, n - 1 do
      local r = residual(grid, i, j)
      grid[i][j] = grid[i][j] + omega * r
    end
  end
  return grid
end

function M.solve(grid, n, tol, max_iter)
  local omega = 1.0
  for iter = 1, max_iter do
    M.relax(grid, n, omega)
    if max_residual(grid, n) < tol then
      return grid, iter
    end
  end
  error('did not converge within max_iter')
end

return M
EOF
c "Alice Moreau" alice.moreau@lab.example "2025-02-10T10:12:00+0000" "solver: first version of the relaxation solver"

cat > "$DEST/.edit1.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
add = """
function M.adaptive_step(prev_worst, worst, omega)
  local ratio = worst / prev_worst
  if ratio > 0.99 then
    return math.min(omega * 1.1, 1.9)
  elseif ratio < 0.5 then
    return math.max(omega * 0.9, 0.5)
  end
  return omega
end
"""
s = s.replace("\nreturn M\n", add + "\nreturn M\n")
open(p, "w").write(s)
PY
python3 "$DEST/.edit1.py" "$DEST/solver/core.lua"; rm "$DEST/.edit1.py"
c "Alice Moreau" alice.moreau@gmail.example "2025-03-04T21:40:00+0000" "solver: adaptive over-relaxation factor"

perl -pi -e 's/^( +)/$1$1/' "$DEST/solver/core.lua"
c "Bob Okafor" bob.okafor@lab.example "2025-05-12T09:00:00+0000" "style: reindent solver to 4 spaces"

w test/solver_test.lua <<'EOF'
local core = require("solver.core")

local function make(n)
    local g = {}
    for i = 1, n do
        g[i] = {}
        for j = 1, n do
            g[i][j] = (i == 1) and 1 or 0
        end
    end
    return g
end

local g, iters = core.solve(make(9), 9, 1e-4, 5000)
assert(iters > 0, "no iterations")
assert(g[2][5] > 0, "heat did not diffuse")
print("solver ok", iters)
EOF
c "Bob Okafor" bob.okafor@lab.example "2025-05-20T14:30:00+0000" "test: smoke test for the solver"

cat > "$DEST/.edit2.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
old = s[s.index("function M.relax"):s.index("function M.solve")]
new = """function M.relax(grid, n, omega)
    -- red-black ordering converges faster than plain Gauss-Seidel
    for color = 0, 1 do
        for i = 2, n - 1 do
            for j = 2, n - 1 do
                if (i + j) % 2 == color then
                    local r = residual(grid, i, j)
                    grid[i][j] = grid[i][j] + omega * r
                end
            end
        end
    end
    return grid
end

"""
s = s.replace(old, new)
open(p, "w").write(s)
PY
python3 "$DEST/.edit2.py" "$DEST/solver/core.lua"; rm "$DEST/.edit2.py"
c "Carol Yan" carol.yan@partner.example "2025-09-02T16:05:00+0000" "solver: red-black ordering in relax"

w solver/heuristic.lua <<'EOF'
-- Initial guess heuristic: linear interpolation between boundary rows
local H = {}

function H.initial_guess(grid, n)
    local top, bottom = grid[1], grid[n]
    for i = 2, n - 1 do
        local t = (i - 1) / (n - 1)
        for j = 1, n do
            grid[i][j] = (1 - t) * top[j] + t * bottom[j]
        end
    end
    return grid
end

function H.is_symmetric(grid, n)
    for i = 1, n do
        for j = i + 1, n do
            if math.abs(grid[i][j] - grid[j][i]) > 1e-12 then
                return false
            end
        end
    end
    return true
end

return H
EOF
c "Carol Yan" carol.yan@partner.example "2025-09-09T11:20:00+0000" "solver: boundary interpolation heuristic"

perl -pi -e "s/'([^']*)'/\"\$1\"/g if /error/" "$DEST/solver/core.lua"
c "lab-format[bot]" "41898282+lab-format[bot]@users.noreply.example" "2025-09-20T03:00:00+0000" "style: apply formatter (quotes)"

cat > "$DEST/.edit3.py" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
old = """    local omega = 1.0
    for iter = 1, max_iter do
        M.relax(grid, n, omega)
        if max_residual(grid, n) < tol then
            return grid, iter
        end
"""
new = """    local omega = 1.0
    local prev = nil
    for iter = 1, max_iter do
        M.relax(grid, n, omega)
        local worst = max_residual(grid, n)
        if worst < tol then
            return grid, iter
        end
        if prev then
            omega = M.adaptive_step(prev, worst, omega)
        end
        prev = worst
"""
assert old in s
s = s.replace(old, new)
open(p, "w").write(s)
PY
python3 "$DEST/.edit3.py" "$DEST/solver/core.lua"; rm "$DEST/.edit3.py"
c "Eva Santos" eva.santos@lab.example "2025-11-03T13:15:00+0000" "solver: fix omega never being adapted in solve loop"

cat > "$DEST/.edit4.py" <<'PY'
import sys
d = sys.argv[1]
p = d + "/solver/core.lua"
s = open(p).read()
a = s.index("function M.adaptive_step")
b = s.index("end\n", s.index("return omega", a)) + 4
fn = s[a:b]
s = s[:a].rstrip("\n") + "\n" + s[b:]
s = s.replace("local M = {}\n", "local M = {}\nlocal step = require(\"solver.step\")\nM.adaptive_step = step.adaptive_step\n", 1)
open(p, "w").write(s)
open(d + "/solver/step.lua", "w").write("local S = {}\n\n" + fn.replace("function M.adaptive_step", "function S.adaptive_step") + "\nreturn S\n")
for f in ("core", "step", "heuristic"):
    q = d + "/solver/%s.lua" % f
    t = open(q).read()
    open(q, "w").write("-- Copyright (c) 2026 Example Lab\n" + t)
PY
python3 "$DEST/.edit4.py" "$DEST"; rm "$DEST/.edit4.py"
c "Dan Petrov" dan.petrov@lab.example "2026-01-15T10:45:00+0000" "solver: split step-size rule into its own module, add license headers"

finish
