I saved the tailored resume to `resume.md`. The fit score is 56/100, which the skill rates "moderate". It says to ask before drafting at that level, but you asked for the file, so I drafted it and am flagging the score here.

I only used facts from `portfolio-bank.md`. I did not check the file against the grammar with a validator.

## Fit report

| Dimension | Score | Why |
|---|---|---|
| Skills (40%) | 55 | LangGraph, RAG, Chroma, FastAPI, YOLOv8 and ONNX are covered. PyTorch, Pinecone, FAISS and Docker are not in the bank. |
| Experience (40%) | 60 | The bank has a churn model, a RAG system and a retail vision project. It only has a 3-month internship, which looks junior for an ML Engineer role. |
| Seniority and culture (20%) | 50 | There is no signal either way. |
| **Weighted total** | **56** | |

**Strengths:**
- You have a churn model (the nice-to-have), served through FastAPI.
- You have LangGraph RAG on ChromaDB with measured gains (62% to 81%).
- You have a YOLOv8 and ONNX retail project, which matches both the computer vision requirement and the edge-deployment nice-to-have.

**Risks:** The posting requires PyTorch and your bank doesn't mention it. The vector database requirement is only 1 of 3 covered, and Docker is missing.

## Gaps for you to fill

| Requirement | Evidence in bank | Missing proof |
|---|---|---|
| Python | XGBoost and FastAPI work implies it, but the bank doesn't say so | Confirm, then add it to Skills |
| PyTorch | None | Any use in coursework or projects? |
| Pinecone, FAISS | None (only Chroma) | Any use? |
| Docker | None | Did you containerize the FastAPI service or DocQA? |

I left all four out of the resume.

## Changes made
- I put DocQA before ScanSense, since LangGraph, RAG and Chroma are required skills.
- I led the summary with the churn model, RAG accuracy and the CPU/ONNX detector.
- I grouped Skills by the posting's categories and listed only tools from the bank.
- I wrote the in-progress ScanSense in present tense and left out its `F2: TODO` line.

## Open items
- **Header:** the bank has no name or contact details, so `[Your Name]` and `[your.email@example.com]` are placeholders. Replace them before sending.
- **Education:** there is no education in the bank, so I omitted the section.
- **Dates:** DocQA and ScanSense have no dates in the bank, so I left them off.
- **Gap answers:** if you can answer the four gap questions truthfully, I'll add them and rescore.

I can also open the draft in the CV Builder for the ATS preflight and PDF export if you want.