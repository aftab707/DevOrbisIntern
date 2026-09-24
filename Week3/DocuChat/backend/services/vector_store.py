import os
import faiss
import numpy as np
import pickle
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Setup Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception:
    supabase = None

# FAISS Configuration
FAISS_INDEX_FILE = "faiss_store.index"
FAISS_META_FILE = "faiss_meta.pkl"
DIMENSION = 384

def _load_faiss():
    if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_META_FILE):
        index = faiss.read_index(FAISS_INDEX_FILE)
        with open(FAISS_META_FILE, "rb") as f:
            metadata = pickle.load(f)
        return index, metadata
    return faiss.IndexFlatL2(DIMENSION), []

def _save_faiss(index, metadata):
    faiss.write_index(index, FAISS_INDEX_FILE)
    with open(FAISS_META_FILE, "wb") as f:
        pickle.dump(metadata, f)

def store_vectors(chunks: list, embeddings: list, filename: str):
    if supabase:
        try:
            data = [
                {
                    "content": chunk,
                    "metadata": {"source": filename, "chunk_id": i},
                    "embedding": emb
                }
                for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
            ]
            supabase.table("documents").insert(data).execute()
        except Exception as e:
            print(f"Supabase storage error: {e}")

    index, metadata = _load_faiss()
    emb_array = np.array(embeddings).astype('float32')
    index.add(emb_array)
    
    for i, chunk in enumerate(chunks):
        metadata.append({"content": chunk, "source": filename, "chunk_id": i})
        
    _save_faiss(index, metadata)

def search_vectors(query_embedding: list, k: int = 5) -> list:
    if supabase:
        try:
            response = supabase.rpc("match_documents", {
                "query_embedding": query_embedding,
                "match_threshold": 0.3,
                "match_count": k
            }).execute()
            if response.data:
                return response.data
        except Exception as e:
            print(f"Supabase retrieval error: {e}")

    index, metadata = _load_faiss()
    if len(metadata) == 0:
        return []
        
    emb_array = np.array([query_embedding]).astype('float32')
    distances, indices = index.search(emb_array, k)
    
    results = []
    for idx in indices[0]:
        if 0 <= idx < len(metadata):
            meta = metadata[idx]
            results.append({
                "content": meta["content"],
                "metadata": {"source": meta["source"], "chunk_id": meta["chunk_id"]}
            })
            
    return results

def clear_all_vectors():
    """Permanently deletes all data from both Supabase and local FAISS."""
    supabase_success = False
    if supabase:
        try:
            # Delete all rows safely by matching IDs > -1
            supabase.table("documents").delete().gt("id", -1).execute()
            supabase_success = True
        except Exception as e:
            print(f"Supabase wipe error: {e}")

    faiss_success = True
    try:
        if os.path.exists(FAISS_INDEX_FILE):
            os.remove(FAISS_INDEX_FILE)
        if os.path.exists(FAISS_META_FILE):
            os.remove(FAISS_META_FILE)
    except Exception as e:
        print(f"FAISS wipe error: {e}")
        faiss_success = False
        
    return {"supabase": supabase_success, "faiss": faiss_success}
