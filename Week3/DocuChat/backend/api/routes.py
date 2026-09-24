from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from services.vector_store import store_vectors, search_vectors, clear_all_vectors
from services.llm_service import generate_rag_response

router = APIRouter()

print("Initializing AI Embedding Model...")
embedding_model = SentenceTransformer('BAAI/bge-small-en-v1.5')

class ChatRequest(BaseModel):
    query: str

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        reader = PdfReader(file.file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + " "
                
        # Semantic chunking
        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        valid_chunks = [c for c in chunks if len(c.strip()) >= 10]
        
        if not valid_chunks:
            raise HTTPException(status_code=400, detail="No readable text found in PDF.")

        # Vectorize and Store
        embeddings = embedding_model.encode(valid_chunks).tolist()
        store_vectors(valid_chunks, embeddings, file.filename)
        
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_created": len(valid_chunks),
            "message": "Completed ingestion process successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        query_emb = embedding_model.encode(request.query).tolist()
        documents = search_vectors(query_emb, k=5)
        
        if not documents:
            return {
                "answer": "I cannot find the answer in the provided documents.",
                "citations": []
            }
            
        context_text = ""
        citations = set()
        
        for doc in documents:
            context_text += f"\n\n---\n\n{doc['content']}"
            citations.add(f"{doc['metadata']['source']} (Chunk {doc['metadata']['chunk_id']})")

        # Generate response via LLM service
        answer = generate_rag_response(request.query, context_text)

        return {
            "answer": answer,
            "citations": list(citations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear")
async def clear_database():
    try:
        result = clear_all_vectors()
        return {"message": "Knowledge base permanently cleared.", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
