# Supabase Reset and RAG Verification

## Current Workspace Run

On 2026-09-29, the configured project's app-owned tables were checked. `documents` had 9 rows and `clients` had 0. The requested data reset completed: both now have 0 rows. No other tables were touched.

The hosted `match_documents` RPC responded, but the live query for the verified Week 3 goal had similarity `0.327` and the app's original `0.38` threshold rejected it. Lowering the threshold to `0.25` retrieved the correct text, but the existing RPC response omitted the source/page metadata, so the citation was `Unknown source`. The migration below recreates the app tables and RPC with explicit `source`, `page`, and metadata return fields.

## Rebuild Hosted Tables

The configured credential is a Supabase REST key. It can read/write PostgREST tables, but it cannot execute arbitrary SQL DDL. Apply the checked-in migration from the project's SQL Editor:

1. Open Supabase Dashboard for the project whose ref is configured in `backend/.env`.
2. Open **SQL Editor** and create a new query.
3. Paste the full contents of `backend/supabase/001_initial.sql` and run it once.
4. Confirm `clients` contains the three sample rows and `documents` is empty.
5. Start/restart the backend, upload the Week 3 PDF, and confirm the returned chunk count.
6. Run `..\week4env\Scripts\python.exe scripts\test_live_rag.py` from the project root. It temporarily inserts one tagged page 10 chunk, checks vector retrieval and citation, then deletes the tagged row.

The SQL file drops/recreates only `public.clients` and `public.documents`; this permanently removes their existing rows and table-specific indexes. The previous data rows have already been cleared, but the physical table rebuild still requires the SQL Editor step. The RAG test cannot pass its citation assertion against the old RPC response; after applying this migration it should return `[DevOrbis AI Intern Training Program.pdf, page 10]`.

To repeat only the row reset, run `..\week4env\Scripts\python.exe scripts\reset_supabase_data.py --confirm-project-ref <project-ref>`. The script refuses a project-ref mismatch and deletes only rows from `clients` and `documents`.
