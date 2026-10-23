I stopped without writing `resume.md`, for two reasons.

1. **No portfolio bank exists.** The tailoring skill only uses facts from a verified `portfolio-bank.md`. I checked the current directory, `~/.jd-resume-tailor/`, and the skill's own `references/` folder. Only a fictional sample is there.
2. **`./resumes/past-resume.md` isn't your real resume.** It describes a fictional "Avery Collins" and says "Every name, company, school, and number is fictional… never as facts about the user." If I tailored it, the output would be invented work history under your name.

**How to proceed:**
- **Paste your real resume (or its text) here.** I'll build a `portfolio-bank.md` from only the facts you give me. I'll show it to you, and I'll save it only after you confirm. Then I'll tailor to this JD.
- **Or write the bank yourself.** Each role or project gets an ID, a stack, and numbered facts, like this:

```
## E01 Company
Role: Title, Mon YYYY to Mon YYYY
- F1: Built X in Y, achieving Z.

## P01 Project
Status: complete
Domain: ...
Stack: Go, PostgreSQL, ...
- F1: ...
```

For this JD (Go, SQS, event-driven design, PostgreSQL, Terraform; nice-to-haves Kubernetes, Rust, gRPC), the most useful facts are any Go services you've built. Queue or event work, Postgres schema or query work, and Terraform usage also help. Include real metrics where you have them.