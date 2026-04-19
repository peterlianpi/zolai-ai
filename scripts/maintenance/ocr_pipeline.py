"""
Zo_Tdm OCR & PDF Pipeline — Unified Module
Consolidates: mistral_ocr_pdfs, ocr_zolai_lessons, pdf_to_md, check_pdf
"""
from __future__ import annotations

import subprocess
from pathlib import Path


def pdf_to_markdown(pdf_path: str, output_path: str) -> bool:
    """Convert a PDF to markdown using markitdown or pdftotext."""
    pdf = Path(pdf_path)
    if not pdf.exists():
        print(f"Error: {pdf} not found")
        return False
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", str(pdf), str(output_path)],
            capture_output=True, text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        print("pdftotext not found, trying Python fallback...")
        return _python_pdf_extract(pdf_path, output_path)


def _python_pdf_extract(pdf_path: str, output_path: str) -> bool:
    """Fallback PDF extraction using Python libraries."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n\n"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        return True
    except ImportError:
        print("PyMuPDF not available.")
        return False


def batch_ocr_pdfs(input_dir: str, output_dir: str, engine: str = "pdftotext") -> dict:
    """Batch convert all PDFs in a directory."""
    in_dir = Path(input_dir)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    stats = {"processed": 0, "failed": 0}
    for pdf in in_dir.glob("*.pdf"):
        out_file = out_dir / f"{pdf.stem}.md"
        if pdf_to_markdown(str(pdf), str(out_file)):
            stats["processed"] += 1
        else:
            stats["failed"] += 1
    return stats


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Zo_Tdm OCR/PDF Pipeline")
    p.add_argument("-i", "--input", required=True, help="Input PDF or directory")
    p.add_argument("-o", "--output", required=True, help="Output file or directory")
    p.add_argument("--batch", action="store_true", help="Batch process directory")
    args = p.parse_args()

    if args.batch:
        stats = batch_ocr_pdfs(args.input, args.output)
        print(f"Batch OCR: {stats}")
    else:
        ok = pdf_to_markdown(args.input, args.output)
        print(f"Conversion {'succeeded' if ok else 'failed'}.")
