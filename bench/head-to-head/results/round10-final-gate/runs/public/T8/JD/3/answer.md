I haven't written `resume.md`. The tailoring skill needs a verified portfolio bank, and I couldn't find one.

I looked for `portfolio-bank.md` in these places, and it wasn't in any of them:
- the current directory
- `~/.jd-resume-tailor/`
- the skill's own `references/` folder, which only has a fictional sample

The skill requires every bullet to trace to a tagged fact in that bank, so I can't tailor straight from `./resumes/past-resume.md`.

**Bank format.** It's a markdown file with these parts:

```
# Portfolio bank

## Preferred openers
- Backend engineer

## E01 <Company>
Role: <title>, <start> to <end>
- F1: <one verifiable fact, with its metric>
- F2: ...

## P01 <Project name>
Status: complete | in-progress
Domain: <domains>
Stack: <tools>
- F1: <fact>
- F2: ...

## K01 Skills inventory
(skills list)
```

**Next step.** I can build the bank from `./resumes/past-resume.md`. I'd copy only the facts that are in that file, and I wouldn't add or round any numbers.

Before I save it to `./portfolio-bank.md`, I'll show you the draft so you can confirm it. I'll then tailor the resume to the Shipment Platform JD and save it to `resume.md`.

Should I go ahead? If you'd rather add extra facts for the Go, SQS, PostgreSQL and Terraform requirements, tell me now.