"""Bible parallel data extraction — USX XML parsing and Zolai-English alignment."""
import json
import logging
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional
from xml.etree import ElementTree as ET

from ..shared.utils import KNOWLEDGE_DIR, save_json

logger = logging.getLogger(__name__)

# ── Book code mapping ─────────────────────────────────────────────────────────
BOOK_NAME_TO_CODE = {
    "Piancilna": "GEN", "Paikhiatna": "EXO", "Siampi Laibu": "LEV",
    "Gamlak-vakna": "NUM", "Thu-Hilhkikna": "DEU", "Joshua": "JOS",
    "Thukhente": "JDG", "Ruth": "RUT", "Samuel Masa": "1SA",
    "Samuel Nihna": "2SA", "Kumpi Masa": "1KI", "Kumpi Nihna": "2KI",
    "Khang-tangthu Masa": "1CH", "Khang-tangthu Nihna": "2CH",
    "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB",
    "Late": "PSA", "Paunak": "PRO", "Thuhilh-sia": "ECC",
    "Solomon la": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
    "Kah la": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
    "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
    "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
    "Zefaniah": "ZEP", "Haggai": "HAG", "Zekhariah": "ZEC",
    "Malakhi": "MAL", "Mattiu": "MAT", "Marka": "MRK", "Luka": "LUK",
    "Johan": "JHN", "Sawltak": "ACT", "Rom": "ROM",
    "Korin Masa": "1CO", "Korin Nihna": "2CO", "Galati": "GAL",
    "Efesa": "EPH", "Filippi": "PHP", "Kolose": "COL",
    "Thesalon Masa": "1TH", "Thesalon Nihna": "2TH",
    "Timoti Masa": "1TI", "Timoti Nihna": "2TI", "Titu": "TIT",
    "Filemon": "PHM", "Hebru": "HEB", "Jeim": "JAS",
    "Piter Masa": "1PE", "Piter Nihna": "2PE",
    "Johan Masa": "1JN", "Johan Nihna": "2JN", "Johan Thumna": "3JN",
    "Juda": "JUD", "Maangmuhna": "REV",
}

ZSV_BOOK_MAP = {
    "MATTHEW": "MAT", "MARK": "MRK", "LUKE": "LUK", "JOHN": "JHN",
    "NASEPTE": "ACT", "ROME-TE": "ROM", "1_CORINTH-TE": "1CO",
    "2_CORINTH-TE": "2CO", "GALATIA-TE": "GAL", "EPHESA-TE": "EPH",
    "PHILIPPI-TE": "PHP", "COLOSSE-TE": "COL", "1_THESALONICA-TE": "1TH",
    "2_THESALONICA-TE": "2TH", "1_TIMOTHY": "1TI", "2_TIMOTHY": "2TI",
    "TITUS": "TIT", "PHILEMON": "PHM", "HEBREW": "HEB", "JAMES": "JAS",
    "1_PETER": "1PE", "2_PETER": "2PE", "1_JOHN": "1JN", "2_JOHN": "2JN",
    "3_JOHN": "3JN", "JUDE": "JUD", "KILAAKNA": "REV",
}


