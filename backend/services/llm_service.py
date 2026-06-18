"""
LLM Service — Groq chat model via LangChain.

Uses `langchain-groq` (ChatGroq) for first-class Groq support.
Falls back to OpenAI-compatible ChatOpenAI only if the provider is set to "openai".
"""

import os
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

load_dotenv()

logger = logging.getLogger(__name__)


def get_llm(temperature: float = 0):
    """
    Return the configured LLM instance.

    Provider is controlled by the LLM_PROVIDER env var:
      • "groq"   → ChatGroq  (default)
      • "openai" → ChatOpenAI
    """
    provider = os.getenv("LLM_PROVIDER", "groq").lower()

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is not set. "
                "Add it to your .env file."
            )

        logger.info("Using Groq LLM: %s", model)
        return ChatGroq(
            model=model,
            temperature=temperature,
            groq_api_key=api_key,
        )

    # ── OpenAI fallback ──────────────────────────────────────────────
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError(
            "LLM_PROVIDER is 'openai' but OPENAI_API_KEY is not set."
        )

    logger.info("Using OpenAI LLM: gpt-4o-mini")
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temperature,
    )