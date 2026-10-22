#!/usr/bin/env python3
"""usage: make_sums.py <folder>           write <folder>/SHA256SUMS (sorted relative paths, "sha256  path")
       make_sums.py --check <folder>     verify every line of SHA256SUMS and that no file is missing from it; exit 1 on any difference"""
import hashlib, os, sys

NAME = "SHA256SUMS"

def files(folder):
    out = []
    for root, dirs, names in os.walk(folder):
        dirs.sort()
        for n in names:
            rel = os.path.relpath(os.path.join(root, n), folder).replace(os.sep, "/")
            if rel != NAME: out.append(rel)
    return sorted(out)

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()

def main(a):
    check = a and a[0] == "--check"
    folder = a[1] if check else a[0]
    if not check:
        lines = [f"{digest(os.path.join(folder, r))}  {r}\n" for r in files(folder)]
        open(os.path.join(folder, NAME), "w").write("".join(lines))
        print(f"wrote {len(lines)} lines to {folder}/{NAME}")
        return 0
    bad = 0; listed = set()
    for ln in open(os.path.join(folder, NAME)).read().splitlines():
        h, _, rel = ln.partition("  ")
        listed.add(rel)
        p = os.path.join(folder, rel)
        if not os.path.isfile(p): print("MISSING", rel); bad += 1
        elif digest(p) != h: print("CHANGED", rel); bad += 1
    for r in files(folder):
        if r not in listed: print("UNLISTED", r); bad += 1
    print("OK" if not bad else f"{bad} problem(s)")
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
