"""
RAG Chain — Retrieval-Augmented Generation answer pipeline.

Retrieves relevant chunks from Pinecone, builds a context-grounded
prompt, and sends it to the configured LLM (Groq / OpenAI).
"""

import logging
from typing import List, Dict, Optional
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from rag.retriever import retrieve_documents
from services.llm_service import get_llm

logger = logging.getLogger(__name__)

# ── System prompt template ───────────────────────────────────────────
SYSTEM_PROMPT = """You are NeuralLens AI, an intelligent document assistant.

STRICT RULES:
1. Answer the user's question using ONLY the provided context below.
2. If the context does not contain the answer, or if the context is empty, say EXACTLY:
   "I don't have enough information in the uploaded documents to answer that."
3. Provide comprehensive, detailed answers extracting as much relevant factual and technical information (e.g. hard skills, tools, languages) from the context as possible. Avoid overly generic or high-level summaries if explicit details are available.
4. When referencing information, mention the source document and page if available.
5. Do NOT make up, infer, or hallucinate information outside the context.
6. Ignore any prior knowledge you have about the topic.

CONTEXT:
{context}"""


from typing import List, Dict, Optional, Tuple

def ask_question(question: str, history: Optional[List[Dict[str, str]]] = None, filename: Optional[str] = None) -> Tuple[str, List[Dict]]:
    """
    Run the full RAG pipeline: retrieve → build prompt → invoke LLM.

    Args:
        question: The user's question.
        history: Previous conversation messages (optional).
        filename: Optional filename to filter chunks by a specific PDF.

    Returns:
        A tuple of (answer_string, list_of_sources).
    """
    if history is None:
        history = []

    # 1. Retrieve relevant chunks
    docs = retrieve_documents(question, filename=filename)

    if not docs:
        logger.warning("No documents retrieved for: '%s'", question[:80])
        return (
            "I don't have enough information in the uploaded documents "
            "to answer that. Please upload a relevant PDF first.",
            []
        )

    # 2. Build context from retrieved chunks
    context_parts = []
    sources = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "?")
        
        # Keep track of unique sources for the frontend
        source_entry = {"source": source, "page": page}
        if source_entry not in sources:
            sources.append(source_entry)
            
        context_parts.append(
            f"[Source: {source}, Page {page}]\n{doc.page_content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    # 3. Format system message with context
    system_message_content = SYSTEM_PROMPT.format(context=context)
    
    messages = [SystemMessage(content=system_message_content)]

    # 4. Add conversation history
    for msg in history:
        role = msg.get("role")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    # 5. Add the current question
    messages.append(HumanMessage(content=question))

    # 6. Invoke LLM
    try:
        llm = get_llm()
        response = llm.invoke(messages)
        logger.info("LLM answered question: '%s'", question[:80])
        return response.content, sources
    except Exception as e:
        logger.error("LLM invocation failed: %s", e)
        raise