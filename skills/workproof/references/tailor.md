<!--
Adapted from JD Resume Tailor (https://github.com/Day-Raval/jd-resume-tailor): skills/jd-resume-tailor/SKILL.md (steps 0 to 9
and "Hard rules") and references/style-guide.md (sections 1, 2 and 3).
Copyright (c) 2026 Dayesh Raval. MIT License. The permission notice is repeated at the end of this file.
Changes: the facts may come from a workproof report (figure id and hash prefix as the source tag) as well as from a portfolio bank
or a past resume; the Gaps rule also tells the user in the answer; date ranges are copied as the source writes them.
-->

# Tailor to a job description

Use when the person gives the text of a job description (pasted, or in a file) and asks to tailor their resume, CV or CV bullets to it. For a cover letter or a LinkedIn headline, say that this part does not cover it and stop.

## Fact sources

Use only these, and nothing from memory or from the job description itself:

1. A workproof report of the repository the person worked in: run `npx workproof`, then `check` and `verify` (see SKILL.md). Tag its facts `[commitShare #<first 8 characters of hash>]`, with the figure id (`commitShare`, `survivingLines`, `filesAuthored`, `cadence`, `testsAndDocs`) and copy numbers as the report prints them.
2. A portfolio bank or a past resume that the person names or that sits in the working folder (`portfolio-bank.md`, `resumes/*.md`, `resume.md`). If the bank has fact IDs, a tag is the entry id, a hyphen and the fact id (`E01-F1`, `P01-F2`), because fact ids such as `F1` repeat under every entry. Skip facts whose text is `TODO`. If it has none, the command numbers the facts in reading order (`E01` for the first employer or project, `F1`, `F2` for its lines); the draft mode (without `--resume`) prints that numbered list under "Fact table" so a reader can check every tag.

If neither source exists and the person is in a git repository, make the report. If neither exists and there is no repository, ask for the bank or the resume and stop; do not write facts yourself.

## Steps

1. Put the job description text in a file (`jd.txt`) if it was pasted. Then run the command that writes the finished resume file; it parses, matches and ranks deterministically, with no model:
   - from a portfolio bank or a past resume: `npx workproof bullets --jd jd.txt --facts <the bank or resume file> --resume --out <the file the person named, resume.md if none>`
   - from a git repository: `npx workproof` first (then `check` and `verify`, see SKILL.md), then `npx workproof bullets --jd jd.txt --report workproof-report.json --resume --out <file>`
   Do not rank, match, count or retype freehand. Without `--resume` the command prints a longer draft (with the Fact table and a checklist) for when the person wants to see the facts; use it only for that.
2. The file it writes is the finished shape: `# <name>` and `Target role:`, then `## Summary` (one fixed first line), `## Skills`, `## Experience` and/or `## Projects` (each entry's heading lines copied from the source exactly as written, then the ranked bullets, each fact verbatim with its source tag), `## Gaps` (always present; "None." when nothing is missing), `## Keyword coverage` (one row per job description item) and `## Ordering check`. A requirement is covered only by a fact, a Stack, Domain or skills line of the source, never because the job description asks for it. Alternatives such as "Chroma, Pinecone, FAISS" are one row; the Gaps line names the alternatives the facts do not mention.
3. Read the file. You may add at most one sentence to the `## Summary`, made only of facts in the file, with no skill from the Gaps list and no number that is not in a fact. Do not rename, drop or reorder a heading, do not reword a bullet and do not add a skill. In draft mode the output ends with a checklist. Satisfy the checklist before you finish, and do not copy the checklist into the file.
4. In your answer, end with one sentence that names every Gaps line: "Not in your facts: X, Y. Add them to your bank if they are true." If Gaps says "None.", say that every requirement is covered by a fact.
5. Check the hard rules below before you finish.

## Hard rules

- Every number in the output appears in a fact, character for character. You must never add a skill that the facts do not contain: a skill in the job description but not in a fact is a gap.
- In-progress means only an entry the source marks `Status: in-progress`; a current job (an end date of Present) is not in-progress, and the command already orders entries that way.
- Keep employer names, job titles and dates exactly as the source writes them. Copy date ranges with the source's own separator; the dash ban below is for your own prose.
- No claim the facts do not state: speed-ups, users, revenue, seniority, "led", "owned". A word like "led" or "mentored" may be used when the fact itself uses it, with that fact's tag.
- The output is one page: under 450 words including the tables, one column, no first-person pronouns. Leave the Fact table out of the file.
- Bullets are the facts exactly as the command printed them, with their tags: do not reword, join, round or shorten a fact (at most two bullets per entry and eight in all; the command already enforces that).
- No em dash and no en dash in your own text. No "responsible for", "worked on", "helped", "various", "utilized".

## Output shape

```
# <Name or "Resume">
Target role: <job description title>
## Summary
## Skills
## Experience (or Projects)
<entry heading lines copied from the source>
- <fact verbatim> [<source tag>]
## Gaps
## Keyword coverage
| JD item | Must-have? | Covered | Source tag |
## Ordering check
```

## Final checklist

- [ ] Every bullet has a source tag from the command (a fact id of the source, or a figure id with the hash prefix)
- [ ] No number differs from its fact
- [ ] Every `no` row is in Gaps and named in the answer, and none is in Skills
- [ ] In-progress items last, employers, titles and dates unchanged
- [ ] Under 450 words, no em or en dash in own text

## Licence of the adapted material

MIT License

Copyright (c) 2026 Dayesh Raval

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
