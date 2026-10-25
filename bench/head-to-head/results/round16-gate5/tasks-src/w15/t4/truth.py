#!/usr/bin/env python3
"""t4 ground truth: who wrote src/method.c as it stands, for a reviewer's "who wrote the core method".

Conventions and why:
 * Unit = surviving lines of src/method.c at HEAD (blame follows the pure rename core/ -> src/
   and ignores whitespace: -w -M -C -C). The question is about the method as it stands.
 * Credit = commit AUTHOR, never the committer: Jun Park's two patches were applied by Ivan Pop.
 * The single bulk import commit (author Kai Oksanen) is NOT authorship: its message states the
   code is a snapshot of an old Subversion repository whose real authors are Lars Weber (r1-r300)
   and Hana Ito (r301-r412). Lines still blamed on that commit are credited to those two, as stated by
   the commit message, and cannot be split between them from git alone; Kai is the importer.
 * Therefore the honest answer has a hard limit: git proves who changed the code since 2025-02-03;
   for the origin of the majority of lines it only proves what the import message claims.
"""
import subprocess, sys, collections, re
d = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", d] + list(a), capture_output=True, text=True, check=True).stdout
out = git("blame", "-w", "-M", "-C", "-C", "--line-porcelain", "HEAD", "--", "src/method.c")
commits = collections.Counter(); cur = None; meta = {}
for line in out.splitlines():
    if re.match(r"^[0-9a-f]{40} ", line): cur = line.split()[0]
    elif line.startswith("author "): meta.setdefault(cur, {})["author"] = line[7:]
    elif line.startswith("committer "): meta.setdefault(cur, {})["committer"] = line[10:]
    elif line.startswith("\t"): commits[cur] += 1
total = sum(commits.values())
imp = git("log", "--format=%H", "--grep=^Import legacy solver").split()[0]
print("surviving lines in src/method.c:", total)
agg = collections.Counter()
for h, n in commits.most_common():
    m = meta[h]
    who = m["author"]
    if h == imp: who = "IMPORT (credit Lars Weber + Hana Ito per commit message; importer %s)" % m["author"]
    agg[who] += n
    print("  %s author=%-12s committer=%-12s lines=%3d %5.1f%%  %s" % (h[:7], m["author"], m["committer"], n, 100.0 * n / total, git("log", "-1", "--format=%s", h).strip()))
print("by credited person:")
for k, v in agg.most_common(): print("  %-100s %3d %5.1f%%" % (k, v, 100.0 * v / total))
print("import commit message:", git("log", "-1", "--format=%B", imp).strip().replace("\n", " / "))
print("rename commit is a pure rename (git follows it):", git("log", "--follow", "--format=%h", "--", "src/method.c").split())
