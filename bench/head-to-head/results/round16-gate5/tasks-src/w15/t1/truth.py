#!/usr/bin/env python3
"""t1 ground truth: who wrote solver/ as it stands at HEAD.

Conventions (and why they fit the purpose: author list vs acknowledgements for the
method as it stands today):
 * Unit = surviving non-blank lines in solver/*.lua at HEAD, not commit counts
   (commit counts reward small commits; the question is who wrote the method as it is).
 * Format-only commits are ignored: whitespace changes (blame -w) and the formatter bot
   commit (--ignore-revs-file), so the reindent by Bob and the bot's quote change do not
   take credit for logic they did not write.
 * Moved code is followed (blame -M -C -C): Dan's split of adaptive_step into step.lua
   keeps Alice as the author of those lines.
 * Boilerplate licence header lines are excluded.
 * Identities merged by author name (case-insensitive): the same person used two e-mail
   addresses. Bots are reported separately and never credited.
"""
import subprocess, sys, collections, tempfile, os
d = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", d] + list(a), capture_output=True, text=True, check=True).stdout
log = git("log", "--format=%H%x09%an%x09%ae%x09%s").splitlines()
ign = [l.split("\t")[0] for l in log if l.split("\t")[3].startswith("style:")]
tmp = tempfile.NamedTemporaryFile("w", delete=False); tmp.write("\n".join(ign) + "\n"); tmp.close()
files = sorted(f for f in git("ls-files", "solver").split() if f.endswith(".lua"))
tot = collections.Counter(); per_file = {}
for f in files:
    out = git("blame", "-w", "-M", "-C", "-C", "--ignore-revs-file", tmp.name, "--line-porcelain", "HEAD", "--", f)
    c = collections.Counter(); cur = None
    for line in out.splitlines():
        if line.startswith("author "): cur = line[7:]
        elif line.startswith("\t"):
            t = line[1:]
            if t.strip() and "Copyright" not in t:
                c[cur.lower()] += 1
    per_file[f] = c; tot.update(c)
os.unlink(tmp.name)
n = sum(tot.values())
print("surviving non-blank lines in solver/*.lua at HEAD:", n)
for k, v in tot.most_common():
    print("  %-14s %3d  %5.1f%%" % (k, v, 100.0 * v / n))
for f, c in per_file.items():
    print(f, dict(c.most_common()))
print("first author of solver/core.lua:", git("log", "--diff-filter=A", "--format=%an <%ae> %ad", "--date=short", "--", "solver/core.lua").strip())
print("commit counts touching solver/ (informational, merged by name):")
cc = collections.Counter(l.split("\t")[1].lower() for l in git("log", "--format=%H%x09%an%x09%ae%x09%s", "--", "solver").splitlines())
for k, v in cc.most_common(): print("  %-14s %d" % (k, v))
print("bots: lab-format[bot] (style commit, ignored)")
print("emails seen for alice moreau:", sorted({l.split("\t")[2] for l in log if l.split("\t")[1] == "Alice Moreau"}))
