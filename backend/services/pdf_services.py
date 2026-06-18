"""
PDF Service — Extract text from PDF files using PyMuPDF (fitz).
"""

import logging
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from every page of a PDF.

    Returns a list of dicts: [{"page": 1, "text": "..."}, ...]
    Raises ValueError for corrupt or unreadable PDFs.
    """
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        logger.error("Failed to open PDF '%s': %s", file_path, e)
        raise ValueError(f"Could not open PDF file: {e}") from e

    pages = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()

        pages.append({
            "page": page_num + 1,
            "text": text,
        })

    doc.close()

    total_chars = sum(len(p["text"]) for p in pages)
    logger.info(
        "Extracted %d pages (%d chars) from '%s'.",
        len(pages), total_chars, file_path,
    )

    return pages
