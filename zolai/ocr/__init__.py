"""OCR module for Zolai Toolkit — Mistral Document AI."""

from __future__ import annotations

from .mistral_ocr import (
    HAS_MISTRAL,
    extract_markdown,
    extract_text,
    get_client,
    ocr_image,
    ocr_pdf,
    process_directory,
)

__all__ = [
    "HAS_MISTRAL",
    "extract_markdown",
    "extract_text",
    "get_client",
    "ocr_image",
    "ocr_pdf",
    "process_directory",
]
