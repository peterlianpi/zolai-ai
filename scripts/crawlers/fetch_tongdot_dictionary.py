from __future__ import annotations

import argparse
import json
import re
import time
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE_SEARCH_URL = "https://www.tongdot.com/search/"
NO_RESULT_MARKER = "No word has been found in Tongdot.com Dictionary Database"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/123.0.0.0 Safari/537.36"
)


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", unescape(text)).strip()


class TongDotResultParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.results: list[dict[str, Any]] = []
        self._current: dict[str, Any] | None = None
        self._result_div_depth = 0
        self._inside_p = False
        self._current_p_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        classes = (attr_map.get("class") or "").split()

        if tag == "div" and "result" in classes:
            self._current = {"paragraphs": [], "audio_url": None}
            self._result_div_depth = 1
            self._inside_p = False
            self._current_p_parts = []
            return

        if self._current is None:
            return

        if tag == "div":
            self._result_div_depth += 1
        elif tag == "p":
            self._inside_p = True
            self._current_p_parts = []
        elif tag == "a" and not self._current.get("audio_url"):
            href = attr_map.get("href")
            if href:
                self._current["audio_url"] = href

    def handle_data(self, data: str) -> None:
        if self._current is not None and self._inside_p:
            self._current_p_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._current is None:
            return

        if tag == "p" and self._inside_p:
            text = normalize_space("".join(self._current_p_parts))
            if text:
                self._current["paragraphs"].append(text)
            self._inside_p = False
            self._current_p_parts = []
            return

        if tag == "div":
            self._result_div_depth -= 1
            if self._result_div_depth == 0:
                self.results.append(self._finalize_result(self._current))
                self._current = None

    @staticmethod
    def _finalize_result(raw: dict[str, Any]) -> dict[str, Any]:
        paragraphs = raw.get("paragraphs", [])
        headword = ""
        translation = ""
        language = ""

        if paragraphs:
            headword = re.sub(r":\s*$", "", paragraphs[0]).strip()
        if len(paragraphs) >= 2:
            translation = paragraphs[1]
        if len(paragraphs) >= 3:
            language = re.sub(r"^Language:\s*", "", paragraphs[2], flags=re.IGNORECASE).strip()

        return {
            "headword": headword,
            "translation": translation,
            "language": language,
            "audio_url": raw.get("audio_url"),
            "raw_paragraphs": paragraphs,
        }


def fetch_html(url: str, timeout: float, retries: int, retry_wait: float) -> str:
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        req = Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urlopen(req, timeout=timeout) as resp:
                charset = resp.headers.get_content_charset() or "utf-8"
                return resp.read().decode(charset, errors="replace")
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            if attempt >= retries:
                break
            time.sleep(retry_wait * (attempt + 1))
    raise RuntimeError(f"Fetch failed for {url}: {last_error}")


def parse_results(html_text: str) -> list[dict[str, Any]]:
    parser = TongDotResultParser()
    parser.feed(html_text)
    parser.close()
    results = []
    for result in parser.results:
        if result["headword"] or result["translation"] or result["language"]:
            results.append(result)
    return results


def lookup_word(word: str, timeout: float, retries: int, retry_wait: float) -> dict[str, Any]:
    source_url = BASE_SEARCH_URL + quote(word, safe="")
    html_text = fetch_html(source_url, timeout=timeout, retries=retries, retry_wait=retry_wait)

    if NO_RESULT_MARKER in html_text:
        return {
            "query": word,
            "source_url": source_url,
            "found": False,
            "result_count": 0,
            "results": [],
            "error": None,
        }

    results = parse_results(html_text)
    return {
        "query": word,
        "source_url": source_url,
        "found": bool(results),
        "result_count": len(results),
        "results": results,
        "error": None,
    }


def load_processed_queries(output_path: Path) -> set[str]:
    processed: set[str] = set()
    if not output_path.exists():
        return processed

    with output_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            query = str(obj.get("query", "")).strip()
            if query:
                processed.add(query)
    return processed


def iter_words(input_path: Path) -> list[str]:
    words: list[str] = []
    with input_path.open("r", encoding="utf-8-sig") as f:
        for raw in f:
            word = raw.strip()
            if not word or word.startswith("#"):
                continue
            words.append(word)
    return words


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fetch TongDot dictionary results for words in a text file."
    )
    parser.add_argument(
        "--input",
        default="data/tongdot_search_words.txt",
        help="Input text file with one search word per line (default: data/tongdot_search_words.txt)",
    )
    parser.add_argument(
        "--output",
        default="data/tongdot_dictionary.jsonl",
        help="Output JSONL path (default: data/tongdot_dictionary.jsonl)",
    )
    parser.add_argument(
        "--start",
        type=int,
        default=0,
        help="Start from this zero-based input index after filtering blank/comment lines",
    )
    parser.add_argument(
        "--max-queries",
        type=int,
        default=0,
        help="Maximum number of queries to run in this invocation (0 = no limit)",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=0.4,
        help="Delay between requests in seconds (default: 0.4)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=20.0,
        help="Per-request timeout in seconds (default: 20)",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=2,
        help="Retry count for transient request failures (default: 2)",
    )
    parser.add_argument(
        "--retry-wait",
        type=float,
        default=1.0,
        help="Base retry wait in seconds (default: 1.0)",
    )
    parser.add_argument(
        "--progress-every",
        type=int,
        default=25,
        help="Print progress every N processed queries (default: 25)",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Skip queries already present in the output JSONL",
    )
    parser.add_argument(
        "--keep-duplicates",
        action="store_true",
        help="Do not deduplicate duplicate input words inside this run",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    words = iter_words(input_path)
    processed_queries = load_processed_queries(output_path) if args.resume else set()
    seen_this_run: set[str] = set()

    written = 0
    found = 0
    missed = 0
    errors = 0
    attempted = 0
    started_at = time.time()

    mode = "a" if args.resume and output_path.exists() else "w"
    with output_path.open(mode, encoding="utf-8") as out:
        for idx, word in enumerate(words):
            if idx < args.start:
                continue
            if not args.keep_duplicates and word in seen_this_run:
                continue
            seen_this_run.add(word)
            if word in processed_queries:
                continue
            if args.max_queries and attempted >= args.max_queries:
                break

            attempted += 1
            try:
                record = lookup_word(
                    word,
                    timeout=args.timeout,
                    retries=args.retries,
                    retry_wait=args.retry_wait,
                )
                if record["found"]:
                    found += 1
                else:
                    missed += 1
            except Exception as exc:
                errors += 1
                record = {
                    "query": word,
                    "source_url": BASE_SEARCH_URL + quote(word, safe=""),
                    "found": False,
                    "result_count": 0,
                    "results": [],
                    "error": str(exc),
                }

            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            out.flush()
            written += 1

            if args.progress_every > 0 and attempted % args.progress_every == 0:
                elapsed = time.time() - started_at
                print(
                    f"processed={attempted} written={written} found={found} "
                    f"missed={missed} errors={errors} elapsed_sec={elapsed:.1f}",
                    flush=True,
                )

            if args.sleep > 0:
                time.sleep(args.sleep)

    elapsed = time.time() - started_at
    summary = {
        "input": str(input_path),
        "output": str(output_path),
        "attempted": attempted,
        "written": written,
        "found": found,
        "missed": missed,
        "errors": errors,
        "resume": bool(args.resume),
        "start": int(args.start),
        "max_queries": int(args.max_queries),
        "elapsed_sec": round(elapsed, 2),
    }

    summary_path = output_path.with_suffix(output_path.suffix + ".summary.json")
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
