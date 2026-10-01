import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database.supabase_client import supabase
from langchain_huggingface import HuggingFaceEmbeddings

try:
    print("Loading embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
    query_vector = embeddings.embed_query('Aftab')

    # 1. Check total documents
    print("Checking total documents...")
    count_res = supabase.table('documents').select('id', count='exact').execute()
    print(f'Total documents in DB: {count_res.count}')

    # 2. Check RPC with threshold 0.0 to see ALL scores
    print("Running match_documents with threshold 0.0...")
    res = supabase.rpc('match_documents', {'query_embedding': query_vector, 'match_threshold': 0.0, 'match_count': 5}).execute()
    
    if res.data:
        print('Top matches:')
        for doc in res.data:
            print(f'- ID: {doc.get("id")}, Sim: {doc.get("similarity")}, Content: {doc.get("content")[:50]}...')
    else:
        print("RPC returned no data even with 0.0 threshold.")
except Exception as e:
    import traceback
    traceback.print_exc()
