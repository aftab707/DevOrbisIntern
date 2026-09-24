import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

# 1. Credentials aur Supabase Setup
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Hugging Face Model Load karein
print("Loading model... (Pehli baar thoda time lag sakta hai)")
model = SentenceTransformer('BAAI/bge-small-en-v1.5')

def process_and_upload_pdf(file_path):
    # PDF Read karna
    print(f"Reading {file_path}...")
    reader = PdfReader(file_path)
    
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + " "
            
    # Simple Chunking (Text ko chote hisson mein todna, approx 500 characters)
    # RAG mein chunking bohot zaroori hai taa ke database search sahi ho
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    print(f"Total {len(chunks)} chunks ban gaye.")

    # Embeddings Generate karna aur Supabase mein upload karna
    for i, chunk in enumerate(chunks):
        if len(chunk.strip()) < 10: # Chote/khaali chunks ko ignore karein
            continue
            
        print(f"Uploading chunk {i+1}/{len(chunks)}...")
        
        # Text to Embedding (Local)
        embedding = model.encode(chunk).tolist()
        
        # Supabase Data Format
        data = {
            "content": chunk,
            "metadata": {"source": file_path, "chunk_id": i},
            "embedding": embedding
        }
        
        # Insert into Supabase Table
        supabase.table("documents").insert(data).execute()
        
    print("✅ Sab chunks successfully Supabase mein save ho gaye!")

# Test karne ke liye (koi bhi chhoti si PDF apne folder mein rakhein aur uska naam yahan dein)
if __name__ == "__main__":
    # Niche 'sample.pdf' ki jagah apni PDF ka naam likhein
    process_and_upload_pdf("DevOrbis AI Intern Training Program.pdf") 