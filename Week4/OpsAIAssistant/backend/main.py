import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from agent.tools import get_embeddings

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load HuggingFace embedding weights on server startup
    logger.info("Initializing HuggingFace embedding model weights on startup...")
    try:
        embeddings = get_embeddings()
        embeddings.embed_query("startup warmup")
        logger.info("HuggingFace embeddings model pre-loaded successfully! Ops Assistant is ready.")
    except Exception as exc:
        logger.warning(f"Could not pre-load embeddings model: {exc}")
    yield

app = FastAPI(title="Ops Assistant Agent API", lifespan=lifespan)

# Setup CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Ops Assistant Agent API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
