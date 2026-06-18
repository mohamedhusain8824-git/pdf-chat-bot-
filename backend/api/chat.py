"""
Chat API — Question-answering endpoint with session history.
"""

import logging
import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.chain import ask_question

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Chat"])

# In-memory session storage
# {
#   "session_id_123": [
#       {"role": "user", "content": "hello"},
#       {"role": "assistant", "content": "hi"}
#   ]
# }
sessions: Dict[str, List[dict]] = {}

class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The question to ask about uploaded documents.",
    )
    session_id: Optional[str] = Field(
        None,
        description="Unique chat session ID. If not provided, a new one is generated.",
    )
    filename: Optional[str] = Field(
        None,
        description="The specific PDF file to query. If None, queries all documents.",
    )

class ChatResponse(BaseModel):
    answer: str
    session_id: str
    history: list

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Ask a question and get an AI-generated answer from uploaded documents."""
    try:
        session_id = request.session_id or str(uuid.uuid4())

        if session_id not in sessions:
            sessions[session_id] = []

        # Pass history to ask_question so it remembers context
        current_history = sessions[session_id]
        
        answer = ask_question(request.question, history=current_history, filename=request.filename)

        # Save user message
        sessions[session_id].append(
            {
                "role": "user",
                "content": request.question,
            }
        )
        
        # Save assistant message
        sessions[session_id].append(
            {
                "role": "assistant",
                "content": answer,
            }
        )

        logger.info(
            "Session=%s | Question='%s'",
            session_id,
            request.question[:80],
        )

        return ChatResponse(
            answer=answer,
            session_id=session_id,
            history=sessions[session_id],
        )

    except Exception as e:
        logger.error("Chat error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question.",
        ) from e


@router.get("/history/{session_id}")
def get_history(session_id: str):
    """Get the full history for a specific session."""
    return {
        "session_id": session_id,
        "history": sessions.get(session_id, []),
    }


@router.get("/sessions")
def get_sessions():
    """List all available session IDs and their first message summary."""
    session_summaries = []
    for sid, hist in sessions.items():
        first_q = "Empty Session"
        for msg in hist:
            if msg.get("role") == "user":
                first_q = msg.get("content", "Unknown Request")
                if len(first_q) > 30:
                    first_q = first_q[:27] + "..."
                break
        session_summaries.append({
            "session_id": sid,
            "title": first_q
        })
        
    return {"sessions": session_summaries}
