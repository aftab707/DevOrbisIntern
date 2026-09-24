import faiss
import numpy as np
import pickle
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

print("Initializing embedding model...")
model = SentenceTransformer('BAAI/bge-small-en-v1.5')
DIMENSION = 384

def process_and_index_pdf(file_path):
    print(f"Reading {file_path}...")
    reader = PdfReader(file_path)
    
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + " "
            
    # Standard chunking strategy
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    valid_chunks = [c for c in chunks if len(c.strip()) >= 10]
    print(f"Generated {len(valid_chunks)} valid chunks.")

    print("Generating embeddings...")
    embeddings = model.encode(valid_chunks)
    
    # FAISS requires numpy arrays in float32 format
    embeddings_array = np.array(embeddings).astype('float32')

    print("Building FAISS index...")
    # IndexFlatL2 performs an exact-match L2 distance search
    index = faiss.IndexFlatL2(DIMENSION)
    index.add(embeddings_array)

    # Save the FAISS index to the local disk
    faiss.write_index(index, "local_faiss.index")
    
    # IMPORTANT: FAISS only stores mathematical vectors, not the original text strings.
    # We must save the text chunks separately using pickle to map the vector results back to readable text.
    with open("faiss_metadata.pkl", "wb") as f:
        pickle.dump(valid_chunks, f)
        
    print("Successfully saved local_faiss.index and faiss_metadata.pkl to disk.")

if __name__ == "__main__":
    process_and_index_pdf("DevOrbis AI Intern Training Program.pdf")
