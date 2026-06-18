"""
RAG Retriever — Similarity search against Pinecone.

Wraps the LangChain PineconeVectorStore similarity search with
error handling and logging.
"""

import logging
from langchain_core.documents import Document
from services.pinecone_service import get_vector_store

logger = logging.getLogger(__name__)


from typing import Optional

def retrieve_documents(query: str, k: int = 10, filename: Optional[str] = None) -> list[Document]:
    """
    Retrieve the top-k most relevant document chunks from Pinecone.

    Args:
        query: The user's question.
        k:     Number of chunks to retrieve (default 10).
        filename: Optional filename to filter chunks by a specific PDF.

    Returns:
        List of LangChain Document objects with page_content and metadata.
    """
    try:
        vector_store = get_vector_store()
        
        search_kwargs = {"k": k}
        if filename:
            search_kwargs["filter"] = {"source": filename}
            
        docs = vector_store.similarity_search(query, **search_kwargs)
        logger.info(
            "Retrieved %d chunks for query: '%s'",
            len(docs), query[:80],
        )
        return docs
    except Exception as e:
        logger.error("Retrieval failed for query '%s': %s", query[:80], e)
        raise