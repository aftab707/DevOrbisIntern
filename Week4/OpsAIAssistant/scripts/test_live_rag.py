import hashlib
import sys
import uuid
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from agent.tools import get_embeddings, search_knowledge_base
from database.supabase_client import supabase


PDF_PATH = ROOT.parents[1] / "Week3" / "DevOrbis AI Intern Training Program.pdf"
TEST_RUN = f"rag-live-test-{uuid.uuid4()}"
QUERY = "What is the goal of Week 3 in the DevOrbis training program?"


def main():
    if not PDF_PATH.is_file():
        raise SystemExit(f"Week 3 PDF not found at {PDF_PATH}")

    print("Loading Week 3 PDF page 10...", flush=True)
    page = PyPDFLoader(str(PDF_PATH)).load()[9]
    chunk = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=0).split_documents([page])[0]
    print("Embedding test passage...", flush=True)
    vector = get_embeddings().embed_documents([chunk.page_content])[0]
    source = PDF_PATH.name
    row = {
        "content": chunk.page_content,
        "metadata": {"source": source, "page": 9, "test_run": TEST_RUN},
        "embedding": vector,
        "source": source,
        "page": 9,
        "chunk_index": 2_147_483_647,
        "content_hash": hashlib.sha256(chunk.page_content.encode("utf-8")).hexdigest(),
    }

    try:
        print("Inserting one marked test chunk...", flush=True)
        supabase.table("documents").insert(row).execute()
        print("Querying Supabase vector RPC...", flush=True)
        raw_matches = supabase.rpc(
            "match_documents",
            {"query_embedding": get_embeddings().embed_query(QUERY), "match_threshold": 0.0, "match_count": 3},
        ).execute().data
        print("Top similarity:", raw_matches[0].get("similarity") if raw_matches else "no match", flush=True)
        answer = search_knowledge_base.invoke({"query": QUERY})
        passed = source in answer and "page 10" in answer and "Week 3" in answer and "vector" in answer.lower()
        print("PASS" if passed else "FAIL")
        print("Expected citation: [DevOrbis AI Intern Training Program.pdf, page 10]")
        print("Retrieved evidence:", answer[:800].encode("ascii", "backslashreplace").decode("ascii"))
        if not passed:
            raise SystemExit(1)
    finally:
        supabase.table("documents").delete().eq("metadata->>test_run", TEST_RUN).execute()


if __name__ == "__main__":
    main()
