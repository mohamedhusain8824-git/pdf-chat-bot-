"""
RAG Ingest — PDF → LangChain Documents → Chunked → Pinecone.

Handles the full ingestion pipeline:
  1. Extract text from PDF (via PyMuPDF)
  2. Wrap each page as a LangChain Document with metadata
  3. Split into overlapping chunks
  4. Upsert chunks into Pinecone vector store
"""

import os
import logging
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from services.pdf_services import extract_text_from_pdf
from services.pinecone_service import get_vector_store, get_pinecone_client

logger = logging.getLogger(__name__)


def ingest_pdf(file_path: str, filename: str) -> int:
    """
    Ingest a PDF into Pinecone.

    Args:
        file_path: Path to the PDF file on disk.
        filename:  Original filename (used as metadata `source`).

    Returns:
        Number of chunks indexed.

    Raises:
        ValueError: If the PDF is empty or unreadable.
        Exception:  On Pinecone upload failures.
    """
    # 1. Extract text page by page
    pages_data = extract_text_from_pdf(file_path)

    # 2. Create Documents (skip blank pages)
    docs = []
    for page in pages_data:
        text = page["text"].strip()
        if text:
            docs.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": filename,
                        "page": page["page"],
                    },
                )
            )

    if not docs:
        logger.warning("No text extracted from '%s'. Skipping ingestion.", filename)
        return 0

    # 3. Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = text_splitter.split_documents(docs)
    logger.info(
        "Split '%s' into %d chunks (from %d non-empty pages).",
        filename, len(chunks), len(docs),
    )

    # 4. Upload to Pinecone
    try:
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
        logger.info("Successfully indexed %d chunks for '%s'.", len(chunks), filename)
    except Exception as e:
        logger.error("Failed to index '%s' in Pinecone: %s", filename, e)
        raise

    return len(chunks)


def delete_pdf_vectors(filename: str) -> None:
    """
    Delete all vectors from Pinecone that belong to the given filename.

    Uses metadata filter: {"source": filename}.
    """
    pc = get_pinecone_client()
    index_name = os.getenv("PINECONE_INDEX_NAME")
    index = pc.Index(index_name)

    try:
        index.delete(filter={"source": {"$eq": filename}})
        logger.info("Deleted vectors for '%s' from Pinecone.", filename)
    except Exception as e:
        logger.error("Error deleting vectors for '%s': %s", filename, e)
        raise
