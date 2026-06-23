"""
NeuralLens AI — FastAPI Application Entry Point.

Configures:
  • Logging
  • CORS middleware (for the Vite frontend on localhost:5173)
  • Startup initialisation (Pinecone index, upload directory)
  • API route mounting
"""

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.upload import router as upload_router
from api.chat import router as chat_router
from api.auth import router as auth_router
from services.pinecone_service import init_pinecone_index

# ── Load environment variables ───────────────────────────────────────
load_dotenv()

# ── Logging configuration ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Startup / Shutdown lifecycle ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run setup tasks on startup and cleanup on shutdown."""
    # ── Startup ──────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("  NeuralLens AI Backend — Starting up")
    logger.info("=" * 60)

    # Ensure the PDF upload directory exists
    os.makedirs(os.path.join("data", "pdfs"), exist_ok=True)
    logger.info("Upload directory ready: data/pdfs")

    # Initialise Pinecone index
    try:
        index_name = init_pinecone_index()
        logger.info("Pinecone index '%s' is ready.", index_name)
    except Exception as e:
        logger.error("CRITICAL: Pinecone init failed — %s", e)
        logger.error("The server will start but uploads/chat will fail.")

    logger.info("Startup complete. Server is ready.")
    logger.info("=" * 60)

    yield  # ← App runs here

    # ── Shutdown ─────────────────────────────────────────────────────
    logger.info("NeuralLens AI Backend — Shutting down.")


# ── FastAPI app ──────────────────────────────────────────────────────
app = FastAPI(
    title="NeuralLens AI",
    description="AI-powered PDF document chatbot with RAG",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS middleware ──────────────────────────────────────────────────
# Allow the Vite dev server and common local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Common React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(chat_router)


# ── Health check ─────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    """Basic health check endpoint."""
    return {
        "status": "running",
        "service": "NeuralLens AI Backend",
        "version": "1.0.0",
    }