Wrapping up: the answer is saved to `mine.md`.

- **Commits:** 77 across all refs. That's 69 from `<email:d29caa5c>`, 5 from `<email:4132b6bd>`, and 3 from the noreply address. 76 of the 77 are reachable from `master`. The other one exists only on a tag.
- **Surviving lines:** 695 at HEAD, counted with `git blame -w` over all tracked files. That's 583 under the gmail address, 111 under `<email:4132b6bd>`, and 1 under the noreply address.

One of the 5 `<email:4132b6bd>` commits is under the name "jongleberry". `git shortlog` splits it from the other 4, so counting by name and email together gives 76 instead of 77.

I haven't checked which commit is the tag-only one.