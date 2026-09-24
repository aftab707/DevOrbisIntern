import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from groq import Groq

# Load credentials and environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

print("Initializing local embedding model. Please wait...")
model = SentenceTransformer('BAAI/bge-small-en-v1.5')

def get_answer(query):
    # Convert the user's question into embeddings
    query_embedding = model.encode(query).tolist()

    # Retrieve relevant chunks from Supabase
    response = supabase.rpc("match_documents", {
        "query_embedding": query_embedding,
        "match_threshold": 0.3,
        "match_count": 5
    }).execute()

    documents = response.data

    if not documents:
        return "No relevant information found in the uploaded documents."

    # Combine retrieved chunks to build the context
    context_text = "\n\n---\n\n".join([doc["content"] for doc in documents])

    # Construct the system prompt for context constraint
    system_prompt = f"""You are a professional assistant. You must answer the user's question using ONLY the provided context below.
If the answer is not present in the context, you must clearly state: "I cannot find the answer in the provided documents."
Do not use your general knowledge. Answer clearly, concisely, and professionally in English.

CONTEXT:
{context_text}
"""

    # Generate the response using Groq API
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
    print("Document Retrieval Augmented Generation (RAG) System")
    print("Type 'exit' or 'quit' to terminate the session.")
    print("="*50)
    
    while True:
        user_input = input("\nQuery: ")
        if user_input.lower() in ['exit', 'quit']:
            print("Terminating session.")
            break
            
        print("Processing...")
        try:
            answer = get_answer(user_input)
            print("\nResponse:")
            print(answer)
        except Exception as e:
            print(f"\nError: {e}")
