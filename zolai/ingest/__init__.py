"""Ingest module — collect text, PDFs, and web pages into raw data."""

import logging
from pathlib import Path
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup

from ..config import config

logger = logging.getLogger(__name__)


def ingest_text_files(input_dir: Optional[Path] = None) -> List[Path]:
    """Collect plain text files from raw/text into intermediate/raw_text."""
    input_dir = input_dir or (config.paths.data_raw / "text")
    output_dir = config.paths.data / "intermediate" / "raw_text"
    output_dir.mkdir(parents=True, exist_ok=True)

    written: List[Path] = []
    if not input_dir.exists():
        logger.warning(f"Input directory not found: {input_dir}")
        return written

    for path in input_dir.rglob("*.txt"):
        target = output_dir / path.name
        target.write_text(path.read_text(encoding="utf-8", errors="ignore"), encoding="utf-8")
        written.append(target)

    logger.info(f"Ingested {len(written)} text files")
    return written


def ingest_pdfs(input_dir: Optional[Path] = None) -> Path:
    """Extract text from PDFs under raw/pdf into a combined text file."""
    input_dir = input_dir or (config.paths.data_raw / "pdf")
    output_dir = config.paths.data / "intermediate" / "pdf"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "pdf_corpus.txt"

    texts: List[str] = []
    if not input_dir.exists():
        logger.warning(f"PDF directory not found: {input_dir}")
        output_path.write_text("", encoding="utf-8")
        return output_path

    try:
        from pdfminer.high_level import extract_text as pdf_extract_text
    except ImportError:
        logger.error("pdfminer.six not installed — run: pip install pdfminer.six")
        output_path.write_text("", encoding="utf-8")
        return output_path

    for path in input_dir.rglob("*.pdf"):
        try:
            text = pdf_extract_text(str(path))
            texts.append(text)
        except Exception as e:
            logger.warning(f"Failed to extract {path.name}: {e}")
            continue

    output_path.write_text("\n\n".join(texts), encoding="utf-8")
    logger.info(f"Extracted {len(texts)} PDFs to {output_path}")
    return output_path


def _extract_visible_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


async def ingest_web_pages(urls: List[str], name: str = "web_crawl") -> Path:
    """Fetch and store web pages as plain text."""
    output_dir = config.paths.data / "intermediate" / "web"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{name}.txt"

    async with httpx.AsyncClient() as client:
        texts = []
        for url in urls:
            try:
                resp = await client.get(url, timeout=20)
                resp.raise_for_status()
                texts.append(_extract_visible_text(resp.text))
            except Exception as e:
                logger.warning(f"Failed to fetch {url}: {e}")

    output_path.write_text("\n\n".join(texts), encoding="utf-8")
    logger.info(f"Fetched {len(texts)} web pages to {output_path}")
    return output_path
