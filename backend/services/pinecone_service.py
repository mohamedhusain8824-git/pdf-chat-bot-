"""
Pinecone Service — Vector database client, index management, and LangChain store.

Handles:
  • Pinecone client creation (singleton)
  • Index initialisation (creates the index if it doesn't exist)
  • LangChain PineconeVectorStore factory
  • Namespace / filter-based vector deletion
"""

import os
import logging
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from services.embedding_service import get_embedding_model
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Singleton cache ──────────────────────────────────────────────────
_pinecone_client: Pinecone | None = None


def get_pinecone_client() -> Pinecone:
    """Return a cached Pinecone client instance."""
    global _pinecone_client

    if _pinecone_client is not None:
        return _pinecone_client

    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise ValueError(
            "PINECONE_API_KEY is not set. "
            "Add it to your .env file."
        )

    _pinecone_client = Pinecone(api_key=api_key)
    logger.info("Pinecone client initialised.")
    return _pinecone_client


def init_pinecone_index() -> str:
    """
    Ensure the Pinecone index exists. Creates it with the correct
    dimension (1024 for multilingual-e5-large) if it doesn't.

    Returns the index name.
    """
    pc = get_pinecone_client()

    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not index_name:
        raise ValueError(
            "PINECONE_INDEX_NAME is not set. "
            "Add it to your .env file."
        )

    cloud = os.getenv("PINECONE_CLOUD", "aws")
    region = os.getenv("PINECONE_REGION", "us-east-1")

    try:
        existing_indexes = [idx.name for idx in pc.list_indexes()]

        if index_name not in existing_indexes:
            logger.info("Creating Pinecone index '%s' (dim=1024, cosine)...", index_name)
            pc.create_index(
                name=index_name,
                dimension=1024,  # multilingual-e5-large
                metric="cosine",
                spec=ServerlessSpec(cloud=cloud, region=region),
            )
            logger.info("Pinecone index '%s' created successfully.", index_name)
        else:
            logger.info("Pinecone index '%s' already exists.", index_name)

    except Exception as e:
        logger.error("Failed to initialise Pinecone index '%s': %s", index_name, e)
        raise

    return index_name


def get_vector_store(namespace: str | None = None) -> PineconeVectorStore:
    """
    Return a LangChain PineconeVectorStore backed by the configured index
    and the Pinecone multilingual-e5-large embedding model.
    """
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not index_name:
        raise ValueError("PINECONE_INDEX_NAME is not set.")

    embeddings = get_embedding_model()

    return PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings,
        namespace=namespace,
    )


def delete_namespace_vectors(namespace: str) -> None:
    """Delete all vectors in a given namespace."""
    pc = get_pinecone_client()
    index_name = os.getenv("PINECONE_INDEX_NAME")
    index = pc.Index(index_name)

    try:
        index.delete(delete_all=True, namespace=namespace)
        logger.info("Deleted all vectors in namespace '%s'.", namespace)
    except Exception as e:
        logger.error("Error deleting namespace '%s': %s", namespace, e)
        raise
