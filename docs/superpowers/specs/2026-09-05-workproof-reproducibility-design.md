# workproof: the hash must be reproducible by a stranger

Written 2026-09-05, before the fix, so the conclusion cannot drift with the result.

## The claim under test

A workproof report's value rests on one sentence: anyone holding the same repository at
the same commit can recompute the hash and get the same string. Everything else in the
product, the figures, the limits, the adversarial table, is downstream of that. If the
hash depends on the machine rather than the repository, the report proves nothing and the
tool is worse than nothing, because it looks like proof.

That claim had never been tested outside one CI configuration.

## What was measured

Two candidate inputs were checked by inspection and then by running the tool.

**The git version.** `analyseRepo` records `environment.git` from `git --version`, and the
whole `RepoReport` goes into `hashOf(params, repositories)`. Constructed directly, two
reports identical except for the version string hash differently:

```
git version 2.51.0                 -> 645ada6bd28a971e227279af0515c905148dee47...
git version 2.39.5 (Apple Git-154) -> 45110f713ed41042930f64fed6fedf7315795f5f...
```

**The directory name.** `name: basename(cwd)`. The same repository copied to a second
directory and measured with the same command:

```
alpha  hash e70747172e28fb0e9848d93d...
beta   hash 76f48d03fdec762f8eddaab2...
```

Same commits, same author, same figures, two hashes.

## The rule that decides what is hashed

The hash covers what a verifier can reproduce from the repository and the command, and
nothing else.

**In:** head, fingerprint, identity, the excluded counts, every figure, and the
measurement parameters the caller chose, including the blame flags, the sample, the seed
and whether an ignore-revs file was used. These are properties of the repository or of
the question asked of it.

**Out:** the git version, and the local directory name. Neither is a property of the
repository. Both stay in the report, because they explain why two runs might legitimately
differ, but a verifier cannot reproduce them and so must not be asked to.

## Consequence, stated plainly

Every existing report's hash changes. A report made before this release will not verify
against one made after, exactly as the local-weeks change in 0.3.0 did. That is a version
bump to 0.4.0, a line in the changelog, and a sentence in the README next to the hash.
The alternative, leaving a hash that a second machine cannot reproduce, is not a smaller
change; it is the same change deferred until someone else finds it.

## What reproducibility is guaranteed across, after the fix

Across operating systems, git versions, locales and directory names, for the same
repository at the same commit with the same command. Not across a repository whose
history has been rewritten, and not across a different sample or seed. The README says
both.

## How it stays true

A CI job runs the same report on the same fixture on Linux, macOS and Windows and fails
if the hashes differ. Reproducibility that is not checked is reproducibility that decays.