def _clean_text(text: str) -> str:
    """Clean XML text content."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    return text


def _tokenize_zolai(text: str) -> List[str]:
    """Tokenize Zolai text into words."""
    return re.findall(r"[a-z][a-z'\-]*[a-z]|[a-z]", text.lower())


# ══════════════════════════════════════════════════════════════════════════════
# BibleExtractor — extract parallel data from Tedim Bible sources
# ══════════════════════════════════════════════════════════════════════════════

class BibleExtractor:
    """
    Extract bilingual verse pairs and vocabulary from Tedim Bible XML + English Bible XML.

    Supports:
      - USX XML parsing (Tedim Bible 2010, TDB77)
      - CES English XML (KJV)
      - Zokam Standard Version (ZSV) HTML
      - Creating Zolai-English parallel verse pairs
      - Vocabulary extraction with frequency analysis

    Usage:
        extractor = BibleExtractor()
        stats = extractor.extract_all("/path/to/bibles")
        extractor.export_parallel()
    """

    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or KNOWLEDGE_DIR / "bible"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.verses: Dict[str, Dict[str, str]] = {}  # ref → {zolai, english, source}
        self.vocab: Counter = Counter()
        self.word_index: Dict[str, Dict] = {}

    def parse_tedim_xml(self, xml_path: str) -> Dict[str, str]:
        """
        Parse Tedim Bible XML format → {ref: text}.

        Args:
            xml_path: Path to tedim.xml.

        Returns:
            Dict mapping verse references (e.g. "GEN.1.1") to text.
        """
        if not os.path.exists(xml_path):
            logger.warning(f"Tedim XML not found: {xml_path}")
            return {}

        logger.info(f"Parsing Tedim XML: {xml_path}")
        tree = ET.parse(xml_path)
        root = tree.getroot()
        verses = {}

        for book_el in root.findall('book'):
            book_name = book_el.get('name', '')
            book_code = BOOK_NAME_TO_CODE.get(book_name, book_name.upper()[:3])
            for chapter_el in book_el.findall('chapter'):
                ch_num = chapter_el.get('number', '0')
                for verse_el in chapter_el.findall('verse'):
                    v_num = verse_el.get('number', '')
                    text = _clean_text(''.join(verse_el.itertext()))
                    if text:
                        ref = f"{book_code}.{ch_num}.{v_num}"
                        verses[ref] = text

        logger.info(f"  Parsed {len(verses)} verses from Tedim XML")
        return verses

    def parse_usx_directory(self, usx_dir: str) -> Dict[str, str]:
        """
        Parse TDB77 USX files → {ref: text}.

        Args:
            usx_dir: Directory containing .usx files.

        Returns:
            Dict mapping verse references to text.
        """
        if not os.path.isdir(usx_dir):
            logger.warning(f"USX directory not found: {usx_dir}")
            return {}

        logger.info(f"Parsing USX files from: {usx_dir}")
        verses = {}

        for fname in sorted(os.listdir(usx_dir)):
            if not fname.endswith('.usx'):
                continue
            book_code = fname.replace('.usx', '')
            fpath = os.path.join(usx_dir, fname)
            try:
                tree = ET.parse(fpath)
                root = tree.getroot()
            except ET.ParseError as e:
                logger.warning(f"Failed to parse {fname}: {e}")
                continue

            ch_num = "0"
            for el in root.iter():
                if el.tag == 'chapter':
                    ch_num = el.get('number', '0')
                elif el.tag == 'verse':
                    v_num = el.get('number', '')
                    if v_num:
                        text = _clean_text(el.tail or '')
                        if text:
                            ref = f"{book_code}.{ch_num}.{v_num}"
                            verses[ref] = text

        logger.info(f"  Parsed {len(verses)} verses from USX files")
        return verses

    def parse_english_xml(self, xml_path: str) -> Dict[str, str]:
        """
        Parse CES English XML (KJV) → {ref: text}.

        Args:
            xml_path: Path to English.xml.

        Returns:
            Dict mapping verse references to English text.
        """
        if not os.path.exists(xml_path):
            logger.warning(f"English XML not found: {xml_path}")
            return {}

        logger.info(f"Parsing English XML: {xml_path}")
        tree = ET.parse(xml_path)
        root = tree.getroot()
        verses = {}

        body = root.find('.//body')
        if body is None:
            logger.warning("Could not find <body> in English XML")
            return verses

        for book_div in body.findall('div'):
            book_id = book_div.get('id', '')
            book_code = book_id.replace('b.', '') if book_id.startswith('b.') else book_id
            for ch_div in book_div.findall('div'):
                for seg in ch_div.findall('seg'):
                    seg_id = seg.get('id', '')
                    text = _clean_text(seg.text or '')
                    if text and seg_id:
                        parts = seg_id.split('.')
                        if len(parts) >= 4:
                            ref = f"{parts[1]}.{parts[2]}.{parts[3]}"
                            verses[ref] = text

        logger.info(f"  Parsed {len(verses)} verses from English XML")
        return verses

    def extract_all(self, bibles_dir: str) -> Dict[str, Any]:
        """
        Extract all Bible data from available sources.

        Args:
            bibles_dir: Directory containing Bible source files.

        Returns:
            Stats dict.
        """
        # Tedim 2010 XML
        tedim_xml = os.path.join(bibles_dir, "Tedim (Zolai).xml")
        if not os.path.exists(tedim_xml):
            tedim_xml = os.path.join(bibles_dir, "tedim.xml")
        tedim_verses = self.parse_tedim_xml(tedim_xml)

        # TDB77 USX
        tdb77_dir = os.path.join(bibles_dir, "tb77", "USX_1")
        if not os.path.isdir(tdb77_dir):
            tdb77_dir = os.path.join(bibles_dir, "tdb", "USX_1")
        tdb77_verses = self.parse_usx_directory(tdb77_dir)

        # English KJV
        english_xml = os.path.join(bibles_dir, "English.xml")
        english_verses = self.parse_english_xml(english_xml)

        # Merge: Tedim 2010 primary, TDB77 secondary
        all_zolai = {}
        for ref, text in tedim_verses.items():
            all_zolai[ref] = {"text": text, "source": "tedim_2010"}
        for ref, text in tdb77_verses.items():
            if ref not in all_zolai:
                all_zolai[ref] = {"text": text, "source": "tdb77"}

        # Build aligned pairs
        aligned_count = 0
        for ref in sorted(all_zolai.keys()):
            zo_data = all_zolai[ref]
            en_text = english_verses.get(ref, "")
            self.verses[ref] = {
                "zolai": zo_data["text"],
                "english": en_text,
                "source": zo_data["source"],
            }
            if en_text:
                aligned_count += 1

        # Build vocabulary
        for ref, zo_data in all_zolai.items():
            tokens = _tokenize_zolai(zo_data["text"])
            for token in tokens:
                self.vocab[token] += 1

        # Build word index
        for word, freq in self.vocab.most_common():
            self.word_index[word] = {"freq": freq}

        stats = {
            "zolai_verses": len(all_zolai),
            "english_verses": len(english_verses),
            "aligned_pairs": aligned_count,
            "unique_words": len(self.vocab),
            "total_tokens": sum(self.vocab.values()),
        }
        logger.info(f"Bible extraction complete: {stats}")
        return stats

    def create_parallel(self) -> List[Dict[str, str]]:
        """
        Create Zolai-English parallel verse pairs.

        Returns:
            List of {ref, zolai, english} dicts for aligned verses.
        """
        pairs = []
        for ref, data in sorted(self.verses.items()):
            if data.get("english"):
                pairs.append({
                    "ref": ref,
                    "zolai": data["zolai"],
                    "english": data["english"],
                    "source": data.get("source", ""),
                })
        return pairs

    def export_parallel(self, output_path: Optional[Path] = None) -> Path:
        """
        Export parallel pairs to JSONL.

        Args:
            output_path: Output file path.

        Returns:
            Path to exported file.
        """
        output_path = output_path or self.output_dir / "parallel_verses.jsonl"
        pairs = self.create_parallel()
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            for pair in pairs:
                f.write(json.dumps(pair, ensure_ascii=False) + '\n')

        logger.info(f"Exported {len(pairs)} parallel pairs to {output_path}")
        return output_path

    def export_vocab(self, output_path: Optional[Path] = None) -> Path:
        """Export vocabulary with frequency data."""
        output_path = output_path or self.output_dir / "bible_vocab.json"
        vocab_data = {
            "_meta": {
                "total_verses": len(self.verses),
                "unique_words": len(self.vocab),
                "total_tokens": sum(self.vocab.values()),
            },
            "word_list": sorted(self.word_index.keys()),
            "word_index": self.word_index,
        }
        save_json(vocab_data, output_path)
        return output_path

    def get_stats(self) -> Dict[str, Any]:
        """Get extraction statistics."""
        return {
            "total_verses": len(self.verses),
            "aligned_pairs": len(self.create_parallel()),
            "unique_words": len(self.vocab),
            "total_tokens": sum(self.vocab.values()),
            "top_words": self.vocab.most_common(20),
        }
