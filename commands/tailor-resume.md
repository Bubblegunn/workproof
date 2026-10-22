---
description: Tailor my resume or CV bullets to a job description, using only facts from my workproof report, portfolio bank or past resume
argument-hint: "<job description text or a file with it>"
---

Use the workproof skill and read its `references/tailor.md`. The job description is $ARGUMENTS. Put the job description in `jd.txt`, run `npx workproof bullets --jd jd.txt --facts <bank or resume> --resume --out <file>` (or `--report workproof-report.json`), which writes the finished file, and change nothing except one added Summary sentence. Use only facts from a workproof report of this repository, or from the portfolio bank or past resume in this folder; tag every bullet with its source, list the skills the facts do not support as gaps (in the file and in your answer), and never add a skill or a number that is not in a fact. Save the result to the file I name, `resume.md` if I name none.
