"""
Upload API — PDF upload, listing, and deletion endpoints.

Routes:
  POST   /upload                  → Upload and ingest a PDF
  GET    /documents               → List uploaded PDFs
  DELETE /documents/{filename}    → Delete a PDF and its vectors
"""

import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from rag.ingest import ingest_pdf, delete_pdf_vectors

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Documents"])

UPLOAD_DIR = os.path.join("data", "pdfs")

# Maximum file size: 20 MB
MAX_FILE_SIZE_MB = 20


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF file, extract its text, and index it in Pinecone."""

    # ── Validate file type ───────────────────────────────────────────
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted.",
        )

    # ── Validate file size ───────────────────────────────────────────
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Maximum is {MAX_FILE_SIZE_MB} MB.",
        )

    # ── Save file to disk ────────────────────────────────────────────
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(filepath, "wb") as buffer:
            buffer.write(contents)
        logger.info("Saved uploaded file: %s (%.1f MB)", file.filename, size_mb)
    except Exception as e:
        logger.error("Failed to save file '%s': %s", file.filename, e)
        raise HTTPException(status_code=500, detail="Failed to save file.") from e

    # ── Ingest into Pinecone ─────────────────────────────────────────
    try:
        chunks = ingest_pdf(filepath, file.filename)
    except ValueError as e:
        # Clean up the saved file if ingestion fails
        os.remove(filepath)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        os.remove(filepath)
        logger.error("Ingestion failed for '%s': %s", file.filename, e)
        raise HTTPException(
            status_code=500,
            detail="Failed to process and index the PDF.",
        ) from e

    return {
        "status": "success",
        "filename": file.filename,
        "size_mb": round(size_mb, 2),
        "chunks": chunks,
    }


@router.get("/documents")
def list_documents():
    """List all uploaded PDF files."""
    if not os.path.exists(UPLOAD_DIR):
        return {"documents": []}

    files = []
    for f in os.listdir(UPLOAD_DIR):
        if f.lower().endswith(".pdf"):
            path = os.path.join(UPLOAD_DIR, f)
            size_mb = os.path.getsize(path) / (1024 * 1024)
            files.append({
                "filename": f,
                "size_mb": round(size_mb, 2),
            })

    return {"documents": files}


@router.delete("/documents/{filename}")
def delete_document(filename: str):
    """Delete a PDF file from disk and remove its vectors from Pinecone."""
    filepath = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")

    # Delete vectors from Pinecone
    try:
        delete_pdf_vectors(filename)
    except Exception as e:
        logger.error("Failed to delete vectors for '%s': %s", filename, e)
        raise HTTPException(
            status_code=500,
            detail="Failed to remove vectors from database.",
        ) from e

    # Delete file from disk
    os.remove(filepath)
    logger.info("Deleted document: %s", filename)

    return {"status": "success", "filename": filename}