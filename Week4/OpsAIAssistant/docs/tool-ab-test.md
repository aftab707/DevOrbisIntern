# Tool Description A/B Test

## Method

The evaluator holds the model (`openai/gpt-oss-20b`), temperature (0), system instruction, and 10 user tasks constant. Condition A gives each tool a short generic description; condition B gives it the full production description documented in the Agent Prompt Specification. A case scores correct when the first selected tool matches the expected tool. One request per task is run in each condition (20 Groq calls total).

Run from the repo root:

```powershell
..\week4env\Scripts\python.exe scripts\evaluate_tool_descriptions.py
```

Raw selections are written to `docs/tool-ab-results.csv` so results can be reproduced and reviewed.

## Results

| Condition | Correct tool selections | Accuracy |
|---|---:|---:|
| A: short descriptions | 7/10 | 70% |
| B: detailed descriptions | 7/10 | 70% |

Conclusion: detailed descriptions did not improve aggregate tool-selection accuracy on this small set. B fixed the client follow-up selection (A chose RAG), while B chose `draft_email` for the “send this approved email” task; that is a conservative outcome because the evaluator request did not include the preceding draft and approval-dialog context. Both conditions skipped the knowledge tool on the injection and company-process prompts. Keep the more explicit safety descriptions, then refine the process/injection routing with multi-turn evaluation tasks before claiming an accuracy gain.

Model: `openai/gpt-oss-20b`, temperature 0. Run date: 2026-09-29. Raw case results are in `tool-ab-results.csv`.
