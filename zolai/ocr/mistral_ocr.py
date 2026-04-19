"""Mistral OCR module for Zolai Toolkit."""

from __future__ import annotations

import base64
import os
import time
from pathlib import Path
from typing import Optional

try:
    from mistralai.client import Mistral

    HAS_MISTRAL = True
except ImportError:
    HAS_MISTRAL = False


def get_client(api_key: Optional[str] = None) -> "Mistral":
    """Create Mistral client."""
    if not HAS_MISTRAL:
        raise ImportError("mistralai not installed. Run: pip install mistralai")
    key = api_key or os.environ.get("MISTRAL_API_KEY", "").strip()
    if not key:
        raise ValueError("MISTRAL_API_KEY not set")
    return Mistral(api_key=key)


def ocr_pdf(
    client: "Mistral",
    pdf_path: Path,
    table_format: str = "html",
    extract_header: bool = False,
    extract_footer: bool = False,
    include_images: bool = False,
) -> dict:
    """OCR a local PDF file."""
    with open(pdf_path, "rb") as f:
        pdf_b64 = base64.b64encode(f.read()).decode("utf-8")

    kwargs = dict(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": f"data:application/pdf;base64,{pdf_b64}",
        },
        table_format=table_format,
        extract_header=extract_header,
        extract_footer=extract_footer,
    )
    if include_images:
        kwargs["include_image_base64"] = True

    return client.ocr.process(**kwargs)


def ocr_image(client: "Mistral", image_path: Path) -> dict:
    """OCR a local image file."""
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    mime = "image/png" if image_path.suffix.lower() == ".png" else "image/jpeg"

    return client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "image_url",
            "image_url": f"data:{mime};base64,{img_b64}",
        },
    )


def extract_markdown(response: dict) -> str:
    """Extract full markdown from OCR response."""
    parts = []
    for page in response.get("pages", []):
        md = page.get("markdown", "")
        if md:
            parts.append(f"<!-- page {page.get('index', 0) + 1} -->\n\n{md}")
    return "\n\n---\n\n".join(parts)


def extract_text(response: dict) -> str:
    """Extract plain text from OCR response."""
    import re

    md = extract_markdown(response)
    text = re.sub(r"#+\s*", "", md)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    text = re.sub(r"\[.*?\]\(.*?\)", r"\1", text)
    return text.strip()


def process_directory(
    client: "Mistral",
    input_dir: Path,
    output_dir: Path,
    resume: bool = True,
    sleep: float = 2.0,
    table_format: str = "html",
) -> dict:
    """Process all PDFs in a directory."""
    from zolai_toolkit.shared.utils import ensure_dir

    stats = {"total": 0, "success": 0, "failed": 0, "skipped": 0, "pages": 0, "chars": 0, "errors": []}
    ensure_dir(output_dir)

    pdfs = sorted(input_dir.rglob("*.pdf"))
    stats["total"] = len(pdfs)

    for pdf in pdfs:
        md_out = output_dir / f"{pdf.stem}.md"
        if resume and md_out.exists() and md_out.stat().st_size > 0:
            stats["skipped"] += 1
            continue

        try:
            response = ocr_pdf(client, pdf, table_format=table_format)
            md = extract_markdown(response)
            with open(md_out, "w", encoding="utf-8") as f:
                f.write(md)

            pages = len(response.get("pages", []))
            stats["success"] += 1
            stats["pages"] += pages
            stats["chars"] += len(md)

            if sleep > 0:
                time.sleep(sleep)
        except Exception as e:
            stats["failed"] += 1
            stats["errors"].append(f"{pdf.name}: {e}")

    return stats
