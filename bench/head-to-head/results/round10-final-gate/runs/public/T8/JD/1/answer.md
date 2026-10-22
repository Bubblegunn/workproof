I haven't tailored the resume yet, and `resume.md` isn't saved. The tailoring skill only writes from a verified portfolio bank, and it couldn't find one. I checked `./portfolio-bank.md`, `~/.jd-resume-tailor/portfolio-bank.md` and the skill's own bundled copy. The skill's rules say to stop and ask you here instead of working straight from the resume.

**Bank format.** Each fact gets an ID, so every resume bullet can carry a source tag:
```
# Portfolio bank
## Preferred openers
- Backend engineer

## E01 <Company>
Role: <title>, <dates>
- F1: <fact with its real number>
- F2: ...

## P01 <Project>
Status: complete | in-progress
Domain: ...
Stack: ...
- F1: ...

## K01 Skills inventory
- ...
```

**Offer.** `resumes/past-resume.md` has everything needed to build the bank: Cedarline, Brightforge, Harbor & Pine, and the skills and certification. I'd write only facts from that file, with numbers unchanged, and show you the bank before saving it to `./portfolio-bank.md`. Then I'd run the tailoring.

**Problem with the source file.** The header of `past-resume.md` says every name and number in it is fictional and meant for layout reference only. If that's a template and not your real history, send me your real details. I don't want to put invented facts on a resume.

**Early read on the JD, if the file is accurate.**
- **Covered:** Go, AWS SQS, event-driven design, PostgreSQL and Terraform all appear. The Cedarline shipment tracking bullet (Go + SQS) would be the lead.
- **Nice-to-haves:** Kubernetes appears only in your skills list. Rust and gRPC aren't in the file, so they'd go under Gaps.

Should I build the bank from `past-resume.md`, or will you send real details first?