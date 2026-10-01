# Ops Assistant Agent

FastAPI + LangGraph operations assistant with per-browser conversation memory, Supabase client lookups, pgvector search over PDFs, arithmetic, email drafts, and an approval interrupt before the demo email send action.

## Setup

1. Use Python 3.10+ and Node 20+. Create/activate the existing `Week4/week4env` environment, or create a new virtual environment.
2. Install backend dependencies: `python -m pip install -r backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env` and set `GROQ_API_KEY`, `SUPABASE_URL`, and a backend-only Supabase **service role** key. Do not commit `.env` or expose the service role key to Vite.
4. In the Supabase SQL Editor, inspect and run [`backend/supabase/001_initial.sql`](backend/supabase/001_initial.sql) once. **It drops only this app's `public.clients` and `public.documents` tables and recreates them; all rows in those two tables are deleted.** Do not run it against a project whose tables contain data you need.
5. Start the API from `backend`: `python main.py`.
6. In another terminal, start the UI from `frontend`: `npm run dev`.
7. Cache the local embedding model once: `..\week4env\Scripts\python.exe -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"` (use your environment's Python if you made a new venv).
8. Upload the Week 3 PDF and wait for the chunk count. The current workspace copy is `D:/DevOrbis/Week3/DevOrbis AI Intern Training Program.pdf`; add it to the repo only if its license permits.

The API loads settings from `backend/.env`. The PDF embedding model is `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions). Supabase must have the `vector` extension available. The app stores PDFs as 700-character chunks with 100-character overlap and replaces matching source/chunk rows on re-upload.

Conversation checkpoints use LangGraph's in-memory `MemorySaver`: turns are retained by a browser session while the API process runs, then reset when the process restarts. Email sending is simulated; no provider is configured and no email leaves the demo.

The left Knowledge base panel has **Clear RAG knowledge base**. It deletes only `documents` chunks, preserves structured `clients` records, and starts a fresh browser conversation. After clearing, upload a new PDF; retrieval will use only the newly indexed document chunks.

## Quick checks

Run backend tests from `backend`: `python -m unittest discover -s tests -v`.

With the API running, `python scripts/smoke_agent_api.py` checks calculation, memory, draft, approval pause, rejection, and simulated approval. It uses the configured Groq model but never sends a real email.

After applying the SQL migration and uploading the PDF, run `python scripts/test_live_rag.py` from the repo root to check vector retrieval and citation; it removes its temporary test row.

Run frontend checks from `frontend`: `npm run lint` and `npm run build`.

The Supabase SQL migration creates three sample clients (Acme Corp, Globex, Soylent) and the `match_documents` vector-search RPC.

## Demo and evaluation

- [Demo script and test cases](docs/demo-and-test-cases.md)
- [Agent Prompt Specification](docs/Agent%20Prompt%20Specification.md)
- [Tool description A/B test](docs/tool-ab-test.md)
- [Red-team findings](docs/red-team-findings.md)
- [Supabase reset and RAG verification](docs/supabase-reset.md)

The SQL Editor is required for initial schema creation because the app's REST key cannot execute arbitrary DDL. The UI has no database wipe control. Re-upload the PDF after the reset, then verify citations before the demo.
