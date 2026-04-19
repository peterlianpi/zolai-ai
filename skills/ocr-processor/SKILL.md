# Skill: Zolai OCR

## Trigger
- "ocr pdf"
- "extract text from pdf"
- "scan document"

## Description
Extracts text from PDFs and scanned documents.

## Prerequisites
```bash
pip install pypdf2 pdfplumber pytesseract
# Or use Mistral OCR API
pip install mistralai
```

## Methods

### Method 1: pypdf2 (Simple)
```python
import pypdf2

reader = pypdf2.PdfReader("document.pdf")
text = "".join([page.extract_text() for page in reader.pages])
```

### Method 2: pdfplumber (Better)
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
```

### Method 3: Mistral OCR (Best for scanned)
```python
from mistralai import Mistral

client = Mistral(api_key="...")
result = client.ocr.process(
    document_url="https://...",
    parser_type="auto"
)
text = result.text
```

## PDF Processing Pipeline
```bash
# Step 1: Extract text
python scripts/extract_pdf.py --input refs/bible.pdf --output raw/bible.txt

# Step 2: Clean
python pipelines/clean.py -i raw/bible.txt -o clean/bible.jsonl

# Step 3: Add labels
# Label as: topic=religion, source=bible
```

## Tools
| Tool | Best For | Install |
|------|---------|---------|
| pypdf2 | Simple PDFs | `pip install pypdf2` |
| pdfplumber | Tables/Layouts | `pip install pdfplumber` |
| pytesseract | Scanned images | `pip install pytesseract` |
| mistral-ocr | Any document | `pip install mistralai` |

## Quality Tips
- Check extracted text for garbage
- Many PDFs have poor text extraction
- For scanned: use Mistral OCR
- Verify with human review

## Output
- JSONL format preferred
- Include source metadata
- Save to `raw/pdf/`

## Related Skills
- data-cleaner - Clean extracted text
- data-labeler - Label source
- web-crawler - Download PDFs