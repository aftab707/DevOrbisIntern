import os
import faiss
import numpy as np
import pickle
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from groq import Groq

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

print("Loading AI Engine and FAISS Index...")
model = SentenceTransformer('BAAI/bge-small-en-v1.5')

# Load the FAISS index and the associated text metadata from disk
try:
    index = faiss.read_index("local_faiss.index")
    with open("faiss_metadata.pkl", "rb") as f:
        documents = pickle.load(f)
except FileNotFoundError:
    print("Error: FAISS index or metadata not found. Run faiss_ingest.py first.")
    exit()

def get_answer(query):
    # Step 1: Convert query to an embedding and format for FAISS (float32 array matrix)
    query_embedding = model.encode([query])
    query_array = np.array(query_embedding).astype('float32')

    # Step 2: Search the FAISS index (k=5 retrieves the top 5 closest vectors)
    k = 5
    distances, indices = index.search(query_array, k)

    # Step 3: Retrieve the actual text chunks using the returned indices
    retrieved_chunks = []
    for idx in indices[0]:
        # Ensure the index is valid and mapped to a document
        if 0 <= idx < len(documents):
            retrieved_chunks.append(documents[idx])

    if not retrieved_chunks:
        return "No relevant information found in the local FAISS index."

    # Step 4: Construct context and prompt constraint
    context_text = "\n\n---\n\n".join(retrieved_chunks)

    system_prompt = f"""You are a professional assistant. You must answer the user's question using ONLY the provided context below.
If the answer is not present in the context, you must clearly state: "I cannot find the answer in the provided documents."
Do not use your general knowledge. Answer clearly, concisely, and professionally in English.

CONTEXT:
{context_text}
"""

    # Step 5: Generate the response using Groq API
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        model="openai/gpt-oss-20b",
        temperature=0.3,
    )

    return chat_completion.choices[0].message.content

if __name__ == "__main__":
    print("\n" + "="*50)
    print("FAISS Local RAG Terminal")
    print("Type 'exit' or 'quit' to terminate the session.")
    print("="*50)
    
    while True:
        user_input = input("\nQuery: ")
        if user_input.lower() in ['exit', 'quit']:
            print("Terminating session.")
            break
            
        print("Processing via FAISS...")
        try:
            answer = get_answer(user_input)
            print("\nResponse:")
            print(answer)
        except Exception as e:
            print(f"\nError: {e}")
