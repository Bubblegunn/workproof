I saved the tailored resume to `resume.md` in the current directory.

The `/receipts` skill doesn't tailor resumes. It builds a Claude Code usage report from your session transcripts. I didn't run it, because mining your transcripts would have done nothing for this JD. I built the resume directly from `portfolio-bank.md` instead.

**What I used from the bank, matched to the JD:**
- **LangGraph and RAG:** DocQA, including the 62% to 81% accuracy gain.
- **Chroma:** DocQA.
- **FastAPI:** DocQA and the Example Corp internship.
- **YOLO:** ScanSense (YOLOv8).
- **ONNX and edge deployment (nice to have):** ScanSense, at 25 FPS on CPU.
- **Churn models (nice to have):** the XGBoost churn model at Example Corp, 0.87 AUC.

**Gaps and caveats:**
- **Missing from the bank:** PyTorch, Pinecone, FAISS and Docker. I left them off rather than claim them. If you have real experience with any of them, add it to the bank and I'll work it in.
- **Python:** I listed it because XGBoost and FastAPI imply it, but the bank never states it. Confirm that's accurate.
- **ScanSense:** it is marked in progress. I dropped its `F2: TODO` line, so it has one bullet.
- **Contact details:** the bank has none, so the header has placeholders for you to fill in.
- **Opener:** I used the preferred opener "ML engineer" in the summary.