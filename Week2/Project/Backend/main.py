from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extractor, chat

# Initialize FastAPI App
app = FastAPI(
    title="Smart Extractor & Chat API",
    description="Week 2 Project - Modular FastAPI Backend with Extraction and Streaming",
    version="1.0.0"
)

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only. In production use specific origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the modular routers (This keeps main.py perfectly clean!)
app.include_router(extractor.router, prefix="/api", tags=["Extraction"])
app.include_router(chat.router, prefix="/api", tags=["Chatbot"])

@app.get("/")
def read_root():
    return {"message": "Modular Backend is running! Access /docs for the Swagger UI."}

# Run command: uvicorn main:app --reload
