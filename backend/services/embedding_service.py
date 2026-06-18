"""
Embedding Service — Pinecone Inference Embeddings (multilingual-e5-large).

Uses Pinecone's built-in embedding model so no separate embedding API key
is required — the same PINECONE_API_KEY handles both storage and embedding.
"""

import os
import logging
from dotenv import load_dotenv
from langchain_pinecone import PineconeEmbeddings

load_dotenv()

logger = logging.getLogger(__name__)

# ── Singleton cache ──────────────────────────────────────────────────
_embedding_model = None


def get_embedding_model() -> PineconeEmbeddings:
    """Return a cached Pinecone embedding model instance."""
    global _embedding_model

    if _embedding_model is not None:
        return _embedding_model

    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise ValueError(
            "PINECONE_API_KEY is not set. "
            "Add it to your .env file."
        )

    logger.info("Initialising Pinecone embedding model (multilingual-e5-large)...")
    _embedding_model = PineconeEmbeddings(
        model="multilingual-e5-large",
        pinecone_api_key=api_key,
    )
    logger.info("Embedding model ready.")
    return _embedding_model