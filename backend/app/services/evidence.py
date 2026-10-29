"""
Evidence file handling service.
- Validates file type by magic bytes (not just extension).
- Computes SHA-256 server-side.
- Stores with randomized UUID-based filename.
- Enforces file size and type limits.
"""
from __future__ import annotations

import hashlib
import logging
import os
import uuid
from pathlib import Path
from typing import Tuple

import aiofiles
from fastapi import UploadFile, HTTPException

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Magic bytes for allowed file types
MAGIC_SIGNATURES = {
    b"%PDF": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
}


async def validate_and_store_evidence(
    upload: UploadFile,
    report_id: str,
) -> Tuple[str, str, str, int]:
    """
    Validate, hash, and store an uploaded evidence file.
    Returns: (storage_filename, sha256_hex, content_type, file_size)
    Raises HTTPException on validation failure.
    """
    # 1. Read up to max size + 1 byte to detect oversized files
    max_bytes = settings.max_file_bytes
    content = await upload.read(max_bytes + 1)

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB} MB."
        )
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file is not allowed.")

    # 2. Validate extension
    original_name = upload.filename or "unknown"
    ext = Path(original_name).suffix.lstrip(".").lower()
    if ext not in settings.allowed_extensions_set:
        raise HTTPException(
            status_code=415,
            detail=f"File type '.{ext}' is not allowed. Permitted: {settings.ALLOWED_EXTENSIONS}"
        )

    # 3. Validate by magic bytes for known binary types
    detected_type = _detect_type(content, ext)

    # 4. Compute SHA-256
    sha256 = hashlib.sha256(content).hexdigest()

    # 5. Randomized storage path (never uses original filename)
    storage_name = f"{uuid.uuid4().hex}_{report_id[:8]}.{ext}"
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    storage_path = upload_dir / storage_name

    async with aiofiles.open(storage_path, "wb") as f:
        await f.write(content)

    logger.info("Stored evidence file: %s (sha256: %s)", storage_name, sha256)
    return storage_name, sha256, detected_type, len(content)


def _detect_type(content: bytes, ext: str) -> str:
    """Check magic bytes for binary types; fall back to text/plain for text."""
    header = content[:8]
    for magic, mime in MAGIC_SIGNATURES.items():
        if header.startswith(magic):
            return mime
    if ext in {"txt", "csv"}:
        # Try to decode as UTF-8
        try:
            content[:2048].decode("utf-8")
            return "text/plain"
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=415,
                detail="File declared as text but contains non-UTF-8 bytes."
            )
    return "application/octet-stream"


def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


async def get_evidence_path(storage_filename: str) -> Path:
    """Return absolute path, rejecting path traversal attempts."""
    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    target = (upload_dir / storage_filename).resolve()
    if not str(target).startswith(str(upload_dir)):
        raise HTTPException(status_code=400, detail="Invalid file path.")
    if not target.exists():
        raise HTTPException(status_code=404, detail="Evidence file not found.")
    return target
