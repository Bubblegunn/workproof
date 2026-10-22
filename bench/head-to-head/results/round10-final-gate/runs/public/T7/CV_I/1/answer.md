I saved the tailored resume to `resume.md`, but it still has a placeholder name and email you need to replace. The bank has no name, contact details, education or project dates, so I left those out.

## Fit report: about 56/100, moderate
Skills match is about 55, experience about 60, and seniority signals about 50. The skill's moderate band says to ask before drafting. I drafted anyway because you asked for the file, so treat the gaps below as open.

- **Strengths:**
  - LangGraph multi-agent RAG with ChromaDB, including measured accuracy gains.
  - YOLOv8 with ONNX on CPU (the nice-to-have edge deployment).
  - A churn model served through FastAPI (the nice-to-have customer model).
- **Risks:** The only employment is a 3-month internship. ScanSense is still in progress.

## Gaps (not added to the resume)
| Requirement | Evidence in bank | Missing proof | Suggested bullet |
|---|---|---|---|
| Python | XGBoost and FastAPI imply it, but it isn't stated | Confirmation | Add "Python" to Skills if true |
| PyTorch | None | Any PyTorch use (YOLOv8 runs on it, but I can't assume you trained with it) | "Trained/fine-tuned [model] in PyTorch on [data], reaching [result]" |
| Pinecone, FAISS | None (only Chroma) | Any use | "Evaluated FAISS vs Chroma for [task]" |
| Docker | None | Whether you containerised the FastAPI services | "Containerised [service] with Docker for [use]" |

## What I changed
- I led with the projects, since they match the JD better than the internship.
- The Skills section uses the JD's category wording, such as "LLM applications" and "Vector databases".
- I left out the `TODO` bullet from ScanSense.
- I wrote the in-progress ScanSense work in the present tense.
- Python, PyTorch, Docker, Pinecone and FAISS are not listed anywhere.
- The summary makes no years-of-experience claim.

## Questions for you
1. What are your name, email and links, and do you have education to list?
2. Do you have real experience with any of the gaps above?
3. Do you have a result for ScanSense, such as accuracy or mAP? That would fill the missing `F2`.

I can also open the file in the CV Builder for an ATS check once the placeholders are filled.