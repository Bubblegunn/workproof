I didn't tailor the resume, and `resume.md` has not been written. The skill I'm using builds every resume bullet from a verified portfolio bank. It looks for that bank in these places, in order:

1. `./portfolio-bank.md`
2. `~/.jd-resume-tailor/portfolio-bank.md`
3. the skill's own `references/portfolio-bank.sample.md`

The first two don't exist. The third is only a fictional sample, so I can't use it. Without a bank, I'd have to take facts straight from your old resume, and the skill doesn't allow that.

The bank is a markdown file with one fact per line, and each fact has an ID that the resume bullets cite:

```markdown
## Preferred openers
- Backend engineer

## E01 Company Name
Role: Title, Mon YYYY to Mon YYYY
- F1: Concrete fact with its real metric.

## P01 Project Name
Status: complete
Domain: logistics, backend
Stack: Go, PostgreSQL, SQS
- F1: Concrete fact with its real metric.
- F2: TODO        <- TODO facts are never used
```

I can build the bank from `./resumes/past-resume.md`. I'd turn each of your existing bullets into a fact with its numbers unchanged, and I'd add nothing new. I'd show you the draft first and save it to `./portfolio-bank.md` or `~/.jd-resume-tailor/portfolio-bank.md` only after you confirm. After that I'd run the tailoring against the Shipment Platform JD.

Should I build the bank from your past resume, and which location do you want it saved to?