I saved the tailored resume to `resume.md`. It covers about half of the required skills, and several of the missing ones need your input before you send it.

## Fit report: about 58/100, moderate fit
The skill says to ask before drafting at this score. You'd already asked for a draft, so I wrote it.

| Dimension | Score |
|---|---|
| Skills match (40%) | 55 |
| Experience match (40%) | 60 |
| Culture and seniority signals (20%) | 60 |

- **Strengths:**
  - LangGraph, RAG and FastAPI are all covered by DocQA, with a measured result (62% to 81% accuracy).
  - YOLOv8 and ONNX are both covered by ScanSense.
  - The churn model (0.87 AUC, 1.2M records) matches the nice-to-have.
- **Risks:**
  - Your experience is one internship plus two projects, one of which is still in progress.
  - Several required tools aren't in your bank.

## Gaps to fill
I left out anything not in the bank. These are the required skills I couldn't cover:

| Requirement | Evidence in bank | Missing proof |
|---|---|---|
| Python | Implied by XGBoost, FastAPI and LangGraph, but never stated | Confirm, and add it to Skills |
| PyTorch | None | Any model you trained or fine-tuned with it? |
| Pinecone, FAISS | Only ChromaDB | Any use, even in a side project? |
| Docker | None | Did you containerize the FastAPI service or DocQA? |

If you have real experience with any of these, send me the facts and I'll add them. Python and Docker are the most likely to be quick wins.

## What changed
- **Order:** DocQA now comes before ScanSense, and the churn work sits under Experience.
- **Wording:** I used the JD's terms where they were true: "RAG", "multi-agent", "churn modeling", "YOLOv8", "ONNX", "FastAPI".
- **Skills:** The section is grouped by the JD's categories.
- **Scope:** I wrote ScanSense in the present tense because it's in progress. I left out its `TODO` bullet.
- **Education:** I left it out because the bank has none. Add your degree if you have one.

## Placeholders to replace
The name and contact line are placeholders (`Your Name`, `email@example.com`, `portfolio.example.test`), because the bank has no contact details.