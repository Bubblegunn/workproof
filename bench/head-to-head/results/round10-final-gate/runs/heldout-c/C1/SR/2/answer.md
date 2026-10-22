I've written `promotion-evidence.md` in the repo folder. It covers January to June 2025 and is based on commits under your work email.

**What it claims:**
- **Features:** a table-of-contents plugin, a LaTeX footnote renderer, math plugin v2 with block-level equations, and an abbreviation plugin.
- **Size:** about 400 lines of feature code and about 65 lines of tests.
- **Supporting work:** one small bug fix, vendoring a dependency for offline builds, and a formatter header across 37 files. I described both of the last two as supporting work.

**What I left out or discounted:**
- **Vendored library:** python-slugify adds about 6,000 lines, but they are third-party code, so I didn't count them as your output.
- **Inline parser speed-up:** you reverted the "30% faster" change two days after committing it, and the history has no benchmark. I excluded it, so add data if you have it.
- **Priya Nair's commits:** I didn't count them, because they aren't yours.

**Please check these before you submit:**
- **Abbreviation plugin dates:** its author date is November 2024 and it was committed in May 2025. It looks like it was written earlier and landed later. I included it and noted the dates.
- **Heading-ID fix:** this one is under the name "dreyes" with a different, personal-looking email. I assumed it's yours, so remove it if it isn't.
- **Impact:** git shows what you shipped, not how much it was used. Adoption numbers or feedback would strengthen the case.