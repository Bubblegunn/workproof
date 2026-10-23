I couldn't tailor the resume, and nothing has been saved to `resume.md`.

The tailoring skill only uses facts from a portfolio bank, a file where each job and project has numbered, tagged facts. It looks for one in three places, and none exists:
1. `./portfolio-bank.md`
2. `~/.jd-resume-tailor/portfolio-bank.md`
3. `references/portfolio-bank.md` inside the skill folder. Only the fictional `portfolio-bank.sample.md` is there.

**Why I didn't use `resumes/past-resume.md` directly.** That file describes itself as a fictional layout reference ("Avery Collins"), and it says to use it for layout ideas, never as facts about you. If I tailored from it, the result would present made-up employers and numbers as yours. Please tell me if it really is your resume and I'm misreading it.

**Bank format** (from the skill's sample):
```
## Preferred openers
- <opener>

## E01 <Company>
Role: <title>, <dates>
- F1: <fact with its real number>

## P01 <Project>
Status: complete | in-progress
Domain: <domains>
Stack: <tools>
- F1: <fact>
```

**Next step.** Paste your real resume, or the real projects and experience with their metrics. I'll build `portfolio-bank.md` from only what you give me, and I'll ask you to confirm it before saving it. Then I'll tailor to the Shipment Platform JD and write `resume.md`.

The JD's required skills are Go, SQS or similar queues, event-driven design, PostgreSQL and Terraform. Kubernetes, Rust and gRPC are nice to have. Facts about those will matter most when you write up your experience. The skill reports anything your facts don't support as a gap instead of inventing it.