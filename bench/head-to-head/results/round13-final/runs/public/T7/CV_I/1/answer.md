I saved the tailored resume to `resume.md`. The fit score is 52 of 100, which the skill rates moderate. It says to ask before drafting at that level, but you asked for the file, so I drafted it. The gaps below can be closed only with facts you confirm.

## Fit report

| Dimension | Score | Why |
|---|---|---|
| Skills match (40%) | 50 | LangGraph, RAG, Chroma, FastAPI and YOLO are all covered by real work. PyTorch, Pinecone, FAISS and Docker are missing. |
| Experience match (40%) | 55 | You have a 3-month ML internship and two projects, one of them unfinished. |
| Seniority and culture (20%) | 50 | The JD doesn't state a level, and your bank reads as early-career. |

**Weighted total: 52 (moderate).**

- **Strengths:**
  - DocQA is a direct match for the LLM and RAG requirements, with a measured result (62% to 81% accuracy).
  - ScanSense covers computer vision and ONNX, which is a nice-to-have.
  - The churn model covers the other nice-to-have, and its FastAPI deployment covers a required skill.
- **Risks:** PyTorch, Docker, Pinecone and FAISS are missing. Python isn't named anywhere in your bank.

## Gaps and questions

| Requirement | Evidence in bank | Missing proof |
|---|---|---|
| Python (required) | XGBoost, FastAPI, LangGraph and ChromaDB are all Python tools, but the bank never says Python. | Confirm it and I'll add it. |
| PyTorch (required) | None. YOLOv8 runs on PyTorch, but I didn't assume you trained or used it. | Did you use PyTorch directly, for example fine-tuning YOLO? |
| Docker (required) | None. | Did you containerize the FastAPI services? |
| Pinecone, FAISS (required) | Only ChromaDB. | Any experience with either? |
| ONNX (nice-to-have) | ScanSense lists ONNX in its stack. | Did you export the model to ONNX? If so, I can say so in the bullet. |

## What I changed

- **Order:** Skills and Projects now come before Experience, because your strongest matches are in the projects.
- **Wording:** I used the JD's terms (LLM applications, RAG, vector databases, computer vision, churn) where your facts support them.
- **ScanSense:** it is marked in progress and uses present tense. I left out the `F2: TODO` item.
- **Not added:** the invented employers, dates and metrics. The project dates aren't in your bank, so I left them blank.

## Placeholders to fix

`resume.md` has a placeholder name (`Your Name`) and email (`your.name@example.com`). It also has no education section, because the bank doesn't include one. Send me your name, contact details, education and any answers above, and I'll update the file.