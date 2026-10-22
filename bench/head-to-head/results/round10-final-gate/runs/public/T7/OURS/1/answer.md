I saved the tailored resume to `resume.md`. It is 325 words, under the 450 limit, and every bullet keeps its source tag from your bank.

I ran `npx workproof bullets` and then edited its output in three ways:
- **Summary:** I replaced the generic line with a summary built only from your bank's facts.
- **Skills and coverage table:** The generator had missed YOLOv8 in your ScanSense stack. I fixed that and marked the ONNX and churn items as nice-to-have rather than required. I also marked vector databases as partial, since only Chroma is covered.
- **Gaps:** I merged the Gaps list into one line, because the generator listed items it had already marked as covered.

Gaps: Python, PyTorch, Docker, Pinecone and FAISS aren't in your bank, so the resume doesn't claim them (ChromaDB is covered, and edge deployment is only partly covered through ONNX CPU inference).