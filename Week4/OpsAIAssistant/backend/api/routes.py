import hashlib
import logging
import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter

from agent.graph import agent_graph
from agent.tools import get_embeddings
from database.supabase_client import supabase
from models.schemas import ApprovalRequest, ChatRequest, ChatResponse


router = APIRouter()
logger = logging.getLogger(__name__)
MAX_PDF_BYTES = 20 * 1024 * 1024
GRAPH_RECURSION_LIMIT = 12


def _graph_config(session_id: str):
    return {"configurable": {"thread_id": session_id}, "recursion_limit": GRAPH_RECURSION_LIMIT}


def _knowledge_base_status():
    response = supabase.table("documents").select("metadata", count="exact").limit(1000).execute()
    sources = sorted({row.get("metadata", {}).get("source") for row in response.data if row.get("metadata", {}).get("source")})
    return {"chunks": response.count or 0, "sources": sources}


def _uses_extended_document_schema():
    """Support an earlier Week 3 table while the upgraded SQL migration is pending."""
    try:
        supabase.table("documents").select("source").limit(1).execute()
        return True
    except Exception as exc:
        if "column documents.source does not exist" in str(exc):
            return False
        raise


def _store_document_rows(rows, filename):
    if _uses_extended_document_schema():
        supabase.table("documents").upsert(rows, on_conflict="source,chunk_index").execute()
        supabase.table("documents").delete().eq("source", filename).gte("chunk_index", len(rows)).execute()
        return "enhanced"

    legacy_rows = []
    for row in rows:
        page = row["metadata"].get("page")
        page_number = page + 1 if isinstance(page, int) else "unknown"
        legacy_rows.append({
            "content": f"[source: {filename} | page: {page_number}]\n\n{row['content']}",
            "metadata": row["metadata"],
            "embedding": row["embedding"],
        })
    supabase.table("documents").insert(legacy_rows).execute()
    return "legacy"


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    config = _graph_config(req.session_id)
    try:
        events = agent_graph.stream({"messages": [HumanMessage(content=req.message)]}, config=config, stream_mode="values")
        latest_message = None
        for event in events:
            latest_message = event["messages"][-1]
        state = agent_graph.get_state(config)
        needs_approval = bool(state.next and state.next[0] == "sensitive_tools_node")
        pending_tool = None
        if needs_approval:
            pending_tool = state.values["messages"][-1].tool_calls[0]
        response_text = "Review the exact email details and approve or reject the simulated send." if needs_approval else getattr(latest_message, "content", "")
        return ChatResponse(response=response_text, needs_approval=needs_approval, pending_tool_call=pending_tool)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Agent request failed ({type(exc).__name__}). Check the API credentials and retry.") from exc


@router.post("/approve", response_model=ChatResponse)
async def approve_endpoint(req: ApprovalRequest):
    config = _graph_config(req.session_id)
    state = agent_graph.get_state(config)
    if not state.next or state.next[0] != "sensitive_tools_node":
        raise HTTPException(status_code=400, detail="No pending email action is awaiting approval.")

    try:
        if req.approved:
            events = agent_graph.stream(None, config=config, stream_mode="values")
        else:
            pending_message = state.values["messages"][-1]
            pending_call = pending_message.tool_calls[0]
            rejection = ToolMessage(
                tool_call_id=pending_call["id"],
                content=f"Email send rejected by human. Feedback: {req.feedback or 'No feedback provided.'}",
            )
            agent_graph.update_state(config, {"messages": [rejection]}, as_node="sensitive_tools_node")
            events = agent_graph.stream(None, config=config, stream_mode="values")

        latest_message = None
        for event in events:
            latest_message = event["messages"][-1]
            
        new_state = agent_graph.get_state(config)
        needs_approval_again = bool(new_state.next and new_state.next[0] == "sensitive_tools_node")
        pending_tool_again = None
        
        if needs_approval_again:
            pending_tool_again = new_state.values["messages"][-1].tool_calls[0]
            response_text = "Review the revised email details and approve or reject the simulated send."
        else:
            response_text = getattr(latest_message, "content", "Email action resolved.")

        return ChatResponse(
            response=response_text, 
            needs_approval=needs_approval_again, 
            pending_tool_call=pending_tool_again
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Approval step failed ({type(exc).__name__}).") from exc


@router.post("/ingest")
async def ingest_endpoint(file: UploadFile = File(...)):
    filename = os.path.basename(file.filename or "")
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Upload a PDF file.")

    payload = await file.read(MAX_PDF_BYTES + 1)
    if not payload or len(payload) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="PDF must be non-empty and no larger than 20 MB.")

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_file.write(payload)
            temp_path = temp_file.name

        documents = PyPDFLoader(temp_path).load()
        chunks = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100).split_documents(documents)
        if not chunks:
            raise HTTPException(status_code=422, detail="No readable text was found in this PDF.")

        file_hash = hashlib.sha256(payload).hexdigest()
        vectors = get_embeddings().embed_documents([chunk.page_content for chunk in chunks])
        rows = []
        for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
            page = chunk.metadata.get("page")
            rows.append({
                "content": chunk.page_content,
                "metadata": {"source": filename, "page": page, "chunk_index": index, "file_sha256": file_hash},
                "embedding": vector,
                "source": filename,
                "page": page,
                "chunk_index": index,
                "content_hash": hashlib.sha256(chunk.page_content.encode("utf-8")).hexdigest(),
            })

        storage_mode = _store_document_rows(rows, filename)
        migration_note = "" if storage_mode == "enhanced" else " Using legacy table compatibility mode."
        return {
            "status": "success",
            "message": f"Ingested {len(rows)} chunks from {filename}.{migration_note}",
            "chunks": len(rows),
            "source": filename,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("PDF ingestion failed for %s", filename)
        raise HTTPException(
            status_code=503,
            detail=f"PDF ingestion failed: {str(exc)[:180]}",
        ) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/knowledge-base")
async def knowledge_base_endpoint():
    """Return the currently searchable RAG sources without exposing document content."""
    try:
        return _knowledge_base_status()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Knowledge-base status failed ({type(exc).__name__}).") from exc


@router.delete("/knowledge-base")
async def clear_knowledge_base_endpoint():
    """Delete only RAG document chunks. Structured client records are preserved."""
    try:
        before = _knowledge_base_status()["chunks"]
        if before:
            supabase.table("documents").delete().not_.is_("id", "null").execute()
        remaining = _knowledge_base_status()["chunks"]
        if remaining:
            raise RuntimeError("Some document chunks remain after deletion.")
        return {"status": "success", "message": f"Cleared {before} knowledge-base chunks.", "chunks": 0, "sources": []}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Knowledge-base clear failed ({type(exc).__name__}).") from exc
